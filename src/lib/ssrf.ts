import { URL } from "url";

export interface SafeUrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  errorMessage?: string;
  hostname?: string;
}

/**
 * Checks if an IPv4 string belongs to private, loopback, or cloud metadata ranges.
 */
function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // malformed IP is considered unsafe
  }

  const [p0, p1] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;

  // 10.0.0.0/8 (Private Class A)
  if (p0 === 10) return true;

  // 172.16.0.0/12 (Private Class B: 172.16.x.x - 172.31.x.x)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.168.0.0/16 (Private Class C)
  if (p0 === 192 && p1 === 168) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;

  // 224.0.0.0/4 (Multicast)
  if (p0 >= 224 && p0 <= 239) return true;

  // 240.0.0.0/4 (Reserved/Future Use & Broadcast 255.255.255.255)
  if (p0 >= 240) return true;

  return false;
}

/**
 * Validates a user-supplied URL for SSRF vulnerabilities.
 * Blocks loopback, private networks, cloud metadata services, non-HTTP(S) protocols.
 */
export function validateSafePublicUrl(rawInput: string): SafeUrlValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return { isValid: false, errorMessage: "URL cannot be empty." };
  }

  const trimmed = rawInput.trim();

  // Pre-check for dangerous patterns or javascript/data/file protocols
  if (/^(javascript|data|file|ftp|gopher|ldap|dict|mailto|ssh|telnet):/i.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: "Only HTTP and HTTPS protocols are permitted.",
    };
  }

  let parsed: URL;
  try {
    // If user provided domain without protocol, e.g. "notion.so", add https://
    let toParse = trimmed;
    if (!/^https?:\/\//i.test(toParse)) {
      toParse = `https://${toParse}`;
    }
    parsed = new URL(toParse);
  } catch {
    return { isValid: false, errorMessage: "Malformed URL provided." };
  }

  // Protocol check
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      errorMessage: `Protocol '${parsed.protocol}' is disallowed. Only http/https supported.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, local, internal domain names
  const blockedHostnames = [
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "metadata.google.internal",
    "instance-data",
    "local",
  ];

  if (blockedHostnames.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return {
      isValid: false,
      errorMessage: `Target host '${hostname}' is restricted or non-public.`,
    };
  }

  // Check IPv6 loopback / private
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    const rawIpv6 = hostname.slice(1, -1);
    if (rawIpv6 === "::1" || rawIpv6.startsWith("fe80:") || rawIpv6.startsWith("fc00:") || rawIpv6.startsWith("fd00:")) {
      return {
        isValid: false,
        errorMessage: "IPv6 loopback and private unicast addresses are blocked.",
      };
    }
  }

  // Check direct IPv4 literal
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      return {
        isValid: false,
        errorMessage: `IP address '${hostname}' belongs to a private, loopback, or metadata network.`,
      };
    }
  }

  // Enforce port safety (standard 80 and 443 or typical web ports)
  if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    const allowedPorts = [80, 443, 8080, 8443];
    if (!allowedPorts.includes(portNum)) {
      return {
        isValid: false,
        errorMessage: `Port '${parsed.port}' is blocked. Allowed ports are 80, 443, 8080, 8443.`,
      };
    }
  }

  // Force HTTPS if http was specified for public websites
  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    hostname,
  };
}
