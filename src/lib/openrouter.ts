import { createOpenAI } from "@ai-sdk/openai";

const provider = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

// Use .chat() to force chat completions API (not /responses which OpenRouter doesn't support)
export function openrouter(modelId: string) {
  return provider.chat(modelId);
}

export async function generateImageViaOpenRouter(
  modelId: string,
  prompt: string
): Promise<{ dataUrl: string; timeMs: number; cost?: number }> {
  // GPT image models use the /images/generations endpoint
  if (modelId.startsWith("openai/")) {
    return generateGPTImage(modelId, prompt);
  }
  // Gemini and others use chat completions with modalities
  return generateViaChat(modelId, prompt);
}

async function generateGPTImage(
  modelId: string,
  prompt: string
): Promise<{ dataUrl: string; timeMs: number; cost?: number }> {
  const start = Date.now();

  // Strip the "openai/" prefix for the images endpoint
  const openaiModel = modelId.replace("openai/", "");

  const response = await fetch(
    "https://openrouter.ai/api/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    }
  );

  const timeMs = Date.now() - start;
  const data = await response.json();

  if (!response.ok || data.error) {
    const msg = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`GPT image generation failed: ${msg}`);
  }

  console.log("GPT image response keys:", JSON.stringify(Object.keys(data)));

  // Standard OpenAI images response: { data: [{ b64_json: "..." }] }
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    return { dataUrl: `data:image/png;base64,${b64}`, timeMs };
  }

  const url = data.data?.[0]?.url;
  if (url) {
    return { dataUrl: url, timeMs };
  }

  throw new Error(
    `No image in GPT response. Keys: ${JSON.stringify(Object.keys(data))}`
  );
}

async function generateViaChat(
  modelId: string,
  prompt: string
): Promise<{ dataUrl: string; timeMs: number; cost?: number }> {
  const start = Date.now();

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: `Generate an image: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter image generation failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const timeMs = Date.now() - start;

  // Check for error in response body (OpenRouter sometimes returns 200 with error)
  if (data.error) {
    throw new Error(
      `OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`
    );
  }

  const choice = data.choices?.[0]?.message;
  if (!choice) {
    throw new Error("No message in OpenRouter response");
  }

  // Extract cost from usage data
  const cost: number | undefined = data.usage?.cost;

  // Search recursively for base64 image data in the response
  const imageUrl = findImageInResponse(data);
  if (imageUrl) {
    return { dataUrl: imageUrl, timeMs, cost };
  }

  throw new Error(
    `No image found in OpenRouter response. Message keys: ${JSON.stringify(Object.keys(choice))}`
  );
}

/**
 * Recursively search the OpenRouter response for image data.
 * Different models return images in wildly different formats.
 */
function findImageInResponse(obj: unknown, depth = 0): string | null {
  if (depth > 10) return null;
  if (!obj || typeof obj !== "object") return null;

  const record = obj as Record<string, unknown>;

  for (const [key, val] of Object.entries(record)) {
    if (typeof val === "string") {
      if (val.startsWith("data:image")) return val;
      if (
        (key === "b64_json" || key === "data" || key === "b64" || key === "base64") &&
        val.length > 1000
      ) {
        return `data:image/png;base64,${val}`;
      }
      if (
        (key === "url" || key === "image_url" || key === "image") &&
        (val.startsWith("http") || val.startsWith("data:"))
      ) {
        return val;
      }
    }
  }

  // image_url object pattern
  if (record.type === "image_url" && typeof record.image_url === "object" && record.image_url) {
    const iu = record.image_url as Record<string, unknown>;
    if (typeof iu.url === "string") return iu.url;
  }

  // Google inline_data pattern
  if (typeof record.inline_data === "object" && record.inline_data) {
    const id = record.inline_data as Record<string, unknown>;
    if (typeof id.data === "string" && typeof id.mime_type === "string") {
      return `data:${id.mime_type};base64,${id.data}`;
    }
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findImageInResponse(item, depth + 1);
      if (found) return found;
    }
  } else {
    for (const val of Object.values(record)) {
      if (typeof val === "object" && val !== null) {
        const found = findImageInResponse(val, depth + 1);
        if (found) return found;
      }
    }
  }

  return null;
}
