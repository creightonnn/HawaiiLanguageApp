-- ============================================================
-- Nā Inoa o Hawaiʻi — Initial Schema Migration
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: place_names
-- ============================================================
create table if not exists place_names (
  id              uuid primary key default gen_random_uuid(),
  name_hawaiian   text not null,
  name_english    text,
  pronunciation   text,
  meaning         text not null,
  mooolelo        text,
  island          text check (island in ('Oʻahu', 'Maui', 'Hawaiʻi', 'Kauaʻi', 'Molokaʻi', 'Lānaʻi', 'Niʻihau', 'Kahoʻolawe')),
  region          text,
  latitude        float,
  longitude       float,
  audio_url       text,
  verified        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Full-text search: combine all searchable fields into a tsvector column
alter table place_names
  add column if not exists fts tsvector
    generated always as (
      to_tsvector('english',
        coalesce(name_hawaiian, '') || ' ' ||
        coalesce(name_english,  '') || ' ' ||
        coalesce(meaning,       '') || ' ' ||
        coalesce(mooolelo,      '') || ' ' ||
        coalesce(region,        '') || ' ' ||
        coalesce(island,        '')
      )
    ) stored;

-- Indexes
create index if not exists idx_place_names_island    on place_names (island);
create index if not exists idx_place_names_verified  on place_names (verified);
create index if not exists idx_place_names_fts       on place_names using gin (fts);
create index if not exists idx_place_names_coords    on place_names (latitude, longitude)
  where latitude is not null and longitude is not null;

-- ============================================================
-- TABLE: chat_sessions
-- ============================================================
create table if not exists chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null unique,
  created_at  timestamptz not null default now()
);

create index if not exists idx_chat_sessions_session_id on chat_sessions (session_id);

-- ============================================================
-- TABLE: chat_messages
-- ============================================================
create table if not exists chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null references chat_sessions (session_id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_chat_messages_session_id on chat_messages (session_id);
create index if not exists idx_chat_messages_created_at on chat_messages (created_at);

-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================
create table if not exists quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null,
  place_name_id   uuid not null references place_names (id) on delete cascade,
  question_type   text not null check (question_type in ('meaning', 'island', 'mooolelo')),
  correct         boolean not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_quiz_attempts_session_id    on quiz_attempts (session_id);
create index if not exists idx_quiz_attempts_place_name_id on quiz_attempts (place_name_id);

-- ============================================================
-- Row-Level Security (open read for anonymous, service role writes)
-- ============================================================
alter table place_names   enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table quiz_attempts enable row level security;

-- Public can read verified place names
create policy "Public read verified place_names"
  on place_names for select
  using (verified = true);

-- Service role (edge functions) can read/write everything
-- (service role bypasses RLS by default in Supabase — no extra policy needed)

-- Allow anon to read their own chat messages (edge functions use service role)
create policy "Anon read own chat_messages"
  on chat_messages for select
  using (true);

create policy "Anon read own chat_sessions"
  on chat_sessions for select
  using (true);
