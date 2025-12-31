// AI Integration API Service
// Handles OpenAI, DeepSeek, and Grok AI configuration and testing
// Now syncs with backend database for proper server-side API key storage

import api from './api';

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  apiUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  status?: 'active' | 'inactive' | 'error';
  lastTested?: string;
}

export interface OpenAIConfig extends AIProvider {
  id: 'openai';
  name: 'OpenAI';
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  organizationId?: string;
}

export interface DeepSeekConfig extends AIProvider {
  id: 'deepseek';
  name: 'DeepSeek AI';
  model: 'deepseek-chat' | 'deepseek-coder';
  apiUrl: string;
}

export interface GrokConfig extends AIProvider {
  id: 'grok';
  name: 'Grok (xAI)';
  model: 'grok-beta' | 'grok-2';
  apiUrl: string;
}

export interface AITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  model?: string;
  error?: string;
}

const STORAGE_KEY = 'nursehaven_ai_integrations';

// Default configurations
const DEFAULT_OPENAI_CONFIG: OpenAIConfig = {
  id: 'openai',
  name: 'OpenAI',
  enabled: false,
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-4-turbo',
  maxTokens: 2000,
  temperature: 0.7,
  organizationId: '',
  status: 'inactive'
};

const DEFAULT_DEEPSEEK_CONFIG: DeepSeekConfig = {
  id: 'deepseek',
  name: 'DeepSeek AI',
  enabled: false,
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 4000,
  temperature: 0.7,
  status: 'inactive'
};

const DEFAULT_GROK_CONFIG: GrokConfig = {
  id: 'grok',
  name: 'Grok (xAI)',
  enabled: false,
  apiKey: '',
  apiUrl: 'https://api.x.ai/v1',
  model: 'grok-beta',
  maxTokens: 4000,
  temperature: 0.7,
  status: 'inactive'
};

// Get all AI integrations
export const getAllAIIntegrations = (): {
  openai: OpenAIConfig;
  deepseek: DeepSeekConfig;
  grok: GrokConfig;
} => {
  if (typeof window === 'undefined') {
    return {
      openai: DEFAULT_OPENAI_CONFIG,
      deepseek: DEFAULT_DEEPSEEK_CONFIG,
      grok: DEFAULT_GROK_CONFIG
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        openai: { ...DEFAULT_OPENAI_CONFIG, ...parsed.openai },
        deepseek: { ...DEFAULT_DEEPSEEK_CONFIG, ...parsed.deepseek },
        grok: { ...DEFAULT_GROK_CONFIG, ...parsed.grok }
      };
    }
  } catch (error) {
    console.error('Error loading AI integrations:', error);
  }

  return {
    openai: DEFAULT_OPENAI_CONFIG,
    deepseek: DEFAULT_DEEPSEEK_CONFIG,
    grok: DEFAULT_GROK_CONFIG
  };
};

