"use client";

import { HeroSection } from "@/components/arena/HeroSection";
import { PromptReveal } from "@/components/arena/PromptReveal";
import { BattleGrid } from "@/components/arena/BattleGrid";
import { Scoreboard } from "@/components/arena/Scoreboard";
import { useBattle } from "@/hooks/useBattle";

export default function Home() {
  const { state, startBattle, reset } = useBattle();

  const showPrompts = state.phase !== "idle";
  const showGrid =
    state.phase === "generating-images" ||
    state.phase === "judging" ||
    state.phase === "complete";
  const showScoreboard = state.phase === "complete";

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-16">
      <HeroSection
        phase={state.phase}
        onStart={(testMode) => startBattle(testMode)}
        error={state.error}
      />

      <div className="space-y-12">
        <PromptReveal prompts={state.prompts} visible={showPrompts} />

        <BattleGrid
          rounds={state.rounds}
          currentJudgingRound={state.currentJudgingRound}
          visible={showGrid}
        />

        <Scoreboard
          rounds={state.rounds}
          modelMapping={state.modelMapping}
          visible={showScoreboard}
          onReset={reset}
        />
      </div>
    </main>
  );
}
