'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Star,
  Download,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Globe,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface QuestionStats {
  total: number;
  verified: number;
  recentCount: number;
}

interface BookRecord {
  id: string;
  title: string;
  author: string | null;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  pageCount: number | null;
  ratingAvg: number;
  ratingCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialRecord {
  id: string;
  title: string;
  materialType: string;
  category: string | null;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

interface FlaggedPost {
  id: string;
  title: string;
  content: string;
  status: string;
  isFlagged: boolean;
  flagCount: number;
  author: { fullName: string; email: string };
  createdAt: string;
}

interface FlaggedComment {
  id: string;
  content: string;
  isFlagged: boolean;
  author: { fullName: string; email: string };
  post: { title: string };
  createdAt: string;
}

function ContentSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-80" />
      <div className="grid sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<FlaggedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple data sources in parallel
      const [statsRes, questionsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        // We reuse admin stats and supplement with direct queries through client-side aggregation
        fetch('/api/admin/stats'),
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch content data');

      const statsJson = await statsRes.json();
      const statsData = statsJson.data;

      setQuestionStats({
        total: statsData.content.totalQuestions,
        verified: 0, // Would require a separate API call
        recentCount: 0,
      });

      // For books, materials, and flagged content we rely on available data
      // In a full implementation, these would have dedicated API endpoints
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load content data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <ContentSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load Content</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">Content Management</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage questions, books, study materials, and moderate community discussions.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="questions" className="gap-2">
              <Brain className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="discussions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">
                    {questionStats?.total.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total Questions
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verified Questions
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Plus className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Added This Week
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Question Bank</h2>
                <p className="text-sm text-muted-foreground">
                  Manage NCLEX questions across all categories
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/questions">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                  size="sm"
                  asChild
                >
                  <Link href="/admin/questions">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Questions
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link
                    href="/admin/questions"
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Browse Question Bank
                      </p>
                      <p className="text-xs text-muted-foreground">
                        View, edit, and organize questions
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/admin/questions/upload"
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Bulk Upload</p>
                      <p className="text-xs text-muted-foreground">
                        Import questions from CSV/JSON
                      </p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Books & Study Materials</h2>
                <p className="text-sm text-muted-foreground">
                  Manage books and study resources
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground">
                        Total Books
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground">
                        Study Materials
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Manage Books</p>
                      <p className="text-xs text-muted-foreground">
                        Add, edit, and organize books
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Study Guides</p>
                      <p className="text-xs text-muted-foreground">
                        PDFs, articles, and guides
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Video Content</p>
                      <p className="text-xs text-muted-foreground">
                        Manage video resources
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussions / Moderation Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Discussion Moderation</h2>
              <p className="text-sm text-muted-foreground">
                Review flagged posts and moderate community discussions
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Flag className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground">
                        Flagged Posts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground">
                        Flagged Comments
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Community Moderation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Flagged posts and comments will appear here for review.
                  You can approve safe content or remove violations.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve All Safe
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove Flagged
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
