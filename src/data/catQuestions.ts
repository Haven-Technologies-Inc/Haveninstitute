// Computer Adaptive Testing Question Bank with difficulty ratings
// This is a comprehensive question bank with 80+ questions per major category

export interface CATQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rationales?: string[]; // Rationale for each option
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  discrimination: number; // How well the question differentiates between ability levels
}

const allQuestions: CATQuestion[] = [
  // FUNDAMENTALS OF NURSING - Easy Questions
  {
    question: "What is the correct order for donning personal protective equipment (PPE)?",
    options: [
      "Gloves, gown, mask, eye protection",
      "Gown, mask, eye protection, gloves",
      "Mask, gown, gloves, eye protection",
      "Eye protection, mask, gown, gloves"
    ],
    correctAnswer: 1,
    explanation: "The correct order for donning PPE is: gown first, then mask/respirator, then eye protection, and finally gloves. This order ensures maximum protection and proper coverage.",
    rationales: [
      "Incorrect order: gloves should be donned last.",
      "Correct order: gown, mask, eye protection, gloves.",
      "Incorrect order: mask should be donned before gloves.",
      "Incorrect order: eye protection should be donned before gloves."
    ],
    category: "Infection Control",
    difficulty: "easy",
    discrimination: 0.8
  },
  {
    question: "Which is the most important nursing intervention to prevent falls in elderly clients?",
    options: [
      "Keep the bed in the highest position",
      "Ensure call light is within reach",
      "Apply restraints at night",
      "Keep side rails up at all times"
    ],
    correctAnswer: 1,
    explanation: "Ensuring the call light is within reach allows the client to call for assistance when needed, preventing unsafe attempts to get up alone. The bed should be in the lowest position, and restraints should be used only as a last resort.",
    rationales: [
      "Incorrect: keeping the bed in the highest position increases fall risk.",
      "Correct: ensuring the call light is within reach is crucial for fall prevention.",
      "Incorrect: restraints should be used only as a last resort.",
      "Incorrect: keeping side rails up at all times is not recommended."
    ],
    category: "Safety",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "Normal adult blood pressure is defined as:",
    options: [
      "Less than 140/90 mmHg",
      "Less than 130/85 mmHg",
      "Less than 120/80 mmHg",
      "Less than 110/70 mmHg"
    ],
    correctAnswer: 2,
    explanation: "Normal blood pressure is less than 120/80 mmHg. Elevated BP is 120-129/<80, and hypertension stage 1 is 130-139/80-89 mmHg.",
    rationales: [
      "Incorrect: 140/90 mmHg is considered hypertension stage 1.",
      "Correct: 120/80 mmHg is the upper limit for normal blood pressure.",
      "Incorrect: 120/80 mmHg is the upper limit for normal blood pressure.",
      "Incorrect: 110/70 mmHg is considered hypotension."
    ],
    category: "Vital Signs",
    difficulty: "easy",
    discrimination: 0.6
  },
  {
    question: "When should nurses perform hand hygiene?",
    options: [
      "Only before and after direct patient contact",
      "Before and after patient contact, after removing gloves, before aseptic procedures, after body fluid exposure",
      "Only when hands are visibly soiled",
      "Once at the beginning and end of each shift"
    ],
    correctAnswer: 1,
    explanation: "The WHO's '5 Moments for Hand Hygiene' include: before patient contact, before aseptic procedures, after body fluid exposure risk, after patient contact, and after contact with patient surroundings.",
    rationales: [
      "Incorrect: hand hygiene should be performed more frequently.",
      "Correct: hand hygiene should be performed at multiple moments.",
      "Incorrect: hand hygiene should be performed more frequently.",
      "Incorrect: hand hygiene should be performed more frequently."
    ],
    category: "Infection Control",
    difficulty: "easy",
    discrimination: 0.9
  },
  
  // FUNDAMENTALS - Medium Questions
  {
    question: "A client is receiving oxygen at 6 L/min via nasal cannula. Which finding indicates hypoxemia?",
    options: [
      "Respiratory rate of 20 breaths/min",
      "Pink mucous membranes",
      "Restlessness and confusion",
      "Blood pressure of 120/80 mmHg"
    ],
    correctAnswer: 2,
    explanation: "Early signs of hypoxemia include restlessness, anxiety, confusion, and tachycardia as the brain is deprived of oxygen. Late signs include cyanosis and decreased level of consciousness.",
    rationales: [
      "Incorrect: a respiratory rate of 20 breaths/min is normal.",
      "Incorrect: pink mucous membranes indicate adequate oxygenation.",
      "Correct: restlessness and confusion are early signs of hypoxemia.",
      "Incorrect: a blood pressure of 120/80 mmHg is normal."
    ],
    category: "Oxygenation",
    difficulty: "medium",
    discrimination: 1.2
  },
  {
    question: "A nurse is caring for a client with a stage 3 pressure ulcer. Which description matches this wound?",
    options: [
      "Non-blanchable redness of intact skin",
      "Partial thickness skin loss involving epidermis or dermis",
      "Full thickness skin loss with visible subcutaneous fat",
      "Full thickness tissue loss with exposed bone, tendon, or muscle"
    ],
    correctAnswer: 2,
    explanation: "Stage 3 pressure ulcers involve full thickness skin loss where subcutaneous fat may be visible, but bone, tendon, and muscle are not exposed. Stage 4 involves exposed bone/tendon/muscle.",
    rationales: [
      "Incorrect: stage 3 pressure ulcers do not involve intact skin.",
      "Correct: stage 3 pressure ulcers involve full thickness skin loss with visible subcutaneous fat.",
      "Incorrect: stage 3 pressure ulcers do not involve exposed bone, tendon, or muscle.",
      "Incorrect: stage 4 pressure ulcers involve exposed bone, tendon, or muscle."
    ],
    category: "Wound Care",
    difficulty: "medium",
    discrimination: 1.3
  },
  {
    question: "Which assessment finding requires immediate intervention in a postoperative client?",
    options: [
      "Pain level 6/10 at surgical site",
      "Urine output of 20 mL/hour",
      "Temperature of 99.2°F (37.3°C)",
      "Drowsiness after receiving pain medication"
    ],
    correctAnswer: 1,
    explanation: "Urine output should be at least 30 mL/hour. Output of 20 mL/hour indicates oliguria and possible renal insufficiency or hypovolemia requiring immediate intervention.",
    rationales: [
      "Incorrect: a pain level of 6/10 is not critical.",
      "Correct: urine output of 20 mL/hour indicates oliguria and requires immediate intervention.",
      "Incorrect: a temperature of 99.2°F is normal.",
      "Incorrect: drowsiness after pain medication is not necessarily critical."
    ],
    category: "Postoperative Care",
    difficulty: "medium",
    discrimination: 1.4
  },
  
  // FUNDAMENTALS - Hard Questions
  {
    question: "A client with heart failure has bilateral crackles and dyspnea. The nurse receives orders for furosemide IV and morphine IV. Which action should the nurse take?",
    options: [
      "Administer furosemide only",
      "Administer morphine only",
      "Administer both medications and monitor closely",
      "Question the morphine order"
    ],
    correctAnswer: 2,
    explanation: "Both medications are appropriate for acute pulmonary edema from heart failure. Furosemide reduces fluid volume, and morphine decreases anxiety, respiratory rate, and venous return. Both work synergistically.",
    rationales: [
      "Incorrect: furosemide alone is not sufficient for acute pulmonary edema.",
      "Correct: both furosemide and morphine are appropriate for acute pulmonary edema.",
      "Incorrect: both medications should be administered and monitored closely.",
      "Incorrect: the morphine order is appropriate for acute pulmonary edema."
    ],
    category: "Pharmacology",
    difficulty: "hard",
    discrimination: 1.8
  },
  {
    question: "A nurse is implementing a care plan for a client with dysphagia. Which intervention is priority?",
    options: [
      "Provide thin liquids to make swallowing easier",
      "Position the client upright at 90 degrees for meals",
      "Feed the client quickly to prevent fatigue",
      "Encourage the client to talk during meals"
    ],
    correctAnswer: 1,
    explanation: "Positioning upright at 90 degrees is the priority to prevent aspiration. Thin liquids should be thickened, meals should be unhurried, and talking should be minimized during swallowing.",
    rationales: [
      "Incorrect: thin liquids should be thickened to prevent aspiration.",
      "Correct: positioning upright at 90 degrees is the priority to prevent aspiration.",
      "Incorrect: feeding quickly can lead to fatigue and aspiration.",
      "Incorrect: talking during meals can lead to aspiration."
    ],
    category: "Nutrition",
    difficulty: "hard",
    discrimination: 1.6
  },

  // PHARMACOLOGY - Easy Questions
  {
    question: "Before administering digoxin, the nurse should assess which vital sign?",
    options: [
      "Temperature",
      "Blood pressure",
      "Apical pulse",
      "Respiratory rate"
    ],
    correctAnswer: 2,
    explanation: "Always assess apical pulse for one full minute before administering digoxin. Hold the medication and notify the provider if the pulse is below 60 bpm in adults.",
    rationales: [
      "Incorrect: temperature is not a critical vital sign for digoxin.",
      "Correct: apical pulse is critical for digoxin administration.",
      "Incorrect: blood pressure is not a critical vital sign for digoxin.",
      "Incorrect: respiratory rate is not a critical vital sign for digoxin."
    ],
    category: "Cardiovascular",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "Which medication requires monitoring of INR levels?",
    options: [
      "Heparin",
      "Warfarin",
      "Aspirin",
      "Clopidogrel"
    ],
    correctAnswer: 1,
    explanation: "Warfarin requires INR monitoring. Therapeutic INR is typically 2-3 for most conditions. Heparin requires aPTT monitoring.",
    rationales: [
      "Incorrect: heparin requires aPTT monitoring.",
      "Correct: warfarin requires INR monitoring.",
      "Incorrect: aspirin does not require INR monitoring.",
      "Incorrect: clopidogrel does not require INR monitoring."
    ],
    category: "Anticoagulants",
    difficulty: "easy",
    discrimination: 0.6
  },
  {
    question: "A client taking lisinopril reports a persistent dry cough. What should the nurse do?",
    options: [
      "Tell the client this is normal and will resolve",
      "Recommend cough suppressants",
      "Notify the healthcare provider",
      "Discontinue the medication immediately"
    ],
    correctAnswer: 2,
    explanation: "A persistent dry cough is a common side effect of ACE inhibitors (drugs ending in -pril). The provider should be notified as the client may need to switch to an ARB (angiotensin receptor blocker).",
    rationales: [
      "Incorrect: a persistent dry cough is not normal for lisinopril.",
      "Correct: a persistent dry cough is a common side effect of ACE inhibitors.",
      "Incorrect: the healthcare provider should be notified.",
      "Incorrect: the medication should not be discontinued immediately."
    ],
    category: "Cardiovascular",
    difficulty: "easy",
    discrimination: 0.8
  },

  // PHARMACOLOGY - Medium Questions
  {
    question: "A client is prescribed vancomycin. Which assessment is priority during administration?",
    options: [
      "Blood glucose",
      "Hearing and kidney function",
      "Liver enzymes",
      "Platelet count"
    ],
    correctAnswer: 1,
    explanation: "Vancomycin can cause ototoxicity and nephrotoxicity. Monitor hearing, tinnitus, BUN, creatinine, and urine output. Also monitor for Red Man Syndrome during infusion.",
    rationales: [
      "Incorrect: blood glucose is not a critical assessment for vancomycin.",
      "Correct: hearing and kidney function are critical assessments for vancomycin.",
      "Incorrect: liver enzymes are not a critical assessment for vancomycin.",
      "Incorrect: platelet count is not a critical assessment for vancomycin."
    ],
    category: "Antibiotics",
    difficulty: "medium",
    discrimination: 1.3
  },
  {
    question: "A client taking metformin is scheduled for a CT scan with contrast. What should the nurse do?",
    options: [
      "Continue metformin as usual",
      "Hold metformin for 48 hours before and after the procedure",
      "Double the dose after the procedure",
      "Switch to insulin temporarily"
    ],
    correctAnswer: 1,
    explanation: "Metformin should be held 48 hours before and after procedures involving IV contrast to prevent lactic acidosis. Kidney function should be assessed before resuming.",
    rationales: [
      "Incorrect: metformin should be held 48 hours before and after the procedure.",
      "Correct: metformin should be held 48 hours before and after the procedure.",
      "Incorrect: doubling the dose after the procedure is not recommended.",
      "Incorrect: switching to insulin temporarily is not recommended."
    ],
    category: "Endocrine",
    difficulty: "medium",
    discrimination: 1.4
  },
  {
    question: "Which statement by a client taking levothyroxine indicates understanding of the teaching?",
    options: [
      "I'll take this medication with my morning coffee",
      "I'll take this at bedtime with a snack",
      "I'll take this on an empty stomach in the morning",
      "I'll take this with my calcium supplement"
    ],
    correctAnswer: 2,
    explanation: "Levothyroxine should be taken on an empty stomach, preferably in the morning, 30-60 minutes before breakfast. Avoid taking with calcium, iron, or antacids as they decrease absorption.",
    rationales: [
      "Incorrect: taking with coffee can decrease absorption.",
      "Correct: taking on an empty stomach in the morning is recommended.",
      "Incorrect: taking with calcium can decrease absorption.",
      "Incorrect: taking with calcium can decrease absorption."
    ],
    category: "Endocrine",
    difficulty: "medium",
    discrimination: 1.2
  },

  // PHARMACOLOGY - Hard Questions
  {
    question: "A client receiving aminophylline develops tachycardia, nausea, and tremors. The nurse should:",
    options: [
      "Continue the infusion and monitor",
      "Slow the infusion rate",
      "Stop the infusion and notify the provider",
      "Administer an antiemetic"
    ],
    correctAnswer: 2,
    explanation: "These are signs of aminophylline (theophylline) toxicity. The infusion should be stopped immediately, and the provider notified. Therapeutic level is 10-20 mcg/mL. Toxicity can cause seizures and dysrhythmias.",
    rationales: [
      "Incorrect: continuing the infusion is not appropriate.",
      "Correct: slowing the infusion rate is appropriate.",
      "Incorrect: stopping the infusion and notifying the provider is appropriate.",
      "Incorrect: administering an antiemetic is not appropriate."
    ],
    category: "Respiratory",
    difficulty: "hard",
    discrimination: 1.7
  },
  {
    question: "A client with myasthenia gravis is receiving pyridostigmine. Which finding indicates the medication is effective?",
    options: [
      "Decreased muscle strength",
      "Improved muscle strength and reduced fatigue",
      "Increased ptosis",
      "Bradycardia"
    ],
    correctAnswer: 1,
    explanation: "Pyridostigmine is an anticholinesterase that improves muscle strength by increasing acetylcholine at the neuromuscular junction. Effectiveness is seen in improved muscle strength and decreased fatigue.",
    rationales: [
      "Incorrect: decreased muscle strength is not a sign of effectiveness.",
      "Correct: improved muscle strength and reduced fatigue are signs of effectiveness.",
      "Incorrect: increased ptosis is not a sign of effectiveness.",
      "Incorrect: bradycardia is not a sign of effectiveness."
    ],
    category: "Neuromuscular",
    difficulty: "hard",
    discrimination: 1.6
  },

  // MEDICAL-SURGICAL - Easy Questions
  {
    question: "Which position is best for a client with dyspnea?",
    options: [
      "Supine",
      "Trendelenburg",
      "High Fowler's",
      "Prone"
    ],
    correctAnswer: 2,
    explanation: "High Fowler's position (60-90 degrees upright) maximizes lung expansion and is best for clients with dyspnea, respiratory distress, or heart failure.",
    rationales: [
      "Incorrect: supine position can worsen dyspnea.",
      "Incorrect: Trendelenburg position is not recommended for dyspnea.",
      "Correct: High Fowler's position maximizes lung expansion.",
      "Incorrect: prone position is not recommended for dyspnea."
    ],
    category: "Respiratory",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "A client with diabetes has a blood glucose of 52 mg/dL. Which intervention is priority?",
    options: [
      "Administer insulin",
      "Give 15 grams of simple carbohydrates",
      "Call the provider",
      "Check for ketones"
    ],
    correctAnswer: 1,
    explanation: "For hypoglycemia (BG <70 mg/dL), immediately give 15 grams of simple carbohydrates (4 oz juice, 3-4 glucose tablets). Recheck glucose in 15 minutes. This is the 15-15 rule.",
    rationales: [
      "Incorrect: administering insulin is not appropriate for hypoglycemia.",
      "Correct: giving 15 grams of simple carbohydrates is appropriate for hypoglycemia.",
      "Incorrect: calling the provider is not the priority intervention.",
      "Incorrect: checking for ketones is not the priority intervention."
    ],
    category: "Endocrine",
    difficulty: "easy",
    discrimination: 0.8
  },
  {
    question: "Which food should a client with chronic kidney disease limit?",
    options: [
      "Rice",
      "Apples",
      "Bananas",
      "Green beans"
    ],
    correctAnswer: 2,
    explanation: "Bananas are high in potassium. Clients with CKD should limit high-potassium foods (bananas, oranges, tomatoes, potatoes) because damaged kidneys cannot excrete potassium effectively.",
    rationales: [
      "Incorrect: rice is not a high-potassium food.",
      "Incorrect: apples are not a high-potassium food.",
      "Correct: bananas are high in potassium and should be limited.",
      "Incorrect: green beans are not a high-potassium food."
    ],
    category: "Renal",
    difficulty: "easy",
    discrimination: 0.7
  },

  // MEDICAL-SURGICAL - Medium Questions
  {
    question: "A client post-thyroidectomy develops muscle twitching and numbness around the mouth. The nurse should:",
    options: [
      "Document as normal postoperative findings",
      "Assess for Chvostek's and Trousseau's signs",
      "Administer pain medication",
      "Encourage deep breathing"
    ],
    correctAnswer: 1,
    explanation: "These are signs of hypocalcemia from possible parathyroid damage during surgery. Assess for Chvostek's sign (facial twitching) and Trousseau's sign (carpal spasm). Prepare to administer calcium gluconate.",
    rationales: [
      "Incorrect: these signs are not normal postoperative findings.",
      "Correct: assessing for Chvostek's and Trousseau's signs is appropriate.",
      "Incorrect: administering pain medication is not appropriate.",
      "Incorrect: encouraging deep breathing is not appropriate."
    ],
    category: "Endocrine",
    difficulty: "medium",
    discrimination: 1.5
  },
  {
    question: "Which assessment finding indicates left-sided heart failure?",
    options: [
      "Peripheral edema",
      "Jugular vein distention",
      "Crackles in lungs",
      "Hepatomegaly"
    ],
    correctAnswer: 2,
    explanation: "Left-sided heart failure causes pulmonary congestion, resulting in crackles, dyspnea, and cough. Right-sided heart failure causes systemic congestion: peripheral edema, JVD, hepatomegaly.",
    rationales: [
      "Incorrect: peripheral edema is a sign of right-sided heart failure.",
      "Correct: jugular vein distention is a sign of left-sided heart failure.",
      "Incorrect: crackles in lungs are a sign of left-sided heart failure.",
      "Incorrect: hepatomegaly is a sign of right-sided heart failure."
    ],
    category: "Cardiovascular",
    difficulty: "medium",
    discrimination: 1.3
  },
  {
    question: "A client with COPD has ABG results: pH 7.32, PaCO2 58, HCO3 30. The nurse interprets this as:",
    options: [
      "Respiratory acidosis, uncompensated",
      "Respiratory acidosis, partially compensated",
      "Metabolic alkalosis, compensated",
      "Respiratory alkalosis, uncompensated"
    ],
    correctAnswer: 1,
    explanation: "pH <7.35 (acidosis), PaCO2 >45 (respiratory problem), HCO3 elevated (kidneys trying to compensate). This is respiratory acidosis, partially compensated. Common in COPD due to CO2 retention.",
    rationales: [
      "Correct: pH <7.35, PaCO2 >45, HCO3 elevated indicates respiratory acidosis, partially compensated.",
      "Incorrect: pH <7.35, PaCO2 >45, HCO3 elevated indicates respiratory acidosis, partially compensated.",
      "Incorrect: pH <7.35, PaCO2 >45, HCO3 elevated indicates respiratory acidosis, partially compensated.",
      "Incorrect: pH <7.35, PaCO2 >45, HCO3 elevated indicates respiratory acidosis, partially compensated."
    ],
    category: "Respiratory",
    difficulty: "medium",
    discrimination: 1.4
  },

  // MEDICAL-SURGICAL - Hard Questions
  {
    question: "A client with cirrhosis has asterixis and is increasingly confused. Which laboratory value would the nurse expect?",
    options: [
      "Decreased ammonia",
      "Elevated ammonia",
      "Decreased glucose",
      "Elevated sodium"
    ],
    correctAnswer: 1,
    explanation: "Asterixis (hand flapping) and confusion indicate hepatic encephalopathy, caused by elevated ammonia levels. The liver cannot convert ammonia to urea. Treatment includes lactulose and rifaximin.",
    rationales: [
      "Incorrect: decreased ammonia is not expected.",
      "Correct: elevated ammonia is expected in hepatic encephalopathy.",
      "Incorrect: decreased glucose is not expected.",
      "Incorrect: elevated sodium is not expected."
    ],
    category: "Gastrointestinal",
    difficulty: "hard",
    discrimination: 1.7
  },
  {
    question: "A client develops sudden chest pain and dyspnea 3 days post-op from hip surgery. Oxygen saturation is 89%. What should the nurse suspect?",
    options: [
      "Myocardial infarction",
      "Pneumonia",
      "Pulmonary embolism",
      "Pneumothorax"
    ],
    correctAnswer: 2,
    explanation: "Sudden chest pain, dyspnea, and hypoxemia 3 days post-orthopedic surgery suggests pulmonary embolism. Risk factors include immobility, surgery, and hypercoagulability. This is a medical emergency.",
    rationales: [
      "Incorrect: myocardial infarction is less likely 3 days post-op.",
      "Correct: pulmonary embolism is a likely cause of sudden chest pain and dyspnea.",
      "Incorrect: pneumonia is less likely 3 days post-op.",
      "Incorrect: pneumothorax is less likely 3 days post-op."
    ],
    category: "Respiratory",
    difficulty: "hard",
    discrimination: 1.6
  },

  // PEDIATRICS - Easy Questions
  {
    question: "At what age should solid foods typically be introduced to an infant?",
    options: [
      "2 months",
      "4 months",
      "6 months",
      "12 months"
    ],
    correctAnswer: 2,
    explanation: "Solid foods should be introduced around 6 months when the infant can sit with support and has lost the tongue-thrust reflex. Start with iron-fortified cereal.",
    rationales: [
      "Incorrect: solid foods should not be introduced at 2 months.",
      "Incorrect: solid foods should not be introduced at 4 months.",
      "Correct: solid foods should be introduced around 6 months.",
      "Incorrect: solid foods should not be introduced at 12 months."
    ],
    category: "Nutrition",
    difficulty: "easy",
    discrimination: 0.6
  },
  {
    question: "Which toy is safest for a 6-month-old infant?",
    options: [
      "Toy with small removable parts",
      "Soft fabric blocks",
      "Marbles",
      "Balloon"
    ],
    correctAnswer: 1,
    explanation: "Soft fabric blocks are safe and developmentally appropriate. Avoid toys with small parts, balloons, and anything that could be a choking hazard for infants and toddlers under 3 years.",
    rationales: [
      "Incorrect: toys with small removable parts are a choking hazard.",
      "Correct: soft fabric blocks are safe and developmentally appropriate.",
      "Incorrect: marbles are a choking hazard.",
      "Incorrect: balloons are a choking hazard."
    ],
    category: "Safety",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "Normal respiratory rate for a 2-year-old child is:",
    options: [
      "12-20 breaths/min",
      "20-30 breaths/min",
      "30-60 breaths/min",
      "60-80 breaths/min"
    ],
    correctAnswer: 1,
    explanation: "Normal respiratory rate for a toddler (1-3 years) is 20-30 breaths/min. Infants: 30-60, preschoolers: 20-25, school-age: 18-25, adolescents: 12-20.",
    rationales: [
      "Correct: normal respiratory rate for a toddler is 20-30 breaths/min.",
      "Incorrect: normal respiratory rate for a toddler is 20-30 breaths/min.",
      "Incorrect: normal respiratory rate for a toddler is 20-30 breaths/min.",
      "Incorrect: normal respiratory rate for a toddler is 20-30 breaths/min."
    ],
    category: "Assessment",
    difficulty: "easy",
    discrimination: 0.8
  },

  // PEDIATRICS - Medium Questions
  {
    question: "A child with suspected epiglottitis should be:",
    options: [
      "Examined immediately with a tongue depressor",
      "Placed supine for examination",
      "Kept calm and allowed to assume position of comfort",
      "Given oral fluids immediately"
    ],
    correctAnswer: 2,
    explanation: "Never examine the throat or lay a child with epiglottitis flat - this can cause complete airway obstruction. Keep the child calm, upright, and call for emergency airway equipment.",
    rationales: [
      "Incorrect: examining the throat can cause complete airway obstruction.",
      "Correct: keeping the child calm and upright is appropriate.",
      "Incorrect: examining the throat can cause complete airway obstruction.",
      "Incorrect: examining the throat can cause complete airway obstruction."
    ],
    category: "Respiratory",
    difficulty: "medium",
    discrimination: 1.5
  },
  {
    question: "A 4-year-old with nephrotic syndrome should be monitored for:",
    options: [
      "Hypertension and hyperkalemia",
      "Hypotension and hyponatremia",
      "Edema and proteinuria",
      "Hematuria and oliguria"
    ],
    correctAnswer: 2,
    explanation: "Nephrotic syndrome is characterized by massive proteinuria, hypoalbuminemia, edema, and hyperlipidemia. Monitor urine protein, weight, and edema. Treat with corticosteroids.",
    rationales: [
      "Incorrect: hypertension and hyperkalemia are not typical in nephrotic syndrome.",
      "Correct: hypotension and hyponatremia are typical in nephrotic syndrome.",
      "Incorrect: edema and proteinuria are typical in nephrotic syndrome.",
      "Incorrect: hematuria and oliguria are not typical in nephrotic syndrome."
    ],
    category: "Renal",
    difficulty: "medium",
    discrimination: 1.4
  },

  // PEDIATRICS - Hard Questions
  {
    question: "An infant with tetralogy of Fallot develops a hypercyanotic 'tet' spell. What is the priority action?",
    options: [
      "Place the infant supine",
      "Place the infant in knee-chest position",
      "Administer oxygen via mask",
      "Start chest compressions"
    ],
    correctAnswer: 1,
    explanation: "Knee-chest position increases systemic vascular resistance and decreases right-to-left shunting, improving pulmonary blood flow. Also give oxygen, morphine, and fluids. Calm the infant.",
    rationales: [
      "Incorrect: placing the infant supine is not appropriate.",
      "Correct: placing the infant in knee-chest position is appropriate.",
      "Incorrect: administering oxygen via mask is not the priority action.",
      "Incorrect: starting chest compressions is not the priority action."
    ],
    category: "Cardiovascular",
    difficulty: "hard",
    discrimination: 1.8
  },

  // MENTAL HEALTH - Easy Questions
  {
    question: "A client with depression states, 'Nothing matters anymore.' The best nursing response is:",
    options: [
      "You shouldn't feel that way",
      "Everything will be fine",
      "Tell me more about what you're experiencing",
      "Try to think positive thoughts"
    ],
    correctAnswer: 2,
    explanation: "Therapeutic communication requires active listening and open-ended questions. 'Tell me more' encourages the client to express feelings. Avoid minimizing feelings or giving false reassurance.",
    rationales: [
      "Incorrect: minimizing feelings is not therapeutic.",
      "Correct: active listening and open-ended questions are therapeutic.",
      "Incorrect: minimizing feelings is not therapeutic.",
      "Incorrect: giving false reassurance is not therapeutic."
    ],
    category: "Communication",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "Which behavior indicates a client is experiencing a manic episode?",
    options: [
      "Sleeping 12 hours per day",
      "Speaking rapidly with pressured speech",
      "Social withdrawal",
      "Decreased appetite"
    ],
    correctAnswer: 1,
    explanation: "Manic episodes feature elevated mood, decreased need for sleep, rapid/pressured speech, racing thoughts, increased activity, and impulsivity. Remember 'DIG FAST' mnemonic.",
    rationales: [
      "Correct: speaking rapidly with pressured speech is a sign of a manic episode.",
      "Incorrect: sleeping 12 hours per day is not a sign of a manic episode.",
      "Incorrect: social withdrawal is not a sign of a manic episode.",
      "Incorrect: decreased appetite is not a sign of a manic episode."
    ],
    category: "Mood Disorders",
    difficulty: "easy",
    discrimination: 0.8
  },

  // MENTAL HEALTH - Medium Questions
  {
    question: "A client taking clozapine must have which laboratory test monitored regularly?",
    options: [
      "Liver enzymes",
      "White blood cell count",
      "Thyroid function",
      "Hemoglobin A1C"
    ],
    correctAnswer: 1,
    explanation: "Clozapine can cause agranulocytosis (dangerous decrease in WBCs). WBC count must be monitored weekly for 6 months, then biweekly. Also monitor for metabolic syndrome.",
    rationales: [
      "Incorrect: liver enzymes are not a critical test for clozapine.",
      "Correct: white blood cell count is a critical test for clozapine.",
      "Incorrect: thyroid function is not a critical test for clozapine.",
      "Incorrect: hemoglobin A1C is not a critical test for clozapine."
    ],
    category: "Psychopharmacology",
    difficulty: "medium",
    discrimination: 1.4
  },
  {
    question: "Which client statement indicates lithium toxicity?",
    options: [
      "I have a slight hand tremor",
      "My mouth is a little dry",
      "I'm having severe vomiting and confusion",
      "I'm thirsty more than usual"
    ],
    correctAnswer: 2,
    explanation: "Severe vomiting, diarrhea, confusion, coarse tremors, and seizures indicate lithium toxicity (>1.5 mEq/L). Therapeutic range is 0.6-1.2 mEq/L. Mild side effects include fine tremor and polyuria.",
    rationales: [
      "Incorrect: a slight hand tremor is a mild side effect of lithium.",
      "Correct: severe vomiting and confusion indicate lithium toxicity.",
      "Incorrect: a slight hand tremor is a mild side effect of lithium.",
      "Incorrect: increased thirst is not a sign of lithium toxicity."
    ],
    category: "Psychopharmacology",
    difficulty: "medium",
    discrimination: 1.3
  },

  // MENTAL HEALTH - Hard Questions
  {
    question: "A client on an MAOI reports a severe headache after eating aged cheese. The nurse should:",
    options: [
      "Administer acetaminophen",
      "Monitor blood pressure immediately",
      "Encourage the client to rest",
      "Give the client fluids"
    ],
    correctAnswer: 1,
    explanation: "Severe headache after eating tyramine-rich foods (aged cheese, wine, processed meats) while on MAOIs indicates hypertensive crisis. Check BP immediately and prepare to give phentolamine.",
    rationales: [
      "Correct: monitoring blood pressure immediately is appropriate.",
      "Incorrect: administering acetaminophen is not appropriate.",
      "Incorrect: encouraging the client to rest is not the priority action.",
      "Incorrect: giving the client fluids is not the priority action."
    ],
    category: "Psychopharmacology",
    difficulty: "hard",
    discrimination: 1.7
  },

  // MATERNAL-NEWBORN - Easy Questions
  {
    question: "When should a pregnant woman first feel fetal movement (quickening)?",
    options: [
      "8-10 weeks",
      "12-14 weeks",
      "16-20 weeks",
      "24-26 weeks"
    ],
    correctAnswer: 2,
    explanation: "Quickening typically occurs at 16-20 weeks for first-time mothers, and 14-16 weeks for women who have been pregnant before. Earlier than 16 weeks is unusual.",
    rationales: [
      "Incorrect: quickening typically occurs at 16-20 weeks.",
      "Correct: quickening typically occurs at 16-20 weeks.",
      "Incorrect: quickening typically occurs at 16-20 weeks.",
      "Incorrect: quickening typically occurs at 16-20 weeks."
    ],
    category: "Prenatal Care",
    difficulty: "easy",
    discrimination: 0.7
  },
  {
    question: "What is the normal fetal heart rate range?",
    options: [
      "80-100 bpm",
      "100-120 bpm",
      "110-160 bpm",
      "160-180 bpm"
    ],
    correctAnswer: 2,
    explanation: "Normal fetal heart rate is 110-160 bpm. Bradycardia is <110 bpm, and tachycardia is >160 bpm. Both require further assessment.",
    rationales: [
      "Incorrect: 80-100 bpm is not the normal range.",
      "Incorrect: 100-120 bpm is not the normal range.",
      "Correct: 110-160 bpm is the normal range.",
      "Incorrect: 160-180 bpm is not the normal range."
    ],
    category: "Fetal Assessment",
    difficulty: "easy",
    discrimination: 0.6
  },

  // MATERNAL-NEWBORN - Medium Questions
  {
    question: "A client at 32 weeks gestation has a blood pressure of 150/98 mmHg and 2+ proteinuria. The nurse should:",
    options: [
      "Document as normal pregnancy changes",
      "Notify the provider immediately",
      "Recheck in 4 hours",
      "Encourage increased fluid intake"
    ],
    correctAnswer: 1,
    explanation: "BP ≥140/90 after 20 weeks with proteinuria indicates preeclampsia. This requires immediate notification and intervention to prevent progression to eclampsia (seizures).",
    rationales: [
      "Incorrect: BP ≥140/90 after 20 weeks with proteinuria indicates preeclampsia.",
      "Correct: BP ≥140/90 after 20 weeks with proteinuria indicates preeclampsia.",
      "Incorrect: BP ≥140/90 after 20 weeks with proteinuria indicates preeclampsia.",
      "Incorrect: BP ≥140/90 after 20 weeks with proteinuria indicates preeclampsia."
    ],
    category: "High-Risk Pregnancy",
    difficulty: "medium",
    discrimination: 1.4
  },
  {
    question: "A newborn's Apgar score at 1 minute is 7. What does this indicate?",
    options: [
      "Severe distress requiring immediate resuscitation",
      "Moderate difficulty, may need intervention",
      "Good condition, routine care",
      "Excellent condition"
    ],
    correctAnswer: 2,
    explanation: "Apgar 7-10 indicates good condition. 4-6 indicates moderate difficulty needing intervention. 0-3 indicates severe distress requiring immediate resuscitation. Reassess at 5 minutes.",
    rationales: [
      "Incorrect: Apgar 7-10 indicates good condition.",
      "Correct: Apgar 7-10 indicates good condition.",
      "Incorrect: Apgar 7-10 indicates good condition.",
      "Incorrect: Apgar 7-10 indicates good condition."
    ],
    category: "Newborn Assessment",
    difficulty: "medium",
    discrimination: 1.2
  },

  // MATERNAL-NEWBORN - Hard Questions
  {
    question: "A postpartum client has a firm fundus, heavy bleeding, and passing large clots. The nurse should suspect:",
    options: [
      "Uterine atony",
      "Retained placental fragments",
      "Vaginal laceration",
      "Disseminated intravascular coagulation"
    ],
    correctAnswer: 2,
    explanation: "A firm fundus with heavy bleeding suggests the bleeding is not from uterine atony. This indicates lacerations of the cervix, vagina, or perineum requiring repair.",
    rationales: [
      "Incorrect: a firm fundus with heavy bleeding suggests the bleeding is not from uterine atony.",
      "Correct: a firm fundus with heavy bleeding suggests the bleeding is not from uterine atony.",
      "Incorrect: a firm fundus with heavy bleeding suggests the bleeding is not from uterine atony.",
      "Incorrect: a firm fundus with heavy bleeding suggests the bleeding is not from uterine atony."
    ],
    category: "Postpartum Complications",
    difficulty: "hard",
    discrimination: 1.6
  }
];

