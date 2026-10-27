import { GenerateGuideInput, OAuthGuideSchema } from "@/lib/schema";
import { OAuthGuide, FactualClaim, SourceCitation, SetupStep } from "@/types/guide";
import { validateSafePublicUrl } from "@/lib/ssrf";
import { KNOWN_PROVIDER_KNOWLEDGE } from "./heuristics";
import { guideStorage } from "@/lib/storage";
import { gatherOAuthResearchEvidence, ResearchEvidencePackage } from "./tavily";
import { generateGuideWithLLM } from "./llm";

export interface ResearchStageUpdate {
  stage: "identifying" | "searching" | "reviewing" | "generating" | "validating" | "completed";
  message: string;
  progressPercent: number;
  evidenceCount?: number;
  guideUrl?: string;
}

/**
 * Normalizes input: handles separate appName/appWebsite or legacy appNameOrUrl.
 */
function normalizeInputs(input: GenerateGuideInput): {
  normalizedName: string;
  websiteUrl: string;
  userGoal: string;
  intendedAudience: string;
  brandingRequirement: string;
} {
  let rawName = input.appName?.trim() || "";
  let rawUrl = input.appWebsite?.trim() || "";

  // Support legacy single-input field
  if (!rawName && input.appNameOrUrl) {
    const trimmed = input.appNameOrUrl.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.includes(".")) {
      rawUrl = trimmed;
      try {
        const host = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).hostname;
        const cleanHost = host.replace(/^(www\.|api\.|docs\.|developers\.)/i, "");
        rawName = cleanHost.split(".")[0];
      } catch {
        rawName = trimmed;
      }
    } else {
      rawName = trimmed;
      rawUrl = `https://${trimmed.toLowerCase().replace(/\s+/g, "")}.com`;
    }
  }

  // Capitalize name
  const normalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Validate and sanitize website URL
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }
  }

  const safeCheck = validateSafePublicUrl(rawUrl);
  if (!safeCheck.isValid) {
    throw new Error(`Invalid or unsafe website URL: ${safeCheck.errorMessage}`);
  }

  const websiteUrl = safeCheck.sanitizedUrl || rawUrl;
  const userGoal = input.userGoal?.trim() || "Read and write data on behalf of user";
  const intendedAudience = input.intendedAudience || input.distributionGoal || "internal";
  const brandingRequirement = input.brandingRequirement || "provider_branding_acceptable";

  return {
    normalizedName,
    websiteUrl,
    userGoal,
    intendedAudience,
    brandingRequirement,
  };
}

/**
 * Builds a slug from name.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Generates an OAuth Guide from user input using live research and LLM synthesis.
 */
export async function generateOAuthGuide(
  input: GenerateGuideInput,
  onProgress?: (update: ResearchStageUpdate) => void
): Promise<OAuthGuide> {
  // Stage 1: Identifying provider & validating network safety
  onProgress?.({
    stage: "identifying",
    message: "Validating target website and SSRF constraints...",
    progressPercent: 15,
  });

  const { normalizedName, websiteUrl, userGoal, intendedAudience, brandingRequirement } = normalizeInputs(input);
  const slug = slugify(normalizedName);
  const lowerKey = normalizedName.toLowerCase();

  // Check if already in persistent storage
  const existing = guideStorage.getGuideByIdOrSlug(slug);
  if (existing) {
    onProgress?.({
      stage: "completed",
      message: `Found existing verified guide for ${existing.appName}.`,
      progressPercent: 100,
      guideUrl: `/guides/${existing.id}`,
    });
    return existing;
  }

  // Stage 2: Live Web Research via Tavily Search API or Safe Crawler
  onProgress?.({
    stage: "searching",
    message: `Searching official OAuth documentation & API specifications for ${normalizedName}...`,
    progressPercent: 35,
  });

  const evidencePackage = await gatherOAuthResearchEvidence({
    appName: normalizedName,
    websiteUrl,
    userGoal,
  });

  // Stage 3: Reviewing Evidence & Cross-referencing Policies
  onProgress?.({
    stage: "reviewing",
    message: `Auditing ${evidencePackage.results.length} evidence sources, scope taxonomies, and approval wait times...`,
    progressPercent: 60,
    evidenceCount: evidencePackage.results.length,
  });

  // Check if known heuristic exists to supplement unfamiliar research
  const heuristic = KNOWN_PROVIDER_KNOWLEDGE[lowerKey];

  // Stage 4: Generating structured guide via Configured LLM (Gemini)
  onProgress?.({
    stage: "generating",
    message: `Synthesizing evidence claims and agent responsibility boundaries with LLM...`,
    progressPercent: 80,
  });

  let guide = await generateGuideWithLLM({
    appName: normalizedName,
    websiteUrl,
    userGoal,
    intendedAudience,
    brandingRequirement,
    evidence: evidencePackage,
  });

  // Supplement with verified heuristic metadata if known provider was researched
  if (heuristic && guide.sources.length <= 1) {
    guide.consoleNavigation = {
      consoleName: heuristic.consoleName,
      directUrl: heuristic.consoleUrl,
      navigationPath: heuristic.navigationPath,
      keyFields: [
        {
          fieldName: "Callback / Redirect URL",
          description: "Authorized destination after user consent.",
          formatRule: "HTTPS required; localhost permitted for development.",
          example: `https://myapp.com/api/auth/${slug}/callback`,
        },
      ],
    };
  }

  // Stage 5: Validating against strict Zod schema
  onProgress?.({
    stage: "validating",
    message: "Verifying guide schema integrity and persisting to storage...",
    progressPercent: 95,
  });

  const validated = OAuthGuideSchema.parse(guide);

  // Persist to storage
  guideStorage.saveGuide(validated);

  onProgress?.({
    stage: "completed",
    message: "OAuth Guide successfully researched, verified, and saved!",
    progressPercent: 100,
    guideUrl: `/guides/${validated.id}`,
  });

  return validated;
}
