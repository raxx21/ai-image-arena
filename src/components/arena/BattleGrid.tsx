"use client";

import { motion } from "framer-motion";
import { BattleRound } from "./BattleRound";
import { RoundResult } from "@/lib/types";

interface BattleGridProps {
  rounds: RoundResult[];
  currentJudgingRound: number;
  visible: boolean;
}

export function BattleGrid({
  rounds,
  currentJudgingRound,
  visible,
}: BattleGridProps) {
  if (!visible || rounds.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-semibold text-muted-foreground">
        Battle Rounds
      </h2>
      <div className="space-y-6">
        {rounds.map((round, i) => (
          <BattleRound
            key={round.prompt.id}
            round={round}
            index={i}
            isJudging={currentJudgingRound === i}
          />
        ))}
      </div>
    </motion.section>
  );
}
