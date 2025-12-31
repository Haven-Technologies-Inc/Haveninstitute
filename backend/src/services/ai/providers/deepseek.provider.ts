/**
 * DeepSeek Provider - DeepSeek Chat, DeepSeek Coder
 * 
 * Reads API key from database settings (admin dashboard) with env fallback
 */

import {
  IAIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk
} from '../types';
import { SystemSettings } from '../../../models/SystemSettings';

export class DeepSeekProvider implements IAIProvider {
  name: 'deepseek' = 'deepseek';
  private baseUrl: string;
  private defaultModel: string;
  private cachedApiKey: string | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute cache
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000;

  constructor() {
    this.baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    this.defaultModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    console.log('✅ DeepSeek provider initialized (will fetch key from settings)');
  }

  /**
   * Get API key from database settings with env fallback
   */
  private async getApiKey(): Promise<string> {
    const now = Date.now();
    
    // Return cached key if still valid
    if (this.cachedApiKey && now < this.cacheExpiry) {
      return this.cachedApiKey;
    }

    try {
      // Try to get from database first
      const dbKey = await SystemSettings.getValue('deepseek_api_key');
      if (dbKey && dbKey.length > 10 && !dbKey.includes('your-')) {
        this.cachedApiKey = dbKey;
        this.cacheExpiry = now + this.CACHE_TTL;
        return dbKey;
      }
    } catch (error) {
      // Database not available, fall back to env
    }

    // Fallback to environment variable
    const envKey = process.env.DEEPSEEK_API_KEY || '';
    this.cachedApiKey = envKey;
    this.cacheExpiry = now + this.CACHE_TTL;
    return envKey;
  }

  isConfigured(): boolean {
    // Check synchronously using cached value or env
    const key = this.cachedApiKey || process.env.DEEPSEEK_API_KEY || '';
    return !!key && key.length > 10 && !key.includes('your-');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async chat(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResponse> {
    let lastError: Error | null = null;

    const apiKey = await this.getApiKey();

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: options.model || this.defaultModel,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2048,
            top_p: options.topP ?? 1,
            frequency_penalty: options.frequencyPenalty ?? 0,
            presence_penalty: options.presencePenalty ?? 0,
            stop: options.stop
          })
        });

        if (response.status === 429) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.warn(`DeepSeek rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.MAX_RETRIES})`);
          await this.sleep(delay);
          continue;
        }

        if (!response.ok) {
          const error = await response.json() as any;
          throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        const choice = data.choices[0];

        return {
          content: choice.message.content,
          model: data.model,
          provider: 'deepseek',
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0
          },
          finishReason: choice.finish_reason
        };
      } catch (error: any) {
        lastError = error;
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.warn(`DeepSeek request failed. Retrying in ${delay}ms:`, error.message);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('DeepSeek API request failed after retries');
  }

  async *chatStream(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<AIStreamChunk> {
    const apiKey = await this.getApiKey();
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              yield { content, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

export const deepseekProvider = new DeepSeekProvider();
