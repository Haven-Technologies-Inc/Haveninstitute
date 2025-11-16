export interface Flashcard {
  term: string;
  definition: string;
  category: string;
  example?: string;
}

export const flashcardData: Record<string, Flashcard[]> = {
  fundamentals: [
    {
      term: "Maslow's Hierarchy of Needs",
      definition: "A theory of human motivation that prioritizes needs from basic physiological needs to self-actualization. In nursing, physiological and safety needs must be met before higher-level needs.",
      category: "Nursing Theory",
      example: "Airway and breathing take priority over psychosocial needs."
    },
    {
      term: "ABCs Priority Setting",
      definition: "Airway, Breathing, Circulation - the priority order for assessing and intervening in emergency situations.",
      category: "Emergency Care",
      example: "A patient with an obstructed airway is treated before addressing bleeding."
    },
    {
      term: "Standard Precautions",
      definition: "Infection control practices used for all patients regardless of diagnosis, including hand hygiene, PPE use, and safe injection practices.",
      category: "Infection Control",
      example: "Wearing gloves when handling any body fluids, even if the patient has no known infection."
    },
    {
      term: "Informed Consent",
      definition: "A patient's voluntary agreement to a treatment or procedure after receiving adequate information about risks, benefits, and alternatives.",
      category: "Legal",
      example: "A patient signs a consent form after the surgeon explains the risks and benefits of surgery."
    },
    {
      term: "HIPAA",
      definition: "Health Insurance Portability and Accountability Act - federal law protecting patient privacy and confidentiality of health information.",
      category: "Legal",
      example: "Not discussing patient information in public areas or with unauthorized individuals."
    },
    {
      term: "Five Rights of Medication Administration",
      definition: "Right patient, right medication, right dose, right route, right time - essential checks before giving any medication.",
      category: "Medication Safety",
      example: "Checking two patient identifiers before administering medication."
    },
    {
      term: "Therapeutic Communication",
      definition: "Communication techniques that promote patient expression and understanding, including active listening, open-ended questions, and reflection.",
      category: "Communication",
      example: "Asking 'How are you feeling about your diagnosis?' instead of 'Are you okay?'"
    },
    {
      term: "SBAR",
      definition: "Situation, Background, Assessment, Recommendation - a standardized communication tool for reporting patient information.",
      category: "Communication",
      example: "When calling a physician: 'I'm calling about Mr. Smith in room 204 who is experiencing chest pain...'"
    },
    {
      term: "Nursing Process",
      definition: "A systematic approach to patient care: Assessment, Diagnosis, Planning, Implementation, Evaluation (ADPIE).",
      category: "Nursing Theory",
      example: "Assessing pain level before administering analgesic, then evaluating effectiveness after administration."
    },
    {
      term: "Normal Vital Signs (Adult)",
      definition: "Temperature: 97.0-99.0°F, Heart Rate: 60-100 bpm, Respiratory Rate: 12-20/min, Blood Pressure: <120/<80 mmHg, SpO2: 95-100%",
      category: "Assessment",
      example: "A blood pressure of 88/50 is below normal and should be reported."
    }
  ],
  pharmacology: [
    {
      term: "Antidote for Opioid Overdose",
      definition: "Naloxone (Narcan) - reverses respiratory depression and CNS depression caused by opioid medications.",
      category: "Emergency Medications",
      example: "Administered to a patient with respiratory rate of 6/min after receiving morphine."
    },
    {
      term: "Antidote for Warfarin",
      definition: "Vitamin K (phytonadione) - reverses anticoagulant effects of warfarin. For immediate reversal, use prothrombin complex concentrate or fresh frozen plasma.",
      category: "Anticoagulants",
      example: "Given to a patient on warfarin with INR of 8 and active bleeding."
    },
    {
      term: "Antidote for Heparin",
      definition: "Protamine sulfate - neutralizes the anticoagulant effects of heparin.",
      category: "Anticoagulants",
      example: "Administered to reverse heparin after cardiac surgery."
    },
    {
      term: "Digoxin Toxicity Signs",
      definition: "Nausea, vomiting, vision changes (yellow-green halos), bradycardia, dysrhythmias. Therapeutic level: 0.5-2.0 ng/mL.",
      category: "Cardiovascular",
      example: "Patient reports seeing yellow halos and has heart rate of 48 bpm."
    },
    {
      term: "ACE Inhibitor Side Effects",
      definition: "Dry cough, hyperkalemia, angioedema, hypotension. Medications ending in '-pril' (lisinopril, enalapril).",
      category: "Cardiovascular",
      example: "Patient taking lisinopril develops persistent dry cough."
    },
    {
      term: "Beta Blocker Considerations",
      definition: "Check apical pulse before administration; hold if HR <60 bpm. Used for hypertension, heart failure, and dysrhythmias. Medications ending in '-olol'.",
      category: "Cardiovascular",
      example: "Metoprolol held when patient's heart rate is 56 bpm."
    },
    {
      term: "Insulin Types",
      definition: "Rapid (Lispro, Aspart): onset 15 min; Short (Regular): onset 30 min; Intermediate (NPH): onset 2-4 hr; Long (Glargine): onset 1-2 hr, no peak.",
      category: "Endocrine",
      example: "Regular insulin given 30 minutes before meals; Glargine given once daily at bedtime."
    },
    {
      term: "Aminoglycoside Monitoring",
      definition: "Monitor kidney function (creatinine) and hearing (ototoxicity). Examples: gentamicin, tobramycin. Check peak and trough levels.",
      category: "Antibiotics",
      example: "Gentamicin therapy requires monitoring BUN, creatinine, and auditory function."
    },
    {
      term: "Statins",
      definition: "HMG-CoA reductase inhibitors for cholesterol reduction. Monitor liver enzymes. Take at bedtime. Report muscle pain (rhabdomyolysis risk).",
      category: "Cardiovascular",
      example: "Atorvastatin taken at bedtime; patient instructed to report muscle weakness or pain."
    },
    {
      term: "MAOI Dietary Restrictions",
      definition: "Avoid tyramine-rich foods (aged cheese, wine, processed meats) to prevent hypertensive crisis. Examples: phenelzine, tranylcypromine.",
      category: "Psychiatric",
      example: "Patient on phenelzine avoids aged cheese and wine to prevent dangerous blood pressure spike."
    }
  ],
  "med-surg": [
    {
      term: "Pulmonary Embolism Signs",
      definition: "Sudden onset dyspnea, chest pain, tachypnea, tachycardia, anxiety, hypoxemia. May have cough with blood-tinged sputum.",
      category: "Respiratory",
      example: "Postoperative patient suddenly reports chest pain and difficulty breathing - suspect PE."
    },
    {
      term: "Diabetic Ketoacidosis (DKA)",
      definition: "Hyperglycemia, dehydration, metabolic acidosis. Signs: fruity breath odor, Kussmaul respirations, altered mental status. Common in Type 1 diabetes.",
      category: "Endocrine",
      example: "Blood glucose >250 mg/dL, pH <7.3, positive ketones, fruity breath odor."
    },
    {
      term: "Hyperosmolar Hyperglycemic State (HHS)",
      definition: "Severe hyperglycemia (>600 mg/dL) without ketosis, severe dehydration, altered mental status. Common in Type 2 diabetes.",
      category: "Endocrine",
      example: "Elderly patient with blood glucose 800 mg/dL, confused, severely dehydrated but no ketones."
    },
    {
      term: "Myocardial Infarction Signs",
      definition: "Chest pain/pressure radiating to jaw or left arm, dyspnea, diaphoresis, nausea. Women and elderly may have atypical symptoms.",
      category: "Cardiovascular",
      example: "Patient reports crushing chest pain with radiation to left arm and jaw, diaphoretic."
    },
    {
      term: "Cushing's Triad",
      definition: "Late signs of increased intracranial pressure: bradycardia, widening pulse pressure, irregular respirations (Cheyne-Stokes).",
      category: "Neurological",
      example: "Patient with head injury develops HR 52, BP 180/60, irregular breathing pattern."
    },
    {
      term: "Compartment Syndrome",
      definition: "Increased pressure in muscle compartment causing decreased perfusion. 6 P's: Pain (out of proportion), Pressure, Pallor, Paresthesia, Pulselessness, Paralysis.",
      category: "Orthopedic",
      example: "Patient with leg cast reports severe pain unrelieved by medication and numbness in toes."
    },
    {
      term: "COPD Management",
      definition: "Bronchodilators, corticosteroids, oxygen therapy (low flow 1-2L to maintain SpO2 88-92%), pursed-lip breathing, position upright.",
      category: "Respiratory",
      example: "COPD patient on 2L O2 via nasal cannula to avoid suppressing hypoxic drive."
    },
    {
      term: "Heart Failure - Right vs Left",
      definition: "Left: pulmonary congestion, dyspnea, crackles. Right: systemic congestion, peripheral edema, JVD, hepatomegaly.",
      category: "Cardiovascular",
      example: "Right-sided HF: patient has swollen ankles and distended neck veins."
    },
    {
      term: "Stroke Assessment - FAST",
      definition: "Face drooping, Arm weakness, Speech difficulty, Time to call 911. Rapid recognition and treatment improves outcomes.",
      category: "Neurological",
      example: "Patient has facial droop on right side, cannot raise right arm, slurred speech."
    },
    {
      term: "Peritonitis Signs",
      definition: "Severe abdominal pain, rigid abdomen (board-like), rebound tenderness, fever, nausea/vomiting. Medical emergency.",
      category: "Gastrointestinal",
      example: "Patient with ruptured appendix develops rigid abdomen and severe pain with palpation."
    }
  ],
  pediatrics: [
    {
      term: "Developmental Milestones - 2 months",
      definition: "Social smile, coos, tracks objects past midline, lifts head 45 degrees when prone.",
      category: "Growth & Development",
      example: "Infant smiles responsively at parents and follows toy with eyes."
    },
    {
      term: "Developmental Milestones - 6 months",
      definition: "Sits with support, rolls both ways, babbles, transfers objects hand to hand, stranger anxiety begins.",
      category: "Growth & Development",
      example: "Baby sits in tripod position and says 'bababa' sounds."
    },
    {
      term: "Developmental Milestones - 12 months",
      definition: "Walks with assistance, says 1-2 words, plays pat-a-cake, has pincer grasp, separation anxiety peaks.",
      category: "Growth & Development",
      example: "Toddler says 'mama' and 'dada' specifically, cruises furniture."
    },
    {
      term: "Epiglottitis vs Croup",
      definition: "Epiglottitis: sudden onset, high fever, drooling, tripod position, 'hot potato' voice. Croup: gradual onset, barking cough, stridor, low-grade fever.",
      category: "Respiratory",
      example: "Child with epiglottitis sits upright, leans forward, drools, appears toxic."
    },
    {
      term: "Kawasaki Disease",
      definition: "Fever >5 days plus 4 of 5: conjunctivitis, strawberry tongue, rash, swollen hands/feet, cervical lymphadenopathy. Risk for coronary aneurysms.",
      category: "Cardiovascular",
      example: "Child with high fever for 6 days, red eyes, cracked lips, rash, swollen red hands."
    },
    {
      term: "Autism Spectrum Disorder Red Flags",
      definition: "Lack of eye contact, delayed speech, repetitive behaviors, difficulty with social interactions, resistance to change.",
      category: "Developmental",
      example: "18-month-old doesn't respond to name, avoids eye contact, lines up toys repeatedly."
    },
    {
      term: "Lead Poisoning",
      definition: "Exposure from old paint, contaminated water. Signs: developmental delays, irritability, anemia. Screen at 1 and 2 years. Treatment: chelation therapy.",
      category: "Environmental",
      example: "Toddler living in old house has elevated lead level, developmental regression."
    },
    {
      term: "Immunization Schedule Highlights",
      definition: "Birth: Hep B. 2 months: DTaP, IPV, Hib, PCV13, RV. 6 months: Influenza (yearly). 12 months: MMR, Varicella, Hep A.",
      category: "Preventive Care",
      example: "2-month well-child visit includes DTaP, IPV, Hib, PCV13, and Rotavirus vaccines."
    },
    {
      term: "Hydrocephalus",
      definition: "Excess CSF in brain ventricles. Infants: increasing head circumference, bulging fontanel, sunset eyes, vomiting. Treatment: ventriculoperitoneal shunt.",
      category: "Neurological",
      example: "Infant with rapidly increasing head circumference and bulging anterior fontanel."
    },
    {
      term: "Wilms Tumor",
      definition: "Kidney tumor in children. Presents with abdominal mass, hematuria, hypertension. NEVER palpate abdomen (risk of rupture).",
      category: "Oncology",
      example: "Parent notices child's abdomen looks larger; firm mass palpated - do not palpate further."
    }
  ],
  "mental-health": [
    {
      term: "Suicide Risk Assessment",
      definition: "Ask directly about suicidal thoughts, plan, means, and intent. Prior attempts and access to lethal means increase risk.",
      category: "Crisis Intervention",
      example: "'Are you thinking about harming yourself? Do you have a plan for how you would do it?'"
    },
    {
      term: "Defense Mechanisms - Projection",
      definition: "Attributing one's own unacceptable thoughts or feelings to another person.",
      category: "Ego Defense",
      example: "A person who is angry at their spouse says, 'My spouse is always angry at me.'"
    },
    {
      term: "Defense Mechanisms - Denial",
      definition: "Refusing to acknowledge reality or facts, unconsciously blocking awareness of painful thoughts or feelings.",
      category: "Ego Defense",
      example: "Patient with alcohol addiction says, 'I don't have a drinking problem.'"
    },
    {
      term: "Therapeutic Milieu",
      definition: "A structured environment that promotes safety, respect, and therapeutic interactions. Includes consistent routine, clear boundaries, and therapeutic activities.",
      category: "Treatment Environment",
      example: "Psychiatric unit with daily schedule, group therapy, and safe, structured activities."
    },
    {
      term: "Bipolar Disorder - Mania Signs",
      definition: "Elevated mood, decreased need for sleep, racing thoughts, pressured speech, impulsivity, grandiosity. DIG FAST mnemonic.",
      category: "Mood Disorders",
      example: "Patient hasn't slept in 3 days, talks rapidly, started multiple projects, impulsive spending."
    },
    {
      term: "Schizophrenia - Positive Symptoms",
      definition: "Hallucinations, delusions, disorganized speech and behavior - additions to normal function.",
      category: "Psychotic Disorders",
      example: "Patient hears voices telling them what to do (auditory hallucinations)."
    },
    {
      term: "Schizophrenia - Negative Symptoms",
      definition: "Flat affect, alogia (poverty of speech), avolition (lack of motivation), anhedonia - absence of normal function.",
      category: "Psychotic Disorders",
      example: "Patient shows no facial expression, speaks minimally, lacks motivation for self-care."
    },
    {
      term: "Lithium Therapeutic Range",
      definition: "0.6-1.2 mEq/L for maintenance. Toxic >1.5 mEq/L. Monitor renal function and thyroid. Ensure adequate sodium and fluid intake.",
      category: "Psychopharmacology",
      example: "Patient on lithium needs regular blood levels, thyroid function tests, and renal function tests."
    },
    {
      term: "Serotonin Syndrome",
      definition: "Life-threatening reaction from excess serotonin. Signs: agitation, confusion, rapid HR, hyperthermia, muscle rigidity, tremor.",
      category: "Medication Adverse Effects",
      example: "Patient on SSRI and tramadol develops confusion, fever, muscle rigidity."
    },
    {
      term: "Cognitive Behavioral Therapy (CBT)",
      definition: "Therapy focusing on identifying and changing negative thought patterns and behaviors. Evidence-based for anxiety and depression.",
      category: "Treatment Modalities",
      example: "Teaching patient to challenge automatic negative thoughts with evidence."
    }
  ],
  maternal: [
    {
      term: "Trimesters of Pregnancy",
      definition: "First: weeks 1-13 (organogenesis, major organs form). Second: weeks 14-26 (fetal movement felt). Third: weeks 27-40 (rapid growth, preparation for birth).",
      category: "Prenatal",
      example: "Morning sickness common in first trimester; fundus at umbilicus at 20 weeks (second trimester)."
    },
    {
      term: "Preeclampsia",
      definition: "Hypertension (≥140/90) after 20 weeks with proteinuria or end-organ dysfunction. Severe features: BP ≥160/110, headache, visual changes, RUQ pain.",
      category: "Complications",
      example: "Patient at 34 weeks with BP 156/102, severe headache, and proteinuria."
    },
    {
      term: "HELLP Syndrome",
      definition: "Variant of severe preeclampsia: Hemolysis, Elevated Liver enzymes, Low Platelets. Medical emergency requiring delivery.",
      category: "Complications",
      example: "Pregnant patient with RUQ pain, elevated AST/ALT, platelet count 90,000."
    },
    {
      term: "Leopold's Maneuvers",
      definition: "Four-step abdominal palpation to determine fetal position, presentation, and engagement. Performed in third trimester.",
      category: "Assessment",
      example: "Palpating fundus to identify fetal part (head or buttocks), then sides to locate back."
    },
    {
      term: "Stages of Labor",
      definition: "First stage: onset of labor to full dilation (10 cm). Second stage: full dilation to delivery of baby. Third stage: delivery of baby to delivery of placenta. Fourth stage: first 2 hours postpartum.",
      category: "Labor",
      example: "Active labor is 6-8 cm dilation, contractions every 3-5 minutes."
    },
    {
      term: "Lochia Progression",
      definition: "Rubra (red, days 1-3), Serosa (pink/brown, days 4-10), Alba (white/yellow, days 11-28). Should not have foul odor or large clots.",
      category: "Postpartum",
      example: "Day 5 postpartum with pink-brown lochia serosa is normal."
    },
    {
      term: "Postpartum Hemorrhage",
      definition: "Blood loss >500 mL vaginal or >1000 mL cesarean. 4 T's: Tone (uterine atony), Trauma, Tissue (retained placenta), Thrombin (coagulopathy).",
      category: "Complications",
      example: "Boggy uterus with heavy bleeding - massage fundus and administer oxytocin."
    },
    {
      term: "Apgar Score",
      definition: "Assessment at 1 and 5 minutes: Appearance, Pulse, Grimace, Activity, Respirations. Each 0-2 points. 7-10 = good condition.",
      category: "Newborn",
      example: "Newborn with good cry, pink body with blue extremities, HR 140, active movement = 8-9."
    },
    {
      term: "Newborn Vital Signs",
      definition: "HR: 110-160 bpm (awake), RR: 30-60/min, Temp: 97.7-99.5°F (axillary), BP: 60-80/40-45 mmHg.",
      category: "Newborn",
      example: "Newborn with HR 150, RR 45, temp 98.2°F - all within normal limits."
    },
    {
      term: "Breast Engorgement Management",
      definition: "Usually occurs days 3-5 postpartum. Manage with frequent feeding, warm compresses before feeding, cold compresses after, and proper support.",
      category: "Breastfeeding",
      example: "Day 4 postpartum with firm, painful breasts - encourage frequent feeding and warm compresses."
    }
  ]
};