// Save AI integration configuration (localStorage + backend sync)
export const saveAIIntegration = (
  provider: 'openai' | 'deepseek' | 'grok',
  config: OpenAIConfig | DeepSeekConfig | GrokConfig
): void => {
  try {
    const current = getAllAIIntegrations();
    if (provider === 'openai') {
      current.openai = config as OpenAIConfig;
    } else if (provider === 'deepseek') {
      current.deepseek = config as DeepSeekConfig;
    } else if (provider === 'grok') {
      current.grok = config as GrokConfig;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (error) {
    console.error('Error saving AI integration:', error);
    throw new Error('Failed to save AI integration configuration');
  }
};

// Sync AI settings to backend database (called on save)
export const syncAISettingsToBackend = async (
  openaiConfig: OpenAIConfig,
  deepseekConfig: DeepSeekConfig,
  grokConfig: GrokConfig
): Promise<{ success: boolean; message: string }> => {
  try {
    await api.put('/admin/settings/ai', {
      openaiApiKey: openaiConfig.apiKey || null,
      openaiModel: openaiConfig.model || null,
      deepseekApiKey: deepseekConfig.apiKey || null,
      grokApiKey: grokConfig.apiKey || null,
      aiProvider: openaiConfig.enabled ? 'openai' : (deepseekConfig.enabled ? 'deepseek' : 'grok')
    });
    return { success: true, message: 'AI settings synced to database' };
  } catch (error: any) {
    console.error('Error syncing AI settings to backend:', error);
    return { success: false, message: error.message || 'Failed to sync AI settings' };
  }
};

// Fetch AI settings from backend
export const fetchAISettingsFromBackend = async (): Promise<{
  openaiApiKey: string | null;
  openaiModel: string | null;
  deepseekApiKey: string | null;
  grokApiKey: string | null;
  aiProvider: string | null;
} | null> => {
  try {
    const response = await api.get('/admin/settings/ai');
    return response.data?.data || null;
  } catch (error) {
    console.error('Error fetching AI settings from backend:', error);
    return null;
  }
};

// Test AI connection via backend
export const testAIConnectionViaBackend = async (
  provider: 'openai' | 'deepseek' | 'grok'
): Promise<AITestResult> => {
  try {
    const response = await api.post('/admin/settings/ai/test', { provider });
    return {
      success: true,
      message: response.data?.data?.message || `${provider} connection successful`,
      model: response.data?.data?.model
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Connection test failed',
      error: error.message
    };
  }
};

// Test OpenAI connection
export const testOpenAIConnection = async (
  config: OpenAIConfig
): Promise<AITestResult> => {
  const startTime = Date.now();

  try {
    // Validate API key format
    if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
      return {
        success: false,
        message: 'Invalid API key format. OpenAI keys start with "sk-"',
        error: 'Invalid API key format'
      };
    }

    // Test API call
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.organizationId && { 'OpenAI-Organization': config.organizationId })
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message from NurseHaven. Please respond with "OK".'
          }
        ],
        max_tokens: 10,
        temperature: 0.5
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `OpenAI API error: ${errorData.error?.message || response.statusText}`,
        responseTime,
        error: errorData.error?.message || response.statusText
      };
    }

    const data = await response.json();

    // Update status and last tested
    const updatedConfig = {
      ...config,
      status: 'active' as const,
      lastTested: new Date().toISOString()
    };
    saveAIIntegration('openai', updatedConfig);

    return {
      success: true,
      message: `✅ OpenAI connection successful! Model: ${data.model}`,
      responseTime,
      model: data.model
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
};

// Test DeepSeek connection
export const testDeepSeekConnection = async (
  config: DeepSeekConfig
): Promise<AITestResult> => {
  const startTime = Date.now();

  try {
    // Validate API key
    if (!config.apiKey) {
      return {
        success: false,
        message: 'API key is required',
        error: 'Missing API key'
      };
    }

    // Test API call
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message from NurseHaven. Please respond with "OK".'
          }
        ],
        max_tokens: 10,
        temperature: 0.5
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `DeepSeek API error: ${errorData.error?.message || response.statusText}`,
        responseTime,
        error: errorData.error?.message || response.statusText
      };
    }

    const data = await response.json();

    // Update status and last tested
    const updatedConfig = {
      ...config,
      status: 'active' as const,
      lastTested: new Date().toISOString()
    };
    saveAIIntegration('deepseek', updatedConfig);

    return {
      success: true,
      message: `✅ DeepSeek connection successful! Model: ${data.model}`,
      responseTime,
      model: data.model
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
};

// Test Grok connection
export const testGrokConnection = async (
  config: GrokConfig
): Promise<AITestResult> => {
  const startTime = Date.now();

  try {
    // Validate API key
    if (!config.apiKey) {
      return {
        success: false,
        message: 'API key is required',
        error: 'Missing API key'
      };
    }

    // Test API call
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message from NurseHaven. Please respond with "OK".'
          }
        ],
        max_tokens: 10,
        temperature: 0.5
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `Grok API error: ${errorData.error?.message || response.statusText}`,
        responseTime,
        error: errorData.error?.message || response.statusText
      };
    }

    const data = await response.json();

    // Update status and last tested
    const updatedConfig = {
      ...config,
      status: 'active' as const,
      lastTested: new Date().toISOString()
    };
    saveAIIntegration('grok', updatedConfig);

    return {
      success: true,
      message: `✅ Grok connection successful! Model: ${data.model}`,
      responseTime,
      model: data.model
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
};

