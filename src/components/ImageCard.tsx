"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneratedImage } from "@/lib/types";

interface ImageCardProps {
  label: string;
  image: GeneratedImage | null;
  error?: string;
  isWinner?: boolean;
  isLoser?: boolean;
  showTime?: boolean;
}

export function ImageCard({
  label,
  image,
  error,
  isWinner,
  isLoser,
  showTime,
}: ImageCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {showTime && image && (
            <span className="text-xs font-mono text-muted-foreground">
              {(image.timeMs / 1000).toFixed(1)}s
            </span>
          )}
          {showTime && image?.cost != null && (
            <span className="text-xs font-mono text-emerald-500">
              ${image.cost.toFixed(4)}
            </span>
          )}
        </div>
      </div>
      <div
        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-500 ${
          error
            ? "border-destructive/40 bg-destructive/5"
            : isWinner
            ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            : isLoser
            ? "border-border/30 opacity-70"
            : "border-border/50"
        }`}
      >
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <span className="text-2xl">⚠️</span>
            <p className="text-xs text-destructive font-medium">Generation Failed</p>
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-3">
              {error.replace(/^OpenRouter error: /, "")}
            </p>
          </motion.div>
        ) : image ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            src={image.dataUrl}
            alt={`${label} generated image`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Skeleton className="w-full h-full absolute inset-0" />
            <span className="relative text-xs text-muted-foreground animate-pulse z-10">
              Generating...
            </span>
          </div>
        )}
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full"
          >
            WINNER
          </motion.div>
        )}
      </div>
    </div>
  );
}
