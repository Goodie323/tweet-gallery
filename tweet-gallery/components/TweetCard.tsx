import { Tweet } from "react-tweet";
import type { TweetEntry } from "@/lib/supabase";
import TrackClick from "./TrackClick";

function accessionNumber(index: number): string {
  return `No. ${String(index + 1).padStart(3, "0")}`;
}

export default function TweetCard({
  entry,
  index,
}: {
  entry: TweetEntry;
  index: number;
}) {
  return (
    <div className="card-hairline bg-surface rounded-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="stamp">{accessionNumber(index)}</span>
        {entry.featured && (
          <span className="text-[0.65rem] tracking-wide text-gold font-medium uppercase">
            ★ Featured
          </span>
        )}
      </div>

      <TrackClick id={entry.id}>
        <div className="tweet-embed [&_.react-tweet-theme]:!bg-transparent">
          <Tweet id={entry.tweet_id} />
        </div>
      </TrackClick>

      <div className="flex items-center justify-between pt-2 border-t border-line text-xs text-muted">
        {entry.category && (
          <span className="uppercase tracking-wide">{entry.category}</span>
        )}
        <span>
          {new Date(entry.added_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {entry.notes && (
        <p className="text-sm text-paper/80 italic font-display">
          "{entry.notes}"
        </p>
      )}
    </div>
  );
}
