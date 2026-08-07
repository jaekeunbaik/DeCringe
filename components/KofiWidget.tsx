"use client";

import { useEffect } from "react";

export function KofiWidget() {
  useEffect(() => {
    const scriptId = "kofi-overlay-script";

    const drawWidget = () => {
      if (typeof window !== "undefined" && (window as any).kofiWidgetOverlay) {
        try {
          (window as any).kofiWidgetOverlay.draw("ethan0117", {
            type: "floating-chat",
            "floating-chat.donateButton.text": "Support me",
            "floating-chat.donateButton.background-color": "#00b9fe",
            "floating-chat.donateButton.text-color": "#fff",
          });
        } catch (err) {
          console.error("Ko-fi widget initialization error:", err);
        }
      }
    };

    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
      script.async = true;
      script.onload = () => {
        // Short delay to ensure script DOM elements ready
        setTimeout(drawWidget, 200);
      };
      document.body.appendChild(script);
    } else {
      drawWidget();
    }
  }, []);

  return null;
}
