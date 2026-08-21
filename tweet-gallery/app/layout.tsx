import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "The Archive — Community Dispatch Gallery",
  description: "A curated record of the best posts from the community.",
  openGraph: {
    title: "The Archive — Community Dispatch Gallery",
    description: "A curated record of the best posts from the community.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Archive — Community Dispatch Gallery",
    description: "A curated record of the best posts from the community.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${mono.variable}`}>
      <body className="font-mono">{children}</body>
    </html>
  );
}