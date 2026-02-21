import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the Haven Institute NCLEX Master Tutor — the world's most intelligent, results-driven AI nursing exam coach. You have helped tens of thousands of nursing students pass the NCLEX-RN and NCLEX-PN on their first attempt with a 96%+ pass rate. You are the gold standard in NCLEX preparation AI.

CRITICAL: Never use markdown formatting, asterisks, bullet points with *, or any markdown syntax in your responses. Write naturally as a human tutor would in a conversation. Use plain text only. Structure responses with line breaks and numbered lists (1. 2. 3.) when needed. Never wrap text in ** or * for emphasis. Never use ## or ### for headings. Never use backticks or code blocks. Do not use tables with | characters. Write everything in natural, flowing prose with numbered lists where appropriate.

YOUR IDENTITY
You are not a generic chatbot. You are an elite NCLEX specialist who combines:
- The clinical expertise of a seasoned nurse educator with 20+ years of teaching
- The test strategy mastery of the top NCLEX prep instructors in the country
- The adaptive intelligence to identify each student's exact knowledge gaps and fix them
- The motivational coaching ability to keep students focused and confident

CORE EXPERTISE: ALL 8 NCLEX CLIENT NEEDS CATEGORIES
You have encyclopedic knowledge across every tested domain:
1. Management of Care (17-23%) -- Priority, delegation, advocacy, informed consent, advance directives, ethical/legal, continuity of care, referrals, supervision
2. Safety and Infection Control (9-15%) -- Standard/transmission precautions, restraints, error prevention, home safety, ergonomics, security plans, surgical asepsis
3. Health Promotion and Maintenance (6-12%) -- Aging, ante/intra/postpartum, newborn, developmental stages, health screening, immunizations, lifestyle choices, self-care
4. Psychosocial Integrity (6-12%) -- Abuse, behavioral interventions, chemical dependency, coping, crisis, cultural diversity, end of life, mental health, stress management, therapeutic communication
5. Basic Care and Comfort (6-12%) -- Assistive devices, elimination, mobility, non-pharmacological comfort, nutrition, personal hygiene, rest/sleep
6. Pharmacological Therapies (12-18%) -- Adverse effects, contraindications, dosage calculations, expected actions, med administration, pain management, parenteral/IV therapies
7. Reduction of Risk Potential (9-15%) -- Changes in condition, diagnostic tests, lab values, potential complications, system-specific assessments, therapeutic procedures, vital signs
8. Physiological Adaptation (11-17%) -- Alterations in body systems, fluid/electrolyte imbalances, hemodynamics, illness management, medical emergencies, pathophysiology, unexpected response

NEXTGEN NCLEX MASTERY
You are an expert in ALL NextGen NCLEX question formats:
- Extended Multiple Response (SATA) -- Partial credit scoring, "Select All That Apply" with 6+ options
- Extended Drag-and-Drop -- Ordered response, categorization
- Cloze/Drop-Down -- Fill-in-the-blank within a passage
- Matrix/Grid -- Multiple-row decision making
- Highlight -- Identify relevant information in text
- Bow-Tie -- Root cause, Actions, Parameters
- Case Studies -- Multi-question clinical scenarios (6 questions per case)
- Hot Spot -- Identify areas on images/diagrams
- Trend -- Recognize significant changes in patient data over time

CLINICAL JUDGMENT MEASUREMENT MODEL (NCSBN)
You teach the official NCSBN Clinical Judgment Measurement Model:
1. Recognize Cues -- What matters in the scenario? What is relevant vs. irrelevant?
2. Analyze Cues -- What do the cues mean together? What is the pattern?
3. Prioritize Hypotheses -- What are the most likely explanations?
4. Generate Solutions -- What are the best interventions for the priority concern?
5. Take Action -- What specific action should the nurse take first?
6. Evaluate Outcomes -- How will you know if the intervention worked?

TEACHING METHODOLOGY -- THE HAVEN METHOD
Every interaction follows this proven framework:

For CONCEPT QUESTIONS:
1. Hook -- Start with WHY this matters for NCLEX and clinical practice
2. Explain -- Clear, structured explanation using simple language + clinical context
3. Memory Anchor -- Provide a mnemonic, analogy, or clinical pearl they will never forget
4. Apply -- Connect to a real clinical scenario
5. Test -- Offer a practice question to check understanding
6. Reinforce -- Summarize the must-knows in 3-5 points

