import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckSquare,
  Square,
  Settings,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getQuestions,
  getQuestionStatistics,
  deleteQuestion as apiDeleteQuestion,
  toggleQuestionStatus,
  exportQuestionsToCSV,
  CATEGORY_LABELS,
  QUESTION_TYPE_LABELS,
  type Question,
  type QuestionStatistics,
  type NCLEXCategory
} from '../../services/questionBankApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Partial<Question>>({});
  const [saving, setSaving] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterCategory !== 'all') filters.category = filterCategory as NCLEXCategory;
      if (filterStatus !== 'all') filters.isActive = filterStatus === 'active';
      if (filterDifficulty !== 'all') filters.difficulty = filterDifficulty;
      if (filterQuestionType !== 'all') filters.questionType = filterQuestionType;
      if (searchQuery) filters.search = searchQuery;

      const [questionsRes, statsRes] = await Promise.all([
        getQuestions(filters, { page, limit: itemsPerPage }),
        getQuestionStatistics()
      ]);

      setQuestions(questionsRes.questions);
      setTotalPages(questionsRes.totalPages);
      setTotalQuestions(questionsRes.total);
      setStats(statsRes);
      setSelectedIds(new Set()); // Clear selection on page change
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, filterDifficulty, filterQuestionType, searchQuery, page, itemsPerPage]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Toggle selection for a single question
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Select/deselect all visible questions
  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
      setShowBulkActions(true);
    }
  };

  // Bulk delete questions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} questions? This action cannot be undone.`)) {
      return;
    }
    
    setBulkActionLoading(true);
    let deleted = 0;
    let failed = 0;
    
    for (const id of selectedIds) {
      try {
        await apiDeleteQuestion(id);
        deleted++;
      } catch {
        failed++;
      }
    }
    
    setBulkActionLoading(false);
    toast.success(`Deleted ${deleted} questions${failed > 0 ? `, ${failed} failed` : ''}`);
    setSelectedIds(new Set());
    setShowBulkActions(false);
    loadQuestions();
  };

  // Bulk activate/deactivate questions
  const handleBulkStatusChange = async (activate: boolean) => {
    setBulkActionLoading(true);
    let updated = 0;
    let failed = 0;
    
    for (const id of selectedIds) {
      try {
        await toggleQuestionStatus(id, activate);
        updated++;
      } catch {
        failed++;
      }
    }
    
    setBulkActionLoading(false);
    toast.success(`${activate ? 'Activated' : 'Deactivated'} ${updated} questions${failed > 0 ? `, ${failed} failed` : ''}`);
    setSelectedIds(new Set());
    setShowBulkActions(false);
    loadQuestions();
  };

  // Save edited question
  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('haven_token');
      const response = await fetch(`${API_BASE_URL}/questions/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedQuestion),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      
      toast.success('Question updated successfully');
      setSelectedQuestion(null);
      setEditMode(false);
      setEditedQuestion({});
      loadQuestions();
    } catch (error) {
      toast.error('Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (question: Question) => {
    setSelectedQuestion(question);
    setEditedQuestion({
      text: question.text,
      category: question.category,
      difficulty: question.difficulty,
      questionType: question.questionType,
      explanation: question.explanation,
      isActive: question.isActive,
    });
    setEditMode(true);
  };

  // Open view modal
  const openViewModal = (question: Question) => {
    setSelectedQuestion(question);
    setEditMode(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await apiDeleteQuestion(id);
        toast.success('Question deleted');
        loadQuestions();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      await toggleQuestionStatus(id, isActive);
      toast.success(`Question ${isActive ? 'activated' : 'deactivated'}`);
      loadQuestions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = () => {
    const csv = exportQuestionsToCSV(questions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Questions exported');
  };

  const getSuccessRate = (q: Question) => {
    if (q.timesAnswered === 0) return 0;
    return Math.round((q.timesCorrect / q.timesAnswered) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total || 0}</p>
                </div>
                <BarChart3 className="size-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active || 0}</p>
                </div>
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.inactive || 0}</p>
                </div>
                <XCircle className="size-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Easy</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {(stats.byDifficulty as any)?.easy || stats.byDifficulty?.find?.((d: any) => d.difficulty === 'easy')?.count || 0}
                  </p>
                </div>
                <TrendingDown className="size-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {(stats.byDifficulty as any)?.medium || stats.byDifficulty?.find?.((d: any) => d.difficulty === 'medium')?.count || 0}
                  </p>
                </div>
                <Minus className="size-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Hard</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {(stats.byDifficulty as any)?.hard || stats.byDifficulty?.find?.((d: any) => d.difficulty === 'hard')?.count || 0}
                  </p>
                </div>
                <TrendingUp className="size-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-5" />
                Question Bank
              </CardTitle>
              <CardDescription>Search, filter, and manage {totalQuestions} questions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="size-4 mr-1" />
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="size-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={loadQuestions}>
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by question text, ID, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Category</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                title="Filter by category"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Question Type</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                value={filterQuestionType}
                onChange={(e) => { setFilterQuestionType(e.target.value); setPage(1); }}
                title="Filter by question type"
              >
                <option value="all">All Types</option>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Difficulty</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                value={filterDifficulty}
                onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }}
                title="Filter by difficulty"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Per Page</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                title="Items per page"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Bulk Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {selectedIds.size === questions.length && questions.length > 0 ? (
                  <CheckSquare className="size-4" />
                ) : (
                  <Square className="size-4" />
                )}
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </button>
              
              {showBulkActions && (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusChange(true)}
                    disabled={bulkActionLoading}
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    Activate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusChange(false)}
                    disabled={bulkActionLoading}
                  >
                    <XCircle className="size-3 mr-1" />
                    Deactivate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {bulkActionLoading ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Trash2 className="size-3 mr-1" />}
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? 'Loading...' : `Showing ${questions.length} of ${totalQuestions} questions`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="size-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading questions...</p>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {!loading && (
        <div className="space-y-3">
          {questions.map(question => (
            <Card key={question.id} className={`hover:shadow-md transition-shadow ${selectedIds.has(question.id) ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleSelection(question.id)}
                    className="mt-1 text-gray-400 hover:text-gray-600"
                  >
                    {selectedIds.has(question.id) ? (
                      <CheckSquare className="size-5 text-blue-500" />
                    ) : (
                      <Square className="size-5" />
                    )}
                  </button>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono">{question.id.slice(0, 8)}</Badge>
                      <Badge className={question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">{question.difficulty}</Badge>
                      <Badge variant="outline">{QUESTION_TYPE_LABELS[question.questionType]}</Badge>
                    </div>
                    
                    <p className="text-gray-900 dark:text-white mb-2 line-clamp-2">{question.text}</p>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                      <span className="font-medium">{CATEGORY_LABELS[question.category]}</span>
                      <span className="text-gray-300">|</span>
                      <span>Used {question.timesAnswered}x</span>
                      <span className="text-gray-300">|</span>
                      <span className={`font-medium ${getSuccessRate(question) >= 70 ? 'text-green-600' : getSuccessRate(question) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getSuccessRate(question)}% success rate
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openViewModal(question)} title="View question">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(question)} title="Edit question">
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(question.id, !question.isActive)} title={question.isActive ? 'Deactivate' : 'Activate'}>
                      {question.isActive ? <XCircle className="size-4 text-gray-500" /> : <CheckCircle2 className="size-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)} title="Delete question">
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {!loading && questions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No questions found matching your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Edit/View Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedQuestion(null); setEditMode(false); setEditedQuestion({}); }}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {editMode ? <Edit className="size-5" /> : <Eye className="size-5" />}
                    {editMode ? 'Edit Question' : 'View Question'}
                  </CardTitle>
                  <CardDescription>ID: {selectedQuestion.id}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedQuestion(null); setEditMode(false); setEditedQuestion({}); }}>
                  <X className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Question Text */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Question Text</label>
                <Textarea 
                  value={editMode ? (editedQuestion.text || '') : selectedQuestion.text} 
                  onChange={(e) => setEditedQuestion({...editedQuestion, text: e.target.value})}
                  disabled={!editMode} 
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Options Display */}
              {selectedQuestion.options && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Answer Options</label>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((opt, idx) => (
                      <div key={opt.id || idx} className={`flex items-center gap-3 p-3 rounded-lg border ${selectedQuestion.correctAnswers?.includes(opt.id) ? 'bg-green-50 border-green-300 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <Badge className={selectedQuestion.correctAnswers?.includes(opt.id) ? 'bg-green-500' : 'bg-gray-400'}>
                          {opt.id}
                        </Badge>
                        <span className="flex-1">{opt.text}</span>
                        {selectedQuestion.correctAnswers?.includes(opt.id) && (
                          <CheckCircle2 className="size-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {(selectedQuestion.explanation || editMode) && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Explanation / Rationale</label>
                  <Textarea 
                    value={editMode ? (editedQuestion.explanation || '') : (selectedQuestion.explanation || 'No explanation provided')} 
                    onChange={(e) => setEditedQuestion({...editedQuestion, explanation: e.target.value})}
                    disabled={!editMode} 
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    value={editMode ? (editedQuestion.category || selectedQuestion.category) : selectedQuestion.category}
                    onChange={(e) => setEditedQuestion({...editedQuestion, category: e.target.value as any})}
                    disabled={!editMode}
                    title="Question category"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Difficulty</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    value={editMode ? (editedQuestion.difficulty || selectedQuestion.difficulty) : selectedQuestion.difficulty}
                    onChange={(e) => setEditedQuestion({...editedQuestion, difficulty: e.target.value as any})}
                    disabled={!editMode}
                    title="Question difficulty"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    value={editMode ? (editedQuestion.questionType || selectedQuestion.questionType) : selectedQuestion.questionType}
                    onChange={(e) => setEditedQuestion({...editedQuestion, questionType: e.target.value as any})}
                    disabled={!editMode}
                    title="Question type"
                  >
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    value={editMode ? (editedQuestion.isActive !== undefined ? String(editedQuestion.isActive) : String(selectedQuestion.isActive)) : String(selectedQuestion.isActive)}
                    onChange={(e) => setEditedQuestion({...editedQuestion, isActive: e.target.value === 'true'})}
                    disabled={!editMode}
                    title="Question status"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Question Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{selectedQuestion.timesAnswered || 0}</p>
                    <p className="text-xs text-gray-500">Times Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{selectedQuestion.timesCorrect || 0}</p>
                    <p className="text-xs text-gray-500">Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{(selectedQuestion.timesAnswered || 0) - (selectedQuestion.timesCorrect || 0)}</p>
                    <p className="text-xs text-gray-500">Incorrect</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getSuccessRate(selectedQuestion) >= 70 ? 'text-green-600' : getSuccessRate(selectedQuestion) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {getSuccessRate(selectedQuestion)}%
                    </p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {editMode ? (
                  <>
                    <Button className="flex-1" onClick={handleSaveQuestion} disabled={saving}>
                      {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <CheckCircle2 className="size-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setEditMode(false); setEditedQuestion({}); }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="flex-1" onClick={() => openEditModal(selectedQuestion)}>
                      <Edit className="size-4 mr-2" />
                      Edit Question
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(selectedQuestion.id)}>
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
