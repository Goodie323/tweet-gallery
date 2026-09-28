import { getRecap, type RecapItem } from "@/lib/recap";

export const revalidate = 3600; // rebuilt at most once an hour

export const metadata = {
  title: "Weekly Recap — The Archive",
  description: "The week's best community posts, creator by creator.",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function RecapPage() {
  const { intro, items, since } = await getRecap();
  const now = new Date();

  const groups = new Map<string, RecapItem[]>();
  for (const it of items) {
    const list = groups.get(it.handle) ?? [];
    list.push(it);
    groups.set(it.handle, list);
  }
  const creators = Array.from(groups.entries()).sort((a, b) => {
    const fa = a[1].some((i) => i.entry.featured) ? 1 : 0;
    const fb = b[1].some((i) => i.entry.featured) ? 1 : 0;
    return fb - fa || b[1].length - a[1].length;
  });

  const catCounts = new Map<string, number>();
  items.forEach((i) => {
    if (i.entry.category)
      catCounts.set(i.entry.category, (catCounts.get(i.entry.category) ?? 0) + 1);
  });
  const topCategory = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <main className="min-h-screen bg-ink px-6 py-16 md:px-16">
      <article className="max-w-2xl mx-auto">
        <a href="/" className="text-xs text-muted hover:text-gold">
          ← Back to the archive
        </a>

        <header className="mt-10 mb-12">
          <p className="stamp inline-block mb-4">
            Weekly Recap · {fmt(since)} – {fmt(now)}
          </p>
          <h1 className="font-display italic text-4xl md:text-5xl text-paper mb-6">
            The week in the archive
          </h1>
          {intro && (
            <p className="font-display text-lg text-paper/90 leading-relaxed">
              {intro}
            </p>
          )}
          {items.length > 0 && (
            <div className="mt-8 flex gap-8 text-xs text-muted border-y border-line py-4">
              <span>
                <span className="text-gold text-lg mr-1">{items.length}</span>
                {items.length === 1 ? "entry" : "entries"}
              </span>
              <span>
                <span className="text-gold text-lg mr-1">{creators.length}</span>
                {creators.length === 1 ? "creator" : "creators"}
              </span>
              {topCategory && (
                <span>
                  Top category:{" "}
                  <span className="text-paper uppercase tracking-wide">
                    {topCategory}
                  </span>
                </span>
              )}
            </div>
          )}
        </header>

        {items.length === 0 ? (
          <p className="text-muted text-sm">
            Nothing was added this week. Check back after the next batch.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {creators.map(([handle, list]) => (
              <section key={handle}>
                <div className="flex items-center gap-3 mb-4">
                  {list[0].avatar && (
                    <img
                      src={list[0].avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full border border-line"
                    />
                  )}
                  <div>
                    <p className="text-paper text-sm font-medium">
                      {list[0].name ?? handle}
                    </p>
                    
                      href={`https://x.com/${handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted hover:text-gold"
                    >
                      @{handle}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-5 border-l border-line pl-5">
                  {list.map((i) => (
                    <div key={i.entry.id}>
                      {i.entry.featured && (
                        <span className="text-[0.65rem] tracking-wide text-gold uppercase">
                          ★ Featured
                        </span>
                      )}
                      <p className="font-display text-paper/90 leading-relaxed">
                        {i.blurb}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                        {i.entry.category && (
                          <span className="uppercase tracking-wide">
                            {i.entry.category}
                          </span>
                        )}
                        
                          href={i.entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold hover:underline"
                        >
                          Read the tweet →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-line text-xs text-muted">
          Curated by hand. Recaps refresh hourly.
        </footer>
      </article>
    </main>
  );
}