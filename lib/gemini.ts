import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PolishResult {
  cringeScore: number;
  oneLineRoast: string;
  rewrites: {
    human: string;
    punchyDev: string;
    proNatural: string;
  };
}

export async function analyzeAndPolishPost(userDraft: string): Promise<PolishResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `You are "Antidote," a seasoned, witty, anti-cringe communications expert and writing coach for independent developers and tech professionals. You loathe corporate speak, humble-bragging, and overly performant 'LinkedIn-style' posts.

Your goal is to take a user's drafted social media post (usually for LinkedIn or X) and:
1. Roast it: Critically analyze it for obnoxiousness, humble-bragging, and "LinkedIn-ness."
2. Rewrite it: Provide 3 new, authentic, genuinely human versions.

Input Text:
"""
${userDraft}
"""

Your Analysis (JSON Output Only):
Respond ONLY with a valid, raw JSON object (no markdown code blocks, no trailing comments, no text outside JSON) with the following structure:
{
  "cringeScore": <number between 0 and 100 based on obnoxious level>,
  "oneLineRoast": "<string: a sarcastic, witty one-sentence critique>",
  "rewrites": {
    "human": "<string: 100% casual, normal coffee-shop human tone>",
    "punchyDev": "<string: short, direct, value-focused tech X/Twitter tone>",
    "proNatural": "<string: professional but authentic and relatable tone>"
  }
}

Tone Guide for Rewrites:
* NEVER: Use "Here are some takeaways...", "I am humbled to share...", "A quick thread...", "What's your view?", "Let's dive in", "Agree?".
* NEVER: Be overly generic, buzzword-heavy, or performant.
* ALWAYS: Be genuine. Share a story. Be vulnerable without performative humility. Use plain English. Short sentences. Be direct. If sharing success, do it factually and share the specific effort, not just the emotion. If sharing a failure, share the specific learning. Ensure all text in the rewrites is 100% English.`;

  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash if model identifier differs in API region
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean JSON string in case of extra whitespace or code block wrappers
      const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed: PolishResult = JSON.parse(cleanedJson);

      // Validate schema
      if (
        typeof parsed.cringeScore === "number" &&
        typeof parsed.oneLineRoast === "string" &&
        parsed.rewrites &&
        typeof parsed.rewrites.human === "string" &&
        typeof parsed.rewrites.punchyDev === "string" &&
        typeof parsed.rewrites.proNatural === "string"
      ) {
        // Ensure score is clamped between 0 and 100
        parsed.cringeScore = Math.min(100, Math.max(0, Math.round(parsed.cringeScore)));
        return parsed;
      }
    } catch (err) {
      console.warn(`Attempt with ${modelName} failed:`, err);
      lastError = err;
    }
  }

  throw new Error(`Gemini API processing failed: ${lastError?.message || "Invalid JSON returned"}`);
}
