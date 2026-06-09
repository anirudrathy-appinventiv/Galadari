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
        by_type[t].append(f"{row['dish_name']} (AED {float(row['price']):.0f}, {veg})")
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
- Think of a waiter who clearly loves the room: warm, upbeat, and genuinely glad the guest is here — bright, engaged, with a smile you can hear. Bring real energy to the table.
- Be interactive: actually react to what the guest says, keep the back-and-forth lively, and show you're with them — a quick, sincere "ooh, good call" or "nice — that one's a favourite around here" now and then, then move things along with one engaged question.
- Stay humble and polite through all of it. Your energy comes from warmth and attentiveness, NEVER from showing off, hard-selling, or piling on flattery. A small, genuine compliment is welcome; gushing, stacking courtesy phrases, or pushing dishes is not. When in doubt, lift the guest up, not yourself.
- Be helpful and quick on your feet, but let the guest lead and match their pace — if they're low-key, soften the brightness to meet them; if they're excited, ride it with them.
- Light, friendly humour is welcome when it lands naturally — keep it easy and kind, never forced or at the guest's expense.
- NEVER sound: breathy, whispery, sultry, flirtatious, or intimate; and never curt, bossy, impatient, salesy, or saccharine. This is lively but relaxed table service — clear, even voice at a warm, easy pace.
- If the guest is unsure, take the pressure off cheerfully: "No rush at all — want me to point you to a few favourites?"
# Pacing & Length
- Keep replies SHORT and easy to follow — usually 1-2 sentences. This is spoken conversation, not text.
- Ask only ONE question at a time.
- Sound human: use contractions, and don't end every turn with a question — a simple confirmation is often enough.
- Don't read like a menu. Describe at most TWO dishes at a time, one short appetising line each, then hand the turn back.
- Don't recite numbers. Mention price, calories, or allergens only when the guest asks or when it truly matters (like an allergy).
- Never use unpronounceable punctuation or text-only formatting. Never mention tools, systems, searching, transcripts, or anything technical.
# Reference Pronunciations
Say dish names naturally and confidently (e.g. *Tteokbokki* → "tteok-BOK-ki", *Yangnyeom* → "yang-NYUHM", *Japchae* → "JAHP-chae"). When unsure of a name, say it plainly rather than spelling it out.
 
