"use client";

export default function TrackClick({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    // Fire-and-forget — never block or delay the actual tweet link click.
    fetch(`/api/tweets/${id}/click`, { method: "POST" }).catch(() => {
      // Silently ignore — click tracking is best-effort, not critical.
    });
  }

  return (
    <div onClickCapture={handleClick} className="contents">
      {children}
    </div>
  );
}
