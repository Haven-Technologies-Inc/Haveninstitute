import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
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
  Mail
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
- Used for insulin, heparin, immunizations`
    ],
    totalPages: 4,
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
3. Metabolism - Drug broken down (primarily liver)
4. Excretion - Drug eliminated (primarily kidneys)

Pharmacodynamics - What the drug does to the body:
- Mechanism of action
- Therapeutic effects
- Side effects and adverse reactions
- Drug interactions`,
      
      `Common Drug Classifications:

Analgesics (Pain Management):
- Opioids: Morphine, Fentanyl, Hydrocodone
- NSAIDs: Ibuprofen, Naproxen
- Acetaminophen

Antibiotics:
- Penicillins: Amoxicillin
- Cephalosporins: Ceftriaxone
- Fluoroquinolones: Ciprofloxacin
- Monitor for allergic reactions

Cardiovascular Medications:
- Beta Blockers: Metoprolol (monitor HR, BP)
- ACE Inhibitors: Lisinopril (check for dry cough)
- Diuretics: Furosemide (monitor K+ levels)
- Anticoagulants: Warfarin (monitor INR)`
    ],
    totalPages: 2,
    purchaseDate: '2024-11-12',
    price: 24.99,
    isOwned: true,
    category: 'Pharmacology',
    rating: 4.7,
    description: 'Simplified pharmacology guide with drug classifications and nursing implications'
  },
  {
    id: '3',
    title: 'Pediatric Nursing Essentials',
    author: 'Linda Johnson, MSN, RN',
    coverImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    price: 27.99,
    isOwned: false,
    category: 'Specialty',
    rating: 4.6,
    description: 'Comprehensive guide to pediatric nursing care with age-specific considerations',
    content: [],
    totalPages: 0
  },
  {
    id: '4',
    title: 'Critical Care Nursing Made Easy',
    author: 'Robert Williams, DNP, CCRN',
    coverImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    price: 34.99,
    isOwned: false,
    category: 'Specialty',
    rating: 4.9,
    description: 'Essential critical care concepts, monitoring, and interventions for ICU nursing',
    content: [],
    totalPages: 0
  },
  {
    id: '5',
    title: 'Medical-Surgical Nursing Review',
    author: 'Emily Davis, MSN, RN',
    coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    price: 32.99,
    isOwned: false,
    category: 'Complete Review',
    rating: 4.7,
    description: 'Comprehensive med-surg review with system-based organization',
    content: [],
    totalPages: 0
  },
  {
    id: '6',
    title: 'Mental Health Nursing Success',
    author: 'Dr. Patricia Martinez, PhD, PMHNP',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    price: 26.99,
    isOwned: false,
    category: 'Specialty',
    rating: 4.5,
    description: 'Psychiatric nursing concepts, therapeutic communication, and mental health disorders',
    content: [],
    totalPages: 0
  }
];

