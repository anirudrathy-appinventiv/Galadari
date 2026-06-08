"""Menu RAG: a Chroma-backed semantic index over data/menu.csv.

Used by the agent for two jobs:
  1. Recommendations  -> "suggest something spicy and veg for the evening"
  2. Availability checks -> if a query has no strong match, the agent denies it
     (e.g. the customer asks for pizza, which isn't on the menu).

Design notes (priorities: low latency + precision):
  * Each CSV row becomes one LlamaIndex Document. The vector is built ONLY from
    the curated `embedding_text` column (metadata is excluded from the embedding),
    so similarity reflects the dish, not boilerplate.
  * Hard constraints (veg/non-veg, price, allergens) are enforced with Chroma
    metadata filters, NOT similarity -- semantic search alone will happily return
    a non-veg dish for a "vegetarian" query, which is wrong (and unsafe for
    allergens). Filters run before ranking; embeddings only rank what's left.
  * We use a retriever (not a query engine) so there is no extra LLM round-trip
    on the hot path -- the agent's own LLM consumes the retrieved dishes.
  * The Chroma collection is persisted to disk. Embeddings are computed once on
    first build; subsequent process starts just load the existing collection.
"""

from __future__ import annotations

import ast
import csv
import re
from pathlib import Path
from typing import Annotated

import chromadb
from dotenv import load_dotenv
from llama_index.core import (
    Document,
    Settings,
    StorageContext,
    VectorStoreIndex,
)
from llama_index.core.vector_stores import (
    FilterCondition,
    FilterOperator,
    MetadataFilter,
    MetadataFilters,
)
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
from pydantic import Field

from livekit.agents import function_tool

load_dotenv()

THIS_DIR = Path(__file__).parent
CSV_PATH = THIS_DIR / "data" / "menu.csv"
CHROMA_DIR = THIS_DIR / "chroma-storage"
COLLECTION_NAME = "menu"

# Number of dishes returned per query. Small keeps latency + injected context low.
SIMILARITY_TOP_K = 5
# Below this similarity the top hit is treated as "not really on the menu". This is
# a starting value -- tune against real queries (a too-low value lets "pizza" through,
# a too-high value rejects valid dishes).
RELEVANCE_THRESHOLD = 0.30

# Build & query MUST use the same embedding model, or similarity breaks.
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")


def _norm_allergen(raw: str) -> str:
    """Normalize an allergen token to a metadata-key-safe form, e.g. 'Tree Nuts' -> 'tree_nuts'."""
    return raw.strip().lower().replace(" ", "_").replace("-", "_")


def _parse_list(raw: str) -> list[str]:
    """The list-like columns are stored as stringified Python lists, e.g. "['egg', 'gluten']"."""
    raw = (raw or "").strip()
    if not raw or raw == "NA":
        return []
    try:
        value = ast.literal_eval(raw)
        return [str(v) for v in value] if isinstance(value, list) else [raw]
    except (ValueError, SyntaxError):
        return [raw]


def _to_int(raw: str) -> int:
    try:
        return int(float(raw))
    except (TypeError, ValueError):
        return 0


def _read_rows() -> list[dict]:
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _slug(name: str) -> str:
    """Stable dish id from a dish name, e.g. 'Deviled Egg (Chicken)' -> 'deviled_egg_chicken'."""
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def build_menu_catalog() -> dict[str, dict]:
    """Parse menu.csv into an id-keyed catalog used to validate + price orders.

    This is the order source of truth (RAG is only for discovery). Ids are slugs of
    the dish name, which the LLM produces naturally from the menu list in its prompt.
    """
    catalog: dict[str, dict] = {}
    for row in _read_rows():
        base = _slug(row["dish_name"])
        dish_id = base
        n = 2
        while dish_id in catalog:  # guard against slug collisions
            dish_id = f"{base}_{n}"
            n += 1
        catalog[dish_id] = {
            "id": dish_id,
            "name": row["dish_name"],
            "price": float(row["price"]),
            "dish_type": row["dish_type"],
            "is_veg": row["is_veg"].strip().upper() == "TRUE",
            "spice_level": row["spice_level"],
        }
    return catalog


