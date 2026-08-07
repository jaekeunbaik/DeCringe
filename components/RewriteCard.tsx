"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, MessageSquare, Terminal, Briefcase } from "lucide-react";
import confetti from "canvas-confetti";

interface RewriteCardProps {
  id: "human" | "punchyDev" | "proNatural";
  title: string;
  subtitle: string;
  badge: string;
  content: string;
  accentColor: "lime" | "cyan" | "yellow";
}

export function RewriteCard({
  id,
  title,
  subtitle,
  badge,
  content,
  accentColor,
}: RewriteCardProps) {
  const [copied, setCopied] = useState(false);

  const colorStyles = {
    lime: {
      border: "border-accent-lime/40 hover:border-accent-lime",
      badge: "bg-accent-lime/10 text-accent-lime border-accent-lime/30",
      btnBg: "bg-accent-lime text-black hover:bg-[#EEFF85]",
      icon: <MessageSquare className="w-4 h-4 text-accent-lime" />,
    },
    cyan: {
      border: "border-accent-cyan/40 hover:border-accent-cyan",
      badge: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
      btnBg: "bg-accent-cyan text-black hover:bg-[#70F7FF]",
      icon: <Terminal className="w-4 h-4 text-accent-cyan" />,
    },
    yellow: {
      border: "border-accent-yellow/40 hover:border-accent-yellow",
      badge: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30",
      btnBg: "bg-accent-yellow text-black hover:bg-[#FFF066]",
      icon: <Briefcase className="w-4 h-4 text-accent-yellow" />,
    },
  }[accentColor];

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);

    // Fire subtle celebratory confetti burst
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#E2FF54", "#00F0FF", "#FFE600"],
    });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={`bg-card border-2 ${colorStyles.border} p-5 rounded-lg transition-all flex flex-col justify-between shadow-brutal-black`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            {colorStyles.icon}
            <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-tight">
              {title}
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${colorStyles.badge}`}>
            {badge}
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-400 font-mono italic">{subtitle}</p>

        {/* Content Body */}
        <div className="mt-4 p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded text-sm text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap select-text">
          {content}
        </div>
      </div>

      {/* Copy Button */}
      <div className="mt-5 pt-3 border-t border-border/50">
        <button
          type="button"
          onClick={handleCopy}
          className={`w-full py-2.5 px-4 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black transition-all transform active:scale-95 shadow-sm ${colorStyles.btnBg}`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-black" />
              <span>Copy Rewritten Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
