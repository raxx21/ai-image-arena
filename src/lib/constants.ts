export const NUM_ROUNDS = 5;

export const MODELS = {
  GPT_IMAGE: "openai/gpt-5.4-image-2",
  GEMINI_FLASH: "google/gemini-3.1-flash-image-preview",
} as const;

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [MODELS.GPT_IMAGE]: "GPT 5.4 Image",
  [MODELS.GEMINI_FLASH]: "Gemini 3.1 Flash Image",
};

export const JUDGE_MODEL = "anthropic/claude-sonnet-4" as const;
export const PROMPT_MODEL = "anthropic/claude-sonnet-4" as const;