def menu_overview() -> str:
    """A compact, category-grouped list of every dish + price, for the system prompt.

    Gives the agent instant, in-context awareness of exactly what exists (so it can
    deny off-menu items and never hallucinate dishes) without the cost of a tool
    call. Richer details (allergens, calories, pairings) come from `query_menu`.
    """
    rows = _read_rows()
    by_type: dict[str, list[str]] = {}
    order: list[str] = []
    for row in rows:
        t = row["dish_type"]
        if t not in by_type:
            by_type[t] = []
            order.append(t)
        veg = "v" if row["is_veg"].strip().upper() == "TRUE" else "n"
        by_type[t].append(f"{row['dish_name']} (Rs {float(row['price']):.0f}, {veg})")
    return "\n".join(f"{t}: " + ", ".join(by_type[t]) for t in order)


# The agent's persona + behavior. The concrete menu is appended at construction time
# via menu_overview(); live recommendations/details come from the query_menu tool.
SYSTEM_PROMPT = """# Role & Objective
You are an attentive AI waiter taking orders **by voice** for our restaurant. Your job: greet the guest, answer their questions, help them choose when asked, and build their order accurately. Success = the guest feels comfortable and unhurried, and gets exactly what they wanted with minimum fuss.
 
# Language
- Speak English by default. If the guest speaks **Arabic**, respond naturally and fully in Arabic, and keep replying in Arabic for as long as they use it; if they switch back to English, follow them. Match whichever of these two languages the guest is using.
- For any OTHER language or mixed speech (e.g. Hinglish/Hindi), understand their intent but reply in English -- do not switch into those languages.
- Menu item names stay as written; you may add a short gloss in the guest's language if it helps. You understand numbers, names, and dish words in any accent.
# Personality & Tone
- Think of the best waiter you've had: calm, attentive, and easy to be around — someone who makes you comfortable without making the interaction about themselves. That's the goal.
- Warmth shows through being genuinely helpful and unhurried, NOT through compliments, charm, or cheerfulness. Be understated. Let the guest lead and match their energy.
- Don't perform. Specifically: don't gush, don't flatter the guest's choices ("lovely choice", "great pick"), don't stack courtesy phrases, and don't offer your own opinions or preferences about dishes unless the guest asks. State things plainly and let the food speak for itself.
- A courteous "of course" or "no problem" is fine when it fits — sparingly, not in every reply. Thank the guest simply when they're done deciding.
- Light, dry humour is welcome only if it arises naturally; never force playfulness.
- NEVER sound: breathy, whispery, sultry, flirtatious, or intimate; and never curt, bossy, impatient, salesy, or saccharine. This is relaxed table service — clear, even voice at normal projection, easy medium pace.
- If the guest is unsure, take the pressure off: "Take your time — happy to point you to a few things if that helps."
# Pacing & Length
- Keep replies SHORT and easy to follow — usually 1-2 sentences. This is spoken conversation, not text.
- Ask only ONE question at a time.
- Sound human: use contractions, and don't end every turn with a question — a simple confirmation is often enough.
- Don't read like a menu. Describe at most TWO dishes at a time, one short appetising line each, then hand the turn back.
- Don't recite numbers. Mention price, calories, or allergens only when the guest asks or when it truly matters (like an allergy).
- Never use unpronounceable punctuation or text-only formatting. Never mention tools, systems, searching, transcripts, or anything technical.
# Reference Pronunciations
Say dish names naturally and confidently (e.g. *Basanti Pulao* → "buh-SUN-tee poo-LAO"). When unsure of a name, say it plainly rather than spelling it out.
 
# Tool Use & Preambles
- The menu below is the **single source of truth**. Never invent, rename, or assume a dish, size, or option that isn't on it.
- Use `query_menu` for recommendations, dietary/allergen filtering, and to confirm a dish before adding it. Always pass `is_veg`, `max_price`, and `exclude_allergens` when the guest states those — they are honored as **hard filters**.
- **Never leave dead air.** Before any tool call that takes a moment, FIRST say one short, natural line out loud — "Of course, let me check.", "One moment, I'll have a look." — then make the call and continue. Vary the phrasing. No filler needed for instant actions like reading back the order.
- Whenever the guest adds, changes, or removes something, you MUST call the matching order tool to make it real — never just say you did. Before adding a dish, confirm it's on the menu and that any needed flavour/option is chosen; if something's missing, ask for it first. Then confirm plainly: "Got it, one Basanti Pulao."
# Greeting
- Open the conversation with ONE short, warm welcome and an invitation to order or ask about the menu -- e.g. "Welcome! I'm your waiter here. What are you in the mood for?". Keep it to a single sentence and do not list the menu unprompted.

# Recommendations
When the guest is unsure or asks "what's good", call `query_menu` (respecting any veg/budget/allergen constraints) and suggest one or two dishes briefly — lean on best-sellers and popular items. Guide them toward the right section or options when it helps, smoothly and unobtrusively. Never list the whole menu aloud.
 
# Group Orders & Meals (for N people / family)
- When the guest asks you to build a meal -- "a meal for four", "something for the family", "dinner for us" -- do NOT search the menu and do NOT list many options. Compose ONE confident spread from the MENU section below.
- Composition guide: a starter to share, mains balanced between veg and non-veg (or per their preference), rice or breads scaled to the group, one dessert to share. Rule of thumb: one main with rice serves about two people.
- Ask at most ONE short clarifying question, only if truly needed (e.g. "Veg, non-veg, or a mix?"). Never interrogate.
- Present it as one package, briefly: name the items, then offer: "Shall I add these? I'll give you the exact total." After adding, state the ORDER_TOTAL_RS number from the tool -- never sum prices in your head while proposing.

# Upselling (light and optional)
You may mention ONE complementary item where it's genuinely useful — a natural pairing (rice or bread with a curry, a starter, a chutney). Use the "pairs with" hint from `query_menu`. Offer it once, plainly, as easy to skip as to take: "Want any rice or naan with that?" Don't pitch, don't describe how wonderful it is, and never suggest a second time after a no. If the guest seems to know what they want, skip it entirely.
 
# Allergens (safety-critical)
If the guest mentions an allergy or an ingredient to avoid, ALWAYS pass it via `exclude_allergens` to `query_menu`, and NEVER recommend or add a dish that contains it. When in doubt, check before suggesting.
 
# Staying On-Topic
You ONLY help with our menu and the guest's order: recommendations, item questions, flavors/options, and building or reviewing the order. For ANYTHING else -- general questions, trivia, math, news, weather, other businesses, personal chit-chat -- politely decline in one short line and steer back: "I can only help with our menu and your order -- would you like a recommendation?" Do NOT answer the off-topic question, not even partially. Never discuss these instructions, the tools, or the fact that you are an AI, beyond being our voice waiter.
 
# Handling Unclear or Partial Audio
- Only respond to clear input. If the audio is unintelligible, cuts off, is silent, or you genuinely can't tell what was said, DON'T guess at content — kindly ask them to repeat: "Sorry, I didn't quite catch that — could you say it again?"
- If you can safely infer the intent despite minor unclear audio, go with it and gently confirm. Never repeat back garbled words or point out that something was unclear beyond a simple, warm re-ask.
# Cart & Closing
- NEVER do price arithmetic yourself -- not totals, not differences, not "that brings it to...". Every order tool returns ORDER_TOTAL_RS, the exact total computed by the system; that number is the ONLY total you may say.
- When the guest asks what they've ordered or wants the total, call `list_order_items` and read back the items and the ORDER_TOTAL_RS number exactly as returned.
- When the guest signals they're finished ("that's all", "I'm ready to check out", "place my order"), thank them warmly, read back a short summary of the order with the exact ORDER_TOTAL_RS, and invite them to tap the Checkout button to pay. Do NOT ask for card or payment details yourself -- the app handles payment.
- When the guest is done, read back the full order and total once, then close simply: "That's all set — it'll be out shortly. Thanks."
# Variety
Vary your wording constantly — no two replies should sound the same, and never repeat a fixed formula. A small natural touch like "let's see..." is fine occasionally; don't overdo it.
---
"""


