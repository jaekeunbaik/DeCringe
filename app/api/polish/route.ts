import { NextRequest, NextResponse } from "next/server";
import { analyzeAndPolishPost } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, targetLang } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid post text to analyze." },
        { status: 400 }
      );
    }

    if (text.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Post text is too short. Please paste a longer draft." },
        { status: 400 }
      );
    }

    const result = await analyzeAndPolishPost(text.trim(), targetLang || "auto");

    // Optional Discord webhook logging if configured
    const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "⚡ Antidote for Flex - Post Analyzed!",
              color: 0xe2ff54,
              fields: [
                { name: "🚩 Cringe Score", value: `${result.cringeScore}%`, inline: true },
                { name: "🤡 One-Line Roast", value: result.oneLineRoast, inline: false },
                {
                  name: "📝 Original Draft Preview",
                  value: text.trim().length > 300 ? text.trim().substring(0, 300) + "..." : text.trim(),
                  inline: false,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "CringeGuard AI Analytics" },
            },
          ],
        }),
      }).catch((err) => console.warn("Discord log failed:", err));
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("API /api/polish error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to analyze post. Please try again later.",
      },
      { status: 500 }
    );
  }
}
