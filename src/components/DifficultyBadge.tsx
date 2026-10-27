import React from "react";
import { DifficultyRating } from "@/types/guide";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: DifficultyRating;
  className?: string;
  showExplanation?: boolean;
  explanationSummary?: string;
}

export function DifficultyBadge({
  difficulty,
  className,
  showExplanation = false,
  explanationSummary,
}: DifficultyBadgeProps) {
  const styles: Record<DifficultyRating, { bg: string; text: string; border: string; dot: string }> = {
    Easy: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    Moderate: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      dot: "bg-amber-400",
    },
    Complex: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
      dot: "bg-orange-400",
    },
    "Very Complex": {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      dot: "bg-rose-400",
    },
  };

  const style = styles[difficulty] || styles.Moderate;

  return (
    <div className="inline-flex flex-col">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
          style.bg,
          style.text,
          style.border,
          className
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
        {difficulty}
      </span>
      {showExplanation && explanationSummary && (
        <span className="text-[11px] text-slate-400 mt-1 max-w-sm">{explanationSummary}</span>
      )}
    </div>
  );
}
