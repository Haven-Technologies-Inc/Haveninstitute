/**
 * Question Seeder - Sample NCLEX questions with IRT parameters
 * Run with: npx ts-node src/database/seeders/questions.seeder.ts
 */

import { Question, NCLEXCategory } from '../../models/Question';
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

// Sample NCLEX-style questions with IRT parameters
const sampleQuestions = [
  // Safe and Effective Care Environment
  {
    text: "A nurse is caring for a client with a nasogastric tube connected to low intermittent suction. Which of the following findings should the nurse report to the provider immediately?",
    options: [
      { id: "a", text: "Green-tinged drainage" },
      { id: "b", text: "125 mL output in 8 hours" },
      { id: "c", text: "Coffee-ground drainage" },
      { id: "d", text: "Client reports mild nausea" }
    ],
    correctAnswers: ["c"],
    explanation: "Coffee-ground drainage indicates old blood in the stomach and could indicate GI bleeding, which requires immediate provider notification. Green-tinged drainage is normal, 125 mL is adequate output, and mild nausea is expected.",
    category: "safe_effective_care" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "analyze",
    irtDiscrimination: 1.2,
    irtDifficulty: 0.5,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["gastrointestinal", "assessment", "prioritization"]
  },
  {
    text: "A nurse is preparing to administer medications. Which of the following actions demonstrates proper medication safety?",
    options: [
      { id: "a", text: "Checking the medication against the MAR once" },
      { id: "b", text: "Verifying the patient's identity using name and date of birth" },
      { id: "c", text: "Administering a medication labeled by another nurse" },
      { id: "d", text: "Crushing an extended-release tablet for easier swallowing" }
    ],
    correctAnswers: ["b"],
    explanation: "Using two patient identifiers (name and DOB) is a critical safety step. Medications should be checked three times, never administered if labeled by another nurse, and extended-release formulations should never be crushed.",
    category: "safe_effective_care" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "apply",
    irtDiscrimination: 1.4,
    irtDifficulty: -0.5,
    irtGuessing: 0.25,
    difficulty: "easy",
    tags: ["medication safety", "patient identification", "rights of medication"]
  },
  // Health Promotion and Maintenance
  {
    text: "A nurse is teaching a client about colorectal cancer screening. At what age should the nurse recommend the client begin screening with a colonoscopy if they have no risk factors?",
    options: [
      { id: "a", text: "40 years" },
      { id: "b", text: "45 years" },
      { id: "c", text: "50 years" },
      { id: "d", text: "55 years" }
    ],
    correctAnswers: ["b"],
    explanation: "Current guidelines recommend colorectal cancer screening beginning at age 45 for individuals at average risk. This was updated from the previous recommendation of 50 years.",
    category: "health_promotion" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "remember",
    irtDiscrimination: 1.0,
    irtDifficulty: 0.0,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["cancer screening", "health promotion", "preventive care"]
  },
  {
    text: "Which of the following vaccines should a nurse recommend for a healthy 65-year-old client? (Select all that apply)",
    options: [
      { id: "a", text: "Pneumococcal vaccine" },
      { id: "b", text: "Influenza vaccine" },
      { id: "c", text: "Shingles (herpes zoster) vaccine" },
      { id: "d", text: "Tetanus-diphtheria booster" },
      { id: "e", text: "HPV vaccine" }
    ],
    correctAnswers: ["a", "b", "c", "d"],
    explanation: "Adults 65 and older should receive pneumococcal vaccine, annual influenza vaccine, shingles vaccine (recommended at 50+), and Td booster every 10 years. HPV vaccine is not recommended for adults over 45.",
    category: "health_promotion" as NCLEXCategory,
    questionType: "select_all",
    bloomLevel: "apply",
    irtDiscrimination: 1.5,
    irtDifficulty: 0.8,
    irtGuessing: 0.1,
    difficulty: "hard",
    tags: ["immunizations", "geriatric", "preventive care"]
  },
  // Psychosocial Integrity
  {
    text: "A client who recently lost their spouse states, 'I don't know how to go on without them.' Which response by the nurse is most therapeutic?",
    options: [
      { id: "a", text: "\"Time heals all wounds. You'll feel better soon.\"" },
      { id: "b", text: "\"Tell me more about what you're experiencing.\"" },
      { id: "c", text: "\"Have you thought about joining a support group?\"" },
      { id: "d", text: "\"At least they're no longer suffering.\"" }
    ],
    correctAnswers: ["b"],
    explanation: "Asking the client to share more demonstrates active listening and allows the nurse to better understand the client's needs. Clichés, offering solutions, and minimizing feelings are not therapeutic.",
    category: "psychosocial" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "analyze",
    irtDiscrimination: 1.3,
    irtDifficulty: 0.2,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["therapeutic communication", "grief", "mental health"]
  },
  {
    text: "A nurse is assessing a client for signs of depression. Which findings should the nurse expect? (Select all that apply)",
    options: [
      { id: "a", text: "Increased energy levels" },
      { id: "b", text: "Changes in sleep patterns" },
      { id: "c", text: "Loss of interest in activities" },
      { id: "d", text: "Difficulty concentrating" },
      { id: "e", text: "Elevated mood" }
    ],
    correctAnswers: ["b", "c", "d"],
    explanation: "Signs of depression include sleep disturbances, anhedonia (loss of interest), and difficulty concentrating. Increased energy and elevated mood are not associated with depression.",
    category: "psychosocial" as NCLEXCategory,
    questionType: "select_all",
    bloomLevel: "understand",
    irtDiscrimination: 1.1,
    irtDifficulty: -0.3,
    irtGuessing: 0.1,
    difficulty: "easy",
    tags: ["depression", "assessment", "mental health"]
  },
  // Physiological Integrity - Basic Care
  {
    text: "A nurse is caring for a client with a new tracheostomy. Which of the following actions should the nurse take?",
    options: [
      { id: "a", text: "Keep the tracheostomy cuff deflated at all times" },
      { id: "b", text: "Suction the tracheostomy every 30 minutes" },
      { id: "c", text: "Keep emergency equipment at the bedside" },
      { id: "d", text: "Secure ties tightly to prevent movement" }
    ],
    correctAnswers: ["c"],
    explanation: "Emergency equipment (obturator, spare tracheostomy, suction) must be at bedside. The cuff may need to be inflated, suctioning is done as needed not routinely, and ties should be snug but allow one finger underneath.",
    category: "physiological_basic" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "apply",
    irtDiscrimination: 1.4,
    irtDifficulty: 0.3,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["tracheostomy", "airway management", "safety"]
  },
  {
    text: "A nurse is teaching a client about a high-fiber diet. Which foods should the nurse include in the teaching?",
    options: [
      { id: "a", text: "White rice and white bread" },
      { id: "b", text: "Legumes and whole grains" },
      { id: "c", text: "Chicken and fish" },
      { id: "d", text: "Cheese and milk" }
    ],
    correctAnswers: ["b"],
    explanation: "Legumes (beans, lentils) and whole grains are high in fiber. White rice/bread are refined and low in fiber. Protein sources and dairy are not significant fiber sources.",
    category: "physiological_basic" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "understand",
    irtDiscrimination: 0.9,
    irtDifficulty: -0.8,
    irtGuessing: 0.25,
    difficulty: "easy",
    tags: ["nutrition", "fiber", "diet teaching"]
  },
  // Physiological Integrity - Complex Care
  {
    text: "A nurse is caring for a client receiving IV potassium chloride. Which of the following assessments is the priority?",
    options: [
      { id: "a", text: "Urine output" },
      { id: "b", text: "Blood glucose level" },
      { id: "c", text: "Cardiac rhythm" },
      { id: "d", text: "Temperature" }
    ],
    correctAnswers: ["c"],
    explanation: "Potassium imbalances can cause life-threatening cardiac dysrhythmias. Cardiac rhythm monitoring is essential when administering IV potassium. Urine output is important but not the priority.",
    category: "physiological_complex" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "analyze",
    irtDiscrimination: 1.6,
    irtDifficulty: 0.6,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["electrolytes", "IV therapy", "cardiac", "prioritization"]
  },
  {
    text: "A client with heart failure has the following ABG results: pH 7.32, PaCO2 48 mmHg, HCO3 26 mEq/L. How should the nurse interpret these results?",
    options: [
      { id: "a", text: "Respiratory acidosis, uncompensated" },
      { id: "b", text: "Respiratory alkalosis, compensated" },
      { id: "c", text: "Metabolic acidosis, uncompensated" },
      { id: "d", text: "Metabolic alkalosis, compensated" }
    ],
    correctAnswers: ["a"],
    explanation: "pH is low (acidosis), PaCO2 is high (respiratory cause), and HCO3 is normal (no compensation). This indicates uncompensated respiratory acidosis, common in clients with conditions affecting ventilation.",
    category: "physiological_complex" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "analyze",
    irtDiscrimination: 1.8,
    irtDifficulty: 1.2,
    irtGuessing: 0.25,
    difficulty: "hard",
    tags: ["ABGs", "acid-base balance", "respiratory", "critical care"]
  },
  // More questions for variety...
  {
    text: "A nurse is calculating the drip rate for an IV infusion. The order is for 1000 mL of NS to infuse over 8 hours. The drop factor is 15 gtt/mL. What is the correct drip rate in gtt/min?",
    options: [
      { id: "a", text: "21 gtt/min" },
      { id: "b", text: "31 gtt/min" },
      { id: "c", text: "42 gtt/min" },
      { id: "d", text: "125 gtt/min" }
    ],
    correctAnswers: ["b"],
    explanation: "Drip rate = (Volume × Drop factor) / (Time in minutes). (1000 × 15) / (8 × 60) = 15000 / 480 = 31.25 ≈ 31 gtt/min",
    category: "physiological_basic" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "apply",
    irtDiscrimination: 1.3,
    irtDifficulty: 0.4,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["dosage calculation", "IV therapy", "math"]
  },
  {
    text: "Which of the following is the priority nursing action for a client experiencing a tonic-clonic seizure?",
    options: [
      { id: "a", text: "Insert a padded tongue blade" },
      { id: "b", text: "Restrain the client's extremities" },
      { id: "c", text: "Turn the client to the side" },
      { id: "d", text: "Administer oxygen via non-rebreather mask" }
    ],
    correctAnswers: ["c"],
    explanation: "Turning the client to the side maintains airway patency and prevents aspiration. Never insert anything in the mouth or restrain during a seizure. Oxygen can be given after the seizure stops.",
    category: "physiological_complex" as NCLEXCategory,
    questionType: "multiple_choice",
    bloomLevel: "apply",
    irtDiscrimination: 1.5,
    irtDifficulty: 0.1,
    irtGuessing: 0.25,
    difficulty: "medium",
    tags: ["seizures", "neurological", "safety", "prioritization"]
  }
];

async function seedQuestions() {
  console.log('Starting question seeder...');
  
  try {
    // Initialize database connection
    const sequelize = new Sequelize({
      dialect: 'mariadb',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME || 'haven_institute',
      username: process.env.DB_USER || 'haven_user',
      password: process.env.DB_PASSWORD,
      logging: false,
      models: [Question]
    });

    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check existing questions
    const existingCount = await Question.count();
    console.log(`Existing questions: ${existingCount}`);

    if (existingCount === 0) {
      // Insert sample questions
      await Question.bulkCreate(sampleQuestions as any);
      console.log(`Seeded ${sampleQuestions.length} questions.`);
    } else {
      console.log('Questions already exist, skipping seed.');
    }

    await sequelize.close();
    console.log('Seeder completed successfully!');
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedQuestions();
}

export { seedQuestions, sampleQuestions };
