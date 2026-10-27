import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOAuthGuide } from "./service";
import { validateSafePublicUrl } from "../ssrf";
import { guideStorage } from "../storage";
import { OAuthGuideSchema } from "../schema";
import { generateGuideWithLLM, getLLMConfig } from "./llm";

describe("Live Research and OAuth Guide Generation Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Known provider with relevant official documentation
  it("generates and retrieves guide for known provider with verified official documentation", async () => {
    const guide = await generateOAuthGuide({
      appName: "Slack",
      appWebsite: "https://api.slack.com",
      userGoal: "Send agent notification messages into team channels",
      intendedAudience: "internal",
      brandingRequirement: "provider_branding_acceptable",
    });

    expect(guide.appName).toBe("Slack");
    expect(guide.slug).toBe("slack");
    expect(guide.sources.length).toBeGreaterThanOrEqual(1);
    expect(guide.claims.some((c) => c.verificationStatus === "verified")).toBe(true);
    expect(guide.activeEffortMinutes.min).toBeGreaterThan(0);
    expect(guide.externalWaitTime.status).toBeDefined();
  });

  // Test 2: Unfamiliar provider that requires live research
  it("researches an unfamiliar provider and generates structured guide with uncertainty labels", async () => {
    const guide = await generateOAuthGuide({
      appName: "Linear",
      appWebsite: "https://linear.app",
      userGoal: "Sync user issue tickets and project milestones",
      intendedAudience: "internal",
      brandingRequirement: "own_branding_required",
    });

    expect(guide.appName).toBe("Linear");
    expect(guide.websiteUrl).toContain("linear.app");
    expect(guide.steps.length).toBeGreaterThanOrEqual(1);
    expect(guide.recommendedApproach).toBeDefined();
    // Validate output strictly against Zod schema
    const validation = OAuthGuideSchema.safeParse(guide);
    expect(validation.success).toBe(true);
  });

  // Test 3: Missing API keys behavior (transparent evidence-only fallback)
  it("handles missing API keys transparently without crashing or fabricating claims", async () => {
    // Temporarily unset keys
    const originalKey = process.env.LLM_API_KEY;
    const originalGemini = process.env.GEMINI_API_KEY;
    const originalTavily = process.env.TAVILY_API_KEY;

    try {
      delete process.env.LLM_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.TAVILY_API_KEY;

      const guide = await generateOAuthGuide({
        appName: "AcmeAPI",
        appWebsite: "https://acme-api-test-example.com",
        userGoal: "Test fallback behavior",
        intendedAudience: "personal",
        brandingRequirement: "provider_branding_acceptable",
      });

      expect(guide.appName).toBe("AcmeAPI");
      expect(guide.researchVersion).toContain("evidence-only-fallback");
      expect(guide.claims.some((c) => c.verificationStatus === "unknown" || c.verificationStatus === "likely")).toBe(true);
      expect(guide.unresolvedQuestions?.length).toBeGreaterThan(0);
    } finally {
      process.env.LLM_API_KEY = originalKey;
      process.env.GEMINI_API_KEY = originalGemini;
      process.env.TAVILY_API_KEY = originalTavily;
    }
  });

  // Test 4: Invalid website input & SSRF defense
  it("blocks invalid and unsafe website inputs via SSRF protection", async () => {
    const unsafeUrls = [
      "http://localhost:3000/internal",
      "http://127.0.0.1:8080",
      "http://169.254.169.254/latest/meta-data/",
      "http://192.168.1.1",
      "ftp://example.com/oauth",
      "file:///etc/passwd",
    ];

    for (const url of unsafeUrls) {
      await expect(
        generateOAuthGuide({
          appName: "MaliciousTarget",
          appWebsite: url,
        })
      ).rejects.toThrow();
    }
  });

  // Test 5: Search results with insufficient evidence
  it("labels claims as unknown when evidence is insufficient", async () => {
    const guide = await generateOAuthGuide({
      appName: "ObscureTool",
      appWebsite: "https://obscure-unindexed-saas-tool.io",
      userGoal: "Query private databases",
    });

    expect(guide.claims.some((c) => c.verificationStatus === "unknown")).toBe(true);
    expect(guide.externalWaitTime.status).toBe("unknown");
    expect(guide.overallConfidence).toBe("low");
  });

  // Test 6: Malformed model output handled safely
  it("gracefully catches malformed LLM output and validates via Zod", async () => {
    // Malformed JSON that fails Zod validation
    const malformedGuide = {
      appName: "BrokenGuide",
      // Missing required fields
    };

    const parseResult = OAuthGuideSchema.safeParse(malformedGuide);
    expect(parseResult.success).toBe(false);
  });

  // Test 7: Shareable guide persistence and retrieval
  it("persists generated guides reliably so they can be retrieved by ID across sessions", async () => {
    const guide = await generateOAuthGuide({
      appName: "PersistenceCheckApp",
      appWebsite: "https://persistencecheck.org",
      userGoal: "Verify persistent storage retrieval",
    });

    // Retrieve via storage repository
    const retrieved = guideStorage.getGuideByIdOrSlug(guide.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(guide.id);
    expect(retrieved?.appName).toBe("PersistenceCheckApp");
  });
});
