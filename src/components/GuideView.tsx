"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OAuthGuide } from "@/types/guide";
import { DifficultyBadge } from "./DifficultyBadge";
import { ManagedAuthBanner } from "./ManagedAuthBanner";
import { ChecklistProgress } from "./ChecklistProgress";
import { EvidenceTracker } from "./EvidenceTracker";
import { ShareModal } from "./ShareModal";
import { IssueReportModal } from "./IssueReportModal";
import {
  Clock,
  Hourglass,
  ArrowLeft,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flag,
  Sparkles,
  Info,
  Terminal,
  FileCode,
  CheckCircle,
} from "lucide-react";

interface GuideViewProps {
  guide: OAuthGuide;
  isPersistentShare?: boolean;
}

export function GuideView({ guide, isPersistentShare = false }: GuideViewProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              App Directory
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">{guide.appName}</span>
            {guide.isSeeded && (
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Verified Seed Guide
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Share Guide</span>
            </button>

            <button
              onClick={() => setIssueModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              title="Report an issue or outdated information"
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Guide Header Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {guide.logoUrl ? (
                <img
                  src={guide.logoUrl}
                  alt={guide.appName}
                  className="h-16 w-16 rounded-2xl object-contain bg-slate-800 p-2 border border-slate-700/80 shadow-md shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-bold text-xl shrink-0">
                  {guide.appName.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {guide.appName} OAuth Setup Guide
                  </h1>
                  <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/60">
                    {guide.category}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Provider: <strong className="text-slate-300">{guide.providerName}</strong> • Official Website:{" "}
                  <a
                    href={guide.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    {guide.websiteUrl.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-xs text-slate-500 pt-1">
                  Last verified: {new Date(guide.lastUpdated).toLocaleDateString()} • Research version: {guide.researchVersion}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <DifficultyBadge
                difficulty={guide.difficulty}
                showExplanation
                explanationSummary={guide.difficultyExplanation.overallSummary}
              />
            </div>
          </div>

          {/* Effort vs External Wait Time Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            {/* Active Effort */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Clock className="h-4 w-4" />
                Active Developer Effort
              </div>
              <div className="text-xl font-bold text-white">
                {guide.activeEffortMinutes.displayString}
              </div>
              <p className="text-[11px] text-slate-400">
                {guide.activeEffortMinutes.developerTasksSummary}
              </p>
            </div>

            {/* External Wait Time */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Hourglass className="h-4 w-4" />
                External Approval Delay
              </div>
              <div className="text-xl font-bold text-white">
                {guide.externalWaitTime.status === "instant"
                  ? "Instant (0 Days)"
                  : guide.externalWaitTime.summary}
              </div>
              <p className="text-[11px] text-slate-400">
                {guide.externalWaitTime.explanation}
              </p>
            </div>

            {/* Total Planning Horizon */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <Info className="h-4 w-4 text-indigo-400" />
                Total Planning Horizon
              </div>
              <div className="text-xl font-bold text-slate-200">
                {guide.externalWaitTime.status === "instant"
                  ? "Same-Day Deployment"
                  : guide.externalWaitTime.extendedDays
                  ? `Up to ${guide.externalWaitTime.extendedDays} days`
                  : "Dependent on Provider"}
              </div>
              <p className="text-[11px] text-slate-400">
                Active effort + external verification queue and rework buffers.
              </p>
            </div>
          </div>
        </div>

        {/* Managed Auth vs Custom App Evaluation */}
        <ManagedAuthBanner managedAuth={guide.managedAuth} appName={guide.appName} />

        {/* Overview & Intended Use Case */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-base font-bold text-white">Integration Overview & Intended Use Case</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{guide.overview}</p>
          <div className="rounded-lg bg-slate-950/60 p-3 text-xs border border-slate-800/80 text-slate-300">
            <strong className="text-indigo-300">Target AI Agent Use Case: </strong>
            {guide.intendedUseCase}
          </div>
        </div>

        {/* Prerequisites */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-base font-bold text-white">Prerequisites Before You Begin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {guide.prerequisites.map((prereq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200">{prereq.title}</h4>
                  {prereq.isMandatory && (
                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed">{prereq.description}</p>
                {prereq.accountTypeRequired && (
                  <span className="text-[10px] text-indigo-400 block pt-1 font-mono">
                    Required: {prereq.accountTypeRequired}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Checklist with Local Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Actionable Setup Checklist</h2>
            <span className="text-xs text-slate-400">
              Labeled with AI agent vs developer responsibilities
            </span>
          </div>
          <ChecklistProgress guideId={guide.id} steps={guide.steps} />
        </div>

        {/* Console Navigation Instructions */}
        {guide.consoleNavigation && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-400" />
                Console Navigation: {guide.consoleNavigation.consoleName}
              </h2>
              {guide.consoleNavigation.directUrl && (
                <a
                  href={guide.consoleNavigation.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  Direct Console URL <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Path:</span>
              {guide.consoleNavigation.navigationPath.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-medium text-slate-200 border border-slate-700">
                    {step}
                  </span>
                  {idx < guide.consoleNavigation!.navigationPath.length - 1 && (
                    <span className="text-slate-600 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Key Fields Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Format Rule</th>
                    <th className="py-2.5 px-3">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {guide.consoleNavigation.keyFields.map((field, i) => (
                    <tr key={i} className="hover:bg-slate-900/30">
                      <td className="py-2.5 px-3 font-semibold text-indigo-300">{field.fieldName}</td>
                      <td className="py-2.5 px-3">{field.description}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{field.formatRule}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">{field.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Redirect URI Rules & Scope Guidance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Redirect URI Rules */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="h-4 w-4 text-indigo-400" />
              Redirect URI Rules & Validation
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              {guide.redirectUriRules.rules.map((rule, i) => (
                <li key={i} className="leading-relaxed">{rule}</li>
              ))}
            </ul>
            <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-400 border border-slate-800">
              <strong className="text-slate-200">Provider Specific Note: </strong>
              {guide.redirectUriRules.notes}
            </div>
          </div>

          {/* Testing vs Production */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Testing vs Production Considerations
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <strong className="text-indigo-300 block mb-1">Development & Testing Mode:</strong>
                <p className="leading-relaxed text-slate-400">{guide.testingVsProduction.testingNotes}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <strong className="text-emerald-300 block mb-1">Production Readiness:</strong>
                <p className="leading-relaxed text-slate-400">{guide.testingVsProduction.productionNotes}</p>
              </div>
              {guide.testingVsProduction.userCapsOrLimits && (
                <div className="rounded-lg bg-amber-950/20 border border-amber-500/20 p-2.5 text-amber-300 text-[11px]">
                  <strong>User Limits / Cap: </strong>
                  {guide.testingVsProduction.userCapsOrLimits}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scope Guidance Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Scope & Permission Minimization (Least Privilege)</h3>
            <p className="text-xs text-slate-400 mt-1">{guide.scopeGuidance.principleExplanation}</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Scope Name</th>
                  <th className="py-2.5 px-3">Scope Type</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Least Privilege Alternative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {guide.scopeGuidance.scopes.map((scope, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/30">
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">{scope.name}</td>
                    <td className="py-2.5 px-3 capitalize">{scope.type}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          scope.riskLevel === "high"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : scope.riskLevel === "medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {scope.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{scope.description}</td>
                    <td className="py-2.5 px-3 text-slate-400 italic">
                      {scope.leastPrivilegeAlternative || "None (already optimal)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Common Blockers & Remedies */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Common Blockers and Prescribed Remedies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {guide.commonBlockers.map((blocker, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{blocker.issue}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Symptoms: </strong>
                  <span className="text-slate-400">{blocker.symptoms}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Root Cause: </strong>
                  <span className="text-slate-400">{blocker.cause}</span>
                </div>
                <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-2.5 text-emerald-300">
                  <strong>Remedy: </strong>
                  {blocker.remedy}
                </div>
                <div className="text-[11px] text-indigo-400">
                  <strong>Agent Help: </strong>
                  {blocker.agentAssistance}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence & Source Transparency Audit */}
        <EvidenceTracker
          sources={guide.sources}
          claims={guide.claims}
          appName={guide.appName}
        />
      </div>

      {/* Share Modal */}
      <ShareModal
        guide={guide}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Issue Report Modal */}
      <IssueReportModal
        guideName={guide.appName}
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />
    </div>
  );
}
