"use client";

import React, { useState, useEffect } from "react";
import { SetupStep } from "@/types/guide";
import { ResponsibilityBadge } from "./ResponsibilityBadge";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle, ExternalLink, ShieldCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistProgressProps {
  guideId: string;
  steps: SetupStep[];
}

export function ChecklistProgress({ guideId, steps }: ChecklistProgressProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    [steps[0]?.id || ""]: true, // first step open by default
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `oauth_compass_progress_${guideId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read localStorage for checklist:", e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  const toggleComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save checklist to localStorage:", e);
      }
      return next;
    });
  };

  const toggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const resetProgress = () => {
    if (confirm("Reset all step progress for this guide?")) {
      setCompletedSteps({});
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn("Could not clear localStorage:", e);
      }
    }
  };

  const completedCount = steps.filter((s) => completedSteps[s.id]).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Setup Checklist Progress</h3>
              <span className="text-xs font-bold text-indigo-400">
                {completedCount} of {steps.length} completed ({progressPercent}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Progress is stored locally in your browser for this device.
            </p>
          </div>

          {completedCount > 0 && (
            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="h-3 w-3" />
              Reset checklist
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completedSteps[step.id];
          const isOpen = expandedSteps[step.id];

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-xl border transition-all duration-200",
                isDone
                  ? "border-emerald-500/30 bg-emerald-950/10"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              )}
            >
              {/* Step Header */}
              <div className="flex items-start sm:items-center justify-between p-4 gap-3">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleComplete(step.id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 focus:outline-none transition-colors shrink-0"
                    aria-label={`Mark step ${step.order} as ${isDone ? "incomplete" : "complete"}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0" onClick={() => toggleExpand(step.id)}>
                    <div className="flex flex-wrap items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-slate-500">Step {step.order}</span>
                      <h4
                        className={cn(
                          "text-sm font-semibold truncate",
                          isDone ? "text-slate-300 line-through opacity-80" : "text-white"
                        )}
                      >
                        {step.title}
                      </h4>
                      <ResponsibilityBadge responsibility={step.responsibility} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(step.id)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  aria-label={isOpen ? "Collapse step details" : "Expand step details"}
                >
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Step Body */}
              {isOpen && (
                <div className="border-t border-slate-800/80 p-4 pt-3 space-y-3.5 text-xs text-slate-300 bg-slate-950/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-200">What to do:</span>
                      <p className="leading-relaxed text-slate-300">{step.whatToDo}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-200">Why it matters:</span>
                      <p className="leading-relaxed text-slate-400">{step.whyItMatters}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-200">Where to do it:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-300">{step.whereToDo}</span>
                        {step.whereUrl && (
                          <a
                            href={step.whereUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 underline text-[11px]"
                          >
                            Open Console <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-200">Information needed:</span>
                      <div className="flex flex-wrap gap-1">
                        {step.informationNeeded.map((info, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300 border border-slate-700/60"
                          >
                            {info}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        How to know it is complete:
                      </span>
                      <p className="text-slate-300">{step.howToVerifyComplete}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        What to do if it fails:
                      </span>
                      <p className="text-slate-300">{step.failureRemedies}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div>
                      <strong className="text-slate-300">Responsibility rationale: </strong>
                      {step.responsibilityReason}
                    </div>

                    {step.safeCheckAvailable && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        {step.safeCheckDescription || "Safe check available"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
