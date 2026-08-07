import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

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
        <Script
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="afterInteractive"
        />
        <Script id="kofi-widget-init" strategy="afterInteractive">
          {`
            window.addEventListener('load', function() {
              if (window.kofiWidgetOverlay) {
                kofiWidgetOverlay.draw('ethan0117', {
                  'type': 'floating-chat',
                  'floating-chat.donateButton.text': 'Support me',
                  'floating-chat.donateButton.background-color': '#5bc0de',
                  'floating-chat.donateButton.text-color': '#323842'
                });
              }
            });
            setTimeout(function() {
              if (window.kofiWidgetOverlay && !document.getElementById('kofi-widget-overlay')) {
                kofiWidgetOverlay.draw('ethan0117', {
                  'type': 'floating-chat',
                  'floating-chat.donateButton.text': 'Support me',
                  'floating-chat.donateButton.background-color': '#5bc0de',
                  'floating-chat.donateButton.text-color': '#323842'
                });
              }
            }, 1000);
          `}
        </Script>
      </body>
    </html>
  );
}

