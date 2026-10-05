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

alter table tweets enable row level security;

create policy "Public read access"
  on tweets for select
  using (true);

create or replace function increment_tweet_clicks(row_id uuid)
returns void as $$
begin
  update tweets set clicks = clicks + 1 where id = row_id;
end;
$$ language plpgsql security definer;

-- New: simple key/value settings table, used for the weekly headline stats
-- block shown on /recap (e.g. the Pyth bulletin numbers).
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

create policy "Public read access on settings"
  on settings for select
  using (true);

-- If you already have `tweets` and just need to add what's new, run only this:
-- alter table tweets add column if not exists clicks integer not null default 0;
-- create table if not exists settings (key text primary key, value text, updated_at timestamptz not null default now());
-- alter table settings enable row level security;
-- create policy "Public read access on settings" on settings for select using (true);