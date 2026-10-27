"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Lock,
  Layers,
  Palette,
  Users,
} from "lucide-react";

type WorkflowStageId = "searching" | "reviewing" | "generating" | "completed";

interface StageConfig {
  id: WorkflowStageId;
  label: string;
  description: string;
}

const WORKFLOW_STAGES: StageConfig[] = [
  {
    id: "searching",
    label: "Searching official documentation",
    description: "Querying Tavily Search API & safe official provider endpoints",
  },
  {
    id: "reviewing",
    label: "Reviewing evidence",
    description: "Auditing scopes, redirect URI constraints, and approval policies",
  },
  {
    id: "generating",
    label: "Generating guide",
    description: "Synthesizing structured guide with LLM & strict Zod validation",
  },
  {
    id: "completed",
    label: "Completed",
    description: "Guide persisted and ready for viewing & sharing",
  },
];

function GenerateGuideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form inputs
  const [appName, setAppName] = useState("");
  const [appWebsite, setAppWebsite] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [intendedAudience, setIntendedAudience] = useState<"personal" | "internal" | "public">("internal");
  const [brandingRequirement, setBrandingRequirement] = useState<
    "provider_branding_acceptable" | "own_branding_required"
  >("provider_branding_acceptable");

  // Workflow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStage, setActiveStage] = useState<WorkflowStageId>("searching");
  const [completedStages, setCompletedStages] = useState<Set<WorkflowStageId>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      if (/^https?:\/\//i.test(q) || q.includes(".")) {
        setAppWebsite(q.startsWith("http") ? q : `https://${q}`);
        try {
          const host = new URL(q.startsWith("http") ? q : `https://${q}`).hostname;
          const clean = host.replace(/^(www\.|api\.|docs\.|developers\.)/i, "");
          setAppName(clean.split(".")[0].charAt(0).toUpperCase() + clean.split(".")[0].slice(1));
        } catch {
          setAppName(q);
        }
      } else {
        setAppName(q);
        setAppWebsite(`https://${q.toLowerCase().replace(/\s+/g, "")}.com`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appWebsite.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setActiveStage("searching");
    setCompletedStages(new Set());
    setLiveMessage("Initiating network safety checks and live documentation search...");

    try {
      const response = await fetch("/api/research?stream=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          appName: appName.trim(),
          appWebsite: appWebsite.trim(),
          userGoal: userGoal.trim() || "Read and write data on behalf of AI agent",
          intendedAudience,
          brandingRequirement,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.error || `Research request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No readable stream received from research backend");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            setLiveMessage(data.message || "");

            // Map server stage to client stage states
            if (data.stage === "identifying" || data.stage === "searching") {
              setActiveStage("searching");
            } else if (data.stage === "reviewing") {
              setCompletedStages((prev) => new Set(prev).add("searching"));
              setActiveStage("reviewing");
            } else if (data.stage === "generating" || data.stage === "validating") {
              setCompletedStages((prev) => new Set(prev).add("searching").add("reviewing"));
              setActiveStage("generating");
            } else if (data.stage === "completed") {
              setCompletedStages((prev) =>
                new Set(prev).add("searching").add("reviewing").add("generating").add("completed")
              );
              setActiveStage("completed");

              // Redirect after displaying completion confirmation
              if (data.guideUrl) {
                setTimeout(() => {
                  router.push(data.guideUrl);
                }, 800);
              }
            }
          } catch (parseErr: any) {
            if (parseErr.message && !parseErr.message.includes("JSON")) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Live research flow failed:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred during research.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
      {isSubmitting ? (
        /* Progress view with real server stage tracking */
        <div className="py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white">Live Researching {appName}</h3>
            <p className="text-xs text-indigo-300 font-medium h-4">{liveMessage}</p>
          </div>

          {/* Workflow Stages List */}
          <div className="space-y-3 pt-4 border-t border-slate-800 max-w-md mx-auto">
            {WORKFLOW_STAGES.map((stage) => {
              const isDone = completedStages.has(stage.id);
              const isCurrent = activeStage === stage.id && !isDone;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3.5 text-xs p-3 rounded-xl border transition-all ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : isCurrent
                      ? "border-indigo-500/40 bg-indigo-950/40 text-white font-medium"
                      : "border-slate-800/50 bg-slate-950/30 text-slate-500"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold">{stage.label}</div>
                    <div className="text-[11px] text-slate-400">{stage.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold text-rose-200">Research Interrupted:</strong>
                <p>{errorMessage}</p>
                <p className="text-[11px] text-rose-400/80">
                  Ensure the website URL is a public HTTP/HTTPS endpoint. Private IPs and localhost are blocked by SSRF rules.
                </p>
              </div>
            </div>
          )}

          {/* App Name and Website Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">App Name *</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Linear, Strava, Asana, Stripe"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>App Website *</span>
                <span className="text-[10px] text-emerald-400 font-normal">SSRF Protected</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={appWebsite}
                  onChange={(e) => setAppWebsite(e.target.value)}
                  placeholder="e.g. https://linear.app or strava.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* AI Agent Capability Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              What the AI agent needs to do *
            </label>
            <textarea
              rows={2}
              required
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. Read workspace files, create issue tickets from customer chats, or send notifications..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Intended Audience and Branding Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Intended Audience</span>
              </label>
              <select
                value={intendedAudience}
                onChange={(e) => setIntendedAudience(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="personal">Personal / Developer Solo Use</option>
                <option value="internal">Internal Team / Single Workspace</option>
                <option value="public">Public Commercial Users (Multi-Tenant)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-indigo-400" />
                <span>Branding Requirement</span>
              </label>
              <select
                value={brandingRequirement}
                onChange={(e) => setBrandingRequirement(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="provider_branding_acceptable">
                  Provider Branding Acceptable (Fastest; Managed OAuth)
                </option>
                <option value="own_branding_required">
                  Own Branding Required (BYO OAuth App Console Setup)
                </option>
              </select>
            </div>
          </div>

          {/* Security & Data Privacy Notice */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Privacy & Credential Guarantee: </strong>
              OAuth Compass performs research autonomously using official documentation and Tavily search. It never asks for, accepts, or stores private OAuth client secrets.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !appName.trim() || !appWebsite.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Research and generate guide</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function GenerateGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Live Research & Setup Assistant
          </div>
          <h1 className="text-3xl font-extrabold text-white">Research & Generate OAuth Guide</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Enter an unfamiliar application and website. Our research backend audits official developer documentation, extracts scope taxonomies, evaluates approval wait times, and creates a verified setup guide.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 text-sm">
              Loading research form...
            </div>
          }
        >
          <GenerateGuideForm />
        </Suspense>

        {/* Quick Example Links */}
        <div className="text-center space-y-2 text-xs text-slate-400">
          <p>Or browse verified preloaded guides:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Slack", "Notion", "Google Drive", "HubSpot"].map((name) => (
              <Link
                key={name}
                href={`/apps/${name.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 hover:text-white hover:border-slate-700 transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