export function BookReader({ onBack }: BookReaderProps) {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notes, setNotes] = useState<{ [page: number]: string }>({});
  const [showAITools, setShowAITools] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [bookToPurchase, setBookToPurchase] = useState<Book | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [summary, setSummary] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [activeTab, setActiveTab] = useState('library');

  const myBooks = allBooks.filter(b => b.isOwned);
  const availableBooks = allBooks.filter(b => !b.isOwned);

  const handleBookSelect = (book: Book) => {
    if (!book.isOwned) {
      setBookToPurchase(book);
      setShowPurchaseDialog(true);
      return;
    }
    setSelectedBook(book);
    setCurrentPage(0);
    setBookmarks([]);
    setHighlights([]);
    setNotes({});
    setGeneratedQuestions([]);
    setGeneratedFlashcards([]);
    setSummary('');
  };

  const handlePurchaseBook = (method: 'ebook' | 'physical') => {
    if (method === 'ebook') {
      // Simulate ebook purchase
      alert(`✅ Purchase successful! "${bookToPurchase?.title}" has been added to your library and sent to your email.`);
      // In real app, would update backend and user's book list
    } else {
      // Open Amazon link
      window.open('https://www.amazon.com', '_blank');
    }
    setShowPurchaseDialog(false);
    setBookToPurchase(null);
  };

  const handleGenerateQuestions = () => {
    if (!selectedBook) return;

    // Simulate AI generation
    const questions: GeneratedQuestion[] = [
      {
        id: '1',
        question: 'What are the two main types of advance directives?',
        options: [
          'Living Will and Durable Power of Attorney',
          'DNR and Living Will',
          'Healthcare Proxy and DNR',
          'Power of Attorney and Healthcare Directive'
        ],
        correctAnswer: 0,
        explanation: 'The two main types of advance directives are Living Will (specifies medical treatments) and Durable Power of Attorney for Healthcare (designates decision maker).'
      },
      {
        id: '2',
        question: 'What is the correct order of the ABC priority framework?',
        options: [
          'Circulation, Airway, Breathing',
          'Airway, Breathing, Circulation',
          'Breathing, Airway, Circulation',
          'Airway, Circulation, Breathing'
        ],
        correctAnswer: 1,
        explanation: 'The ABC priority framework is Airway, Breathing, Circulation - this is the correct order for assessing and intervening in emergency situations.'
      },
      {
        id: '3',
        question: 'Which of the following is NOT one of the "Five Rights" of medication administration?',
        options: [
          'Right Patient',
          'Right Dose',
          'Right Diagnosis',
          'Right Route'
        ],
        correctAnswer: 2,
        explanation: 'The Five Rights are: Patient, Medication, Dose, Route, and Time. Diagnosis is not one of the traditional Five Rights.'
      },
      {
        id: '4',
        question: 'What is the maximum volume for an intramuscular injection in a large muscle?',
        options: [
          '1 mL',
          '2 mL',
          '3 mL',
          '5 mL'
        ],
        correctAnswer: 2,
        explanation: 'The maximum volume for an IM injection in a large muscle is 3 mL. Exceeding this volume can cause pain and tissue damage.'
      },
      {
        id: '5',
        question: 'Which ethical principle means "do no harm"?',
        options: [
          'Autonomy',
          'Beneficence',
          'Nonmaleficence',
          'Justice'
        ],
        correctAnswer: 2,
        explanation: 'Nonmaleficence is the ethical principle that means "do no harm." It requires nurses to avoid causing harm to patients.'
      }
    ];

    setGeneratedQuestions(questions);
    setShowAITools(true);
  };

  const handleGenerateFlashcards = () => {
    if (!selectedBook) return;

    const flashcards: GeneratedFlashcard[] = [
      {
        id: '1',
        front: 'What is an Advance Directive?',
        back: 'A legal document that allows individuals to specify their healthcare preferences in advance of serious illness. Includes Living Will and Durable Power of Attorney for Healthcare.'
      },
      {
        id: '2',
        front: 'List the Five Rights of Medication Administration',
        back: '1. Right Patient\n2. Right Medication\n3. Right Dose\n4. Right Route\n5. Right Time'
      },
      {
        id: '3',
        front: 'What is the ABC Priority Framework?',
        back: 'A = Airway\nB = Breathing\nC = Circulation\n\nThis framework guides priority setting in emergency situations.'
      },
      {
        id: '4',
        front: 'Name three ethical principles in nursing',
        back: '• Autonomy - respect for self-determination\n• Beneficence - acting in client\'s best interest\n• Nonmaleficence - do no harm\n• Justice - fair treatment\n• Fidelity - faithfulness\n• Veracity - truthfulness'
      },
      {
        id: '5',
        front: 'What are High-Alert Medications?',
        back: 'Medications that require special attention:\n• Insulin\n• Heparin and anticoagulants\n• Opioids\n• Chemotherapy agents\n• Neuromuscular blocking agents'
      },
      {
        id: '6',
        front: 'Maximum volume for IM injection?',
        back: '3 mL in large muscle (e.g., vastus lateralis, ventrogluteal)\n1 mL in deltoid muscle'
      },
      {
        id: '7',
        front: 'What is Pharmacokinetics?',
        back: 'What the body does to the drug:\n1. Absorption\n2. Distribution\n3. Metabolism\n4. Excretion'
      },
      {
        id: '8',
        front: 'Common IM injection sites',
        back: '• Deltoid (upper arm)\n• Vastus lateralis (thigh)\n• Ventrogluteal (hip)\n\nRotate sites to prevent tissue damage'
      }
    ];

    setGeneratedFlashcards(flashcards);
    setShowAITools(true);
  };

  const handleGenerateSummary = () => {
    if (!selectedBook) return;

    const summaryText = `📚 **Summary of "${selectedBook.title}" - Chapter ${currentPage + 1}**\n\n**Main Topics:**\n\n${currentPage === 0 ? 
      `1. **Advance Directives**\n   • Living Will and Durable Power of Attorney\n   • Documentation and client rights\n   • Nursing responsibilities\n\n2. **Client Advocacy**\n   • Protecting client rights\n   • Supporting autonomy and self-determination\n   • Cultural sensitivity\n\n3. **Ethical Principles**\n   • Autonomy, Beneficence, Nonmaleficence\n   • Justice, Fidelity, Veracity\n\n4. **Priority Setting**\n   • Maslow's Hierarchy of Needs\n   • ABC Framework (Airway, Breathing, Circulation)\n   • Critical thinking in care prioritization` 
      : currentPage === 1 ?
      `1. **Client Advocacy Principles**\n   • Informed consent procedures\n   • Supporting client autonomy\n   • Protecting vulnerable populations\n\n2. **Ethical Framework**\n   • Six key ethical principles\n   • Application in clinical practice\n   • Resolving ethical dilemmas\n\n3. **Priority Setting Methods**\n   • Maslow's Hierarchy application\n   • ABC priority framework\n   • Delegation principles`
      : currentPage === 2 ?
      `1. **Medication Safety**\n   • Five Rights of medication administration\n   • Additional safety considerations\n   • Error prevention strategies\n\n2. **High-Alert Medications**\n   • Insulin, Heparin, Opioids\n   • Special handling requirements\n   • Monitoring parameters\n\n3. **Documentation**\n   • Accurate medication records\n   • Incident reporting\n   • Legal considerations`
      :
      `1. **Medication Routes**\n   • Oral administration considerations\n   • IM injection technique and sites\n   • IV administration safety\n   • Subcutaneous injection guidelines\n\n2. **Route Selection**\n   • Factors affecting route choice\n   • Onset of action comparison\n   • Patient-specific considerations\n\n3. **Site Rotation**\n   • Preventing tissue damage\n   • Documentation of sites\n   • Patient education`
    }\n\n**Key Takeaways:**\n• Focus on patient safety and rights\n• Understand priority frameworks for clinical decision-making\n• Master medication administration principles\n• Apply ethical principles in practice\n\n**Study Tips:**\n✓ Create mnemonics for the Five Rights\n✓ Practice priority-setting scenarios\n✓ Review ethical principles with case studies\n✓ Memorize common medication routes and sites`;

    setSummary(summaryText);
    setShowAITools(true);
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const calculateProgress = () => {
    if (!selectedBook) return 0;
    return Math.round(((currentPage + 1) / selectedBook.totalPages) * 100);
  };

  // Library View
  if (!selectedBook) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <BookMarked className="size-7 text-white" />
              </div>
              My Books
            </h2>
            <p className="text-gray-600 mt-1">Access your NCLEX study ebooks and resources</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 size-4" />
            Back to Dashboard
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="library">
              <BookMarked className="mr-2 size-4" />
              My Library ({myBooks.length})
            </TabsTrigger>
            <TabsTrigger value="store">
              <ShoppingCart className="mr-2 size-4" />
              Book Store ({availableBooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            {myBooks.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="size-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">No Books Yet</h3>
                  <p className="text-gray-600 mb-6">Purchase ebooks from the Book Store to start studying</p>
                  <Button onClick={() => setActiveTab('store')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Browse Book Store
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBooks.map((book) => (
                  <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleBookSelect(book)}>
                    <CardHeader className="pb-3">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 shrink-0">
                          <CheckCircle2 className="size-3 mr-1" />
                          Owned
                        </Badge>
                      </div>
                      <CardDescription>{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Category:</span>
                          <Badge variant="outline">{book.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pages:</span>
                          <span className="text-gray-900">{book.totalPages}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-gray-900">{book.rating}</span>
                          </div>
                        </div>
                        {book.purchaseDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Purchased:</span>
                            <span className="text-gray-900">{new Date(book.purchaseDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                        <BookOpen className="mr-2 size-4" />
                        Read Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="store">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="relative">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                        ${book.price}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{book.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{book.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-900">{book.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                      onClick={() => handleBookSelect(book)}
                    >
                      <ShoppingCart className="mr-2 size-4" />
                      Purchase - ${book.price}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Purchase Dialog */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase "{bookToPurchase?.title}"</DialogTitle>
              <DialogDescription>
                Choose how you'd like to receive this book
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              {/* Ebook Option */}
              <Card className="cursor-pointer hover:border-blue-600 transition-colors" onClick={() => handlePurchaseBook('ebook')}>
                <CardHeader>
                  <div className="p-4 bg-blue-50 rounded-xl w-fit mb-4">
                    <Mail className="size-8 text-blue-600" />
                  </div>
                  <CardTitle>Digital Ebook</CardTitle>
                  <CardDescription>Instant access via email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Instant delivery to email</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Read on any device</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>AI study tools included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Searchable text</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-3xl text-gray-900 mb-2">${bookToPurchase?.price}</div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Buy Ebook Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Book Option */}
              <Card className="cursor-pointer hover:border-green-600 transition-colors" onClick={() => handlePurchaseBook('physical')}>
                <CardHeader>
                  <div className="p-4 bg-green-50 rounded-xl w-fit mb-4">
                    <BookOpen className="size-8 text-green-600" />
                  </div>
                  <CardTitle>Physical Book</CardTitle>
                  <CardDescription>Order from Amazon</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Physical paperback</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Shipped to your door</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>Highlight and annotate</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="size-4 text-green-600" />
                      <span>No screen time needed</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-gray-600 text-sm mb-2">Available on Amazon</div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                      Order on Amazon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Book Reader View
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => setSelectedBook(null)}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Library
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleBookmark}>
            <Bookmark className="size-5" fill={bookmarks.includes(currentPage) ? 'currentColor' : 'none'} />
          </Button>
          <Button variant="outline" onClick={() => setShowAITools(true)}>
            <Sparkles className="mr-2 size-4" />
            AI Tools
          </Button>
        </div>
      </div>

      {/* Book Info & Progress */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedBook.title}</CardTitle>
              <CardDescription>{selectedBook.author}</CardDescription>
            </div>
            <Badge>{calculateProgress()}% Complete</Badge>
          </div>
          <Progress value={calculateProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Reading Area */}
      <Card>
        <CardContent className="pt-8">
          <div 
            className="prose max-w-none mb-8 whitespace-pre-wrap" 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {selectedBook.content[currentPage]}
          </div>

          {/* Notes Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <Label className="mb-2 block">Notes for this page:</Label>
            <Textarea
              value={notes[currentPage] || ''}
              onChange={(e) => setNotes({ ...notes, [currentPage]: e.target.value })}
              placeholder="Add your notes here..."
              className="min-h-[100px]"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="outline"
            >
              <ChevronLeft className="mr-2 size-4" />
              Previous Page
            </Button>

            <span className="text-gray-600">
              Page {currentPage + 1} of {selectedBook.totalPages}
            </span>

            <Button
              onClick={() => setCurrentPage(Math.min(selectedBook.totalPages - 1, currentPage + 1))}
              disabled={currentPage === selectedBook.totalPages - 1}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Next Page
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Tools Dialog */}
      <Dialog open={showAITools} onOpenChange={setShowAITools}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" />
              AI Study Tools
            </DialogTitle>
            <DialogDescription>
              Generate questions, flashcards, and summaries from this content
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="generate" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="questions" disabled={generatedQuestions.length === 0}>
                Questions ({generatedQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="flashcards" disabled={generatedFlashcards.length === 0}>
                Flashcards ({generatedFlashcards.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-blue-600 transition-colors" onClick={handleGenerateQuestions}>
                  <CardHeader>
                    <Brain className="size-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">Generate Questions</CardTitle>
                    <CardDescription>Create practice questions from this page</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate</Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-purple-600 transition-colors" onClick={handleGenerateFlashcards}>
                  <CardHeader>
                    <BookOpen className="size-8 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">Create Flashcards</CardTitle>
                    <CardDescription>Make study flashcards automatically</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate</Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-green-600 transition-colors" onClick={handleGenerateSummary}>
                  <CardHeader>
                    <FileText className="size-8 text-green-600 mb-2" />
                    <CardTitle className="text-lg">Summarize Content</CardTitle>
                    <CardDescription>Get a concise summary of key points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Generate</Button>
                  </CardContent>
                </Card>
              </div>

              {summary && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Generated Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{summary}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              {generatedQuestions.map((q, idx) => (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                    <p className="text-gray-900">{q.question}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {q.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-3 border-2 rounded-lg ${
                          optIdx === q.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="text-gray-900">{option}</span>
                          {optIdx === q.correctAnswer && (
                            <CheckCircle2 className="size-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-blue-900"><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedFlashcards.map((card) => (
                  <Card key={card.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50">
                      <CardTitle className="text-base">Front</CardTitle>
                      <p className="text-gray-900">{card.front}</p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 mb-2"><strong>Back:</strong></p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{card.back}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}