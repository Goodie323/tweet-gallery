-- Run this in the Supabase SQL editor for your project.

create table if not exists tweets (
  id uuid primary key default gen_random_uuid(),
  tweet_id text not null,
  url text not null,
  author_handle text,
  category text,
  featured boolean not null default false,
  notes text,
  added_at timestamptz not null default now(),
  clicks integer not null default 0
);

create index if not exists tweets_added_at_idx on tweets (added_at desc);

-- Row Level Security: anyone can read, nobody can write via the anon key.
-- All writes go through /api routes using the service role key, which
-- bypasses RLS and is gated behind the admin password + session cookie
-- (except the click-tracking endpoint, which is intentionally public).
alter table tweets enable row level security;

create policy "Public read access"
  on tweets for select
  using (true);

-- Atomic click increment, used by /api/tweets/[id]/click. Doing this as
-- a function avoids a read-then-write race when multiple people click
-- around the same time.
create or replace function increment_tweet_clicks(row_id uuid)
returns void as $$
begin
  update tweets set clicks = clicks + 1 where id = row_id;
end;
$$ language plpgsql security definer;

-- If you already have a `tweets` table from before this feature, run just
-- this bit to add the column without recreating everything:
-- alter table tweets add column if not exists clicks integer not null default 0;
