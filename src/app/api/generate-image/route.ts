import { generateImageViaOpenRouter } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { modelId, prompt } = await request.json();

    if (!modelId || !prompt) {
      return NextResponse.json(
        { error: "modelId and prompt are required" },
        { status: 400 }
      );
    }

    const result = await generateImageViaOpenRouter(modelId, prompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
