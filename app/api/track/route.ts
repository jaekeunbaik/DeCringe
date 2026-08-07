import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const referer = req.headers.get("referer") || "Direct Access / Bookmark";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    
    // Clean device preview
    let device = "Desktop / Web";
    if (/mobile/i.test(userAgent)) device = "Mobile Device 📱";
    if (/android/i.test(userAgent)) device = "Android Mobile 📱";
    if (/iphone|ipad/i.test(userAgent)) device = "iPhone / iOS 📱";

    const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "👀 [실시간 방문자 접속] DeCringe에 새로운 유저가 들어왔습니다!",
              color: 0x3b82f6,
              fields: [
                { name: "🔗 유입 경로 (Referer)", value: referer, inline: false },
                { name: "💻 접속 기기", value: device, inline: true },
                { name: "🌐 서비스 URL", value: "https://de-cringe.vercel.app", inline: true },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "DeCringe Realtime Visitor Monitor" },
            },
          ],
        }),
      }).catch((err) => console.warn("Visitor log failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