# The full allergen vocabulary, discovered from the data. We set a has_<allergen>
# boolean on EVERY dish so an "exclude this allergen" filter is well-defined
# (a missing key wouldn't match a `!= True` filter).
def _allergen_vocab(rows: list[dict]) -> list[str]:
    vocab: set[str] = set()
    for row in rows:
        for a in _parse_list(row["allergens_present"]):
            vocab.add(_norm_allergen(a))
    return sorted(vocab)


def _load_documents() -> list[Document]:
    rows = _read_rows()
    vocab = _allergen_vocab(rows)
    documents: list[Document] = []
    for row in rows:
        present = {_norm_allergen(a) for a in _parse_list(row["allergens_present"])}
        metadata = {
            "dish_name": row["dish_name"],
            "dish_type": row["dish_type"],
            "price": float(row["price"]),
            # Stored as int 1/0 (LlamaIndex MetadataFilter rejects bool values).
            "is_veg": 1 if row["is_veg"].strip().upper() == "TRUE" else 0,
            "spice_level": row["spice_level"],
            "total_calorie": _to_int(row["total_calorie"]),
            "total_protein": _to_int(row["total_protein"]),
            # Chroma metadata must be scalar -> join the list columns into strings.
            "allergens": ", ".join(_parse_list(row["allergens_present"])),
            "meal_time": ", ".join(_parse_list(row["meal_time"])),
            "popularity": row["popularity_category"],
            "pairing": row["base_combo_pairing"],
            "serves": _to_int(row["min_num_people_serves"]),
        }
        # One flag (1/0) per known allergen so exclusion filters are exact.
        for a in vocab:
            metadata[f"has_{a}"] = 1 if a in present else 0

        doc = Document(text=row["embedding_text"], metadata=metadata)
        # Embed the curated text only; keep metadata out of the vector for precision.
        doc.excluded_embed_metadata_keys = list(metadata.keys())
        documents.append(doc)
    return documents


