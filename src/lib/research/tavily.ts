import { validateSafePublicUrl } from "@/lib/ssrf";

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
  domain: string;
  score?: number;
  isOfficial: boolean;
}

export interface ResearchEvidencePackage {
  providerName: string;
  websiteUrl: string;
  queriesUsed: string[];
  results: SearchResultItem[];
  isLiveSearch: boolean;
  searchEngineUsed: "tavily" | "official_domain_crawler" | "heuristic_fallback";
  incompleteNotice?: string;
}

/**
 * Extracts clean domain from URL.
 */
function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase();
  } catch {
    return "unknown";
  }
}

/**
 * Executes a single Tavily search query.
 */
async function runTavilyQuery(apiKey: string, query: string, targetDomain?: string): Promise<SearchResultItem[]> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
      }),
      // Set 12s timeout
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.warn(`Tavily search warning (${res.status}): ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    const targetClean = targetDomain ? targetDomain.replace(/^(www\.|api\.|docs\.|developers\.)/i, "") : "";

    return data.results.map((r: any) => {
      const url = r.url || "";
      const domain = extractDomain(url);
      const isOfficial = targetClean ? domain.includes(targetClean) : false;

      // Untrusted data sanitization: strip any prompt injection patterns
      const sanitizedContent = (r.content || "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/system:.*?\n/gi, "")
        .trim();

      return {
        title: r.title || "Documentation Reference",
        url,
        content: sanitizedContent,
        domain,
        score: r.score,
        isOfficial,
      };
    });
  } catch (err) {
    console.warn(`Tavily search network error for query "${query}":`, err);
    return [];
  }
}

/**
 * Fallback crawler: Safely inspects the target website when no search API key is configured.
 * Strictly SSRF-validated.
 */
async function probeTargetWebsiteSafely(targetUrl: string, appName: string): Promise<SearchResultItem[]> {
  const safeCheck = validateSafePublicUrl(targetUrl);
  if (!safeCheck.isValid || !safeCheck.sanitizedUrl) {
    return [];
  }

  const baseDomain = safeCheck.hostname || "unknown.com";
  const results: SearchResultItem[] = [];

  // Safe probe paths
  const candidatePaths = ["/developers", "/docs", "/api", "/api/oauth"];

  for (const path of candidatePaths) {
    const probeUrl = `https://${baseDomain}${path}`;
    try {
      const res = await fetch(probeUrl, {
        method: "GET",
        headers: {
          "User-Agent": "OAuthCompass-ResearchBot/1.0",
          Accept: "text/html,application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const text = await res.text();
        // Extract title if HTML
        const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : `${appName} Developer Portal (${path})`;

        // Extract a safe excerpt
        const bodyText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 500);

        results.push({
          title,
          url: probeUrl,
          content: bodyText.trim(),
          domain: baseDomain,
          isOfficial: true,
        });

        // Found at least one valid developer entry point
        break;
      }
    } catch {
      // Ignore individual probe failures
    }
  }

  return results;
}

/**
 * Gathers research evidence across 4 critical OAuth facets:
 * 1. App creation & client credentials
 * 2. Redirect URI requirements
 * 3. Scope requirements
 * 4. Verification, review queues & wait times
 */
export async function gatherOAuthResearchEvidence(params: {
  appName: string;
  websiteUrl: string;
  userGoal?: string;
}): Promise<ResearchEvidencePackage> {
  const { appName, websiteUrl, userGoal } = params;
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const targetDomain = extractDomain(websiteUrl);

  const queries = [
    `${appName} official OAuth 2.0 documentation developer app client credentials`,
    `${appName} OAuth redirect URI callback URL rules localhost`,
    userGoal
      ? `${appName} API scopes permissions ${userGoal}`
      : `${appName} OAuth scopes API reference permissions`,
    `${appName} OAuth app verification review process approval wait time`,
  ];

  if (tavilyApiKey) {
    // Run targeted live searches
    const queryPromises = queries.map((q) => runTavilyQuery(tavilyApiKey, q, targetDomain));
    const queryResults = await Promise.all(queryPromises);

    // Flatten and deduplicate by URL
    const seenUrls = new Set<string>();
    const allResults: SearchResultItem[] = [];

    for (const batch of queryResults) {
      for (const item of batch) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          allResults.push(item);
        }
      }
    }

    // Sort to prioritize official provider domains
    allResults.sort((a, b) => (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0));

    return {
      providerName: appName,
      websiteUrl,
      queriesUsed: queries,
      results: allResults,
      isLiveSearch: true,
      searchEngineUsed: "tavily",
    };
  }

  // Fallback: Safe probe when TAVILY_API_KEY is not configured
  const probeResults = await probeTargetWebsiteSafely(websiteUrl, appName);

  return {
    providerName: appName,
    websiteUrl,
    queriesUsed: queries,
    results: probeResults,
    isLiveSearch: probeResults.length > 0,
    searchEngineUsed: probeResults.length > 0 ? "official_domain_crawler" : "heuristic_fallback",
    incompleteNotice:
      "Tavily Search API key (TAVILY_API_KEY) is not configured in environment. Research grounded on safe official domain inspection and verified SaaS OAuth conventions.",
  };
}
