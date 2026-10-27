import { describe, it, expect } from "vitest";
import { OAuthGuideSchema, GenerateGuideInputSchema } from "./schema";
import { SEED_GUIDES } from "@/data/seeds";

describe("OAuth Guide Schema & Seed Validation", () => {
  it("validates all 4 preloaded seed guides strictly against Zod schema", () => {
    expect(SEED_GUIDES.length).toBe(4);

    for (const guide of SEED_GUIDES) {
      const parsed = OAuthGuideSchema.safeParse(guide);
      if (!parsed.success) {
        console.error(`Failed validation for ${guide.appName}:`, parsed.error.format());
      }
      expect(parsed.success).toBe(true);
    }
  });

  it("validates Slack guide has required bot and user scope guidance", () => {
    const slack = SEED_GUIDES.find((g) => g.id === "slack");
    expect(slack).toBeDefined();
    expect(slack?.steps.length).toBeGreaterThanOrEqual(4);
    expect(slack?.managedAuth.isAvailable).toBe(true);
    expect(slack?.externalWaitTime.bestCaseDays).toBe(0);
  });

  it("validates Google Drive guide captures CASA restricted scope audit", () => {
    const google = SEED_GUIDES.find((g) => g.id === "google-drive");
    expect(google).toBeDefined();
    expect(google?.difficulty).toBe("Very Complex");
    expect(google?.externalWaitTime.extendedDays).toBeGreaterThan(30);
  });

  it("validates Notion guide captures page-picker and HTTP Basic Auth", () => {
    const notion = SEED_GUIDES.find((g) => g.id === "notion");
    expect(notion).toBeDefined();
    const tokenStep = notion?.steps.find((s) => s.id === "notion-step-5");
    expect(tokenStep?.whatToDo).toContain("Basic");
  });

  it("validates HubSpot guide captures 30-minute token expiration and Super Admin", () => {
    const hubspot = SEED_GUIDES.find((g) => g.id === "hubspot");
    expect(hubspot).toBeDefined();
    const prereq = hubspot?.prerequisites.find((p) => p.accountTypeRequired?.includes("Super Admin"));
    expect(prereq).toBeDefined();
  });

  it("validates user input schema rejects inputs under 2 chars", () => {
    const invalid = GenerateGuideInputSchema.safeParse({ appNameOrUrl: "a" });
    expect(invalid.success).toBe(false);

    const valid = GenerateGuideInputSchema.safeParse({ appNameOrUrl: "Linear" });
    expect(valid.success).toBe(true);
  });
});
