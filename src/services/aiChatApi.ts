// ============================================================================
// AI CHAT API SERVICE
// ============================================================================
// AI-powered study assistant for nursing students
// Supports OpenAI, Anthropic Claude, and other providers

import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  context?: string; // Study context (e.g., "NCLEX Pharmacology")
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
}

// ============================================================================
// CHAT SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new chat session
 */
export const createChatSession = async (
  userId: string,
  title: string,
  context?: string
): Promise<ChatSession> => {
  try {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      userId,
      title,
      messages: [],
      context,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in localStorage for now (can be moved to Supabase)
    const sessions = getChatSessions(userId);
    sessions.push(session);
    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(sessions));

    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }
};

/**
 * Get all chat sessions for a user
 */
export const getChatSessions = (userId: string): ChatSession[] => {
  try {
    const sessionsJson = localStorage.getItem(`chat_sessions_${userId}`);
    if (!sessionsJson) return [];

    const sessions = JSON.parse(sessionsJson);
    return sessions.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

/**
 * Get a specific chat session
 */
export const getChatSession = (
  userId: string,
  sessionId: string
): ChatSession | null => {
  const sessions = getChatSessions(userId);
  return sessions.find(s => s.id === sessionId) || null;
};

/**
 * Update chat session
 */
export const updateChatSession = (
  userId: string,
  sessionId: string,
  updates: Partial<ChatSession>
): ChatSession | null => {
  try {
    const sessions = getChatSessions(userId);
    const index = sessions.findIndex(s => s.id === sessionId);

    if (index === -1) return null;

    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date()
    };

    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(sessions));
    return sessions[index];
  } catch (error) {
    console.error('Error updating chat session:', error);
    return null;
  }
};

/**
 * Delete chat session
 */
