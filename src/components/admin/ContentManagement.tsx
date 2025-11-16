import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  BookOpen,
  Brain,
  FileText,
  Search,
  Trash2,
  Edit,
  Eye,
  Plus,
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Copy,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Tags,
  Layers
} from 'lucide-react';
import {
  getAllQuestions,
  getAllFlashcards,
  getAllBooks,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  createBook,
  updateBook,
  deleteBook,
  bulkDeleteQuestions,
  bulkDeleteFlashcards,
  bulkUpdateQuestions,
  duplicateQuestion,
  importQuestionsFromFile,
  importFlashcardsFromFile,
  exportQuestionsToCSV,
  exportFlashcardsToCSV,
  getContentStats,
  type Question,
  type Flashcard,
  type Book,
  type ContentFilters
} from '../../services/contentApi';
import { toast } from 'sonner@2.0.3';

export function ContentManagement() {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  
  // Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form data
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'management-of-care',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: [] as string[],
    isActive: true,
    rationale: '',
    references: [] as string[]
  });
  
  const [flashcardForm, setFlashcardForm] = useState({
    front: '',
    back: '',
    category: 'management-of-care',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: [] as string[],
    isActive: true
  });
  
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    author: 'NurseHaven Team',
    coverImage: '',
    category: 'nclex-prep',
    totalPages: 0,
    isActive: true,
    isPremium: false,
    chapters: []
  });
  
  const [importFile, setImportFile] = useState<File | null>(null);

  const categories = [
    { value: 'management-of-care', label: 'Management of Care' },
    { value: 'safety-infection-control', label: 'Safety & Infection Control' },
    { value: 'pharmacological-therapies', label: 'Pharmacological Therapies' },
    { value: 'reduction-of-risk', label: 'Reduction of Risk' },
    { value: 'physiological-adaptation', label: 'Physiological Adaptation' },
    { value: 'basic-care-comfort', label: 'Basic Care & Comfort' },
    { value: 'health-promotion', label: 'Health Promotion' },
    { value: 'psychosocial-integrity', label: 'Psychosocial Integrity' }
  ];

  useEffect(() => {
    loadData();
    loadStats();
  }, [activeTab, currentPage, searchQuery, categoryFilter, difficultyFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: ContentFilters = {
        page: currentPage,
        limit: 20,
        search: searchQuery,
        category: categoryFilter || undefined,
        difficulty: difficultyFilter as any || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (activeTab === 'questions') {
        const response = await getAllQuestions(filters);
        setQuestions(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      } else if (activeTab === 'flashcards') {
        const response = await getAllFlashcards(filters);
        setFlashcards(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      } else if (activeTab === 'books') {
        const allBooks = await getAllBooks();
        setBooks(allBooks);
        setTotalItems(allBooks.length);
      }
    } catch (error) {
      toast.error('Failed to load content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const statsData = await getContentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  // Handlers
  const handleView = (item: any) => {
    setSelectedItem(item);
    setViewDialog(true);
  };

  const handleCreate = () => {
    if (activeTab === 'questions') {
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        category: 'management-of-care',
        difficulty: 'medium',
        tags: [],
        isActive: true,
        rationale: '',
        references: []
      });
    } else if (activeTab === 'flashcards') {
      setFlashcardForm({
        front: '',
        back: '',
        category: 'management-of-care',
        difficulty: 'medium',
        tags: [],
        isActive: true
      });
    } else if (activeTab === 'books') {
      setBookForm({
        title: '',
        description: '',
        author: 'NurseHaven Team',
        coverImage: '',
        category: 'nclex-prep',
        totalPages: 0,
        isActive: true,
        isPremium: false,
        chapters: []
      });
    }
    setCreateDialog(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    
    if (activeTab === 'questions') {
      setQuestionForm({
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        category: item.category,
        difficulty: item.difficulty,
        tags: item.tags,
        isActive: item.isActive,
        rationale: item.rationale || '',
        references: item.references || []
      });
    } else if (activeTab === 'flashcards') {
      setFlashcardForm({
        front: item.front,
        back: item.back,
        category: item.category,
        difficulty: item.difficulty,
        tags: item.tags,
        isActive: item.isActive
      });
    } else if (activeTab === 'books') {
      setBookForm({
        title: item.title,
        description: item.description,
        author: item.author,
        coverImage: item.coverImage,
        category: item.category,
        totalPages: item.totalPages,
        isActive: item.isActive,
        isPremium: item.isPremium,
        chapters: item.chapters
      });
    }
    
    setEditDialog(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const handleDuplicate = async (question: Question) => {
    try {
      await duplicateQuestion(question.id);
      toast.success('Question duplicated successfully');
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to duplicate question');
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }
    setBulkDeleteDialog(true);
  };

  const handleExport = async () => {
    try {
      let csv = '';
      
      if (activeTab === 'questions') {
        csv = await exportQuestionsToCSV({
          category: categoryFilter || undefined,
          difficulty: difficultyFilter as any || undefined,
          isActive: statusFilter ? statusFilter === 'active' : undefined
        });
      } else if (activeTab === 'flashcards') {
        csv = await exportFlashcardsToCSV({
          category: categoryFilter || undefined,
          difficulty: difficultyFilter as any || undefined
        });
      }
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${activeTab} exported successfully`);
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const handleImport = () => {
    setImportFile(null);
    setImportDialog(true);
  };

  // Form submissions
  const submitCreate = async () => {
    try {
      if (activeTab === 'questions') {
        await createQuestion({
          ...questionForm,
          createdBy: 'admin'
        });
        toast.success('Question created successfully');
      } else if (activeTab === 'flashcards') {
        await createFlashcard({
          ...flashcardForm,
          createdBy: 'admin'
        });
        toast.success('Flashcard created successfully');
      } else if (activeTab === 'books') {
        await createBook(bookForm);
        toast.success('Book created successfully');
      }
      
      setCreateDialog(false);
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const submitEdit = async () => {
    if (!selectedItem) return;
    
    try {
      if (activeTab === 'questions') {
        await updateQuestion(selectedItem.id, questionForm);
        toast.success('Question updated successfully');
      } else if (activeTab === 'flashcards') {
        await updateFlashcard(selectedItem.id, flashcardForm);
        toast.success('Flashcard updated successfully');
      } else if (activeTab === 'books') {
        await updateBook(selectedItem.id, bookForm);
        toast.success('Book updated successfully');
      }
      
      setEditDialog(false);
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const submitDelete = async () => {
    if (!selectedItem) return;
    
    try {
      if (activeTab === 'questions') {
        await deleteQuestion(selectedItem.id);
        toast.success('Question deleted successfully');
      } else if (activeTab === 'flashcards') {
        await deleteFlashcard(selectedItem.id);
        toast.success('Flashcard deleted successfully');
      } else if (activeTab === 'books') {
        await deleteBook(selectedItem.id);
        toast.success('Book deleted successfully');
      }
      
      setDeleteDialog(false);
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const submitBulkDelete = async () => {
    try {
      const ids = Array.from(selectedItems);
      
      if (activeTab === 'questions') {
        const result = await bulkDeleteQuestions(ids);
        toast.success(`${result.deleted} questions deleted`);
      } else if (activeTab === 'flashcards') {
        const result = await bulkDeleteFlashcards(ids);
        toast.success(`${result.deleted} flashcards deleted`);
      }
      
      setBulkDeleteDialog(false);
      setSelectedItems(new Set());
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete items');
    }
  };

  const submitImport = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }
    
    try {
      let result;
      
      if (activeTab === 'questions') {
        result = await importQuestionsFromFile(importFile);
      } else if (activeTab === 'flashcards') {
        result = await importFlashcardsFromFile(importFile);
      }
      
      if (result) {
        toast.success(`Successfully imported ${result.success} items. ${result.failed} failed.`);
        setImportDialog(false);
        loadData();
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to import file');
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (activeTab === 'questions') {
      if (selectedItems.size === questions.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(questions.map(q => q.id)));
      }
    } else if (activeTab === 'flashcards') {
      if (selectedItems.size === flashcards.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(flashcards.map(f => f.id)));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 dark:text-white mb-2">Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage questions, flashcards, and study materials</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImport} variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <Upload className="size-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleExport} variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="size-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400">Questions</p>
                <Brain className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl dark:text-white mb-1">{stats.questions.total}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {stats.questions.active} active, {stats.questions.inactive} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400">Flashcards</p>
                <Layers className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl dark:text-white mb-1">{stats.flashcards.total}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {stats.flashcards.active} active sets
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400">Books</p>
                <BookOpen className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl dark:text-white mb-1">{stats.books.total}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {stats.books.premium} premium
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); setSelectedItems(new Set()); }}>
        <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
          <TabsTrigger value="questions" className="dark:data-[state=active]:bg-gray-700">
            <Brain className="size-4 mr-2" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="dark:data-[state=active]:bg-gray-700">
            <Layers className="size-4 mr-2" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="books" className="dark:data-[state=active]:bg-gray-700">
            <BookOpen className="size-4 mr-2" />
            Books
          </TabsTrigger>
        </TabsList>

        {/* Filters & Search */}
        <Card className="border-2 dark:bg-gray-800 dark:border-gray-700 mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {activeTab !== 'books' && (
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedItems.size} item(s) selected
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedItems(new Set())}>
                    Clear Selection
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="size-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <p>Showing {totalItems} items</p>
              {activeTab !== 'books' && (
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.size === (activeTab === 'questions' ? questions.length : flashcards.length) ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Tables */}
        <TabsContent value="questions">
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="size-12 mb-4" />
                  <p className="text-lg">No questions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === questions.length}
                            onChange={selectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Question</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Category</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Difficulty</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {questions.map((question) => (
                        <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(question.id)}
                              onChange={() => toggleSelectItem(question.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white max-w-md truncate">
                              {question.question}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {question.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {categories.find(c => c.value === question.category)?.label || question.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              question.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }>
                              {question.difficulty}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              question.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }>
                              {question.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                                <DropdownMenuItem onClick={() => handleView(question)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Eye className="size-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(question)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Edit className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(question)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Copy className="size-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(question)} 
                                  className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
              ) : flashcards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="size-12 mb-4" />
                  <p className="text-lg">No flashcards found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === flashcards.length}
                            onChange={selectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Front</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Category</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Difficulty</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {flashcards.map((flashcard) => (
                        <tr key={flashcard.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(flashcard.id)}
                              onChange={() => toggleSelectItem(flashcard.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white max-w-md truncate">
                              {flashcard.front}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {categories.find(c => c.value === flashcard.category)?.label || flashcard.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              flashcard.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              flashcard.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }>
                              {flashcard.difficulty}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              flashcard.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }>
                              {flashcard.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                                <DropdownMenuItem onClick={() => handleView(flashcard)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Eye className="size-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(flashcard)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Edit className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(flashcard)} 
                                  className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-600" />
              </div>
            ) : books.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <AlertCircle className="size-12 mb-4" />
                <p className="text-lg">No books found</p>
              </div>
            ) : (
              books.map((book) => (
                <Card key={book.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold dark:text-white mb-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={book.isPremium ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}>
                        {book.isPremium ? 'Premium' : 'Free'}
                      </Badge>
                      <Badge className={book.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}>
                        {book.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(book)} className="flex-1">
                        <Eye className="size-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(book)} className="text-red-600">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && activeTab !== 'books' && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs - View, Create, Edit, Delete, Import */}
      {/* Add dialog implementations here similar to UserManagement */}
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Delete Item</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Delete Multiple Items</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete {selectedItems.size} items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitBulkDelete}>Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Import {activeTab}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Upload a CSV or Excel file to import {activeTab}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Upload File</Label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mt-2 w-full"
              />
            </div>
            {importFile && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Selected: {importFile.name}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialog(false)}>Cancel</Button>
            <Button onClick={submitImport}>
              <Upload className="size-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
