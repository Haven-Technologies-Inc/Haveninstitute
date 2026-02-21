'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Search,
  Clock,
  CheckCircle2,
  Loader2,
  Bookmark,
  Star,
  ArrowRight,
  Library,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StudyBook {
  id: string;
  title: string;
  author: string;
  category: 'Textbooks' | 'Study Guides' | 'Practice Tests';
  totalPages: number;
  pagesRead: number;
  lastAccessed: string;
  coverGradient: string;
  rating: number;
  isBookmarked: boolean;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const books: StudyBook[] = [
  {
    id: 'b1',
    title: 'Saunders Comprehensive Review for the NCLEX-RN',
    author: 'Linda Anne Silvestri',
    category: 'Textbooks',
    totalPages: 1024,
    pagesRead: 461,
    lastAccessed: '2h ago',
    coverGradient: 'from-indigo-600 to-purple-700',
    rating: 4.8,
    isBookmarked: true,
  },
  {
    id: 'b2',
    title: 'Pharmacology Made Incredibly Easy',
    author: 'Lippincott Williams',
    category: 'Study Guides',
    totalPages: 512,
    pagesRead: 369,
    lastAccessed: 'Yesterday',
    coverGradient: 'from-pink-600 to-rose-700',
    rating: 4.6,
    isBookmarked: false,
  },
  {
    id: 'b3',
    title: 'Prioritization, Delegation & Assignment',
    author: 'Linda LaCharity',
    category: 'Practice Tests',
    totalPages: 384,
    pagesRead: 0,
    lastAccessed: 'Never',
    coverGradient: 'from-emerald-600 to-teal-700',
    rating: 4.7,
    isBookmarked: false,
  },
  {
    id: 'b4',
    title: "Mosby's Review Cards for NCLEX-RN",
    author: 'Martin Hogan',
    category: 'Study Guides',
    totalPages: 256,
    pagesRead: 77,
    lastAccessed: '3 days ago',
    coverGradient: 'from-amber-600 to-orange-700',
    rating: 4.5,
    isBookmarked: true,
  },
  {
    id: 'b5',
    title: 'Kaplan NCLEX-RN Prep Plus',
    author: 'Kaplan Nursing',
    category: 'Practice Tests',
    totalPages: 688,
    pagesRead: 103,
    lastAccessed: '5 days ago',
    coverGradient: 'from-blue-600 to-cyan-700',
    rating: 4.4,
    isBookmarked: false,
  },
  {
    id: 'b6',
    title: "Davis's NCLEX-RN Success",
    author: 'Sally L. Lagerquist',
    category: 'Practice Tests',
    totalPages: 576,
    pagesRead: 0,
    lastAccessed: 'Never',
    coverGradient: 'from-violet-600 to-purple-700',
    rating: 4.3,
    isBookmarked: false,
  },
  {
    id: 'b7',
    title: 'Fundamentals of Nursing',
    author: 'Patricia A. Potter',
    category: 'Textbooks',
    totalPages: 1392,
    pagesRead: 807,
    lastAccessed: '1 day ago',
    coverGradient: 'from-red-600 to-rose-700',
    rating: 4.9,
    isBookmarked: true,
  },
  {
    id: 'b8',
    title: 'Medical-Surgical Nursing',
    author: 'Sharon Lewis',
    category: 'Textbooks',
    totalPages: 1808,
    pagesRead: 398,
    lastAccessed: '4 days ago',
    coverGradient: 'from-teal-600 to-emerald-700',
    rating: 4.7,
    isBookmarked: false,
  },
];

const CATEGORY_OPTIONS = ['All', 'Textbooks', 'Study Guides', 'Practice Tests'] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Derived stats
  const totalResources = books.length;
  const completed = books.filter(
    (b) => b.pagesRead > 0 && b.pagesRead >= b.totalPages,
  ).length;
  const inProgress = books.filter(
    (b) => b.pagesRead > 0 && b.pagesRead < b.totalPages,
  ).length;
  const bookmarked = books.filter((b) => b.isBookmarked).length;

  // Filtered books
  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const matchesSearch =
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === 'All' || book.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [searchQuery, categoryFilter],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Study Materials"
        description="Access your nursing textbooks, study guides, and practice tests"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Resources"
          value={totalResources}
          icon={Library}
          iconColor="text-indigo-500"
          change={`${CATEGORY_OPTIONS.length - 1} categories`}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={Loader2}
          iconColor="text-amber-500"
          change="Keep reading!"
        />
        <StatCard
          label="Bookmarked"
          value={bookmarked}
          icon={Bookmark}
          iconColor="text-rose-500"
        />
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study materials found"
          description={
            searchQuery || categoryFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'Your study materials library is empty. Browse the catalog to add resources.'
          }
        >
          {!searchQuery && categoryFilter === 'All' && (
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Catalog
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const progress =
              book.totalPages > 0
                ? Math.round((book.pagesRead / book.totalPages) * 100)
                : 0;
            const isStarted = book.pagesRead > 0;

            return (
              <Card
                key={book.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Cover placeholder */}
                <div
                  className={cn(
                    'h-36 bg-gradient-to-br flex items-center justify-center relative',
                    book.coverGradient,
                  )}
                >
                  <BookOpen className="h-10 w-10 text-white/30" />
                  {book.isBookmarked && (
                    <Badge className="absolute top-2 right-2 bg-rose-500 border-0 text-white text-[10px]">
                      <Bookmark className="h-3 w-3 mr-0.5 fill-white" />
                      Saved
                    </Badge>
                  )}
                  {!isStarted && (
                    <Badge className="absolute top-2 left-2 bg-emerald-500 border-0 text-white text-[10px]">
                      New
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 flex-1 flex flex-col space-y-2">
                  <h3 className="font-bold text-sm line-clamp-2 flex-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {book.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{book.rating}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {isStarted && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  {/* Last accessed */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {book.lastAccessed}
                    </span>
                    <Button size="sm" className="text-xs h-7">
                      {isStarted ? (
                        <>
                          Continue Reading
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      ) : (
                        <>
                          Start Reading
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
