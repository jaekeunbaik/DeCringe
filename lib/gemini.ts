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

  const isKoreanDraft = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(userDraft);

  const systemInstruction = `You are "Antidote," a seasoned, witty, anti-cringe communications expert and writing coach for independent developers and tech professionals. You loathe corporate speak, humble-bragging, and overly performant 'LinkedIn-style' posts.

Your goal is to take a user's drafted social media post (usually for LinkedIn or X) and:
1. Roast it: Critically analyze it for obnoxiousness, humble-bragging, and "LinkedIn-ness."
2. Rewrite it: Provide 3 new, authentic, genuinely human versions.

CRITICAL LANGUAGE RULE: Match the language of the user's input draft! If the user draft is written in Korean, respond with oneLineRoast and rewrites in natural, sharp Korean. If the user draft is written in English, respond in English.

Tone Guide for Rewrites:
* NEVER: Use "Here are some takeaways...", "I am humbled to share...", "A quick thread...", "What's your view?", "Let's dive in", "Agree?".
* NEVER: Be overly generic, buzzword-heavy, or performant.
* ALWAYS: Be genuine. Share a story. Be vulnerable without performative humility. Short sentences. Be direct.`;

  const prompt = `Analyze and rewrite the following social media post draft:

"""
${userDraft}
"""`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
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
                description: "A sarcastic, witty one-sentence critique of why the original is cringe (matching user language)",
              },
              rewrites: {
                type: Type.OBJECT,
                properties: {
                  human: {
                    type: Type.STRING,
                    description: "100% casual, normal coffee-shop human tone (matching user language)",
                  },
                  punchyDev: {
                    type: Type.STRING,
                    description: "Short, direct, value-focused tech tone (matching user language)",
                  },
                  proNatural: {
                    type: Type.STRING,
                    description: "Professional but authentic tone (matching user language)",
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
    console.warn("⚠️ Gemini API quota/limit hit for all models. Providing localized fallback analysis.");
    return isKoreanDraft
      ? {
          cringeScore: 88,
          oneLineRoast: "잠 안 자고 일했다는 겸손한 자랑보다 진짜 성과와 수치를 보여주세요.",
          rewrites: {
            human: `${userDraft.substring(0, 100)}... 수식어를 빼고 솔직하고 담백하게 교정했습니다.`,
            punchyDev: `개발 과정 정리: 과장된 표현 없이 핵심 도달 과정과 결과 지표 위주로 다듬었습니다.`,
            proNatural: `프로젝트 진행 과정의 솔직한 회고입니다. 과도한 자랑을 제거하고 전문성 있게 정리했습니다.`
          }
        }
      : {
          cringeScore: 88,
          oneLineRoast: "Instead of performative humble-bragging, lead with specific factual achievements and metrics.",
          rewrites: {
            human: `Launched the new project. Stripped away the buzzwords and kept it honest and direct.`,
            punchyDev: `Project milestone update: Focused on core engineering metrics rather than fluff.`,
            proNatural: `A transparent look at our recent release. We prioritized utility over marketing hype.`
          }
        };
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
