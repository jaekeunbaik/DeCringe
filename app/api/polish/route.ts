import { NextRequest, NextResponse } from "next/server";
import { analyzeAndPolishPost } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body;

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

    const result = await analyzeAndPolishPost(text.trim());

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