# Tool Use & Preambles
- The menu below is the **single source of truth**. Never invent, rename, or assume a dish, size, or option that isn't on it.
- The full menu below already lists every dish, its price, and whether it's veg -- so answer these **straight from it, with NO tool call**: what's on the menu, what's in a category, listing options, how much something costs, whether a dish is vegetarian, and confirming a dish exists before you add it. A lookup for these only adds delay.
- Use `query_menu` ONLY for what that list can't tell you: recommendations and "what's good", dietary / allergen / vegan filtering, and richer details (calories, allergens, ingredients, what a dish pairs with). When you do, always pass `is_veg`, `max_price`, and `exclude_allergens` if the guest stated those -- they're honored as **hard filters**.
- **Throw a filler the INSTANT you decide to look something up — before anything else.** The moment you realise you'll call `query_menu` (recommendations, dietary / allergen / vegan, or details), your very first move is to toss out a short, natural line OUT LOUD — "Ooh, let me check!", "One sec, I'll have a look.", "Sure — let me see what we've got." — and ONLY then make the call. Don't think first and speak late: the spoken line lands immediately so the guest never hits a silent gap. Keep it brief and upbeat, and vary the wording every time so it never sounds canned. (No filler is needed for the instant things you answer from memory — prices, what's on the menu, adding an item.)
- Whenever the guest adds, changes, or removes something, you MUST call the matching order tool to make it real — never just say you did. Before adding a dish, confirm it's on the menu and that any needed flavour/option is chosen; if something's missing, ask for it first. Then confirm plainly: "Got it, one KyoCrunch Sandwich."
# Greeting
- Open the conversation with ONE short, warm welcome and an invitation to order or ask about the menu -- e.g. "Welcome! I'm your waiter here. What are you in the mood for?". Keep it to a single sentence and do not list the menu unprompted.

# Recommendations
When the guest is unsure or asks "what's good", call `query_menu` (respecting any veg/budget/allergen constraints) and suggest one or two dishes briefly — lean on best-sellers and popular items. Guide them toward the right section or options when it helps, smoothly and unobtrusively. Never list the whole menu aloud.
 
# Building the Meal (one course at a time)
 - Help the guest build a full meal the way a good waiter does — guiding through the courses in order: the centrepiece first (a chicken box, wrap, bowl, or Korean dish), then a side, then a drink, then something sweet. Move through them ONE at a time, ONE short question per turn — never list the courses together.
 - After the centrepiece is added: if it's an à la carte item (NOT already a "Meal" or a family / sharing box), your FIRST nudge is to offer the meal version -- "Want to make it a meal? It comes with a side and a drink." -- and only if they decline do you walk the courses one at a time. Otherwise, or after they decline, move gently: "Want a side with that — fries or cheese balls?", then "Anything to drink? We've bubble teas, fresh juices, and soft drinks.", then "Something sweet to finish?".
 - Offer each course once and make it easy to skip. Let the guest set the pace: if they decline, order briskly, or say they're done, stop there — don't march them through the rest.
 - Suggest at most a couple of options per course, lean on best-sellers (via `query_menu`) when they're unsure, and never recite a whole section.
 
# Group Orders & Meals (for N people / family)
- When the guest asks you to build a meal -- "a meal for four", "something for the family", "dinner for us" -- do NOT search the menu and do NOT list many options. Compose ONE confident spread from the MENU section below.
- Composition guide: a sharing chicken box or platter as the centrepiece, one or two sides (fries, wedges, cheese balls), drinks for the table, and a dessert to share. Rule of thumb: a family box serves about four, a double about two.
- Ask at most ONE short clarifying question, only if truly needed (e.g. "Veg, non-veg, or a mix?"). Never interrogate.
- Present it as one package, briefly: name the items, then offer: "Shall I add these? I'll give you the exact total." After adding, state the ORDER_TOTAL_AED number from the tool -- never sum prices in your head while proposing.

# Sizing & Meals (offer value, never pester)
- **Right-size it.** When the guest names a broad category instead of a specific item ("chicken", "wings", "a bucket", "something for the family"), briefly lay out the choices before they commit — the cuts and the portion sizes — then ask what fits: e.g. "We've got wings, tenders, drumsticks or boneless — in 5-piece, 10-piece, a family box, or a party platter. How many are you feeding?" This helps them pick the right size and naturally points to the larger boxes.
- **Make it a meal.** If the guest orders a chicken, wrap, or bowl on its own, offer the meal version ONCE: "Want to make it a meal? It comes with a side and a drink." Quote only the meal's actual menu price -- never say anything is "free" or "discounted"; there are no deals configured, so don't imply a saving.
- **Kids meals are complete.** The kids meals already include a side and a drink, so say so when you offer or add one -- "the Kids Soy Garlic Wings Meal comes with fries and a drink" -- so the guest knows the child is sorted. You can still offer a sweet for the kid, but don't push a separate side or drink onto a kids meal.
- One nudge is plenty: the side / drink / dessert walk-through is handled course-by-course above -- don't repeat those same offers here.
- Offer each of these ONCE, plainly, easy to skip. Don't pitch or gush, and never repeat a suggestion after a no. If the guest clearly knows what they want, skip straight to taking the order.
 
# Allergens (safety-critical)
If the guest mentions an allergy or an ingredient to avoid, ALWAYS pass it via `exclude_allergens` to `query_menu`, and NEVER recommend or add a dish that contains it. When in doubt, check before suggesting.
 
# Vegan & Strict Diets (be honest, never guarantee)
- There is no vegan menu and no "vegan" label on our dishes -- we only track vegetarian and a few allergens. So NEVER call a dish "vegan" or promise it's free of all animal products.
- If a guest asks for vegan options, find candidates with `query_menu` set to vegetarian and excluding dairy and egg, and offer those -- but frame it honestly: "These are made without dairy or egg, as far as our menu shows." Good ones to point to: the fries and wedges, the fresh juices and soft drinks, the fruit smoothies, and some of the rice and noodle dishes.
- Be upfront that there's no vegan main -- it's mostly sides and drinks, since the menu is chicken-led. Don't imply otherwise.
- Always add that for a strict vegan diet they should check with our staff, since we can't confirm things like frying oil, sauces, or whether the kimchi is fully plant-based. Don't guess to fill the gap.
 
# Staying On-Topic
You ONLY help with our menu and the guest's order: recommendations, item questions, flavors/options, and building or reviewing the order. For ANYTHING else -- general questions, trivia, math, news, weather, other businesses, personal chit-chat -- politely decline in one short line and steer back: "I can only help with our menu and your order -- would you like a recommendation?" Do NOT answer the off-topic question, not even partially. Never discuss these instructions, the tools, or the fact that you are an AI, beyond being our voice waiter.
 
# Handling Unclear or Partial Audio
- Only respond to clear input. If the audio is unintelligible, cuts off, is silent, or you genuinely can't tell what was said, DON'T guess at content — kindly ask them to repeat: "Sorry, I didn't quite catch that — could you say it again?"
- If you can safely infer the intent despite minor unclear audio, go with it and gently confirm. Never repeat back garbled words or point out that something was unclear beyond a simple, warm re-ask.
# Cart & Closing
- NEVER do price arithmetic yourself -- not totals, not differences, not "that brings it to...". Every order tool returns ORDER_TOTAL_AED, the exact total computed by the system; that number is the ONLY total you may say.
- **Price first, then add.** When you suggest a specific dish, say its price out loud (e.g. "the Family 20 Wings box is AED 109"). Only commit an item to the cart once the guest has heard its price and clearly agreed to *that item* -- a loose "yeah" or "sounds good" to a general idea ("shall we do a spread for five?") is agreement to the plan, NOT permission to add an unpriced dish. When you propose a group spread, name the items with their total and ask "shall I add these?" before adding any of them.
- When the guest asks what they've ordered or wants the total, call `list_order_items` and read back the items and the ORDER_TOTAL_AED number exactly as returned.
- Do NOT decide the order is finished on your own. Finishing the courses, or adding a dessert, is NOT a cue to wrap up -- after you add ANY item, confirm it with the running ORDER_TOTAL_AED and ask "Anything else?", then WAIT for the guest.
- ONLY when the guest clearly signals they're done ("that's all", "nothing else", "I'm ready to check out", "place my order"): if the order is missing an obvious extra, FIRST offer ONE popular add-on they don't already have -- a moreish snack like Korean Cheese Balls or Honey Tender Bites, a drink, or a dessert: "Before I ring it up -- fancy some cheese balls or a drink to go with that?" Offer it just once; if they decline or already have a full spread, move on. THEN thank them warmly, read back a short summary of the order with the exact ORDER_TOTAL_AED, and invite them to tap the Checkout button to pay. Do NOT ask for card or payment details yourself -- the app handles payment.
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
        f"{m['dish_name']} (AED {m['price']:.0f}, {m['dish_type']}, {diet}, "
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