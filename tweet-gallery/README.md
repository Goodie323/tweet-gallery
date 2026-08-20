# The Archive — Community Dispatch Gallery

A manually-curated gallery of tweets pulled from your Discord content hub.
You paste the URL in `/admin`, it shows up on the public gallery — live,
real tweet data, no bot, no API key required for reading.

## Design

Archive/catalog aesthetic: near-black ink background, warm gold accent for
featured entries, monospace type for structure (categories, dates, entry
numbers), serif italic for the display headline and curator notes. Every
tweet is numbered like an accession entry (`No. 001`) because these are
genuinely sequential, curated additions — not decoration.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- `react-tweet` for live tweet embeds (no Twitter API key needed)
- Supabase (Postgres) for storage
- Password-gated `/admin`, session via signed HTTP-only cookie
- Deploys to Vercel

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your real values
```

1. Create a Supabase project at supabase.com
2. Go to the SQL editor, paste and run `supabase/schema.sql`
3. Get your keys from Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret — server-only)
4. Set `ADMIN_PASSWORD` to whatever you want your login password to be
5. Generate a session secret: `openssl rand -hex 32`, put it in `SESSION_SECRET`

```bash
npm run dev
```

Visit `http://localhost:3000` for the gallery, `/admin` to log in and add entries.

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it in Vercel
3. Add all the same env vars from `.env.local` into the Vercel project settings
4. Deploy — it auto-redeploys on every push to `main`

## Adding an entry

Go to `/admin`, log in with `ADMIN_PASSWORD`, paste any `x.com` or
`twitter.com` status URL, tag it with a category, optionally add a note and
mark it featured. It shows up on the gallery immediately (cache revalidates
every 60 seconds, or refresh manually).

## Notes

- Tweets are never copied or stored as text — only the tweet ID is saved.
  `react-tweet` fetches live content at render time, so embeds stay current
  and never go stale.
- The public Supabase client is read-only by Row Level Security; all writes
  go through server-side API routes using the service role key, gated by
  the admin session cookie.
