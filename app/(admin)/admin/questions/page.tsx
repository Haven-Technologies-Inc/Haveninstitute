'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { motion } from 'motion/react';

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'select-all' | 'hot-spot' | 'drag-and-drop';
  status: 'active' | 'draft' | 'archived';
  timesUsed: number;
  successRate: number;
  createdBy: string;
  createdAt: string;
  selected?: boolean;
}

const mockQuestions: Question[] = [
  { id: 'Q001', text: 'A patient with Type 2 diabetes presents with a blood glucose level of 450 mg/dL. Which nursing intervention should be performed first?', category: 'Pharmacology', difficulty: 'hard', type: 'multiple-choice', status: 'active', timesUsed: 1243, successRate: 62, createdBy: 'Dr. Emily Davis', createdAt: 'Jan 15, 2026' },
  { id: 'Q002', text: 'Select all interventions appropriate for a patient experiencing heart failure with fluid volume overload.', category: 'Medical-Surgical', difficulty: 'medium', type: 'select-all', status: 'active', timesUsed: 987, successRate: 48, createdBy: 'Robert Taylor', createdAt: 'Jan 20, 2026' },
  { id: 'Q003', text: 'A nurse is caring for a postoperative patient who develops sudden dyspnea and chest pain. What is the priority assessment?', category: 'Medical-Surgical', difficulty: 'hard', type: 'multiple-choice', status: 'active', timesUsed: 2134, successRate: 55, createdBy: 'Dr. Emily Davis', createdAt: 'Dec 8, 2025' },
  { id: 'Q004', text: 'Identify the correct sequence for donning personal protective equipment (PPE) before entering an isolation room.', category: 'Fundamentals', difficulty: 'easy', type: 'drag-and-drop', status: 'active', timesUsed: 3421, successRate: 78, createdBy: 'Sarah Johnson', createdAt: 'Nov 15, 2025' },
  { id: 'Q005', text: 'A child is admitted with suspected meningitis. Which assessment findings would the nurse expect? Select all that apply.', category: 'Pediatrics', difficulty: 'medium', type: 'select-all', status: 'draft', timesUsed: 0, successRate: 0, createdBy: 'Maria Garcia', createdAt: 'Feb 12, 2026' },
  { id: 'Q006', text: 'During a mental health assessment, a patient states "I hear voices telling me to hurt myself." What is the nurse\'s best response?', category: 'Mental Health', difficulty: 'medium', type: 'multiple-choice', status: 'active', timesUsed: 1567, successRate: 71, createdBy: 'Dr. Emily Davis', createdAt: 'Oct 22, 2025' },
  { id: 'Q007', text: 'A pregnant patient at 32 weeks gestation reports sudden severe abdominal pain and vaginal bleeding. Which condition should the nurse suspect?', category: 'Maternal-Newborn', difficulty: 'hard', type: 'multiple-choice', status: 'active', timesUsed: 892, successRate: 59, createdBy: 'Robert Taylor', createdAt: 'Jan 5, 2026' },
  { id: 'Q008', text: 'Identify the anatomical landmark for the correct placement of a nasogastric tube on the provided diagram.', category: 'Fundamentals', difficulty: 'easy', type: 'hot-spot', status: 'archived', timesUsed: 4523, successRate: 83, createdBy: 'Sarah Johnson', createdAt: 'Sep 10, 2025' },
];

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
  const [questions, setQuestions] = useState(mockQuestions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesCat && matchesDiff && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const categories = [...new Set(mockQuestions.map((q) => q.category))];

  const stats = [
    { label: 'Total Questions', value: '10,432', icon: Brain, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active', value: '8,741', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Avg Success Rate', value: '64%', icon: BarChart3, color: 'from-purple-500 to-pink-600' },
    { label: 'Drafts', value: '312', icon: Edit, color: 'from-amber-500 to-orange-600' },
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
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
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
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="select-all">Select All</SelectItem>
                    <SelectItem value="hot-spot">Hot Spot</SelectItem>
                    <SelectItem value="drag-and-drop">Drag & Drop</SelectItem>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
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
