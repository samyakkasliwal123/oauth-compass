import React from "react";
import Link from "next/link";
import { Compass, Sparkles, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                OAuth Compass
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  APM Project
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              App Directory
            </Link>
            <Link
              href="/generate"
              className="rounded-md px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Generate Guide
            </Link>
            <a
              href="https://docs.composio.dev/toolkits/managed-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors flex items-center gap-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Composio Managed Auth ↗
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Research New App</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
