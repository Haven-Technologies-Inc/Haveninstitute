/**
 * NextGen NCLEX Question Bank
 * Contains sample questions for all NextGen NCLEX question types
 */

import type { 
  NextGenQuestion, 
  MultipleChoiceQuestion,
  SelectAllQuestion,
  OrderedResponseQuestion,
  ClozeDropdownQuestion,
  MatrixQuestion,
  HighlightQuestion,
  BowTieQuestion,
  NCLEXCategory
} from '../types/nextGenNCLEX';

// Helper to generate unique IDs
let questionIdCounter = 1;
const generateId = () => `ngq-${questionIdCounter++}`;

export const nextGenQuestionBank: NextGenQuestion[] = [
  // ============================================
  // MULTIPLE CHOICE QUESTIONS
  // ============================================
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'management-of-care',
    difficulty: 'medium',
    stem: 'A nurse manager is planning staffing assignments. Which client should be assigned to a new graduate nurse?',
    options: [
      'A client with diabetic ketoacidosis requiring insulin drip',
      'A stable client with pneumonia receiving IV antibiotics',
      'A client with chest pain awaiting cardiac catheterization',
      'A client post-op day 0 from open heart surgery'
    ],
    correctAnswer: 1,
    rationale: 'New graduates should be assigned stable clients with predictable outcomes. A stable client with pneumonia is appropriate as it requires fundamental nursing care. Complex, unstable, or critical clients require experienced nurses.'
  },
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'pharmacological',
    difficulty: 'hard',
    stem: 'A client is receiving vancomycin IV. Which finding should the nurse report immediately?',
    options: [
      'Flushing of face and neck during infusion',
      'Serum trough level of 15 mcg/mL',
      'Mild nausea after infusion',
      'Creatinine increased from 1.0 to 2.8 mg/dL'
    ],
    correctAnswer: 3,
    rationale: 'A significant increase in creatinine (from 1.0 to 2.8 mg/dL) indicates nephrotoxicity, a serious adverse effect of vancomycin requiring immediate reporting. Red man syndrome (flushing) is managed by slowing infusion. The trough level is therapeutic (10-20 mcg/mL).'
  },
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'safety-infection',
    difficulty: 'easy',
    stem: 'Which personal protective equipment (PPE) is required when caring for a client with tuberculosis?',
    options: [
      'Surgical mask and gloves',
      'N95 respirator',
      'Face shield and gown',
      'Powered air-purifying respirator only'
    ],
    correctAnswer: 1,
    rationale: 'Tuberculosis requires airborne precautions. An N95 respirator (or PAPR) is required to filter airborne particles. A surgical mask does not provide adequate protection against airborne pathogens.'
  },

  // ============================================
  // SELECT ALL THAT APPLY (SATA)
  // ============================================
  {
    id: generateId(),
    type: 'select-all',
    category: 'physiological-adaptation',
    difficulty: 'medium',
    stem: 'A client is admitted with heart failure. Which findings would the nurse expect? Select all that apply.',
    options: [
      'Peripheral edema',
      'Jugular vein distention',
      'Weight loss',
      'Crackles in lung bases',
      'S3 heart sound',
      'Decreased BNP levels'
    ],
    correctAnswers: [0, 1, 3, 4],
    partialCredit: true,
    rationale: 'Heart failure causes fluid retention leading to peripheral edema, JVD, and pulmonary crackles. S3 gallop is a classic sign. Weight GAIN (not loss) occurs due to fluid retention. BNP levels are ELEVATED (not decreased) in heart failure.'
  },
  {
    id: generateId(),
    type: 'select-all',
    category: 'pharmacological',
    difficulty: 'hard',
    stem: 'A client is prescribed metformin for type 2 diabetes. Which statements by the client indicate correct understanding? Select all that apply.',
    options: [
      '"I should take this medication with meals."',
      '"I need to stop taking this before my CT scan with contrast."',
      '"This medication may cause weight gain."',
      '"I should avoid excessive alcohol consumption."',
      '"Hypoglycemia is the most common side effect."',
      '"I should report muscle pain or weakness immediately."'
    ],
    correctAnswers: [0, 1, 3, 5],
    partialCredit: true,
    rationale: 'Metformin should be taken with meals to reduce GI side effects. It must be held before contrast procedures due to lactic acidosis risk. Metformin typically causes weight loss, not gain. Alcohol increases lactic acidosis risk. Hypoglycemia is rare with metformin alone. Muscle pain may indicate lactic acidosis.'
  },
  {
    id: generateId(),
    type: 'select-all',
    category: 'management-of-care',
    difficulty: 'medium',
    stem: 'Which tasks can the RN delegate to unlicensed assistive personnel (UAP)? Select all that apply.',
    options: [
      'Measuring vital signs on a stable client',
      'Assessing a client\'s pain level',
      'Documenting intake and output',
      'Administering oral medications',
      'Ambulating a client who is 2 days post-surgery',
      'Teaching a client about diabetic foot care'
    ],
    correctAnswers: [0, 2, 4],
    partialCredit: true,
    rationale: 'UAP can perform routine tasks like vital signs, I&O documentation, and ambulation of stable clients. Assessment, medication administration, and patient education require RN licensure and cannot be delegated.'
  },

  // ============================================
  // ORDERED RESPONSE (DRAG & DROP)
  // ============================================
  {
    id: generateId(),
    type: 'ordered-response',
    category: 'safety-infection',
    difficulty: 'medium',
    stem: 'Place the steps for donning personal protective equipment (PPE) in the correct order.',
    items: [
      'Apply N95 respirator or mask',
      'Perform hand hygiene',
      'Put on gown',
      'Apply eye protection',
      'Put on gloves'
    ],
    correctOrder: [1, 2, 0, 3, 4],
    rationale: 'The correct order for donning PPE is: 1) Hand hygiene, 2) Gown (ties in back), 3) Mask/respirator, 4) Eye protection, 5) Gloves (last, to cover gown cuffs). This sequence ensures proper protection and prevents contamination.'
  },
  {
    id: generateId(),
    type: 'ordered-response',
    category: 'physiological-adaptation',
    difficulty: 'hard',
    stem: 'A client is experiencing cardiac arrest. Place the steps of basic life support in the correct sequence.',
    items: [
      'Call for help and activate emergency response',
      'Begin chest compressions',
      'Check for responsiveness',
      'Open the airway',
      'Attach and use AED when available',
      'Give rescue breaths'
    ],
    correctOrder: [2, 0, 1, 3, 5, 4],
    rationale: 'BLS sequence: Check responsiveness → Call for help → Begin compressions (C-A-B approach) → Open airway → Give breaths → Use AED. Early compressions and defibrillation are critical for survival.'
  },
  {
    id: generateId(),
    type: 'ordered-response',
    category: 'risk-reduction',
    difficulty: 'medium',
    stem: 'Place the steps for inserting a urinary catheter in the correct order.',
    items: [
      'Cleanse the urethral meatus',
      'Gather supplies and verify order',
      'Inflate the balloon and gently pull back',
      'Insert catheter until urine flows',
      'Establish a sterile field',
      'Apply sterile gloves'
    ],
    correctOrder: [1, 4, 5, 0, 3, 2],
    rationale: 'Correct catheterization sequence: Gather supplies → Establish sterile field → Apply sterile gloves → Cleanse meatus → Insert catheter until urine flows → Inflate balloon and pull back to seat it. Maintaining sterility prevents CAUTI.'
  },

  // ============================================
  // CLOZE/DROPDOWN
  // ============================================
  {
    id: generateId(),
    type: 'cloze-dropdown',
    category: 'pharmacological',
    difficulty: 'medium',
    stem: 'Complete the following statement about insulin administration.',
    template: 'When administering insulin, the nurse should inject {{1}} insulin at a {{2}} angle. The preferred sites for injection include the {{3}}. Insulin should be {{4}} before administration.',
    blanks: [
      { id: 1, options: ['intramuscularly', 'subcutaneously', 'intradermally'], correctAnswer: 1 },
      { id: 2, options: ['45-degree', '90-degree', '15-degree'], correctAnswer: 1 },
      { id: 3, options: ['deltoid muscle', 'abdomen', 'gluteus maximus'], correctAnswer: 1 },
      { id: 4, options: ['warmed to room temperature', 'refrigerated until use', 'shaken vigorously'], correctAnswer: 0 }
    ],
    rationale: 'Insulin is given subcutaneously at a 90-degree angle (or 45-degree if thin). The abdomen provides most consistent absorption. Insulin should be at room temperature to reduce discomfort and improve absorption. Never shake insulin - roll gently.'
  },
  {
    id: generateId(),
    type: 'cloze-dropdown',
    category: 'physiological-adaptation',
    difficulty: 'hard',
    stem: 'Complete the statement about interpreting arterial blood gas results.',
    template: 'A pH of 7.30, PaCO2 of 55 mmHg, and HCO3 of 24 mEq/L indicates {{1}}. The nurse should anticipate orders for {{2}}. The underlying cause is likely {{3}}.',
    blanks: [
      { id: 1, options: ['respiratory acidosis', 'respiratory alkalosis', 'metabolic acidosis', 'metabolic alkalosis'], correctAnswer: 0 },
      { id: 2, options: ['sodium bicarbonate', 'bronchodilators and oxygen', 'potassium replacement', 'calcium gluconate'], correctAnswer: 1 },
      { id: 3, options: ['hyperventilation', 'hypoventilation', 'diarrhea', 'vomiting'], correctAnswer: 1 }
    ],
    rationale: 'Low pH (acidotic) + High CO2 + Normal HCO3 = Uncompensated respiratory acidosis. Caused by hypoventilation (CO2 retention). Treatment focuses on improving ventilation with bronchodilators and oxygen, not bicarbonate administration.'
  },

  // ============================================
  // MATRIX/GRID
  // ============================================
  {
    id: generateId(),
    type: 'matrix',
    category: 'pharmacological',
    difficulty: 'medium',
    stem: 'For each medication, identify whether the nurse should administer or hold the dose based on the client\'s current condition. The client has a BP of 88/56 mmHg and heart rate of 52 bpm.',
    rows: ['Metoprolol 25mg', 'Lisinopril 10mg', 'Furosemide 40mg', 'Aspirin 81mg'],
    columns: ['Administer', 'Hold'],
    correctSelections: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 3, column: 0 }
    ],
    selectionType: 'single-per-row',
    rationale: 'With hypotension (88/56) and bradycardia (52), hold: Metoprolol (beta-blocker causes bradycardia), Lisinopril (ACE inhibitor lowers BP), Furosemide (diuretic can worsen hypotension). Aspirin for cardioprotection can be given as it doesn\'t affect BP/HR significantly.'
  },
  {
    id: generateId(),
    type: 'matrix',
    category: 'safety-infection',
    difficulty: 'medium',
    stem: 'Match each isolation precaution type to the appropriate client condition.',
    rows: ['Tuberculosis', 'MRSA wound infection', 'Meningococcal meningitis', 'C. difficile infection'],
    columns: ['Contact', 'Droplet', 'Airborne'],
    correctSelections: [
      { row: 0, column: 2 },
      { row: 1, column: 0 },
      { row: 2, column: 1 },
      { row: 3, column: 0 }
    ],
    selectionType: 'single-per-row',
    rationale: 'TB = Airborne (tiny particles stay suspended). MRSA = Contact (spread by direct touch). Meningococcal meningitis = Droplet (large particles fall within 3 feet). C. diff = Contact (spores spread by touch, also requires hand washing as alcohol doesn\'t kill spores).'
  },

  // ============================================
  // HIGHLIGHT
  // ============================================
  {
    id: generateId(),
    type: 'highlight',
    category: 'physiological-adaptation',
    difficulty: 'hard',
    stem: 'Review the nurse\'s notes and highlight the findings that require immediate intervention.',
    passage: 'Client is a 68-year-old male admitted for pneumonia. Current vital signs: Temperature 101.2°F, Blood pressure 142/88 mmHg, Heart rate 98 bpm, Respiratory rate 28 breaths/min, Oxygen saturation 86% on room air. Client reports mild chest discomfort with deep breathing. Lungs have crackles in bilateral lower lobes. Client is alert and oriented. Urine output 30 mL/hr. Last meal was 4 hours ago.',
    highlightableSegments: [
      { id: 'temp', text: 'Temperature 101.2°F', startIndex: 68, endIndex: 88 },
      { id: 'bp', text: 'Blood pressure 142/88 mmHg', startIndex: 90, endIndex: 117 },
      { id: 'hr', text: 'Heart rate 98 bpm', startIndex: 119, endIndex: 137 },
      { id: 'rr', text: 'Respiratory rate 28 breaths/min', startIndex: 139, endIndex: 171 },
      { id: 'spo2', text: 'Oxygen saturation 86% on room air', startIndex: 173, endIndex: 207 },
      { id: 'pain', text: 'mild chest discomfort with deep breathing', startIndex: 224, endIndex: 265 },
      { id: 'lungs', text: 'crackles in bilateral lower lobes', startIndex: 274, endIndex: 307 },
      { id: 'neuro', text: 'alert and oriented', startIndex: 320, endIndex: 338 },
      { id: 'uo', text: 'Urine output 30 mL/hr', startIndex: 340, endIndex: 361 }
    ],
    correctHighlights: ['rr', 'spo2'],
    instruction: 'Highlight the TWO findings that require immediate nursing intervention.',
    rationale: 'Respiratory rate of 28 (tachypnea) and SpO2 of 86% (hypoxemia) require immediate intervention - oxygen therapy and possible respiratory support. The fever, BP, HR, and crackles are expected with pneumonia. Urine output is adequate. Mental status is normal.'
  },

  // ============================================
  // BOW-TIE
  // ============================================
  {
    id: generateId(),
    type: 'bow-tie',
    category: 'physiological-adaptation',
    difficulty: 'hard',
    stem: 'A 72-year-old client is admitted with confusion, lethargy, muscle weakness, and irregular heart rhythm. Lab results show potassium 6.8 mEq/L.',
    scenario: 'The client has a history of chronic kidney disease and takes lisinopril for hypertension.',
    centerCondition: 'Hyperkalemia',
    leftSide: {
      label: 'Risk Factors / Causes',
      options: [
        'Chronic kidney disease',
        'ACE inhibitor use',
        'Excessive potassium intake',
        'Loop diuretic use',
        'Metabolic alkalosis',
        'Dehydration'
      ],
      correctAnswers: [0, 1],
      selectCount: 2
    },
    rightSide: {
      label: 'Priority Interventions',
      options: [
        'Administer IV calcium gluconate',
        'Give oral potassium supplement',
        'Administer insulin with glucose',
        'Encourage high-potassium foods',
        'Initiate cardiac monitoring',
        'Give sodium bicarbonate'
      ],
      correctAnswers: [0, 2, 4],
      selectCount: 3
    },
    rationale: 'CKD impairs potassium excretion; ACE inhibitors cause potassium retention. For K+ 6.8: Calcium gluconate stabilizes cardiac membrane, insulin/glucose shifts K+ into cells, and continuous cardiac monitoring is essential due to arrhythmia risk. Avoid potassium supplements/foods.'
  },
  {
    id: generateId(),
    type: 'bow-tie',
    category: 'pharmacological',
    difficulty: 'hard',
    stem: 'A client taking warfarin has an INR of 5.2. The client has no active bleeding.',
    scenario: 'The therapeutic INR range is 2.0-3.0. The client takes warfarin for atrial fibrillation.',
    centerCondition: 'Supratherapeutic INR',
    leftSide: {
      label: 'Potential Causes',
      options: [
        'Increased vitamin K intake',
        'Concurrent antibiotic therapy',
        'Missed warfarin doses',
        'Excessive alcohol consumption',
        'Recent surgery',
        'Decreased dietary vitamin K'
      ],
      correctAnswers: [1, 3, 5],
      selectCount: 3
    },
    rightSide: {
      label: 'Nursing Actions',
      options: [
        'Hold warfarin dose',
        'Double the next warfarin dose',
        'Monitor for bleeding signs',
        'Administer vitamin K if ordered',
        'Increase activity level',
        'Notify the provider'
      ],
      correctAnswers: [0, 2, 5],
      selectCount: 3
    },
    rationale: 'Antibiotics, alcohol, and decreased vitamin K increase INR. For INR 5.2 without bleeding: Hold warfarin, monitor for bleeding, notify provider. Vitamin K may be given for very high INR or bleeding. Never double the dose. Increased vitamin K would LOWER INR.'
  },

  // ============================================
  // Additional questions for variety
  // ============================================
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'health-promotion',
    difficulty: 'easy',
    stem: 'A nurse is teaching a prenatal class about fetal development. At which gestational age can the fetal heartbeat first be detected by Doppler?',
    options: [
      '6-8 weeks',
      '10-12 weeks',
      '16-18 weeks',
      '20-22 weeks'
    ],
    correctAnswer: 1,
    rationale: 'Fetal heart tones can be detected by Doppler ultrasound at 10-12 weeks gestation. Transvaginal ultrasound may detect cardiac activity as early as 6 weeks, but Doppler on the abdomen typically detects it at 10-12 weeks.'
  },
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'psychosocial',
    difficulty: 'medium',
    stem: 'A client diagnosed with major depression states, "I\'m a burden to everyone. They\'d be better off without me." What is the nurse\'s priority response?',
    options: [
      '"Don\'t say that - your family loves you."',
      '"Are you thinking about hurting yourself?"',
      '"Let\'s talk about something more positive."',
      '"I\'ll let the doctor know how you\'re feeling."'
    ],
    correctAnswer: 1,
    rationale: 'The client\'s statement suggests suicidal ideation. The nurse must directly assess suicide risk by asking clearly about self-harm thoughts. This is not an invasion of privacy but a critical safety assessment. Deflection or reassurance without assessment is inappropriate.'
  },
  {
    id: generateId(),
    type: 'select-all',
    category: 'basic-care',
    difficulty: 'easy',
    stem: 'A client is at risk for pressure injuries. Which interventions should the nurse implement? Select all that apply.',
    options: [
      'Reposition the client every 2 hours',
      'Keep the head of bed elevated at 90 degrees',
      'Use a pressure-redistributing mattress',
      'Massage reddened bony prominences',
      'Keep skin clean and dry',
      'Ensure adequate protein intake'
    ],
    correctAnswers: [0, 2, 4, 5],
    partialCredit: true,
    rationale: 'Prevention includes: repositioning q2h, pressure-redistributing surfaces, clean/dry skin, adequate nutrition. Do NOT massage reddened areas (damages fragile tissue). HOB at 30 degrees or less reduces shear forces - 90 degrees increases pressure and shear.'
  },
  {
    id: generateId(),
    type: 'multiple-choice',
    category: 'risk-reduction',
    difficulty: 'medium',
    stem: 'A client\'s laboratory results show: Sodium 128 mEq/L, Potassium 5.6 mEq/L, Creatinine 3.2 mg/dL. Which condition do these findings suggest?',
    options: [
      'Dehydration',
      'Acute kidney injury',
      'Heart failure',
      'Diabetes insipidus'
    ],
    correctAnswer: 1,
    rationale: 'Low sodium, elevated potassium, and elevated creatinine indicate acute kidney injury. The kidneys are unable to excrete potassium and creatinine or regulate sodium. Dehydration would show elevated sodium. DI causes elevated sodium with dilute urine.'
  },
  {
    id: generateId(),
    type: 'ordered-response',
    category: 'management-of-care',
    difficulty: 'medium',
    stem: 'A nurse receives report on four clients. Place them in priority order for assessment (highest priority first).',
    items: [
      'Client with chest pain rated 8/10 and diaphoresis',
      'Client 2 days post-op requesting pain medication',
      'Client with new-onset confusion and blood glucose of 42 mg/dL',
      'Client with COPD and oxygen saturation of 89%'
    ],
    correctOrder: [0, 2, 3, 1],
    rationale: 'Priority: 1) Chest pain with diaphoresis = possible MI (life-threatening). 2) Hypoglycemia causes confusion and can be life-threatening if not treated. 3) COPD client with 89% SpO2 needs assessment but 88-92% may be acceptable baseline. 4) Post-op pain is important but not emergent.'
  }
];

