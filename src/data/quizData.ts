export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export const quizData: Record<string, Question[]> = {
  fundamentals: [
    {
      question: "A nurse is preparing to administer medications to a client. Which action should the nurse take first?",
      options: [
        "Check the medication administration record (MAR)",
        "Verify the client's identity using two identifiers",
        "Wash hands and put on gloves",
        "Explain the medication to the client"
      ],
      correctAnswer: 2,
      explanation: "Hand hygiene is the first and most important step in medication administration to prevent infection transmission. After washing hands, the nurse should verify client identity, check the MAR, and then explain the medication.",
      category: "Medication Administration"
    },
    {
      question: "Which vital sign change should the nurse report immediately to the healthcare provider?",
      options: [
        "Temperature of 98.6°F (37°C)",
        "Blood pressure of 88/50 mmHg in a client with a baseline of 120/80 mmHg",
        "Respiratory rate of 18 breaths/min",
        "Heart rate of 78 beats/min"
      ],
      correctAnswer: 1,
      explanation: "A significant drop in blood pressure (from 120/80 to 88/50) indicates potential shock or other serious conditions requiring immediate intervention. The other vital signs are within normal ranges.",
      category: "Vital Signs"
    },
    {
      question: "A client is at risk for developing pressure ulcers. Which nursing intervention is most effective?",
      options: [
        "Apply lotion to the skin twice daily",
        "Massage bony prominences regularly",
        "Reposition the client every 2 hours",
        "Keep the head of the bed elevated at 45 degrees"
      ],
      correctAnswer: 2,
      explanation: "Repositioning every 2 hours relieves pressure on bony prominences and is the most effective intervention for preventing pressure ulcers. Massaging bony prominences can cause tissue damage and should be avoided.",
      category: "Skin Integrity"
    },
    {
      question: "When documenting client care, which entry is most appropriate?",
      options: [
        "Client appears to be in pain",
        "Client reports pain level of 7/10 in right lower quadrant, grimacing noted",
        "Client is uncomfortable",
        "Client seems upset about something"
      ],
      correctAnswer: 1,
      explanation: "Documentation should be objective, specific, and measurable. Including the pain scale rating, location, and observable behavior provides clear, factual information.",
      category: "Documentation"
    },
    {
      question: "A nurse is caring for a client who has a latex allergy. Which food should the nurse remove from the client's meal tray?",
      options: [
        "Apple",
        "Banana",
        "Orange",
        "Grapes"
      ],
      correctAnswer: 1,
      explanation: "Bananas contain proteins similar to those found in latex and can cause cross-reactivity in clients with latex allergies. Other foods to avoid include avocados, kiwis, and chestnuts.",
      category: "Safety"
    },
    {
      question: "Which statement by a nursing student indicates understanding of standard precautions?",
      options: [
        "I only need to wear gloves when the client has an infection",
        "I should wear gloves when there is potential contact with blood or body fluids",
        "Hand hygiene is only necessary before client contact",
        "Masks are only required for airborne precautions"
      ],
      correctAnswer: 1,
      explanation: "Standard precautions require wearing gloves whenever there is potential contact with blood, body fluids, mucous membranes, or non-intact skin, regardless of the client's diagnosis.",
      category: "Infection Control"
    },
    {
      question: "A client is receiving oxygen therapy at 2 L/min via nasal cannula. Which observation indicates the therapy is effective?",
      options: [
        "Respiratory rate of 28 breaths/min",
        "Oxygen saturation of 95%",
        "Client reports feeling short of breath",
        "Nail beds appear cyanotic"
      ],
      correctAnswer: 1,
      explanation: "An oxygen saturation of 95% indicates adequate oxygenation. Normal oxygen saturation is 95-100%. The other options suggest continued respiratory distress.",
      category: "Oxygenation"
    },
    {
      question: "Which action by the nurse demonstrates proper body mechanics when moving a client?",
      options: [
        "Bending at the waist to reach the client",
        "Keeping feet close together for stability",
        "Holding the client away from the body",
        "Bending at the knees and keeping back straight"
      ],
      correctAnswer: 3,
      explanation: "Proper body mechanics involve bending at the knees, keeping the back straight, and holding objects close to the body. This prevents back injury and maintains balance.",
      category: "Safety"
    }
  ],
  pharmacology: [
    {
      question: "A nurse is preparing to administer digoxin to a client. Which assessment is the priority before administration?",
      options: [
        "Blood pressure",
        "Apical pulse",
        "Respiratory rate",
        "Temperature"
      ],
      correctAnswer: 1,
      explanation: "Digoxin affects heart rate and rhythm. The apical pulse should be checked for one full minute before administration. If the pulse is below 60 bpm, hold the medication and notify the provider.",
      category: "Cardiovascular"
    },
    {
      question: "A client is receiving heparin therapy. Which laboratory value should the nurse monitor?",
      options: [
        "Prothrombin time (PT)",
        "Activated partial thromboplastin time (aPTT)",
        "International normalized ratio (INR)",
        "Platelet count only"
      ],
      correctAnswer: 1,
      explanation: "aPTT is monitored for heparin therapy. PT and INR are monitored for warfarin therapy. Both medications also require monitoring of platelet count for heparin-induced thrombocytopenia.",
      category: "Anticoagulants"
    },
    {
      question: "A client taking warfarin should avoid eating large amounts of which food?",
      options: [
        "Bananas",
        "Spinach",
        "Oranges",
        "Chicken"
      ],
      correctAnswer: 1,
      explanation: "Spinach is high in vitamin K, which can decrease the effectiveness of warfarin. Clients should maintain consistent vitamin K intake rather than avoiding it completely.",
      category: "Anticoagulants"
    },
    {
      question: "Which symptom indicates a client may be experiencing lithium toxicity?",
      options: [
        "Dry mouth",
        "Fine hand tremors",
        "Coarse tremors and confusion",
        "Increased energy"
      ],
      correctAnswer: 2,
      explanation: "Coarse tremors, confusion, and severe diarrhea are signs of lithium toxicity. Fine tremors and dry mouth are common side effects. Therapeutic lithium levels are 0.6-1.2 mEq/L.",
      category: "Psychiatric Medications"
    },
    {
      question: "A client with type 1 diabetes is prescribed regular insulin and NPH insulin. In which order should these be drawn up?",
      options: [
        "NPH first, then regular insulin",
        "Regular insulin first, then NPH",
        "Either order is acceptable",
        "They should not be mixed"
      ],
      correctAnswer: 1,
      explanation: "Regular insulin (clear) should be drawn up first, followed by NPH insulin (cloudy). The mnemonic 'clear before cloudy' helps remember the correct order.",
      category: "Endocrine"
    },
    {
      question: "A client is prescribed morphine for pain. Which side effect should the nurse monitor for most closely?",
      options: [
        "Tachycardia",
        "Hypertension",
        "Respiratory depression",
        "Hyperactivity"
      ],
      correctAnswer: 2,
      explanation: "Respiratory depression is the most serious side effect of opioid medications. Monitor respiratory rate and depth, and have naloxone available as an antidote.",
      category: "Pain Management"
    },
    {
      question: "Which instruction should the nurse include when teaching a client about taking alendronate?",
      options: [
        "Take with food to reduce nausea",
        "Take at bedtime with a full glass of milk",
        "Take on an empty stomach with water and remain upright for 30 minutes",
        "Crush the tablet if difficult to swallow"
      ],
      correctAnswer: 2,
      explanation: "Alendronate should be taken on an empty stomach with plain water, and the client should remain upright for at least 30 minutes to prevent esophageal irritation.",
      category: "Musculoskeletal"
    },
    {
      question: "A client taking metformin should be instructed to report which symptom immediately?",
      options: [
        "Mild nausea",
        "Hyperglycemia",
        "Muscle pain and weakness",
        "Increased appetite"
      ],
      correctAnswer: 2,
      explanation: "Muscle pain and weakness may indicate lactic acidosis, a rare but serious complication of metformin. Clients should also avoid alcohol and contrast dyes while taking metformin.",
      category: "Endocrine"
    }
  ],
  "med-surg": [
    {
      question: "A client with heart failure is receiving furosemide. Which assessment finding indicates the medication is effective?",
      options: [
        "Increased peripheral edema",
        "Weight loss of 2 kg in 24 hours",
        "Blood pressure of 160/95 mmHg",
        "Decreased urine output"
      ],
      correctAnswer: 1,
      explanation: "Furosemide is a diuretic used to reduce fluid overload. Weight loss and decreased edema indicate the medication is working effectively. Monitor for hypokalemia as a side effect.",
      category: "Cardiovascular"
    },
    {
      question: "Which position is most appropriate for a client experiencing dyspnea?",
      options: [
        "Supine",
        "Trendelenburg",
        "High Fowler's",
        "Prone"
      ],
      correctAnswer: 2,
      explanation: "High Fowler's position (sitting upright at 60-90 degrees) promotes lung expansion and eases breathing. This position is best for clients with respiratory distress.",
      category: "Respiratory"
    },
    {
      question: "A client with diabetes mellitus has a blood glucose of 52 mg/dL. Which action should the nurse take first?",
      options: [
        "Administer insulin as prescribed",
        "Give 15 grams of simple carbohydrates",
        "Notify the healthcare provider",
        "Recheck blood glucose in 1 hour"
      ],
      correctAnswer: 1,
      explanation: "A blood glucose of 52 mg/dL indicates hypoglycemia. The immediate treatment is 15 grams of simple carbohydrates, followed by rechecking glucose in 15 minutes (15-15 rule).",
      category: "Endocrine"
    },
    {
      question: "Which assessment finding in a postoperative client should the nurse report immediately?",
      options: [
        "Pain level of 5/10 at incision site",
        "Temperature of 99.2°F (37.3°C)",
        "Sudden onset of chest pain and dyspnea",
        "Drowsiness after receiving pain medication"
      ],
      correctAnswer: 2,
      explanation: "Sudden chest pain and dyspnea may indicate pulmonary embolism, a life-threatening complication. This requires immediate intervention.",
      category: "Postoperative Care"
    },
    {
      question: "A client with chronic kidney disease should limit intake of which nutrient?",
      options: [
        "Carbohydrates",
        "Potassium",
        "Vitamin C",
        "Fiber"
      ],
      correctAnswer: 1,
      explanation: "Clients with chronic kidney disease should limit potassium intake because the kidneys cannot adequately excrete it, leading to hyperkalemia. Sodium and phosphorus should also be restricted.",
      category: "Renal"
    },
    {
      question: "Which intervention is priority for a client experiencing anaphylaxis?",
      options: [
        "Administer epinephrine",
        "Establish IV access",
        "Administer antihistamine",
        "Apply oxygen via nasal cannula"
      ],
      correctAnswer: 0,
      explanation: "Epinephrine is the first-line treatment for anaphylaxis and should be administered immediately. It reverses airway constriction and hypotension.",
      category: "Emergency Care"
    },
    {
      question: "A client with COPD should be taught to use pursed-lip breathing to achieve which outcome?",
      options: [
        "Increase oxygen intake",
        "Prevent airway collapse during expiration",
        "Strengthen respiratory muscles",
        "Clear secretions from airways"
      ],
      correctAnswer: 1,
      explanation: "Pursed-lip breathing creates back-pressure that keeps airways open during expiration, preventing air trapping in clients with COPD.",
      category: "Respiratory"
    },
    {
      question: "Which laboratory value indicates a client with liver cirrhosis is at risk for bleeding?",
      options: [
        "Elevated bilirubin",
        "Decreased albumin",
        "Prolonged prothrombin time (PT)",
        "Elevated ammonia"
      ],
      correctAnswer: 2,
      explanation: "The liver produces clotting factors. In cirrhosis, decreased production leads to prolonged PT and increased bleeding risk. Monitor for signs of bleeding.",
      category: "Gastrointestinal"
    }
  ],
  pediatrics: [
    {
      question: "At which age should a child be able to walk independently?",
      options: [
        "9 months",
        "12-15 months",
        "18 months",
        "24 months"
      ],
      correctAnswer: 1,
      explanation: "Most children walk independently between 12-15 months. Developmental milestones have a range of normal, but significant delays should be evaluated.",
      category: "Growth & Development"
    },
    {
      question: "Which toy is most appropriate for an 8-month-old infant?",
      options: [
        "Puzzle with small pieces",
        "Soft blocks",
        "Toy with small removable parts",
        "Bicycle"
      ],
      correctAnswer: 1,
      explanation: "Soft blocks are safe and developmentally appropriate for an 8-month-old. Avoid toys with small parts that could be choking hazards.",
      category: "Safety"
    },
    {
      question: "A child with croup would most likely present with which symptom?",
      options: [
        "Productive cough",
        "Barking cough and stridor",
        "Wheezing and shortness of breath",
        "High fever and rash"
      ],
      correctAnswer: 1,
      explanation: "Croup is characterized by a distinctive barking cough and inspiratory stridor due to inflammation of the upper airway. Treatment includes cool mist and corticosteroids.",
      category: "Respiratory"
    },
    {
      question: "Which statement by a parent indicates understanding of how to administer ear drops to a 4-year-old?",
      options: [
        "I'll pull the ear up and back",
        "I'll pull the ear down and back",
        "I'll pull the ear straight out",
        "I'll pull the ear forward"
      ],
      correctAnswer: 0,
      explanation: "For children over 3 years old, pull the ear up and back to straighten the ear canal. For infants and young children under 3, pull down and back.",
      category: "Medication Administration"
    },
    {
      question: "What is the appropriate first solid food to introduce to an infant?",
      options: [
        "Eggs",
        "Iron-fortified cereal",
        "Honey",
        "Cow's milk"
      ],
      correctAnswer: 1,
      explanation: "Iron-fortified cereal is typically the first solid food introduced around 6 months. Honey should be avoided before 1 year due to botulism risk. Cow's milk should be avoided until 1 year.",
      category: "Nutrition"
    },
    {
      question: "A child with epiglottitis should be placed in which position?",
      options: [
        "Supine",
        "Side-lying",
        "Upright and leaning forward",
        "Trendelenburg"
      ],
      correctAnswer: 2,
      explanation: "Children with epiglottitis should sit upright and lean forward to maintain a patent airway. Do not examine the throat or force the child to lie down as this can cause complete airway obstruction.",
      category: "Emergency Care"
    },
    {
      question: "Which immunization should NOT be given to a child with a severe egg allergy?",
      options: [
        "MMR",
        "DTaP",
        "Hepatitis B",
        "Polio"
      ],
      correctAnswer: 0,
      explanation: "MMR vaccine is grown in chick embryo cells and may contain egg protein, though current guidelines suggest it can be given with precautions. Influenza vaccine is the main concern for egg allergies.",
      category: "Immunizations"
    },
    {
      question: "What is the priority nursing intervention for a child having a seizure?",
      options: [
        "Restrain the child's movements",
        "Insert a tongue blade",
        "Position the child on their side",
        "Give prescribed anticonvulsant medication"
      ],
      correctAnswer: 2,
      explanation: "During a seizure, position the child on their side to maintain airway patency and prevent aspiration. Never restrain or insert anything into the mouth during a seizure.",
      category: "Neurological"
    }
  ],
  "mental-health": [
    {
      question: "A client with depression states, 'I don't want to live anymore.' What is the nurse's priority response?",
      options: [
        "Tell me more about these feelings",
        "Things will get better soon",
        "Have you thought about how you would harm yourself?",
        "You shouldn't feel that way"
      ],
      correctAnswer: 2,
      explanation: "Direct assessment of suicide risk is essential. Ask specifically about plans, means, and intent. This demonstrates that the nurse takes the client seriously and can implement appropriate safety measures.",
      category: "Crisis Intervention"
    },
    {
      question: "Which therapeutic communication technique is the nurse using when stating, 'You seem upset'?",
      options: [
        "Clarifying",
        "Reflecting",
        "Making observations",
        "Restating"
      ],
      correctAnswer: 2,
      explanation: "Making observations involves verbalizing what is observed or perceived, which encourages the client to communicate without requiring them to respond to questions.",
      category: "Communication"
    },
    {
      question: "A client with bipolar disorder in the manic phase requires which intervention?",
      options: [
        "Encourage group activities",
        "Provide a stimulating environment",
        "Reduce environmental stimuli",
        "Allow unlimited visitors"
      ],
      correctAnswer: 2,
      explanation: "Clients in a manic phase are easily overstimulated. Reducing environmental stimuli helps prevent escalation. Provide a calm, structured environment.",
      category: "Mood Disorders"
    },
    {
      question: "Which behavior indicates a client with schizophrenia is experiencing a positive symptom?",
      options: [
        "Social withdrawal",
        "Flat affect",
        "Hallucinations",
        "Lack of motivation"
      ],
      correctAnswer: 2,
      explanation: "Positive symptoms are additions to normal behavior, such as hallucinations and delusions. Negative symptoms are absences of normal behavior, like flat affect and social withdrawal.",
      category: "Psychotic Disorders"
    },
    {
      question: "A client taking an SSRI should be monitored for which serious adverse effect?",
      options: [
        "Hypertensive crisis",
        "Serotonin syndrome",
        "Tardive dyskinesia",
        "Neuroleptic malignant syndrome"
      ],
      correctAnswer: 1,
      explanation: "Serotonin syndrome can occur with SSRIs, especially when combined with other serotonergic medications. Signs include agitation, confusion, rapid heart rate, and hyperthermia.",
      category: "Psychopharmacology"
    },
    {
      question: "Which intervention is appropriate for a client with obsessive-compulsive disorder?",
      options: [
        "Prevent the client from performing rituals",
        "Allow extra time for ritual completion",
        "Ridicule the behavior to promote insight",
        "Ignore the ritualistic behavior"
      ],
      correctAnswer: 1,
      explanation: "Initially allow time for rituals while working on gradually reducing them. Abruptly stopping rituals increases anxiety. Use cognitive-behavioral therapy for long-term management.",
      category: "Anxiety Disorders"
    },
    {
      question: "A client with alcohol use disorder is at risk for which withdrawal complication?",
      options: [
        "Hyperglycemia",
        "Delirium tremens",
        "Respiratory depression",
        "Bradycardia"
      ],
      correctAnswer: 1,
      explanation: "Delirium tremens is a life-threatening complication of alcohol withdrawal characterized by confusion, hallucinations, and autonomic instability. It typically occurs 2-3 days after last drink.",
      category: "Substance Use"
    },
    {
      question: "Which statement indicates a client understands their prescription for benzodiazepines?",
      options: [
        "I can drink alcohol in moderation",
        "I should stop taking this medication abruptly if side effects occur",
        "This medication can be habit-forming",
        "I can share this medication with family members who are anxious"
      ],
      correctAnswer: 2,
      explanation: "Benzodiazepines have a high potential for dependence and should not be stopped abruptly. Avoid alcohol, and never share prescription medications.",
      category: "Psychopharmacology"
    }
  ],
  maternal: [
    {
      question: "Which finding in a pregnant client requires immediate intervention?",
      options: [
        "Blood pressure 138/88 mmHg at 32 weeks",
        "Severe headache with visual disturbances at 36 weeks",
        "Occasional Braxton Hicks contractions at 30 weeks",
        "Mild ankle edema at 28 weeks"
      ],
      correctAnswer: 1,
      explanation: "Severe headache with visual disturbances suggests preeclampsia with severe features, requiring immediate intervention. This indicates potential seizure risk (eclampsia).",
      category: "High-Risk Pregnancy"
    },
    {
      question: "When should a pregnant client feel fetal movement?",
      options: [
        "8-10 weeks",
        "12-14 weeks",
        "16-20 weeks",
        "24-26 weeks"
      ],
      correctAnswer: 2,
      explanation: "Quickening (first fetal movement) is typically felt between 16-20 weeks for first-time mothers and earlier (around 14-16 weeks) for women who have been pregnant before.",
      category: "Prenatal Care"
    },
    {
      question: "Which laboratory value is expected in a newborn 24 hours after birth?",
      options: [
        "Glucose 30 mg/dL",
        "Bilirubin 2 mg/dL",
        "Temperature 96.5°F (35.8°C)",
        "Respiratory rate 70 breaths/min"
      ],
      correctAnswer: 1,
      explanation: "A bilirubin level of 2 mg/dL is normal for a newborn at 24 hours. Glucose below 40-45 mg/dL indicates hypoglycemia. Normal newborn respiratory rate is 30-60 breaths/min.",
      category: "Newborn Care"
    },
    {
      question: "A client at 38 weeks gestation reports regular contractions every 5 minutes lasting 60 seconds. What phase of labor is this?",
      options: [
        "Latent phase",
        "Active phase",
        "Transition phase",
        "Second stage"
      ],
      correctAnswer: 1,
      explanation: "Active phase of first stage labor is characterized by contractions every 3-5 minutes lasting 45-60 seconds, with cervical dilation of 6-8 cm.",
      category: "Labor & Delivery"
    },
    {
      question: "Which intervention prevents heat loss in a newborn immediately after birth?",
      options: [
        "Place near an open window for fresh air",
        "Give a bath within 30 minutes",
        "Dry thoroughly and place skin-to-skin with mother",
        "Place in an open crib"
      ],
      correctAnswer: 2,
      explanation: "Drying the newborn and placing skin-to-skin prevents heat loss through evaporation and conduction. Newborns have difficulty regulating temperature and lose heat rapidly.",
      category: "Newborn Care"
    },
    {
      question: "Which finding in a postpartum client indicates a complication?",
      options: [
        "Lochia rubra on day 2",
        "Fundus at umbilicus on day 1",
        "Saturating one pad per hour",
        "Afterpains during breastfeeding"
      ],
      correctAnswer: 2,
      explanation: "Saturating one pad per hour indicates postpartum hemorrhage and requires immediate intervention. Normal postpartum bleeding should not exceed one saturated pad in 2-3 hours.",
      category: "Postpartum Care"
    },
    {
      question: "Which instruction should the nurse give to a breastfeeding mother?",
      options: [
        "Limit feeding to 5 minutes per breast",
        "Feed on a strict 4-hour schedule",
        "Allow the baby to nurse on demand",
        "Supplement with formula after each feeding"
      ],
      correctAnswer: 2,
      explanation: "Breastfeeding should be on demand (8-12 times per 24 hours) to establish milk supply. Babies should nurse until satisfied, typically 10-20 minutes per breast.",
      category: "Breastfeeding"
    },
    {
      question: "A positive Coombs test in a newborn indicates which condition?",
      options: [
        "Hypoglycemia",
        "Hemolytic disease",
        "Respiratory distress",
        "Infection"
      ],
      correctAnswer: 1,
      explanation: "A positive Coombs test indicates hemolytic disease caused by blood incompatibility (Rh or ABO). Monitor for jaundice and anemia.",
      category: "Newborn Care"
    }
  ]
};
