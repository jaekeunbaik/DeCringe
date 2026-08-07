import React from "react";
import { ShieldAlert, Zap, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="w-full pt-10 pb-6 text-center border-b border-border/80 bg-card/40 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent-lime/10 border border-accent-lime/30 text-accent-lime font-mono text-xs font-semibold tracking-wider uppercase">
          <Zap className="w-3.5 h-3.5 fill-accent-lime animate-pulse" />
          <span>Powered by Gemini 2.5 API • 100% Free Micro-Tool</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white flex items-center justify-center gap-3">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Antidote
          </span>
          <span className="text-accent-lime font-mono bg-accent-lime/10 px-3 py-1 border-2 border-accent-lime shadow-brutal text-2xl sm:text-4xl -rotate-2">
            for Flex
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed">
          The witty, sarcastic AI defibrillator that strips humble-brags and corporate cringe from your posts—replacing them with <span className="text-white font-semibold underline decoration-accent-lime underline-offset-4">authentically human</span> rewrites.
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-pink" /> 0% Corporate Speak
          </span>
          <span className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded">
            <Sparkles className="w-3.5 h-3.5 text-accent-yellow" /> 3 Human Voice Modes
          </span>
          <span className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded">
            🔒 No Auth Required
          </span>
        </div>
      </div>
    </header>
  );
}
