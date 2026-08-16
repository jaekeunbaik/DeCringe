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

async function postToThreadsSingleAttempt(threadText: string, replyText?: string): Promise<{ postId: string; replyId?: string }> {
  const threadsUserId = process.env.THREADS_USER_ID;
  const accessToken = process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!threadsUserId || !accessToken) {
    throw new Error("THREADS_USER_ID or THREADS_ACCESS_TOKEN is not configured.");
  }

  // 1. Publish Main Post
  console.log(`[Threads] Creating main container (Length: ${threadText.length} chars)...`);
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

  console.log(`[Threads] Main container created (${creationId}). Polling status...`);
  await waitForThreadsContainerReady(creationId, accessToken);

  console.log(`[Threads] Publishing main post...`);
  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const publishData = await publishRes.json();
  const threadsPostId = publishData?.id;

  if (!threadsPostId) {
    throw new Error(`Failed to publish Threads post: ${JSON.stringify(publishData)}`);
  }

  console.log(`[Threads] Main post published! ID: ${threadsPostId}`);

  // 2. Publish Reply Comment (if provided)
  let replyId: string | undefined;
  if (replyText) {
    await new Promise((r) => setTimeout(r, 2000));
    console.log(`[Threads] Creating reply comment container for post ID ${threadsPostId}...`);
    
    const createReplyRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=TEXT&text=${encodeURIComponent(
        replyText
      )}&reply_to_id=${threadsPostId}&access_token=${accessToken}`,
      { method: "POST" }
    );
    const createReplyData = await createReplyRes.json();
    const replyCreationId = createReplyData?.id;

    if (replyCreationId) {
      console.log(`[Threads] Reply container created (${replyCreationId}). Polling status...`);
      await waitForThreadsContainerReady(replyCreationId, accessToken);

      console.log(`[Threads] Publishing reply comment...`);
      const publishReplyRes = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${replyCreationId}&access_token=${accessToken}`,
        { method: "POST" }
      );
      const publishReplyData = await publishReplyRes.json();
      replyId = publishReplyData?.id;
      if (replyId) {
        console.log(`[Threads] ✅ Reply comment published successfully! Reply ID: ${replyId}`);
      }
    } else {
      console.warn("⚠️ [Threads] Failed to create reply container:", JSON.stringify(createReplyData));
    }
  }

  return { postId: threadsPostId, replyId };
}

