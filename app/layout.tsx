import type { Metadata } from "next";
import "./globals.css";
import { KofiWidget } from "@/components/KofiWidget";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://de-cringe.vercel.app"),
  title: {
    default: "Antidote for Flex | CringeGuard AI",
    template: "%s | Antidote for Flex",
  },
  description:
    "Instantly detect cringe, humble-brags, and performative LinkedIn-ness in your posts. Get sarcastic roasts & 3 authentic human rewrites powered by Gemini 2.5 API.",
  keywords: [
    "cringe guard",
    "anti cringe ai",
    "linkedin post rewriter",
    "humblebrag detector",
    "twitter tech thread polisher",
    "indie hacker micro tool",
    "social media post improver",
    "de-cringe ai",
  ],
  authors: [{ name: "Ethan", url: "https://ko-fi.com/ethan0117" }],
  creator: "Ethan",
  publisher: "Antidote AI",
  verification: {
    google: "coYlpU9HVJXVvz9RmjkNZQHXaurqiUiewwUGPb8qXCw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Antidote for Flex - CringeGuard AI",
    description:
      "Strip humble-brags and corporate speak from your posts with authentic human rewrites. Free AI micro-tool for indie hackers & devs.",
    url: "https://de-cringe.vercel.app",
    siteName: "Antidote for Flex",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antidote for Flex | CringeGuard AI",
    description:
      "Stop embarrassing yourself on LinkedIn and Twitter. Get instant cringe scores, sarcastic roasts, and 3 authentic human rewrites.",
    creator: "@ethan0117",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Antidote for Flex",
  alternateName: "CringeGuard AI",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "An AI-powered micro-tool that detects humble-brags and performative cringe in social media posts, providing 100% authentic human rewrites.",
  url: "https://de-cringe.vercel.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content="coYlpU9HVJXVvz9RmjkNZQHXaurqiUiewwUGPb8qXCw" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased bg-brutal-grid">
        {children}
        <KofiWidget />
        <Analytics />
      </body>
    </html>
  );
}
