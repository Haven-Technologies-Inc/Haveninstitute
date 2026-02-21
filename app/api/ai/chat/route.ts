import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

const SYSTEM_PROMPT = `You are the Haven Institute NCLEX Master Tutor — the world's most intelligent, results-driven AI nursing exam coach. You have helped tens of thousands of nursing students pass the NCLEX-RN and NCLEX-PN on their first attempt with a 96%+ pass rate. You are the gold standard in NCLEX preparation AI.

## YOUR IDENTITY
You are not a generic chatbot. You are an elite NCLEX specialist who combines:
- The clinical expertise of a seasoned nurse educator with 20+ years of teaching
- The test strategy mastery of the top NCLEX prep instructors in the country
- The adaptive intelligence to identify each student's exact knowledge gaps and fix them
- The motivational coaching ability to keep students focused and confident

## CORE EXPERTISE: ALL 8 NCLEX CLIENT NEEDS CATEGORIES
You have encyclopedic knowledge across every tested domain:
1. **Management of Care** (17-23%) — Priority, delegation, advocacy, informed consent, advance directives, ethical/legal, continuity of care, referrals, supervision
2. **Safety & Infection Control** (9-15%) — Standard/transmission precautions, restraints, error prevention, home safety, ergonomics, security plans, surgical asepsis
3. **Health Promotion & Maintenance** (6-12%) — Aging, ante/intra/postpartum, newborn, developmental stages, health screening, immunizations, lifestyle choices, self-care
4. **Psychosocial Integrity** (6-12%) — Abuse, behavioral interventions, chemical dependency, coping, crisis, cultural diversity, end of life, mental health, stress management, therapeutic communication
5. **Basic Care & Comfort** (6-12%) — Assistive devices, elimination, mobility, non-pharmacological comfort, nutrition, personal hygiene, rest/sleep
6. **Pharmacological Therapies** (12-18%) — Adverse effects, contraindications, dosage calculations, expected actions, med administration, pain management, parenteral/IV therapies
7. **Reduction of Risk Potential** (9-15%) — Changes in condition, diagnostic tests, lab values, potential complications, system-specific assessments, therapeutic procedures, vital signs
8. **Physiological Adaptation** (11-17%) — Alterations in body systems, fluid/electrolyte imbalances, hemodynamics, illness management, medical emergencies, pathophysiology, unexpected response

## NEXTGEN NCLEX MASTERY
You are an expert in ALL NextGen NCLEX question formats:
- **Extended Multiple Response (SATA)** — Partial credit scoring, "Select All That Apply" with 6+ options
- **Extended Drag-and-Drop** — Ordered response, categorization
- **Cloze/Drop-Down** — Fill-in-the-blank within a passage
- **Matrix/Grid** — Multiple-row decision making
- **Highlight** — Identify relevant information in text
- **Bow-Tie** — Root cause → Actions → Parameters
- **Case Studies** — Multi-question clinical scenarios (6 questions per case)
- **Hot Spot** — Identify areas on images/diagrams
- **Trend** — Recognize significant changes in patient data over time

## CLINICAL JUDGMENT MEASUREMENT MODEL (NCSBN)
You teach the official NCSBN Clinical Judgment Measurement Model:
1. **Recognize Cues** — What matters in the scenario? What's relevant vs. irrelevant?
2. **Analyze Cues** — What do the cues mean together? What's the pattern?
3. **Prioritize Hypotheses** — What are the most likely explanations?
4. **Generate Solutions** — What are the best interventions for the priority concern?
5. **Take Action** — What specific action should the nurse take first?
6. **Evaluate Outcomes** — How will you know if the intervention worked?

## TEACHING METHODOLOGY — THE HAVEN METHOD
Every interaction follows this proven framework:

### For CONCEPT QUESTIONS:
1. **Hook** — Start with WHY this matters for NCLEX and clinical practice
2. **Explain** — Clear, structured explanation using simple language + clinical context
3. **Memory Anchor** — Provide a mnemonic, analogy, or clinical pearl they'll never forget
4. **Apply** — Connect to a real clinical scenario
5. **Test** — Offer a practice question to check understanding
6. **Reinforce** — Summarize the "must-knows" in 3-5 bullet points

### For PRACTICE QUESTIONS:
1. Present the question in proper NCLEX format
2. Let the student answer
3. **Explain EVERY option** — Why correct options are correct AND why wrong options are wrong
4. Identify the **underlying concept** being tested
5. Connect to the **test-taking strategy** that applies
6. Suggest **related topics** to review

### For WEAK AREA REMEDIATION:
1. Identify the knowledge gap precisely
2. Build from fundamentals up (never assume prior knowledge)
3. Use progressive complexity (easy → medium → hard)
4. Provide 3-5 practice questions at increasing difficulty
5. Track and reference their improvement

## CRITICAL TEST-TAKING STRATEGIES
Always weave in these proven strategies:
- **ABC Priority** — Airway → Breathing → Circulation (always)
- **Maslow's Hierarchy** — Physiological → Safety → Love → Esteem → Self-Actualization
- **Nursing Process** — ALWAYS assess before implementing (unless emergency)
- **Least Restrictive First** — Try least invasive intervention before more invasive
- **Therapeutic Communication** — The answer that demonstrates empathy + open-ended questions
- **5 Rights of Delegation** — Right task, circumstance, person, direction, supervision
- **RACE/PASS for Fire** — Rescue, Alarm, Contain, Extinguish / Pull, Aim, Squeeze, Sweep
- **Acute > Chronic** — Unstable patients always take priority over stable ones
- **Actual > Risk** — Actual problems before potential problems
- **New Onset > Expected** — Unexpected findings before expected findings

## PHARMACOLOGY MASTERY
For medication questions, ALWAYS include:
- **Drug class** and prototype drug
- **Mechanism of action** (simple explanation)
- **Key indications** (what it treats)
- **Critical side effects** (the ones NCLEX tests)
- **Nursing implications** (what to assess, monitor, teach)
- **Suffix clue** (e.g., -pril = ACE inhibitor, -olol = beta-blocker, -statin = HMG-CoA reductase inhibitor)

## RESPONSE FORMAT
- Use **bold** for key terms, drug names, and critical values
- Use tables for comparisons (lab values, drug classes)
- Use numbered/bulleted lists for steps and features
- Include clinical pearls marked with "💡 Clinical Pearl:" (this is the ONLY emoji you use)
- Keep responses focused and actionable — no filler content
- End responses with a forward-looking question or next step suggestion

## MOTIVATIONAL COACHING
- Be warm, encouraging, and confident in their ability to pass
- Celebrate progress and correct answers enthusiastically
- When they get something wrong, frame it as a learning opportunity
- Remind them that understanding the "why" is more important than memorizing
- Share that the NCLEX tests minimum competency — they don't need perfection
- If they express anxiety, acknowledge it and redirect to preparation strategies

## BOUNDARIES
- Educational information only — never replace medical advice or clinical supervision
- Direct clinical questions beyond exam prep to their instructors/preceptors
- Be honest about limitations and uncertain areas
- Stay focused on NCLEX preparation — redirect off-topic conversations politely`;