async function postToThreads(threadText: string, replyText?: string): Promise<{ postId: string; replyId?: string }> {
  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Threads] Attempting post (${attempt}/${maxAttempts})...`);
      const res = await postToThreadsSingleAttempt(threadText, replyText);
      console.log(`[Threads] Successfully published post & reply!`);
      return res;
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

/* ==================== BLUESKY AUTOMATION WITH FACETS & REPLIES ==================== */
function parseBlueskyFacets(text: string) {
  const facets: any[] = [];
  const encoder = new TextEncoder();

  // 1. Match URLs for clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const prefix = text.substring(0, match.index);
    const startByte = encoder.encode(prefix).length;
    const endByte = startByte + encoder.encode(url).length;

    facets.push({
      index: { byteStart: startByte, byteEnd: endByte },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: url,
        },
      ],
    });
  }

  // 2. Match Hashtags
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_]+)/g;
  while ((match = tagRegex.exec(text)) !== null) {
    const fullTagStr = match[0].trimStart();
    const tagWord = match[1];
    const matchIndex = match.index + (match[0].length - fullTagStr.length);
    const prefix = text.substring(0, matchIndex);
    const startByte = encoder.encode(prefix).length;
    const endByte = startByte + encoder.encode(fullTagStr).length;

    facets.push({
      index: { byteStart: startByte, byteEnd: endByte },
      features: [
        {
          $type: "app.bsky.richtext.facet#tag",
          tag: tagWord,
        },
      ],
    });
  }

  return facets;
}

async function postToBluesky(postContent: string, replyContent?: string): Promise<string> {
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

  const facets = parseBlueskyFacets(postContent);
  console.log(`[Bluesky] Publishing main post with ${facets.length} rich text facets...`);

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
        facets: facets,
        createdAt: new Date().toISOString(),
      },
    }),
  });
  const postData = await postRes.json();

  if (!postData.uri || !postData.cid) {
    throw new Error(`Bluesky post creation failed: ${JSON.stringify(postData)}`);
  }

  console.log(`[Bluesky] Main post published! URI: ${postData.uri}`);

  // Publish reply comment if provided
  if (replyContent) {
    await new Promise((r) => setTimeout(r, 1000));
    const replyFacets = parseBlueskyFacets(replyContent);
    console.log(`[Bluesky] Publishing reply comment...`);

    const replyRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
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
          text: replyContent,
          facets: replyFacets,
          reply: {
            root: { uri: postData.uri, cid: postData.cid },
            parent: { uri: postData.uri, cid: postData.cid },
          },
          createdAt: new Date().toISOString(),
        },
      }),
    });
    const replyData = await replyRes.json();
    if (replyData.uri) {
      console.log(`[Bluesky] ✅ Reply comment published! URI: ${replyData.uri}`);
    }
  }

  return postData.uri;
}

/* ==================== DISCORD NOTIFIER ==================== */
async function sendDiscordNotification(score: number, roast: string, threadsPostId?: string, bskyUri?: string, errorMessage?: string) {
  // 성공 시에는 디스코드 알림을 건너뛰고, 오직 업로드 실패/오류 발생 시에만 알림 발송
  const isSuccess = Boolean(threadsPostId || bskyUri) && !errorMessage;
  if (isSuccess) {
    console.log("✨ [DeCringe] 마케팅 자동화 성공 완료! (성공 시 알림 생략, 실패 시에만 발송)");
    return;
  }

  const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
  
  if (!discordUrl) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL is missing from environment variables. Skipping Discord notification.");
    return;
  }

  console.log("🚨 [DeCringe] 마케팅 자동화 실패/경고 감지 -> 디스코드로 실패 알림 전송 중...");
  try {
    const fields = [
      { name: "🚩 Cringe Score", value: `${score}%`, inline: true },
      { name: "🤡 AI Roast", value: roast, inline: false },
      { name: "🔗 Landing URL", value: "https://de-cringe.vercel.app", inline: false },
    ];

    fields.push({
      name: "📲 Threads Status",
      value: threadsPostId ? `✅ Posted (ID: ${threadsPostId})` : "❌ 실패 / 제외",
      inline: true,
    });

    fields.push({
      name: "🦋 Bluesky Status",
      value: bskyUri ? "✅ Posted (With Hyperlinks)" : "❌ 실패 / 제외",
      inline: true,
    });

    if (errorMessage) {
      fields.push({
        name: "⚠️ 에러 메시지",
        value: `\`\`\`${errorMessage.substring(0, 300)}\`\`\``,
        inline: false,
      });
    }

    const res = await fetch(discordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "🚨 [DeCringe] 글로벌 마케팅 자동 포스팅 실패 리포트",
            color: 0xff0055,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: "DeCringe Marketing Secretary • 오류 발생 알림" },
          },
        ],
      }),
    });
    
    if (res.ok) {
      console.log("✅ Discord failure notification sent successfully!");
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

  let draftText = "";
  let analysis: any = { cringeScore: 85, oneLineRoast: "Self-proclaimed thought leader alert.", rewrites: { human: "" } };
  let threadsResult: { postId: string; replyId?: string } | undefined;
  let bskyUri: string | undefined;
  let hasError = false;
  let errorMsg = "";

  try {
    // 1. Generate sample cringe post
    draftText = await generateSampleCringePost(apiKey);

    // 2. Analyze with DeCringe AI
    analysis = await analyzePost(apiKey, draftText);

    // 3. Format MAIN post (NO LINK for maximum algorithmic reach!)
    const draftPreviewThreads = draftText.length > 80 ? draftText.substring(0, 80) + "..." : draftText;
    const roastPreviewThreads = analysis.oneLineRoast.length > 80 ? analysis.oneLineRoast.substring(0, 80) + "..." : analysis.oneLineRoast;
    const humanRewriteThreads = analysis.rewrites.human.length > 100 ? analysis.rewrites.human.substring(0, 100) + "..." : analysis.rewrites.human;

    const threadsPostContent = `☣️ LinkedIn Cringe of the Day

📝 Original: "${draftPreviewThreads}"
🚩 Cringe Score: ${analysis.cringeScore}%
🤡 AI Roast: "${roastPreviewThreads}"

💡 Human Rewrite:
"${humanRewriteThreads}"

#buildinpublic #AI #DeCringe #JobSeekers`;

    // Reply content containing the landing link
    const threadsReplyContent = `👉 Fix your cringe posts & resumes with AI for free:
https://de-cringe.vercel.app`;

    // 4. Format Bluesky post
    const draftPreviewBsky = draftText.length > 55 ? draftText.substring(0, 55) + "..." : draftText;
    const roastPreviewBsky = analysis.oneLineRoast.length > 55 ? analysis.oneLineRoast.substring(0, 55) + "..." : analysis.oneLineRoast;

    const bskyPostContent = `☣️ Cringe of the Day

📝 "${draftPreviewBsky}"
🚩 Score: ${analysis.cringeScore}%
🤡 Roast: "${roastPreviewBsky}"

#buildinpublic #AI #DeCringe`;

    const bskyReplyContent = `👉 Fix your post with DeCringe AI: https://de-cringe.vercel.app`;

    console.log("\n--- THREADS MAIN POST PREVIEW ---");
    console.log(threadsPostContent);
    console.log("\n--- THREADS REPLY COMMENT PREVIEW ---");
    console.log(threadsReplyContent);
    console.log("-----------------------------------------------\n");

    // 5. Post to Threads if configured
    if (process.env.THREADS_USER_ID && (process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN)) {
      try {
        threadsResult = await postToThreads(threadsPostContent, threadsReplyContent);
      } catch (err: any) {
        console.error("❌ Threads Posting Error:", err.message);
        hasError = true;
        errorMsg += `Threads Error: ${err.message}\n`;
      }
    } else {
      console.log("ℹ️ THREADS credentials not set. Skipping Threads.");
    }

    // 6. Post to Bluesky if configured
    if (process.env.BSKY_HANDLE && process.env.BSKY_APP_PASSWORD) {
      try {
        bskyUri = await postToBluesky(bskyPostContent, bskyReplyContent);
      } catch (err: any) {
        console.error("❌ Bluesky Posting Error:", err.message);
        hasError = true;
        errorMsg += `Bluesky Error: ${err.message}\n`;
      }
    } else {
      console.log("ℹ️ BSKY_HANDLE or BSKY_APP_PASSWORD not set. Skipping Bluesky.");
    }

  } catch (err: any) {
    hasError = true;
    errorMsg = err.message || String(err);
    console.error("❌ Marketing Execution Error:", err);
  }

  // 7. Notify Discord ONLY if there was an error or all failed
  await sendDiscordNotification(
    analysis.cringeScore,
    analysis.oneLineRoast,
    threadsResult?.postId,
    bskyUri,
    hasError ? errorMsg : undefined
  );

  console.log("🎉 Global marketing automation run completed!");
}

runAutoMarketing().catch((err) => {
  console.error("❌ Marketing Agent Critical Error:", err);
  process.exit(1);
});
