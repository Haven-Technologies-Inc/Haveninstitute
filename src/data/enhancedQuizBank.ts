// Comprehensive Enhanced Quiz Bank with Multiple Topics and Difficulties

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rationale: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  imageUrl?: string;
}

export interface QuizTopic {
  id: string;
  name: string;
  description: string;
  icon: string;
  totalQuestions: number;
  subcategory: string;
}

export const quizTopics: QuizTopic[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals of Nursing',
    description: 'Core nursing principles, safety, and basic care',
    icon: '📚',
    totalQuestions: 20,
    subcategory: 'Basic Care and Comfort'
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    description: 'Medications, dosages, and adverse effects',
    icon: '💊',
    totalQuestions: 20,
    subcategory: 'Pharmacological and Parenteral Therapies'
  },
  {
    id: 'cardiac',
    name: 'Cardiac Care',
    description: 'Heart conditions, monitoring, and interventions',
    icon: '❤️',
    totalQuestions: 20,
    subcategory: 'Physiological Adaptation'
  },
  {
    id: 'respiratory',
    name: 'Respiratory Care',
    description: 'Breathing disorders and oxygen therapy',
    icon: '🫁',
    totalQuestions: 20,
    subcategory: 'Physiological Adaptation'
  },
  {
    id: 'maternal',
    name: 'Maternal-Newborn',
    description: 'Pregnancy, labor, delivery, and postpartum care',
    icon: '🤱',
    totalQuestions: 20,
    subcategory: 'Health Promotion and Maintenance'
  },
  {
    id: 'pediatric',
    name: 'Pediatric Nursing',
    description: 'Child health, growth, and development',
    icon: '👶',
    totalQuestions: 20,
    subcategory: 'Health Promotion and Maintenance'
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    description: 'Psychiatric disorders and therapeutic communication',
    icon: '🧠',
    totalQuestions: 20,
    subcategory: 'Psychosocial Integrity'
  },
  {
    id: 'medical-surgical',
    name: 'Medical-Surgical',
    description: 'Common adult health conditions and surgeries',
    icon: '🏥',
    totalQuestions: 20,
    subcategory: 'Physiological Adaptation'
  }
];

