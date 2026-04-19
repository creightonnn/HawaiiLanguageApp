# Nā Inoa o Hawaiʻi — Backend

Supabase backend for the Hawaiian place names educational web app.

---

## Project Structure

```
na-inoa-o-hawaii/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # All tables, indexes, RLS policies
│   ├── seed/
│   │   └── 001_place_names.sql      # 15 starter place name entries
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts              # Shared CORS headers
│       ├── search/index.ts          # Place name search
│       ├── map-pins/index.ts        # Lightweight map coordinate data
│       ├── quiz/index.ts            # Multiple-choice quiz generator
│       └── chat/index.ts            # RAG chatbot (Claude-powered)
└── README.md
```

---

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`brew install supabase/tap/supabase` or see docs)
- A Supabase project created at [supabase.com](https://supabase.com)
- An Anthropic API key (for the chat function)
- [Deno](https://deno.land/) installed (used locally for edge function development)

---

## Environment Variables

| Variable | Where Used | Description |
|---|---|---|
| `SUPABASE_URL` | All edge functions | Your project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | All edge functions | Service role key — bypasses RLS. Keep secret. |
| `ANTHROPIC_API_KEY` | `chat` function only | Your Anthropic API key |

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected
> by Supabase at runtime when you deploy. You only need to set `ANTHROPIC_API_KEY` manually.

---

## Setup & Deployment

### 1. Link your Supabase project

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is the string in your Supabase dashboard URL:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

---

### 2. Run the database migration

```bash
supabase db push
```

Or apply manually in the Supabase SQL editor by pasting the contents of:
`supabase/migrations/001_initial_schema.sql`

---

### 3. Load the seed data

```bash
supabase db reset   # WARNING: resets the entire DB — only use on a fresh project
```

Or apply seed data only (safer):
```bash
psql "$(supabase db url)" < supabase/seed/001_place_names.sql
```

Or paste `supabase/seed/001_place_names.sql` directly into the Supabase SQL editor.

---

### 4. Set the Anthropic API key secret

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Verify it was set:
```bash
supabase secrets list
```

---

### 5. Deploy edge functions

Deploy all four functions at once:

```bash
supabase functions deploy search   --no-verify-jwt
supabase functions deploy map-pins --no-verify-jwt
supabase functions deploy quiz     --no-verify-jwt
supabase functions deploy chat     --no-verify-jwt
```

`--no-verify-jwt` allows anonymous (unauthenticated) requests from the frontend.

---

### 6. Verify deployment

After deploying, test each function with curl:

**search:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "valley"}'
```

**map-pins:**
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/map-pins
```

**quiz:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/quiz \
  -H "Content-Type: application/json" \
  -d '{"question_type": "meaning"}'
```

**chat:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-session-001", "message": "What does Mānoa mean?"}'
```

> **Note:** The seed data has `verified = false`. The search/map-pins/quiz functions
> use the service role key and query **all** entries regardless of `verified` status,
> so they will return seed data immediately. To restrict public access to only
> verified entries, flip `verified = true` in the seed data or via the dashboard
> after your cultural consultant reviews each entry.

---

## API Reference

### `POST /functions/v1/search`

Search place names by text query.

**Request body:**
```json
{
  "query": "valley rain",     // optional — omit or empty string to return all
  "island": "Oʻahu"          // optional filter
}
```

**Response:**
```json
{
  "results": [ /* array of full place_name records */ ]
}
```

---

### `GET /functions/v1/map-pins`

Returns lightweight pin data for all entries with coordinates.

**Response:**
```json
{
  "pins": [
    {
      "id": "uuid",
      "name_hawaiian": "Mānoa",
      "meaning": "Vast; thick; solid",
      "island": "Oʻahu",
      "latitude": 21.3333,
      "longitude": -157.8025
    }
  ]
}
```

---

### `POST /functions/v1/quiz`

Generate a single multiple-choice question.

**Request body:**
```json
{
  "question_type": "meaning",   // "meaning" | "island" | "mooolelo"
  "island": "Kauaʻi"           // optional filter
}
```

**Response:**
```json
{
  "question": "What does \"Hanalei\" mean?",
  "options": ["Crescent bay; lei-shaped bay", "Red Water", "Vast", "Spouting water"],
  "correct_index": 0,
  "place_name_id": "uuid"
}
```

---

### `POST /functions/v1/chat`

Send a message to the RAG chatbot.

**Request body:**
```json
{
  "session_id": "anon-user-xyz-123",
  "message": "Tell me about the history of Lāhainā"
}
```

**Response:**
```json
{
  "response": "Lāhainā on western Maui was once the royal capital...",
  "context_entries_used": ["Lāhainā", "Waikīkī"]
}
```

`session_id` should be generated on the frontend (e.g., a UUID stored in localStorage)
and persisted across page loads so conversation history is maintained.

---

## Marking Entries as Verified

Once the cultural consultant approves an entry, update it via the Supabase dashboard
or with SQL:

```sql
update place_names set verified = true where name_hawaiian = 'Mānoa';

-- Or approve all at once for the demo:
update place_names set verified = true;
```

---

## Notes on RLS

- Row-level security is enabled on all tables.
- The `place_names` public read policy restricts anonymous frontend queries to `verified = true` entries.
- Edge functions use the **service role key** and bypass RLS, so they can read unverified entries. This is intentional — it lets you test with seed data before the consultant review.
- `chat_messages` and `chat_sessions` are write-only from the frontend perspective; all writes go through the chat edge function using the service role key.
