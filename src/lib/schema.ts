import { z } from "zod";

export const ResponsibilityStateSchema = z.enum([
  "agent-can-perform",
  "agent-assists",
  "developer-must-perform",
]);

export const DifficultyRatingSchema = z.enum([
  "Easy",
  "Moderate",
  "Complex",
  "Very Complex",
]);

export const AppCategorySchema = z.enum([
  "Communication",
  "Productivity",
  "Cloud Storage",
  "CRM & Sales",
  "Developer Tools",
  "Marketing",
  "Security",
  "Other",
]);

export const SourceTypeSchema = z.enum([
  "official_docs",
  "official_policy",
  "official_api_ref",
  "credible_secondary",
]);

export const VerificationStatusSchema = z.enum([
  "verified",
  "inferred",
  "unknown",
]);

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);

export const SourceCitationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  url: z.string().url(),
  sourceType: SourceTypeSchema,
  lastCheckedDate: z.string(),
  claimsSupported: z.array(z.string()),
});

export const FactualClaimSchema = z.object({
  id: z.string(),
  claim: z.string().min(1),
  sourceUrl: z.string(),
  sourceType: SourceTypeSchema,
  verificationStatus: VerificationStatusSchema,
  confidence: ConfidenceLevelSchema,
  isDirectlySupported: z.boolean(),
  notes: z.string().optional(),
});

export const ExternalWaitTimeModelSchema = z.object({
  status: z.enum(["instant", "estimated", "unknown"]),
  bestCaseDays: z.number().nullable(),
  typicalDays: z.number().nullable(),
  extendedDays: z.number().nullable(),
  summary: z.string(),
  explanation: z.string(),
  conditions: z.array(z.string()),
});

export const SetupStepSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  title: z.string().min(1),
  whatToDo: z.string().min(1),
  whyItMatters: z.string().min(1),
  whereToDo: z.string().min(1),
  whereUrl: z.string().url().optional(),
  informationNeeded: z.array(z.string()),
  howToVerifyComplete: z.string().min(1),
  failureRemedies: z.string().min(1),
  responsibility: ResponsibilityStateSchema,
  responsibilityReason: z.string().min(1),
  safeCheckAvailable: z.boolean(),
  safeCheckDescription: z.string().optional(),
});

export const ConsoleNavigationSchema = z.object({
  consoleName: z.string(),
  directUrl: z.string().url().optional(),
  navigationPath: z.array(z.string()),
  keyFields: z.array(
    z.object({
      fieldName: z.string(),
      description: z.string(),
      formatRule: z.string(),
      example: z.string(),
    })
  ),
}).optional();

export const RedirectUriRulesSchema = z.object({
  rules: z.array(z.string()),
  allowedProtocols: z.array(z.string()),
  wildcardAllowed: z.boolean(),
  ipAddressesAllowed: z.boolean(),
  notes: z.string(),
});

export const ScopeGuidanceSchema = z.object({
  scopes: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["bot", "user", "standard", "sensitive", "restricted"]),
      description: z.string(),
      riskLevel: z.enum(["low", "medium", "high"]),
      leastPrivilegeAlternative: z.string().optional(),
    })
  ),
  principleExplanation: z.string(),
  commonOverPrivilegedMistake: z.string().optional(),
});

export const BlockerAndRemedySchema = z.object({
  issue: z.string(),
  symptoms: z.string(),
  cause: z.string(),
  remedy: z.string(),
  agentAssistance: z.string(),
});

export const ManagedAuthEvaluationSchema = z.object({
  isAvailable: z.boolean(),
  provider: z.enum(["Composio", "Provider-Native", "None"]),
  summary: z.string(),
  recommendation: z.string(),
  tradeoffs: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    whenToUseCustom: z.array(z.string()),
  }),
  supportedAuthSchemes: z.array(z.string()).optional(),
});

export const OAuthGuideSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  appName: z.string().min(1),
  providerName: z.string().min(1),
  websiteUrl: z.string().url(),
  logoUrl: z.string().optional(),
  category: AppCategorySchema,
  shortDescription: z.string().min(1),
  overview: z.string().min(1),
  intendedUseCase: z.string().min(1),
  difficulty: DifficultyRatingSchema,
  difficultyExplanation: z.object({
    stepCountScore: z.enum(["Low", "Medium", "High"]),
    scopeComplexity: z.enum(["Simple", "Granular", "Restricted/Audited"]),
    documentationClarity: z.enum(["Excellent", "Good", "Fair", "Sparse"]),
    externalApprovalRequired: z.boolean(),
    overallSummary: z.string(),
  }),
  prerequisites: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      isMandatory: z.boolean(),
      accountTypeRequired: z.string().optional(),
    })
  ),
  activeEffortMinutes: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    displayString: z.string(),
    developerTasksSummary: z.string(),
  }),
  externalWaitTime: ExternalWaitTimeModelSchema,
  managedAuth: ManagedAuthEvaluationSchema,
  steps: z.array(SetupStepSchema).min(1),
  consoleNavigation: ConsoleNavigationSchema,
  redirectUriRules: RedirectUriRulesSchema,
  scopeGuidance: ScopeGuidanceSchema,
  testingVsProduction: z.object({
    testingNotes: z.string(),
    productionNotes: z.string(),
    userCapsOrLimits: z.string().optional(),
    verificationTriggers: z.string().optional(),
  }),
  commonBlockers: z.array(BlockerAndRemedySchema),
  sources: z.array(SourceCitationSchema).min(1),
  claims: z.array(FactualClaimSchema),
  isSeeded: z.boolean(),
  generatedAt: z.string(),
  lastUpdated: z.string(),
  researchVersion: z.string(),
  userContext: z
    .object({
      userGoal: z.string().optional(),
      distributionGoal: z.enum(["personal", "internal", "public"]).optional(),
      dataAccessGoal: z.enum(["read_only", "read_write"]).optional(),
    })
    .optional(),
});

export const GenerateGuideInputSchema = z.object({
  appNameOrUrl: z.string().min(2, "App name or URL is required").max(200),
  userGoal: z.string().max(1000).optional(),
  distributionGoal: z.enum(["personal", "internal", "public"]).optional(),
  dataAccessGoal: z.enum(["read_only", "read_write"]).optional(),
});

export type GenerateGuideInput = z.infer<typeof GenerateGuideInputSchema>;
