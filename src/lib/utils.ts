import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OAuthGuide } from "@/types/guide";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates an exportable Markdown document from an OAuthGuide.
 */
export function generateGuideMarkdown(guide: OAuthGuide): string {
  const lines: string[] = [];

  lines.push(`# OAuth Setup Guide: ${guide.appName}`);
  lines.push(`**Provider**: ${guide.providerName} | **Website**: ${guide.websiteUrl}`);
  lines.push(`**Generated**: ${new Date(guide.generatedAt).toLocaleDateString()} | **Difficulty**: ${guide.difficulty}`);
  lines.push(`**Active Effort**: ${guide.activeEffortMinutes.displayString} | **External Wait**: ${guide.externalWaitTime.summary}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Overview");
  lines.push(guide.overview);
  lines.push("");
  lines.push(`**Intended Use Case**: ${guide.intendedUseCase}`);
  lines.push("");

  lines.push("## Managed OAuth vs Bring Your Own OAuth App");
  lines.push(`**Status**: ${guide.managedAuth.isAvailable ? "Managed OAuth Available" : "Bring Your Own App Required"}`);
  lines.push(`**Recommendation**: ${guide.managedAuth.recommendation}`);
  lines.push("");
  lines.push("### Trade-offs:");
  lines.push("**Pros of Managed OAuth:**");
  guide.managedAuth.tradeoffs.pros.forEach((p) => lines.push(`- ${p}`));
  lines.push("");
  lines.push("**Cons of Managed OAuth:**");
  guide.managedAuth.tradeoffs.cons.forEach((c) => lines.push(`- ${c}`));
  lines.push("");
  lines.push("**When to bring your own OAuth app:**");
  guide.managedAuth.tradeoffs.whenToUseCustom.forEach((w) => lines.push(`- ${w}`));
  lines.push("");

  lines.push("## Prerequisites");
  guide.prerequisites.forEach((p) => {
    lines.push(`- **${p.title}**${p.isMandatory ? " *(Mandatory)*" : ""}: ${p.description}`);
  });
  lines.push("");

  lines.push("## Step-by-Step Setup Checklist");
  guide.steps.forEach((step) => {
    const responsibilityLabel =
      step.responsibility === "agent-can-perform"
        ? "[Agent Can Perform]"
        : step.responsibility === "agent-assists"
        ? "[Agent Assists / Human Confirms]"
        : "[Developer Must Perform]";

    lines.push(`### Step ${step.order}: ${step.title} ${responsibilityLabel}`);
    lines.push(`- **What to do**: ${step.whatToDo}`);
    lines.push(`- **Why it matters**: ${step.whyItMatters}`);
    lines.push(`- **Where to do it**: ${step.whereToDo}${step.whereUrl ? ` (${step.whereUrl})` : ""}`);
    lines.push(`- **Information needed**: ${step.informationNeeded.join(", ")}`);
    lines.push(`- **How to know it is complete**: ${step.howToVerifyComplete}`);
    lines.push(`- **If it fails**: ${step.failureRemedies}`);
    lines.push(`- **Responsibility rationale**: ${step.responsibilityReason}`);
    if (step.safeCheckAvailable && step.safeCheckDescription) {
      lines.push(`- **Safe check available**: ${step.safeCheckDescription}`);
    }
    lines.push("");
  });

  lines.push("## Redirect URI Rules");
  guide.redirectUriRules.rules.forEach((r) => lines.push(`- ${r}`));
  lines.push(`**Notes**: ${guide.redirectUriRules.notes}`);
  lines.push("");

  lines.push("## Scope Guidance (Least Privilege)");
  lines.push(guide.scopeGuidance.principleExplanation);
  lines.push("");
  lines.push("| Scope | Type | Risk Level | Description |");
  lines.push("| :--- | :--- | :--- | :--- |");
  guide.scopeGuidance.scopes.forEach((s) => {
    lines.push(`| \`${s.name}\` | ${s.type} | ${s.riskLevel} | ${s.description} |`);
  });
  lines.push("");

  lines.push("## Common Blockers & Remedies");
  guide.commonBlockers.forEach((b) => {
    lines.push(`### ⚠️ ${b.issue}`);
    lines.push(`- **Symptoms**: ${b.symptoms}`);
    lines.push(`- **Cause**: ${b.cause}`);
    lines.push(`- **Remedy**: ${b.remedy}`);
    lines.push(`- **Agent Assistance**: ${b.agentAssistance}`);
    lines.push("");
  });

  lines.push("## Evidence & Source Transparency");
  lines.push("### Official Sources:");
  guide.sources.forEach((s) => {
    lines.push(`- [${s.title}](${s.url}) (Checked: ${s.lastCheckedDate}, Type: ${s.sourceType})`);
  });
  lines.push("");
  lines.push("### Factual Claims Audit:");
  guide.claims.forEach((c) => {
    lines.push(`- **[${c.verificationStatus.toUpperCase()}]** ${c.claim} (${c.isDirectlySupported ? "Directly supported" : "Inferred"}, Confidence: ${c.confidence})`);
  });
  lines.push("");
  lines.push("---");
  lines.push("*Exported from OAuth Compass — Research-Backed OAuth Setup Assistant*");

  return lines.join("\n");
}
