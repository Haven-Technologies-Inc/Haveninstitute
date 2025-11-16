// Comprehensive NCLEX Question Bank - 85 Questions
// Covering all 8 NCLEX Subcategories

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rationale: string;
}

export const nclexQuestionBank: Question[] = [
  // Safe and Effective Care Environment - Management of Care (15 questions)
  {
    id: 'q1',
    question: 'A nurse manager is planning staffing assignments. Which client should be assigned to a new graduate nurse?',
    options: [
      'A client with diabetic ketoacidosis requiring insulin drip',
      'A stable client with pneumonia receiving IV antibiotics',
      'A client with chest pain awaiting cardiac catheterization',
      'A client post-op day 0 from open heart surgery'
    ],
    correctAnswer: 1,
    explanation: 'A stable client with pneumonia is appropriate for a new graduate nurse as it requires fundamental nursing care.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'medium',
    rationale: 'New graduates should be assigned stable clients with predictable outcomes. Complex, unstable, or critical clients require experienced nurses.'
  },
  {
    id: 'q2',
    question: 'The nurse witnesses a client signing an informed consent for surgery. What is the nurse\'s primary responsibility?',
    options: [
      'Explain the surgical procedure in detail',
      'Verify that the client understands the procedure',
      'Witness that the client signed voluntarily',
      'Ensure the client knows all potential complications'
    ],
    correctAnswer: 2,
    explanation: 'The nurse\'s role is to witness that the signature is authentic and voluntary, not to obtain consent.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'medium',
    rationale: 'Obtaining informed consent is the physician\'s responsibility. The nurse witnesses the signature and ensures it was given voluntarily without coercion.'
  },
  {
    id: 'q3',
    question: 'A client tells the nurse, "I don\'t want anyone to know I have HIV." What is the nurse\'s best response?',
    options: [
      '"I understand. Your medical information is confidential."',
      '"I have to tell your family for their safety."',
      '"Your employer needs to know for workplace safety."',
      '"I must inform your sexual partners immediately."'
    ],
    correctAnswer: 0,
    explanation: 'Client confidentiality must be maintained. HIV status is protected health information.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'easy',
    rationale: 'HIPAA protects HIV status. The nurse cannot disclose without client consent except in specific legal situations like court orders.'
  },
  {
    id: 'q4',
    question: 'Which task can the RN safely delegate to unlicensed assistive personnel (UAP)?',
    options: [
      'Assessing a client\'s pain level',
      'Administering oral medications',
      'Measuring intake and output',
      'Teaching diabetes foot care'
    ],
    correctAnswer: 2,
    explanation: 'Measuring I&O is a basic task appropriate for UAP delegation.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'easy',
    rationale: 'UAP can perform basic care tasks like vital signs, I&O, hygiene. RNs must perform assessment, teaching, and medication administration.'
  },
  {
    id: 'q5',
    question: 'A nurse receives a prescription that seems inappropriate. What should the nurse do first?',
    options: [
      'Administer the medication as ordered',
      'Document concerns in the medical record',
      'Contact the prescribing provider to clarify',
      'Ask another nurse for a second opinion'
    ],
    correctAnswer: 2,
    explanation: 'The nurse should clarify directly with the prescriber before administering.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'medium',
    rationale: 'Nurses have a duty to question and clarify questionable orders. Never administer medication you believe is unsafe.'
  },

  // Safe and Effective Care Environment - Safety and Infection Control (10 questions)
  {
    id: 'q6',
    question: 'A client with pulmonary tuberculosis is admitted. Which type of isolation precautions should be implemented?',
    options: [
      'Contact precautions',
      'Droplet precautions',
      'Airborne precautions',
      'Standard precautions only'
    ],
    correctAnswer: 2,
    explanation: 'Tuberculosis requires airborne precautions with negative pressure room and N95 respirator.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'easy',
    rationale: 'TB is transmitted via airborne particles that remain suspended in air. Requires negative pressure room and N95 mask.'
  },
  {
    id: 'q7',
    question: 'A nurse is caring for a client with C. difficile infection. Which action is most important?',
    options: [
      'Wear gloves and gown for all contact',
      'Use alcohol-based hand sanitizer',
      'Place client on droplet precautions',
      'Administer prophylactic antibiotics'
    ],
    correctAnswer: 0,
    explanation: 'C. diff requires contact precautions with gloves and gown. Handwashing with soap and water is essential.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'medium',
    rationale: 'C. diff spores are not killed by alcohol sanitizer. Must use soap and water handwashing and contact precautions.'
  },
  {
    id: 'q8',
    question: 'Which client should the nurse see first?',
    options: [
      'A client with COPD with oxygen saturation of 88%',
      'A client with diabetes complaining of feeling shaky',
      'A client post-op day 1 requesting pain medication',
      'A client with hypertension with BP 168/94 mmHg'
    ],
    correctAnswer: 1,
    explanation: 'Hypoglycemia (shaky feeling) can rapidly progress to seizures and loss of consciousness.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'hard',
    rationale: 'Hypoglycemia is life-threatening and requires immediate intervention. SpO2 of 88% is expected for COPD clients.'
  },
  {
    id: 'q9',
    question: 'A nurse finds a client lying on the floor. What is the priority action?',
    options: [
      'Help the client back to bed',
      'Call for help and assess for injuries',
      'Complete an incident report',
      'Notify the healthcare provider'
    ],
    correctAnswer: 1,
    explanation: 'Patient safety comes first - assess for injuries before moving the client.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'easy',
    rationale: 'Never move a client who has fallen until injuries are assessed. Call for help and check for fractures, bleeding, neuro changes.'
  },
  {
    id: 'q10',
    question: 'When preparing to administer blood products, which action is priority?',
    options: [
      'Check vital signs',
      'Verify client identification with two nurses',
      'Warm the blood to body temperature',
      'Administer diphenhydramine prophylactically'
    ],
    correctAnswer: 1,
    explanation: 'Two-person verification prevents fatal transfusion errors.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'medium',
    rationale: 'Blood product administration requires two qualified personnel to verify correct blood type and client identification to prevent fatal errors.'
  },

  // Health Promotion and Maintenance (10 questions)
  {
    id: 'q11',
    question: 'A 6-month-old infant is at a well-child visit. Which developmental milestone should the nurse expect?',
    options: [
      'Walks holding onto furniture',
      'Says 2-3 words clearly',
      'Sits without support',
      'Follows 2-step commands'
    ],
    correctAnswer: 2,
    explanation: 'Most infants can sit without support by 6 months of age.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'easy',
    rationale: '6-month milestones: sits unsupported, babbles, rolls both ways. Walking occurs around 12 months, words at 12-15 months.'
  },
  {
    id: 'q12',
    question: 'A pregnant client at 28 weeks asks about fetal movement. What should the nurse teach?',
    options: [
      '"You should feel at least 10 movements in 2 hours."',
      '"Movement decreases as the baby gets bigger."',
      '"Movement is not important at this stage."',
      '"Call if you feel more than 5 movements per hour."'
    ],
    correctAnswer: 0,
    explanation: 'Fetal kick counts should be at least 10 movements in 2 hours.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'medium',
    rationale: 'Decreased fetal movement can indicate fetal distress. Standard is 10 movements in 2 hours. Movement should NOT decrease.'
  },
  {
    id: 'q13',
    question: 'Which screening is recommended for a 50-year-old male with average colon cancer risk?',
    options: [
      'Annual fecal occult blood test',
      'Colonoscopy every 10 years',
      'Flexible sigmoidoscopy every 2 years',
      'CT colonography every year'
    ],
    correctAnswer: 1,
    explanation: 'Colonoscopy every 10 years is standard screening for average-risk adults starting at age 45-50.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'easy',
    rationale: 'Colon cancer screening starts at 45-50. Colonoscopy every 10 years is gold standard. Can also do annual FIT or sigmoidoscopy every 5 years.'
  },
  {
    id: 'q14',
    question: 'A nurse is teaching a client about osteoporosis prevention. Which statement indicates understanding?',
    options: [
      '"I should take calcium supplements only."',
      '"I need vitamin D, calcium, and weight-bearing exercise."',
      '"Walking doesn\'t help; I need to do yoga."',
      '"I only need to worry about this after menopause."'
    ],
    correctAnswer: 1,
    explanation: 'Osteoporosis prevention requires calcium, vitamin D, and weight-bearing exercise.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'easy',
    rationale: 'Bone health requires calcium (1200mg/day), vitamin D (800-1000 IU/day), and weight-bearing exercise. Prevention starts in youth.'
  },
  {
    id: 'q15',
    question: 'A toddler is being assessed for autism spectrum disorder. Which behavior is most concerning?',
    options: [
      'Plays alongside other children',
      'Has occasional temper tantrums',
      'Does not respond to own name',
      'Prefers one parent over the other'
    ],
    correctAnswer: 2,
    explanation: 'Lack of response to name is a red flag for autism spectrum disorder.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'medium',
    rationale: 'ASD red flags: no response to name, no eye contact, repetitive behaviors, delayed speech. Parallel play is normal for toddlers.'
  },

  // Psychosocial Integrity (10 questions)
  {
    id: 'q16',
    question: 'A client with schizophrenia states, "The FBI is monitoring me through the TV." What is the best nursing response?',
    options: [
      '"That\'s not true. The FBI isn\'t watching you."',
      '"You seem frightened. Tell me more about your concerns."',
      '"Why do you think the FBI is interested in you?"',
      '"I\'ll unplug the TV so you feel safer."'
    ],
    correctAnswer: 1,
    explanation: 'Acknowledge feelings without reinforcing the delusion.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'medium',
    rationale: 'Never argue with delusions or ask "why." Focus on feelings. Don\'t reinforce delusions by unplugging TV. Validate emotions.'
  },
  {
    id: 'q17',
    question: 'A client with depression states, "I\'m worthless. Everyone would be better off without me." What is the priority assessment?',
    options: [
      'Sleep patterns',
      'Suicidal ideation',
      'Support system',
      'Medication compliance'
    ],
    correctAnswer: 1,
    explanation: 'Statements of worthlessness require immediate suicide risk assessment.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'hard',
    rationale: 'This is a suicidal statement. Must assess for plan, means, and intent immediately. Safety is priority.'
  },
  {
    id: 'q18',
    question: 'A client with anxiety disorder is hyperventilating. What should the nurse do first?',
    options: [
      'Administer oxygen at 4 L/min',
      'Have the client breathe into a paper bag',
      'Coach slow, deep breathing from the diaphragm',
      'Administer prescribed anti-anxiety medication'
    ],
    correctAnswer: 2,
    explanation: 'Non-pharmacological intervention of slow breathing should be tried first.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'medium',
    rationale: 'Hyperventilation causes respiratory alkalosis. Slow diaphragmatic breathing is first-line. Paper bags are no longer recommended.'
  },
  {
    id: 'q19',
    question: 'A client in alcohol withdrawal is agitated and confused. Which medication should the nurse anticipate?',
    options: [
      'Haloperidol (Haldol)',
      'Lorazepam (Ativan)',
      'Fluoxetine (Prozac)',
      'Naltrexone (ReVia)'
    ],
    correctAnswer: 1,
    explanation: 'Benzodiazepines like lorazepam are first-line for alcohol withdrawal.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'easy',
    rationale: 'Benzodiazepines prevent seizures in alcohol withdrawal. Monitor CIWA-Ar score. Antipsychotics lower seizure threshold.'
  },
  {
    id: 'q20',
    question: 'A rape victim arrives at the emergency department. What is the priority nursing action?',
    options: [
      'Collect forensic evidence immediately',
      'Contact law enforcement',
      'Provide emotional support and ensure safety',
      'Perform a detailed physical examination'
    ],
    correctAnswer: 2,
    explanation: 'Emotional support and safety are immediate priorities for trauma victims.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'medium',
    rationale: 'Trauma-informed care prioritizes safety, autonomy, and support. The victim controls decisions about evidence collection and police.'
  },

  // Physiological Integrity - Basic Care and Comfort (10 questions)
  {
    id: 'q21',
    question: 'A client is on bed rest. Which action prevents pressure injuries?',
    options: [
      'Massage reddened areas vigorously',
      'Keep the head of bed elevated at 45 degrees',
      'Reposition every 2 hours',
      'Use a donut-shaped cushion under the sacrum'
    ],
    correctAnswer: 2,
    explanation: 'Repositioning every 2 hours reduces pressure and prevents skin breakdown.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Turn every 2 hours, use pressure-relieving devices, keep skin dry. Never massage reddened areas or use donut cushions.'
  },
  {
    id: 'q22',
    question: 'A client with dysphagia is eating. Which position is safest?',
    options: [
      'Supine with head slightly extended',
      'Upright at 90 degrees with chin tucked',
      'Side-lying on the left side',
      'Semi-Fowler\'s at 30 degrees'
    ],
    correctAnswer: 1,
    explanation: 'Upright with chin tuck protects the airway and facilitates swallowing.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'medium',
    rationale: 'Chin tuck narrows airway entrance, reducing aspiration risk. Keep upright 30-60 minutes after eating.'
  },
  {
    id: 'q23',
    question: 'A client has an indwelling urinary catheter. Which action prevents infection?',
    options: [
      'Empty the drainage bag when completely full',
      'Keep the drainage bag below bladder level',
      'Disconnect the catheter to obtain urine sample',
      'Clamp the catheter for bladder retraining'
    ],
    correctAnswer: 1,
    explanation: 'Keeping the bag below bladder prevents backflow and infection.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Maintain closed system, keep bag below bladder, empty when 2/3 full. Never disconnect system.'
  },
  {
    id: 'q24',
    question: 'A client complains of constipation. Which food should the nurse recommend?',
    options: [
      'White bread and pasta',
      'Cheese and milk',
      'Fruits and vegetables',
      'Red meat and eggs'
    ],
    correctAnswer: 2,
    explanation: 'High-fiber foods like fruits and vegetables promote bowel regularity.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Increase fiber (fruits, vegetables, whole grains), fluids, and activity. Cheese, white bread, and meat worsen constipation.'
  },
  {
    id: 'q25',
    question: 'A client has a heating pad on their back. What temperature is safe?',
    options: [
      'High heat for maximum effect',
      'Low to medium heat',
      'Alternating hot and cold',
      'The highest setting tolerated'
    ],
    correctAnswer: 1,
    explanation: 'Low to medium heat prevents burns while providing therapeutic benefit.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Use low-medium heat, limit to 20-30 minutes, check skin frequently. Never use high heat or sleep with heating pad.'
  },

  // Physiological Integrity - Pharmacological and Parenteral Therapies (15 questions)
  {
    id: 'q26',
    question: 'A nurse is preparing to administer digoxin. Which assessment finding requires withholding the medication?',
    options: [
      'Heart rate of 58 beats/min',
      'Blood pressure of 140/90 mmHg',
      'Potassium level of 4.0 mEq/L',
      'Respiratory rate of 18 breaths/min'
    ],
    correctAnswer: 0,
    explanation: 'Digoxin should be withheld if heart rate is below 60 bpm.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'easy',
    rationale: 'Digoxin slows heart rate. Withhold if HR <60 or signs of toxicity (nausea, vision changes). Check apical pulse for 1 full minute.'
  },
  {
    id: 'q27',
    question: 'A client is receiving IV heparin. Which laboratory value should the nurse monitor?',
    options: [
      'INR (International Normalized Ratio)',
      'aPTT (activated Partial Thromboplastin Time)',
      'Platelet count only',
      'Hemoglobin and hematocrit'
    ],
    correctAnswer: 1,
    explanation: 'aPTT monitors the effectiveness of IV heparin therapy.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'easy',
    rationale: 'aPTT monitors heparin. Therapeutic range: 1.5-2.5 times control. INR monitors warfarin. Watch for bleeding.'
  },
  {
    id: 'q28',
    question: 'A client taking warfarin has an INR of 5.0. What should the nurse anticipate?',
    options: [
      'Increase the warfarin dose',
      'Administer vitamin K',
      'No action needed',
      'Switch to heparin immediately'
    ],
    correctAnswer: 1,
    explanation: 'INR of 5.0 is elevated; vitamin K reverses warfarin effects.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Therapeutic INR: 2-3. INR >4 increases bleeding risk. Give vitamin K or hold warfarin per protocol.'
  },
  {
    id: 'q29',
    question: 'Which insulin should the nurse administer for rapid blood glucose reduction?',
    options: [
      'NPH insulin',
      'Insulin glargine (Lantus)',
      'Regular insulin',
      'Insulin lispro (Humalog)'
    ],
    correctAnswer: 3,
    explanation: 'Lispro is rapid-acting insulin with onset of 10-15 minutes.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Rapid-acting (lispro, aspart): onset 10-15 min. Regular: onset 30 min. NPH: intermediate. Lantus: long-acting, no peak.'
  },
  {
    id: 'q30',
    question: 'A client is prescribed prednisone. Which teaching is most important?',
    options: [
      '"Take this medication on an empty stomach."',
      '"Never stop this medication abruptly."',
      '"You can skip doses if you feel better."',
      '"This medication can be taken at bedtime."'
    ],
    correctAnswer: 1,
    explanation: 'Abrupt steroid discontinuation can cause adrenal crisis.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Steroids suppress adrenal function. Must taper gradually. Take with food. Morning dosing mimics natural cortisol rhythm.'
  },
  {
    id: 'q31',
    question: 'A client receiving morphine has a respiratory rate of 8 breaths/min. Which medication should the nurse administer?',
    options: [
      'Flumazenil',
      'Naloxone (Narcan)',
      'Protamine sulfate',
      'Acetylcysteine'
    ],
    correctAnswer: 1,
    explanation: 'Naloxone is the opioid antagonist that reverses respiratory depression.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'easy',
    rationale: 'Naloxone reverses opioids. Flumazenil reverses benzodiazepines. Protamine reverses heparin. Acetylcysteine treats acetaminophen overdose.'
  },
  {
    id: 'q32',
    question: 'Which client statement indicates understanding of levothyroxine (Synthroid) teaching?',
    options: [
      '"I\'ll take this medication at bedtime."',
      '"I should take this on an empty stomach in the morning."',
      '"I can stop taking this when I feel better."',
      '"I\'ll take this with my calcium supplement."'
    ],
    correctAnswer: 1,
    explanation: 'Levothyroxine should be taken on an empty stomach in the morning for best absorption.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'easy',
    rationale: 'Take levothyroxine 30-60 minutes before breakfast. Calcium, iron, and antacids interfere with absorption. Lifelong therapy required.'
  },
  {
    id: 'q33',
    question: 'A client is prescribed metformin for diabetes. Which laboratory value is priority to monitor?',
    options: [
      'Serum glucose',
      'Liver enzymes',
      'Serum creatinine',
      'White blood cell count'
    ],
    correctAnswer: 2,
    explanation: 'Metformin can cause lactic acidosis in clients with renal impairment.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Monitor renal function before and during metformin therapy. Risk of lactic acidosis if creatinine elevated. Hold before contrast dyes.'
  },
  {
    id: 'q34',
    question: 'A client taking phenytoin (Dilantin) should be monitored for which adverse effect?',
    options: [
      'Gingival hyperplasia',
      'Hyperkalemia',
      'Hypoglycemia',
      'Hypertension'
    ],
    correctAnswer: 0,
    explanation: 'Phenytoin commonly causes gingival (gum) overgrowth.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Phenytoin side effects: gingival hyperplasia, hirsutism, ataxia. Monitor therapeutic level (10-20 mcg/mL). Good oral hygiene essential.'
  },
  {
    id: 'q35',
    question: 'Which statement by a client taking lisinopril requires immediate follow-up?',
    options: [
      '"I use salt substitutes to season my food."',
      '"I take this medication in the morning."',
      '"I get up slowly from sitting or lying down."',
      '"I check my blood pressure regularly."'
    ],
    correctAnswer: 0,
    explanation: 'ACE inhibitors like lisinopril increase potassium; salt substitutes contain potassium.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'hard',
    rationale: 'ACE inhibitors cause hyperkalemia. Avoid salt substitutes (KCl). Monitor for dry cough, angioedema. Rise slowly due to orthostatic hypotension.'
  },

  // Physiological Integrity - Reduction of Risk Potential (15 questions)
  {
    id: 'q36',
    question: 'A client is scheduled for an MRI. Which item must be removed before the procedure?',
    options: [
      'Dentures',
      'Pacemaker',
      'Contact lenses',
      'Hearing aids'
    ],
    correctAnswer: 1,
    explanation: 'Pacemakers are a contraindication for MRI due to strong magnetic field.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'easy',
    rationale: 'MRI contraindications: pacemakers, metal implants, cochlear implants, some aneurysm clips. Remove all metal objects.'
  },
  {
    id: 'q37',
    question: 'A client returns from a cardiac catheterization via femoral artery. What is the priority assessment?',
    options: [
      'Pedal pulses in affected extremity',
      'Blood pressure in both arms',
      'Level of consciousness',
      'Urine output'
    ],
    correctAnswer: 0,
    explanation: 'Checking distal pulses ensures adequate circulation after arterial access.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'After cardiac cath: check pulses distal to insertion site, keep leg straight 4-6 hours, watch for bleeding/hematoma. Neurovascular checks.'
  },
  {
    id: 'q38',
    question: 'A client has a chest tube. Which observation requires immediate intervention?',
    options: [
      'Tidaling in the water seal chamber',
      'Drainage of 70 mL in the first hour',
      'Continuous bubbling in the water seal chamber',
      'Client reports pain at insertion site'
    ],
    correctAnswer: 2,
    explanation: 'Continuous bubbling indicates an air leak in the system.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'hard',
    rationale: 'Continuous bubbling = air leak. Check connections first, then notify provider. Tidaling is normal. Watch for sudden cessation (clot).'
  },
  {
    id: 'q39',
    question: 'Which laboratory value requires immediate intervention in a client receiving chemotherapy?',
    options: [
      'WBC 2,000/mm³',
      'Hemoglobin 11 g/dL',
      'Platelets 180,000/mm³',
      'Sodium 138 mEq/L'
    ],
    correctAnswer: 0,
    explanation: 'WBC of 2,000 indicates severe neutropenia with high infection risk.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'Normal WBC: 5,000-10,000. Neutropenia <1,000 requires protective isolation. Monitor temperature, avoid crowds, raw foods.'
  },
  {
    id: 'q40',
    question: 'A client is NPO for surgery. Which medication should the nurse administer with a small sip of water?',
    options: [
      'Vitamin supplements',
      'Antihypertensive medications',
      'Oral hypoglycemic agents',
      'Iron supplements'
    ],
    correctAnswer: 1,
    explanation: 'Blood pressure medications should not be held before surgery.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'Continue antihypertensives, cardiac meds preoperatively. Hold insulin/oral hypoglycemics when NPO. Verify with surgeon/anesthesia.'
  },
  {
    id: 'q41',
    question: 'A client has a positive Chvostek\'s sign. Which electrolyte imbalance is indicated?',
    options: [
      'Hypocalcemia',
      'Hyperkalemia',
      'Hyponatremia',
      'Hypermagnesemia'
    ],
    correctAnswer: 0,
    explanation: 'Chvostek\'s sign (facial twitching) indicates low calcium.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'Hypocalcemia signs: Chvostek\'s (facial twitch), Trousseau\'s (carpopedal spasm), tetany, seizures. Check after thyroidectomy.'
  },
  {
    id: 'q42',
    question: 'A client with cirrhosis has an elevated ammonia level. Which assessment is priority?',
    options: [
      'Abdominal girth',
      'Level of consciousness',
      'Skin integrity',
      'Peripheral edema'
    ],
    correctAnswer: 1,
    explanation: 'Elevated ammonia causes hepatic encephalopathy with altered mental status.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'hard',
    rationale: 'Ammonia crosses blood-brain barrier causing confusion, asterixis, coma. Give lactulose to reduce ammonia. Low-protein diet.'
  },
  {
    id: 'q43',
    question: 'Which finding in a client 24 hours post-thyroidectomy requires immediate action?',
    options: [
      'Temperature of 99.2°F (37.3°C)',
      'Hoarse voice',
      'Neck swelling with dyspnea',
      'Pain at incision site'
    ],
    correctAnswer: 2,
    explanation: 'Neck swelling with dyspnea indicates hemorrhage and airway compromise.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'hard',
    rationale: 'Post-thyroidectomy: watch for hemorrhage (neck swelling, dyspnea), laryngeal nerve damage (hoarseness), hypocalcemia (tetany).'
  },
  {
    id: 'q44',
    question: 'A client with diabetes has a blood glucose of 50 mg/dL. The client is awake but confused. What should the nurse do?',
    options: [
      'Administer glucagon IM',
      'Give 15g of fast-acting carbohydrate',
      'Start an IV of D50W',
      'Recheck glucose in 1 hour'
    ],
    correctAnswer: 1,
    explanation: 'Awake hypoglycemic clients should receive oral fast-acting carbs.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'If conscious: 15g carbs (juice, glucose tabs), recheck in 15 min. If unconscious: glucagon IM or D50W IV. Never force oral fluids.'
  },
  {
    id: 'q45',
    question: 'A client with a new colostomy asks about dietary restrictions. What should the nurse teach?',
    options: [
      '"Avoid all gas-forming foods permanently."',
      '"You can eat a regular diet but may need to avoid some foods."',
      '"You must follow a low-fiber diet forever."',
      '"Only eat bland, soft foods from now on."'
    ],
    correctAnswer: 1,
    explanation: 'Colostomy clients can usually resume regular diet, adjusting as needed.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'easy',
    rationale: 'Most ostomy patients tolerate regular diet. Introduce foods gradually. Avoid foods causing personal issues. Chew well, stay hydrated.'
  },

  // Physiological Integrity - Physiological Adaptation (15 questions)
  {
    id: 'q46',
    question: 'A client in labor has a prolapsed umbilical cord. What is the nurse\'s priority action?',
    options: [
      'Call the healthcare provider',
      'Elevate the presenting part off the cord',
      'Place the client in Trendelenburg position',
      'Administer oxygen via face mask'
    ],
    correctAnswer: 1,
    explanation: 'Immediately relieve cord compression to restore fetal blood flow.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'hard',
    rationale: 'Cord prolapse is an emergency. Use gloved hand to push presenting part up. Then position (knee-chest, Trendelenburg), oxygen, call provider.'
  },
  {
    id: 'q47',
    question: 'A client with heart failure has gained 3 pounds in 2 days. What should the nurse do first?',
    options: [
      'Restrict fluid intake',
      'Assess for peripheral edema',
      'Notify the healthcare provider',
      'Obtain a chest X-ray'
    ],
    correctAnswer: 2,
    explanation: 'Rapid weight gain indicates fluid retention requiring immediate provider notification.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Weight gain >2-3 lbs in 2 days = fluid overload. Provider may adjust diuretics. Also assess edema, lung sounds, dyspnea.'
  },
  {
    id: 'q48',
    question: 'A client is admitted with diabetic ketoacidosis (DKA). Which finding is expected?',
    options: [
      'Blood glucose 500 mg/dL and fruity breath odor',
      'Blood glucose 50 mg/dL and diaphoresis',
      'Blood glucose 200 mg/dL and hypertension',
      'Blood glucose 300 mg/dL and bradycardia'
    ],
    correctAnswer: 0,
    explanation: 'DKA presents with severe hyperglycemia and ketone breath (fruity odor).',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'DKA: glucose >250, ketones, acidosis, dehydration, Kussmaul respirations, fruity breath. Give IV fluids then insulin.'
  },
  {
    id: 'q49',
    question: 'A client with chronic kidney disease has a potassium level of 6.8 mEq/L. Which assessment finding is priority?',
    options: [
      'Muscle weakness',
      'Cardiac rhythm changes',
      'Decreased urine output',
      'Nausea and vomiting'
    ],
    correctAnswer: 1,
    explanation: 'Hyperkalemia causes life-threatening cardiac arrhythmias.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'hard',
    rationale: 'Normal K: 3.5-5.0. Hyperkalemia >6.0 causes peaked T waves, widened QRS, cardiac arrest. Give calcium gluconate, insulin/glucose, kayexalate.'
  },
  {
    id: 'q50',
    question: 'A client is experiencing anaphylaxis. Which medication should the nurse administer first?',
    options: [
      'Diphenhydramine (Benadryl)',
      'Epinephrine 1:1000 IM',
      'Methylprednisolone (Solu-Medrol)',
      'Albuterol nebulizer'
    ],
    correctAnswer: 1,
    explanation: 'Epinephrine is the first-line treatment for anaphylaxis.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'easy',
    rationale: 'Anaphylaxis: epinephrine IM immediately (outer thigh), then antihistamines, steroids, bronchodilators. Monitor airway, BP.'
  },
  {
    id: 'q51',
    question: 'A client with COPD has oxygen saturation of 88% on room air. What is the appropriate oxygen flow rate?',
    options: [
      'High-flow oxygen at 10 L/min',
      'Non-rebreather mask at 15 L/min',
      'Low-flow oxygen at 1-2 L/min',
      'Venturi mask at 50%'
    ],
    correctAnswer: 2,
    explanation: 'COPD clients need low-flow oxygen to maintain hypoxic drive.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'COPD clients depend on hypoxic drive. High O2 suppresses respirations. Keep SpO2 88-92%. Use 1-3 L/min nasal cannula.'
  },
  {
    id: 'q52',
    question: 'A client with a head injury has clear drainage from the nose. What should the nurse do?',
    options: [
      'Pack the nose with gauze',
      'Have the client blow their nose',
      'Test drainage for glucose',
      'Suction the nasal passages'
    ],
    correctAnswer: 2,
    explanation: 'Clear nasal drainage after head injury may be CSF; test for glucose.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'CSF contains glucose (unlike mucus). Halo sign on gauze. Keep HOB elevated, don\'t pack nose. Notify provider - risk of meningitis.'
  },
  {
    id: 'q53',
    question: 'A client is receiving a blood transfusion and develops fever and chills. What should the nurse do first?',
    options: [
      'Slow the transfusion rate',
      'Stop the transfusion immediately',
      'Administer antipyretics',
      'Take vital signs'
    ],
    correctAnswer: 1,
    explanation: 'Stop transfusion immediately if reaction is suspected.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Transfusion reaction: stop immediately, keep IV open with NS, notify provider/blood bank, monitor vitals, save blood bag.'
  },
  {
    id: 'q54',
    question: 'A client with acute pancreatitis is NPO. Which action is priority?',
    options: [
      'Insert nasogastric tube for decompression',
      'Administer IV fluids',
      'Give pancreatic enzymes',
      'Provide high-calorie diet'
    ],
    correctAnswer: 1,
    explanation: 'Aggressive IV fluid resuscitation is essential in acute pancreatitis.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Acute pancreatitis: NPO, IV fluids (dehydration), pain control, monitor amylase/lipase. NG tube if vomiting. No oral until pain resolves.'
  },
  {
    id: 'q55',
    question: 'A client is admitted with suspected meningitis. What is the priority nursing action?',
    options: [
      'Obtain blood cultures',
      'Administer antibiotics immediately',
      'Perform lumbar puncture',
      'Implement droplet precautions'
    ],
    correctAnswer: 3,
    explanation: 'Droplet precautions prevent transmission while diagnosis is confirmed.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'hard',
    rationale: 'Meningitis: droplet precautions immediately. Then blood cultures, LP, antibiotics (don\'t delay for LP). Watch for increased ICP.'
  },
  {
    id: 'q56',
    question: 'A client post-stroke has left-sided weakness. Where should the nurse position the call light?',
    options: [
      'On the left side',
      'On the right side',
      'On either side',
      'Above the bed'
    ],
    correctAnswer: 1,
    explanation: 'Place items on the unaffected (strong) side for easy access.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'easy',
    rationale: 'Position items on unaffected side. Approach from unaffected side. Turn to both sides. Watch for neglect of affected side.'
  },
  {
    id: 'q57',
    question: 'A client with emphysema has a barrel chest and uses accessory muscles to breathe. Which position is most helpful?',
    options: [
      'Supine with legs elevated',
      'High Fowler\'s leaning forward on overbed table',
      'Left lateral position',
      'Trendelenburg position'
    ],
    correctAnswer: 1,
    explanation: 'High Fowler\'s with forward lean maximizes lung expansion.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'easy',
    rationale: 'Orthopneic (tripod) position: sitting up, leaning forward on table. Allows diaphragm to descend, uses accessory muscles effectively.'
  },
  {
    id: 'q58',
    question: 'A client with burns covering 40% of body surface area is in the emergent phase. What is the priority?',
    options: [
      'Pain management',
      'Fluid resuscitation',
      'Wound debridement',
      'Nutritional support'
    ],
    correctAnswer: 1,
    explanation: 'Fluid resuscitation prevents hypovolemic shock in the first 24-48 hours.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'hard',
    rationale: 'Emergent phase (0-48hrs): massive fluid shift causes shock. Use Parkland formula for fluid resuscitation. Monitor urine output 30-50mL/hr.'
  },
  {
    id: 'q59',
    question: 'A client has a serum calcium level of 7.0 mg/dL. Which sign should the nurse assess for?',
    options: [
      'Flaccid muscles',
      'Tetany and muscle spasms',
      'Decreased reflexes',
      'Constipation'
    ],
    correctAnswer: 1,
    explanation: 'Hypocalcemia causes neuromuscular irritability with tetany.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Normal calcium: 8.5-10.5. Low calcium: tetany, Chvostek\'s, Trousseau\'s, seizures. Give IV calcium slowly. Monitor ECG.'
  },
  {
    id: 'q60',
    question: 'A client is in hypovolemic shock. Which finding is an early sign?',
    options: [
      'Bradycardia',
      'Increased urine output',
      'Tachycardia and restlessness',
      'Warm, dry skin'
    ],
    correctAnswer: 2,
    explanation: 'Early shock: compensatory tachycardia and anxiety/restlessness.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Early shock: tachycardia, tachypnea, anxiety, cool skin, decreased urine. Late shock: hypotension, bradycardia, unresponsiveness.'
  },

  // Additional questions to reach 85 total (25 more needed)
  {
    id: 'q61',
    question: 'A nurse is teaching a client about breast self-examination. When should this be performed?',
    options: [
      'The same day each month',
      '7-10 days after menstruation starts',
      'During menstruation',
      'Only if a lump is felt'
    ],
    correctAnswer: 1,
    explanation: 'BSE should be done 7-10 days after menses when breasts are least tender.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'easy',
    rationale: 'Breasts are least lumpy after menses. Post-menopausal women should pick same day monthly. Men can also get breast cancer.'
  },
  {
    id: 'q62',
    question: 'A client with neutropenia is on protective isolation. Which food should be avoided?',
    options: [
      'Cooked chicken',
      'Fresh fruit salad',
      'Canned vegetables',
      'Well-done steak'
    ],
    correctAnswer: 1,
    explanation: 'Fresh raw fruits harbor bacteria; avoid during neutropenia.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'medium',
    rationale: 'Neutropenic diet: no raw fruits/vegetables, deli meats, buffets. Cook all foods thoroughly. Avoid crowds, fresh flowers.'
  },
  {
    id: 'q63',
    question: 'A client taking lithium has a level of 1.8 mEq/L. Which symptom indicates toxicity?',
    options: [
      'Mild hand tremor',
      'Increased thirst',
      'Coarse tremors and confusion',
      'Weight gain'
    ],
    correctAnswer: 2,
    explanation: 'Lithium >1.5 causes toxicity: coarse tremors, confusion, ataxia.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'hard',
    rationale: 'Therapeutic lithium: 0.8-1.2. Mild toxicity >1.5: tremors, nausea. Severe >2.0: seizures, coma. Maintain hydration, monitor levels.'
  },
  {
    id: 'q64',
    question: 'Which client is at highest risk for developing pressure injuries?',
    options: [
      'A 45-year-old with diabetes, ambulating regularly',
      'An 80-year-old immobile client with incontinence',
      'A 30-year-old post-op, turning every 2 hours',
      'A 60-year-old with adequate nutrition'
    ],
    correctAnswer: 1,
    explanation: 'Age, immobility, and moisture significantly increase pressure injury risk.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'medium',
    rationale: 'Risk factors: immobility, age, moisture, poor nutrition, decreased sensation. Use Braden Scale. Prevention: turn, support surfaces, skin care.'
  },
  {
    id: 'q65',
    question: 'A pregnant client at 32 weeks reports decreased fetal movement. What should the nurse advise?',
    options: [
      '"This is normal; the baby is getting bigger."',
      '"Come to the hospital immediately for evaluation."',
      '"Count movements tomorrow and call if still decreased."',
      '"Drink cold juice and count movements for 2 hours."'
    ],
    correctAnswer: 1,
    explanation: 'Decreased fetal movement requires immediate evaluation.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'hard',
    rationale: 'Decreased movement may indicate fetal distress. Never assume normal. Immediate NST and ultrasound needed. Movement should NOT decrease.'
  },
  {
    id: 'q66',
    question: 'A client with bipolar disorder is prescribed carbamazepine. Which lab should be monitored?',
    options: [
      'Blood glucose',
      'Complete blood count',
      'Thyroid function',
      'Lipid panel'
    ],
    correctAnswer: 1,
    explanation: 'Carbamazepine can cause blood dyscrasias; monitor CBC.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Carbamazepine: monitor CBC (aplastic anemia, agranulocytosis), liver enzymes. Report sore throat, fever, bruising. Therapeutic level: 4-12.'
  },
  {
    id: 'q67',
    question: 'A client has orders for sequential compression devices (SCDs). What is the purpose?',
    options: [
      'Prevent pressure injuries',
      'Prevent deep vein thrombosis',
      'Reduce peripheral edema',
      'Improve arterial circulation'
    ],
    correctAnswer: 1,
    explanation: 'SCDs prevent DVT by promoting venous return.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'easy',
    rationale: 'SCDs prevent DVT in immobile clients. Remove for ambulation. Also use anticoagulants if high risk. Check skin integrity.'
  },
  {
    id: 'q68',
    question: 'A client is prescribed albuterol inhaler. What should the nurse teach?',
    options: [
      '"Use this inhaler daily to prevent asthma."',
      '"Use this for quick relief of wheezing."',
      '"This medication works slowly over hours."',
      '"Take this only at bedtime."'
    ],
    correctAnswer: 1,
    explanation: 'Albuterol is a rescue inhaler for acute bronchospasm.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'easy',
    rationale: 'Albuterol: short-acting beta-agonist, rescue inhaler, works in minutes. Long-acting (Salmeterol) is for prevention, never rescue.'
  },
  {
    id: 'q69',
    question: 'A client with glaucoma should avoid which medication?',
    options: [
      'Antibiotics',
      'Anticholinergics',
      'Antihypertensives',
      'Analgesics'
    ],
    correctAnswer: 1,
    explanation: 'Anticholinergics increase intraocular pressure, worsening glaucoma.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Anticholinergics (atropine, Benadryl) dilate pupils and increase IOP. Also avoid decongestants. Use miotics for glaucoma.'
  },
  {
    id: 'q70',
    question: 'A client with myasthenia gravis is experiencing a cholinergic crisis. What is the priority?',
    options: [
      'Administer more anticholinesterase medication',
      'Support respiratory function',
      'Check blood pressure',
      'Increase oral fluid intake'
    ],
    correctAnswer: 1,
    explanation: 'Respiratory failure is the immediate threat in cholinergic crisis.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'hard',
    rationale: 'Cholinergic crisis: too much anticholinesterase. Causes weakness, salivation, bradycardia, respiratory failure. Give atropine, support airway.'
  },
  {
    id: 'q71',
    question: 'Which behavior in a 2-year-old indicates a need for further evaluation?',
    options: [
      'Plays alongside but not with other children',
      'Has frequent temper tantrums',
      'Says 2-3 word phrases',
      'Has no interest in toys or people'
    ],
    correctAnswer: 3,
    explanation: 'Lack of interest in toys and people is concerning for developmental delay.',
    category: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    difficulty: 'medium',
    rationale: 'By age 2: parallel play normal, tantrums expected, 2-word phrases emerging. Red flags: no social interest, no babbling, no eye contact.'
  },
  {
    id: 'q72',
    question: 'A client on chemotherapy has stomatitis. Which food should be avoided?',
    options: [
      'Scrambled eggs',
      'Orange juice',
      'Mashed potatoes',
      'Ice cream'
    ],
    correctAnswer: 1,
    explanation: 'Acidic foods like orange juice irritate oral mucosa.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Stomatitis: avoid acidic, spicy, rough foods. Use soft, bland, cool foods. Rinse with saline, use soft toothbrush, avoid alcohol mouthwash.'
  },
  {
    id: 'q73',
    question: 'A client is receiving total parenteral nutrition (TPN). Which complication is priority to monitor?',
    options: [
      'Hyperglycemia',
      'Constipation',
      'Dehydration',
      'Hypotension'
    ],
    correctAnswer: 0,
    explanation: 'TPN contains high glucose; monitor blood glucose closely.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'TPN complications: hyperglycemia, infection (central line), fluid overload. Check glucose q6h, change tubing per protocol, strict aseptic technique.'
  },
  {
    id: 'q74',
    question: 'A client has a sodium level of 125 mEq/L. Which symptom is expected?',
    options: [
      'Dry mucous membranes',
      'Confusion and lethargy',
      'Hyperactive reflexes',
      'Constipation'
    ],
    correctAnswer: 1,
    explanation: 'Hyponatremia causes CNS depression: confusion, lethargy.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Normal Na: 135-145. <120: seizures, coma. Causes: SIADH, diuretics, water intoxication. Restrict fluids if dilutional.'
  },
  {
    id: 'q75',
    question: 'Which client requires airborne precautions?',
    options: [
      'A client with influenza',
      'A client with measles',
      'A client with MRSA wound infection',
      'A client with C. difficile'
    ],
    correctAnswer: 1,
    explanation: 'Measles requires airborne precautions with negative pressure room.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    difficulty: 'medium',
    rationale: 'Airborne precautions: TB, measles, chickenpox (varicella). N95 mask, negative pressure room. Droplet: influenza, pertussis, meningitis.'
  },
  {
    id: 'q76',
    question: 'A client is prescribed an MAO inhibitor. Which food must be avoided?',
    options: [
      'Fresh vegetables',
      'Whole grain bread',
      'Aged cheese',
      'Baked chicken'
    ],
    correctAnswer: 2,
    explanation: 'Tyramine in aged cheese can cause hypertensive crisis with MAOIs.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'hard',
    rationale: 'MAOIs: avoid tyramine (aged cheese, wine, cured meats, soy sauce). Can cause hypertensive crisis. Monitor BP. Many drug interactions.'
  },
  {
    id: 'q77',
    question: 'A client has an advance directive requesting no CPR. The client goes into cardiac arrest. What should the nurse do?',
    options: [
      'Begin CPR immediately',
      'Call the family to decide',
      'Do not initiate CPR',
      'Ask the provider for orders'
    ],
    correctAnswer: 2,
    explanation: 'Honor the advance directive; do not perform CPR.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'medium',
    rationale: 'Advance directives are legally binding. Honor DNR/DNI orders. Provide comfort care. Document. Family cannot override client wishes.'
  },
  {
    id: 'q78',
    question: 'A client with PTSD has nightmares and flashbacks. What is the best intervention?',
    options: [
      'Avoid discussing traumatic events',
      'Teach grounding techniques',
      'Encourage suppression of memories',
      'Isolate client from triggers'
    ],
    correctAnswer: 1,
    explanation: 'Grounding techniques help client stay present during flashbacks.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'medium',
    rationale: 'PTSD interventions: grounding (5 senses), deep breathing, cognitive-behavioral therapy, EMDR. Create safe environment. Medication may help.'
  },
  {
    id: 'q79',
    question: 'A client post-mastectomy refuses to look at the incision. What is the priority?',
    options: [
      'Force the client to look at the wound',
      'Acknowledge feelings and provide support',
      'Tell the client this is abnormal behavior',
      'Cover the area so client doesn\'t see it'
    ],
    correctAnswer: 1,
    explanation: 'Acknowledge feelings and provide emotional support during adjustment.',
    category: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    difficulty: 'medium',
    rationale: 'Body image disturbance is normal post-mastectomy. Don\'t force. Provide support, resources (Reach to Recovery), time to grieve.'
  },
  {
    id: 'q80',
    question: 'A client is receiving a blood transfusion. Which vital sign change requires stopping the transfusion?',
    options: [
      'Temperature increase from 98.6°F to 99.0°F',
      'Blood pressure decrease from 130/80 to 120/75',
      'Temperature increase from 98.6°F to 101.0°F',
      'Heart rate increase from 80 to 85'
    ],
    correctAnswer: 2,
    explanation: 'Temperature increase >1°C (2°F) indicates transfusion reaction.',
    category: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    difficulty: 'medium',
    rationale: 'Stop transfusion if: fever >1°C, chills, dyspnea, rash, back pain. Keep IV open with NS. Notify provider and blood bank immediately.'
  },
  {
    id: 'q81',
    question: 'Which lab value is most concerning for a client taking furosemide (Lasix)?',
    options: [
      'Potassium 2.8 mEq/L',
      'Sodium 140 mEq/L',
      'Calcium 9.0 mg/dL',
      'Chloride 100 mEq/L'
    ],
    correctAnswer: 0,
    explanation: 'Loop diuretics cause hypokalemia; K+ <3.0 is dangerous.',
    category: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    difficulty: 'medium',
    rationale: 'Furosemide: watch for hypokalemia, hyponatremia, dehydration. Supplement K+, monitor daily weights. Take in morning to avoid nocturia.'
  },
  {
    id: 'q82',
    question: 'A client with cirrhosis has ascites. Which dietary modification is most important?',
    options: [
      'High protein diet',
      'Low sodium diet',
      'High fat diet',
      'Low carbohydrate diet'
    ],
    correctAnswer: 1,
    explanation: 'Low sodium reduces fluid retention and ascites.',
    category: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    difficulty: 'easy',
    rationale: 'Cirrhosis with ascites: restrict sodium (2g/day), may need fluid restriction. Moderate protein unless hepatic encephalopathy. Monitor weight.'
  },
  {
    id: 'q83',
    question: 'A client receives epidural anesthesia. What is the priority postpartum assessment?',
    options: [
      'Return of motor and sensory function',
      'Fundal height',
      'Lochia amount',
      'Breastfeeding ability'
    ],
    correctAnswer: 0,
    explanation: 'Assess for return of sensation and movement to prevent falls.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'Post-epidural: assess legs for strength before ambulation, monitor for urinary retention, check for spinal headache. Also assess fundus, lochia.'
  },
  {
    id: 'q84',
    question: 'A client with Parkinson\'s disease has difficulty swallowing. What is the safest intervention?',
    options: [
      'Provide thin liquids',
      'Tilt head back when swallowing',
      'Thicken liquids and provide small bites',
      'Give medications in liquid form'
    ],
    correctAnswer: 2,
    explanation: 'Thickened liquids and small bites reduce aspiration risk.',
    category: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    difficulty: 'medium',
    rationale: 'Dysphagia: thicken liquids, small bites, upright position, chin tuck. Speech therapy evaluation. Watch for aspiration pneumonia.'
  },
  {
    id: 'q85',
    question: 'A client taking warfarin is going to have a tooth extracted. What should the nurse advise?',
    options: [
      'Stop warfarin 1 week before procedure',
      'Continue warfarin without changes',
      'Notify the dentist and prescriber to coordinate care',
      'Double the warfarin dose after the procedure'
    ],
    correctAnswer: 2,
    explanation: 'Healthcare providers must coordinate anticoagulation management for procedures.',
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    difficulty: 'medium',
    rationale: 'Never stop anticoagulants without provider approval. Dentist and prescriber coordinate - may hold, bridge with heparin, or continue. Risk vs benefit.'
  }
];

// Get random selection of questions ensuring all categories represented
export function getSimulatorQuestions(): Question[] {
  return nclexQuestionBank; // Returns all 85 questions
}

// Category distribution check
export function getCategoryDistribution() {
  const distribution: Record<string, number> = {};
  nclexQuestionBank.forEach(q => {
    distribution[q.subcategory] = (distribution[q.subcategory] || 0) + 1;
  });
  return distribution;
}
