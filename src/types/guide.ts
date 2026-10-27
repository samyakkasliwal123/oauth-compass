export type ResponsibilityState = 
  | 'agent-can-perform'
  | 'agent-assists'
  | 'developer-must-perform';

export type DifficultyRating = 'Easy' | 'Moderate' | 'Complex' | 'Very Complex';

export type AppCategory = 
  | 'Communication'
  | 'Productivity'
  | 'Cloud Storage'
  | 'CRM & Sales'
  | 'Developer Tools'
  | 'Marketing'
  | 'Security'
  | 'Other';

export type SourceType = 
  | 'official_docs'
  | 'official_policy'
  | 'official_api_ref'
  | 'credible_secondary';

export type VerificationStatus = 'verified' | 'inferred' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  sourceType: SourceType;
  lastCheckedDate: string;
  claimsSupported: string[];
}

export interface FactualClaim {
  id: string;
  claim: string;
  sourceUrl: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  isDirectlySupported: boolean;
  notes?: string;
}

export interface ExternalWaitTimeModel {
  status: 'instant' | 'estimated' | 'unknown';
  bestCaseDays: number | null;
  typicalDays: number | null;
  extendedDays: number | null;
  summary: string;
  explanation: string;
  conditions: string[];
}

export interface SetupStep {
  id: string;
  order: number;
  title: string;
  whatToDo: string;
  whyItMatters: string;
  whereToDo: string;
  whereUrl?: string;
  informationNeeded: string[];
  howToVerifyComplete: string;
  failureRemedies: string;
  responsibility: ResponsibilityState;
  responsibilityReason: string;
  safeCheckAvailable: boolean;
  safeCheckDescription?: string;
}

export interface ConsoleNavigation {
  consoleName: string;
  directUrl?: string;
  navigationPath: string[];
  keyFields: Array<{
    fieldName: string;
    description: string;
    formatRule: string;
    example: string;
  }>;
}

export interface RedirectUriRules {
  rules: string[];
  allowedProtocols: string[];
  wildcardAllowed: boolean;
  ipAddressesAllowed: boolean;
  notes: string;
}

export interface ScopeGuidance {
  scopes: Array<{
    name: string;
    type: 'bot' | 'user' | 'standard' | 'sensitive' | 'restricted';
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    leastPrivilegeAlternative?: string;
  }>;
  principleExplanation: string;
  commonOverPrivilegedMistake?: string;
}

export interface BlockerAndRemedy {
  issue: string;
  symptoms: string;
  cause: string;
  remedy: string;
  agentAssistance: string;
}

export interface ManagedAuthEvaluation {
  isAvailable: boolean;
  provider: 'Composio' | 'Provider-Native' | 'None';
  summary: string;
  recommendation: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
    whenToUseCustom: string[];
  };
  supportedAuthSchemes?: string[];
}

export interface OAuthGuide {
  id: string;
  slug: string;
  appName: string;
  providerName: string;
  websiteUrl: string;
  logoUrl?: string;
  category: AppCategory;
  shortDescription: string;
  overview: string;
  intendedUseCase: string;
  
  // Difficulty & Explanations
  difficulty: DifficultyRating;
  difficultyExplanation: {
    stepCountScore: 'Low' | 'Medium' | 'High';
    scopeComplexity: 'Simple' | 'Granular' | 'Restricted/Audited';
    documentationClarity: 'Excellent' | 'Good' | 'Fair' | 'Sparse';
    externalApprovalRequired: boolean;
    overallSummary: string;
  };
  
  // Prerequisites
  prerequisites: Array<{
    title: string;
    description: string;
    isMandatory: boolean;
    accountTypeRequired?: string;
  }>;
  
  // Effort and Wait-Time
  activeEffortMinutes: {
    min: number;
    max: number;
    displayString: string;
    developerTasksSummary: string;
  };
  externalWaitTime: ExternalWaitTimeModel;
  
  // Managed OAuth vs BYO
  managedAuth: ManagedAuthEvaluation;
  
  // Setup Steps
  steps: SetupStep[];
  
  // Console & Configuration
  consoleNavigation?: ConsoleNavigation;
  redirectUriRules: RedirectUriRules;
  scopeGuidance: ScopeGuidance;
  
  // Testing vs Production
  testingVsProduction: {
    testingNotes: string;
    productionNotes: string;
    userCapsOrLimits?: string;
    verificationTriggers?: string;
  };
  
  // Blockers
  commonBlockers: BlockerAndRemedy[];
  
  // Evidence and Sources
  sources: SourceCitation[];
  claims: FactualClaim[];
  
  // Metadata
  isSeeded: boolean;
  generatedAt: string;
  lastUpdated: string;
  researchVersion: string;
  
  // Generation context
  userContext?: {
    userGoal?: string;
    distributionGoal?: 'personal' | 'internal' | 'public';
    dataAccessGoal?: 'read_only' | 'read_write';
  };
}
