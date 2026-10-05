import { getRecap } from "@/lib/recap";

export const revalidate = 3600;

export const metadata = {
  title: "Weekly Recap — The Archive",
  description: "The week's story, told through the community's own posts.",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function RecapPage() {
  const { paragraphs, items, since, statsText } = await getRecap();
  const now = new Date();

  return (
    <main className="min-h-screen bg-ink px-6 py-16 md:px-16">
      <article className="max-w-2xl mx-auto">
        <a href="/" className="text-xs text-muted hover:text-gold">
          ← Back to the archive
        </a>

        <header className="mt-10 mb-10">
          <p className="stamp inline-block mb-4">
            Weekly Recap · {fmt(since)} – {fmt(now)}
          </p>
          <h1 className="font-display italic text-4xl md:text-5xl text-paper mb-3">
            The week in the archive
          </h1>
          {items.length > 0 && (
            <p className="text-xs text-muted">
              {items.length} {items.length === 1 ? "entry" : "entries"} from{" "}
              {new Set(items.map((i) => i.handle)).size}{" "}
              {new Set(items.map((i) => i.handle)).size === 1 ? "creator" : "creators"}
              . Tap ↗ to open the original post.
            </p>
          )}
        </header>

        {statsText && (
          <div className="mb-10 p-5 card-hairline rounded-sm bg-surface">
            <p className="stamp mb-3 inline-block">This Week's Numbers</p>
            <p className="text-sm text-paper/80 whitespace-pre-line leading-relaxed">
              {statsText}
            </p>
          </div>
        )}

        {paragraphs.length === 0 ? (
          <p className="text-muted text-sm">
            Nothing was added this week. Check back after the next batch.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {paragraphs.map((segments, pIdx) => (
              <p
                key={pIdx}
                className="font-display text-lg text-paper/90 leading-relaxed"
              >
                {segments.map((seg, sIdx) =>
                  seg.type === "text" ? (
                    <span key={sIdx}>{seg.value}</span>
                  ) : (
                    <a
                      key={sIdx}
                      href={seg.url}
                      target="_blank"
                      rel="noreferrer"
                      title={"Read @" + seg.handle + "'s tweet"}
                      className="text-gold no-underline hover:underline mx-0.5"
                    >
                      {seg.value}
                    </a>
                  )
                )}
              </p>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <footer className="mt-16 pt-6 border-t border-line">
            <p className="stamp mb-4 inline-block">Sources</p>
            <ul className="flex flex-col gap-1.5 text-xs">
              {items.map((i) => (
                <li key={i.entry.id} className="flex items-center gap-2">
                  <a
                    href={"https://x.com/" + i.handle}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted hover:text-paper"
                  >
                    @{i.handle}
                  </a>
                  <a
                    href={i.entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:underline"
                  >
                    Read the tweet →
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-muted">
              Curated by hand. Recaps refresh hourly.
            </p>
          </footer>
        )}
      </article>
    </main>
  );
}