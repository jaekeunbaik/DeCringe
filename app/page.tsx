"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { InputSection } from "@/components/InputSection";
import { ResultsSection } from "@/components/ResultsSection";
import { Footer } from "@/components/Footer";
import { PolishResult } from "@/lib/gemini";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [result, setResult] = useState<PolishResult | null>(null);

  useEffect(() => {
    // Log real-time visit to Discord monitor
    fetch("/api/track").catch(() => {});
  }, []);

  const handlePolishPost = async (inputText: string) => {
    setIsLoading(true);
    setError(null);
    setOriginalText(inputText);

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze post. Please try again.");
      }

      setResult(json.data);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err?.message || "Something went wrong while connecting to Gemini AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <Header />
        <main className="pb-12">
          <InputSection
            onPolish={handlePolishPost}
            isLoading={isLoading}
            error={error}
          />

          {result && (
            <ResultsSection
              originalText={originalText}
              result={result}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
