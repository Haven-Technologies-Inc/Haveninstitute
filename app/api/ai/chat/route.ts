import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

const SYSTEM_PROMPT = `You are the Haven Institute NCLEX Master Tutor — the world's most advanced AI-powered nursing exam preparation assistant. Your mission is to help nursing students pass the NCLEX-RN and NCLEX-PN exams.

## Core Competencies
- **NCLEX Content Mastery**: Expert knowledge across all 8 NCLEX client needs categories
- **Clinical Reasoning**: Teach students HOW to think, not just WHAT to know
- **NextGen NCLEX**: Full support for all NGN question types (SATA, matrix, bow-tie, cloze, hotspot, ordered response, highlight, case studies)
- **Adaptive Teaching**: Adjust complexity based on student's demonstrated knowledge level

## Teaching Framework
1. **Assess First**: Ask clarifying questions to understand the student's current level
2. **Explain Concepts**: Use clear, structured explanations with clinical context
3. **Apply Knowledge**: Connect theory to real clinical scenarios
4. **Test Understanding**: Offer practice questions and check comprehension
5. **Reinforce**: Summarize key takeaways and identify areas for further study

## Response Guidelines
- Use bullet points and numbered lists for clarity
- Bold key terms and concepts
- Include clinical pearls and memory aids (mnemonics)
- Reference evidence-based nursing practice guidelines
- When explaining medications: include class, mechanism, indications, side effects, nursing implications
- When discussing procedures: include rationale, steps, expected outcomes, complications
- For priority questions: apply ABCs, Maslow's hierarchy, and nursing process
- For delegation: apply the 5 Rights of Delegation

## Safety
- Always clarify that you provide educational information only, not medical advice
- Direct students to consult instructors for clinical questions beyond exam prep
- Be encouraging but honest about knowledge gaps`;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { message, history } = body;

    if (!message) return errorResponse('Message is required');

    // Build messages array for the AI provider
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (Array.isArray(history)) {
      for (const msg of history.slice(-20)) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    // Try Claude API first, then OpenAI, then fall back to built-in responses
    const aiContent = await getAIResponse(messages, message);

    return successResponse({
      role: 'assistant',
      content: aiContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function getAIResponse(
  messages: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  // Try Anthropic Claude API
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: messages[0].content,
          messages: messages.slice(1).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content?.[0]?.text || 'I apologize, I had trouble generating a response. Please try again.';
      }
    } catch (e) {
      console.error('Anthropic API error:', e);
    }
  }

  // Try OpenAI API
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: messages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })),
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'I apologize, I had trouble generating a response. Please try again.';
      }
    } catch (e) {
      console.error('OpenAI API error:', e);
    }
  }

  // Fallback: intelligent keyword-based responses
  return getBuiltInResponse(userMessage);
}

function getBuiltInResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('pharmacol') || lower.includes('medication') || lower.includes('drug')) {
    return `## Pharmacology Review

**Key Principles for NCLEX Pharmacology Questions:**

### Drug Classification Strategy
Focus on **prototype drugs** — if you know the prototype, you can apply that knowledge to the entire class.

### Essential Drug Classes to Master:
1. **Antihypertensives** (ACE inhibitors, ARBs, Beta-blockers, CCBs)
   - Prototype: Lisinopril (ACE-I) — monitor for dry cough, angioedema
   - Prototype: Metoprolol (Beta-blocker) — hold if HR < 60

2. **Cardiac Glycosides** — Digoxin
   - Therapeutic range: 0.5-2.0 ng/mL
   - Check apical pulse x 60 seconds; hold if < 60 bpm
   - Monitor potassium (hypokalemia increases toxicity)

3. **Anticoagulants** — Heparin vs. Warfarin
   - Heparin: monitor aPTT, antidote = Protamine sulfate
   - Warfarin: monitor INR (2-3), antidote = Vitamin K

### Memory Aid: "**ABCDE**" for med administration
- **A**ssess the patient
- **B**arcode scan verification
- **C**heck the 6 Rights
- **D**ocument administration
- **E**valuate effectiveness

Would you like me to quiz you on any specific drug class?`;
  }

  if (lower.includes('priorit') || lower.includes('delegat') || lower.includes('assign')) {
    return `## Priority & Delegation Framework

### Priority Decision Framework (in order):
1. **ABCs** — Airway > Breathing > Circulation
2. **Maslow's Hierarchy** — Physiological > Safety > Love > Esteem > Self-Actualization
3. **Nursing Process** — Always assess before intervening
4. **Acute vs. Chronic** — Unstable/acute always comes first
5. **Actual vs. Potential** — Actual problems before risk-for problems

### The 5 Rights of Delegation:
| Right | Question to Ask |
|-------|----------------|
| **Right Task** | Can this task be delegated? |
| **Right Circumstance** | Is the patient stable enough? |
| **Right Person** | Is the UAP/LPN competent? |
| **Right Direction** | Did I give clear instructions? |
| **Right Supervision** | Can I follow up appropriately? |

### What RNs CANNOT Delegate:
- **A**ssessment (initial and ongoing)
- **T**eaching (patient education)
- **E**valuation (of outcomes)
- **N**ursing judgment (clinical decisions)

Shall I give you some priority practice questions?`;
  }

  if (lower.includes('lab') || lower.includes('value') || lower.includes('normal')) {
    return `## Critical Lab Values for NCLEX

| Lab Test | Normal Range | Critical Nursing Considerations |
|----------|-------------|--------------------------------|
| **Potassium (K+)** | 3.5-5.0 mEq/L | <3.5 or >5.0 = cardiac risk |
| **Sodium (Na+)** | 136-145 mEq/L | Fluid balance indicator |
| **Glucose** | 70-100 mg/dL (fasting) | <70 = hypoglycemia emergency |
| **BUN** | 10-20 mg/dL | Kidney function |
| **Creatinine** | 0.7-1.3 mg/dL | Most specific kidney marker |
| **Hemoglobin** | M: 14-18, F: 12-16 g/dL | Oxygen carrying capacity |
| **WBC** | 5,000-10,000/mm³ | <5,000 = infection risk |
| **Platelets** | 150,000-400,000/mm³ | <50,000 = bleeding precautions |
| **INR** | 0.8-1.1 (2-3 on warfarin) | Coagulation monitoring |
| **ABG pH** | 7.35-7.45 | <7.35 acidosis, >7.45 alkalosis |

### Memory Aid: **ROME** for ABGs
- **R**espiratory = **O**pposite (pH and CO2 go opposite directions)
- **M**etabolic = **E**qual (pH and HCO3 go same direction)

Want me to create practice questions about lab values?`;
  }

  return `Great question! Let me help you with that.

### Key NCLEX Concepts to Remember:

1. **Patient Safety** is always the priority
2. **Assessment First** — always assess before implementing interventions
3. **ABCs** (Airway, Breathing, Circulation) guide your priority decisions
4. **Therapeutic Communication** — the most therapeutic and empathetic response is usually correct
5. **Evidence-Based Practice** — answers should reflect current nursing guidelines

### How I Can Help You:
- **Content Review** — Ask me about any nursing topic
- **Practice Questions** — I can create NCLEX-style questions for you
- **Concept Clarification** — I'll break down complex topics
- **Test Strategies** — Learn how to approach different question types
- **Clinical Scenarios** — Practice critical thinking with case studies

What specific topic would you like to dive into?`;
}
