import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";
import { PROMPT_MODEL } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const numRounds = body.numRounds || 5;

    const { text } = await generateText({
      model: openrouter(PROMPT_MODEL),
      maxOutputTokens: 2000,
      prompt: `You are a creative director for an AI image generation competition. Generate exactly ${numRounds} diverse, creative image prompts that will test different capabilities of image generation models.

Each prompt should test a different aspect (pick ${numRounds} from this list):
1. Photorealistic scene with complex lighting
2. Artistic/painterly style with emotion
3. Fantasy/sci-fi concept with intricate details
4. Abstract or surreal composition
5. Character/portrait with specific mood

Return ONLY a JSON array with exactly ${numRounds} objects, each with "id" (1-${numRounds}), "text" (the detailed prompt, 1-2 sentences), and "category" (brief category label like "Photorealism", "Artistic", "Fantasy", "Abstract", "Portrait").

Example format:
[{"id": 1, "text": "A lighthouse on a rocky cliff during a violent thunderstorm, with lightning illuminating the churning sea below", "category": "Photorealism"}]

Return ONLY the JSON array, no other text.`,
    });

    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const prompts = JSON.parse(cleaned);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Prompt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prompts" },
      { status: 500 }
    );
  }
}
