"use client";

import React, { useRef, useEffect } from "react";
import { PolishResult } from "@/lib/gemini";
import { CringeGauge } from "./CringeGauge";
import { RewriteCard } from "./RewriteCard";
import { Sparkles, MessageSquareQuote, FileText, ArrowDown } from "lucide-react";

interface ResultsSectionProps {
  originalText: string;
  result: PolishResult;
}

export function ResultsSection({ originalText, result }: ResultsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll smooth to results on load
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <section ref={sectionRef} className="w-full max-w-5xl mx-auto px-4 mt-12 mb-16 space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex items-center gap-3 border-b-2 border-accent-lime pb-3">
        <Sparkles className="w-6 h-6 text-accent-lime" />
        <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight uppercase">
          AI Analysis & Human Rewrites
        </h2>
      </div>

      {/* Grid Row 1: Cringe Score Gauge & One-Line Roast */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Cringe Gauge (5 cols) */}
        <div className="md:col-span-5">
          <CringeGauge score={result.cringeScore} />
        </div>

        {/* One-Line Roast (7 cols) */}
        <div className="md:col-span-7 bg-card border-2 border-accent-pink/60 p-6 rounded-lg shadow-brutal-pink flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-card via-card to-accent-pink/5">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="text-2xl">🤡</span>
              <h3 className="font-mono text-xs uppercase font-extrabold tracking-wider text-accent-pink">
                One-Line Roast
              </h3>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <MessageSquareQuote className="w-8 h-8 text-accent-pink shrink-0 opacity-60" />
              <blockquote className="text-lg sm:text-xl font-bold text-white font-sans italic leading-snug">
                "{result.oneLineRoast}"
              </blockquote>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Diagnosed by Antidote AI</span>
            <span className="text-accent-pink font-semibold">Zero Mercy</span>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Original Text vs Rewrites Header */}
      <div className="pt-4 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-zinc-400">
        <FileText className="w-4 h-4 text-accent-lime" />
        <span>Original Draft vs. Human-Written Rewrites</span>
        <ArrowDown className="w-4 h-4 text-accent-lime animate-bounce" />
      </div>

      {/* Grid Row 3: Original Draft Preview & 3 Rewrites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Original Draft Box (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950/80 border-2 border-zinc-800 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="font-mono text-xs uppercase font-bold text-zinc-400">
                Original Draft
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-500">
                Raw Input
              </span>
            </div>

            <div className="mt-4 text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap line-clamp-[14]">
              {originalText}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-800 font-mono text-xs text-zinc-500 italic">
            Status: Contains {result.cringeScore}% performative fluff
          </div>
        </div>

        {/* 3 Human Rewrites Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <RewriteCard
            id="human"
            title="The Human (100% Casual)"
            subtitle="How a normal person at a coffee shop would say it."
            badge="☕ 100% Casual"
            content={result.rewrites.human}
            accentColor="lime"
          />

          <RewriteCard
            id="punchyDev"
            title="The Punchy Dev"
            subtitle="Short, direct, value-focused (Ideal for X/Twitter tech)."
            badge="⚡ Direct Tech"
            content={result.rewrites.punchyDev}
            accentColor="cyan"
          />

          <RewriteCard
            id="proNatural"
            title="The Pro Natural"
            subtitle="Professional & polished, but authentically human."
            badge="💼 Authentic Pro"
            content={result.rewrites.proNatural}
            accentColor="yellow"
          />
        </div>
      </div>
    </section>
  );
}
