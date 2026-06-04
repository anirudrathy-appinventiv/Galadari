# Galadari — Voice Ordering Agent

A voice-first **AI waiter** for a Bengali (Kolkata) restaurant. A guest speaks
naturally; the agent recommends dishes, answers menu questions, builds an order,
and shows a live bill. Built on [LiveKit Agents](https://docs.livekit.io/agents/)
with a RAG layer over the menu, plus a small Next.js web front end.

---

## 1. What it does

- **Natural spoken ordering** — full-sentence requests, not button taps.
- **Recommendations & Q&A** — "something spicy and veg", "what's in the Mudo Dal", "anything without peanuts".
- **Menu-scoped & guarded** — only talks about the menu/order; declines off-topic chatter.
- **Validation** — if a dish isn't on the menu (e.g. pizza), it says so and suggests the closest match.
- **Upsell / cross-sell** — suggests pairings (rice/bread with a curry, a starter, a chutney).
- **Live cart** — the current order is pushed to the web UI and rendered as a printed bill.

---

## 2. Architecture (high level)

```
   Browser (Next.js web/)                 Python agent (agent.py)
 ┌────────────────────────┐   LiveKit   ┌──────────────────────────────┐
 │  LiveKitRoom (mic+audio)│◀──room────▶│  DriveThruAgent (Realtime LLM)│
 │  thali visualizer       │   WebRTC    │   ├─ tool: order_dish         │
 │  printed-bill cart  ◀───┼──RPC───────┤   ├─ tool: query_menu (RAG)   │
 └────────────────────────┘ set_cart_   │   ├─ tool: remove/list items  │
        ▲ token              content     │   └─ system prompt + menu     │
        │ /api/connection-details        └──────────────┬───────────────┘
        │ (livekit-server-sdk)                           │
                                                         ▼
                                          menu_rag.py ── Chroma (chroma-storage/)
                                                         + OpenAI embeddings
                                                         from data/menu.csv
```

**Two responsibilities are deliberately split:**

| Job | Mechanism | Why |
|-----|-----------|-----|
| Knowing what exists / validating | Compact menu in the **system prompt** + exact-match **catalog** | Instant, precise, no false matches |
| Discovery / recommendations / allergen filtering | **RAG** (`query_menu` over Chroma) | Semantic, fuzzy, filterable |
| Committing an order | **`order_dish`** tool against the catalog | Only real dishes get added |

RAG is for *finding*; the catalog is the *source of truth* for ordering. Vector
search is never used to validate availability (it always returns a nearest
neighbor, so it can't say "no").

---

## 3. Code map

| File | Role |
|------|------|
| `agent.py` | LiveKit agent: session setup (pure Realtime voice), `DriveThruAgent`, the `order_dish` / `remove` / `list` tools, `format_cart`, and the RPC cart push to the web UI. |
| `menu_rag.py` | Everything menu-data: parses `data/menu.csv`, builds the **Chroma** index + the `query_menu` RAG tool, `build_menu_catalog()` (id-keyed order catalog), `menu_overview()` (prompt menu), and `SYSTEM_PROMPT` (waiter persona). |
| `order.py` | `OrderedDish` model + `OrderState` (in-memory order with an `on_change` hook). |
| `data/menu.csv` | The 91-dish Bengali menu. Has a curated `embedding_text` column plus structured fields (price, dish_type, is_veg, allergens, spice, pairings…). |
| `chroma-storage/` | Persisted vector index (built once from the CSV; auto-rebuilt if deleted). |
| `database.py` | Legacy McDon's FakeDB — **no longer used** by the agent (kept on disk only). |
| `web/` | Next.js front end (see §6). |

---

## 4. How the menu / RAG works

1. **Build** (one-time, automatic on first run): each CSV row → a LlamaIndex
   `Document` embedded from `embedding_text` only (metadata excluded from the
   vector), stored in a persistent **Chroma** collection using OpenAI
   `text-embedding-3-small`. Structured columns are stored as metadata; each
   allergen also becomes a `has_<allergen>` flag.
2. **Query** (`query_menu` tool): the LLM passes a free-text `query` plus optional
   **hard filters** — `is_veg`, `max_price`, `exclude_allergens`. Filters run
   first (Chroma `where`), embeddings rank what's left. Results include price,
   veg flag, spice, allergens and a `pairs with` hint for cross-sell. If the top
   match is below a relevance threshold, the tool reports the item isn't on the
   menu.

> Changing the menu = edit `data/menu.csv`, delete `chroma-storage/`, and restart
> (it re-embeds on next launch). Keep the `embedding_text` column.

---

## 5. Setup

### Prerequisites
- **Python 3.11+** and **Node 18+** (Node 24 tested).
- A **LiveKit** project (URL + API key/secret) — [livekit.io](https://livekit.io) cloud or self-hosted.
- An **OpenAI API key** (Realtime model + embeddings).

### 5.1 Backend (the agent)

```bash
cd "drive-thru"
python -m venv .venv && source .venv/bin/activate     # or use the existing venv
pip install -r requirements.txt
```

Create `drive-thru/.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...          # optional; only if you re-enable external STT
```

Run the agent:

```bash
# Web/phone clients (registers a worker that joins real rooms):
python agent.py dev

# Terminal-only quick test (mic in your terminal, no web UI / no cart):
python agent.py console
```

> First `dev`/`console` launch builds the Chroma index (a few seconds of
> embedding calls), then caches it in `chroma-storage/`.

### 5.2 Front end (the web UI)

```bash
cd "drive-thru/web"
npm install
cp .env.local.example .env.local     # then fill in LIVEKIT_URL / KEY / SECRET
npm run dev                          # http://localhost:3000 (falls back to 3001 if busy)
```

`.env.local` needs the **same three LiveKit values** as the agent's `.env`
(`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`). The browser only ever
receives a short-lived room token minted by `/api/connection-details`.

### 5.3 Use it
1. Start the agent: `python agent.py dev`.
2. Start the web app: `npm run dev`.
3. Open the URL → **Begin your order** → allow the mic → talk.
   The agent auto-joins your room (automatic dispatch) and the bill fills as you order.

---

## 6. Front end (`web/`)

Next.js (App Router, TypeScript) using `@livekit/components-react`.

- `app/api/connection-details/route.ts` — mints a LiveKit token server-side (room `drive-thru`).
- `app/page.tsx` — landing + connected "Table"; custom mic/disconnect controls, an
  alpana **thali** audio visualizer, a live caption, and a **cart** that registers
  the `set_cart_content` RPC and renders the agent's bill.
- `app/globals.css` — the warm "Kitchen of Bengal" editorial theme (Fraunces +
  Hanken Grotesk + Noto Serif Bengali via `next/font`).

The agent → UI contract is one RPC method, **`set_cart_content`**, whose payload
is the markdown produced by `format_cart` (`**bold**` names, `[[Rs N]]` prices).

---

## 7. Voice configuration (important)

The agent uses a **pure speech-to-speech Realtime model**:

```python
llm = openai.realtime.RealtimeModel(voice="alloy")   # its own VAD + transcription
```

Do **not** re-attach an external STT / VAD / turn detector (Deepgram + Silero +
MultilingualModel). That hybrid desynced the model's conversation state and made
it cut off mid-sentence and speak gibberish. Turn-taking is best tested in the
**web UI** (the browser does acoustic echo cancellation); `console` mode can echo.

---

## 8. Known gaps / next steps
- `test_agent.py` still references the old McDonald's models and will fail until migrated.
- The web UI connects everyone to one shared room (`drive-thru`); randomize the room name per session for concurrent users.
- Image / visual-menu support is out of scope for now.
- `database.py` (FakeDB) is dead code, kept only for reference.
