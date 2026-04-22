export type BattlePhase =
  | "idle"
  | "generating-prompts"
  | "generating-images"
  | "judging"
  | "complete";

export interface ImagePrompt {
  id: number;
  text: string;
  category: string;
}

export interface GeneratedImage {
  dataUrl: string;
  timeMs: number;
  cost?: number;
}

export interface FailedImage {
  error: string;
  timeMs: number;
}

export interface RoundResult {
  prompt: ImagePrompt;
  imageA: GeneratedImage | null;
  imageB: GeneratedImage | null;
  errorA?: string;
  errorB?: string;
  judgment: RoundJudgment | null;
}

export interface RoundJudgment {
  scoreA: number; // 1-10
  scoreB: number; // 1-10
  creativityA: number;
  creativityB: number;
  qualityA: number;
  qualityB: number;
  adherenceA: number;
  adherenceB: number;
  winner: "A" | "B" | "tie";
  reasoning: string;
}

export interface ModelMapping {
  A: string; // actual model ID
  B: string;
  nameA: string; // display name
  nameB: string;
}

export interface BattleState {
  phase: BattlePhase;
  prompts: ImagePrompt[];
  rounds: RoundResult[];
  modelMapping: ModelMapping;
  currentJudgingRound: number;
  error: string | null;
}
