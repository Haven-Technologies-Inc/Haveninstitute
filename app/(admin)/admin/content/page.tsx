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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Image,
} from 'lucide-react';
import { motion } from 'motion/react';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverColor: string;
  status: 'published' | 'draft';
  chapters: number;
  pages: number;
  rating: number;
  downloads: number;
  lastUpdated: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'flashcard' | 'guide';
  category: string;
  status: 'published' | 'draft' | 'review';
  size: string;
  views: number;
  author: string;
  createdAt: string;
}

interface FlaggedPost {
  id: string;
  author: string;
  content: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  postType: 'discussion' | 'comment' | 'reply';
  reports: number;
  status: 'pending' | 'approved' | 'removed';
}

const mockBooks: Book[] = [
  { id: 'B001', title: 'NCLEX-RN Comprehensive Review', author: 'Dr. Emily Davis', category: 'General', coverColor: 'from-blue-500 to-indigo-600', status: 'published', chapters: 24, pages: 456, rating: 4.8, downloads: 3421, lastUpdated: 'Feb 10, 2026' },
  { id: 'B002', title: 'Pharmacology Made Simple', author: 'Robert Taylor', category: 'Pharmacology', coverColor: 'from-emerald-500 to-teal-600', status: 'published', chapters: 18, pages: 312, rating: 4.6, downloads: 2187, lastUpdated: 'Jan 28, 2026' },
  { id: 'B003', title: 'Medical-Surgical Nursing Essentials', author: 'Dr. Emily Davis', category: 'Medical-Surgical', coverColor: 'from-purple-500 to-pink-600', status: 'published', chapters: 32, pages: 678, rating: 4.9, downloads: 4532, lastUpdated: 'Feb 5, 2026' },
  { id: 'B004', title: 'Pediatric Nursing Handbook', author: 'Maria Garcia', category: 'Pediatrics', coverColor: 'from-amber-500 to-orange-600', status: 'draft', chapters: 15, pages: 234, rating: 0, downloads: 0, lastUpdated: 'Feb 18, 2026' },
  { id: 'B005', title: 'Mental Health Nursing Guide', author: 'Sarah Johnson', category: 'Mental Health', coverColor: 'from-rose-500 to-red-600', status: 'published', chapters: 12, pages: 198, rating: 4.5, downloads: 1876, lastUpdated: 'Dec 15, 2025' },
];

const mockMaterials: StudyMaterial[] = [
  { id: 'M001', title: 'Cardiac Rhythm Interpretation Guide', type: 'pdf', category: 'Medical-Surgical', status: 'published', size: '4.2 MB', views: 8923, author: 'Dr. Emily Davis', createdAt: 'Jan 5, 2026' },
  { id: 'M002', title: 'Drug Calculation Flashcards', type: 'flashcard', category: 'Pharmacology', status: 'published', size: '156 cards', views: 12341, author: 'Robert Taylor', createdAt: 'Dec 20, 2025' },
  { id: 'M003', title: 'Physical Assessment Techniques', type: 'video', category: 'Fundamentals', status: 'published', size: '45 min', views: 6782, author: 'Maria Garcia', createdAt: 'Jan 15, 2026' },
  { id: 'M004', title: 'Lab Values Quick Reference', type: 'pdf', category: 'General', status: 'published', size: '1.8 MB', views: 15432, author: 'Dr. Emily Davis', createdAt: 'Nov 10, 2025' },
  { id: 'M005', title: 'Maternal-Newborn Case Studies', type: 'guide', category: 'Maternal-Newborn', status: 'review', size: '28 pages', views: 0, author: 'Sarah Johnson', createdAt: 'Feb 14, 2026' },
  { id: 'M006', title: 'Infection Control Protocols', type: 'pdf', category: 'Fundamentals', status: 'draft', size: '3.1 MB', views: 0, author: 'Robert Taylor', createdAt: 'Feb 17, 2026' },
];

