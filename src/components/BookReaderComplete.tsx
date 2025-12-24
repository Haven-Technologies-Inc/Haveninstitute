import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark,
  Lightbulb,
  Brain,
  FileText,
  Search,
  Settings,
  X,
  Sparkles,
  BookMarked,
  Download,
  Highlighter,
  CheckCircle2,
  MessageSquare,
  List,
  Eye,
  Star,
  Clock,
  Award,
  Lock,
  Unlock,
  ShoppingCart,
  Type,
  Palette,
  Volume2,
  Printer,
  Share2,
  BrainCircuit,
  Zap,
  Layers,
  BookmarkPlus,
  BookmarkCheck,
  Target,
  TrendingUp,
  ListTodo
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  content: string[];
  totalPages: number;
  purchaseDate?: string;
  price: number;
  isOwned: boolean;
  category: string;
  rating: number;
  description: string;
}

interface Highlight {
  pageIndex: number;
  text: string;
  color: string;
  note?: string;
  timestamp: Date;
}

interface Bookmark {
  pageIndex: number;
  title: string;
  timestamp: Date;
}

interface Note {
  id: string;
  pageIndex: number;
  content: string;
  timestamp: Date;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
}

interface BookReaderProps {
  onBack: () => void;
}

// Comprehensive book library
const allBooks: Book[] = [
  {
    id: '1',
    title: 'NCLEX-RN Complete Review 2024',
    author: 'Dr. Sarah Mitchell, RN, PhD',
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      `Chapter 1: Safe and Effective Care Environment

Management of Care is one of the most critical domains in NCLEX-RN testing. This chapter covers essential concepts including advance directives, advocacy, case management, client rights, collaboration with interdisciplinary team, concepts of management, confidentiality/information security, continuity of care, establishing priorities, ethical practice, informed consent, information technology, legal rights and responsibilities, and performance improvement.

Advance Directives:
An advance directive is a legal document that allows individuals to specify their healthcare preferences in advance of serious illness. There are two main types:
1. Living Will - Specifies medical treatments a person wants or does not want
2. Durable Power of Attorney for Healthcare - Designates someone to make healthcare decisions

Key Nursing Responsibilities:
- Ensure advance directives are documented in the medical record
- Honor the client's wishes as stated in advance directives
- Provide information about advance directives to all clients
- Advocate for the client's rights and preferences
- Notify appropriate personnel when conflicts arise`,
      
      `Client Advocacy:
Nurses serve as advocates by protecting client rights and supporting their decisions. This includes:
- Ensuring informed consent is obtained
- Supporting client autonomy and self-determination
- Protecting vulnerable populations
- Speaking up for clients who cannot advocate for themselves
- Ensuring cultural sensitivity and respect

Ethical Principles in Nursing:
1. Autonomy - Respecting the client's right to make their own decisions
2. Beneficence - Acting in the client's best interest
3. Nonmaleficence - "Do no harm"
4. Justice - Fair and equal treatment
5. Fidelity - Being faithful to commitments and responsibilities
6. Veracity - Truthfulness

Priority Setting and Delegation:
Maslow's Hierarchy of Needs provides a framework for priority setting:
- Physiological needs (airway, breathing, circulation)
- Safety and security
- Love and belonging
- Self-esteem
- Self-actualization

ABC Priority Framework:
- Airway
- Breathing  
- Circulation`,
      
      `Chapter 2: Pharmacological and Parenteral Therapies

Pharmacology is a significant component of the NCLEX-RN exam. This chapter covers medication administration, expected actions/outcomes, adverse effects, contraindications, medication interactions, pharmacological pain management, and total parenteral nutrition.

Medication Safety:
The "Five Rights" of medication administration:
1. Right Patient - Verify using two identifiers
2. Right Medication - Check label three times
3. Right Dose - Calculate carefully
4. Right Route - Confirm appropriate route
5. Right Time - Administer at prescribed time

Additional considerations:
- Right Documentation
- Right to Refuse
- Right Assessment
- Right Education
- Right Evaluation

High-Alert Medications require special attention:
- Insulin
- Heparin and anticoagulants
- Opioids
- Chemotherapy agents
- Neuromuscular blocking agents`,
      
      `Medication Administration Routes:

Oral Administration:
- Most common and convenient route
- Slower onset of action
- First-pass metabolism in liver
- Cannot use if NPO or vomiting

Intramuscular (IM) Injection:
- Faster absorption than oral
- Maximum volume: 3 mL in large muscle
- Common sites: Deltoid, Vastus lateralis, Ventrogluteal
- Use Z-track technique for irritating medications

Intravenous (IV) Administration:
- Most rapid onset of action
- 100% bioavailability
- Allows for large volumes
- Monitor for infiltration, phlebitis, infection
- Critical for emergency medications

Subcutaneous Injection:
- Slower, sustained absorption
- Maximum volume: 1.5 mL
- Common sites: Abdomen, upper arms, thighs
- Rotate injection sites
- Used for insulin, heparin, immunizations`,
      
      `Chapter 3: Physiological Adaptation

Understanding pathophysiology and body system alterations is crucial for NCLEX success.

Fluid and Electrolyte Balance:

Hyponatremia (Low Sodium):
- Causes: Excessive fluid intake, SIADH, diuretics
- Signs: Confusion, headache, nausea, seizures
- Treatment: Restrict fluids, administer hypertonic saline

Hypernatremia (High Sodium):
- Causes: Dehydration, diabetes insipidus
- Signs: Thirst, dry mucous membranes, restlessness
- Treatment: Increase fluid intake, administer hypotonic solutions

Hypokalemia (Low Potassium):
- Causes: Diuretics, vomiting, diarrhea
- Signs: Muscle weakness, dysrhythmias, decreased GI motility
- Treatment: Potassium supplements, potassium-rich foods

Hyperkalemia (High Potassium):
- Causes: Renal failure, potassium-sparing diuretics
- Signs: Cardiac dysrhythmias, muscle weakness
- Treatment: Calcium gluconate, insulin with glucose, dialysis`,
      
      `Acid-Base Balance:

Respiratory Acidosis:
- pH < 7.35, PaCO2 > 45
- Causes: Hypoventilation, COPD, respiratory depression
- Treatment: Improve ventilation, bronchodilators

Respiratory Alkalosis:
- pH > 7.45, PaCO2 < 35
- Causes: Hyperventilation, anxiety, fever
- Treatment: Rebreathe CO2, treat underlying cause

Metabolic Acidosis:
- pH < 7.35, HCO3 < 22
- Causes: Diabetic ketoacidosis, renal failure, diarrhea
- Treatment: Sodium bicarbonate, treat underlying cause

Metabolic Alkalosis:
- pH > 7.45, HCO3 > 26
- Causes: Vomiting, NG suction, diuretics
- Treatment: Replace electrolytes, treat underlying cause`
    ],
    totalPages: 6,
    purchaseDate: '2024-11-10',
    price: 29.99,
    isOwned: true,
    category: 'Complete Review',
    rating: 4.8,
    description: 'Comprehensive NCLEX-RN review covering all test categories with practice questions'
  },
  {
    id: '2',
    title: 'Pharmacology Made Easy for NCLEX',
    author: 'Dr. Michael Chen, PharmD',
    coverImage: 'https://images.unsplash.com/photo-1760006782177-7f05cce886bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      `Introduction to Pharmacology

Pharmacology is the study of drugs and their effects on the body. Understanding key concepts is essential for safe medication administration and optimal patient outcomes.

Pharmacokinetics - What the body does to the drug:
1. Absorption - Drug enters bloodstream
2. Distribution - Drug travels through body
3. Metabolism - Drug is broken down
4. Excretion - Drug is eliminated

Pharmacodynamics - What the drug does to the body:
- Receptor binding and activation
- Agonists vs. Antagonists
- Therapeutic effects
- Adverse effects`,
      
      `Cardiovascular Medications:

Antihypertensives:
- ACE Inhibitors (ending in -pril): Lisinopril, Enalapril
  • Block conversion of angiotensin I to II
  • Monitor for dry cough, hyperkalemia
  • Do not use in pregnancy
  
- Beta Blockers (ending in -lol): Metoprolol, Atenolol
  • Decrease heart rate and blood pressure
  • Monitor for bradycardia, fatigue
  • Taper slowly when discontinuing
  
- Calcium Channel Blockers: Amlodipine, Diltiazem
  • Relax blood vessels
  • Monitor for edema, constipation
  • Avoid grapefruit juice`,
      
      `Anticoagulants and Antiplatelets:

Warfarin (Coumadin):
- Vitamin K antagonist
- Monitor PT/INR (therapeutic 2-3)
- Antidote: Vitamin K
- Avoid foods high in vitamin K
- Many drug interactions

Heparin:
- Immediate anticoagulant effect
- Monitor aPTT (1.5-2x normal)
- Antidote: Protamine sulfate
- Risk of HIT (Heparin-Induced Thrombocytopenia)

Aspirin:
- Antiplatelet agent
- Irreversibly inhibits platelet aggregation
- Take with food to reduce GI upset
- Monitor for bleeding`
    ],
    totalPages: 3,
    price: 24.99,
    isOwned: true,
    category: 'Pharmacology',
    rating: 4.9,
    description: 'Simplified pharmacology guide with memory aids and mnemonics'
  },
  {
    id: '3',
    title: 'Maternal-Newborn Nursing Success',
    author: 'Dr. Emily Rodriguez, RN, MSN',
    coverImage: 'https://images.unsplash.com/photo-1584515933487-779824d29309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      `Prenatal Care and Assessment

First Trimester (0-13 weeks):
- Confirm pregnancy
- Establish gestational age
- Assess for ectopic pregnancy
- Screen for genetic disorders
- Address common discomforts: nausea, fatigue

Key Assessments:
- Blood type and Rh factor
- Rubella immunity
- STI screening
- Complete blood count
- Urinalysis`,
      
      `Labor and Delivery:

Stages of Labor:
Stage 1 - Cervical dilation (0-10 cm)
  • Latent phase: 0-3 cm
  • Active phase: 4-7 cm
  • Transition: 8-10 cm

Stage 2 - Pushing and delivery of baby
Stage 3 - Delivery of placenta
Stage 4 - Recovery (first 1-4 hours)

Pain Management Options:
- Non-pharmacological: Breathing, positioning, massage
- Pharmacological: Epidural, spinal, IV narcotics`
    ],
    totalPages: 2,
    price: 19.99,
    isOwned: false,
    category: 'Maternal-Newborn',
    rating: 4.7,
    description: 'Comprehensive guide to maternal-newborn nursing care'
  },
  {
    id: '4',
    title: 'Pediatric Nursing Essentials',
    author: 'Dr. James Patterson, RN, DNP',
    coverImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      `Growth and Development

Infancy (0-12 months):
- Erikson: Trust vs. Mistrust
- Motor: Rolls over (4 mo), sits (6 mo), walks (12 mo)
- Cognitive: Object permanence develops
- Nutrition: Breast milk or formula

Toddler (1-3 years):
- Erikson: Autonomy vs. Shame
- Motor: Runs, climbs stairs, rides tricycle
- Cognitive: Parallel play
- Safety: Prevent poisoning, falls`
    ],
    totalPages: 1,
    price: 21.99,
    isOwned: false,
    category: 'Pediatrics',
    rating: 4.6,
    description: 'Essential pediatric nursing concepts and development milestones'
  },
  {
    id: '5',
    title: 'Mental Health Nursing NCLEX Review',
    author: 'Dr. Amanda Foster, PMHNP-BC',
    coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      `Therapeutic Communication

Effective Techniques:
- Active listening
- Open-ended questions
- Reflection and paraphrasing
- Silence (therapeutic use)
- Empathy and validation

Non-Therapeutic Techniques (AVOID):
- Giving advice or personal opinions
- False reassurance
- Changing the subject
- Asking "why" questions
- Defending or arguing`
    ],
    totalPages: 1,
    price: 18.99,
    isOwned: false,
    category: 'Mental Health',
    rating: 4.5,
    description: 'Mental health nursing concepts and therapeutic communication'
  }
];

export function BookReaderComplete({ onBack }: BookReaderProps) {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAITools, setShowAITools] = useState(false);
  const [aiToolType, setAIToolType] = useState<'summary' | 'questions' | 'flashcards' | 'explain'>('summary');
  
  // Reading settings
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [lineSpacing, setLineSpacing] = useState(1.6);
  
  // User interactions
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  
  // AI Generated content
  const [aiSummary, setAiSummary] = useState('');
  const [aiQuestions, setAiQuestions] = useState<GeneratedQuestion[]>([]);
  const [aiFlashcards, setAiFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Progress tracking
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});

  const ownedBooks = allBooks.filter(b => b.isOwned);
  const availableBooks = allBooks.filter(b => !b.isOwned);

  // Theme configurations
  const themeStyles = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-amber-50 text-amber-950',
    dark: 'bg-gray-900 text-gray-100'
  };

  const fontFamilies = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  // Simulate AI generation
  const generateAISummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const content = selectedBook?.content[currentPage] || '';
      setAiSummary(`📚 AI Summary of Current Page:

This section covers key nursing concepts essential for NCLEX success. Main topics include:

• Core principles and nursing responsibilities
• Critical safety considerations and protocols
• Evidence-based best practices
• Important clinical guidelines and standards

Key Takeaways:
- Understanding these concepts is crucial for patient safety
- Application of theoretical knowledge to clinical scenarios
- Integration with other nursing domains
- Relevance to NCLEX-RN testing

Study Focus: Pay special attention to priority-setting frameworks, medication safety protocols, and ethical decision-making processes outlined in this section.`);
      setIsGenerating(false);
    }, 2000);
  };

  const generateAIQuestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const questions: GeneratedQuestion[] = [
        {
          id: '1',
          question: 'A nurse is caring for a client who has signed an advance directive. Which action should the nurse take?',
          options: [
            'Keep the advance directive in a secure location separate from the medical record',
            'Ensure the advance directive is documented in the client\'s medical record',
            'Only discuss the advance directive with the healthcare provider',
            'Wait for a family member to provide consent before implementing the directive'
          ],
          correctAnswer: 1,
          explanation: 'The nurse should ensure advance directives are documented in the medical record for all healthcare team members to access and honor the client\'s wishes.'
        },
        {
          id: '2',
          question: 'Which of the following represents the correct priority order using the ABC framework?',
          options: [
            'Pain management, oxygen therapy, IV fluids',
            'Oxygen therapy, cardiac monitoring, pain management',
            'IV fluids, oxygen therapy, cardiac monitoring',
            'Cardiac monitoring, IV fluids, oxygen therapy'
          ],
          correctAnswer: 1,
          explanation: 'ABC priority framework: Airway (oxygen therapy), Breathing (cardiac monitoring ensures circulation), then Circulation. Pain management comes after life-threatening needs are addressed.'
        },
        {
          id: '3',
          question: 'A nurse is preparing to administer medication. Which identifier combination correctly verifies the right patient?',
          options: [
            'Name and room number',
            'Name and date of birth',
            'Date of birth and room number',
            'Medical record number and room number'
          ],
          correctAnswer: 1,
          explanation: 'Two patient identifiers should be used: name and date of birth (or medical record number). Room number is never used as an identifier as patients may be moved.'
        }
      ];
      setAiQuestions(questions);
      setIsGenerating(false);
    }, 2500);
  };

  const generateAIFlashcards = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const flashcards: GeneratedFlashcard[] = [
        {
          id: '1',
          front: 'What are the two main types of advance directives?',
          back: '1. Living Will - Specifies wanted/unwanted medical treatments\n2. Durable Power of Attorney for Healthcare - Designates decision-maker'
        },
        {
          id: '2',
          front: 'List the 6 ethical principles in nursing',
          back: 'Autonomy, Beneficence, Nonmaleficence, Justice, Fidelity, Veracity'
        },
        {
          id: '3',
          front: 'What does the ABC priority framework stand for?',
          back: 'Airway\nBreathing\nCirculation'
        },
        {
          id: '4',
          front: 'Name the "Five Rights" of medication administration',
          back: 'Right Patient, Right Medication, Right Dose, Right Route, Right Time'
        },
        {
          id: '5',
          front: 'What are high-alert medications?',
          back: 'Medications requiring special attention: Insulin, Heparin, Opioids, Chemotherapy, Neuromuscular blockers'
        }
      ];
      setAiFlashcards(flashcards);
      setIsGenerating(false);
    }, 2000);
  };

  const generateAIExplanation = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiExplanation(`🤖 AI Explanation:

Let me break down this concept in simple terms:

**What it means:**
This section explains fundamental nursing principles that form the foundation of safe, ethical patient care. Think of these as the "rules of the road" for nursing practice.

**Why it matters:**
- Protects patient rights and safety
- Guides decision-making in complex situations
- Ensures legal and ethical compliance
- Forms basis for NCLEX questions

**How to remember:**
Use the mnemonic "ABCDEF" for ethical principles:
- Autonomy - Patient's choice
- Beneficence - Do good
- (Nonmaleficence) - Do no harm  
- Justice - Fair treatment
- Fidelity - Keep promises
- Veracity - Tell truth

**Clinical Application:**
In practice, you'll use these principles daily when obtaining consent, respecting patient decisions, prioritizing care, and advocating for your patients.

**NCLEX Tip:**
Questions often present ethical dilemmas. Always choose the answer that respects patient autonomy and follows the ABC priority framework for safety.`);
      setIsGenerating(false);
    }, 2200);
  };

  const handleAIToolSelect = (toolType: typeof aiToolType) => {
    setAIToolType(toolType);
    setShowAITools(true);
    
    switch(toolType) {
      case 'summary':
        generateAISummary();
        break;
      case 'questions':
        generateAIQuestions();
        break;
      case 'flashcards':
        generateAIFlashcards();
        break;
      case 'explain':
        generateAIExplanation();
        break;
    }
  };

  const addHighlight = (color: string) => {
    if (selectedText && selectedBook) {
      const newHighlight: Highlight = {
        pageIndex: currentPage,
        text: selectedText,
        color,
        timestamp: new Date()
      };
      setHighlights([...highlights, newHighlight]);
      setShowHighlightMenu(false);
      setSelectedText('');
    }
  };

  const addBookmark = () => {
    if (selectedBook) {
      const newBookmark: Bookmark = {
        pageIndex: currentPage,
        title: `Page ${currentPage + 1} - ${selectedBook.title}`,
        timestamp: new Date()
      };
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const addNote = (content: string) => {
    if (selectedBook && content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        pageIndex: currentPage,
        content,
        timestamp: new Date()
      };
      setNotes([...notes, newNote]);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) {
      setSelectedText(text);
      setShowHighlightMenu(true);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (selectedBook && pageIndex >= 0 && pageIndex < selectedBook.totalPages) {
      setCurrentPage(pageIndex);
      // Update reading progress
      const progress = ((pageIndex + 1) / selectedBook.totalPages) * 100;
      setReadingProgress({ ...readingProgress, [selectedBook.id]: progress });
    }
  };

  // Library View
  if (!selectedBook) {
    const filteredOwnedBooks = ownedBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2 dark:text-white">📚 My Book Library</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Your NCLEX study books and resources</p>
          </div>
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ChevronLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              <Input
                placeholder="Search by title, author, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* My Books */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl mb-4 flex items-center gap-2 dark:text-white">
            <BookMarked className="size-5 sm:size-6 text-blue-600" />
            My Books ({ownedBooks.length})
          </h2>
          {filteredOwnedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwnedBooks.map(book => {
                const progress = readingProgress[book.id] || 0;
                return (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedBook(book)}>
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        <Unlock className="size-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{book.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="size-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{book.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Reading Progress</span>
                            <span className="text-blue-600">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{book.totalPages} pages</span>
                          {book.purchaseDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(book.purchaseDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No books found matching your search</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Available Books */}
        <div>
          <h2 className="text-xl sm:text-2xl mb-4 flex items-center gap-2 dark:text-white">
            <ShoppingCart className="size-5 sm:size-6 text-purple-600" />
            Available for Purchase ({availableBooks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBooks.map(book => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Lock className="size-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-purple-600">
                    ${book.price}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{book.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{book.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{book.description}</p>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    <ShoppingCart className="size-4 mr-2" />
                    Purchase for ${book.price}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Reader View
  const currentPageNotes = notes.filter(n => n.pageIndex === currentPage);
  const currentPageBookmarks = bookmarks.filter(b => b.pageIndex === currentPage);
  const currentPageHighlights = highlights.filter(h => h.pageIndex === currentPage);

  return (
    <div className="min-h-screen">
      {/* Reader Header */}
      <div className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedBook(null)}>
                <ChevronLeft className="size-4 mr-1" />
                Library
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h2 className="font-medium">{selectedBook.title}</h2>
                <p className="text-sm text-gray-600">{selectedBook.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* AI Tools Menu */}
              <div className="flex gap-1 bg-gradient-to-r from-purple-50 to-blue-50 p-1 rounded-lg border border-purple-200">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAIToolSelect('summary')}
                  className="gap-2"
                >
                  <BrainCircuit className="size-4 text-purple-600" />
                  <span className="hidden sm:inline">Summary</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAIToolSelect('questions')}
                  className="gap-2"
                >
                  <ListTodo className="size-4 text-blue-600" />
                  <span className="hidden sm:inline">Questions</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAIToolSelect('flashcards')}
                  className="gap-2"
                >
                  <Layers className="size-4 text-green-600" />
                  <span className="hidden sm:inline">Flashcards</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAIToolSelect('explain')}
                  className="gap-2"
                >
                  <Lightbulb className="size-4 text-yellow-600" />
                  <span className="hidden sm:inline">Explain</span>
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="ghost" size="sm" onClick={addBookmark}>
                <BookmarkPlus className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="size-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Page {currentPage + 1} of {selectedBook.totalPages}</span>
              <span>{Math.round(((currentPage + 1) / selectedBook.totalPages) * 100)}% Complete</span>
            </div>
            <Progress value={((currentPage + 1) / selectedBook.totalPages) * 100} className="h-1" />
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Reading Area */}
          <div className="lg:col-span-2">
            <Card className={`${themeStyles[theme]} min-h-[600px]`}>
              <CardContent className="p-8">
                <div 
                  className={`${fontFamilies[fontFamily]} prose max-w-none`}
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing
                  }}
                  onMouseUp={handleTextSelection}
                >
                  {selectedBook.content[currentPage].split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Highlight Menu */}
                {showHighlightMenu && selectedText && (
                  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-3 flex gap-2 z-50">
                    <p className="text-sm text-gray-600 mr-2">Highlight:</p>
                    <button 
                      onClick={() => addHighlight('#fef08a')}
                      className="size-8 rounded-full bg-yellow-200 border-2 border-yellow-400 hover:scale-110 transition-transform"
                    />
                    <button 
                      onClick={() => addHighlight('#bbf7d0')}
                      className="size-8 rounded-full bg-green-200 border-2 border-green-400 hover:scale-110 transition-transform"
                    />
                    <button 
                      onClick={() => addHighlight('#bfdbfe')}
                      className="size-8 rounded-full bg-blue-200 border-2 border-blue-400 hover:scale-110 transition-transform"
                    />
                    <button 
                      onClick={() => addHighlight('#fecaca')}
                      className="size-8 rounded-full bg-red-200 border-2 border-red-400 hover:scale-110 transition-transform"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowHighlightMenu(false);
                        setSelectedText('');
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button 
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                size="lg"
              >
                <ChevronLeft className="size-5 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: selectedBook.totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`size-10 rounded-lg border-2 transition-all ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white hover:border-blue-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button 
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === selectedBook.totalPages - 1}
                size="lg"
              >
                Next
                <ChevronRight className="size-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Notes, Bookmarks, Highlights */}
          <div className="space-y-4">
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="size-5" />
                      My Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Textarea 
                        placeholder="Add a note about this page..."
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            addNote(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {currentPageNotes.map(note => (
                          <Card key={note.id} className="bg-yellow-50 border-yellow-200">
                            <CardContent className="pt-4">
                              <p className="text-sm mb-2">{note.content}</p>
                              <p className="text-xs text-gray-600">
                                {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        {currentPageNotes.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">
                            No notes on this page yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="bookmarks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookmarkCheck className="size-5" />
                      Bookmarks ({bookmarks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {bookmarks.map((bookmark, idx) => (
                          <Card 
                            key={idx} 
                            className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                              bookmark.pageIndex === currentPage ? 'bg-blue-50 border-blue-300' : ''
                            }`}
                            onClick={() => goToPage(bookmark.pageIndex)}
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm mb-1">{bookmark.title}</p>
                                  <p className="text-xs text-gray-600">
                                    {bookmark.timestamp.toLocaleDateString()}
                                  </p>
                                </div>
                                <Bookmark className="size-4 text-blue-600" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {bookmarks.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">
                            No bookmarks yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="highlights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Highlighter className="size-5" />
                      Highlights ({highlights.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {currentPageHighlights.map((highlight, idx) => (
                          <Card 
                            key={idx}
                            style={{ backgroundColor: highlight.color }}
                            className="border-2"
                          >
                            <CardContent className="pt-4">
                              <p className="text-sm italic mb-2">"{highlight.text}"</p>
                              <p className="text-xs text-gray-700">
                                Page {highlight.pageIndex + 1} • {highlight.timestamp.toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        {currentPageHighlights.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">
                            No highlights on this page
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Reading Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Reading Settings
            </DialogTitle>
            <DialogDescription>
              Customize your reading experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Type className="size-4" />
                Font Size: {fontSize}px
              </Label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <List className="size-4" />
                Line Spacing: {lineSpacing}
              </Label>
              <Slider
                value={[lineSpacing]}
                onValueChange={(value) => setLineSpacing(value[0])}
                min={1.2}
                max={2.4}
                step={0.2}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Compact</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <Label className="mb-3 flex items-center gap-2">
                <Type className="size-4" />
                Font Family
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={fontFamily === 'serif' ? 'default' : 'outline'}
                  onClick={() => setFontFamily('serif')}
                  className="font-serif"
                >
                  Serif
                </Button>
                <Button
                  variant={fontFamily === 'sans' ? 'default' : 'outline'}
                  onClick={() => setFontFamily('sans')}
                  className="font-sans"
                >
                  Sans Serif
                </Button>
                <Button
                  variant={fontFamily === 'mono' ? 'default' : 'outline'}
                  onClick={() => setFontFamily('mono')}
                  className="font-mono"
                >
                  Mono
                </Button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <Label className="mb-3 flex items-center gap-2">
                <Palette className="size-4" />
                Reading Theme
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'sepia' ? 'default' : 'outline'}
                  onClick={() => setTheme('sepia')}
                  className="bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                >
                  Sepia
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="bg-gray-900 text-gray-100 border-gray-700 hover:bg-gray-800"
                >
                  Dark
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Tools Dialog */}
      <Dialog open={showAITools} onOpenChange={setShowAITools}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-purple-600" />
              AI Study Tools
            </DialogTitle>
            <DialogDescription>
              AI-powered tools to enhance your learning
            </DialogDescription>
          </DialogHeader>

          <Tabs value={aiToolType} onValueChange={(v) => setAIToolType(v as typeof aiToolType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="explain">Explain</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-4">
              <TabsContent value="summary" className="space-y-4">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">AI is generating your summary...</p>
                  </div>
                ) : aiSummary ? (
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="pt-6">
                      <pre className="whitespace-pre-wrap font-sans">{aiSummary}</pre>
                      <Button className="mt-4" variant="outline">
                        <Download className="size-4 mr-2" />
                        Export Summary
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <BrainCircuit className="size-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click "Generate Summary" to create an AI summary of this page</p>
                    <Button onClick={generateAISummary} className="bg-purple-600">
                      <Sparkles className="size-4 mr-2" />
                      Generate Summary
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">AI is generating practice questions...</p>
                  </div>
                ) : aiQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {aiQuestions.map((q, idx) => (
                      <Card key={q.id} className="border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                          <CardDescription>{q.question}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {q.options.map((option, optIdx) => (
                            <div 
                              key={optIdx}
                              className={`p-3 rounded-lg border-2 ${
                                optIdx === q.correctAnswer 
                                  ? 'bg-green-50 border-green-400' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-white border-2 flex items-center justify-center text-sm">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {optIdx === q.correctAnswer && (
                                  <CheckCircle2 className="size-5 text-green-600" />
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
                            <p className="text-blue-900 mb-2"><strong>Explanation:</strong></p>
                            <p className="text-blue-800 text-sm">{q.explanation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Download className="size-4 mr-2" />
                      Export Questions
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ListTodo className="size-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Generate practice questions based on this content</p>
                    <Button onClick={generateAIQuestions} className="bg-blue-600">
                      <Sparkles className="size-4 mr-2" />
                      Generate Questions
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="flashcards" className="space-y-4">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">AI is creating flashcards...</p>
                  </div>
                ) : aiFlashcards.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiFlashcards.map((card) => (
                        <Card key={card.id} className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-green-800">Question:</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-gray-900">{card.front}</p>
                            <Separator />
                            <div>
                              <p className="text-sm text-green-800 mb-2">Answer:</p>
                              <p className="text-gray-900 whitespace-pre-wrap">{card.back}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="size-4 mr-2" />
                      Export Flashcards
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Layers className="size-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Create AI-generated flashcards from this content</p>
                    <Button onClick={generateAIFlashcards} className="bg-green-600">
                      <Sparkles className="size-4 mr-2" />
                      Generate Flashcards
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="explain" className="space-y-4">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
                    <p className="text-gray-600">AI is explaining the concept...</p>
                  </div>
                ) : aiExplanation ? (
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <pre className="whitespace-pre-wrap font-sans">{aiExplanation}</pre>
                      <Button className="mt-4" variant="outline">
                        <Download className="size-4 mr-2" />
                        Export Explanation
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="size-16 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Get a simplified explanation of complex concepts</p>
                    <Button onClick={generateAIExplanation} className="bg-yellow-600">
                      <Sparkles className="size-4 mr-2" />
                      Explain This
                    </Button>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