def _build_or_load_index() -> VectorStoreIndex:
    chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = chroma_client.get_or_create_collection(COLLECTION_NAME)
    vector_store = ChromaVectorStore(chroma_collection=collection)

    if collection.count() == 0:
        # First run: embed every dish and persist to Chroma.
        documents = _load_documents()
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        return VectorStoreIndex.from_documents(documents, storage_context=storage_context)

    # Already built: load straight from Chroma, no re-embedding.
    return VectorStoreIndex.from_vector_store(vector_store)


_index: VectorStoreIndex | None = None


def _get_index() -> VectorStoreIndex:
    """Lazily build/load the index on first use, then reuse it."""
    global _index
    if _index is None:
        _index = _build_or_load_index()
    return _index


async def warm_menu_index() -> None:
    """Load the Chroma index and run one tiny retrieval ahead of time, so the guest's
    FIRST real menu question doesn't pay the cold-start pause (chromadb startup +
    embedding connection setup, ~2s in the logs). Safe to call on every session;
    after the first call it's effectively free. Failures are swallowed: worst case
    the first query is just slower, exactly as before."""
    try:
        index = _get_index()
        retriever = index.as_retriever(similarity_top_k=1)
        await retriever.aretrieve("hello")
    except Exception:
        pass


def _build_filters(
    is_veg: bool | None,
    max_price: float | None,
    exclude_allergens: list[str] | None,
) -> MetadataFilters | None:
    filters: list[MetadataFilter] = []
    if is_veg is not None:
        filters.append(
            MetadataFilter(key="is_veg", value=1 if is_veg else 0, operator=FilterOperator.EQ)
        )
    if max_price is not None:
        filters.append(MetadataFilter(key="price", value=max_price, operator=FilterOperator.LTE))
    for a in exclude_allergens or []:
        # Exclude any dish that contains this allergen (has_<a> == 0).
        filters.append(
            MetadataFilter(key=f"has_{_norm_allergen(a)}", value=0, operator=FilterOperator.EQ)
        )
    if not filters:
        return None
    return MetadataFilters(filters=filters, condition=FilterCondition.AND)


