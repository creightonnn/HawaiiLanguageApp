# Lovable Prompt — Nā Inoa o Hawaiʻi

Build a complete, polished single-page web application called **"Nā Inoa o Hawaiʻi"**
(Hawaiian for "The Names of Hawaiʻi") — an educational app teaching Hawaiian place names,
their meanings, cultural stories, and geography.

---

## Design System

### Personality
Warm, respectful, and educational. The app should feel like a beautifully designed
cultural museum exhibit — not a tourist brochure. It honors the Hawaiian language
and culture with quiet dignity.

### Color Palette
- **Background:** `#0D1F2D` — deep ocean night (primary background)
- **Surface:** `#132536` — slightly lighter for cards and panels
- **Surface Elevated:** `#1A3347` — modal backgrounds, hover states
- **Primary Accent:** `#C8973A` — warm koa wood gold (buttons, highlights, active states)
- **Secondary Accent:** `#3D8B6F` — lush maile green (badges, tags, success states)
- **Text Primary:** `#F0EAD6` — warm parchment white
- **Text Secondary:** `#8BA7B8` — muted ocean mist
- **Border:** `#1E3D52` — subtle dark teal border
- **Danger/Error:** `#C0392B`

### Typography
- **Display/Headings:** `Playfair Display` (Google Font) — serif, gives cultural gravitas
- **Body/UI:** `Inter` (Google Font) — clean, readable
- **Hawaiian words** (name_hawaiian field): Always render in `Playfair Display` italic,
  slightly larger than surrounding text, color `#C8973A`
- Font sizes: base 16px, heading scale 1.25 ratio

### Visual Style
- Subtle texture: a very faint linen/paper texture overlay on backgrounds (CSS noise or SVG pattern)
- Cards use `border-radius: 12px` with a `1px` border in the border color
- Soft glow on hover: `box-shadow: 0 0 20px rgba(200, 151, 58, 0.15)`
- Smooth transitions: `transition: all 0.2s ease`
- No harsh drop shadows — prefer subtle inner glow or border effects
- Island/region badges: pill shape, `#3D8B6F` background, small uppercase text
- Map pins: custom SVG teardrop shape in `#C8973A`

### Layout
- Max content width: `1200px`, centered
- Navigation: sticky top bar, `#0D1F2D` background, frosted glass blur effect
- Mobile-first responsive — all views work on phone
- Bottom tab bar on mobile for main navigation

---

## Navigation Structure

Five main sections accessible via top nav (desktop) and bottom tab bar (mobile):

1. **Search** (default/home) — magnifying glass icon
2. **Map** — map pin icon
3. **Quiz** — brain/star icon
4. **Chat** — speech bubble icon
5. **About** — info circle icon (static page, no backend needed)

---

## Page 1: Search

**Purpose:** Browse and search all Hawaiian place names.

**Layout:**
- Full-width hero at top: large Hawaiian text "Nā Inoa o Hawaiʻi" in Playfair Display,
  subtitle "Discover the meaning behind Hawaiian place names" in smaller muted text
- Search bar below hero: rounded pill input with magnifying glass icon, placeholder
  "Search by name, meaning, or island…"
- Island filter: horizontal scrollable pill buttons below search bar —
  "All Islands", "Oʻahu", "Maui", "Hawaiʻi", "Kauaʻi", "Molokaʻi", "Lānaʻi"
  Active filter highlighted in `#C8973A`
- Results grid: 3 columns desktop, 2 tablet, 1 mobile
- Each **Place Card** shows:
  - Hawaiian name (large, gold, Playfair italic)
  - English name/context (small, muted)
  - Island badge (green pill)
  - Meaning (1 line, truncated)
  - "→" arrow button on hover

**Behavior:**
- On page load: fetch all entries (empty query)
- As user types (debounce 300ms): call search endpoint
- Clicking island filter pill: re-run search with island param
- Clicking a Place Card: open Place Detail drawer/modal

