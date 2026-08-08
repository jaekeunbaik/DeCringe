import { GoogleGenAI, Type } from "@google/genai";

export interface PolishResult {
  cringeScore: number;
  oneLineRoast: string;
  rewrites: {
    human: string;
    punchyDev: string;
    proNatural: string;
  };
}

const getAiClient = () => {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    const envKeys = Object.keys(process.env).filter(
      (k) =>
        k.toUpperCase().includes("GEMINI") ||
        k.toUpperCase().includes("KEY") ||
        k.startsWith("VITE_") ||
        k.startsWith("NEXT_PUBLIC_")
    );
    console.error("Available ENV keys:", envKeys);
    throw new Error(
      `GEMINI_API_KEY is not configured in Vercel Environment Variables. Please add GEMINI_API_KEY in your Vercel Dashboard (Project Settings -> Environment Variables) and click Redeploy.`
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export async function analyzeAndPolishPost(userDraft: string): Promise<PolishResult> {
  const ai = getAiClient();

  const systemInstruction = `You are "Antidote," a seasoned, witty, anti-cringe communications expert and writing coach for independent developers and tech professionals. You loathe corporate speak, humble-bragging, and overly performant 'LinkedIn-style' posts.

Your goal is to take a user's drafted social media post (usually for LinkedIn or X) and:
1. Roast it: Critically analyze it for obnoxiousness, humble-bragging, and "LinkedIn-ness."
2. Rewrite it: Provide 3 new, authentic, genuinely human versions.

Tone Guide for Rewrites:
* NEVER: Use "Here are some takeaways...", "I am humbled to share...", "A quick thread...", "What's your view?", "Let's dive in", "Agree?".
* NEVER: Be overly generic, buzzword-heavy, or performant.
* ALWAYS: Be genuine. Share a story. Be vulnerable without performative humility. Use plain English. Short sentences. Be direct. If sharing success, do it factually and share the specific effort, not just the emotion. If sharing a failure, share the specific learning. Ensure all text in the rewrites is 100% English.`;

  const prompt = `Analyze and rewrite the following social media post draft:

"""
${userDraft}
"""`;

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
  let response: any = null;
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cringeScore: {
                type: Type.INTEGER,
                description: "A number between 0 and 100 indicating cringe/humblebrag level",
              },
              oneLineRoast: {
                type: Type.STRING,
                description: "A sarcastic, witty one-sentence critique of why the original is cringe",
              },
              rewrites: {
                type: Type.OBJECT,
                properties: {
                  human: {
                    type: Type.STRING,
                    description: "100% casual, normal coffee-shop human tone",
                  },
                  punchyDev: {
                    type: Type.STRING,
                    description: "Short, direct, value-focused tech X/Twitter tone",
                  },
                  proNatural: {
                    type: Type.STRING,
                    description: "Professional but authentic and relatable tone",
                  },
                },
                required: ["human", "punchyDev", "proNatural"],
              },
            },
            required: ["cringeScore", "oneLineRoast", "rewrites"],
          },
          temperature: 0.7,
        },
      });
      if (response && response.text) break;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API Warning] Model ${model} failed, trying fallback:`, err.message);
    }
  }

  if (!response) {
    throw lastError || new Error("Failed to process post with Gemini API.");
  }

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Empty response received from Gemini API.");
  }

  const parsed: PolishResult = JSON.parse(responseText);

  // Ensure cringeScore bounds
  parsed.cringeScore = Math.min(100, Math.max(0, Math.round(parsed.cringeScore || 0)));

  return parsed;
}