For PRACTICE QUESTIONS:
1. Present the question in proper NCLEX format
2. Let the student answer
3. Explain EVERY option -- Why correct options are correct AND why wrong options are wrong
4. Identify the underlying concept being tested
5. Connect to the test-taking strategy that applies
6. Suggest related topics to review

For WEAK AREA REMEDIATION:
1. Identify the knowledge gap precisely
2. Build from fundamentals up (never assume prior knowledge)
3. Use progressive complexity (easy to medium to hard)
4. Provide 3-5 practice questions at increasing difficulty
5. Track and reference their improvement

CRITICAL TEST-TAKING STRATEGIES
Always weave in these proven strategies:
- ABC Priority -- Airway, then Breathing, then Circulation (always)
- Maslow's Hierarchy -- Physiological, Safety, Love, Esteem, Self-Actualization
- Nursing Process -- ALWAYS assess before implementing (unless emergency)
- Least Restrictive First -- Try least invasive intervention before more invasive
- Therapeutic Communication -- The answer that demonstrates empathy + open-ended questions
- 5 Rights of Delegation -- Right task, circumstance, person, direction, supervision
- RACE/PASS for Fire -- Rescue, Alarm, Contain, Extinguish / Pull, Aim, Squeeze, Sweep
- Acute over Chronic -- Unstable patients always take priority over stable ones
- Actual over Risk -- Actual problems before potential problems
- New Onset over Expected -- Unexpected findings before expected findings

PHARMACOLOGY MASTERY
For medication questions, ALWAYS include:
- Drug class and prototype drug
- Mechanism of action (simple explanation)
- Key indications (what it treats)
- Critical side effects (the ones NCLEX tests)
- Nursing implications (what to assess, monitor, teach)
- Suffix clue (e.g., -pril = ACE inhibitor, -olol = beta-blocker, -statin = HMG-CoA reductase inhibitor)

RESPONSE FORMAT
- Write naturally in plain conversational text
- Use numbered lists (1. 2. 3.) for steps and sequences
- Use line breaks to separate sections
- Include clinical pearls marked with "Clinical Pearl:"
- Keep responses focused and actionable -- no filler content
- End responses with a forward-looking question or next step suggestion
- NEVER use markdown: no **, *, ##, ###, \`\`\`, or | table formatting

MOTIVATIONAL COACHING
- Be warm, encouraging, and confident in their ability to pass
- Celebrate progress and correct answers enthusiastically
- When they get something wrong, frame it as a learning opportunity
- Remind them that understanding the "why" is more important than memorizing
- Share that the NCLEX tests minimum competency -- they do not need perfection
- If they express anxiety, acknowledge it and redirect to preparation strategies

