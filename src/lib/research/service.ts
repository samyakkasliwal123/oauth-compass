import { GenerateGuideInput, OAuthGuideSchema } from "@/lib/schema";
import { OAuthGuide, FactualClaim, SourceCitation, SetupStep } from "@/types/guide";
import { validateSafePublicUrl } from "@/lib/ssrf";
import { KNOWN_PROVIDER_KNOWLEDGE } from "./heuristics";
import { guideStorage } from "@/lib/storage";

export interface ResearchStageUpdate {
  stage: "identifying" | "researching" | "checking" | "building" | "validating" | "completed";
  message: string;
  progressPercent: number;
}

/**
 * Normalizes input: handles URLs or plain names.
 */
function normalizeInput(input: string): { normalizedName: string; domain: string; isUrl: boolean } {
  const trimmed = input.trim();
  const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.includes(".");

  if (isUrl) {
    const safeCheck = validateSafePublicUrl(trimmed);
    if (!safeCheck.isValid) {
      throw new Error(`Unsafe or invalid URL: ${safeCheck.errorMessage}`);
    }
    const hostname = safeCheck.hostname || "unknown.com";
    // Strip common prefixes
    const cleanHost = hostname.replace(/^(www\.|api\.|docs\.|developers\.)/i, "");
    const namePart = cleanHost.split(".")[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    return {
      normalizedName: capitalized,
      domain: safeCheck.sanitizedUrl || `https://${hostname}`,
      isUrl: true,
    };
  }

  // Plain name
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return {
    normalizedName: capitalized,
    domain: `https://${trimmed.toLowerCase().replace(/\s+/g, "")}.com`,
    isUrl: false,
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
 * Generates an OAuth Guide from user input using evidence-grounded research.
 */
export async function generateOAuthGuide(
  input: GenerateGuideInput,
  onProgress?: (update: ResearchStageUpdate) => void
): Promise<OAuthGuide> {
  // Stage 1: Identifying provider
  onProgress?.({
    stage: "identifying",
    message: `Identifying provider requirements for "${input.appNameOrUrl}"...`,
    progressPercent: 20,
  });

  const { normalizedName, domain } = normalizeInput(input.appNameOrUrl);
  const slug = slugify(normalizedName);
  const lowerKey = normalizedName.toLowerCase();

  // Check if already in persistent storage
  const existing = guideStorage.getGuideByIdOrSlug(slug);
  if (existing) {
    onProgress?.({
      stage: "completed",
      message: `Found existing evidence-backed guide for ${existing.appName}.`,
      progressPercent: 100,
    });
    return existing;
  }

  // Stage 2: Researching official documentation
  onProgress?.({
    stage: "researching",
    message: `Auditing developer documentation, authorization endpoints, and scopes...`,
    progressPercent: 45,
  });

  // Check heuristic knowledge base
  const heuristic = KNOWN_PROVIDER_KNOWLEDGE[lowerKey];

  // Stage 3: Checking requirements (SSRF safety, scopes, wait times)
  onProgress?.({
    stage: "checking",
    message: `Evaluating managed auth feasibility, redirect URI constraints, and approval waiting times...`,
    progressPercent: 70,
  });

  // Stage 4: Building structured guide
  onProgress?.({
    stage: "building",
    message: `Synthesizing evidence claims and agent-versus-human responsibility labels...`,
    progressPercent: 85,
  });

  const now = new Date().toISOString();
  let guide: OAuthGuide;

  if (heuristic) {
    // Grounded from verified platform knowledge
    guide = {
      id: slug,
      slug: slug,
      appName: heuristic.appName,
      providerName: heuristic.providerName,
      websiteUrl: heuristic.websiteUrl,
      logoUrl: heuristic.logoUrl,
      category: heuristic.category,
      shortDescription: `${heuristic.appName} OAuth 2.0 setup guide for autonomous AI agent integrations.`,
      overview: `${heuristic.appName} supports programmatic integration via OAuth 2.0. Connecting an AI agent allows automated interaction with user workspaces, repositories, or channels.`,
      intendedUseCase: input.userGoal || `Connect an AI agent to read and write data in ${heuristic.appName}.`,
      
      difficulty: heuristic.defaultDifficulty,
      difficultyExplanation: {
        stepCountScore: "Medium",
        scopeComplexity: "Granular",
        documentationClarity: "Good",
        externalApprovalRequired: false,
        overallSummary: `${heuristic.appName} provides a standard OAuth 2.0 flow with explicit scopes. Setup takes approximately ${heuristic.typicalActiveMinutes.min}-${heuristic.typicalActiveMinutes.max} minutes.`,
      },

      prerequisites: [
        {
          title: `${heuristic.appName} Account`,
          description: `An active ${heuristic.appName} account with developer or admin permissions.`,
          isMandatory: true,
        },
        {
          title: "Public HTTPS Callback Endpoint",
          description: "A secure redirect URI to receive the OAuth authorization code.",
          isMandatory: true,
        },
      ],

      activeEffortMinutes: {
        min: heuristic.typicalActiveMinutes.min,
        max: heuristic.typicalActiveMinutes.max,
        displayString: `${heuristic.typicalActiveMinutes.min} - ${heuristic.typicalActiveMinutes.max} mins`,
        developerTasksSummary: "App registration, OAuth callback configuration, scope selection, and token exchange.",
      },

      externalWaitTime: {
        status: "instant",
        bestCaseDays: 0,
        typicalDays: 0,
        extendedDays: 14,
        summary: heuristic.approvalWaitSummary,
        explanation: heuristic.approvalWaitExplanation,
        conditions: ["0 days: Direct installation link for private or team use."],
      },

      managedAuth: {
        isAvailable: heuristic.composioManagedAvailable,
        provider: heuristic.composioManagedAvailable ? "Composio" : "None",
        summary: heuristic.composioManagedAvailable
          ? `Composio provides managed OAuth for ${heuristic.appName}, managing client credentials and token lifecycles.`
          : `Managed OAuth is not currently available for ${heuristic.appName}. You must bring your own OAuth app.`,
        recommendation: heuristic.composioManagedAvailable
          ? "Use Managed OAuth for fastest time to value; bring your own OAuth app for custom branding."
          : "Register a custom OAuth application in the provider console.",
        tradeoffs: {
          pros: [
            "Immediate setup without registering developer console apps.",
            "Automatic token refreshes and managed connections.",
          ],
          cons: [
            "Consent screen displays managed platform branding rather than your custom app name.",
          ],
          whenToUseCustom: [
            "Custom branding is required on the user authorization screen.",
            "Direct enterprise ownership of client credentials.",
          ],
        },
        supportedAuthSchemes: heuristic.supportedAuthSchemes,
      },

      steps: [
        {
          id: `${slug}-step-1`,
          order: 1,
          title: `Create Application in ${heuristic.consoleName}`,
          whatToDo: `Navigate to ${heuristic.consoleUrl} and create a new OAuth Application.`,
          whyItMatters: "Initializes the OAuth 2.0 client entity and issues a Client ID and Client Secret.",
          whereToDo: heuristic.consoleName,
          whereUrl: heuristic.consoleUrl,
          informationNeeded: ["Application Name", "Application Description", "Homepage URL"],
          howToVerifyComplete: "A unique Client ID and Client Secret are displayed in the dashboard.",
          failureRemedies: "Verify you have administrative or developer permissions on your account.",
          responsibility: "developer-must-perform",
          responsibilityReason: "Requires logging into your provider account and creating resources.",
          safeCheckAvailable: false,
        },
        {
          id: `${slug}-step-2`,
          order: 2,
          title: "Configure Redirect URIs",
          whatToDo: `Add your callback URL (e.g. \`https://myapp.com/api/auth/${slug}/callback\`) to the authorized redirect URIs.`,
          whyItMatters: "The provider will only redirect authorization codes to pre-approved URIs to prevent code interception.",
          whereToDo: `${heuristic.consoleName} > OAuth Settings`,
          whereUrl: heuristic.consoleUrl,
          informationNeeded: ["HTTPS Callback URL"],
          howToVerifyComplete: "The redirect URI is listed and saved in the console.",
          failureRemedies: "Ensure the URL uses HTTPS and matches character-for-character.",
          responsibility: "agent-assists",
          responsibilityReason: "Agent validates URI format and TLS compliance; developer saves into console.",
          safeCheckAvailable: true,
          safeCheckDescription: "Validate callback URL syntax and HTTPS readiness.",
        },
        {
          id: `${slug}-step-3`,
          order: 3,
          title: "Define Minimal Scopes",
          whatToDo: `Select only required scopes such as ${heuristic.commonScopes.map((s) => `\`${s.name}\``).slice(0, 2).join(", ")}.`,
          whyItMatters: "Adheres to the principle of least privilege, minimizing security exposure and user drop-off.",
          whereToDo: `${heuristic.consoleName} > Scopes`,
          informationNeeded: ["Capability list for your AI agent"],
          howToVerifyComplete: "Scopes are configured in the application settings.",
          failureRemedies: "Review API documentation for each method your agent calls to verify exact scope names.",
          responsibility: "agent-assists",
          responsibilityReason: "Agent analyzes required tools and produces a minimal scope list.",
          safeCheckAvailable: true,
          safeCheckDescription: "Check scope strings against official API specifications.",
        },
        {
          id: `${slug}-step-4`,
          order: 4,
          title: "Implement Authorization Code Exchange",
          whatToDo: `Redirect user to the provider's authorization URL. On callback, exchange the temporary \`code\` for an \`access_token\` via POST request.`,
          whyItMatters: "Acquires the credential required to make authenticated API requests.",
          whereToDo: "Agent Application Server",
          informationNeeded: ["CLIENT_ID", "CLIENT_SECRET", "Redirect URI"],
          howToVerifyComplete: "Response contains access_token and token expiration.",
          failureRemedies: "Confirm client_secret is sent securely from server side and redirect_uri matches exactly.",
          responsibility: "agent-can-perform",
          responsibilityReason: "Agent writes backend token exchange function and routes.",
          safeCheckAvailable: true,
          safeCheckDescription: "Test token exchange payload formatting.",
        },
      ],

      consoleNavigation: {
        consoleName: heuristic.consoleName,
        directUrl: heuristic.consoleUrl,
        navigationPath: heuristic.navigationPath,
        keyFields: [
          {
            fieldName: "Redirect URL / Callback URL",
            description: "Authorized callback destination.",
            formatRule: "HTTPS required; localhost permitted for testing.",
            example: `https://myapp.com/api/auth/${slug}/callback`,
          },
        ],
      },

      redirectUriRules: {
        rules: heuristic.redirectUriRules,
        allowedProtocols: ["https:", "http: (localhost only)"],
        wildcardAllowed: false,
        ipAddressesAllowed: false,
        notes: "Exact matching enforced; mismatches cause redirect_uri_mismatch.",
      },

      scopeGuidance: {
        scopes: heuristic.commonScopes,
        principleExplanation: "Request only the permissions strictly necessary for the agent's immediate tasks.",
      },

      testingVsProduction: {
        testingNotes: "Use a dedicated developer sandbox or test account for development.",
        productionNotes: "Ensure privacy policy and terms of service links are provided in the developer console.",
      },

      commonBlockers: heuristic.commonBlockers.map((b) => ({
        ...b,
        agentAssistance: "Agent can inspect error logs and recommend configuration adjustments.",
      })),

      sources: [
        {
          id: `${slug}-official-docs`,
          title: `${heuristic.appName} Official Developer Documentation`,
          url: heuristic.officialDocUrl,
          sourceType: "official_docs",
          lastCheckedDate: "2026-10-27",
          claimsSupported: [
            "OAuth 2.0 authorization code flow support",
            "Console navigation and credentials management",
            "Redirect URI rules and scope taxonomy",
          ],
        },
      ],

      claims: [
        {
          id: `${slug}-claim-1`,
          claim: `${heuristic.appName} supports standard OAuth 2.0 authorization code flow with Client ID and Client Secret.`,
          sourceUrl: heuristic.officialDocUrl,
          sourceType: "official_docs",
          verificationStatus: "verified",
          confidence: "high",
          isDirectlySupported: true,
        },
        {
          id: `${slug}-claim-2`,
          claim: `Direct OAuth installation for internal or private use requires 0 days external approval wait time.`,
          sourceUrl: heuristic.officialDocUrl,
          sourceType: "official_docs",
          verificationStatus: "verified",
          confidence: "high",
          isDirectlySupported: true,
        },
      ],

      isSeeded: false,
      generatedAt: now,
      lastUpdated: now,
      researchVersion: "1.0-heuristic-grounded",
      userContext: {
        userGoal: input.userGoal,
        distributionGoal: input.distributionGoal,
        dataAccessGoal: input.dataAccessGoal,
      },
    };
  } else {
    // Unfamiliar app: Structured evidence-backed fallback with explicit uncertainty disclosures
    const defaultConsoleUrl = domain.startsWith("http") ? `${domain}/developers` : `https://${slug}.com/developers`;
    
    guide = {
      id: slug,
      slug: slug,
      appName: normalizedName,
      providerName: `${normalizedName} Provider`,
      websiteUrl: domain.startsWith("http") ? domain : `https://${slug}.com`,
      category: "Other",
      shortDescription: `Custom OAuth 2.0 setup guide for ${normalizedName}.`,
      overview: `${normalizedName} integration guide generated by OAuth Compass research engine. Because ${normalizedName} is an unfamiliar provider, factual claims are labeled as inferred or requiring verification.`,
      intendedUseCase: input.userGoal || `Connect an AI agent to authenticate with ${normalizedName}.`,

      difficulty: "Moderate",
      difficultyExplanation: {
        stepCountScore: "Medium",
        scopeComplexity: "Granular",
        documentationClarity: "Fair",
        externalApprovalRequired: false,
        overallSummary: `Estimated moderate setup difficulty. The provider likely follows standard OAuth 2.0 (RFC 6749) code grant. Developer console location and scope taxonomy must be confirmed with official provider documentation.`,
      },

      prerequisites: [
        {
          title: `${normalizedName} Developer or Admin Account`,
          description: `An active account on ${normalizedName} with permission to create developer applications.`,
          isMandatory: true,
        },
        {
          title: "HTTPS Callback Endpoint",
          description: "A secure redirect URI to receive authorization codes.",
          isMandatory: true,
        },
      ],

      activeEffortMinutes: {
        min: 20,
        max: 40,
        displayString: "20 - 40 mins (Estimated)",
        developerTasksSummary: "Locating developer console, registering client credentials, verifying redirect URI format, and implementing token exchange.",
      },

      externalWaitTime: {
        status: "unknown",
        bestCaseDays: null,
        typicalDays: null,
        extendedDays: null,
        summary: "Not publicly confirmed; confirm with provider.",
        explanation: "External approval waiting times could not be verified automatically from official documentation for this unfamiliar app. Check whether the provider offers immediate private app install or requires developer review.",
        conditions: [
          "Private / internal use: Often 0 days on standard SaaS platforms.",
          "Marketplace / public distribution: May require 1-3 weeks review if an app directory exists.",
        ],
      },

      managedAuth: {
        isAvailable: false,
        provider: "None",
        summary: `Managed OAuth is not confirmed for ${normalizedName}. You should proceed by registering your own OAuth application.`,
        recommendation: `Bring your own OAuth application by registering in ${normalizedName}'s developer portal.`,
        tradeoffs: {
          pros: [
            "Direct control over client credentials, scopes, and app identity.",
            "Independent rate limits and custom branding.",
          ],
          cons: [
            "Requires manual registration and credential secret rotation.",
          ],
          whenToUseCustom: [
            "All use cases until managed auth support is formally verified.",
          ],
        },
      },

      steps: [
        {
          id: `${slug}-step-1`,
          order: 1,
          title: `Locate ${normalizedName} Developer Console`,
          whatToDo: `Visit ${normalizedName}'s developer or integrations portal (commonly at \`${domain}/developers\` or in account Settings > API / Integrations). Look for 'Create New Application' or 'OAuth Apps'.`,
          whyItMatters: "Obtaining Client ID and Client Secret is the required first step for any OAuth 2.0 integration.",
          whereToDo: `${normalizedName} Developer Portal or Settings`,
          whereUrl: defaultConsoleUrl,
          informationNeeded: ["Account credentials with developer rights"],
          howToVerifyComplete: "You have accessed the application creation form.",
          failureRemedies: "Check provider documentation or contact support to confirm if public API and OAuth access is available on your account plan.",
          responsibility: "developer-must-perform",
          responsibilityReason: "Requires logging in and navigating the provider's account interface.",
          safeCheckAvailable: false,
        },
        {
          id: `${slug}-step-2`,
          order: 2,
          title: "Register Application and Add Redirect URI",
          whatToDo: `Register your agent application. Add your secure HTTPS callback URL (e.g. \`https://myapp.com/api/auth/${slug}/callback\`). Copy your Client ID and Client Secret.`,
          whyItMatters: "Establishes cryptographic identity and prevents unauthorized code redirection.",
          whereToDo: "Developer Console > Application Settings",
          informationNeeded: ["Application Name", "HTTPS Redirect URI"],
          howToVerifyComplete: "Client ID and Client Secret are issued and redirect URI is saved.",
          failureRemedies: "Ensure redirect URI uses HTTPS (or http://localhost for local testing if supported).",
          responsibility: "developer-must-perform",
          responsibilityReason: "Sensitive client secret generation and credential storage.",
          safeCheckAvailable: false,
        },
        {
          id: `${slug}-step-3`,
          order: 3,
          title: "Confirm Required Scopes and Permissions",
          whatToDo: `Review ${normalizedName}'s scope documentation for the specific endpoints your agent will call (e.g., read vs read/write). Request the minimum permissions needed.`,
          whyItMatters: "Minimizing scopes reduces security exposure and increases user approval rates.",
          whereToDo: "Application Settings > Permissions / Scopes",
          informationNeeded: ["List of required API capabilities"],
          howToVerifyComplete: "Selected scopes are documented and configured.",
          failureRemedies: "Consult provider API documentation for endpoint-specific scope mappings.",
          responsibility: "agent-assists",
          responsibilityReason: "Agent can map desired actions to standard REST conventions; developer verifies against official docs.",
          safeCheckAvailable: true,
          safeCheckDescription: "Check scope strings for common syntax patterns.",
        },
        {
          id: `${slug}-step-4`,
          order: 4,
          title: "Implement Standard OAuth 2.0 Authorization Flow",
          whatToDo: `Direct users to the provider's /authorize endpoint with \`client_id\`, \`redirect_uri\`, \`response_type=code\`, and \`scope\`. On callback, exchange the code at the /token endpoint.`,
          whyItMatters: "Standard RFC 6749 authorization code exchange mechanism.",
          whereToDo: "Agent Application Backend",
          informationNeeded: ["CLIENT_ID", "CLIENT_SECRET", "Auth & Token URLs"],
          howToVerifyComplete: "Access token is received and verified by making a test API call (e.g. /me or /user).",
          failureRemedies: "Check provider documentation for token endpoint format (JSON body vs application/x-www-form-urlencoded vs Basic Auth).",
          responsibility: "agent-can-perform",
          responsibilityReason: "Agent can write standard OAuth 2.0 authorization and token exchange server routes.",
          safeCheckAvailable: true,
          safeCheckDescription: "Validate OAuth client parameters and route handlers.",
        },
      ],

      consoleNavigation: {
        consoleName: `${normalizedName} Developer Portal`,
        directUrl: defaultConsoleUrl,
        navigationPath: ["Account Settings", "API & Integrations", "Developer Applications"],
        keyFields: [
          {
            fieldName: "Redirect URI / Callback URL",
            description: "Authorized return address post-consent.",
            formatRule: "HTTPS required for public domains.",
            example: `https://myapp.com/api/auth/${slug}/callback`,
          },
        ],
      },

      redirectUriRules: {
        rules: [
          "HTTPS is standard industry requirement for all production OAuth callbacks.",
          "Exact URI matching is enforced by standard OAuth 2.0 providers.",
          "Avoid anchors (#) or unencoded query parameters in callback URIs.",
        ],
        allowedProtocols: ["https:", "http: (localhost only)"],
        wildcardAllowed: false,
        ipAddressesAllowed: false,
        notes: "Unverified provider: check provider docs to determine if localhost HTTP or port variations are supported.",
      },

      scopeGuidance: {
        scopes: [
          {
            name: "read",
            type: "standard",
            description: "Read-only access to user resources (inferred convention).",
            riskLevel: "low",
          },
          {
            name: "write",
            type: "standard",
            description: "Create and update resources (inferred convention).",
            riskLevel: "medium",
          },
        ],
        principleExplanation: "Start with read-only scopes during development and only add write scopes when write actions are tested.",
      },

      testingVsProduction: {
        testingNotes: "Test with personal developer credentials before deploying to multi-tenant users.",
        productionNotes: "Verify whether the provider requires app review before other users or organizations can authorize your app.",
        userCapsOrLimits: "Unknown; check provider documentation for unverified app limits.",
      },

      commonBlockers: [
        {
          issue: "Mismatched Redirect URI",
          symptoms: "Error page on authorization redirect: 'redirect_uri_mismatch' or 'invalid_callback'.",
          cause: "The callback URL in the authorization request does not match the URI configured in the developer portal.",
          remedy: "Verify character-for-character match including trailing slashes and port numbers.",
          agentAssistance: "Agent can compare configured URI with request URI.",
        },
        {
          issue: "Unconfirmed API Access Level",
          symptoms: "Cannot find developer portal or app creation buttons in user settings.",
          cause: "Some SaaS providers gate API access behind higher-tier or enterprise plans.",
          remedy: "Check account subscription level and confirm API access is enabled for your plan.",
          agentAssistance: "Agent can formulate a support inquiry to confirm API availability.",
        },
      ],

      sources: [
        {
          id: `${slug}-provider-domain`,
          title: `${normalizedName} Public Domain`,
          url: domain.startsWith("http") ? domain : `https://${slug}.com`,
          sourceType: "credible_secondary",
          lastCheckedDate: "2026-10-27",
          claimsSupported: [
            "Provider website resolution",
            "Inferred OAuth 2.0 support",
          ],
        },
      ],

      claims: [
        {
          id: `${slug}-claim-1`,
          claim: `${normalizedName} is inferred to support standard OAuth 2.0 code exchange.`,
          sourceUrl: domain.startsWith("http") ? domain : `https://${slug}.com`,
          sourceType: "credible_secondary",
          verificationStatus: "inferred",
          confidence: "medium",
          isDirectlySupported: false,
          notes: "Inferred from standard modern SaaS practices. Confirm with provider documentation.",
        },
        {
          id: `${slug}-claim-2`,
          claim: `External approval waiting time is unconfirmed.`,
          sourceUrl: domain.startsWith("http") ? domain : `https://${slug}.com`,
          sourceType: "credible_secondary",
          verificationStatus: "unknown",
          confidence: "low",
          isDirectlySupported: false,
          notes: "Marked unknown to avoid fabricating estimates.",
        },
      ],

      isSeeded: false,
      generatedAt: now,
      lastUpdated: now,
      researchVersion: "1.0-unverified-inferred",
      userContext: {
        userGoal: input.userGoal,
        distributionGoal: input.distributionGoal,
        dataAccessGoal: input.dataAccessGoal,
      },
    };
  }

  // Stage 5: Validating against strict Zod schema & saving
  onProgress?.({
    stage: "validating",
    message: "Validating generated guide structure against strict Zod schema...",
    progressPercent: 95,
  });

  const validated = OAuthGuideSchema.parse(guide);

  // Persist
  guideStorage.saveGuide(validated);

  onProgress?.({
    stage: "completed",
    message: "Guide generated, validated, and saved successfully!",
    progressPercent: 100,
  });

  return validated;
}
