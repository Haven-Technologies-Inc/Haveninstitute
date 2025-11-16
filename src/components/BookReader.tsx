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
  MessageSquare
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  content: string[];
  totalPages: number;
  purchaseDate: string;
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

// Sample book library
const myBooks: Book[] = [
  {
    id: '1',
    title: 'NCLEX-RN Complete Review 2024',
    author: 'Dr. Sarah Mitchell, RN, PhD',
    coverImage: 'https://images.unsplash.com/photo-1652787544912-137c7f92f99b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      'Chapter 1: Safe and Effective Care Environment\n\nManagement of Care is one of the most critical domains in NCLEX-RN testing. This chapter covers essential concepts including advance directives, advocacy, case management, client rights, collaboration with interdisciplinary team, concepts of management, confidentiality/information security, continuity of care, establishing priorities, ethical practice, informed consent, information technology, legal rights and responsibilities, and performance improvement.\n\nAdvance Directives:\nAn advance directive is a legal document that allows individuals to specify their healthcare preferences in advance of serious illness. There are two main types:\n1. Living Will - Specifies medical treatments a person wants or does not want\n2. Durable Power of Attorney for Healthcare - Designates someone to make healthcare decisions\n\nKey Nursing Responsibilities:\n- Ensure advance directives are documented in the medical record\n- Honor the client\'s wishes as stated in advance directives\n- Provide information about advance directives to all clients\n- Advocate for the client\'s rights and preferences\n- Notify appropriate personnel when conflicts arise',
      
      'Client Advocacy:\nNurses serve as advocates by protecting client rights and supporting their decisions. This includes:\n- Ensuring informed consent is obtained\n- Supporting client autonomy and self-determination\n- Protecting vulnerable populations\n- Speaking up for clients who cannot advocate for themselves\n- Ensuring cultural sensitivity and respect\n\nEthical Principles in Nursing:\n1. Autonomy - Respecting the client\'s right to make their own decisions\n2. Beneficence - Acting in the client\'s best interest\n3. Nonmaleficence - "Do no harm"\n4. Justice - Fair and equal treatment\n5. Fidelity - Being faithful to commitments and responsibilities\n6. Veracity - Truthfulness\n\nPriority Setting and Delegation:\nMaslow\'s Hierarchy of Needs provides a framework for priority setting:\n- Physiological needs (airway, breathing, circulation)\n- Safety and security\n- Love and belonging\n- Self-esteem\n- Self-actualization\n\nABC Priority Framework:\n- Airway\n- Breathing  \n- Circulation',
      
      'Chapter 2: Pharmacological and Parenteral Therapies\n\nPharmacology is a significant component of the NCLEX-RN exam. This chapter covers medication administration, expected actions/outcomes, adverse effects, contraindications, medication interactions, pharmacological pain management, and total parenteral nutrition.\n\nMedication Safety:\nThe "Five Rights" of medication administration:\n1. Right Patient - Verify using two identifiers\n2. Right Medication - Check label three times\n3. Right Dose - Calculate carefully\n4. Right Route - Confirm appropriate route\n5. Right Time - Administer at prescribed time\n\nAdditional considerations:\n- Right Documentation\n- Right to Refuse\n- Right Assessment\n- Right Education\n- Right Evaluation\n\nHigh-Alert Medications require special attention:\n- Insulin\n- Heparin and anticoagulants\n- Opioids\n- Chemotherapy agents\n- Neuromuscular blocking agents',
      
      'Medication Administration Routes:\n\nOral Administration:\n- Most common and convenient route\n- Slower onset of action\n- First-pass metabolism in liver\n- Cannot use if NPO or vomiting\n\nIntramuscular (IM) Injection:\n- Faster absorption than oral\n- Maximum volume: 3 mL in large muscle\n- Common sites: Deltoid, Vastus lateralis, Ventrogluteal\n- Use Z-track technique for irritating medications\n\nIntravenous (IV) Administration:\n- Most rapid onset of action\n- 100% bioavailability\n- Allows for large volumes\n- Monitor for infiltration, phlebitis, infection\n- Critical for emergency medications\n\nSubcutaneous Injection:\n- Slower, sustained absorption\n- Maximum volume: 1.5 mL\n- Common sites: Abdomen, upper arms, thighs\n- Rotate injection sites\n- Used for insulin, heparin, immunizations'
    ],
    totalPages: 4,
    purchaseDate: '2024-11-10'
  },
  {
    id: '2',
    title: 'Pharmacology Made Easy for NCLEX',
    author: 'Dr. Michael Chen, PharmD',
    coverImage: 'https://images.unsplash.com/photo-1760006782177-7f05cce886bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    content: [
      'Introduction to Pharmacology\n\nPharmacology is the study of drugs and their effects on the body. Understanding key concepts is essential for safe medication administration and optimal patient outcomes.\n\nPharmacokinetics - What the body does to the drug:\n1. Absorption - Drug enters bloodstream\n2. Distribution - Drug travels through body\n3. Metabolism - Drug broken down (primarily liver)\n4. Excretion - Drug eliminated (primarily kidneys)\n\nPharmacodynamics - What the drug does to the body:\n- Mechanism of action\n- Therapeutic effects\n- Side effects and adverse reactions\n- Drug interactions',
      
      'Common Drug Classifications:\n\nAnalgesics (Pain Management):\n- Opioids: Morphine, Fentanyl, Hydrocodone\n- NSAIDs: Ibuprofen, Naproxen\n- Acetaminophen\n\nAntibiotics:\n- Penicillins: Amoxicillin\n- Cephalosporins: Ceftriaxone\n- Fluoroquinolones: Ciprofloxacin\n- Monitor for allergic reactions\n\nCardiovascular Medications:\n- Beta Blockers: Metoprolol (monitor HR, BP)\n- ACE Inhibitors: Lisinopril (check for dry cough)\n- Diuretics: Furosemide (monitor K+ levels)\n- Anticoagulants: Warfarin (monitor INR)'
    ],
    totalPages: 2,
    purchaseDate: '2024-11-12'
  }
];