**API call:**
```
POST https://ywdljhwwggoewuybhkei.supabase.co/functions/v1/search
Headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZGxqaHd3Z2dvZXd1eWJoa2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Njk5NDMsImV4cCI6MjA5MjE0NTk0M30.ljz4ua2yFEQaCyzwHOF2-Yvk4MpTD_5R9WmBOqWmPm4", "Content-Type": "application/json" }
Body: { "query": "string", "island": "Oʻahu" }  // island optional
Response: { "results": [ { id, name_hawaiian, name_english, pronunciation, meaning, mooolelo, island, region, latitude, longitude, audio_url, verified, created_at } ] }
```

---

## Component: Place Detail Drawer

Slides in from the right (desktop) or bottom sheet (mobile) when a Place Card is clicked.

**Contents:**
- Close button (X) top right
- Hawaiian name — large, Playfair Display, gold
- Pronunciation guide — italic, muted: e.g. *MAH-no-ah*
- Island + Region badges
- **Meaning section:** label "Meaning" in small uppercase muted text, then the meaning below
- **Moʻolelo section:** label "Moʻolelo" (Cultural Story), then the full story paragraph
- **Map mini-preview:** small embedded static map or coordinate display showing the location
  (if latitude/longitude present) — use a simple Leaflet.js mini-map or OpenStreetMap iframe
- Bottom: "Ask the Guide about this place →" button that opens the Chat tab
  pre-populated with "Tell me more about [name_hawaiian]"

---

## Page 2: Map

**Purpose:** Visual geographic overview of all place names.

**Layout:**
- Full-screen interactive map (use **Leaflet.js** with **OpenStreetMap** tiles — free, no API key)
- Map centered on Hawaiian Islands: `lat: 20.5, lng: -157.5, zoom: 7`
- Custom gold teardrop pins for each place
- Clicking a pin: opens a compact popup with name, meaning, island badge,
  and "Learn More" button that opens Place Detail drawer
- Island filter pills floating over the map (top left)
- Pin count badge: "Showing 15 places" (bottom left)

**API call:**
```
GET https://ywdljhwwggoewuybhkei.supabase.co/functions/v1/map-pins
Headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZGxqaHd3Z2dvZXd1eWJoa2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Njk5NDMsImV4cCI6MjA5MjE0NTk0M30.ljz4ua2yFEQaCyzwHOF2-Yvk4MpTD_5R9WmBOqWmPm4" }
Response: { "pins": [ { id, name_hawaiian, meaning, island, latitude, longitude } ] }
```

---

## Page 3: Quiz

**Purpose:** Test knowledge of Hawaiian place names in a game-like format.

**Layout:**
- Centered card, max-width 600px
- Top: score tracker "3 / 5 correct" with animated progress bar in gold
- Question type selector: 3 pill tabs — "Meaning", "Island", "Story"
- Island filter dropdown (optional)
- **Question card:**
  - Question text (large, readable)
  - If question_type is "meaning": the Hawaiian name is shown large in gold above the question
  - 4 answer buttons in a 2x2 grid (desktop) or stacked (mobile)
  - Answer buttons: dark surface, border, rounded; on hover gold border glow
- **After answer:**
  - Correct: button flashes green with ✓, brief celebration (confetti burst or pulse)
  - Wrong: chosen button flashes red with ✗, correct answer highlighted green
  - Short explanation text appears below: the meaning or moʻolelo snippet
  - "Next Question →" button appears
- Bottom: "New Game" button resets score

**API call:**
```
POST https://ywdljhwwggoewuybhkei.supabase.co/functions/v1/quiz
Headers: { "apikey": "...", "Content-Type": "application/json" }
Body: { "question_type": "meaning" | "island" | "mooolelo", "island": "Kauaʻi" }
Response: { "question": "string", "options": ["A","B","C","D"], "correct_index": 0, "place_name_id": "uuid" }
```

---

## Page 4: Chat

**Purpose:** Ask an AI guide questions about Hawaiian place names.

