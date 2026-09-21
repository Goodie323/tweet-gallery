import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — used by the gallery (read-only, respects RLS policies).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only client with the service role key — used by admin API routes
// so writes bypass RLS. NEVER import this from a client component.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export type TweetEntry = {
  id: string;
  tweet_id: string;
  url: string;
  author_handle: string | null;
  category: string | null;
  featured: boolean;
  notes: string | null;
  added_at: string;
  clicks: number;
};
