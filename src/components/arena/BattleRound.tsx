"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ImageCard } from "@/components/ImageCard";
import { RoundResult } from "@/lib/types";

interface BattleRoundProps {
  round: RoundResult;
  index: number;
  isJudging: boolean;
}

export function BattleRound({ round, index, isJudging }: BattleRoundProps) {
  const { prompt, imageA, imageB, judgment } = round;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="space-y-4 rounded-xl border border-border/50 bg-card/30 p-6"
    >
      {/* Round header */}
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-mono font-bold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="text-xs mb-1">
            {prompt.category}
          </Badge>
          <p className="text-sm text-muted-foreground truncate">
            {prompt.text}
          </p>
        </div>
        {isJudging && !judgment && (
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Judging...
          </div>
        )}
      </div>

      {/* Image pair */}
      <div className="grid grid-cols-2 gap-4">
        <ImageCard
          label="Model A"
          image={imageA}
          error={round.errorA}
          isWinner={judgment?.winner === "A"}
          isLoser={judgment?.winner === "B"}
          showTime
        />
        <ImageCard
          label="Model B"
          image={imageB}
          error={round.errorB}
          isWinner={judgment?.winner === "B"}
          isLoser={judgment?.winner === "A"}
          showTime
        />
      </div>

      {/* Judgment */}
      {judgment && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 pt-3 border-t border-border/30"
        >
          {/* Score bars */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreBreakdown label="Model A" judgment={judgment} side="A" />
            <ScoreBreakdown label="Model B" judgment={judgment} side="B" />
          </div>

          {/* Reasoning */}
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {judgment.reasoning}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function ScoreBreakdown({
  label,
  judgment,
  side,
}: {
  label: string;
  judgment: NonNullable<RoundResult["judgment"]>;
  side: "A" | "B";
}) {
  const isWinner = judgment.winner === side;
  const score = side === "A" ? judgment.scoreA : judgment.scoreB;
  const creativity =
    side === "A" ? judgment.creativityA : judgment.creativityB;
  const quality = side === "A" ? judgment.qualityA : judgment.qualityB;
  const adherence =
    side === "A" ? judgment.adherenceA : judgment.adherenceB;

  return (
    <div
      className={`space-y-2 p-3 rounded-lg ${
        isWinner ? "bg-amber-400/10" : "bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span
          className={`text-lg font-bold font-mono ${
            isWinner ? "text-amber-400" : "text-muted-foreground"
          }`}
        >
          {score}
        </span>
      </div>
      <div className="space-y-1">
        <MiniBar label="Creativity" value={creativity} />
        <MiniBar label="Quality" value={quality} />
        <MiniBar label="Adherence" value={adherence} />
      </div>
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-violet-500"
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">
        {value}
      </span>
    </div>
  );
}
