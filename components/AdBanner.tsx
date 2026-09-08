"use client";

import React, { useEffect } from "react";

interface AdBannerProps {
  slot?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = "1234567890",
  className = ""
}) => {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.debug("AdSense init error:", err);
    }
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto my-6 p-2 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-zinc-500 font-medium tracking-wider mb-1 uppercase">ADVERTISEMENT</span>
      <div className="w-full min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", textAlign: "center" }}
          data-ad-client="ca-pub-4403789108346139"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
