import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

interface PolishResult {
  cringeScore: number;
  oneLineRoast: string;
  rewrites: {
    human: string;
    punchyDev: string;
    proNatural: string;
  };
}

async function generateSampleCringePost(apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Generate a 1-2 sentence performative humblebrag social media post (for LinkedIn/X). Clichés like 4:30 AM start, cold showers, reading 5 books a week. Return ONLY the text in English.`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return res.text?.trim() || "I am humbled to announce that I woke up at 4:30 AM to read 5 books today.";
}

async function analyzePost(apiKey: string, draft: string): Promise<PolishResult> {
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze and rewrite this post:\n"${draft}"`,
    config: {
      systemInstruction: `You are Antidote AI. Output JSON containing cringeScore (0-100), oneLineRoast (sarcastic critique max 15 words), and rewrites (human max 25 words). All in English.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cringeScore: { type: Type.INTEGER },
          oneLineRoast: { type: Type.STRING },
          rewrites: {
            type: Type.OBJECT,
            properties: {
              human: { type: Type.STRING },
              punchyDev: { type: Type.STRING },
              proNatural: { type: Type.STRING },
            },
            required: ["human", "punchyDev", "proNatural"],
          },
        },
        required: ["cringeScore", "oneLineRoast", "rewrites"],
      },
    },
  });

  return JSON.parse(res.text || "{}");
}

async function waitForThreadsContainerReady(creationId: string, accessToken: string): Promise<void> {
  const maxRetries = 15;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const statusRes = await fetch(
        `https://graph.threads.net/v1.0/${creationId}?fields=status,error_message&access_token=${accessToken}`
      );
      const data = await statusRes.json();
      const status = data?.status;
      console.log(`[Threads] Checking container status (${i + 1}/${maxRetries}): ${status || "CHECKING..."}`);

      if (status === "FINISHED" || status === "PUBLISHED") {
        return;
      }
      if (status === "ERROR") {
        throw new Error(`Threads media processing error: ${data?.error_message || "Unknown"}`);
      }
    } catch (e: any) {
      if (e.message?.includes("Threads media processing error")) throw e;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function postToThreads(threadText: string): Promise<string> {
  const threadsUserId = process.env.THREADS_USER_ID;
  const accessToken = process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!threadsUserId || !accessToken) {
    throw new Error("THREADS_USER_ID or THREADS_ACCESS_TOKEN / META_ACCESS_TOKEN is not configured.");
  }

  console.log(`[Threads] Creating container (Length: ${threadText.length} chars)...`);
  const createRes = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=TEXT&text=${encodeURIComponent(
      threadText
    )}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const createData = await createRes.json();
  const creationId = createData?.id;

  if (!creationId) {
    throw new Error(`Failed to create Threads container: ${JSON.stringify(createData)}`);
  }

  console.log(`[Threads] Container created (${creationId}). Polling status...`);
  await waitForThreadsContainerReady(creationId, accessToken);

  console.log(`[Threads] Publishing post...`);
  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const publishData = await publishRes.json();
  const threadsPostId = publishData?.id;

  if (!threadsPostId) {
    throw new Error(`Failed to publish Threads post: ${JSON.stringify(publishData)}`);
  }

  console.log(`[Threads] Successfully published post! Post ID: ${threadsPostId}`);
  return threadsPostId;
}

async function sendDiscordNotification(score: number, roast: string, postId: string) {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
  if (!discordUrl) return;

  try {
    await fetch(discordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🚀 [Threads Auto-Marketing] New Viral Post Published!",
            color: 0x00b9fe,
            fields: [
              { name: "🚩 Cringe Score", value: `${score}%`, inline: true },
              { name: "🤡 AI Roast", value: roast, inline: false },
              { name: "📲 Threads Post ID", value: postId, inline: true },
              { name: "🔗 Landing URL", value: "https://de-cringe.vercel.app", inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "DeCringe Auto Marketing Agent" },
          },
        ],
      }),
    });
    console.log("🔔 Discord notification sent successfully!");
  } catch (err) {
    console.warn("Discord notification failed:", err);
  }
}

async function runAutoMarketing() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }

  console.log("⚡ Starting DeCringe Automated Threads Marketing Agent...");

  // 1. Generate sample cringe post
  const draftText = await generateSampleCringePost(apiKey);

  // 2. Analyze with DeCringe AI
  const analysis = await analyzePost(apiKey, draftText);

  // 3. Format Threads post with strict 480 char length limit
  const draftPreview = draftText.length > 90 ? draftText.substring(0, 90) + "..." : draftText;
  const roastPreview = analysis.oneLineRoast.length > 90 ? analysis.oneLineRoast.substring(0, 90) + "..." : analysis.oneLineRoast;
  const humanRewrite = analysis.rewrites.human.length > 110 ? analysis.rewrites.human.substring(0, 110) + "..." : analysis.rewrites.human;

  const threadsContent = `☣️ LinkedIn Cringe of the Day

📝 Original: "${draftPreview}"
🚩 Cringe Score: ${analysis.cringeScore}%
🤡 AI Roast: "${roastPreview}"

💡 Human Rewrite:
"${humanRewrite}"

👉 Fix your post: https://de-cringe.vercel.app

#buildinpublic #AI #DeCringe`;

  console.log("\n--- THREADS POST PREVIEW (Length: " + threadsContent.length + " chars) ---");
  console.log(threadsContent);
  console.log("-----------------------------------------------\n");

  // 4. Post to Threads & notify Discord
  if (process.env.THREADS_USER_ID && (process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN)) {
    const postId = await postToThreads(threadsContent);
    await sendDiscordNotification(analysis.cringeScore, analysis.oneLineRoast, postId);
    console.log("🎉 Marketing automation complete! Threads Post ID:", postId);
  } else {
    console.log("⚠️ THREADS_USER_ID or THREADS_ACCESS_TOKEN not found. Preview generated successfully!");
  }
}

runAutoMarketing().catch((err) => {
  console.error("❌ Marketing Agent Error:", err);
  process.exit(1);
});
