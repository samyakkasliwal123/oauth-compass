import React from "react";
import { VerificationStatus } from "@/types/guide";
import { ShieldCheck, Eye, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceStatusBadgeProps {
  status: VerificationStatus;
  confidence?: "high" | "medium" | "low";
  className?: string;
}

export function EvidenceStatusBadge({
  status,
  confidence,
  className,
}: EvidenceStatusBadgeProps) {
  if (status === "verified") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        Verified Fact
        {confidence && <span className="opacity-75">({confidence})</span>}
      </span>
    );
  }

  if (status === "likely" || status === "inferred") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20",
          className
        )}
      >
        <Eye className="h-3 w-3" />
        {status === "likely" ? "Likely / Reasoned" : "Inferred Pattern"}
        {confidence && <span className="opacity-75">({confidence})</span>}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700",
        className
      )}
    >
      <HelpCircle className="h-3 w-3" />
      Unverified / Unknown
    </span>
  );
}
