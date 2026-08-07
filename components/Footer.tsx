import React from "react";
import { Coffee, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-border bg-card/60 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Ko-fi / Coffee Callout Box with Embedded Tip Panel */}
        <div className="w-full max-w-2xl bg-zinc-950/90 border-2 border-accent-yellow/50 p-6 rounded-lg shadow-brutal-black relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 font-mono text-xs text-accent-yellow font-extrabold uppercase tracking-wider">
              <Coffee className="w-4 h-4 text-accent-yellow" />
              <span>Support Independent Dev Tools</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-200 font-sans italic max-w-xl">
              "I built this for free to save my eyes from cringe. If it saved you from embarrassing yourself, buying me a coffee means the world!"
            </p>
          </div>

          {/* Embedded Ko-fi Tip Panel iframe */}
          <div className="w-full rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/ethan0117/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{ border: "none", width: "100%", padding: "4px", background: "#15181E" }}
              height="712"
              title="ethan0117"
            />
          </div>
        </div>

        {/* Footer Credit & Copy */}
        <div className="text-xs font-mono text-zinc-500 space-y-2">
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-accent-pink fill-accent-pink" /> by Indie Hackers for Indie Hackers.
          </p>
          <p>
            Antidote for Flex • Stateless & Privacy First • Vercel Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
