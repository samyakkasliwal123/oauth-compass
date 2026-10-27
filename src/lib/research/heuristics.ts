import { AppCategory, DifficultyRating, ResponsibilityState } from "@/types/guide";

export interface ProviderKnowledgeBase {
  appName: string;
  providerName: string;
  websiteUrl: string;
  logoUrl?: string;
  category: AppCategory;
  defaultDifficulty: DifficultyRating;
  officialDocUrl: string;
  consoleUrl: string;
  consoleName: string;
  navigationPath: string[];
  redirectUriRules: string[];
  supportedAuthSchemes: string[];
  composioManagedAvailable: boolean;
  commonScopes: Array<{
    name: string;
    type: "bot" | "user" | "standard" | "sensitive" | "restricted";
    description: string;
    riskLevel: "low" | "medium" | "high";
  }>;
  commonBlockers: Array<{
    issue: string;
    symptoms: string;
    cause: string;
    remedy: string;
  }>;
  typicalActiveMinutes: { min: number; max: number };
  approvalWaitSummary: string;
  approvalWaitExplanation: string;
}

export const KNOWN_PROVIDER_KNOWLEDGE: Record<string, ProviderKnowledgeBase> = {
  github: {
    appName: "GitHub",
    providerName: "GitHub (Microsoft)",
    websiteUrl: "https://github.com",
    logoUrl: "https://github.githubassets.com/favicons/favicon.png",
    category: "Developer Tools",
    defaultDifficulty: "Easy",
    officialDocUrl: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps",
    consoleUrl: "https://github.com/settings/developers",
    consoleName: "GitHub Developer Settings",
    navigationPath: ["Settings", "Developer settings", "OAuth Apps > New OAuth App"],
    redirectUriRules: [
      "Must match the registered Authorization callback URL.",
      "Localhost (http://localhost or http://127.0.0.1) allowed for development.",
      "HTTPS required for production deployments.",
    ],
    supportedAuthSchemes: ["OAUTH2", "PERSONAL_ACCESS_TOKEN", "GITHUB_APP"],
    composioManagedAvailable: true,
    commonScopes: [
      { name: "read:user", type: "standard", description: "Read user profile data", riskLevel: "low" },
      { name: "repo", type: "sensitive", description: "Full control of private repositories", riskLevel: "high" },
      { name: "public_repo", type: "standard", description: "Access public repositories only", riskLevel: "medium" },
    ],
    commonBlockers: [
      {
        issue: "Organization OAuth App Access Restrictions",
        symptoms: "Agent can access personal repos but receives 404/403 for company organization repos.",
        cause: "Organization owner has enabled Third-party application access restrictions.",
        remedy: "Request an organization owner approve or grant access to the OAuth App in Org Settings > Third-party Access.",
      },
    ],
    typicalActiveMinutes: { min: 10, max: 20 },
    approvalWaitSummary: "Instant (0 days) for direct authorization; GitHub Marketplace listing takes 1-2 weeks.",
    approvalWaitExplanation: "No GitHub verification required for personal or organizational authorization.",
  },
  discord: {
    appName: "Discord",
    providerName: "Discord Inc.",
    websiteUrl: "https://discord.com",
    logoUrl: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    category: "Communication",
    defaultDifficulty: "Moderate",
    officialDocUrl: "https://discord.com/developers/docs/topics/oauth2",
    consoleUrl: "https://discord.com/developers/applications",
    consoleName: "Discord Developer Portal",
    navigationPath: ["Applications", "[Select App]", "OAuth2 > General"],
    redirectUriRules: [
      "Must use HTTPS in production; http://localhost allowed for development.",
      "Strict exact URI matching enforced.",
    ],
    supportedAuthSchemes: ["OAUTH2", "BOT_TOKEN"],
    composioManagedAvailable: true,
    commonScopes: [
      { name: "identify", type: "standard", description: "Read user identity and avatar", riskLevel: "low" },
      { name: "bot", type: "bot", description: "Add bot to a server with permission flags", riskLevel: "medium" },
      { name: "messages.read", type: "sensitive", description: "Read message history in server channels", riskLevel: "high" },
    ],
    commonBlockers: [
      {
        issue: "Privileged Gateway Intents Missing",
        symptoms: "Bot receives HTTP events but cannot read message content (Message Content Intent error).",
        cause: "Privileged gateway intents (Message Content, Server Members) must be explicitly toggled in the Developer Portal.",
        remedy: "Navigate to Bot tab in Developer Portal and enable 'Message Content Intent'. If over 100 servers, requires bot verification.",
      },
    ],
    typicalActiveMinutes: { min: 15, max: 25 },
    approvalWaitSummary: "0 days for under 100 servers; 5-10 business days for Bot Verification if exceeding 100 servers.",
    approvalWaitExplanation: "Unverified bots can join up to 100 Discord servers instantly. Exceeding 100 servers triggers mandatory identity verification.",
  },
  linear: {
    appName: "Linear",
    providerName: "Linear Orbit, Inc.",
    websiteUrl: "https://linear.app",
    logoUrl: "https://linear.app/static/apple-touch-icon.png",
    category: "Productivity",
    defaultDifficulty: "Easy",
    officialDocUrl: "https://developers.linear.app/docs/graphql/working-with-the-graphql-api#authentication",
    consoleUrl: "https://linear.app/settings/api/applications/new",
    consoleName: "Linear Workspace Settings",
    navigationPath: ["Settings", "Workspace", "API", "Applications > Create"],
    redirectUriRules: [
      "HTTPS required for production.",
      "Exact URI matching enforced.",
    ],
    supportedAuthSchemes: ["OAUTH2", "PERSONAL_API_KEY"],
    composioManagedAvailable: true,
    commonScopes: [
      { name: "read", type: "standard", description: "Read issues, projects, cycles, and comments", riskLevel: "low" },
      { name: "write", type: "standard", description: "Create and update issues and comments", riskLevel: "medium" },
      { name: "issues:create", type: "standard", description: "Granular scope for issue creation only", riskLevel: "low" },
    ],
    commonBlockers: [
      {
        issue: "Workspace Admin Approval Required",
        symptoms: "User attempting OAuth install receives 'Admin approval needed' screen.",
        cause: "Linear workspace security settings restrict integrations to Workspace Admins.",
        remedy: "Request workspace admin to authorize the application or adjust API permissions in Workspace Settings.",
      },
    ],
    typicalActiveMinutes: { min: 10, max: 20 },
    approvalWaitSummary: "Instant (0 days) for direct authorization.",
    approvalWaitExplanation: "Linear does not require external app review for direct OAuth 2.0 installations.",
  },
  salesforce: {
    appName: "Salesforce",
    providerName: "Salesforce, Inc.",
    websiteUrl: "https://salesforce.com",
    category: "CRM & Sales",
    defaultDifficulty: "Complex",
    officialDocUrl: "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_flows.htm",
    consoleUrl: "https://login.salesforce.com",
    consoleName: "Salesforce Setup (Connected Apps)",
    navigationPath: ["Setup", "App Manager", "New Connected App"],
    redirectUriRules: [
      "HTTPS required in production; localhost HTTP allowed.",
      "No fragments allowed.",
    ],
    supportedAuthSchemes: ["OAUTH2", "CONNECTED_APP"],
    composioManagedAvailable: true,
    commonScopes: [
      { name: "api", type: "standard", description: "Access and manage user data via REST/SOAP", riskLevel: "high" },
      { name: "refresh_token, offline_access", type: "standard", description: "Perform requests on your behalf at any time", riskLevel: "high" },
    ],
    commonBlockers: [
      {
        issue: "Connected App 2-10 Minute Propagation Delay",
        symptoms: "Immediate authorization attempts after creating connected app fail with 'invalid_client_id'.",
        cause: "Salesforce clusters take 2 to 10 minutes to propagate new connected app definitions across instances.",
        remedy: "Wait 10 minutes after clicking Save on a new Connected App before initiating OAuth.",
      },
    ],
    typicalActiveMinutes: { min: 30, max: 50 },
    approvalWaitSummary: "Instant (0 days) for direct Connected App use; 3-6 weeks for AppExchange Security Review.",
    approvalWaitExplanation: "Internal org or direct-install connected apps require 0 external wait time. Commercial AppExchange distribution requires rigorous security review ($2,550 fee).",
  },
};
