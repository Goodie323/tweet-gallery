// Extracts the numeric tweet ID from any standard x.com / twitter.com URL.
export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export function extractHandle(url: string): string | null {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status/);
  return match ? match[1] : null;
}
