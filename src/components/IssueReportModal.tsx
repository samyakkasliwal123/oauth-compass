"use client";

import React, { useState } from "react";
import { Flag, X, Check, AlertTriangle } from "lucide-react";

interface IssueReportModalProps {
  guideName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function IssueReportModal({ guideName, isOpen, onClose }: IssueReportModalProps) {
  const [issueType, setIssueType] = useState("outdated_docs");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Flag className="h-4 w-4 text-amber-400" />
            Report Issue or Outdated Information
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">Report Received</h4>
            <p className="text-xs text-slate-400">
              Thank you for helping keep OAuth Compass evidence-backed and accurate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Reporting discrepancy for <strong className="text-white">{guideName}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="outdated_docs">Documentation Link Moved or 404</option>
                <option value="changed_policy">Provider Verification Policy Changed</option>
                <option value="wrong_scope">Scope Name or Permission Inaccurate</option>
                <option value="wrong_estimate">Active Effort or Waiting Time Mismatch</option>
                <option value="other">Other Information Correction</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Specific Feedback & Official Source</label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Include link to official docs or description of what changed..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
