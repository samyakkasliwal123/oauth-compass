"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Lock,
} from "lucide-react";

const STAGES = [
  { id: "identifying", label: "Identifying provider & platform identity" },
  { id: "researching", label: "Researching official documentation & API references" },
  { id: "checking", label: "Checking requirements, scopes & approval policies" },
  { id: "building", label: "Building structured guide & effort model" },
  { id: "validating", label: "Validating sources & verifying factual claims" },
];

function GenerateGuideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [appNameOrUrl, setAppNameOrUrl] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [distributionGoal, setDistributionGoal] = useState<"personal" | "internal" | "public">("internal");
  const [dataAccessGoal, setDataAccessGoal] = useState<"read_only" | "read_write">("read_write");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setAppNameOrUrl(q);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNameOrUrl.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setCurrentStageIndex(0);
    setStatusMessage("Validating URL safety and inspecting provider identity...");

    // Simulated progress stage transitions while backend executes
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          const next = prev + 1;
          setStatusMessage(STAGES[next].label);
          return next;
        }
        return prev;
      });
    }, 700);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNameOrUrl: appNameOrUrl.trim(),
          userGoal: userGoal.trim() || undefined,
          distributionGoal,
          dataAccessGoal,
        }),
      });

      clearInterval(interval);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate guide");
      }

      setCurrentStageIndex(STAGES.length - 1);
      setStatusMessage("Guide successfully verified and persisted!");

      // Route to generated persistent guide
      setTimeout(() => {
        router.push(json.guideUrl || `/guides/${json.data.id}`);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred during research.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
      {isSubmitting ? (
        /* Progress view */
        <div className="py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white">Researching {appNameOrUrl}</h3>
            <p className="text-xs text-indigo-300 font-medium">{statusMessage}</p>
          </div>

          {/* Progress Steps List */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 text-xs p-2.5 rounded-lg border transition-all ${
                    isDone
                      ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-300"
                      : isCurrent
                      ? "border-indigo-500/40 bg-indigo-950/40 text-white font-medium"
                      : "border-slate-800/40 bg-slate-950/20 text-slate-500"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{stage.label}</span>
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
                  Check that the target URL is a public HTTP/HTTPS endpoint or enter the platform name directly.
                </p>
              </div>
            </div>
          )}

          {/* App Name or Website URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>App Name or Official Website URL *</span>
              <span className="text-[11px] text-slate-400 font-normal">SSRF Protected</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={appNameOrUrl}
                onChange={(e) => setAppNameOrUrl(e.target.value)}
                placeholder="e.g. GitHub, Airtable, linear.app, or https://discord.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Private IPs, localhost, cloud metadata endpoints, and non-HTTP protocols are blocked for security.
            </p>
          </div>

          {/* Integration Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              What do you want your AI agent to do? <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g., Read repository commit history, create issue tickets from customer chats, or update CRM records..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Distribution & Data Access Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Distribution Scope</label>
              <select
                value={distributionGoal}
                onChange={(e) => setDistributionGoal(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="personal">Personal Use (Single Developer)</option>
                <option value="internal">Internal Team / Single Workspace</option>
                <option value="public">Public Commercial Product (Multi-Tenant)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Data Access Goal</label>
              <select
                value={dataAccessGoal}
                onChange={(e) => setDataAccessGoal(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="read_write">Read & Write (Standard Agent)</option>
                <option value="read_only">Read-Only (Analytics & Search)</option>
              </select>
            </div>
          </div>

          {/* Security notice */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Privacy & Credential Guarantee: </strong>
              OAuth Compass never asks for or stores OAuth client secrets, user access tokens, or private credentials. Output is stored in persistent URL identifiers.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !appNameOrUrl.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Begin Research & Generate Guide</span>
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
            Live Research & Setup Agent
          </div>
          <h1 className="text-3xl font-extrabold text-white">Generate an OAuth Setup Guide</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Submit any unfamiliar SaaS application or developer portal URL. Our research agent will audit its official OAuth requirements, redirect URI constraints, and verification policies.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 text-sm">
              Loading generator...
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
