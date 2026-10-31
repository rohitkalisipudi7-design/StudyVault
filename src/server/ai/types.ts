export type AIProviderType = 'gemini' | 'openai' | 'anthropic';

export interface ScopedResourceContext {
  id: string;
  title: string;
  type: 'file' | 'link';
  description: string;
  branchName: string;
  courseName: string;
  courseCode: string;
}

export interface AISearchResult {
  answer: string;
  matchedResourceIds: string[];
  relevanceExplanation: string;
}

export interface AISummaryResult {
  summary: string;
  keyTopics: string[];
  suggestedStudyQuestions: string[];
}

export interface AISuggestionResult {
  recommendations: Array<{
    resourceId: string;
    reason: string;
  }>;
}

export interface AIProvider {
  readonly name: AIProviderType;
  testConnection(apiKey: string): Promise<boolean>;
  search(query: string, resources: ScopedResourceContext[], apiKey: string): Promise<AISearchResult>;
  summarize(resource: ScopedResourceContext, apiKey: string): Promise<AISummaryResult>;
  suggest(
    studentContext: { branch?: string | null; course?: string | null },
    resources: ScopedResourceContext[],
    apiKey: string
  ): Promise<AISuggestionResult>;
}

export class AIProviderError extends Error {
  provider: AIProviderType;
  statusCode?: number;
  isRateLimit: boolean;
  isInvalidKey: boolean;

  constructor(
    message: string,
    provider: AIProviderType,
    opts?: { statusCode?: number; isRateLimit?: boolean; isInvalidKey?: boolean }
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.statusCode = opts?.statusCode;
    this.isRateLimit = !!opts?.isRateLimit;
    this.isInvalidKey = !!opts?.isInvalidKey;
  }
}
