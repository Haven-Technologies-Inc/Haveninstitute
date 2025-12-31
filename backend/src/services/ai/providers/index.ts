/**
 * AI Providers Index - Provider factory with fallback support
 */

import { IAIProvider, AIProvider, AIMessage, AICompletionOptions, AICompletionResponse } from '../types';
import { openaiProvider } from './openai.provider';
import { deepseekProvider } from './deepseek.provider';
import { grokProvider } from './grok.provider';

const providers: Record<AIProvider, IAIProvider> = {
  openai: openaiProvider,
  deepseek: deepseekProvider,
  grok: grokProvider
};

// Default fallback order: OpenAI -> DeepSeek -> Grok
const DEFAULT_FALLBACK_ORDER: AIProvider[] = ['openai', 'deepseek', 'grok'];

export function getProvider(name?: AIProvider): IAIProvider {
  const providerName = name || (process.env.AI_PROVIDER as AIProvider) || 'openai';
  const provider = providers[providerName];
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerName}`);
  }
  
  return provider;
}

export function getAvailableProviders(): AIProvider[] {
  return Object.keys(providers) as AIProvider[];
}

/**
 * Get list of configured providers in fallback order
 */
export function getConfiguredProviders(): IAIProvider[] {
  const fallbackOrder = (process.env.AI_FALLBACK_ORDER?.split(',') as AIProvider[]) || DEFAULT_FALLBACK_ORDER;
  
  return fallbackOrder
    .map(name => providers[name])
    .filter(provider => provider && provider.isConfigured());
}

/**
 * Chat with automatic fallback to backup providers
 */
export async function chatWithFallback(
  messages: AIMessage[],
  options: AICompletionOptions = {},
  preferredProvider?: AIProvider
): Promise<AICompletionResponse> {
  const configuredProviders = getConfiguredProviders();
  
  if (configuredProviders.length === 0) {
    throw new Error('No AI providers are configured. Please set API keys in environment or admin settings.');
  }

  // If preferred provider is specified and configured, try it first
  if (preferredProvider) {
    const preferred = providers[preferredProvider];
    if (preferred?.isConfigured()) {
      // Move preferred to front, removing duplicates
      const reorderedProviders = [
        preferred,
        ...configuredProviders.filter(p => p.name !== preferredProvider)
      ];
      configuredProviders.length = 0;
      configuredProviders.push(...reorderedProviders);
    }
  }

  let lastError: Error | null = null;

  for (const provider of configuredProviders) {
    try {
      console.log(`🤖 Attempting AI request with ${provider.name}...`);
      const result = await provider.chat(messages, options);
      console.log(`✅ AI request successful with ${provider.name}`);
      return result;
    } catch (error: any) {
      console.warn(`⚠️ ${provider.name} failed: ${error.message}`);
      lastError = error;
      
      // Continue to next provider
      if (configuredProviders.indexOf(provider) < configuredProviders.length - 1) {
        console.log(`🔄 Falling back to next provider...`);
      }
    }
  }

  throw lastError || new Error('All AI providers failed');
}

/**
 * Stream chat with automatic fallback
 */
export async function* chatStreamWithFallback(
  messages: AIMessage[],
  options: AICompletionOptions = {},
  _preferredProvider?: AIProvider
): AsyncGenerator<{ content: string; done: boolean; provider: AIProvider }> {
  const configuredProviders = getConfiguredProviders();
  
  if (configuredProviders.length === 0) {
    throw new Error('No AI providers are configured');
  }

  let lastError: Error | null = null;

  for (const provider of configuredProviders) {
    try {
      console.log(`🤖 Attempting stream with ${provider.name}...`);
      for await (const chunk of provider.chatStream(messages, options)) {
        yield { ...chunk, provider: provider.name };
      }
      return; // Success, exit
    } catch (error: any) {
      console.warn(`⚠️ ${provider.name} stream failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error('All AI providers failed');
}

export { openaiProvider, deepseekProvider, grokProvider };
