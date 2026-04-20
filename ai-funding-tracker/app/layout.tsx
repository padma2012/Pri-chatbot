import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The AI Funding Brief — Series A/B, Last 60 Days",
  description:
    "A VC-grade research report on AI Series A & Series B financings over the trailing 60 days, built from public disclosures.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink-950 text-ink-100 font-sans">{children}</body>
    </html>
  );
}
