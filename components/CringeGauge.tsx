import React from "react";
import { AlertTriangle, CheckCircle2, Flame, Skull } from "lucide-react";

interface CringeGaugeProps {
  score: number;
}

export function CringeGauge({ score }: CringeGaugeProps) {
  const getSeverity = (score: number) => {
    if (score <= 30) {
      return {
        label: "Authentic Human Zone",
        color: "text-accent-lime",
        bg: "bg-accent-lime",
        border: "border-accent-lime",
        badge: "bg-accent-lime/10 text-accent-lime border-accent-lime/30",
        icon: <CheckCircle2 className="w-5 h-5 text-accent-lime" />,
      };
    } else if (score <= 65) {
      return {
        label: "Mild Humblebrag Detected",
        color: "text-accent-yellow",
        bg: "bg-accent-yellow",
        border: "border-accent-yellow",
        badge: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30",
        icon: <Flame className="w-5 h-5 text-accent-yellow" />,
      };
    } else if (score <= 85) {
      return {
        label: "High Cringe Alert!",
        color: "text-accent-orange",
        bg: "bg-accent-orange",
        border: "border-accent-orange",
        badge: "bg-accent-orange/10 text-accent-orange border-accent-orange/30",
        icon: <AlertTriangle className="w-5 h-5 text-accent-orange" />,
      };
    } else {
      return {
        label: "Terminal LinkedIn Cringe ☣️",
        color: "text-accent-pink",
        bg: "bg-accent-pink",
        border: "border-accent-pink",
        badge: "bg-accent-pink/10 text-accent-pink border-accent-pink/30",
        icon: <Skull className="w-5 h-5 text-accent-pink" />,
      };
    }
  };

  const severity = getSeverity(score);

  return (
    <div className="bg-card border-2 border-border p-6 rounded-lg shadow-brutal-black relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          {severity.icon}
          <span className="font-mono text-xs uppercase font-extrabold tracking-wider text-zinc-300">
            🚩 Cringe Score Meter
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${severity.badge}`}>
          {severity.label}
        </span>
      </div>

      {/* Main Gauge Visual */}
      <div className="mt-6 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-baseline justify-center gap-1">
          <span className={`text-6xl sm:text-7xl font-black font-mono tracking-tight ${severity.color}`}>
            {score}%
          </span>
          <span className="text-zinc-500 font-mono text-sm font-bold uppercase">Cringe</span>
        </div>

        {/* Meter Progress Bar */}
        <div className="w-full mt-5 bg-zinc-900 border border-zinc-800 rounded-full h-4 p-0.5 relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${severity.bg}`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>

        {/* Gauge Scale Labels */}
        <div className="w-full flex justify-between mt-2 font-mono text-[10px] text-zinc-500">
          <span>0% (Casual Human)</span>
          <span>50% (Corporate Mild)</span>
          <span>100% (Pure Biohazard)</span>
        </div>
      </div>
    </div>
  );
}
