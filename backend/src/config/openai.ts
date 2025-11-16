import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export const openaiConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-4',
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS) || 1000,
  temperature: 0.7,
  systemPrompt: `You are an expert NCLEX tutor helping nursing students prepare for their exam.
Provide clear, evidence-based explanations and use the Socratic method to help students learn.
Always cite rationales and explain the "why" behind concepts.`
};

// DeepSeek configuration (alternative to OpenAI)
export const deepseekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  model: 'deepseek-chat',
  enabled: !!process.env.DEEPSEEK_API_KEY
};
