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

const PRESET_CRINGE_SAMPLES = [
  {
    draft: "Woke up at 4:30 AM, cold shower, 10-mile run, 3 books read. All before breakfast. Stay hungry, stay humble.",
    analysis: {
      cringeScore: 98,
      oneLineRoast: "Predicting your own sainthood by 7:00 AM is a bold strategy.",
      rewrites: {
        human: "Had an early morning workout and read a bit before work.",
        punchyDev: "Up early, did cardio and reading.",
        proNatural: "Enjoying early morning routines for better focus.",
      },
    },
  },
  {
    draft: "Humbled and honored to announce that I have been named Top 10 Thought Leaders in Synergy Strategy for 2026!",
    analysis: {
      cringeScore: 95,
      oneLineRoast: "Nothing screams humble quite like awarding yourself a self-made title.",
      rewrites: {
        human: "Excited to share a recent recognition for my work in strategy.",
        punchyDev: "Got recognized for recent strategy projects.",
        proNatural: "Grateful for the recent industry recognition.",
      },
    },
  },
  {
    draft: "I rejected a $1M offer today to stay true to my passion. Here's what taking risks taught me about leadership...",
    analysis: {
      cringeScore: 99,
      oneLineRoast: "A 10-part thread on turning down money nobody actually offered you.",
      rewrites: {
        human: "Decided to focus on my current project instead of other offers.",
        punchyDev: "Sticking to current roadmap over new proposals.",
        proNatural: "Choosing focus over short-term financial opportunities.",
      },
    },
  },
];

async function generateSampleCringePost(apiKey: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a 1-2 sentence performative humblebrag social media post (for LinkedIn/X). Clichés like 4:30 AM start, cold showers, reading 5 books a week. Return ONLY the text in English.`;

    const res = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    return res.text?.trim() || PRESET_CRINGE_SAMPLES[0].draft;
  } catch (err: any) {
    console.warn("⚠️ Gemini API generation failed (using fallback sample):", err.message);
    const randomIndex = Math.floor(Math.random() * PRESET_CRINGE_SAMPLES.length);
    return PRESET_CRINGE_SAMPLES[randomIndex].draft;
  }
}

async function analyzePost(apiKey: string, draft: string): Promise<PolishResult> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-flash-latest",
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
  } catch (err: any) {
    console.warn("⚠️ Gemini API analysis failed (using fallback analysis):", err.message);
    const matched = PRESET_CRINGE_SAMPLES.find((s) => s.draft === draft);
    return matched ? matched.analysis : PRESET_CRINGE_SAMPLES[0].analysis;
  }
}

/* ==================== THREADS AUTOMATION ==================== */
async function waitForThreadsContainerReady(creationId: string, accessToken: string): Promise<void> {
  const maxRetries = 20;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const statusRes = await fetch(
        `https://graph.threads.net/v1.0/${creationId}?fields=status,error_message&access_token=${accessToken}`
      );
      const data = await statusRes.json();
      const status = data?.status;
      console.log(`[Threads] Checking container status (${i + 1}/${maxRetries}): ${status || "CHECKING..."}`);

      if (status === "FINISHED" || status === "PUBLISHED") {
        await new Promise((r) => setTimeout(r, 3000));
        return;
      }
      if (status === "ERROR") {
        throw new Error(`Threads media processing error: ${data?.error_message || "Unknown"}`);
      }
    } catch (e: any) {
      if (e.message?.includes("Threads media processing error")) throw e;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

async function postToThreadsSingleAttempt(threadText: string): Promise<string> {
  const threadsUserId = process.env.THREADS_USER_ID;
  const accessToken = process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!threadsUserId || !accessToken) {
    throw new Error("THREADS_USER_ID or THREADS_ACCESS_TOKEN is not configured.");
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

  return threadsPostId;
}

async function postToThreads(threadText: string): Promise<string> {
  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Threads] Attempting post (${attempt}/${maxAttempts})...`);
      const postId = await postToThreadsSingleAttempt(threadText);
      console.log(`[Threads] Successfully published post! Post ID: ${postId}`);
      return postId;
    } catch (err: any) {
      lastError = err;
      console.warn(`⚠️ [Threads] Attempt ${attempt} failed: ${err.message || err}`);
      if (attempt < maxAttempts) {
        console.log("[Threads] Waiting 5 seconds before retrying...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  throw lastError || new Error("Failed to publish post to Threads.");
}

/* ==================== BLUESKY AUTOMATION ==================== */
async function postToBluesky(postContent: string): Promise<string> {
  const handle = process.env.BSKY_HANDLE;
  const password = process.env.BSKY_APP_PASSWORD;

  if (!handle || !password) {
    throw new Error("BSKY_HANDLE or BSKY_APP_PASSWORD is not configured.");
  }

  console.log(`[Bluesky] Logging in as ${handle}...`);
  const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: handle,
      password: password,
    }),
  });
  const sessionData = await sessionRes.json();

  if (!sessionData.accessJwt || !sessionData.did) {
    throw new Error(`Bluesky login failed: ${JSON.stringify(sessionData)}`);
  }

  console.log(`[Bluesky] Session created. Publishing post...`);
  const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionData.accessJwt}`,
    },
    body: JSON.stringify({
      repo: sessionData.did,
      collection: "app.bsky.feed.post",
      record: {
        $type: "app.bsky.feed.post",
        text: postContent,
        createdAt: new Date().toISOString(),
      },
    }),
  });
  const postData = await postRes.json();

  if (!postData.uri) {
    throw new Error(`Bluesky post creation failed: ${JSON.stringify(postData)}`);
  }

  console.log(`[Bluesky] Successfully published post! URI: ${postData.uri}`);
  return postData.uri;
}

