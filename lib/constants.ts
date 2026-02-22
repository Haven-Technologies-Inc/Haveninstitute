export const NCLEX_CATEGORIES = [
  { id: 1, name: 'Management of Care', code: 'MGMT_CARE', short: 'Mgmt', color: '#3b82f6' },
  { id: 2, name: 'Safety and Infection Control', code: 'SAFETY_INFECT', short: 'Safety', color: '#10b981' },
  { id: 3, name: 'Health Promotion and Maintenance', code: 'HEALTH_PROMO', short: 'Health', color: '#f59e0b' },
  { id: 4, name: 'Psychosocial Integrity', code: 'PSYCHOSOCIAL', short: 'Psych', color: '#8b5cf6' },
  { id: 5, name: 'Basic Care and Comfort', code: 'BASIC_CARE', short: 'Basic', color: '#6366f1' },
  { id: 6, name: 'Pharmacological Therapies', code: 'PHARMACOLOGY', short: 'Pharm', color: '#ec4899' },
  { id: 7, name: 'Reduction of Risk Potential', code: 'RISK_REDUCTION', short: 'Risk', color: '#f97316' },
  { id: 8, name: 'Physiological Adaptation', code: 'PHYSIO_ADAPT', short: 'Physio', color: '#ef4444' },
] as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      '50 practice questions/day',
      'Basic flashcards',
      'Community access',
      'Progress tracking',
    ],
    limits: { questionsPerDay: 50, catSessionsPerMonth: 2, aiChats: 10 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'Everything you need to pass',
    popular: true,
    features: [
      'Unlimited practice questions',
      'Full CAT simulator',
      'AI-powered flashcards',
      'AI tutor (unlimited)',
      'Detailed analytics',
      'Study planner',
      'Priority support',
    ],
    limits: { questionsPerDay: -1, catSessionsPerMonth: -1, aiChats: -1 },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    period: 'month',
    description: 'Maximum preparation power',
    features: [
      'Everything in Pro',
      'NCLEX exam simulator',
      'Personalized study plans',
      'Book library access',
      'Group study features',
      'Performance analytics',
      '1-on-1 tutor sessions',
      'Pass guarantee',
    ],
    limits: { questionsPerDay: -1, catSessionsPerMonth: -1, aiChats: -1 },
  },
] as const;

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: 'CircleDot' },
  { value: 'multiple_response', label: 'Select All That Apply (SATA)', icon: 'CheckSquare' },
  { value: 'select_all', label: 'Select All', icon: 'CheckSquare' },
  { value: 'fill_blank', label: 'Fill in the Blank', icon: 'TextCursorInput' },
  { value: 'ordered_response', label: 'Ordered Response (Drag & Drop)', icon: 'ArrowUpDown' },
  { value: 'hot_spot', label: 'Hot Spot', icon: 'MapPin' },
  { value: 'cloze_dropdown', label: 'Cloze (Drop-Down)', icon: 'ChevronDown' },
  { value: 'matrix', label: 'Matrix / Grid', icon: 'Table' },
  { value: 'highlight', label: 'Highlight Text', icon: 'Highlighter' },
  { value: 'bow_tie', label: 'Bow-Tie', icon: 'GitBranch' },
  { value: 'case_study', label: 'Case Study', icon: 'FileText' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#ef4444' },
] as const;

export const NCLEX_SUBJECTS = [
  'Adult Health', 'Pediatrics', 'Maternity', 'Mental Health',
  'Community Health', 'Leadership/Management', 'Pharmacology',
  'Fundamentals', 'Critical Care', 'Emergency', 'Gerontology',
  'Perioperative', 'Oncology', 'Endocrine', 'Cardiovascular',
  'Respiratory', 'Neurology', 'Gastrointestinal', 'Renal/Urinary',
  'Musculoskeletal', 'Integumentary', 'Immunology', 'Hematology',
  'Nutrition', 'Fluid & Electrolytes', 'Infection Control',
] as const;

export const NCLEX_DISCIPLINES = [
  'Nursing Process', 'Clinical Judgment', 'Patient Safety',
  'Evidence-Based Practice', 'Quality Improvement', 'Informatics',
  'Interprofessional Collaboration', 'Ethical/Legal',
  'Cultural Competency', 'Health Promotion', 'Disease Prevention',
  'Pathophysiology', 'Pharmacokinetics', 'Delegation',
] as const;

export const BLOOM_LEVELS = [
  { value: 'remember', label: 'Remember' },
  { value: 'understand', label: 'Understand' },
  { value: 'apply', label: 'Apply' },
  { value: 'analyze', label: 'Analyze' },
  { value: 'evaluate', label: 'Evaluate' },
  { value: 'create', label: 'Create' },
] as const;

export const NCLEX_VERSIONS = [
  { value: 'NGN', label: 'Next Generation NCLEX' },
  { value: 'Classic', label: 'Classic NCLEX' },
  { value: 'Both', label: 'Both Formats' },
] as const;

export const APP_NAME = 'Haven Institute';
export const APP_DESCRIPTION = 'AI-Powered NCLEX Prep Platform';
export const APP_URL = 'https://www.havenstudy.com';
