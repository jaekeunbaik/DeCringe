"use client";

import React, { useState, useEffect } from "react";
import { CRINGE_SAMPLES, CringeSample } from "@/lib/samples";
import { Sparkles, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";

interface InputSectionProps {
  onPolish: (text: string) => void;
  isLoading: boolean;
  error?: string | null;
}

const LOADING_MESSAGES = [
  "Measuring humble-brag density...",
  "Scanning for performative 'I am humbled' phrases...",
  "Calculating LinkedIn cringe coefficient...",
  "Consulting the anti-cringe oracle...",
  "Extracting genuine human intent...",
  "Drafting a savage roast...",
];

export function InputSection({ onPolish, isLoading, error }: InputSectionProps) {
  const [text, setText] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Rotate loading message while analyzing
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSampleClick = (sample: CringeSample) => {
    setText(sample.text);
  };

  const handleClear = () => {
    setText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onPolish(text.trim());
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 mt-8">
      {/* Sample Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          <Sparkles className="w-4 h-4 text-accent-lime" />
          <span>Quick Test Presets:</span>
        </div>
        {text && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-mono text-zinc-400 hover:text-accent-pink underline"
          >
            Clear Text
          </button>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CRINGE_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSampleClick(sample)}
            className="group flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-zinc-800 border border-border hover:border-accent-lime/50 rounded font-mono text-xs text-zinc-300 hover:text-white transition-all text-left"
          >
            <span className="text-accent-lime font-bold group-hover:translate-x-0.5 transition-transform">
              ⚡
            </span>
            <span>{sample.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:border-accent-lime/30">
              {sample.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-lg border-2 border-border focus-within:border-accent-lime bg-card p-1 shadow-brutal-black transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your drafted LinkedIn flex, X/Twitter thread, or casual update here..."
            rows={7}
            disabled={isLoading}
            className="w-full bg-transparent p-4 text-base sm:text-lg text-white placeholder-zinc-500 focus:outline-none resize-y min-h-[160px] font-sans"
          />

          {/* Textarea Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border/50 bg-zinc-950/40 font-mono text-xs text-zinc-400 rounded-b-md">
            <div className="flex items-center gap-4">
              <span>{charCount} chars</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            {charCount > 0 && charCount < 15 && (
              <span className="text-accent-yellow">Tip: Paste a longer post for deeper analysis</span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-accent-pink/10 border-2 border-accent-pink text-accent-pink rounded font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex justify-center">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`
              w-full sm:w-auto px-8 py-4 rounded-md font-mono text-lg font-extrabold uppercase tracking-wide
              flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-brutal
              ${
                !text.trim() || isLoading
                  ? "bg-zinc-800 text-zinc-500 border-2 border-zinc-700 cursor-not-allowed opacity-70 shadow-none"
                  : "bg-accent-lime text-black border-2 border-black hover:bg-[#EEFF85] hover:shadow-glow-lime"
              }
            `}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-black" />
                <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
              </>
            ) : (
              <>
                <span>Polish My Post</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