/* ==================== DISCORD NOTIFIER ==================== */
async function sendDiscordNotification(score: number, roast: string, threadsPostId?: string, bskyUri?: string) {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
  
  if (!discordUrl) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL is missing from environment variables. Skipping Discord notification.");
    return;
  }

  console.log("🔔 Sending Discord Notification...");
  try {
    const fields = [
      { name: "🚩 Cringe Score", value: `${score}%`, inline: true },
      { name: "🤡 AI Roast", value: roast, inline: false },
      { name: "🔗 Landing URL", value: "https://de-cringe.vercel.app", inline: false },
    ];

    fields.push({
      name: "📲 Threads Status",
      value: threadsPostId ? `Posted (ID: ${threadsPostId})` : "Skipped / Not Configured",
      inline: true,
    });

    fields.push({
      name: "🦋 Bluesky Status",
      value: bskyUri ? "Posted Successfully" : "Skipped / Not Configured",
      inline: true,
    });

    const res = await fetch(discordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🚀 [Global Auto-Marketing] Daily Viral Content Report",
            color: 0x00b9fe,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: "DeCringe Auto Marketing Agent" },
          },
        ],
      }),
    });
    
    if (res.ok) {
      console.log("✅ Discord notification sent successfully!");
    } else {
      const errText = await res.text();
      console.error(`❌ Discord Webhook failed with status ${res.status}:`, errText);
    }
  } catch (err) {
    console.error("❌ Discord notification exception:", err);
  }
}

/* ==================== MAIN AGENT ==================== */
async function runAutoMarketing() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "fallback_key";

  console.log("⚡ Starting DeCringe Automated Global Marketing Agent (Threads + Bluesky)...");

  // 1. Generate sample cringe post
  const draftText = await generateSampleCringePost(apiKey);

  // 2. Analyze with DeCringe AI
  const analysis = await analyzePost(apiKey, draftText);

  // 3. Format post with strict 280-480 char length limit
  const draftPreview = draftText.length > 80 ? draftText.substring(0, 80) + "..." : draftText;
  const roastPreview = analysis.oneLineRoast.length > 80 ? analysis.oneLineRoast.substring(0, 80) + "..." : analysis.oneLineRoast;
  const humanRewrite = analysis.rewrites.human.length > 100 ? analysis.rewrites.human.substring(0, 100) + "..." : analysis.rewrites.human;

  const postContent = `MB☣️ LinkedIn Cringe of the Day

📝 Original: "${draftPreview}"
🚩 Cringe Score: ${analysis.cringeScore}%
🤡 AI Roast: "${roastPreview}"

💡 Human Rewrite:
"${humanRewrite}"

👉 Fix your post: https://de-cringe.vercel.app

#buildinpublic #AI #DeCringe`;

  console.log("\n--- POST PREVIEW (Length: " + postContent.length + " chars) ---");
  console.log(postContent);
  console.log("-----------------------------------------------\n");

  let threadsPostId: string | undefined;
  let bskyUri: string | undefined;

  // 4. Post to Threads if configured
  if (process.env.THREADS_USER_ID && (process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN)) {
    try {
      threadsPostId = await postToThreads(postContent);
    } catch (err: any) {
      console.error("❌ Threads Posting Error:", err.message);
    }
  } else {
    console.log("ℹ️ THREADS credentials not set. Skipping Threads.");
  }

  // 5. Post to Bluesky if configured
  if (process.env.BSKY_HANDLE && process.env.BSKY_APP_PASSWORD) {
    try {
      bskyUri = await postToBluesky(postContent);
    } catch (err: any) {
      console.error("❌ Bluesky Posting Error:", err.message);
    }
  } else {
    console.log("ℹ️ BSKY_HANDLE or BSKY_APP_PASSWORD not set. Skipping Bluesky.");
  }

  // 6. ALWAYS Notify Discord
  await sendDiscordNotification(analysis.cringeScore, analysis.oneLineRoast, threadsPostId, bskyUri);
  console.log("🎉 Global marketing automation run completed!");
}

runAutoMarketing().catch((err) => {
  console.error("❌ Marketing Agent Error:", err);
  process.exit(1);
});
