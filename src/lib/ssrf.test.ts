import { describe, it, expect } from "vitest";
import { validateSafePublicUrl } from "./ssrf";

describe("SSRF URL Validator", () => {
  it("allows safe public HTTPS URLs", () => {
    const validUrls = [
      "https://slack.com",
      "https://developers.notion.com/guides",
      "https://github.com",
      "https://api.hubapi.com/oauth/v3/token",
    ];

    for (const url of validUrls) {
      const res = validateSafePublicUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedUrl).toBeDefined();
    }
  });

  it("normalizes plain domains without protocol into https", () => {
    const res = validateSafePublicUrl("linear.app");
    expect(res.isValid).toBe(true);
    expect(res.sanitizedUrl).toContain("https://linear.app");
  });

  it("blocks localhost and loopback targets", () => {
    const dangerous = [
      "http://localhost",
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://127.0.0.1:8080",
      "http://0.0.0.0",
    ];

    for (const target of dangerous) {
      const res = validateSafePublicUrl(target);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBeDefined();
    }
  });

  it("blocks private IPv4 ranges (10.x, 172.16-31.x, 192.168.x)", () => {
    const privateIps = [
      "http://10.0.0.1",
      "http://10.254.1.1",
      "http://172.16.0.1",
      "http://172.31.255.255",
      "http://192.168.1.1",
      "http://192.168.0.100",
    ];

    for (const ip of privateIps) {
      const res = validateSafePublicUrl(ip);
      expect(res.isValid).toBe(false);
    }
  });

  it("blocks cloud metadata services (169.254.169.254, metadata.google.internal)", () => {
    const metadataTargets = [
      "http://169.254.169.254/latest/meta-data/",
      "http://169.254.1.1",
      "http://metadata.google.internal/computeMetadata/v1/",
    ];

    for (const target of metadataTargets) {
      const res = validateSafePublicUrl(target);
      expect(res.isValid).toBe(false);
    }
  });

  it("blocks dangerous non-HTTP protocols", () => {
    const protocols = [
      "file:///etc/passwd",
      "javascript:alert(1)",
      "ftp://example.com/resource",
      "gopher://example.com",
      "data:text/html,<html></html>",
    ];

    for (const target of protocols) {
      const res = validateSafePublicUrl(target);
      expect(res.isValid).toBe(false);
    }
  });
});