export const deleteChatSession = (userId: string, sessionId: string): boolean => {
  try {
    const sessions = getChatSessions(userId);
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
};

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Add a message to a chat session
 */
export const addMessage = (
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
): ChatMessage | null => {
  try {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      metadata
    };

    const session = getChatSession(userId, sessionId);
    if (!session) return null;

    session.messages.push(message);
    updateChatSession(userId, sessionId, { messages: session.messages });

    return message;
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
};

// ============================================================================
// AI INTEGRATION
// ============================================================================

/**
 * System prompt for nursing education AI assistant
 */
const NURSING_SYSTEM_PROMPT = `You are an expert nursing education AI assistant specializing in NCLEX preparation and nursing fundamentals. Your role is to:

1. Help nursing students understand complex medical concepts
2. Provide evidence-based explanations with references to nursing standards
3. Explain rationales for correct and incorrect answers
4. Use the nursing process (ADPIE: Assessment, Diagnosis, Planning, Implementation, Evaluation)
5. Emphasize patient safety and critical thinking
6. Provide mnemonics and memory aids when helpful
7. Always encourage students to verify information with authoritative sources

When answering questions:
- Be clear, concise, and educational
- Use proper medical terminology with explanations
- Cite nursing standards (ANA, CDC, etc.) when relevant
- Explain WHY, not just WHAT
- Encourage critical thinking with follow-up questions
- Never provide direct exam answers, but help students understand concepts

Remember: Patient safety and evidence-based practice are paramount.`;

/**
 * Send a message and get AI response
 * This is a placeholder that can be connected to actual AI providers
 */
export const sendMessage = async (
  userId: string,
  sessionId: string,
  userMessage: string,
  provider: AIProvider = { name: 'local', model: 'mock' }
): Promise<ChatMessage | null> => {
  try {
    // Add user message
    addMessage(userId, sessionId, 'user', userMessage);

    // Get AI response based on provider
    let assistantResponse: string;

    switch (provider.name) {
      case 'openai':
        assistantResponse = await getOpenAIResponse(sessionId, userId, userMessage, provider);
        break;
      case 'anthropic':
        assistantResponse = await getAnthropicResponse(sessionId, userId, userMessage, provider);
        break;
      case 'local':
      default:
        assistantResponse = getMockResponse(userMessage);
        break;
    }

    // Add assistant message
    return addMessage(userId, sessionId, 'assistant', assistantResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Get response from OpenAI API
 */
const getOpenAIResponse = async (
  sessionId: string,
  userId: string,
  message: string,
  provider: AIProvider
): Promise<string> => {
  // This is a placeholder implementation
  // In production, you would call the OpenAI API

  /*
  const session = getChatSession(userId, sessionId);
  const messages = session?.messages || [];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model || 'gpt-4',
      messages: [
        { role: 'system', content: NURSING_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
  */

  return `[OpenAI Response] I understand you're asking about: "${message}". This would be answered by the OpenAI API in production.`;
};

/**
 * Get response from Anthropic Claude API
 */
const getAnthropicResponse = async (
  sessionId: string,
  userId: string,
  message: string,
  provider: AIProvider
): Promise<string> => {
  // This is a placeholder implementation
  // In production, you would call the Anthropic API

  /*
  const session = getChatSession(userId, sessionId);
  const messages = session?.messages || [];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: provider.model || 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: NURSING_SYSTEM_PROMPT,
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();
  return data.content[0].text;
  */

  return `[Anthropic Claude Response] I understand you're asking about: "${message}". This would be answered by Claude API in production.`;
};

/**
 * Get mock response for development
 */
const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses for demonstration
  if (lowerMessage.includes('vital signs') || lowerMessage.includes('vitals')) {
    return `Normal vital signs for adults are:
- Blood Pressure: <120/80 mmHg
- Heart Rate: 60-100 bpm
- Respiratory Rate: 12-20 breaths/min
- Temperature: 97.8-99.1°F (36.5-37.3°C)
- Oxygen Saturation: 95-100%

Remember to assess vitals in the context of the patient's baseline and clinical condition. Always report significant changes to the healthcare provider.`;
  }

  if (lowerMessage.includes('infection control') || lowerMessage.includes('hand hygiene')) {
    return `Hand hygiene is the single most important measure to prevent healthcare-associated infections. Follow the WHO's 5 Moments:

1. Before touching a patient
2. Before clean/aseptic procedures
3. After body fluid exposure risk
4. After touching a patient
5. After touching patient surroundings

Use alcohol-based hand rub for 20-30 seconds or soap and water for 40-60 seconds when hands are visibly soiled.`;
  }

  if (lowerMessage.includes('nclex') || lowerMessage.includes('exam')) {
    return `NCLEX Success Strategies:

1. **Understand, Don't Memorize**: Focus on understanding concepts and applying the nursing process
2. **Practice Questions**: Do 75-100 practice questions daily
3. **Read Rationales**: Read explanations for both correct AND incorrect answers
4. **Prioritization**: Use ABCs (Airway, Breathing, Circulation) and Maslow's hierarchy
5. **Critical Thinking**: Ask yourself "What would the nurse do FIRST?"

Remember: NCLEX tests minimum competency for safe practice. Focus on patient safety!`;
  }

  if (lowerMessage.includes('medication') || lowerMessage.includes('drug')) {
    return `When administering medications, always follow the 6 Rights:

1. Right Patient (verify 2 identifiers)
2. Right Medication
3. Right Dose
4. Right Route
5. Right Time
6. Right Documentation

Also consider:
- Check for allergies
- Verify contraindications
- Assess patient's ability to take medication
- Educate patient about the medication
- Monitor for therapeutic effects and adverse reactions`;
  }

  // Generic nursing education response
  return `I'm here to help with your nursing education questions! I can assist with:

- NCLEX preparation and test-taking strategies
- Fundamental nursing concepts
- Pharmacology and medication administration
- Infection control and safety
- Patient assessment and care planning
- Pathophysiology and disease processes

What specific topic would you like to explore? The more specific your question, the better I can tailor my response to help you understand the concept.`;
};

// ============================================================================
// SPECIALIZED FEATURES
// ============================================================================

/**
 * Get question explanation
 */
export const explainQuestion = async (
  userId: string,
  questionText: string,
  options: string[],
  correctAnswer: number,
  userAnswer: number
): Promise<string> => {
  const isCorrect = userAnswer === correctAnswer;
  const correctOption = options[correctAnswer];
  const userOption = options[userAnswer];

  // In production, this would use AI to generate personalized explanations
  return `
**Your Answer**: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}

${isCorrect
    ? `Great job! You selected "${userOption}" which is correct.`
    : `You selected "${userOption}", but the correct answer is "${correctOption}".`
}

**Explanation**:
This question tests your understanding of [nursing concept]. The correct answer demonstrates [key principle].

**Why the correct answer is right**:
${correctOption} is correct because it follows evidence-based nursing practice and prioritizes patient safety.

**Why other options are incorrect**:
${options.filter((_, i) => i !== correctAnswer).map((opt, i) =>
    `- ${opt}: This option is incorrect because [reason]`
  ).join('\n')}

**Key Takeaway**: Remember to [important principle for future questions].
`;
};

/**
 * Get study tips for a category
 */
export const getStudyTips = (category: string): string => {
  const tips: Record<string, string> = {
    'Pharmacology': `
**Pharmacology Study Tips**:
1. Learn drug classes, not individual drugs
2. Understand mechanism of action
3. Know common side effects and nursing implications
4. Create mnemonics for drug classifications
5. Focus on prototype drugs first
`,
    'Medical-Surgical': `
**Med-Surg Study Tips**:
1. Use the nursing process (ADPIE)
2. Understand pathophysiology first
3. Focus on priority interventions
4. Learn to recognize complications
5. Practice prioritization questions
`,
    'Mental Health': `
**Mental Health Study Tips**:
1. Master therapeutic communication
2. Understand major psychiatric disorders
3. Know psychotropic medications
4. Learn crisis intervention techniques
5. Practice empathy and active listening
`
  };

  return tips[category] || 'Study tips for this category are being prepared.';
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const aiChatApi = {
  // Session Management
  createChatSession,
  getChatSessions,
  getChatSession,
  updateChatSession,
  deleteChatSession,

  // Messaging
  addMessage,
  sendMessage,

  // Specialized Features
  explainQuestion,
  getStudyTips
};

export default aiChatApi;
