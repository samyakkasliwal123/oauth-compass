import React from "react";
import Link from "next/link";
import { ShieldCheck, Compass, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Compass className="h-4 w-4 text-indigo-400" />
              OAuth Compass
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              A research-backed OAuth setup assistant for AI agents and developer-facing platforms.
              Distinguishing active developer effort from external approval wait times with transparent evidence auditing.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Evidence-Audited • SSRF-Protected • Strict Zod Validation</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Preloaded Guides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/apps/slack" className="hover:text-white transition-colors">
                  Slack OAuth v2 Guide
                </Link>
              </li>
              <li>
                <Link href="/apps/notion" className="hover:text-white transition-colors">
                  Notion Integration Guide
                </Link>
              </li>
              <li>
                <Link href="/apps/google-drive" className="hover:text-white transition-colors">
                  Google Drive Scopes & CASA Guide
                </Link>
              </li>
              <li>
                <Link href="/apps/hubspot" className="hover:text-white transition-colors">
                  HubSpot CRM Auth Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Authoritative References</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.composio.dev/toolkits/managed-auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Composio Managed Auth <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.slack.dev/authentication/installing-with-oauth/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Slack Developer Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.notion.com/guides/get-started/authorization"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Notion Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/identity/protocols/oauth2/policies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Google OAuth Policies <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 OAuth Compass. Built for the Associate Product Manager Take-Home Assessment.</p>
          <p className="text-[11px]">
            Unverified estimates are explicitly marked as estimates. Always verify with official provider portals before commercial deployment.
          </p>
        </div>
      </div>
    </footer>
  );
}
