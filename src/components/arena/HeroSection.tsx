"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BattlePhase } from "@/lib/types";

interface HeroSectionProps {
  phase: BattlePhase;
  onStart: (testMode?: boolean) => void;
  error: string | null;
}

export function HeroSection({ phase, onStart, error }: HeroSectionProps) {
  const isIdle = phase === "idle";

  return (
    <motion.section
      layout
      className={`flex flex-col items-center justify-center text-center ${
        isIdle ? "min-h-[80vh] gap-8" : "py-8 gap-4"
      }`}
    >
      <motion.div layout className="space-y-4">
        <motion.h1
          layout
          className={`font-bold tracking-tight ${
            isIdle ? "text-5xl md:text-7xl" : "text-2xl md:text-3xl"
          }`}
        >
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            AI Image Arena
          </span>
        </motion.h1>

        {isIdle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Two image models enter. One champion emerges.
            <br />
            <span className="text-sm">
              Claude Opus generates prompts, both models create images, and Opus
              judges the results.
            </span>
          </motion.p>
        )}
      </motion.div>

      {isIdle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={() => onStart(false)}
              className="text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 cursor-pointer"
            >
              Start Battle (5 Rounds)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(true)}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Test Run (1 Round)
            </Button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}
        </motion.div>
      )}

      {!isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-sm text-muted-foreground"
        >
          <StepDot active={phase === "generating-prompts"} done={phase !== "generating-prompts"} />
          <span className={phase === "generating-prompts" ? "text-foreground" : ""}>Prompts</span>
          <span className="text-border">{">"}</span>
          <StepDot active={phase === "generating-images"} done={phase === "judging" || phase === "complete"} />
          <span className={phase === "generating-images" ? "text-foreground" : ""}>Images</span>
          <span className="text-border">{">"}</span>
          <StepDot active={phase === "judging"} done={phase === "complete"} />
          <span className={phase === "judging" ? "text-foreground" : ""}>Judging</span>
          <span className="text-border">{">"}</span>
          <StepDot active={false} done={phase === "complete"} />
          <span className={phase === "complete" ? "text-foreground" : ""}>Results</span>
        </motion.div>
      )}
    </motion.section>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full transition-colors ${
        active
          ? "bg-violet-500 animate-pulse"
          : done
          ? "bg-green-500"
          : "bg-muted"
      }`}
    />
  );
}
