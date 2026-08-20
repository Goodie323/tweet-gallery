-- Run this in the Supabase SQL editor for your project.

create table if not exists tweets (
  id uuid primary key default gen_random_uuid(),
  tweet_id text not null,
  url text not null,
  author_handle text,
  category text,
  featured boolean not null default false,
  notes text,
  added_at timestamptz not null default now()
);

create index if not exists tweets_added_at_idx on tweets (added_at desc);

-- Row Level Security: anyone can read, nobody can write via the anon key.
-- All writes go through /api routes using the service role key, which
-- bypasses RLS and is gated behind the admin password + session cookie.
alter table tweets enable row level security;

create policy "Public read access"
  on tweets for select
  using (true);

-- No insert/update/delete policy is created for the anon role, so the
-- public client (lib/supabase.ts `supabase`) cannot write. Only
-- `supabaseAdmin()`, used server-side in /api routes, can.
