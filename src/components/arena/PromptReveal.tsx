"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ImagePrompt } from "@/lib/types";

interface PromptRevealProps {
  prompts: ImagePrompt[];
  visible: boolean;
}

export function PromptReveal({ prompts, visible }: PromptRevealProps) {
  if (!visible || prompts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-muted-foreground">
        Battle Prompts
      </h2>
      <div className="grid gap-3">
        {prompts.map((prompt, i) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-4"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-mono font-bold">
              {prompt.id}
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="text-xs">
                {prompt.category}
              </Badge>
              <p className="text-sm leading-relaxed">{prompt.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