// Generate AI chat completion (unified interface)
export const generateAICompletion = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    provider?: 'openai' | 'deepseek' | 'auto';
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{ content: string; provider: string; model: string }> => {
  const integrations = getAllAIIntegrations();
  let provider = options?.provider || 'auto';

  // Auto-select provider
  if (provider === 'auto') {
    if (integrations.openai.enabled && integrations.openai.status === 'active') {
      provider = 'openai';
    } else if (integrations.deepseek.enabled && integrations.deepseek.status === 'active') {
      provider = 'deepseek';
    } else {
      throw new Error('No AI provider is configured and active');
    }
  }

  const config = provider === 'openai' ? integrations.openai : integrations.deepseek;

  if (!config.enabled) {
    throw new Error(`${config.name} is not enabled`);
  }

  if (!config.apiKey) {
    throw new Error(`${config.name} API key is not configured`);
  }

  const response = await fetch(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      ...(provider === 'openai' && integrations.openai.organizationId && {
        'OpenAI-Organization': integrations.openai.organizationId
      })
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: options?.maxTokens || config.maxTokens,
      temperature: options?.temperature || config.temperature
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `${config.name} API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    provider: config.name,
    model: data.model
  };
};

// Generate study plan using AI
export const generateStudyPlan = async (
  userProfile: {
    targetDate: string;
    weeklyHours: number;
    weakAreas: string[];
    strengths: string[];
  },
  provider?: 'openai' | 'deepseek' | 'auto'
): Promise<string> => {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an expert NCLEX study advisor. Create personalized study plans for nursing students.'
    },
    {
      role: 'user' as const,
      content: `Create a personalized NCLEX study plan for a student with the following profile:
- Target exam date: ${userProfile.targetDate}
- Weekly study hours available: ${userProfile.weeklyHours}
- Weak areas: ${userProfile.weakAreas.join(', ')}
- Strengths: ${userProfile.strengths.join(', ')}

Please provide a detailed, week-by-week study plan with specific topics to focus on.`
    }
  ];

  const result = await generateAICompletion(messages, { provider });
  return result.content;
};

// Generate question explanation using AI
export const generateQuestionExplanation = async (
  question: string,
  correctAnswer: string,
  userAnswer: string,
  provider?: 'openai' | 'deepseek' | 'auto'
): Promise<string> => {
  const messages = [
    {
      role: 'system' as const,
      content: 'You are an expert NCLEX tutor. Explain nursing questions clearly and provide learning insights.'
    },
    {
      role: 'user' as const,
      content: `Explain this NCLEX question:

Question: ${question}

Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Please explain why the correct answer is right and why the student's answer was incorrect. Provide key learning points.`
    }
  ];

  const result = await generateAICompletion(messages, { provider, maxTokens: 500 });
  return result.content;
};

// Get AI usage statistics
export const getAIUsageStats = (): {
  openai: { requests: number; lastUsed: string | null };
  deepseek: { requests: number; lastUsed: string | null };
} => {
  try {
    const stats = localStorage.getItem('nursehaven_ai_usage_stats');
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Error loading AI usage stats:', error);
  }

  return {
    openai: { requests: 0, lastUsed: null },
    deepseek: { requests: 0, lastUsed: null }
  };
};

// Reset AI integration
export const resetAIIntegration = (provider: 'openai' | 'deepseek' | 'grok'): void => {
  const defaults = {
    openai: DEFAULT_OPENAI_CONFIG,
    deepseek: DEFAULT_DEEPSEEK_CONFIG,
    grok: DEFAULT_GROK_CONFIG
  };

  saveAIIntegration(provider, defaults[provider]);
};

// Export configuration as JSON
export const exportAIConfiguration = (): string => {
  const integrations = getAllAIIntegrations();
  
  // Remove sensitive data for export
  const exportData = {
    openai: {
      ...integrations.openai,
      apiKey: integrations.openai.apiKey ? '***HIDDEN***' : '',
      organizationId: integrations.openai.organizationId ? '***HIDDEN***' : ''
    },
    deepseek: {
      ...integrations.deepseek,
      apiKey: integrations.deepseek.apiKey ? '***HIDDEN***' : ''
    },
    grok: {
      ...integrations.grok,
      apiKey: integrations.grok.apiKey ? '***HIDDEN***' : ''
    }
  };

  return JSON.stringify(exportData, null, 2);
};

// Validate API key format
export const validateAPIKey = (
  provider: 'openai' | 'deepseek',
  apiKey: string
): { valid: boolean; message: string } => {
  if (!apiKey) {
    return { valid: false, message: 'API key is required' };
  }

  if (provider === 'openai') {
    if (!apiKey.startsWith('sk-')) {
      return { valid: false, message: 'OpenAI API keys should start with "sk-"' };
    }
    if (apiKey.length < 40) {
      return { valid: false, message: 'OpenAI API key seems too short' };
    }
  }

  if (provider === 'deepseek') {
    if (apiKey.length < 20) {
      return { valid: false, message: 'DeepSeek API key seems too short' };
    }
  }

  return { valid: true, message: 'API key format looks valid' };
};
