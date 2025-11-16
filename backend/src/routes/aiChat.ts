import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// AI PROVIDER INTEGRATION
// ============================================================================

async function callAIProvider(
  messages: any[],
  provider: 'openai' | 'anthropic' | 'mock' = 'mock',
  apiKey?: string
): Promise<string> {
  if (provider === 'openai' && apiKey) {
    // OpenAI integration
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } else if (provider === 'anthropic' && apiKey) {
    // Anthropic Claude integration
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  } else {
    // Mock response
    return generateMockResponse(messages[messages.length - 1].content);
  }
}

function generateMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes('pharmacology') || message.includes('medication') || message.includes('drug')) {
    return 'For pharmacology questions, always remember the "5 Rights": Right patient, Right drug, Right dose, Right route, Right time. What specific medication would you like to discuss?';
  }

  if (message.includes('nclex') || message.includes('exam')) {
    return 'For NCLEX preparation, focus on prioritization, delegation, and patient safety. Practice questions regularly and review rationales for both correct and incorrect answers.';
  }

  if (message.includes('help') || message.includes('explain')) {
    return 'I\'m here to help! Please ask me any nursing-related questions, and I\'ll do my best to explain concepts clearly with examples.';
  }

  return 'That\'s a great question! In nursing practice, it\'s important to consider evidence-based approaches and patient-centered care. Could you provide more details about what specific aspect you\'d like to explore?';
}

// ============================================================================
// CREATE CHAT SESSION
// ============================================================================

router.post('/sessions', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { title, context } = req.body;

  const session = await prisma.aIChatSession.create({
    data: {
      userId,
      title: title || 'New Chat Session',
      context: context || null,
    },
  });

  res.status(201).json({
    message: 'Chat session created successfully',
    session,
  });
}));

// ============================================================================
// GET ALL SESSIONS
// ============================================================================

router.get('/sessions', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const sessions = await prisma.aIChatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ sessions });
}));

// ============================================================================
// GET SESSION BY ID
// ============================================================================

router.get('/sessions/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.aIChatSession.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  res.json({ session });
}));

// ============================================================================
// SEND MESSAGE
// ============================================================================

router.post('/sessions/:id/messages', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: sessionId } = req.params;
  const { message, provider = 'mock', apiKey } = req.body;

  if (!message) {
    throw new APIError('Message is required', 400);
  }

  // Verify session belongs to user
  const session = await prisma.aIChatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  // Save user message
  const userMessage = await prisma.aIChatMessage.create({
    data: {
      sessionId,
      role: 'USER',
      content: message,
    },
  });

  // Prepare messages for AI
  const conversationHistory = [
    {
      role: 'system',
      content: 'You are a helpful nursing education tutor specializing in NCLEX preparation. Provide clear, accurate explanations with examples.',
    },
    ...session.messages.map(m => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  // Get AI response
  const aiResponse = await callAIProvider(
    conversationHistory,
    provider,
    apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  );

  // Save AI response
  const assistantMessage = await prisma.aIChatMessage.create({
    data: {
      sessionId,
      role: 'ASSISTANT',
      content: aiResponse,
    },
  });

  // Update session
  await prisma.aIChatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  res.json({
    userMessage,
    assistantMessage,
  });
}));

// ============================================================================
// DELETE SESSION
// ============================================================================

router.delete('/sessions/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.aIChatSession.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  // Delete session (cascade will delete messages)
  await prisma.aIChatSession.delete({
    where: { id },
  });

  res.json({ message: 'Session deleted successfully' });
}));

// ============================================================================
// EXPLAIN QUESTION (Special endpoint)
// ============================================================================

router.post('/explain-question', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const {
    question,
    options,
    correctAnswer,
    userAnswer,
    provider = 'mock',
    apiKey,
  } = req.body;

  if (!question || !options || correctAnswer === undefined) {
    throw new APIError('Question, options, and correct answer are required', 400);
  }

  const prompt = `
I just answered this nursing question incorrectly. Please explain:

Question: ${question}

Options:
${options.map((opt: string, idx: number) => `${idx + 1}. ${opt}`).join('\n')}

Correct Answer: ${correctAnswer + 1}
My Answer: ${userAnswer !== undefined ? userAnswer + 1 : 'Not answered'}

Please explain:
1. Why the correct answer is right
2. Why my answer was wrong (if I answered incorrectly)
3. Key nursing concepts to remember
4. Related NCLEX topics
  `.trim();

  const messages = [
    {
      role: 'system',
      content: 'You are an expert nursing educator. Explain quiz questions clearly and help students understand nursing concepts.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const explanation = await callAIProvider(
    messages,
    provider,
    apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  );

  res.json({ explanation });
}));

// ============================================================================
// GET STUDY TIPS
// ============================================================================

router.get('/study-tips/:category', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { category } = req.params;

  // Predefined study tips by category
  const studyTips: Record<string, string[]> = {
    'Pharmacology': [
      'Learn drug classifications first, then individual drugs within each class',
      'Focus on common suffixes (-olol, -pril, -statin) to identify drug classes',
      'Always know side effects, contraindications, and nursing considerations',
      'Practice calculating dosages daily',
    ],
    'Medical-Surgical': [
      'Use the nursing process (ADPIE) for every patient scenario',
      'Understand pathophysiology before memorizing interventions',
      'Focus on priority setting and critical thinking',
      'Review lab values and what they indicate',
    ],
    'Pediatrics': [
      'Know developmental milestones for each age group',
      'Understand pediatric vital sign ranges',
      'Learn safe medication dosing for children',
      'Focus on family-centered care',
    ],
    'default': [
      'Practice questions daily and review rationales',
      'Create concept maps to connect related topics',
      'Use spaced repetition for long-term retention',
      'Join study groups for collaborative learning',
    ],
  };

  const tips = studyTips[category] || studyTips['default'];

  res.json({ category, tips });
}));

export default router;