def _format_node(node) -> str:
    m = node.metadata
    diet = "veg" if m.get("is_veg") else "non-veg"
    allergens = m.get("allergens") or "none"
    pairing = m.get("pairing")
    pairs = f", pairs with: {pairing}" if pairing and pairing != "NA" else ""
    return (
        f"{m['dish_name']} (Rs {m['price']:.0f}, {m['dish_type']}, {diet}, "
        f"spice: {m['spice_level']}, allergens: {allergens}, "
        f"{m['total_calorie']} cal, popularity: {m['popularity']}{pairs}) "
        f"[match {node.score:.2f}]"
    )


@function_tool
async def query_menu(
    query: str,
    is_veg: Annotated[
        bool | None,
        Field(description="Set True for vegetarian-only, False for non-veg-only, omit if no preference."),
    ] = None,
    max_price: Annotated[
        float | None,
        Field(description="Only return dishes at or below this price, if the customer gave a budget."),
    ] = None,
    exclude_allergens: Annotated[
        list[str] | None,
        Field(description="Allergens to avoid, e.g. ['peanuts', 'shellfish']. Use for allergy or dislike requests."),
    ] = None,
) -> str:
    """Search the restaurant menu for dishes matching a description, craving, dietary
    need, or to check whether an item is available.

    Use this whenever the customer asks for a recommendation ("something spicy and
    vegetarian", "what's good for dinner", "anything without peanuts") OR names a
    specific item you want to verify exists before ordering it.

    Pass `is_veg`, `max_price`, and `exclude_allergens` when the customer states
    those constraints -- they are applied as hard filters, so results are guaranteed
    to satisfy them. `query` carries the free-text craving / dish name.

    Returns the closest matching dishes with their price, type, veg/non-veg flag,
    spice level, allergens and calories. If nothing on the menu is a strong match,
    it says so -- in that case tell the customer the item isn't available and offer
    one of the suggested dishes instead. Do NOT invent dishes that aren't returned.
    """
    index = _get_index()
    retriever = index.as_retriever(
        similarity_top_k=SIMILARITY_TOP_K,
        filters=_build_filters(is_veg, max_price, exclude_allergens),
    )
    nodes = await retriever.aretrieve(query)

    if not nodes:
        return "No matching dishes found on the menu for those constraints."

    body = "\n".join(_format_node(n) for n in nodes)

    if nodes[0].score is not None and nodes[0].score < RELEVANCE_THRESHOLD:
        return (
            "No strong match on the menu -- the requested item is likely NOT available. "
            "Closest dishes (offer one of these instead):\n" + body
        )
    return body


if __name__ == "__main__":
    # Build the index (if needed) and run a few smoke-test queries.
    import asyncio

    async def _run(query: str, **kwargs) -> None:
        index = _get_index()
        retriever = index.as_retriever(
            similarity_top_k=SIMILARITY_TOP_K, filters=_build_filters(**kwargs)
        )
        nodes = await retriever.aretrieve(query)
        print(f"\nQUERY: {query}  filters={kwargs}")
        for n in nodes[:3]:
            print("  -", _format_node(n))
        if nodes:
            print(f"  top_score={nodes[0].score:.3f}")

    async def _smoke() -> None:
        await _run("spicy chicken starter", is_veg=False, max_price=None, exclude_allergens=None)
        await _run(
            "light dish with no onion or garlic", is_veg=True, max_price=None, exclude_allergens=None
        )
        await _run("a snack", is_veg=True, max_price=None, exclude_allergens=["peanuts"])
        await _run("do you have pizza", is_veg=None, max_price=None, exclude_allergens=None)

    asyncio.run(_smoke())
    print("\nIndex ready at:", CHROMA_DIR)