**Layout:**
- Chat interface styled like iMessage but with Hawaiian aesthetic
- Background: subtle dark ocean texture
- User messages: right-aligned, `#C8973A` gold bubble
- Assistant messages: left-aligned, `#132536` dark surface bubble with gold left border
- Assistant avatar: small circular icon with a stylized ʻokina (ʻ) character or wave glyph
- Message timestamps in small muted text
- **Input bar** pinned to bottom:
  - Text input: "Ask about a Hawaiian place…"
  - Send button: gold arrow icon
  - Disabled/loading state: spinner replaces send button while awaiting response
- **Welcome state** (no messages yet):
  - Centered illustration area with 3 suggested prompt chips:
    - "What does Waikīkī mean?"
    - "Tell me about the history of Lāhainā"
    - "Which places on Kauaʻi are in the app?"
  - Clicking a chip populates and sends the message

**Session management:**
- Generate a UUID on first load and store in `localStorage` as `nainoaSessionId`
- Reuse on page refresh to preserve conversation history

**API call:**
```
POST https://ywdljhwwggoewuybhkei.supabase.co/functions/v1/chat
Headers: { "apikey": "...", "Content-Type": "application/json" }
Body: { "session_id": "uuid-from-localstorage", "message": "user text" }
Response: { "response": "assistant text", "context_entries_used": ["Mānoa", "Waikīkī"] }
```

- Show `context_entries_used` as small pill tags below the assistant message:
  "Sources: Mānoa · Waikīkī" in muted small text

---

## Page 5: About

Static page, no API calls needed.

**Content:**
- App name and tagline
- Brief paragraph: "Nā Inoa o Hawaiʻi is an educational app dedicated to preserving and
  sharing the meanings of Hawaiian place names. Each name carries centuries of history,
  navigation, and cultural memory. All entries are reviewed for cultural accuracy."
- Credit line: "Built with aloha for the [competition name] competition, April 2026"
- Small note: "All cultural content is reviewed by a Hawaiian cultural consultant
  before being marked as verified."

---

## Global Components

### Loading States
- Skeleton cards (pulsing dark rectangles) while search results load
- Spinner in gold color for chat and quiz
- Never show blank white screens

### Empty States
- Search no results: illustration of ocean waves + "No places found for '[query]'. Try a different search."
- Quiz not enough entries: friendly message
- Chat error: "The guide is temporarily unavailable. Please try again."

### Error Handling
- All API errors caught and shown as inline toast notifications (bottom of screen, auto-dismiss 4s)
- Toast style: dark surface, gold left border, error message text

---

## Tech Stack Preferences
- **React** with hooks (useState, useEffect, useCallback)
- **Tailwind CSS** for styling — configure the custom colors above in `tailwind.config.js`
- **Leaflet.js** for maps (`react-leaflet` package)
- **No Redux** — React state + localStorage is sufficient
- UUID generation: `crypto.randomUUID()` (built into modern browsers)

---

## Supabase / Backend Config

Store these in a `.env` file:
```
VITE_SUPABASE_URL=https://ywdljhwwggoewuybhkei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZGxqaHd3Z2dvZXd1eWJoa2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Njk5NDMsImV4cCI6MjA5MjE0NTk0M30.ljz4ua2yFEQaCyzwHOF2-Yvk4MpTD_5R9WmBOqWmPm4
```

All edge function calls use the anon key as the `apikey` header. No auth token required.
Functions are open (verify_jwt: false).

---

## Important Notes

- The ʻokina (ʻ) is a real Hawaiian letter — always render it correctly in all place names.
  Never replace it with an apostrophe (') or omit it.
- The kahakō (macron, e.g. ā ē ī ō ū) are also significant — render them correctly.
- The `mooolelo` field in API responses contains the cultural story (triple-o spelling
  is the database column name; display it labeled as "Moʻolelo" in the UI).
- All 15 place names in the database are currently verified. The app should simply
  display whatever the API returns.
- The quiz endpoint returns `correct_index` (0–3) indicating which of the 4 `options`
  array entries is correct.
