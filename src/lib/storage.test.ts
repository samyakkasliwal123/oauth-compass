import { describe, it, expect } from "vitest";
import { guideStorage } from "./storage";

describe("Guide Storage & Persistence", () => {
  it("initializes and returns all seed guides", () => {
    const all = guideStorage.getAllGuides();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const ids = all.map((g) => g.id);
    expect(ids).toContain("slack");
    expect(ids).toContain("notion");
    expect(ids).toContain("google-drive");
    expect(ids).toContain("hubspot");
  });

  it("retrieves a guide by slug case-insensitively", () => {
    const slack = guideStorage.getGuideByIdOrSlug("SLACK");
    expect(slack).not.toBeNull();
    expect(slack?.appName).toBe("Slack");

    const gdrive = guideStorage.getGuideByIdOrSlug("google-drive");
    expect(gdrive).not.toBeNull();
    expect(gdrive?.appName).toBe("Google Drive");
  });

  it("returns null for non-existent guide", () => {
    const missing = guideStorage.getGuideByIdOrSlug("non-existent-app-12345");
    expect(missing).toBeNull();
  });
});
