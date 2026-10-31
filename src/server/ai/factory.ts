import { AIProvider, AIProviderType } from './types';
import { GeminiAdapter } from './gemini-adapter';
import { OpenAIAdapter } from './openai-adapter';
import { AnthropicAdapter } from './anthropic-adapter';

const providerRegistry: Record<AIProviderType, AIProvider> = {
  gemini: new GeminiAdapter(),
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
};

export function getAIProvider(providerType: AIProviderType = 'gemini'): AIProvider {
  const provider = providerRegistry[providerType];
  if (!provider) {
    throw new Error(
      `Unsupported AI provider: "${providerType}". Supported providers: ${Object.keys(providerRegistry).join(', ')}`
    );
  }
  return provider;
}

export function registerAIProvider(provider: AIProvider): void {
  providerRegistry[provider.name] = provider;
}

export function getAvailableProviders(): Array<{ id: AIProviderType; name: string; defaultModel: string }> {
  return [
    { id: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-1.5-flash' },
    { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o-mini' },
    { id: 'anthropic', name: 'Anthropic Claude', defaultModel: 'claude-3-haiku' },
  ];
}