// Export helper functions
export function getQuestionsByCategory(category: NCLEXCategory): NextGenQuestion[] {
  return nextGenQuestionBank.filter(q => q.category === category);
}

export function getQuestionsByType(type: NextGenQuestion['type']): NextGenQuestion[] {
  return nextGenQuestionBank.filter(q => q.type === type);
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): NextGenQuestion[] {
  return nextGenQuestionBank.filter(q => q.difficulty === difficulty);
}

export function getRandomQuestions(count: number, filters?: {
  categories?: NCLEXCategory[];
  types?: NextGenQuestion['type'][];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}): NextGenQuestion[] {
  let pool = [...nextGenQuestionBank];
  
  // Filter by categories if specified
  if (filters?.categories && filters.categories.length > 0) {
    pool = pool.filter(q => q && filters.categories!.includes(q.category));
  }
  
  // Filter by types if specified - only include supported types
  const supportedTypes: NextGenQuestion['type'][] = [
    'multiple-choice', 'select-all', 'ordered-response', 
    'cloze-dropdown', 'matrix', 'highlight', 'bow-tie'
  ];
  
  if (filters?.types && filters.types.length > 0) {
    const validTypes = filters.types.filter(t => supportedTypes.includes(t));
    if (validTypes.length > 0) {
      pool = pool.filter(q => q && validTypes.includes(q.type));
    }
  }
  
  // Filter by difficulty if specified
  if (filters?.difficulty && filters.difficulty !== 'mixed') {
    pool = pool.filter(q => q && q.difficulty === filters.difficulty);
  }
  
  // Ensure all questions are valid
  pool = pool.filter(q => q && q.id && q.type && q.stem);
  
  // Shuffle and take requested count
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default nextGenQuestionBank;
