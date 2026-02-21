'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ArrowLeft,
  Brain,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
  ToggleLeft,
  Loader2,
  FileJson,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { QUESTION_TYPES } from '@/lib/constants';

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  status: 'active' | 'draft' | 'archived';
  timesUsed: number;
  successRate: number;
  createdBy: string;
  createdAt: string;
  selected?: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const typeColors: Record<string, string> = {
  'multiple-choice': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'select-all': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'hot-spot': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'drag-and-drop': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  archived: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default function AdminQuestionsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importJson, setImportJson] = useState('');
  const itemsPerPage = 20;

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(itemsPerPage));
      params.set('offset', String((currentPage - 1) * itemsPerPage));
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'all') params.set('categoryId', categoryFilter);
      if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/questions?${params}`);
      const json = await res.json();
      if (json.success) {
        const qs = (json.data.questions || []).map((q: any) => ({
          id: q.id,
          text: q.questionText,
          category: q.category?.name || 'Unknown',
          difficulty: q.difficulty,
          type: q.questionType,
          status: q.isActive ? 'active' : 'archived',
          timesUsed: q.timesUsed || 0,
          successRate: q.timesUsed > 0 ? Math.round((q.timesCorrect / q.timesUsed) * 100) : 0,
          createdBy: q.creator?.fullName || 'System',
          createdAt: new Date(q.createdAt).toLocaleDateString(),
        }));
        setQuestions(qs);
        setTotal(json.data.total || qs.length);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [currentPage, categoryFilter, difficultyFilter, typeFilter, searchQuery]);

  const handleImport = async () => {
    setImportLoading(true);
    try {
      const parsed = JSON.parse(importJson);
      const questionsArr = Array.isArray(parsed) ? parsed : parsed.questions;
      const res = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsArr }),
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        toast.success(`Imported ${d.created} of ${d.total} questions${d.errors?.length ? ` (${d.errors.length} errors)` : ''}`);
        setImportOpen(false);
        setImportJson('');
        loadQuestions();
      } else {
        toast.error(json.error || 'Import failed');
      }
    } catch (e: any) {
      toast.error('Invalid JSON: ' + (e.message || 'Parse error'));
    } finally {
      setImportLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questions?questionId=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Question deactivated');
        loadQuestions();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredQuestions = questions;
  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedQuestions = filteredQuestions;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedQuestions.map((q) => q.id)));
    }
  };

  const bulkActivate = () => {
    setQuestions((prev) =>
      prev.map((q) => (selectedIds.has(q.id) ? { ...q, status: 'active' as const } : q))
    );
    setSelectedIds(new Set());
  };

  const bulkDeactivate = () => {
    setQuestions((prev) =>
      prev.map((q) => (selectedIds.has(q.id) ? { ...q, status: 'archived' as const } : q))
    );
    setSelectedIds(new Set());
  };

  const categories = [...new Set(questions.map((q) => q.category))];
  const activeCount = questions.filter(q => q.status === 'active').length;
  const avgSuccess = questions.length > 0
    ? Math.round(questions.reduce((s, q) => s + q.successRate, 0) / questions.length)
    : 0;

  const stats = [
    { label: 'Total Questions', value: total.toLocaleString(), icon: Brain, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active', value: activeCount.toLocaleString(), icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Avg Success Rate', value: `${avgSuccess}%`, icon: BarChart3, color: 'from-purple-500 to-pink-600' },
    { label: 'On Page', value: String(questions.length), icon: Edit, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Question Management</h1>
          </div>
          <p className="text-muted-foreground text-sm">Create, manage, and review NCLEX practice questions.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Bulk Import Questions
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Paste a JSON array of questions. Each question needs: questionText, categoryCode, and correctAnswers. Supported types: {QUESTION_TYPES.map(t => t.label).join(', ')}.
                </p>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={`[
  {
    "questionText": "Which nursing action...",
    "categoryCode": "PHARMACOLOGY",
    "questionType": "multiple_choice",
    "difficulty": "medium",
    "options": [
      { "id": "A", "text": "Option A" },
      { "id": "B", "text": "Option B" },
      { "id": "C", "text": "Option C" },
      { "id": "D", "text": "Option D" }
    ],
    "correctAnswers": ["B"],
    "explanation": "Because...",
    "rationale": "The rationale is..."
  }
]`}
                  rows={12}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
                  <Button onClick={handleImport} disabled={importLoading || !importJson.trim()}>
                    {importLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Import Questions
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', stat.color)}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions by text or ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {QUESTION_TYPES.map(qt => (
                      <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedIds.size} question{selectedIds.size > 1 ? 's' : ''} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={bulkActivate}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={bulkDeactivate}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Questions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Question</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Difficulty</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Used</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Success</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedQuestions.map((q, i) => (
                  <motion.tr
                    key={q.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={cn(
                      'hover:bg-muted/20 transition-colors group',
                      selectedIds.has(q.id) && 'bg-primary/5'
                    )}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(q.id)}
                        onChange={() => toggleSelect(q.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={cn('text-[10px] shrink-0', statusColors[q.status])}>
                          {q.status}
                        </Badge>
                        <span className="text-sm truncate">{q.text}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{q.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm whitespace-nowrap">{q.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={cn('text-xs capitalize', difficultyColors[q.difficulty])}>
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={cn('text-xs capitalize whitespace-nowrap', typeColors[q.type])}>
                        {q.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{q.timesUsed.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              q.successRate >= 70 ? 'bg-emerald-500' : q.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${q.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{q.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Question Preview</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className={cn('text-xs capitalize', difficultyColors[q.difficulty])}>{q.difficulty}</Badge>
                                <Badge variant="secondary" className={cn('text-xs capitalize', typeColors[q.type])}>{q.type}</Badge>
                                <Badge variant="secondary" className={cn('text-xs', statusColors[q.status])}>{q.status}</Badge>
                              </div>
                              <p className="text-sm leading-relaxed">{q.text}</p>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Category</p>
                                  <p className="font-medium">{q.category}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Times Used</p>
                                  <p className="font-medium">{q.timesUsed.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Success Rate</p>
                                  <p className="font-medium">{q.successRate}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Created By</p>
                                  <p className="font-medium">{q.createdBy}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
