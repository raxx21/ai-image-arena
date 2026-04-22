import { JUDGE_MODEL } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageA, imageB } = await request.json();

    if (!prompt || !imageA || !imageB) {
      return NextResponse.json(
        { error: "prompt, imageA, and imageB are required" },
        { status: 400 }
      );
    }

    // Use raw fetch to OpenRouter for judging with images
    // This gives us more control over the multimodal request format
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: JUDGE_MODEL,
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are an expert art critic and AI image quality judge. You're comparing two AI-generated images that were both created from the same prompt.

Prompt: "${prompt}"

Evaluate both images (Image A = first image, Image B = second image) on these criteria (score 1-10 each):
- Creativity: originality, artistic interpretation
- Quality: technical quality, detail, coherence
- Adherence: how well it matches the prompt

Then determine the overall winner.

Return ONLY a JSON object with this exact structure:
{
  "scoreA": <overall score 1-10>,
  "scoreB": <overall score 1-10>,
  "creativityA": <1-10>,
  "creativityB": <1-10>,
  "qualityA": <1-10>,
  "qualityB": <1-10>,
  "adherenceA": <1-10>,
  "adherenceB": <1-10>,
  "winner": "<A or B or tie>",
  "reasoning": "<2-3 sentence explanation>"
}

Return ONLY the JSON, no other text.`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageA },
                },
                {
                  type: "image_url",
                  image_url: { url: imageB },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Judge API error:", response.status, errorText.slice(0, 500));
      throw new Error(`Judge API failed (${response.status})`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Judge response error:", data.error);
      throw new Error(data.error.message || "Judge returned error");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in judge response");
    }

    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const judgment = JSON.parse(cleaned);

    return NextResponse.json({ judgment });
  } catch (error) {
    console.error("Judging error:", error);
    return NextResponse.json(
      { error: "Failed to judge round" },
      { status: 500 }
    );
  }
}