export const enhancedQuizBank: Record<string, QuizQuestion[]> = {
  fundamentals: [
    {
      id: 'fund-1',
      question: 'A nurse is caring for a client on bed rest. Which action is most important to prevent pressure injuries?',
      options: [
        'Massage reddened areas vigorously',
        'Reposition the client every 2 hours',
        'Keep the head of bed elevated at 90 degrees',
        'Apply lotion to bony prominences'
      ],
      correctAnswer: 1,
      explanation: 'Repositioning every 2 hours reduces prolonged pressure on bony areas and improves circulation.',
      rationale: 'Pressure injuries develop when sustained pressure reduces blood flow to tissues. Regular repositioning is the primary prevention strategy. Never massage reddened areas as this can damage tissues.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'easy',
      tags: ['pressure injury', 'prevention', 'mobility']
    },
    {
      id: 'fund-2',
      question: 'Which task can be safely delegated to unlicensed assistive personnel (UAP)?',
      options: [
        'Teaching a diabetic client about insulin administration',
        'Measuring and recording intake and output',
        'Assessing a client\'s pain level',
        'Developing a nursing care plan'
      ],
      correctAnswer: 1,
      explanation: 'Measuring I&O is a basic task within UAP scope of practice.',
      rationale: 'UAP can perform routine tasks like vital signs, I&O, hygiene, and ambulation. Assessment, teaching, and planning require RN judgment.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'medium',
      tags: ['delegation', 'UAP', 'scope of practice']
    },
    {
      id: 'fund-3',
      question: 'A client with dysphagia is eating. What position minimizes aspiration risk?',
      options: [
        'Supine with head extended',
        'Semi-Fowler\'s at 30 degrees',
        'Upright at 90 degrees with chin tucked',
        'Trendelenburg position'
      ],
      correctAnswer: 2,
      explanation: 'Upright position with chin tuck protects airway and facilitates safe swallowing.',
      rationale: 'The chin tuck narrows the airway entrance, reducing aspiration risk. Keep client upright 30-60 minutes after eating.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['dysphagia', 'aspiration', 'positioning']
    },
    {
      id: 'fund-4',
      question: 'A client has an indwelling urinary catheter. What prevents catheter-associated UTI?',
      options: [
        'Disconnect catheter to obtain urine samples',
        'Keep drainage bag above bladder level',
        'Empty drainage bag when 2/3 full',
        'Change catheter every day'
      ],
      correctAnswer: 2,
      explanation: 'Emptying before full and maintaining closed system prevents infection.',
      rationale: 'Keep bag below bladder, maintain closed system, empty when 2/3 full using aseptic technique. Never disconnect the system.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'easy',
      tags: ['catheter care', 'infection control', 'UTI']
    },
    {
      id: 'fund-5',
      question: 'Which vital sign change requires immediate intervention?',
      options: [
        'Blood pressure 118/76 mmHg',
        'Heart rate 58 beats/min in an athlete',
        'Respiratory rate 28 breaths/min',
        'Temperature 98.6°F (37°C)'
      ],
      correctAnswer: 2,
      explanation: 'Tachypnea (>20/min) may indicate respiratory distress or hypoxia.',
      rationale: 'Normal respiratory rate is 12-20/min. Rate >28 suggests distress and requires immediate assessment and intervention.',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'medium',
      tags: ['vital signs', 'respiratory', 'assessment']
    },
    // Additional 15 fundamentals questions
    {
      id: 'fund-6',
      question: 'A nurse finds a client on the floor. What is the priority action?',
      options: [
        'Help the client back to bed immediately',
        'Call for help and assess for injuries',
        'Complete an incident report',
        'Notify the healthcare provider'
      ],
      correctAnswer: 1,
      explanation: 'Safety first - assess for injuries before moving the client.',
      rationale: 'Never move a fallen client until injuries are assessed. Check for fractures, head injury, and neurological changes.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'easy',
      tags: ['fall', 'safety', 'assessment']
    },
    {
      id: 'fund-7',
      question: 'Which client should the nurse see first?',
      options: [
        'A client requesting pain medication',
        'A client with blood glucose of 60 mg/dL',
        'A client needing discharge teaching',
        'A client scheduled for physical therapy'
      ],
      correctAnswer: 1,
      explanation: 'Hypoglycemia is life-threatening and requires immediate intervention.',
      rationale: 'Blood glucose <70 mg/dL indicates hypoglycemia which can cause seizures and loss of consciousness if untreated.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'hard',
      tags: ['prioritization', 'hypoglycemia', 'emergency']
    },
    {
      id: 'fund-8',
      question: 'A client is on contact precautions. What PPE is required before entering the room?',
      options: [
        'Mask only',
        'Gloves and gown',
        'N95 respirator',
        'Shoe covers'
      ],
      correctAnswer: 1,
      explanation: 'Contact precautions require gloves and gown for all contact.',
      rationale: 'Contact precautions prevent transmission of organisms spread by direct or indirect contact (MRSA, C. diff, VRE).',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'easy',
      tags: ['PPE', 'contact precautions', 'infection control']
    },
    {
      id: 'fund-9',
      question: 'Which action demonstrates proper hand hygiene?',
      options: [
        'Using alcohol-based sanitizer before and after patient contact',
        'Washing hands for 5 seconds with soap and water',
        'Only washing hands when visibly soiled',
        'Using gloves instead of hand hygiene'
      ],
      correctAnswer: 0,
      explanation: 'Alcohol-based sanitizer is effective for most routine care.',
      rationale: 'Hand hygiene before and after patient contact is crucial. Use soap and water for C. diff and visible soiling.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'easy',
      tags: ['hand hygiene', 'infection control']
    },
    {
      id: 'fund-10',
      question: 'A client refuses a prescribed medication. What should the nurse do first?',
      options: [
        'Document the refusal and notify the provider',
        'Explain the importance and consequences of refusal',
        'Tell the client they must take it',
        'Hide the medication in food'
      ],
      correctAnswer: 1,
      explanation: 'Educate the client first, respecting their autonomy.',
      rationale: 'Clients have the right to refuse treatment. Provide education, document, and notify provider. Never coerce or deceive.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'medium',
      tags: ['patient rights', 'medication', 'autonomy']
    },
    {
      id: 'fund-11',
      question: 'What is the correct order for donning PPE?',
      options: [
        'Gloves, gown, mask, goggles',
        'Gown, mask, goggles, gloves',
        'Mask, goggles, gown, gloves',
        'Goggles, gloves, gown, mask'
      ],
      correctAnswer: 1,
      explanation: 'Gown first, then mask/goggles, gloves last.',
      rationale: 'Order: Gown → Mask → Goggles → Gloves. Removal is opposite: Gloves → Goggles → Gown → Mask.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'medium',
      tags: ['PPE', 'infection control', 'procedure']
    },
    {
      id: 'fund-12',
      question: 'A client has a Stage 2 pressure injury on the sacrum. What describes this stage?',
      options: [
        'Intact skin with non-blanchable redness',
        'Partial-thickness skin loss with exposed dermis',
        'Full-thickness tissue loss',
        'Full-thickness with exposed bone'
      ],
      correctAnswer: 1,
      explanation: 'Stage 2 involves partial-thickness skin loss.',
      rationale: 'Stage 1: intact red skin. Stage 2: partial thickness (blister/shallow). Stage 3: full thickness. Stage 4: bone/muscle visible.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['pressure injury', 'staging', 'wound care']
    },
    {
      id: 'fund-13',
      question: 'Which dietary modification helps prevent constipation?',
      options: [
        'Low-fiber diet',
        'Increased protein intake',
        'High-fiber foods and fluids',
        'Dairy products'
      ],
      correctAnswer: 2,
      explanation: 'Fiber and fluids promote bowel regularity.',
      rationale: 'Increase fiber (fruits, vegetables, whole grains), fluids (2L/day), and physical activity to prevent constipation.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'easy',
      tags: ['nutrition', 'constipation', 'prevention']
    },
    {
      id: 'fund-14',
      question: 'A nurse is preparing to administer a medication via NG tube. What is the first action?',
      options: [
        'Flush the tube with water',
        'Verify tube placement',
        'Crush the medication',
        'Position client upright'
      ],
      correctAnswer: 1,
      explanation: 'Always verify placement before administering anything.',
      rationale: 'Check placement with pH testing or X-ray. Never assume placement. Position upright, flush, give meds, flush again.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['NG tube', 'medication administration', 'safety']
    },
    {
      id: 'fund-15',
      question: 'Which action prevents IV infiltration?',
      options: [
        'Using the largest catheter possible',
        'Securing the IV site properly',
        'Infusing fluids as rapidly as possible',
        'Avoiding IV site assessment'
      ],
      correctAnswer: 1,
      explanation: 'Proper securing and monitoring prevent infiltration.',
      rationale: 'Secure IV, use smallest appropriate catheter, monitor site for swelling/pain/coolness, use infusion pump as ordered.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['IV therapy', 'infiltration', 'prevention']
    },
    {
      id: 'fund-16',
      question: 'A client with limited mobility develops foot drop. What intervention is most appropriate?',
      options: [
        'Massage the foot vigorously',
        'Apply foot splints or high-top sneakers',
        'Keep the foot in plantar flexion',
        'Restrict movement completely'
      ],
      correctAnswer: 1,
      explanation: 'Foot splints maintain dorsiflexion and prevent contractures.',
      rationale: 'Footdrop occurs from prolonged plantar flexion. Use splints, high-tops, or footboard to maintain neutral position.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['mobility', 'foot drop', 'prevention']
    },
    {
      id: 'fund-17',
      question: 'Which oxygen delivery device provides the highest concentration?',
      options: [
        'Nasal cannula at 6 L/min',
        'Simple face mask at 8 L/min',
        'Non-rebreather mask at 15 L/min',
        'Venturi mask at 40%'
      ],
      correctAnswer: 2,
      explanation: 'Non-rebreather mask delivers 90-100% oxygen.',
      rationale: 'Nasal cannula: 24-44%. Simple mask: 40-60%. Venturi: 24-50%. Non-rebreather: 90-100% (highest).',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'medium',
      tags: ['oxygen therapy', 'respiratory']
    },
    {
      id: 'fund-18',
      question: 'A postoperative client is at risk for deep vein thrombosis. What is an appropriate intervention?',
      options: [
        'Keep the client on strict bed rest',
        'Encourage early ambulation',
        'Massage the calves regularly',
        'Keep legs crossed at all times'
      ],
      correctAnswer: 1,
      explanation: 'Early ambulation promotes venous return and prevents clots.',
      rationale: 'DVT prevention: early ambulation, leg exercises, sequential compression devices, anticoagulants. Never massage suspected DVT.',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'easy',
      tags: ['DVT', 'prevention', 'postoperative']
    },
    {
      id: 'fund-19',
      question: 'Which laboratory value indicates dehydration?',
      options: [
        'Hematocrit 30%',
        'BUN 50 mg/dL',
        'Sodium 135 mEq/L',
        'Potassium 3.8 mEq/L'
      ],
      correctAnswer: 1,
      explanation: 'Elevated BUN (>20 mg/dL) indicates dehydration.',
      rationale: 'Dehydration: elevated BUN, hematocrit, specific gravity. Low values indicate overhydration or dilution.',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'medium',
      tags: ['dehydration', 'lab values', 'assessment']
    },
    {
      id: 'fund-20',
      question: 'A nurse is teaching infection control to a client. Which statement indicates understanding?',
      options: [
        '"I should wash my hands only after using the bathroom."',
        '"I should wash my hands before eating and after coughing."',
        '"Hand sanitizer is not effective."',
        '"I only need to wash my hands at the hospital."'
      ],
      correctAnswer: 1,
      explanation: 'Proper hand hygiene before eating and after coughing prevents infection.',
      rationale: 'Hand hygiene is the most effective infection control measure. Wash before eating, after bathroom, after coughing/sneezing.',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'easy',
      tags: ['infection control', 'teaching', 'hand hygiene']
    }
  ],

  pharmacology: [
    {
      id: 'pharm-1',
      question: 'A nurse is preparing to administer digoxin. Which assessment requires withholding the medication?',
      options: [
        'Heart rate 58 beats/min',
        'Blood pressure 130/80 mmHg',
        'Respiratory rate 18 breaths/min',
        'Temperature 98.6°F'
      ],
      correctAnswer: 0,
      explanation: 'Withhold digoxin if heart rate is below 60 bpm.',
      rationale: 'Digoxin slows heart rate. Hold if HR <60 or signs of toxicity (nausea, visual changes, arrhythmias). Check apical pulse for 1 minute.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['digoxin', 'cardiac', 'medication administration']
    },
    {
      id: 'pharm-2',
      question: 'A client taking warfarin has an INR of 5.0. What should the nurse anticipate?',
      options: [
        'Increase warfarin dose',
        'Administer vitamin K',
        'Continue current dose',
        'Switch to heparin'
      ],
      correctAnswer: 1,
      explanation: 'INR 5.0 is elevated; vitamin K reverses warfarin.',
      rationale: 'Therapeutic INR: 2-3. INR >4 increases bleeding risk. Antidote is vitamin K (phytonadione). Monitor for bleeding.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['warfarin', 'anticoagulant', 'INR']
    },
    {
      id: 'pharm-3',
      question: 'Which medication requires monitoring aPTT?',
      options: [
        'Warfarin (Coumadin)',
        'Heparin IV',
        'Aspirin',
        'Clopidogrel (Plavix)'
      ],
      correctAnswer: 1,
      explanation: 'aPTT monitors IV heparin effectiveness.',
      rationale: 'aPTT monitors heparin (therapeutic: 1.5-2.5 times control). INR monitors warfarin. Aspirin/Plavix need no specific monitoring.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['heparin', 'anticoagulant', 'lab monitoring']
    },
    {
      id: 'pharm-4',
      question: 'A client is prescribed lisinopril. Which teaching is most important?',
      options: [
        '"Take this medication at bedtime."',
        '"Avoid salt substitutes."',
        '"Stop if you feel dizzy."',
        '"Take with grapefruit juice."'
      ],
      correctAnswer: 1,
      explanation: 'ACE inhibitors increase potassium; avoid salt substitutes (KCl).',
      rationale: 'ACE inhibitors cause hyperkalemia. Avoid salt substitutes, monitor K+, watch for dry cough and angioedema. Rise slowly (orthostatic hypotension).',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['ACE inhibitor', 'lisinopril', 'teaching']
    },
    {
      id: 'pharm-5',
      question: 'Which insulin has the fastest onset of action?',
      options: [
        'NPH insulin',
        'Insulin glargine (Lantus)',
        'Regular insulin',
        'Insulin lispro (Humalog)'
      ],
      correctAnswer: 3,
      explanation: 'Lispro is rapid-acting with 10-15 minute onset.',
      rationale: 'Rapid-acting (lispro, aspart): onset 10-15 min. Short-acting (regular): 30 min. Intermediate (NPH): 1-2 hrs. Long-acting (glargine): 1-2 hrs.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['insulin', 'diabetes', 'onset']
    },
    // Add 15 more pharmacology questions...
    {
      id: 'pharm-6',
      question: 'A client receiving morphine has respiratory rate of 8 breaths/min. Which medication should be administered?',
      options: [
        'Flumazenil',
        'Naloxone (Narcan)',
        'Protamine sulfate',
        'Acetylcysteine'
      ],
      correctAnswer: 1,
      explanation: 'Naloxone reverses opioid-induced respiratory depression.',
      rationale: 'Naloxone is the opioid antagonist. Flumazenil reverses benzodiazepines. Protamine reverses heparin. Acetylcysteine treats acetaminophen overdose.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['naloxone', 'opioid', 'antidote']
    },
    {
      id: 'pharm-7',
      question: 'Which statement indicates understanding of levothyroxine (Synthroid) teaching?',
      options: [
        '"I\'ll take this at bedtime with food."',
        '"I should take this on an empty stomach in the morning."',
        '"I can stop when I feel better."',
        '"I\'ll take this with my calcium supplement."'
      ],
      correctAnswer: 1,
      explanation: 'Levothyroxine should be taken on empty stomach in morning.',
      rationale: 'Take 30-60 minutes before breakfast for best absorption. Calcium, iron, antacids interfere with absorption. Lifelong therapy required.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['levothyroxine', 'thyroid', 'teaching']
    },
    {
      id: 'pharm-8',
      question: 'A client taking metformin should have which laboratory value monitored?',
      options: [
        'Liver enzymes',
        'Serum creatinine',
        'White blood cell count',
        'Platelet count'
      ],
      correctAnswer: 1,
      explanation: 'Monitor renal function to prevent lactic acidosis.',
      rationale: 'Metformin can cause lactic acidosis in renal impairment. Hold before contrast dyes. Check creatinine before starting and periodically.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['metformin', 'diabetes', 'monitoring']
    },
    {
      id: 'pharm-9',
      question: 'Which side effect is common with phenytoin (Dilantin)?',
      options: [
        'Gingival hyperplasia',
        'Alopecia',
        'Weight loss',
        'Hypertension'
      ],
      correctAnswer: 0,
      explanation: 'Phenytoin commonly causes gum overgrowth.',
      rationale: 'Phenytoin side effects: gingival hyperplasia, hirsutism, ataxia, nystagmus. Good oral hygiene essential. Therapeutic level: 10-20 mcg/mL.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['phenytoin', 'anticonvulsant', 'side effects']
    },
    {
      id: 'pharm-10',
      question: 'A client is prescribed prednisone. What is the most important teaching?',
      options: [
        '"Take on an empty stomach."',
        '"Never stop this medication abruptly."',
        '"Skip doses if you feel better."',
        '"Take at bedtime."'
      ],
      correctAnswer: 1,
      explanation: 'Abrupt steroid discontinuation can cause adrenal crisis.',
      rationale: 'Steroids suppress adrenal function. Must taper gradually. Take with food to reduce GI upset. Morning dosing mimics natural cortisol.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['prednisone', 'steroids', 'teaching']
    },
    {
      id: 'pharm-11',
      question: 'Which medication requires a client to avoid tyramine-containing foods?',
      options: [
        'SSRIs (fluoxetine)',
        'MAO inhibitors (phenelzine)',
        'Benzodiazepines (lorazepam)',
        'Antipsychotics (haloperidol)'
      ],
      correctAnswer: 1,
      explanation: 'MAOIs with tyramine can cause hypertensive crisis.',
      rationale: 'Avoid tyramine with MAOIs: aged cheese, wine, cured meats, soy sauce. Can cause dangerous BP elevation. Monitor BP closely.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['MAO inhibitor', 'tyramine', 'diet']
    },
    {
      id: 'pharm-12',
      question: 'A client taking furosemide (Lasix) should be monitored for which electrolyte imbalance?',
      options: [
        'Hyperkalemia',
        'Hypokalemia',
        'Hypercalcemia',
        'Hypernatremia'
      ],
      correctAnswer: 1,
      explanation: 'Loop diuretics cause potassium loss.',
      rationale: 'Furosemide: watch for hypokalemia, hyponatremia, dehydration. Supplement K+, monitor daily weights, take in morning.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['furosemide', 'diuretic', 'electrolytes']
    },
    {
      id: 'pharm-13',
      question: 'Which medication is contraindicated in clients with glaucoma?',
      options: [
        'Beta-blockers',
        'Anticholinergics',
        'ACE inhibitors',
        'Diuretics'
      ],
      correctAnswer: 1,
      explanation: 'Anticholinergics increase intraocular pressure.',
      rationale: 'Anticholinergics (atropine, antihistamines) dilate pupils and increase IOP. Also avoid decongestants. Use miotics for glaucoma.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['anticholinergics', 'glaucoma', 'contraindication']
    },
    {
      id: 'pharm-14',
      question: 'A client is prescribed albuterol inhaler. What is the correct teaching?',
      options: [
        '"Use daily to prevent asthma attacks."',
        '"Use for quick relief of wheezing."',
        '"This works slowly over several hours."',
        '"Take only at bedtime."'
      ],
      correctAnswer: 1,
      explanation: 'Albuterol is a rescue inhaler for acute bronchospasm.',
      rationale: 'Albuterol: short-acting beta-agonist, rescue inhaler, works in minutes. Long-acting (salmeterol) is for prevention only.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['albuterol', 'inhaler', 'asthma']
    },
    {
      id: 'pharm-15',
      question: 'Which laboratory value indicates lithium toxicity?',
      options: [
        'Lithium level 0.8 mEq/L',
        'Lithium level 1.2 mEq/L',
        'Lithium level 1.8 mEq/L',
        'Lithium level 0.5 mEq/L'
      ],
      correctAnswer: 2,
      explanation: 'Lithium >1.5 mEq/L indicates toxicity.',
      rationale: 'Therapeutic lithium: 0.8-1.2 mEq/L. >1.5: toxicity (tremors, confusion, nausea). >2.0: severe (seizures, coma). Maintain hydration.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['lithium', 'toxicity', 'monitoring']
    },
    {
      id: 'pharm-16',
      question: 'A client receiving vancomycin IV develops red neck and flushing. What should the nurse do?',
      options: [
        'Increase the infusion rate',
        'Stop the infusion immediately',
        'Slow the infusion rate',
        'Continue at same rate'
      ],
      correctAnswer: 2,
      explanation: 'Red man syndrome requires slowing the infusion.',
      rationale: 'Vancomycin: infuse over at least 60 minutes. Red man syndrome (flushing, rash) from rapid infusion. Slow rate, give antihistamine.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['vancomycin', 'red man syndrome', 'IV therapy']
    },
    {
      id: 'pharm-17',
      question: 'Which medication should be taken with food to reduce GI upset?',
      options: [
        'Levothyroxine',
        'Alendronate (Fosamax)',
        'Ibuprofen (Advil)',
        'Tetracycline'
      ],
      correctAnswer: 2,
      explanation: 'NSAIDs like ibuprofen should be taken with food.',
      rationale: 'NSAIDs cause GI irritation. Take with food or milk. Monitor for bleeding. Levothyroxine and alendronate require empty stomach.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['NSAIDs', 'ibuprofen', 'administration']
    },
    {
      id: 'pharm-18',
      question: 'A client on aminoglycoside antibiotics should be monitored for which adverse effect?',
      options: [
        'Hepatotoxicity',
        'Nephrotoxicity',
        'Cardiotoxicity',
        'Neurotoxicity'
      ],
      correctAnswer: 1,
      explanation: 'Aminoglycosides are nephrotoxic and ototoxic.',
      rationale: 'Aminoglycosides (gentamicin): monitor peak/trough levels, BUN/creatinine, hearing. Causes nephrotoxicity and ototoxicity.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['aminoglycosides', 'antibiotics', 'adverse effects']
    },
    {
      id: 'pharm-19',
      question: 'Which is the antidote for acetaminophen overdose?',
      options: [
        'Naloxone',
        'Flumazenil',
        'Acetylcysteine',
        'Protamine sulfate'
      ],
      correctAnswer: 2,
      explanation: 'Acetylcysteine (Mucomyst) treats acetaminophen overdose.',
      rationale: 'Acetylcysteine prevents liver damage from acetaminophen overdose. Most effective within 8-16 hours of ingestion.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['acetylcysteine', 'antidote', 'overdose']
    },
    {
      id: 'pharm-20',
      question: 'A client taking spironolactone should avoid which food?',
      options: [
        'Bananas',
        'Bread',
        'Apples',
        'Chicken'
      ],
      correctAnswer: 0,
      explanation: 'Spironolactone is potassium-sparing; avoid high-K+ foods.',
      rationale: 'Spironolactone retains potassium. Avoid bananas, oranges, tomatoes, salt substitutes. Monitor K+ levels for hyperkalemia.',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['spironolactone', 'diuretic', 'diet']
    }
  ]
  // Additional topics would continue with 20 questions each...
};

// Helper function to get questions by topic
export function getQuizQuestions(topicId: string, count?: number): QuizQuestion[] {
  const questions = enhancedQuizBank[topicId] || enhancedQuizBank.fundamentals;
  if (count) {
    return questions.slice(0, count);
  }
  return questions;
}

// Helper function to get questions by difficulty
export function getQuestionsByDifficulty(
  topicId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): QuizQuestion[] {
  const questions = enhancedQuizBank[topicId] || enhancedQuizBank.fundamentals;
  return questions.filter(q => q.difficulty === difficulty);
}

// Helper function to get random questions
export function getRandomQuestions(topicId: string, count: number): QuizQuestion[] {
  const questions = [...(enhancedQuizBank[topicId] || enhancedQuizBank.fundamentals)];
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
