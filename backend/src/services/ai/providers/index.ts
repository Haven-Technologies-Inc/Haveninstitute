/**
 * AI Providers Index - Provider factory and exports
 */

import { IAIProvider, AIProvider } from '../types';
import { openaiProvider } from './openai.provider';
import { deepseekProvider } from './deepseek.provider';
import { grokProvider } from './grok.provider';

const providers: Record<AIProvider, IAIProvider> = {
  openai: openaiProvider,
  deepseek: deepseekProvider,
  grok: grokProvider
};

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

export { openaiProvider, deepseekProvider, grokProvider };
