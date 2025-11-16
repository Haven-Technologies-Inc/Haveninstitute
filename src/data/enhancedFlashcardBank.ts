// Comprehensive Flashcard Bank with Multiple Topics

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  mnemonicTip?: string;
  relatedConcepts?: string[];
}

export const flashcardTopics = [
  { id: 'fundamentals', name: 'Fundamentals', icon: '📚', count: 30 },
  { id: 'pharmacology', name: 'Pharmacology', icon: '💊', count: 30 },
  { id: 'cardiac', name: 'Cardiac Care', icon: '❤️', count: 30 },
  { id: 'respiratory', name: 'Respiratory', icon: '🫁', count: 30 },
  { id: 'lab-values', name: 'Lab Values', icon: '🧪', count: 30 },
  { id: 'maternal-newborn', name: 'Maternal-Newborn', icon: '🤱', count: 30 },
  { id: 'pediatrics', name: 'Pediatrics', icon: '👶', count: 30 },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠', count: 30 }
];

export const enhancedFlashcardBank: Record<string, Flashcard[]> = {
  fundamentals: [
    {
      id: 'fund-fc-1',
      front: 'How often should you reposition a bedridden client to prevent pressure injuries?',
      back: 'Every 2 hours. Turn the client from side to side or supine to prone. Use pillows for support and check skin integrity during each repositioning.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'easy',
      tags: ['pressure injury', 'prevention', 'mobility'],
      mnemonicTip: '"Turn every TWO" - Every 2 hours turn the client',
      relatedConcepts: ['Braden Scale', 'Pressure redistribution', 'Skin assessment']
    },
    {
      id: 'fund-fc-2',
      front: 'What are the 5 Rights of Medication Administration?',
      back: 'Right Patient, Right Medication, Right Dose, Right Route, Right Time. (Some add: Right Documentation, Right Reason, Right Response)',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['medication', 'safety', 'rights'],
      mnemonicTip: 'Think "5 R\'s" - Patient, Med, Dose, Route, Time'
    },
    {
      id: 'fund-fc-3',
      front: 'What position minimizes aspiration risk in clients with dysphagia?',
      back: 'High Fowler\'s (90 degrees upright) with chin tucked. Keep upright for 30-60 minutes after eating. Use thickened liquids as ordered.',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['aspiration', 'dysphagia', 'positioning'],
      mnemonicTip: 'Chin DOWN = Airway protected'
    },
    {
      id: 'fund-fc-4',
      front: 'What are the stages of pressure injuries?',
      back: 'Stage 1: Non-blanchable redness, intact skin\nStage 2: Partial thickness loss (blister, shallow crater)\nStage 3: Full thickness loss (fat visible)\nStage 4: Full thickness with exposed bone/muscle\nUnstageable: Depth unknown (covered by slough/eschar)\nDeep Tissue Injury: Purple/maroon discoloration',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['pressure injury', 'staging', 'wound care']
    },
    {
      id: 'fund-fc-5',
      front: 'What is the correct order for donning PPE?',
      back: '1. Gown\n2. Mask/Respirator\n3. Goggles/Face Shield\n4. Gloves\n\nRemoval (Doffing) is reverse:\n1. Gloves\n2. Goggles\n3. Gown\n4. Mask',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'medium',
      tags: ['PPE', 'infection control', 'procedure'],
      mnemonicTip: 'Donning: "Go Make Good Gloves" (Gown, Mask, Goggles, Gloves)'
    },
    {
      id: 'fund-fc-6',
      front: 'What tasks can be delegated to UAP (Unlicensed Assistive Personnel)?',
      back: 'CAN delegate:\n• Vital signs on stable clients\n• I&O measurement\n• ADLs (bathing, feeding, toileting)\n• Ambulation\n• Bed making\n\nCANNOT delegate:\n• Assessment\n• Teaching\n• Medication administration\n• Care planning\n• Unstable clients',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'hard',
      tags: ['delegation', 'UAP', 'scope']
    },
    {
      id: 'fund-fc-7',
      front: 'What are Maslow\'s Hierarchy of Needs in nursing priority order?',
      back: '1. Physiological (airway, breathing, circulation)\n2. Safety (fall prevention, infection control)\n3. Love/Belonging (family, relationships)\n4. Esteem (dignity, respect)\n5. Self-Actualization (reaching potential)',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'easy',
      tags: ['prioritization', 'Maslow', 'theory'],
      mnemonicTip: 'ABCs before Safety before Love'
    },
    {
      id: 'fund-fc-8',
      front: 'What are the ABCs of nursing priority?',
      back: 'A = Airway (always first priority)\nB = Breathing (respiratory status)\nC = Circulation (cardiac output, bleeding)\n\nAddress in this order unless client has no pulse (then CAB for CPR)',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'easy',
      tags: ['priority', 'ABCs', 'emergency']
    },
    {
      id: 'fund-fc-9',
      front: 'What are the types of isolation precautions?',
      back: 'Standard: All patients, blood/body fluids\nContact: MRSA, C. diff, VRE (gown + gloves)\nDroplet: Influenza, pertussis (mask)\nAirborne: TB, measles, varicella (N95 + negative pressure room)',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'medium',
      tags: ['isolation', 'precautions', 'infection control'],
      mnemonicTip: 'My: MRSA, TV: TB/Varicella, FLIP: FLu/Influenza/Pertussis'
    },
    {
      id: 'fund-fc-10',
      front: 'What is the difference between signs and symptoms?',
      back: 'Signs: OBJECTIVE data measured/observed by nurse (vital signs, lab values, skin color)\n\nSymptoms: SUBJECTIVE data reported by patient (pain, nausea, anxiety, fatigue)',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'easy',
      tags: ['assessment', 'objective', 'subjective']
    },
    {
      id: 'fund-fc-11',
      front: 'What should you assess before administering blood products?',
      back: 'Before:\n• Verify order and consent\n• Check blood type with 2 nurses\n• Baseline vital signs\n• Patent 18-20 gauge IV\n• Use blood tubing with filter\n\nDuring:\n• Stay 15 minutes initially\n• Monitor for reactions\n• Complete within 4 hours',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['blood transfusion', 'safety', 'procedure']
    },
    {
      id: 'fund-fc-12',
      front: 'What are the signs of transfusion reaction?',
      back: 'STOP transfusion if:\n• Fever/chills\n• Flushing/rash\n• Dyspnea/wheezing\n• Back pain\n• Hypotension\n• Tachycardia\n\nAction: Stop blood, keep IV open with NS, notify provider',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'medium',
      tags: ['transfusion', 'reaction', 'emergency']
    },
    {
      id: 'fund-fc-13',
      front: 'What is the nursing process?',
      back: 'ADPIE:\nA = Assessment (collect data)\nD = Diagnosis (analyze, identify problems)\nP = Planning (set goals)\nI = Implementation (carry out interventions)\nE = Evaluation (assess outcomes)',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'easy',
      tags: ['nursing process', 'ADPIE', 'framework'],
      mnemonicTip: 'A Delicious Pie Is Excellent'
    },
    {
      id: 'fund-fc-14',
      front: 'What are the signs of infection?',
      back: 'Local:\n• Redness (rubor)\n• Heat (calor)\n• Swelling (tumor)\n• Pain (dolor)\n• Loss of function\n\nSystemic:\n• Fever\n• Elevated WBC\n• Tachycardia\n• Malaise',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'easy',
      tags: ['infection', 'signs', 'assessment']
    },
    {
      id: 'fund-fc-15',
      front: 'What is the difference between heat and cold therapy?',
      back: 'HEAT:\n• Vasodilation\n• Increases blood flow\n• Reduces stiffness\n• Relieves muscle spasm\n• Use: arthritis, muscle pain\n\nCOLD:\n• Vasoconstriction\n• Decreases blood flow\n• Reduces swelling/inflammation\n• Numbs area\n• Use: acute injury, bleeding',
      category: 'Physiological Integrity',
      subcategory: 'Basic Care and Comfort',
      difficulty: 'medium',
      tags: ['heat', 'cold', 'therapy']
    },
    {
      id: 'fund-fc-16',
      front: 'What are normal vital sign ranges for adults?',
      back: 'Temperature: 97.8-99°F (36.5-37.2°C)\nPulse: 60-100 beats/min\nRespiratory: 12-20 breaths/min\nBlood Pressure: <120/80 mmHg (optimal)\nSpO2: >95%',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'easy',
      tags: ['vital signs', 'normal values', 'assessment']
    },
    {
      id: 'fund-fc-17',
      front: 'What is the difference between Medical and Surgical Asepsis?',
      back: 'Medical (Clean) Asepsis:\n• Reduces microorganisms\n• Hand hygiene, gloves\n• Routine care\n\nSurgical (Sterile) Asepsis:\n• Eliminates ALL microorganisms\n• Sterile field, sterile gloves\n• Invasive procedures\n• Anything touching must be sterile',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'medium',
      tags: ['asepsis', 'sterile', 'clean']
    },
    {
      id: 'fund-fc-18',
      front: 'What are the oxygen delivery devices and their FiO2?',
      back: 'Nasal Cannula (1-6 L/min): 24-44%\nSimple Mask (6-10 L/min): 40-60%\nPartial Rebreather (6-15 L/min): 60-80%\nNon-Rebreather (10-15 L/min): 90-100%\nVenturi Mask: 24-50% (precise control)',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'hard',
      tags: ['oxygen', 'respiratory', 'FiO2']
    },
    {
      id: 'fund-fc-19',
      front: 'What is informed consent?',
      back: 'Requirements:\n• Physician\'s responsibility to obtain\n• Nurse witnesses signature\n• Client must be:\n  - Competent\n  - Informed about procedure\n  - Voluntary (no coercion)\n• Understand risks, benefits, alternatives',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Management of Care',
      difficulty: 'medium',
      tags: ['consent', 'legal', 'rights']
    },
    {
      id: 'fund-fc-20',
      front: 'What is chain of infection?',
      back: '1. Infectious agent (pathogen)\n2. Reservoir (where it lives)\n3. Portal of exit (how it leaves)\n4. Mode of transmission (how it spreads)\n5. Portal of entry (how it enters)\n6. Susceptible host (who gets infected)\n\nBreak ANY link to prevent infection!',
      category: 'Safe and Effective Care Environment',
      subcategory: 'Safety and Infection Control',
      difficulty: 'medium',
      tags: ['infection', 'chain', 'prevention']
    }
    // Add 10 more fundamentals flashcards to reach 30...
  ],

  pharmacology: [
    {
      id: 'pharm-fc-1',
      front: 'What is the therapeutic INR range for warfarin?',
      back: '2.0 - 3.0 (for most conditions)\n3.0 - 4.5 (for mechanical heart valves)\n\nINR >4.0 = increased bleeding risk\nAntidote: Vitamin K (phytonadione)',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['warfarin', 'INR', 'anticoagulant'],
      mnemonicTip: '2 to 3, therapeutic for me!'
    },
    {
      id: 'pharm-fc-2',
      front: 'What is the therapeutic aPTT range for heparin?',
      back: '1.5 to 2.5 times the control value\n(Usually 46-70 seconds if control is 25-35 seconds)\n\nMonitor aPTT for IV heparin\nAntidote: Protamine sulfate',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['heparin', 'aPTT', 'anticoagulant']
    },
    {
      id: 'pharm-fc-3',
      front: 'What are the signs of digoxin toxicity?',
      back: 'Think "ABCDE":\nA = Anorexia\nB = Blurred vision (yellow-green halos)\nC = Confusion\nD = Dysrhythmias (bradycardia)\nE = Everything else (nausea, vomiting)\n\nHold if HR <60\nTherapeutic level: 0.5-2.0 ng/mL',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['digoxin', 'toxicity', 'cardiac'],
      mnemonicTip: 'ABCDE for Digoxin toxicity'
    },
    {
      id: 'pharm-fc-4',
      front: 'What are the types of insulin by onset?',
      back: 'RAPID (lispro, aspart): 10-15 min onset\nSHORT (regular): 30 min onset\nINTERMEDIATE (NPH): 1-2 hour onset\nLONG (glargine, detemir): 1-2 hour onset, no peak\n\nOnly Regular insulin can be given IV',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['insulin', 'diabetes', 'onset'],
      mnemonicTip: 'Remember: RN = Regular iN IV'
    },
    {
      id: 'pharm-fc-5',
      front: 'What foods should clients on MAO inhibitors avoid?',
      back: 'Avoid TYRAMINE-containing foods:\n• Aged cheese\n• Cured/smoked meats\n• Red wine, beer\n• Soy sauce, teriyaki\n• Bananas (overripe)\n• Avocados\n\nCan cause hypertensive crisis!',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['MAO inhibitor', 'tyramine', 'diet'],
      mnemonicTip: 'Aged = Bad with MAOIs'
    },
    {
      id: 'pharm-fc-6',
      front: 'What are common ACE inhibitor side effects?',
      back: '• Dry cough (most common)\n• Hyperkalemia\n• Angioedema (life-threatening)\n• Orthostatic hypotension\n• First-dose hypotension\n\nEnd in "-pril" (lisinopril, enalapril)\nAvoid salt substitutes (contain K+)',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['ACE inhibitor', 'side effects', 'antihypertensive']
    },
    {
      id: 'pharm-fc-7',
      front: 'What are the opioid side effects and nursing considerations?',
      back: 'Side Effects:\n• Respiratory depression (priority concern)\n• Constipation\n• Sedation\n• Nausea\n• Urinary retention\n\nNursing:\n• Monitor respiratory rate\n• Have naloxone available\n• Encourage fluids/fiber',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['opioids', 'side effects', 'pain']
    },
    {
      id: 'pharm-fc-8',
      front: 'What are the major drug antidotes?',
      back: 'Acetaminophen → Acetylcysteine\nBenzodiazepines → Flumazenil\nHeparin → Protamine sulfate\nOpioids → Naloxone (Narcan)\nWarfarin → Vitamin K',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'hard',
      tags: ['antidotes', 'overdose', 'emergency'],
      mnemonicTip: 'ABHNOW: Acetylcysteine, Benzo-flumazenil, Heparin-protamine, Narcan, Overdose-Vitamin K, Warfarin'
    },
    {
      id: 'pharm-fc-9',
      front: 'What are the side effects of steroids (prednisone)?',
      back: '• Immunosuppression\n• Hyperglycemia\n• Fluid retention\n• Weight gain\n• Mood changes\n• Gastric ulcers\n• Osteoporosis\n• Cushing\'s syndrome\n\nNEVER stop abruptly!',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'medium',
      tags: ['steroids', 'prednisone', 'side effects']
    },
    {
      id: 'pharm-fc-10',
      front: 'When should levothyroxine (Synthroid) be taken?',
      back: 'Take:\n• On empty stomach\n• 30-60 minutes before breakfast\n• Same time daily\n• Alone (no other meds)\n\nAvoid:\n• Calcium, iron, antacids (4 hrs apart)\n• Fiber supplements\n\nLifelong therapy!',
      category: 'Physiological Integrity',
      subcategory: 'Pharmacological and Parenteral Therapies',
      difficulty: 'easy',
      tags: ['levothyroxine', 'thyroid', 'administration']
    }
    // Add 20 more pharmacology flashcards to reach 30...
  ],

  'lab-values': [
    {
      id: 'lab-fc-1',
      front: 'What are normal electrolyte values?',
      back: 'Sodium (Na+): 135-145 mEq/L\nPotassium (K+): 3.5-5.0 mEq/L\nCalcium (Ca++): 8.5-10.5 mg/dL\nMagnesium (Mg++): 1.5-2.5 mEq/L\nChloride (Cl-): 95-105 mEq/L',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'easy',
      tags: ['electrolytes', 'normal values', 'lab']
    },
    {
      id: 'lab-fc-2',
      front: 'What are normal blood glucose values?',
      back: 'Fasting: 70-110 mg/dL\nRandom: <200 mg/dL\nHbA1c: <5.7% (normal)\n        5.7-6.4% (prediabetes)\n        ≥6.5% (diabetes)',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'easy',
      tags: ['glucose', 'diabetes', 'lab values']
    },
    {
      id: 'lab-fc-3',
      front: 'What are normal Complete Blood Count (CBC) values?',
      back: 'WBC: 5,000-10,000/mm³\nRBC: M: 4.5-6.0, F: 4.0-5.5 million/mm³\nHemoglobin: M: 14-18, F: 12-16 g/dL\nHematocrit: M: 42-52%, F: 36-48%\nPlatelets: 150,000-400,000/mm³',
      category: 'Physiological Integrity',
      subcategory: 'Reduction of Risk Potential',
      difficulty: 'medium',
      tags: ['CBC', 'blood', 'lab values']
    },
    {
      id: 'lab-fc-4',
      front: 'What are the signs of hypokalemia?',
      back: 'Potassium <3.5 mEq/L\n\nSymptoms:\n• Muscle weakness\n• Decreased reflexes\n• Shallow respirations\n• Cardiac dysrhythmias\n• Constipation\n• Flat T waves on ECG',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'medium',
      tags: ['hypokalemia', 'potassium', 'electrolytes'],
      mnemonicTip: 'LOW K+ = LOW everything (weak, flat)'
    },
    {
      id: 'lab-fc-5',
      front: 'What are the signs of hyperkalemia?',
      back: 'Potassium >5.0 mEq/L\n\nSymptoms:\n• Muscle twitching/cramps\n• Hyperactive reflexes\n• Cardiac dysrhythmias\n• Peaked T waves on ECG\n• Diarrhea\n\nLife-threatening!',
      category: 'Physiological Integrity',
      subcategory: 'Physiological Adaptation',
      difficulty: 'medium',
      tags: ['hyperkalemia', 'potassium', 'electrolytes'],
      mnemonicTip: 'HIGH K+ = HIGH/peaked (twitching, peaked T waves)'
    }
    // Add 25 more lab values flashcards...
  ]
};

// Helper functions
export function getFlashcardsByTopic(topicId: string): Flashcard[] {
  return enhancedFlashcardBank[topicId] || enhancedFlashcardBank.fundamentals;
}

export function getRandomFlashcards(topicId: string, count: number): Flashcard[] {
  const cards = [...(enhancedFlashcardBank[topicId] || enhancedFlashcardBank.fundamentals)];
  const shuffled = cards.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFlashcardsByDifficulty(
  topicId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Flashcard[] {
  const cards = enhancedFlashcardBank[topicId] || enhancedFlashcardBank.fundamentals;
  return cards.filter(card => card.difficulty === difficulty);
}
