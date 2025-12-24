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
  Loader2
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

export function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterCategory !== 'all') filters.category = filterCategory as NCLEXCategory;
      if (filterStatus !== 'all') filters.isActive = filterStatus === 'active';
      if (filterDifficulty !== 'all') filters.difficulty = filterDifficulty;
      if (searchQuery) filters.search = searchQuery;

      const [questionsRes, statsRes] = await Promise.all([
        getQuestions(filters, { page, limit: 20 }),
        getQuestionStatistics()
      ]);

      setQuestions(questionsRes.questions);
      setTotalPages(questionsRes.totalPages);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, filterDifficulty, searchQuery, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

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
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Question Database</CardTitle>
          <CardDescription>Search, filter, and manage your question bank</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by question text or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-700 mb-2 block">Category</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-700 mb-2 block">Status</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 mb-2 block">Difficulty</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="size-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-gray-600">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">{questions.filter(q => q.status === 'active').length} Active</Badge>
              <Badge variant="outline">{questions.filter(q => q.status === 'draft').length} Draft</Badge>
              <Badge variant="outline">{questions.filter(q => q.status === 'archived').length} Archived</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.id}</Badge>
                    <Badge 
                      className={
                        question.status === 'active' ? 'bg-green-100 text-green-800' :
                        question.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {question.status}
                    </Badge>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.questionType}</Badge>
                  </div>
                  
                  <p className="text-gray-900 mb-2">{question.question}</p>
                  
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{CATEGORY_LABELS[question.category]}</span>
                    <span>•</span>
                    <span>Used {question.timesUsed} times</span>
                    <span>•</span>
                    <span className={question.correctRate >= 70 ? 'text-green-600' : question.correctRate >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                      {question.correctRate}% correct rate
                    </span>
                    <span>•</span>
                    <span>Modified {question.lastModified}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedQuestion(question)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedQuestion(question);
                    setEditMode(true);
                  }}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)}>
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(question.id, 'active')}
                  disabled={question.status === 'active'}
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(question.id, 'draft')}
                  disabled={question.status === 'draft'}
                >
                  Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(question.id, 'archived')}
                  disabled={question.status === 'archived'}
                >
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No questions found matching your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Edit/View Modal (simplified) */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editMode ? 'Edit Question' : 'View Question'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedQuestion(null);
                  setEditMode(false);
                }}>
                  <XCircle className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-700 mb-2 block">Question ID</label>
                <Input value={selectedQuestion.id} disabled />
              </div>
              
              <div>
                <label className="text-gray-700 mb-2 block">Question Text</label>
                <Textarea value={selectedQuestion.question} disabled={!editMode} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedQuestion.category}
                    disabled={!editMode}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Difficulty</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedQuestion.difficulty}
                    disabled={!editMode}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {editMode && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
