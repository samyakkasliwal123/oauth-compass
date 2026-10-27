"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppCard } from "@/components/AppCard";
import { OAuthGuide } from "@/types/guide";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Hourglass,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export default function AppDirectoryPage() {
  const [guides, setGuides] = useState<OAuthGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplexity, setSelectedComplexity] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState("all");
  const [selectedManaged, setSelectedManaged] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch("/api/guides");
        const json = await res.json();
        if (json.success && json.data) {
          setGuides(json.data);
        }
      } catch (err) {
        console.error("Failed to load guides:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuides();
  }, []);

  // Filter logic
  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = guide.appName.toLowerCase().includes(query);
        const matchesProvider = guide.providerName.toLowerCase().includes(query);
        const matchesDesc = guide.shortDescription.toLowerCase().includes(query);
        const matchesUseCase = guide.intendedUseCase.toLowerCase().includes(query);
        const matchesCategory = guide.category.toLowerCase().includes(query);
        if (!matchesName && !matchesProvider && !matchesDesc && !matchesUseCase && !matchesCategory) {
          return false;
        }
      }

      // Complexity
      if (selectedComplexity !== "all" && guide.difficulty !== selectedComplexity) {
        return false;
      }

      // Approval wait
      if (selectedApproval === "instant" && guide.externalWaitTime.status !== "instant") {
        return false;
      }
      if (selectedApproval === "requires_review" && guide.externalWaitTime.status === "instant") {
        return false;
      }

      // Managed OAuth
      if (selectedManaged === "managed_available" && !guide.managedAuth.isAvailable) {
        return false;
      }
      if (selectedManaged === "byo_required" && guide.managedAuth.isAvailable) {
        return false;
      }

      // Category
      if (selectedCategory !== "all" && guide.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [guides, searchQuery, selectedComplexity, selectedApproval, selectedManaged, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => set.add(g.category));
    return Array.from(set);
  }, [guides]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-5xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Research-Backed OAuth Architecture Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Know what it takes to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">connect any app.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
            Developers building AI agents struggle with developer-console navigation, secret management, redirect URI rules, scopes, and verification wait times.
            OAuth Compass separates <strong className="text-slate-200">hands-on active setup effort</strong> from <strong className="text-slate-200">external approval delays</strong> with audited factual claims.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Research Any Unfamiliar App</span>
            </Link>

            <a
              href="#managed-vs-custom"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Managed vs Custom OAuth</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Managed Auth vs BYO App Explainer Banner */}
        <div
          id="managed-vs-custom"
          className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 sm:p-7 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="h-4 w-4" />
                Integration Strategy: Managed OAuth vs Bringing Your Own App
              </div>
              <h2 className="text-xl font-bold text-white">
                Do you really need to register your own OAuth application?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Platforms like <a href="https://docs.composio.dev/toolkits/managed-auth" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-medium">Composio Managed Auth</a> maintain pre-registered, verified OAuth applications for major toolkits (Slack, Notion, Google Drive, HubSpot). Users can authorize through a hosted Connect Link with zero client secret management.
                Bring your own OAuth app only when you need your proprietary company branding on the consent dialog, enterprise org-wide distribution, or custom scopes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white">Architecture Choice</span>
                <span className="text-[11px] text-indigo-400">Decision Criteria</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Managed OAuth</strong>: Zero developer setup, instant multi-tenant testing, automated token refresh.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">⚡</span>
                  <span><strong>Custom OAuth App</strong>: White-labeled brand name on consent screen, custom rate-limit quotas.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by app name, provider, or integration capability (e.g. Slack, Notion, contacts, files)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <Link
              href="/generate"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-2.5 text-xs sm:text-sm font-semibold text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Generate Guide for Unknown App</span>
            </Link>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            {/* Complexity */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Setup Difficulty</label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy (10-20 min)</option>
                <option value="Moderate">Moderate (20-30 min)</option>
                <option value="Complex">Complex (30-50 min)</option>
                <option value="Very Complex">Very Complex (Audit required)</option>
              </select>
            </div>

            {/* Approval Requirements */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approval Wait</label>
              <select
                value={selectedApproval}
                onChange={(e) => setSelectedApproval(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Approval Times</option>
                <option value="instant">Instant (0 Days Wait)</option>
                <option value="requires_review">Requires Review (3+ Days)</option>
              </select>
            </div>

            {/* Managed Auth */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Managed Auth</label>
              <select
                value={selectedManaged}
                onChange={(e) => setSelectedManaged(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Auth Architectures</option>
                <option value="managed_available">Composio Managed Available</option>
                <option value="byo_required">Bring Your Own App Required</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directory Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">
              Showing {filteredGuides.length} {filteredGuides.length === 1 ? "app guide" : "app guides"}
            </h3>
            <span className="text-xs text-slate-500">
              {guides.filter((g) => g.isSeeded).length} preloaded verified guides
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <p className="text-sm text-slate-400">Loading OAuth guides repository...</p>
            </div>
          ) : filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <AppCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-white">No matching app guides found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  We don't have a pre-indexed guide matching "{searchQuery}". You can research and generate an evidence-backed guide right now.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/generate?q=${encodeURIComponent(searchQuery)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Guide for "{searchQuery || "New App"}"</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