export function BookReader({ onBack }: BookReaderProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notes, setNotes] = useState<{ [page: number]: string }>({});
  const [showAITools, setShowAITools] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('questions');

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (selectedBook && currentPage < selectedBook.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const handleGenerateQuestions = () => {
    if (!selectedBook) return;
    
    setIsGenerating(true);
    setActiveTab('questions');
    
    // Simulate AI generation
    setTimeout(() => {
      const questions: GeneratedQuestion[] = [
        {
          id: '1',
          question: 'What are the five rights of medication administration?',
          options: [
            'Right patient, medication, dose, route, time',
            'Right patient, doctor, dose, route, time',
            'Right medication, dose, route, time, location',
            'Right patient, medication, nurse, route, time'
          ],
          correctAnswer: 0,
          explanation: 'The five rights are: Right Patient, Right Medication, Right Dose, Right Route, and Right Time. These are fundamental safety checks that must be performed before administering any medication.'
        },
        {
          id: '2',
          question: 'According to Maslow\'s Hierarchy, which need should be prioritized first?',
          options: [
            'Self-esteem needs',
            'Safety and security',
            'Physiological needs (airway, breathing, circulation)',
            'Love and belonging'
          ],
          correctAnswer: 2,
          explanation: 'Physiological needs such as airway, breathing, and circulation must be addressed first as they are essential for survival. This follows the ABC (Airway, Breathing, Circulation) priority framework.'
        },
        {
          id: '3',
          question: 'What is the maximum volume for an intramuscular (IM) injection in a large muscle?',
          options: [
            '1 mL',
            '2 mL',
            '3 mL',
            '5 mL'
          ],
          correctAnswer: 2,
          explanation: 'The maximum volume for an IM injection in a large muscle is 3 mL. Larger volumes should be divided between multiple injection sites to ensure proper absorption and minimize discomfort.'
        },
        {
          id: '4',
          question: 'Which medication route provides 100% bioavailability and the most rapid onset?',
          options: [
            'Oral',
            'Subcutaneous',
            'Intramuscular',
            'Intravenous'
          ],
          correctAnswer: 3,
          explanation: 'Intravenous (IV) administration provides 100% bioavailability because the medication goes directly into the bloodstream, bypassing absorption barriers. This results in the most rapid onset of action.'
        }
      ];
      
      setGeneratedQuestions(questions);
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateFlashcards = () => {
    if (!selectedBook) return;
    
    setIsGenerating(true);
    setActiveTab('flashcards');
    
    setTimeout(() => {
      const flashcards: GeneratedFlashcard[] = [
        {
          id: '1',
          front: 'What are Advance Directives?',
          back: 'Legal documents that allow individuals to specify healthcare preferences in advance. Include Living Will (specifies treatments wanted/not wanted) and Durable Power of Attorney (designates decision maker).'
        },
        {
          id: '2',
          front: 'Five Rights of Medication Administration',
          back: 'Right Patient, Right Medication, Right Dose, Right Route, Right Time. Additional: Right Documentation, Right to Refuse, Right Assessment, Right Education, Right Evaluation.'
        },
        {
          id: '3',
          front: 'ABC Priority Framework',
          back: 'A - Airway, B - Breathing, C - Circulation. This is the priority order for assessing and treating patients in emergency situations.'
        },
        {
          id: '4',
          front: 'High-Alert Medications',
          back: 'Medications requiring special attention: Insulin, Heparin/anticoagulants, Opioids, Chemotherapy agents, Neuromuscular blocking agents.'
        },
        {
          id: '5',
          front: 'Pharmacokinetics (4 processes)',
          back: 'ADME: Absorption (drug enters bloodstream), Distribution (travels through body), Metabolism (broken down in liver), Excretion (eliminated via kidneys).'
        },
        {
          id: '6',
          front: 'Ethical Principles in Nursing',
          back: 'Autonomy (self-determination), Beneficence (do good), Nonmaleficence (do no harm), Justice (fair treatment), Fidelity (faithfulness), Veracity (truthfulness).'
        }
      ];
      
      setGeneratedFlashcards(flashcards);
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateSummary = () => {
    if (!selectedBook) return;
    
    setIsGenerating(true);
    setActiveTab('summary');
    
    setTimeout(() => {
      const summaryText = `Chapter Summary: ${selectedBook.content[currentPage].split('\n\n')[0]}

Key Concepts:
• Management of care includes advance directives, client advocacy, ethical practice, and priority setting
• The Five Rights of medication administration are essential safety checks
• Maslow's Hierarchy and ABC framework guide priority setting in patient care
• Different medication routes have varying onset times and bioavailability
• High-alert medications require special safety precautions

Critical Takeaways:
1. Always verify patient identity using two identifiers before medication administration
2. Physiological needs (airway, breathing, circulation) take priority over other needs
3. IV administration provides fastest onset and 100% bioavailability
4. Nurses must advocate for client rights while adhering to ethical principles
5. Documentation is essential for continuity of care and legal protection

Study Tips:
- Create mnemonics for medication routes and their characteristics
- Practice prioritization scenarios using ABC and Maslow's frameworks
- Review high-alert medications and their specific safety requirements
- Understand the legal and ethical implications of advance directives`;
      
      setSummary(summaryText);
      setIsGenerating(false);
    }, 2000);
  };

  // Library view
  if (!selectedBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ChevronLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <BookMarked className="size-8 text-blue-600" />
              <h1 className="text-4xl">My Book Library</h1>
            </div>
            <p className="text-gray-600 text-xl">
              Read, study, and generate practice questions from your ebooks
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                placeholder="Search your books..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBooks.map((book) => (
              <Card 
                key={book.id} 
                className="cursor-pointer hover:shadow-xl transition-all group border-2"
                onClick={() => handleBookSelect(book)}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                      <Button className="bg-white text-blue-600">
                        <BookOpen className="size-4 mr-2" />
                        Open Book
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-4">{book.author}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{book.totalPages} pages</span>
                    <span>Purchased {new Date(book.purchaseDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Reader view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setSelectedBook(null)}>
                <ChevronLeft className="size-4 mr-2" />
                Library
              </Button>
              <div className="border-l pl-4">
                <h2 className="text-xl">{selectedBook.title}</h2>
                <p className="text-sm text-gray-600">{selectedBook.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={bookmarks.includes(currentPage) ? "default" : "outline"}
                size="icon"
                onClick={toggleBookmark}
              >
                <Bookmark className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAITools(!showAITools)}
                className="bg-gradient-to-r from-blue-50 to-purple-50"
              >
                <Sparkles className="size-4 mr-2" />
                AI Study Tools
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Page {currentPage + 1} of {selectedBook.totalPages}</span>
              <span>{Math.round(((currentPage + 1) / selectedBook.totalPages) * 100)}% complete</span>
            </div>
            <Progress value={((currentPage + 1) / selectedBook.totalPages) * 100} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Content */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  {selectedBook.content[currentPage].split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-gray-800 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-8 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="size-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {currentPage + 1} / {selectedBook.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === selectedBook.totalPages - 1}
                  >
                    Next
                    <ChevronRight className="size-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Tools Sidebar */}
          <div className="lg:col-span-1">
            {showAITools ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-5 text-blue-600" />
                      AI Study Tools
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAITools(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Generate study materials from this page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                  >
                    <Brain className="size-4 mr-2" />
                    Generate Practice Questions
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleGenerateFlashcards}
                    disabled={isGenerating}
                  >
                    <BookOpen className="size-4 mr-2" />
                    Generate Flashcards
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                  >
                    <FileText className="size-4 mr-2" />
                    Generate Summary
                  </Button>

                  {isGenerating && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Generating with AI...
                    </div>
                  )}

                  {/* Generated Content */}
                  {(generatedQuestions.length > 0 || generatedFlashcards.length > 0 || summary) && (
                    <div className="mt-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="questions">Questions</TabsTrigger>
                          <TabsTrigger value="flashcards">Cards</TabsTrigger>
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                        </TabsList>

                        <TabsContent value="questions" className="space-y-4 mt-4">
                          {generatedQuestions.map((q, idx) => (
                            <Card key={q.id}>
                              <CardContent className="p-4">
                                <p className="mb-3">{idx + 1}. {q.question}</p>
                                <div className="space-y-2">
                                  {q.options.map((option, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded text-sm ${
                                        optIdx === q.correctAnswer
                                          ? 'bg-green-50 border border-green-200'
                                          : 'bg-gray-50'
                                      }`}
                                    >
                                      {optIdx === q.correctAnswer && (
                                        <CheckCircle2 className="size-3 inline mr-2 text-green-600" />
                                      )}
                                      {option}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                                  {q.explanation}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>

                        <TabsContent value="flashcards" className="space-y-3 mt-4">
                          {generatedFlashcards.map((card) => (
                            <Card key={card.id}>
                              <CardContent className="p-4">
                                <p className="text-sm mb-2 text-blue-600">Q:</p>
                                <p className="mb-3">{card.front}</p>
                                <p className="text-sm mb-2 text-green-600">A:</p>
                                <p className="text-sm text-gray-700">{card.back}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>

                        <TabsContent value="summary" className="mt-4">
                          <Card>
                            <CardContent className="p-4">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                {summary}
                              </pre>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Reading Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bookmarks</Label>
                    <div className="mt-2 space-y-2">
                      {bookmarks.length === 0 ? (
                        <p className="text-sm text-gray-500">No bookmarks yet</p>
                      ) : (
                        bookmarks.map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            <Bookmark className="size-3 mr-2" />
                            Page {page + 1}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Quick Actions</Label>
                    <div className="mt-2 space-y-2">
                      <Button variant="outline" className="w-full justify-start text-sm">
                        <Download className="size-3 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-sm">
                        <MessageSquare className="size-3 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
