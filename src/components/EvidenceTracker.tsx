import React, { useState } from "react";
import { SourceCitation, FactualClaim } from "@/types/guide";
import { EvidenceStatusBadge } from "./EvidenceStatusBadge";
import { ShieldCheck, ExternalLink, Filter, HelpCircle, CheckCircle } from "lucide-react";

interface EvidenceTrackerProps {
  sources: SourceCitation[];
  claims: FactualClaim[];
  appName: string;
}

export function EvidenceTracker({ sources, claims, appName }: EvidenceTrackerProps) {
  const [filter, setFilter] = useState<"all" | "verified" | "inferred" | "unknown">("all");

  const filteredClaims = claims.filter((claim) => {
    if (filter === "all") return true;
    return claim.verificationStatus === filter;
  });

  const verifiedCount = claims.filter((c) => c.verificationStatus === "verified").length;
  const inferredCount = claims.filter((c) => c.verificationStatus === "inferred").length;
  const unknownCount = claims.filter((c) => c.verificationStatus === "unknown").length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Evidence & Fact-Checking Audit
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every factual claim is cross-referenced with retrieved documentation and explicitly labeled.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All ({claims.length})
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filter === "verified"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-emerald-400 hover:text-emerald-300"
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setFilter("inferred")}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filter === "inferred"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-amber-400 hover:text-amber-300"
            }`}
          >
            Inferred ({inferredCount})
          </button>
          {unknownCount > 0 && (
            <button
              onClick={() => setFilter("unknown")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                filter === "unknown"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Unknown ({unknownCount})
            </button>
          )}
        </div>
      </div>

      {/* Sources Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
          Official & Secondary Sources Consulted ({sources.length}):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sources.map((src) => (
            <div
              key={src.id}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs flex flex-col justify-between"
            >
              <div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 line-clamp-1"
                >
                  {src.title} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Type: {src.sourceType.replace("_", " ").toUpperCase()} • Checked: {src.lastCheckedDate}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                <strong>Supports: </strong>
                {src.claimsSupported.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
          Audited Factual Claims ({filteredClaims.length}):
        </h4>
        <div className="space-y-2">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 max-w-2xl">
                <p className="text-slate-200 leading-relaxed font-medium">
                  {claim.claim}
                </p>
                {claim.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: {claim.notes}
                  </p>
                )}
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span>Source:</span>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline truncate max-w-[280px]"
                  >
                    {claim.sourceUrl}
                  </a>
                  <span>•</span>
                  <span>{claim.isDirectlySupported ? "Directly supported" : "Inferred reasoning"}</span>
                </div>
              </div>

              <EvidenceStatusBadge
                status={claim.verificationStatus}
                confidence={claim.confidence}
                className="shrink-0 self-start sm:self-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
