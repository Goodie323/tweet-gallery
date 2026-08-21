import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "The Archive — Community Dispatch Gallery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const { data: tweets } = await supabase
    .from("tweets")
    .select("author_handle, category, featured")
    .order("added_at", { ascending: false });

  const count = tweets?.length ?? 0;
  const featured = tweets?.find((t) => t.featured);
  const categories = Array.from(
    new Set((tweets ?? []).map((t) => t.category).filter(Boolean))
  ).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0C0A",
          padding: "72px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#7C8363",
              border: "1px solid #2A2C22",
              borderRadius: 2,
              padding: "6px 14px",
              width: "fit-content",
              letterSpacing: 2,
            }}
          >
            COMMUNITY DISPATCH
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              color: "#EDEAE0",
              fontStyle: "italic",
              fontFamily: "serif",
            }}
          >
            The Archive
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#8A8C7D", maxWidth: 900 }}>
            A curated record of the sharpest posts from the community.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, color: "#C9A227" }}>{count}</div>
            <div style={{ fontSize: 20, color: "#8A8C7D" }}>
              {count === 1 ? "entry" : "entries"}
            </div>
          </div>
          {categories.length > 0 && (
            <div style={{ display: "flex", gap: 12 }}>
              {categories.map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    fontSize: 18,
                    color: "#8A8C7D",
                    border: "1px solid #2A2C22",
                    borderRadius: 2,
                    padding: "8px 16px",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
          {featured?.author_handle && (
            <div style={{ display: "flex", fontSize: 18, color: "#8A8C7D", marginLeft: "auto" }}>
              Featuring @{featured.author_handle}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