BOUNDARIES
- Educational information only -- never replace medical advice or clinical supervision
- Direct clinical questions beyond exam prep to their instructors/preceptors
- Be honest about limitations and uncertain areas
- Stay focused on NCLEX preparation -- redirect off-topic conversations politely`;

// ---------------------------------------------------------------------------
// AI message limits per tier
// ---------------------------------------------------------------------------

const AI_LIMITS: Record<string, number> = {
  Free: 10,
  Pro: -1,
  Premium: -1,
};

// ---------------------------------------------------------------------------
// Lazy OpenAI client creation (avoid module-scope instantiation)
// ---------------------------------------------------------------------------

let _openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (_openaiClient) return _openaiClient;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  _openaiClient = new OpenAI({ apiKey: key });
  return _openaiClient;
}

let _grokClient: OpenAI | null = null;
function getGrokClient(): OpenAI | null {
  if (_grokClient) return _grokClient;
  const key = process.env.GROK_API_KEY;
  if (!key) return null;
  _grokClient = new OpenAI({
    apiKey: key,
    baseURL: process.env.GROK_API_BASE || 'https://api.x.ai/v1',
  });
  return _grokClient;
}

// ---------------------------------------------------------------------------
// Strip any remaining markdown from AI responses
// ---------------------------------------------------------------------------

function stripMarkdown(text: string): string {
  let cleaned = text;
  // Remove bold markers ** and __
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  // Remove italic markers * and _
  cleaned = cleaned.replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, '$1');
  cleaned = cleaned.replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '$1');
  // Remove heading markers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    // Keep the content inside code blocks, just remove the backtick fences
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
  });
  // Remove inline code backticks
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}\s*$/gm, '');
  // Clean up markdown table formatting (convert to plain text)
  cleaned = cleaned.replace(/^\|.*\|$/gm, (line) => {
    // Skip separator rows like |---|---|
    if (/^\|[\s-:|]+\|$/.test(line)) return '';
    return line.replace(/\|/g, '  ').trim();
  });
  // Remove leftover empty lines from table separator removal
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

// ---------------------------------------------------------------------------
// Call AI provider (OpenAI primary, Grok fallback)
// ---------------------------------------------------------------------------

async function getAIResponse(
  messages: { role: string; content: string }[],
  userMessage: string
): Promise<{ text: string; model?: string; tokensUsed?: number }> {
  const chatMessages = messages.map((m) => ({
    role: m.role as 'system' | 'user' | 'assistant',
    content: m.content,
  }));

  // ---- Try OpenAI first ----
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-4o';
      const completion = await openai.chat.completions.create({
        model,
        messages: chatMessages,
        max_tokens: 2048,
        temperature: 0.7,
      });

      const text = completion.choices?.[0]?.message?.content;
      if (text) {
        return {
          text: stripMarkdown(text),
          model,
          tokensUsed: completion.usage?.total_tokens ?? undefined,
        };
      }
    } catch (e) {
      console.error('OpenAI API error:', e);
    }
  }

  // ---- Fallback to Grok (xAI) ----
  const grok = getGrokClient();
  if (grok) {
    try {
      const model = process.env.GROK_MODEL || 'grok-3';
      const completion = await grok.chat.completions.create({
        model,
        messages: chatMessages,
        max_tokens: 2048,
        temperature: 0.7,
      });

      const text = completion.choices?.[0]?.message?.content;
      if (text) {
        return {
          text: stripMarkdown(text),
          model,
          tokensUsed: completion.usage?.total_tokens ?? undefined,
        };
      }
    } catch (e) {
      console.error('Grok API error:', e);
    }
  }

  // ---- Built-in fallback responses ----
  return { text: getBuiltInResponse(userMessage) };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { message, conversationHistory, history } = body;

    if (!message) return errorResponse('Message is required');

    const tier = (session.user as any).subscriptionTier || 'Free';
    const limit = AI_LIMITS[tier] ?? 10;

    // Check usage limits for free tier
    if (limit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usage = await prisma.dailyUsage.findUnique({
        where: {
          userId_usageDate: {
            userId: session.user.id,
            usageDate: today,
          },
        },
      });

      if (usage && usage.aiChatMessages >= limit) {
        return errorResponse(
          `You've reached your daily AI tutor limit (${limit} messages). Upgrade to Pro for unlimited access.`,
          429
        );
      }
    }

    // Build messages array for the AI provider
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Support both "conversationHistory" and "history" field names
    const chatHistory = Array.isArray(conversationHistory)
      ? conversationHistory
      : Array.isArray(history)
        ? history
        : [];

    // Add conversation history (last 20 messages to stay within token limits)
    for (const msg of chatHistory.slice(-20)) {
      if (msg.role && msg.content) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    // Get AI response (OpenAI -> Grok -> built-in fallback)
    const aiResult = await getAIResponse(messages, message);

    // Track usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyUsage.upsert({
      where: {
        userId_usageDate: {
          userId: session.user.id,
          usageDate: today,
        },
      },
      update: {
        aiChatMessages: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        usageDate: today,
        aiChatMessages: 1,
      },
    });

    return successResponse({
      role: 'assistant',
      content: aiResult.text,
      response: aiResult.text,
      model: aiResult.model,
      tokensUsed: aiResult.tokensUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// Built-in fallback responses (no markdown)
// ---------------------------------------------------------------------------

function getBuiltInResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('matern') || lower.includes('pregnan') || lower.includes('labor') || lower.includes('obstetric') || lower.includes('postpartum') || lower.includes('newborn')) {
    return `Great question about maternity and newborn nursing! This is a high-yield NCLEX topic. Let me walk you through the essentials.

Stages of Labor:

1. Stage 1 -- Dilation: This includes the latent phase (0-6cm) and active phase (6-10cm). For a first-time mother, this can last 8-12 hours.

2. Stage 2 -- Expulsion: From full dilation to delivery of the baby. This typically takes 1-3 hours for a nullipara.

3. Stage 3 -- Placenta: From delivery of the baby to delivery of the placenta. This usually takes 5-30 minutes.

4. Stage 4 -- Recovery: The first 1-2 hours postpartum. Monitor vital signs every 15 minutes during this stage.

Critical Fetal Heart Rate Assessments:
Normal fetal heart tones are 110-160 bpm. For the NCLEX, you need to know three key deceleration patterns:

Late decelerations indicate uteroplacental insufficiency. Your nursing actions are: turn the mother on her left side, give oxygen, stop Pitocin, and notify the provider.

Variable decelerations indicate cord compression. Change the mother's position.

Early decelerations indicate head compression. These are normal and require no intervention.

Postpartum Assessment -- remember BUBBLE-HE:
Breasts, Uterus (firm, midline, fundal height), Bladder, Bowels, Lochia (Rubra then Serosa then Alba), Episiotomy/Incision (check REEDA: Redness, Edema, Ecchymosis, Discharge, Approximation), Homan's sign for DVT, and Emotions including bonding and postpartum blues screening.

APGAR Scoring at 1 and 5 minutes evaluates: Appearance (color), Pulse, Grimace (reflex irritability), Activity (muscle tone), and Respiration. Each is scored 0-2, with a total of 7-10 being normal.

Would you like practice questions on maternity nursing, or should we review a specific concept in more detail?`;
  }

  if (lower.includes('pediatr') || lower.includes('child') || lower.includes('infant') || lower.includes('toddler') || lower.includes('development')) {
    return `Pediatric nursing is a favorite NCLEX topic! Let me break down the key concepts you need to know.

Developmental Milestones (high-yield for the exam):

2 months: Lifts head when prone, coos, social smile
6 months: Sits with support, babbles, stranger anxiety begins
9 months: Crawls, develops pincer grasp, says "mama/dada" nonspecifically, object permanence develops
12 months: Walks with help, says 2-3 words, separation anxiety peaks
18 months: Walks alone, stacks 3-4 blocks, says 10-20 words, parallel play begins
2 years: Runs, kicks a ball, uses 2-word phrases, parallel play with "mine!" phase
3 years: Pedals a tricycle, uses 3-word sentences, cooperative play begins

Pediatric Vital Sign Ranges (memorize these):

Newborn: Heart rate 120-160, respiratory rate 30-60, systolic BP 60-80
Infant: Heart rate 100-150, respiratory rate 25-40, systolic BP 75-100
Toddler: Heart rate 90-130, respiratory rate 20-30, systolic BP 80-110
School-age: Heart rate 70-110, respiratory rate 18-25, systolic BP 85-120
Adolescent: Heart rate 60-100, respiratory rate 12-20, systolic BP 95-140

Medication Safety in Pediatrics:
ALWAYS calculate the mg/kg dose and verify it against the safe range before administering any medication. The formula is: Desired dose times weight in kg, divided by available concentration. If the calculated dose exceeds the maximum safe dose, DO NOT administer -- notify the provider.

Clinical Pearl: For pediatric patients, always start your assessment using the Pediatric Assessment Triangle: Appearance, Work of Breathing, and Circulation to Skin.

Want me to create some pediatric practice questions, or shall we dive deeper into a specific age group?`;
  }

  if (lower.includes('mental') || lower.includes('psych') || lower.includes('depress') || lower.includes('anxiety') || lower.includes('bipolar') || lower.includes('schizo') || lower.includes('therapeutic communication')) {
    return `Psychiatric and mental health nursing is essential for the NCLEX. Let me cover the key concepts.

Therapeutic Communication Techniques (these are almost always the correct answer on NCLEX):

1. Open-ended questions: "Tell me more about that" -- encourages the patient to elaborate
2. Reflection: "You feel angry about..." -- shows empathy and understanding
3. Restating: "You're saying that..." -- validates your understanding
4. Silence: Allowing the patient time to process -- this is appropriate and therapeutic
5. Offering self: "I'll sit with you" -- demonstrates presence and support

Non-Therapeutic Responses (these are the WRONG answers on NCLEX):
"Why did you do that?" -- this is judgmental
"Don't worry, everything will be fine" -- this is false reassurance
"I know exactly how you feel" -- this is sympathy, not empathy
Changing the subject -- dismisses the patient's concerns
Giving advice like "You should..." -- removes patient autonomy

Key Psychiatric Medications:

SSRIs (Fluoxetine, Sertraline): Takes 2-4 weeks for full therapeutic effect. Watch for serotonin syndrome risk.

MAOIs (Phenelzine): Requires strict tyramine diet restriction -- no aged cheese, wine, or fermented foods.

Lithium: Therapeutic level is 0.6-1.2 mEq/L. Toxicity signs include tremor, nausea, vomiting, and diarrhea.

Antipsychotics (Haloperidol, Risperidone): Monitor for extrapyramidal symptoms (EPS), tardive dyskinesia, and neuroleptic malignant syndrome.

Benzodiazepines (Lorazepam, Diazepam): Short-term use only. Significant fall risk.

Crisis Intervention Priority:
1. Safety first -- Is the patient a danger to self or others?
2. Ask directly about suicidal or homicidal ideation (this does NOT plant the idea)
3. Provide the least restrictive environment appropriate for the safety level
4. Implement 1:1 observation for actively suicidal patients

Clinical Pearl: On the NCLEX, the most therapeutic response is ALWAYS the one that acknowledges the patient's feelings and encourages them to express more.

Would you like practice questions on therapeutic communication or a specific psychiatric condition?`;
  }

  if (lower.includes('pharmacol') || lower.includes('medication') || lower.includes('drug')) {
    return `Pharmacology is one of the most heavily tested areas on the NCLEX. Let me walk you through the essentials.

Key Principles for NCLEX Pharmacology Questions:

Focus on prototype drugs -- if you know the prototype for a drug class, you can apply that knowledge to every drug in the class. This is the most efficient study strategy.

Essential Drug Classes to Master:

1. Antihypertensives (ACE inhibitors, ARBs, Beta-blockers, Calcium Channel Blockers)
Prototype: Lisinopril (ACE inhibitor) -- monitor for dry cough and angioedema
Prototype: Metoprolol (Beta-blocker) -- hold if heart rate is below 60

2. Cardiac Glycosides -- Digoxin
Therapeutic range: 0.5-2.0 ng/mL
Always check apical pulse for a full 60 seconds before administration. Hold if pulse is below 60 bpm.
Monitor potassium levels because hypokalemia increases digoxin toxicity.

3. Anticoagulants -- Heparin vs. Warfarin
Heparin: Monitor aPTT. Antidote is Protamine sulfate.
Warfarin: Monitor INR (therapeutic range 2-3). Antidote is Vitamin K.

Memory Aid for Medication Administration -- ABCDE:
A -- Assess the patient
B -- Barcode scan verification
C -- Check the 6 Rights (right patient, drug, dose, route, time, documentation)
D -- Document the administration
E -- Evaluate effectiveness

Would you like me to quiz you on any specific drug class?`;
  }

  if (lower.includes('priorit') || lower.includes('delegat') || lower.includes('assign')) {
    return `Priority and delegation questions are some of the most common on the NCLEX. Let me break down the frameworks you need.

Priority Decision Framework (use these in order):

1. ABCs -- Airway is always first, then Breathing, then Circulation
2. Maslow's Hierarchy -- Physiological needs first, then Safety, then Love/Belonging, Esteem, and Self-Actualization
3. Nursing Process -- Always assess before intervening (unless it is an emergency)
4. Acute vs. Chronic -- Unstable and acute situations always come first
5. Actual vs. Potential -- Actual problems take priority over risk-for problems

The 5 Rights of Delegation:

1. Right Task -- Can this task be delegated? (Assessment, teaching, evaluation, and nursing judgment CANNOT be delegated)
2. Right Circumstance -- Is the patient stable enough for this to be delegated?
3. Right Person -- Is the UAP or LPN competent to perform this task?
4. Right Direction -- Did you give clear, specific instructions?
5. Right Supervision -- Can you follow up appropriately?

What RNs CANNOT Delegate (remember ATEN):
A -- Assessment (initial and ongoing)
T -- Teaching (patient education)
E -- Evaluation (of outcomes)
N -- Nursing judgment (clinical decisions)

Shall I give you some priority and delegation practice questions?`;
  }

  if (lower.includes('lab') || lower.includes('value') || lower.includes('normal')) {
    return `Lab values are heavily tested on the NCLEX. Here are the critical ones you must know.

Essential Lab Values:

Potassium (K+): Normal is 3.5-5.0 mEq/L. Below 3.5 or above 5.0 puts the patient at cardiac risk.

Sodium (Na+): Normal is 136-145 mEq/L. This is your primary fluid balance indicator.

Glucose (fasting): Normal is 70-100 mg/dL. Below 70 is a hypoglycemia emergency -- treat immediately.

BUN: Normal is 10-20 mg/dL. Elevated levels indicate kidney dysfunction.

Creatinine: Normal is 0.7-1.3 mg/dL. This is the most specific marker for kidney function.

Hemoglobin: Males 14-18 g/dL, Females 12-16 g/dL. Reflects oxygen carrying capacity.

WBC: Normal is 5,000-10,000 per mm3. Below 5,000 means the patient is at infection risk -- implement neutropenic precautions.

Platelets: Normal is 150,000-400,000 per mm3. Below 50,000 requires bleeding precautions.

INR: Normal is 0.8-1.1. Therapeutic range on warfarin is 2-3.

ABG pH: Normal is 7.35-7.45. Below 7.35 is acidosis, above 7.45 is alkalosis.

Memory Aid for ABGs -- ROME:
Respiratory = Opposite (pH and CO2 go in opposite directions)
Metabolic = Equal (pH and HCO3 go in the same direction)

Want me to create practice questions about lab values?`;
  }

  if (lower.includes('infection') || lower.includes('precaution') || lower.includes('isolation') || lower.includes('sterile') || lower.includes('asep')) {
    return `Infection control is a critical NCLEX topic. Let me walk you through the essentials.

Transmission-Based Precautions:

Airborne Precautions: Require an N95 respirator, gown, and gloves. The patient needs a negative pressure room. Conditions include TB, measles, and varicella. Memory aid: MTV -- Measles, TB, Varicella.

Droplet Precautions: Require a surgical mask, gown, and gloves. Patient needs a private room. Conditions include influenza, pertussis, meningitis, and strep. Think "SPIDERMAN" -- Sepsis, Pertussis, Influenza, Diphtheria, Epiglottitis, Rubella, Meningitis, Adenovirus, Mumps, Mycoplasma.

Contact Precautions: Require gown and gloves. Patient needs a private or cohort room. Conditions include MRSA, VRE, C. diff, scabies, and RSV.

Standard Precautions (apply to ALL patients, ALWAYS):
1. Hand hygiene -- this is the single most important infection prevention measure
2. Gloves for blood or body fluid contact
3. Gown if there is splash risk
4. Mask and eye protection if there is aerosol risk
5. Safe injection practices
6. Respiratory hygiene and cough etiquette

Sterile Technique Rules:
1. A 1-inch border around a sterile field is considered contaminated
2. Anything below the waist is contaminated
3. Anything out of your line of sight is contaminated
4. A wet sterile field is contaminated (moisture creates a pathway for microorganisms)
5. When in doubt, it is contaminated -- start over

Clinical Pearl: On the NCLEX, remember that C. diff requires soap and water for hand hygiene. Alcohol-based hand sanitizers do NOT kill C. diff spores.

Want me to quiz you on infection control, or explore a related topic?`;
  }

  if (lower.includes('fluid') || lower.includes('electrolyte') || lower.includes('potassium') || lower.includes('sodium') || lower.includes('calcium') || lower.includes('dehydrat')) {
    return `Fluids and electrolytes are a foundational NCLEX topic. Let me break this down clearly.

Key Electrolyte Imbalances:

Potassium (K+, normal 3.5-5.0):
Low (hypokalemia): Muscle weakness, flat T waves on ECG, arrhythmias
High (hyperkalemia): Peaked T waves, wide QRS complex, muscle twitching

Sodium (Na+, normal 136-145):
Low (hyponatremia): Confusion, seizures, edema
High (hypernatremia): Thirst, dry mucous membranes, restlessness

Calcium (Ca++, normal 9-10.5):
Low (hypocalcemia): Trousseau sign, Chvostek sign, tetany, seizures
High (hypercalcemia): Muscle weakness, kidney stones, confusion

Magnesium (Mg++, normal 1.3-2.1):
Low (hypomagnesemia): Tremors, seizures, arrhythmias
High (hypermagnesemia): Hypotension, respiratory depression

IV Fluid Types:

Isotonic fluids (0.9% Normal Saline, Lactated Ringer's): Used for volume replacement. LR contains potassium, so avoid in renal failure.

Hypotonic fluids (0.45% Normal Saline): Used for cellular dehydration. Cells will swell, so avoid in patients with increased intracranial pressure.

Hypertonic fluids (3% Normal Saline): Used for severe hyponatremia. Cells will shrink, so monitor sodium closely.

D5W: Isotonic in the bag but becomes hypotonic in the body. Used for hydration and medication dilution, not for resuscitation.

Memory Aid -- "Salt Sucks":
Hypertonic solutions pull water OUT of cells (cells shrink).
Hypotonic solutions push water INTO cells (cells swell).

Clinical Pearl: If a patient has hypokalemia, ALWAYS check their magnesium level. You cannot correct potassium if magnesium is also low.

Shall I create some practice questions on fluids and electrolytes?`;
  }

  if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('myocardial') || lower.includes('chest pain') || lower.includes('ekg') || lower.includes('ecg') || lower.includes('arrhythmia')) {
    return `Cardiac nursing is one of the highest-yield NCLEX topics. Let me cover the essentials.

Acute Coronary Syndrome Response -- remember MONA-B:
M -- Morphine (if pain is unrelieved by nitroglycerin)
O -- Oxygen (only if SpO2 is below 94%)
N -- Nitroglycerin (sublingual, up to 3 doses 5 minutes apart, hold if systolic BP is below 90)
A -- Aspirin (160-325mg chewed immediately)
B -- Beta-blocker (within 24 hours if no contraindications)

Heart Failure Assessment:

Left-Sided Heart Failure (blood backs up into the lungs): Dyspnea, crackles in the lungs, orthopnea, pink frothy sputum, S3 heart gallop.

Right-Sided Heart Failure (blood backs up into the body): JVD (jugular vein distention), peripheral edema, hepatomegaly (enlarged liver), ascites, and weight gain.

Daily Weight Rule:
1 kg (2.2 lbs) equals approximately 1 liter of fluid. If a patient gains more than 2 lbs in a day or 5 lbs in a week, notify the provider immediately.

Key Cardiac Medications:

Digoxin: Hold if heart rate is below 60. Therapeutic level is 0.5-2.0 ng/mL. Always check potassium.

Metoprolol: Hold if heart rate is below 60 or systolic BP is below 90.

Lisinopril: Monitor for dry cough, hyperkalemia, and angioedema.

Furosemide: Monitor potassium levels, intake and output, and daily weights.

Amiodarone: Watch for pulmonary toxicity, thyroid dysfunction, and photosensitivity.

Clinical Pearl: Troponin is the most specific cardiac biomarker. It rises 3-6 hours after a myocardial infarction and peaks at 12-24 hours. If troponin is elevated, it indicates myocardial damage until proven otherwise.

Would you like me to explain EKG interpretation or create cardiac nursing practice questions?`;
  }

  return `Great question! Let me help you with that.

Key NCLEX Study Strategies:

The NCLEX tests your clinical judgment -- your ability to think like a safe, competent nurse. Here is how to approach your studying:

The Haven Method for NCLEX Success:

1. Understand, don't memorize -- Focus on pathophysiology and reasoning. When you understand WHY something happens, you can figure out the answer even if you have never seen that specific question before.

2. Practice daily -- Aim for 75-150 questions per day in your final weeks of preparation.

3. Review rationales -- For EVERY question, even the ones you got right. The rationale teaches you the test-makers' thinking.

4. Track your weaknesses -- Use your analytics to target your lowest-scoring categories first.

5. Simulate test conditions -- Practice with timed sessions and the computer adaptive testing format.

I can help you with any NCLEX topic including:

Clinical Areas -- Med-surg, OB, pediatrics, psychiatry, community health
Pharmacology -- Drug classes, dosage calculations, nursing implications
Lab Values -- Critical values and nursing interventions
Priority and Delegation -- The frameworks that unlock these questions
Body Systems -- Cardiac, respiratory, renal, neuro, GI, endocrine
Infection Control -- Precautions, sterile technique, isolation
Fluids and Electrolytes -- Imbalances and IV therapy
Maternity and Newborn -- Labor, postpartum, APGAR, breastfeeding
Mental Health -- Therapeutic communication, crisis, psychiatric medications
NextGen Question Types -- Bow-tie, case studies, matrix, highlight

What specific topic would you like to explore? The more specific your question, the better I can help you master it!`;
}
