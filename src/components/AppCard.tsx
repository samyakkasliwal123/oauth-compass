import React from "react";
import Link from "next/link";
import { OAuthGuide } from "@/types/guide";
import { DifficultyBadge } from "./DifficultyBadge";
import { Clock, Hourglass, ShieldCheck, Zap, ArrowRight } from "lucide-react";

interface AppCardProps {
  guide: OAuthGuide;
}

export function AppCard({ guide }: AppCardProps) {
  const verifiedCount = guide.claims.filter((c) => c.verificationStatus === "verified").length;
  const targetHref = guide.isSeeded ? `/apps/${guide.slug}` : `/guides/${guide.id}`;

  return (
    <Link
      href={targetHref}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-200"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {guide.logoUrl ? (
              <img
                src={guide.logoUrl}
                alt={guide.appName}
                className="h-10 w-10 rounded-lg object-contain bg-slate-800 p-1 border border-slate-700/60"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-bold text-sm">
                {guide.appName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                {guide.appName}
                {guide.isSeeded && (
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                    Verified Seed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">{guide.providerName}</p>
            </div>
          </div>

          <DifficultyBadge difficulty={guide.difficulty} />
        </div>

        <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {guide.shortDescription}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">Active Effort</span>
              <span className="font-medium text-slate-200">{guide.activeEffortMinutes.displayString}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Hourglass className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">Approval Wait</span>
              <span className="font-medium text-slate-200 truncate block max-w-[120px]" title={guide.externalWaitTime.summary}>
                {guide.externalWaitTime.status === "instant"
                  ? "Instant (0 days)"
                  : guide.externalWaitTime.typicalDays
                  ? `~${guide.externalWaitTime.typicalDays} days`
                  : guide.externalWaitTime.summary}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {guide.managedAuth.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <Zap className="h-3 w-3" />
              Managed OAuth
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              BYO App Required
            </span>
          )}
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            {verifiedCount} facts
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          View Guide <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