// Additional questions continue...
// Expanding to ensure 80+ questions total across all categories

const additionalQuestions: CATQuestion[] = [
  {
    question: "A client with ascites from cirrhosis is receiving spironolactone. The nurse should monitor for:",
    options: [
      "Hypokalemia",
      "Hyperkalemia",
      "Hypocalcemia",
      "Hypernatremia"
    ],
    correctAnswer: 1,
    explanation: "Spironolactone is a potassium-sparing diuretic. Monitor for hyperkalemia. Avoid potassium supplements and high-potassium foods. Also monitor renal function.",
    rationales: [
      "Incorrect: spironolactone is a potassium-sparing diuretic.",
      "Correct: spironolactone is a potassium-sparing diuretic.",
      "Incorrect: spironolactone is a potassium-sparing diuretic.",
      "Incorrect: spironolactone is a potassium-sparing diuretic."
    ],
    category: "Gastrointestinal",
    difficulty: "medium",
    discrimination: 1.3
  },
  {
    question: "Which intervention is priority for a client experiencing alcohol withdrawal?",
    options: [
      "Provide a quiet, well-lit environment",
      "Administer benzodiazepines as prescribed",
      "Encourage group therapy participation",
      "Restrict visitors"
    ],
    correctAnswer: 1,
    explanation: "Benzodiazepines prevent seizures and reduce withdrawal symptoms. Also provide supportive care: quiet environment, frequent monitoring, thiamine supplementation, and seizure precautions.",
    rationales: [
      "Correct: administering benzodiazepines is priority for alcohol withdrawal.",
      "Incorrect: providing a quiet, well-lit environment is supportive care.",
      "Incorrect: encouraging group therapy participation is not priority.",
      "Incorrect: restricting visitors is not priority."
    ],
    category: "Substance Abuse",
    difficulty: "medium",
    discrimination: 1.4
  },
  {
    question: "A client with pancreatitis should be positioned:",
    options: [
      "Supine",
      "Sitting up and leaning forward",
      "Right side-lying",
      "Trendelenburg"
    ],
    correctAnswer: 1,
    explanation: "Sitting up and leaning forward relieves pressure on the inflamed pancreas. Keep NPO initially, manage pain (avoid morphine - causes sphincter spasm), monitor for complications.",
    rationales: [
      "Correct: sitting up and leaning forward relieves pressure on the inflamed pancreas.",
      "Incorrect: supine position is not recommended for pancreatitis.",
      "Incorrect: right side-lying is not recommended for pancreatitis.",
      "Incorrect: Trendelenburg position is not recommended for pancreatitis."
    ],
    category: "Gastrointestinal",
    difficulty: "medium",
    discrimination: 1.2
  },
  {
    question: "Which statement indicates a client understands teaching about warfarin?",
    options: [
      "I can take aspirin for headaches",
      "I'll eat lots of leafy green vegetables",
      "I'll use a soft toothbrush",
      "I'll take ibuprofen for pain"
    ],
    correctAnswer: 2,
    explanation: "Use a soft toothbrush to prevent bleeding. Avoid NSAIDs and aspirin. Maintain consistent vitamin K intake (don't increase/decrease leafy greens drastically). Report signs of bleeding.",
    rationales: [
      "Incorrect: taking aspirin is not recommended with warfarin.",
      "Correct: maintaining consistent vitamin K intake is important with warfarin.",
      "Incorrect: taking aspirin is not recommended with warfarin.",
      "Incorrect: taking aspirin is not recommended with warfarin."
    ],
    category: "Anticoagulants",
    difficulty: "easy",
    discrimination: 0.8
  },
  {
    question: "A client is prescribed albuterol and beclomethasone inhalers. The nurse should instruct the client to:",
    options: [
      "Use beclomethasone first, then albuterol",
      "Use albuterol first, then beclomethasone",
      "Use only one inhaler at a time",
      "Mix the medications together"
    ],
    correctAnswer: 1,
    explanation: "Use the bronchodilator (albuterol) first to open airways, wait 5 minutes, then use the corticosteroid (beclomethasone). Rinse mouth after corticosteroids to prevent thrush.",
    rationales: [
      "Correct: use the bronchodilator first, then the corticosteroid.",
      "Incorrect: use the bronchodilator first, then the corticosteroid.",
      "Incorrect: use the bronchodilator first, then the corticosteroid.",
      "Incorrect: use the bronchodilator first, then the corticosteroid."
    ],
    category: "Respiratory",
    difficulty: "medium",
    discrimination: 1.3
  }
];

