import React, { useState } from "react";
import { ManagedAuthEvaluation } from "@/types/guide";
import { Sparkles, Check, HelpCircle, ChevronDown, ChevronUp, ExternalLink, Zap } from "lucide-react";

interface ManagedAuthBannerProps {
  managedAuth: ManagedAuthEvaluation;
  appName: string;
}

export function ManagedAuthBanner({ managedAuth, appName }: ManagedAuthBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Zap className="h-3 w-3 text-indigo-400" />
              {managedAuth.isAvailable ? "Composio Managed OAuth Available" : "Bring Your Own App Required"}
            </span>
            <span className="text-xs text-slate-400">Integration Architecture Evaluation</span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {managedAuth.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span>{expanded ? "Hide Architecture Comparison" : "Compare Managed vs Custom"}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-900/60 p-3 text-xs text-slate-300 border border-slate-800/80">
        <strong className="text-indigo-300">Recommendation: </strong>
        {managedAuth.recommendation}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-3.5">
            <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <Check className="h-4 w-4" />
              Benefits of Managed OAuth
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {managedAuth.tradeoffs.pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-amber-950/20 border border-amber-900/40 p-3.5">
            <h4 className="font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
              <HelpCircle className="h-4 w-4" />
              Trade-offs / Limitations
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {managedAuth.tradeoffs.cons.map((con, i) => (
                <li key={i}>{con}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3.5">
            <h4 className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4" />
              When You Need a Custom App
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {managedAuth.tradeoffs.whenToUseCustom.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
