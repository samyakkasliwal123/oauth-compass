"use client";

import React, { useState } from "react";
import { OAuthGuide } from "@/types/guide";
import { generateGuideMarkdown } from "@/lib/utils";
import { Share2, Copy, Check, Download, Printer, X } from "lucide-react";

interface ShareModalProps {
  guide: OAuthGuide;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ guide, isOpen, onClose }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen) return null;

  const guideUrl = typeof window !== "undefined"
    ? `${window.location.origin}/guides/${guide.id}`
    : `/guides/${guide.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(guideUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn("Failed to copy link:", e);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateGuideMarkdown(guide);
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (e) {
      console.warn("Failed to copy markdown:", e);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateGuideMarkdown(guide);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${guide.slug}-oauth-setup-guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Share Setup Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Anyone with this link can view the complete, evidence-backed guide for{" "}
          <strong className="text-white">{guide.appName}</strong> without creating an account.
        </p>

        {/* Shareable URL input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Persistent Guide URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={guideUrl}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shrink-0"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Export options */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300">Export & Documentation Formats</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedMarkdown ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedMarkdown ? "Markdown Copied!" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download .md</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors mt-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print or Save to PDF</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 text-center pt-2">
          Stored persistently in SQLite / JSON storage repository.
        </div>
      </div>
    </div>
  );
}