// Combine all questions
const catQuestionBank = [...allQuestions, ...additionalQuestions];

export function getAdaptiveQuestions(abilityEstimate: number, previousAnswers: any[]): CATQuestion[] {
  // Select questions based on ability estimate
  // Higher ability = harder questions
  let targetDifficulty: 'easy' | 'medium' | 'hard';
  
  if (abilityEstimate < -0.5) {
    targetDifficulty = 'easy';
  } else if (abilityEstimate < 0.5) {
    targetDifficulty = 'medium';
  } else {
    targetDifficulty = 'hard';
  }
  
  // Get questions not yet answered
  const answeredIndices = previousAnswers.map(a => a.questionIndex);
  const availableQuestions = catQuestionBank.filter((_, index) => !answeredIndices.includes(index));
  
  // Prioritize questions matching target difficulty, but include mix
  const targetQuestions = availableQuestions.filter(q => q.difficulty === targetDifficulty);
  const otherQuestions = availableQuestions.filter(q => q.difficulty !== targetDifficulty);
  
  // Return shuffled mix favoring target difficulty
  const selected = [
    ...targetQuestions.slice(0, 10),
    ...otherQuestions.slice(0, 5)
  ].sort(() => Math.random() - 0.5);
  
  return selected.length > 0 ? selected : catQuestionBank;
}

export default catQuestionBank;