"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RoundResult, ModelMapping } from "@/lib/types";

interface ScoreboardProps {
  rounds: RoundResult[];
  modelMapping: ModelMapping;
  visible: boolean;
  onReset: () => void;
}

export function Scoreboard({
  rounds,
  modelMapping,
  visible,
  onReset,
}: ScoreboardProps) {
  const [revealed, setRevealed] = useState(false);

  if (!visible) return null;

  const winsA = rounds.filter((r) => r.judgment?.winner === "A").length;
  const winsB = rounds.filter((r) => r.judgment?.winner === "B").length;
  const ties = rounds.filter((r) => r.judgment?.winner === "tie").length;

  const totalScoreA = rounds.reduce(
    (sum, r) => sum + (r.judgment?.scoreA ?? 0),
    0
  );
  const totalScoreB = rounds.reduce(
    (sum, r) => sum + (r.judgment?.scoreB ?? 0),
    0
  );

  const overallWinner =
    winsA > winsB ? "A" : winsB > winsA ? "B" : "tie";

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <Separator />

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Final Results</h2>
        <p className="text-muted-foreground text-sm">
          {rounds.length} rounds completed
        </p>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
        <ScoreColumn
          label={revealed ? modelMapping.nameA : "Model A"}
          wins={winsA}
          totalScore={totalScoreA}
          isWinner={overallWinner === "A"}
          delay={0}
        />
        <ScoreColumn
          label={revealed ? modelMapping.nameB : "Model B"}
          wins={winsB}
          totalScore={totalScoreB}
          isWinner={overallWinner === "B"}
          delay={0.2}
        />
      </div>

      {ties > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {ties} round{ties > 1 ? "s" : ""} tied
        </p>
      )}

      {/* Winner announcement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="text-center py-6"
      >
        {overallWinner === "tie" ? (
          <p className="text-xl font-bold text-muted-foreground">
            It&apos;s a tie!
          </p>
        ) : (
          <p className="text-xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {revealed
                ? overallWinner === "A"
                  ? modelMapping.nameA
                  : modelMapping.nameB
                : `Model ${overallWinner}`}{" "}
              wins!
            </span>
          </p>
        )}
      </motion.div>

      {/* Reveal + Reset buttons */}
      <div className="flex items-center justify-center gap-4">
        {!revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setRevealed(true)}
              className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 cursor-pointer"
            >
              Reveal Model Identities
            </Button>
          </motion.div>
        )}

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="grid grid-cols-2 gap-8 text-sm">
              <RevealCard label="Model A" name={modelMapping.nameA} />
              <RevealCard label="Model B" name={modelMapping.nameB} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={onReset} className="cursor-pointer">
          Start New Battle
        </Button>
      </div>
    </motion.section>
  );
}

function ScoreColumn({
  label,
  wins,
  totalScore,
  isWinner,
  delay,
}: {
  label: string;
  wins: number;
  totalScore: number;
  isWinner: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`text-center p-6 rounded-xl border-2 ${
        isWinner
          ? "border-amber-400/50 bg-amber-400/5"
          : "border-border/50 bg-card/30"
      }`}
    >
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <AnimatedNumber value={wins} className="text-4xl font-bold font-mono" />
      <p className="text-xs text-muted-foreground mt-1">
        round{wins !== 1 ? "s" : ""} won
      </p>
      <Separator className="my-3" />
      <AnimatedNumber
        value={totalScore}
        className="text-lg font-mono text-muted-foreground"
      />
      <p className="text-xs text-muted-foreground">total score</p>
    </motion.div>
  );
}

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionValue, rounded]);

  return <span className={className}>{display}</span>;
}

function RevealCard({ label, name }: { label: string; name: string }) {
  return (
    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="p-4 rounded-lg border border-border/50 bg-card/50"
      style={{ perspective: 1000 }}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-lg bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
        {name}
      </p>
    </motion.div>
  );
}