const mockFlaggedPosts: FlaggedPost[] = [
  { id: 'F001', author: 'Anonymous_42', content: 'This is completely wrong information. The correct dosage for acetaminophen is NOT what the textbook says. You should always give double the recommended amount for faster relief...', reason: 'Misinformation', reportedBy: 'NurseEmily', reportedAt: '2 hours ago', postType: 'comment', reports: 5, status: 'pending' },
  { id: 'F002', author: 'StudyHard99', content: 'Stop asking such stupid questions. If you can\'t figure out basic pharmacology you shouldn\'t be in nursing school...', reason: 'Harassment', reportedBy: 'KindNurse', reportedAt: '5 hours ago', postType: 'reply', reports: 3, status: 'pending' },
  { id: 'F003', author: 'QuizMaster', content: 'I have the complete answer key for the upcoming NCLEX exam. DM me for details. Only $50 for the full set...', reason: 'Spam / Scam', reportedBy: 'AdminBot', reportedAt: '1 day ago', postType: 'discussion', reports: 12, status: 'pending' },
  { id: 'F004', author: 'NursingPro', content: 'Here is a link to free study materials from an unauthorized source...', reason: 'Copyright violation', reportedBy: 'ModeratorTeam', reportedAt: '2 days ago', postType: 'discussion', reports: 2, status: 'approved' },
];

const materialTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Globe,
  flashcard: BookOpen,
  guide: FileText,
};

const materialTypeColors: Record<string, string> = {
  pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
  video: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  flashcard: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  guide: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const materialStatusColors: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const flagReasonColors: Record<string, string> = {
  Misinformation: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Harassment: 'bg-red-500/10 text-red-600 dark:text-red-400',
  'Spam / Scam': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'Copyright violation': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

export default function AdminContentPage() {
  const { data: session } = useSession();
  const [flaggedPosts, setFlaggedPosts] = useState(mockFlaggedPosts);

  const handleApprove = (id: string) => {
    setFlaggedPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' as const } : p)));
  };

  const handleRemove = (id: string) => {
    setFlaggedPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'removed' as const } : p)));
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">Content Management</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage books, study materials, and moderate community discussions.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <FileText className="h-4 w-4" />
              Study Materials
            </TabsTrigger>
            <TabsTrigger value="discussions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
              <Badge variant="secondary" className="ml-1 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px]">
                {flaggedPosts.filter((p) => p.status === 'pending').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Books Library</h2>
                <p className="text-sm text-muted-foreground">{mockBooks.length} books in the library</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBooks.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <div className={cn('h-3 bg-gradient-to-r', book.coverColor)} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className={cn('text-xs', book.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400')}>
                          {book.status}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{book.author}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{book.chapters} chapters</span>
                        <span>{book.pages} pages</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {book.rating > 0 ? (
                            <>
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{book.rating}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">No ratings</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="h-3.5 w-3.5" />
                          <span>{book.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Study Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Study Materials</h2>
                <p className="text-sm text-muted-foreground">{mockMaterials.length} materials available</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="divide-y divide-border/50">
                {mockMaterials.map((material, i) => {
                  const TypeIcon = materialTypeIcons[material.type] || FileText;
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors group"
                    >
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', materialTypeColors[material.type])}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{material.title}</h3>
                          <Badge variant="secondary" className={cn('text-[10px] shrink-0', materialStatusColors[material.status])}>
                            {material.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{material.category}</span>
                          <span>{material.size}</span>
                          <span>{material.views.toLocaleString()} views</span>
                          <span>{material.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {material.status === 'draft' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600">
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Discussions Moderation Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Flagged Discussions</h2>
              <p className="text-sm text-muted-foreground">{flaggedPosts.filter((p) => p.status === 'pending').length} posts pending review</p>
            </div>

            <div className="space-y-4">
              {flaggedPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className={cn(
                    'border-0 shadow-sm overflow-hidden',
                    post.status === 'removed' && 'opacity-50',
                    post.status === 'approved' && 'border-l-4 border-l-emerald-500'
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{post.author}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{post.postType}</span>
                              <span>{post.reportedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn('text-xs', flagReasonColors[post.reason] || 'bg-gray-500/10 text-gray-600')}>
                            <Flag className="h-3 w-3 mr-1" />
                            {post.reason}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600 dark:text-red-400">
                            {post.reports} reports
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Reported by <span className="font-medium text-foreground">{post.reportedBy}</span>
                        </p>
                        {post.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => handleApprove(post.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleRemove(post.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary" className={cn('text-xs', post.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
                            {post.status === 'approved' ? 'Approved' : 'Removed'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
