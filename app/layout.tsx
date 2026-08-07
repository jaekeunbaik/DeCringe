import type { Metadata } from "next";
import "./globals.css";
import { KofiWidget } from "@/components/KofiWidget";

export const metadata: Metadata = {
  title: "Antidote for Flex | CringeGuard AI",
  description:
    "Instantly roast humble-brags and convert performative LinkedIn posts into authentic, human-written updates. Powered by Gemini 2.5 API.",
  keywords: [
    "cringe guard",
    "anti cringe ai",
    "linkedin post rewriter",
    "humblebrag detector",
    "twitter tech thread polisher",
    "indie hacker tool",
  ],
  authors: [{ name: "Antidote Team" }],
  openGraph: {
    title: "Antidote for Flex - CringeGuard AI",
    description:
      "Strip humble-brags and corporate speak from your posts with authentic human rewrites.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased bg-brutal-grid">
        {children}
        <KofiWidget />
      </body>
    </html>
  );
}
