// Official NCLEX-RN Test Plan Categories and Subcategories
// Based on the current NCLEX-RN Test Plan

export interface NCLEXCategory {
  id: string;
  name: string;
  shortName: string;
  parentCategory?: string;
  percentage: string;
  description: string;
  keyTopics: string[];
  color: string;
}

export const nclexCategories: NCLEXCategory[] = [
  // Safe and Effective Care Environment
  {
    id: 'management-of-care',
    name: 'Management of Care',
    shortName: 'Management',
    parentCategory: 'Safe and Effective Care Environment',
    percentage: '17-23%',
    description: 'Providing integrated, cost-effective care by coordinating, supervising, and/or collaborating with members of the multidisciplinary healthcare team',
    keyTopics: [
      'Advance directives',
      'Advocacy',
      'Case management',
      'Client rights',
      'Collaboration with interdisciplinary team',
      'Concepts of management',
      'Confidentiality/Information security',
      'Continuity of care',
      'Delegation',
      'Establishing priorities',
      'Ethical practice',
      'Informed consent',
      'Legal rights and responsibilities',
      'Performance improvement',
      'Referrals'
    ],
    color: 'bg-blue-500'
  },
  {
    id: 'safety-infection-control',
    name: 'Safety and Infection Control',
    shortName: 'Safety',
    parentCategory: 'Safe and Effective Care Environment',
    percentage: '9-15%',
    description: 'Protecting clients and healthcare personnel from health and environmental hazards',
    keyTopics: [
      'Accident/Error/Injury prevention',
      'Emergency response plan',
      'Ergonomic principles',
      'Handling hazardous materials',
      'Home safety',
      'Infection control',
      'Medical and surgical asepsis',
      'Reporting of incident/event/irregular occurrence',
      'Safe use of equipment',
      'Security plan',
      'Standard precautions/Transmission-based precautions',
      'Use of restraints/safety devices'
    ],
    color: 'bg-green-500'
  },
  
  // Health Promotion and Maintenance
  {
    id: 'health-promotion-maintenance',
    name: 'Health Promotion and Maintenance',
    shortName: 'Health Promotion',
    percentage: '6-12%',
    description: 'Directing nursing care to promote and maintain health across the lifespan',
    keyTopics: [
      'Aging process',
      'Ante/Intra/Postpartum and newborn care',
      'Developmental stages and transitions',
      'Disease prevention',
      'Expected body image changes',
      'Family planning',
      'Health promotion/Disease prevention programs',
      'Health screening',
      'High risk behaviors',
      'Immunizations',
      'Lifestyle choices',
      'Self-care',
      'Techniques of physical assessment'
    ],
    color: 'bg-yellow-500'
  },
  
  // Psychosocial Integrity
  {
    id: 'psychosocial-integrity',
    name: 'Psychosocial Integrity',
    shortName: 'Psychosocial',
    percentage: '6-12%',
    description: 'Promoting and supporting the emotional, mental, and social well-being of clients',
    keyTopics: [
      'Abuse/Neglect',
      'Behavioral interventions',
      'Chemical and other dependencies/Substance use disorder',
      'Coping mechanisms',
      'Crisis intervention',
      'Cultural awareness/Diversity',
      'End-of-life care',
      'Family dynamics',
      'Grief and loss',
      'Mental health concepts',
      'Religious and spiritual influences on health',
      'Sensory/Perceptual alterations',
      'Stress management',
      'Support systems',
      'Therapeutic communication',
      'Therapeutic environment'
    ],
    color: 'bg-purple-500'
  },
  
  // Physiological Integrity
  {
    id: 'basic-care-comfort',
    name: 'Basic Care and Comfort',
    shortName: 'Basic Care',
    parentCategory: 'Physiological Integrity',
    percentage: '6-12%',
    description: 'Providing comfort and assistance in the performance of activities of daily living',
    keyTopics: [
      'Assistive devices',
      'Elimination',
      'Mobility/Immobility',
      'Non-pharmacological comfort interventions',
      'Nutrition and oral hydration',
      'Palliative/Comfort care',
      'Personal hygiene',
      'Rest and sleep'
    ],
    color: 'bg-indigo-500'
  },
  {
    id: 'pharmacological-therapies',
    name: 'Pharmacological and Parenteral Therapies',
    shortName: 'Pharmacology',
    parentCategory: 'Physiological Integrity',
    percentage: '12-18%',
    description: 'Managing and providing care related to the administration of medications and parenteral therapies',
    keyTopics: [
      'Adverse effects/Contraindications/Side effects/Interactions',
      'Blood and blood products',
      'Central venous access devices',
      'Dosage calculation',
      'Expected actions/Outcomes',
      'Medication administration',
      'Parenteral/Intravenous therapies',
      'Pharmacological pain management',
      'Total parenteral nutrition'
    ],
    color: 'bg-pink-500'
  },
  {
    id: 'reduction-risk-potential',
    name: 'Reduction of Risk Potential',
    shortName: 'Risk Reduction',
    parentCategory: 'Physiological Integrity',
    percentage: '9-15%',
    description: 'Reducing the likelihood that clients will develop complications or health problems',
    keyTopics: [
      'Diagnostic tests',
      'Laboratory values',
      'Monitoring conscious sedation',
      'Potential for alterations in body systems',
      'Potential for complications from surgical procedures and health alterations',
      'Potential for complications of diagnostic tests/treatments/procedures',
      'System specific assessments',
      'Therapeutic procedures',
      'Vital signs'
    ],
    color: 'bg-orange-500'
  },
  {
    id: 'physiological-adaptation',
    name: 'Physiological Adaptation',
    shortName: 'Adaptation',
    parentCategory: 'Physiological Integrity',
    percentage: '11-17%',
    description: 'Managing and providing care for clients with acute, chronic, or life-threatening conditions',
    keyTopics: [
      'Alterations in body systems',
      'Fluid and electrolyte imbalances',
      'Hemodynamics',
      'Illness management',
      'Medical emergencies',
      'Pathophysiology',
      'Radiation therapy',
      'Unexpected response to therapies'
    ],
    color: 'bg-red-500'
  }
];

// Helper functions
export function getCategoriesByParent(parent: string | null = null): NCLEXCategory[] {
  if (parent === null) {
    return nclexCategories.filter(cat => !cat.parentCategory);
  }
  return nclexCategories.filter(cat => cat.parentCategory === parent);
}

export function getCategoryById(id: string): NCLEXCategory | undefined {
  return nclexCategories.find(cat => cat.id === id);
}

export function getMainCategories(): string[] {
  return [
    'Safe and Effective Care Environment',
    'Health Promotion and Maintenance',
    'Psychosocial Integrity',
    'Physiological Integrity'
  ];
}

export function getAllSubcategories(): NCLEXCategory[] {
  return nclexCategories;
}

// Map old topic IDs to new NCLEX categories
export const topicCategoryMap: Record<string, string> = {
  'fundamentals': 'basic-care-comfort',
  'pharmacology': 'pharmacological-therapies',
  'med-surg': 'physiological-adaptation',
  'pediatrics': 'health-promotion-maintenance',
  'mental-health': 'psychosocial-integrity',
  'maternal': 'health-promotion-maintenance'
};
