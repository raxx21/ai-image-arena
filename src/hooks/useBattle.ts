"use client";

import { useState, useCallback, useRef } from "react";
import {
  BattleState,
  ImagePrompt,
  GeneratedImage,
  RoundJudgment,
  RoundResult,
  ModelMapping,
} from "@/lib/types";
import { MODELS, MODEL_DISPLAY_NAMES } from "@/lib/constants";

function createModelMapping(): ModelMapping {
  const swapped = Math.random() > 0.5;
  return {
    A: swapped ? MODELS.GEMINI_FLASH : MODELS.GPT_IMAGE,
    B: swapped ? MODELS.GPT_IMAGE : MODELS.GEMINI_FLASH,
    nameA: swapped
      ? MODEL_DISPLAY_NAMES[MODELS.GEMINI_FLASH]
      : MODEL_DISPLAY_NAMES[MODELS.GPT_IMAGE],
    nameB: swapped
      ? MODEL_DISPLAY_NAMES[MODELS.GPT_IMAGE]
      : MODEL_DISPLAY_NAMES[MODELS.GEMINI_FLASH],
  };
}

function createInitialState(): BattleState {
  return {
    phase: "idle",
    prompts: [],
    rounds: [],
    modelMapping: createModelMapping(),
    currentJudgingRound: -1,
    error: null,
  };
}

export function useBattle() {
  const [state, setState] = useState<BattleState>(createInitialState);
  // Keep a ref to the model mapping so async functions can read it
  const mappingRef = useRef<ModelMapping>(state.modelMapping);
  // Keep a ref to track generated images
  const roundsRef = useRef<RoundResult[]>([]);

  const startBattle = useCallback(async (testMode = false) => {
    // Create fresh mapping for this battle
    const mapping = createModelMapping();
    mappingRef.current = mapping;

    setState((prev) => ({
      ...prev,
      phase: "generating-prompts",
      error: null,
      modelMapping: mapping,
    }));

    try {
      // Step 1: Generate prompts
      const numRounds = testMode ? 1 : 5;
      const promptRes = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numRounds }),
      });
      if (!promptRes.ok) throw new Error("Failed to generate prompts");
      const { prompts } = (await promptRes.json()) as {
        prompts: ImagePrompt[];
      };

      // In test mode, only use the first prompt
      const activePrompts = testMode ? prompts.slice(0, 1) : prompts;

      const rounds: RoundResult[] = activePrompts.map((p: ImagePrompt) => ({
        prompt: p,
        imageA: null,
        imageB: null,
        judgment: null,
      }));

      roundsRef.current = rounds;

      setState((prev) => ({
        ...prev,
        prompts: activePrompts,
        rounds,
        phase: "generating-images",
      }));

      // Step 2: Generate all images in parallel
      const imagePromises = activePrompts.flatMap(
        (prompt: ImagePrompt, index: number) => [
          generateImage(prompt.text, "A", index, mapping),
          generateImage(prompt.text, "B", index, mapping),
        ]
      );

      await Promise.allSettled(imagePromises);

      // Step 3: Judge each round sequentially
      setState((prev) => ({ ...prev, phase: "judging" }));

      // Small delay so state settles
      await new Promise((r) => setTimeout(r, 200));

      const finalRounds = roundsRef.current;

      for (let i = 0; i < finalRounds.length; i++) {
        setState((prev) => ({ ...prev, currentJudgingRound: i }));

        const round = finalRounds[i];
        if (!round.imageA || !round.imageB) {
          continue;
        }

        try {
          const judgeRes = await fetch("/api/judge-round", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: round.prompt.text,
              imageA: round.imageA.dataUrl,
              imageB: round.imageB.dataUrl,
            }),
          });

          if (judgeRes.ok) {
            const { judgment } = (await judgeRes.json()) as {
              judgment: RoundJudgment;
            };
            roundsRef.current = roundsRef.current.map((r, idx) =>
              idx === i ? { ...r, judgment } : r
            );
            setState((prev) => {
              const newRounds = [...prev.rounds];
              newRounds[i] = { ...newRounds[i], judgment };
              return { ...prev, rounds: newRounds };
            });
          }
        } catch (err) {
          console.error(`Failed to judge round ${i}:`, err);
        }
      }

      setState((prev) => ({ ...prev, phase: "complete" }));
    } catch (err) {
      console.error("Battle error:", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Something went wrong",
        phase: "idle",
      }));
    }

    async function generateImage(
      promptText: string,
      side: "A" | "B",
      roundIndex: number,
      mapping: ModelMapping
    ) {
      try {
        const modelId = side === "A" ? mapping.A : mapping.B;

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelId, prompt: promptText }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Image generation failed");
        }

        const image = (await res.json()) as GeneratedImage;

        // Update ref for judging phase
        roundsRef.current = roundsRef.current.map((r, idx) => {
          if (idx !== roundIndex) return r;
          return side === "A" ? { ...r, imageA: image } : { ...r, imageB: image };
        });

        // Update state for UI
        setState((prev) => {
          const newRounds = [...prev.rounds];
          const key = side === "A" ? "imageA" : "imageB";
          newRounds[roundIndex] = { ...newRounds[roundIndex], [key]: image };
          return { ...prev, rounds: newRounds };
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Generation failed";
        console.error(`Image gen failed for round ${roundIndex} side ${side}:`, err);
        const errorKey = side === "A" ? "errorA" : "errorB";
        roundsRef.current = roundsRef.current.map((r, idx) =>
          idx !== roundIndex ? r : { ...r, [errorKey]: errorMsg }
        );
        setState((prev) => {
          const newRounds = [...prev.rounds];
          newRounds[roundIndex] = { ...newRounds[roundIndex], [errorKey]: errorMsg };
          return { ...prev, rounds: newRounds };
        });
      }
    }
  }, []);

  const reset = useCallback(() => {
    const newState = createInitialState();
    mappingRef.current = newState.modelMapping;
    roundsRef.current = [];
    setState(newState);
  }, []);

  return { state, startBattle, reset };
}
