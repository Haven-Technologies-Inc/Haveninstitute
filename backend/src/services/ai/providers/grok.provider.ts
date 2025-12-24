/**
 * Grok Provider - xAI Grok models
 */

import {
  IAIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk
} from '../types';

export class GrokProvider implements IAIProvider {
  name: 'grok' = 'grok';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
    this.baseUrl = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
    this.defaultModel = process.env.GROK_MODEL || 'grok-beta';

    if (!this.apiKey) {
      console.warn('⚠️ Grok/xAI API key not configured');
    }
  }

  async chat(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        top_p: options.topP ?? 1,
        stop: options.stop
      })
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(`Grok API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as any;
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: data.model,
      provider: 'grok',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      finishReason: choice.finish_reason
    };
  }

  async *chatStream(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<AIStreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
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
      throw new Error(`Grok API error: ${response.statusText}`);
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

export const grokProvider = new GrokProvider();