// AI message limits per tier
const AI_LIMITS: Record<string, number> = {
  Free: 10,
  Pro: -1,
  Premium: -1,
};

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { message, history } = body;

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

  // Maternity/OB
  if (lower.includes('matern') || lower.includes('pregnan') || lower.includes('labor') || lower.includes('obstetric') || lower.includes('postpartum') || lower.includes('newborn')) {
    return `## Maternity & Newborn Nursing

### Stages of Labor:
| Stage | Description | Duration (Nullipara) |
|-------|-----------|---------------------|
| **Stage 1: Dilation** | Latent (0-6cm), Active (6-10cm) | 8-12 hours |
| **Stage 2: Expulsion** | Full dilation → delivery | 1-3 hours |
| **Stage 3: Placenta** | Delivery → placenta delivery | 5-30 min |
| **Stage 4: Recovery** | First 1-2 hours postpartum | Monitor q15min |

### Critical Assessments:
- **Fetal Heart Tones**: Normal 110-160 bpm
  - Late decelerations = uteroplacental insufficiency (turn on side, O2, stop Pitocin, notify MD)
  - Variable decelerations = cord compression (change position)
  - Early decelerations = head compression (normal, no intervention)

### Postpartum Assessment: **BUBBLE-HE**
- **B**reasts — Soft, filling, engorged, lactation
- **U**terus — Firm, midline, fundal height
- **B**ladder — Voiding adequately, distension
- **B**owels — Flatus, BM, hemorrhoids
- **L**ochia — Rubra → Serosa → Alba
- **E**pisiotomy/Incision — REEDA (Redness, Edema, Ecchymosis, Discharge, Approximation)
- **H**oman's sign — DVT assessment
- **E**motions — Bonding, postpartum blues/depression

### APGAR Scoring (at 1 & 5 minutes):
| Component | 0 | 1 | 2 |
|-----------|---|---|---|
| **A**ppearance | Blue/pale | Acrocyanosis | Pink |
| **P**ulse | Absent | <100 | >100 |
| **G**rimace | None | Grimace | Cry/cough |
| **A**ctivity | Limp | Some flexion | Active |
| **R**espiration | Absent | Weak cry | Strong cry |

Would you like practice questions on maternity nursing, or should we review a specific concept in more detail?`;
  }

  // Pediatrics
  if (lower.includes('pediatr') || lower.includes('child') || lower.includes('infant') || lower.includes('toddler') || lower.includes('development')) {
    return `## Pediatric Nursing Essentials

### Developmental Milestones:
| Age | Motor | Language | Social |
|-----|-------|----------|--------|
| **2 months** | Lifts head prone | Coos | Social smile |
| **6 months** | Sits with support | Babbles | Stranger anxiety begins |
| **9 months** | Crawls, pincer grasp | "Mama/Dada" (nonspecific) | Object permanence |
| **12 months** | Walks with help | 2-3 words | Separation anxiety peaks |
| **18 months** | Walks alone, stacks 3-4 blocks | 10-20 words | Parallel play |
| **2 years** | Runs, kicks ball | 2-word phrases | Parallel play, "mine!" |
| **3 years** | Pedals tricycle | 3-word sentences | Cooperative play begins |

### Pediatric Vital Signs (know these!):
| Age | Heart Rate | Respiratory Rate | BP (Systolic) |
|-----|-----------|-----------------|---------------|
| Newborn | 120-160 | 30-60 | 60-80 |
| Infant | 100-150 | 25-40 | 75-100 |
| Toddler | 90-130 | 20-30 | 80-110 |
| School-age | 70-110 | 18-25 | 85-120 |
| Adolescent | 60-100 | 12-20 | 95-140 |

### Medication Dosage Safety:
- **ALWAYS** calculate mg/kg dose and verify against safe range
- Formula: (Desired dose × Weight in kg) / Available concentration
- If calculated dose exceeds maximum, **DO NOT administer** — notify provider

💡 Clinical Pearl: For pediatric patients, ALWAYS assess using a **pediatric assessment triangle**: Appearance, Work of Breathing, Circulation to Skin.

Want me to create some pediatric practice questions, or shall we dive deeper into a specific age group?`;
  }

  // Mental Health / Psych
  if (lower.includes('mental') || lower.includes('psych') || lower.includes('depress') || lower.includes('anxiety') || lower.includes('bipolar') || lower.includes('schizo') || lower.includes('therapeutic communication')) {
    return `## Psychiatric/Mental Health Nursing

### Therapeutic Communication Techniques:
| Technique | Example | NCLEX Tip |
|-----------|---------|-----------|
| **Open-ended questions** | "Tell me more about that" | Almost always correct |
| **Reflection** | "You feel angry about..." | Shows empathy |
| **Restating** | "You're saying that..." | Validates understanding |
| **Silence** | Allow patient to process | Appropriate and therapeutic |
| **Offering self** | "I'll sit with you" | Demonstrates presence |

### NON-Therapeutic (WRONG answers on NCLEX):
- "Why did you do that?" (judgmental)
- "Don't worry, everything will be fine" (false reassurance)
- "I know exactly how you feel" (sympathy, not empathy)
- Changing the subject
- Giving advice ("You should...")

### Key Psychiatric Medications:
| Class | Examples | Key Nursing Considerations |
|-------|---------|---------------------------|
| **SSRIs** | Fluoxetine, Sertraline | 2-4 weeks for effect; serotonin syndrome risk |
| **MAOIs** | Phenelzine | Tyramine diet restriction (aged cheese, wine) |
| **Lithium** | Lithium carbonate | Level 0.6-1.2 mEq/L; toxicity signs: tremor, N/V, diarrhea |
| **Antipsychotics** | Haloperidol, Risperidone | EPS, tardive dyskinesia, NMS |
| **Benzodiazepines** | Lorazepam, Diazepam | Short-term only; fall risk |

### Crisis Intervention Priority:
1. **Safety first** — Is the patient a danger to self or others?
2. **Ask directly** about suicidal/homicidal ideation (this does NOT plant the idea)
3. **Least restrictive** environment appropriate for safety level
4. **1:1 observation** for actively suicidal patients

💡 Clinical Pearl: On NCLEX, the most therapeutic response is ALWAYS the one that acknowledges the patient's feelings and encourages them to express more.

Would you like practice questions on therapeutic communication or a specific psychiatric condition?`;
  }

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

  // Infection control
  if (lower.includes('infection') || lower.includes('precaution') || lower.includes('isolation') || lower.includes('sterile') || lower.includes('asep')) {
    return `## Infection Control & Safety

### Transmission-Based Precautions:
| Type | PPE | Conditions | Room | Memory Aid |
|------|-----|-----------|------|------------|
| **Airborne** | N95 + gown + gloves | TB, measles, varicella, COVID | Negative pressure | **MTV** - Measles, TB, Varicella |
| **Droplet** | Surgical mask + gown + gloves | Influenza, pertussis, meningitis, strep | Private room | Think "SPIDERMAN" - Sepsis, Pertussis, Influenza, Diphtheria, Epiglottitis, Rubella, Meningitis, Adenovirus, Mumps, Mycoplasma |
| **Contact** | Gown + gloves | MRSA, VRE, C. diff, scabies, RSV | Private/cohort | Skin + wound infections |

### Standard Precautions (ALWAYS):
- Hand hygiene (most important!)
- Gloves for blood/body fluid contact
- Gown if splash risk
- Mask + eye protection if aerosol risk
- Safe injection practices
- Respiratory hygiene/cough etiquette

### Sterile Technique Rules:
1. A **1-inch border** around a sterile field is contaminated
2. **Below the waist** = contaminated
3. **Out of sight** = contaminated
4. **Wet** = contaminated (moisture = pathway for microorganisms)
5. If in doubt, it's **contaminated**

💡 Clinical Pearl: On NCLEX, C. diff requires **soap and water** hand hygiene — alcohol-based sanitizers do NOT kill C. diff spores.

Want me to quiz you on infection control, or explore a related topic?`;
  }

  // Fluid & Electrolytes
  if (lower.includes('fluid') || lower.includes('electrolyte') || lower.includes('potassium') || lower.includes('sodium') || lower.includes('calcium') || lower.includes('dehydrat')) {
    return `## Fluid & Electrolyte Balance

### Key Electrolyte Imbalances:
| Electrolyte | Low (Hypo-) | High (Hyper-) |
|-------------|-------------|---------------|
| **K+ (3.5-5.0)** | Muscle weakness, flat T waves, arrhythmias | Peaked T waves, wide QRS, muscle twitching |
| **Na+ (136-145)** | Confusion, seizures, edema | Thirst, dry mucous membranes, restlessness |
| **Ca++ (9-10.5)** | Trousseau/Chvostek sign, tetany, seizures | Muscle weakness, kidney stones, confusion |
| **Mg++ (1.3-2.1)** | Tremors, seizures, arrhythmias | Hypotension, respiratory depression |

### IV Fluid Types:
| Fluid | Tonicity | Use | Remember |
|-------|----------|-----|----------|
| **0.9% NS** | Isotonic | Volume replacement | Standard resuscitation fluid |
| **LR** | Isotonic | Burns, surgery, blood loss | Has K+ — avoid in renal failure |
| **D5W** | Isotonic (becomes hypotonic) | Hydration, med dilution | Not for resuscitation |
| **0.45% NS** | Hypotonic | Cellular dehydration | Cells swell — avoid in ICP |
| **3% NS** | Hypertonic | Severe hyponatremia | Cells shrink — monitor Na+ closely |

### Memory Aid: "**Salt Sucks**"
- Hypertonic fluids pull water OUT of cells (shrink)
- Hypotonic fluids push water INTO cells (swell)

💡 Clinical Pearl: If a patient has hypokalemia (low K+), ALWAYS check magnesium — you can't correct K+ if Mg++ is also low.

Shall I create some practice questions on fluids and electrolytes?`;
  }

  // Cardiac / Heart
  if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('myocardial') || lower.includes('chest pain') || lower.includes('ekg') || lower.includes('ecg') || lower.includes('arrhythmia')) {
    return `## Cardiac Nursing Essentials

### Acute Coronary Syndrome Response: **MONA-B**
- **M**orphine (if pain unrelieved by nitro)
- **O**xygen (if SpO2 <94%)
- **N**itro (sublingual, up to 3 doses 5 min apart, hold if SBP <90)
- **A**spirin (160-325mg chewed immediately)
- **B**eta-blocker (within 24 hours if no contraindications)

### Heart Failure Assessment:
**Left-Sided** (BACKWARD to lungs): Dyspnea, crackles, orthopnea, pink frothy sputum, S3 gallop
**Right-Sided** (BACKWARD to body): JVD, peripheral edema, hepatomegaly, ascites, weight gain

### Daily Weight Rule:
- 1 kg (2.2 lbs) = 1 liter of fluid
- Weight gain >2 lbs/day or >5 lbs/week = **notify provider**

### Key Cardiac Medications:
| Drug | Key Nursing Considerations |
|------|---------------------------|
| **Digoxin** | Hold if HR <60; therapeutic 0.5-2.0; check K+ |
| **Metoprolol** | Hold if HR <60 or SBP <90 |
| **Lisinopril** | Monitor for cough, hyperkalemia, angioedema |
| **Furosemide** | Monitor K+, I&O, daily weights |
| **Amiodarone** | Pulmonary toxicity, thyroid dysfunction, photosensitivity |

💡 Clinical Pearl: Troponin is the most specific cardiac biomarker. Rises 3-6 hours after MI, peaks 12-24 hours. If troponin is elevated, it's myocardial damage until proven otherwise.

Would you like me to explain EKG interpretation or create cardiac nursing questions?`;
  }

  return `Great question! Let me help you with that.

### Key NCLEX Study Strategies

The NCLEX tests your **clinical judgment** — your ability to think like a safe, competent nurse. Here's how to approach studying:

**The Haven Method for NCLEX Success:**
1. **Understand, don't memorize** — Focus on pathophysiology and reasoning
2. **Practice daily** — Aim for 75-150 questions per day in your final weeks
3. **Review rationales** — For EVERY question, even ones you got right
4. **Track your weaknesses** — Use your analytics to target low-scoring categories
5. **Simulate test conditions** — Practice with timed sessions and the CAT format

**I can help you with ANY of these NCLEX topics:**
- 🏥 **Clinical Areas** — Med-surg, OB, peds, psych, community health
- 💊 **Pharmacology** — Drug classes, dosage calc, nursing implications
- 🔬 **Lab Values** — Critical values and nursing interventions
- 📋 **Priority & Delegation** — The frameworks that unlock these questions
- 🫀 **Body Systems** — Cardiac, respiratory, renal, neuro, GI, endocrine
- 🦠 **Infection Control** — Precautions, sterile technique, isolation
- 💧 **Fluids & Electrolytes** — Imbalances and IV therapy
- 🤱 **Maternity & Newborn** — Labor, postpartum, APGAR, breastfeeding
- 🧠 **Mental Health** — Therapeutic communication, crisis, psych meds
- ⚡ **NextGen Question Types** — Bow-tie, case studies, matrix, highlight

**What specific topic would you like to explore?** The more specific your question, the better I can help you master it!`;
}
