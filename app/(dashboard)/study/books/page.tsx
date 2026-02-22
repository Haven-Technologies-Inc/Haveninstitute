'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BookOpen,
  Search,
  Star,
  ArrowRight,
  Download,
  Lock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Library,
  Filter,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  fileType: string;
  pageCount: number | null;
  durationMinutes: number | null;
  category: string;
  tags: any;
  price: number;
  isFree: boolean;
  ratingAvg: number;
  ratingCount: number;
  downloadCount: number;
  requiredSubscription: 'Free' | 'Pro' | 'Premium';
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  userBook: {
    currentPage: number;
    progressPercent: number;
    totalReadingTimeMinutes: number;
    lastReadAt: string | null;
    isBookmarked: boolean;
    isPurchased: boolean;
    rating: number | null;
    review: string | null;
  } | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'NCLEX Prep', value: 'nclex_prep' },
  { label: 'Pharmacology', value: 'pharmacology' },
  { label: 'Clinical Skills', value: 'clinical_skills' },
  { label: 'Study Guides', value: 'study_guides' },
  { label: 'Reference', value: 'reference' },
] as const;

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'A-Z', value: 'az' },
] as const;

const SUBSCRIPTION_FILTER = [
  { label: 'All Tiers', value: '' },
  { label: 'Free', value: 'Free' },
  { label: 'Pro', value: 'Pro' },
  { label: 'Premium', value: 'Premium' },
] as const;

const TIER_HIERARCHY: Record<string, number> = { Free: 0, Pro: 1, Premium: 2 };

const COVER_GRADIENTS = [
  'from-indigo-600 to-purple-700',
  'from-pink-600 to-rose-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-blue-600 to-cyan-700',
  'from-violet-600 to-purple-700',
  'from-red-600 to-rose-700',
  'from-teal-600 to-emerald-700',
  'from-sky-600 to-blue-700',
  'from-fuchsia-600 to-pink-700',
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'Premium':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'Pro':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    default:
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }
}

// ---------------------------------------------------------------------------
// Star Rating Component
// ---------------------------------------------------------------------------

function StarRating({
  rating,
  count,
  size = 'sm',
  interactive = false,
  onRate,
}: {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onRate?: (value: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive ? star <= (hovered || rating) : star <= Math.round(rating);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => onRate?.(star)}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(0)}
              className={cn(
                'focus:outline-none',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
            >
              <Star
                className={cn(
                  iconSize,
                  filled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground/30'
                )}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className={cn('font-medium', textSize)}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span className={cn('text-muted-foreground', textSize)}>
          ({count})
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Featured Books Carousel
// ---------------------------------------------------------------------------

function FeaturedCarousel({
  books,
  userTier,
  onBookmark,
}: {
  books: Book[];
  userTier: string;
  onBookmark: (bookId: string, action: 'bookmark' | 'unbookmark') => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [checkScroll, books]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (books.length === 0) return null;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Featured Books</h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => {
          const canAccess =
            TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[book.requiredSubscription];
          const progress = book.userBook?.progressPercent || 0;
          const isStarted = progress > 0;

          return (
            <div
              key={book.id}
              className="min-w-[300px] max-w-[360px] snap-start shrink-0"
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <div
                  className={cn(
                    'h-40 bg-gradient-to-br flex items-center justify-center relative overflow-hidden',
                    book.coverUrl ? '' : getGradient(book.id)
                  )}
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white/30" />
                  )}
                  <Badge className="absolute top-2 left-2 bg-amber-500 border-0 text-white text-[10px]">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    Featured
                  </Badge>
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold text-sm line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.author || 'Unknown Author'}
                  </p>
                  <div className="flex items-center justify-between">
                    <StarRating rating={book.ratingAvg} count={book.ratingCount} />
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', getTierColor(book.requiredSubscription))}
                    >
                      {book.requiredSubscription === 'Free' ? 'Free' : book.requiredSubscription}
                    </Badge>
                  </div>
                  {isStarted && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 translate-y-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity bg-background"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 translate-y-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity bg-background"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Book Card Skeleton
// ---------------------------------------------------------------------------

function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm flex flex-col">
      <Skeleton className="h-36 rounded-none" />
      <CardContent className="p-4 flex-1 flex flex-col space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const userTier = (session?.user as any)?.subscriptionTier || 'Free';

  // State from URL params (for shareable links)
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subscriptionFilter, setSubscriptionFilter] = useState(
    searchParams.get('tier') || ''
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchDebounce, setSearchDebounce] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (sort !== 'popular') params.set('sort', sort);
    if (searchDebounce) params.set('search', searchDebounce);
    if (subscriptionFilter) params.set('tier', subscriptionFilter);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    const url = query ? `/study/books?${query}` : '/study/books';
    router.replace(url, { scroll: false });
  }, [category, sort, searchDebounce, subscriptionFilter, page, router]);

  // Fetch featured books on mount
  useEffect(() => {
    async function fetchFeatured() {
      setFeaturedLoading(true);
      try {
        const res = await fetch('/api/books?featured=true&limit=10');
        const json = await res.json();
        if (json.success) {
          setFeaturedBooks(json.data.books);
        }
      } catch {
        // Silently fail for featured
      } finally {
        setFeaturedLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Fetch books based on filters
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (searchDebounce) params.set('search', searchDebounce);
        if (sort) params.set('sort', sort);
        if (subscriptionFilter) params.set('requiredSubscription', subscriptionFilter);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await fetch(`/api/books?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setBooks(json.data.books);
          setPagination(json.data.pagination);
        }
      } catch {
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [category, sort, searchDebounce, subscriptionFilter, page]);

  // Bookmark handler
  const handleBookmark = useCallback(
    async (bookId: string, action: 'bookmark' | 'unbookmark') => {
      if (!session) {
        toast.error('Please sign in to bookmark books');
        return;
      }
      try {
        const res = await fetch(`/api/books/${bookId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(action === 'bookmark' ? 'Book bookmarked!' : 'Bookmark removed');
          // Update local state
          setBooks((prev) =>
            prev.map((b) =>
              b.id === bookId
                ? {
                    ...b,
                    userBook: b.userBook
                      ? { ...b.userBook, isBookmarked: action === 'bookmark' }
                      : {
                          currentPage: 0,
                          progressPercent: 0,
                          totalReadingTimeMinutes: 0,
                          lastReadAt: null,
                          isBookmarked: action === 'bookmark',
                          isPurchased: false,
                          rating: null,
                          review: null,
                        },
                  }
                : b
            )
          );
        }
      } catch {
        toast.error('Failed to update bookmark');
      }
    },
    [session]
  );

  // Rate handler
  const handleRate = useCallback(
    async (bookId: string, rating: number) => {
      if (!session) {
        toast.error('Please sign in to rate books');
        return;
      }
      try {
        const res = await fetch(`/api/books/${bookId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Rating submitted!');
          setBooks((prev) =>
            prev.map((b) =>
              b.id === bookId
                ? {
                    ...b,
                    ratingAvg: json.data.bookRatingAvg,
                    ratingCount: json.data.bookRatingCount,
                    userBook: b.userBook
                      ? { ...b.userBook, rating }
                      : {
                          currentPage: 0,
                          progressPercent: 0,
                          totalReadingTimeMinutes: 0,
                          lastReadAt: null,
                          isBookmarked: false,
                          isPurchased: false,
                          rating,
                          review: null,
                        },
                  }
                : b
            )
          );
        }
      } catch {
        toast.error('Failed to submit rating');
      }
    },
    [session]
  );

  const clearFilters = () => {
    setCategory('all');
    setSort('popular');
    setSearch('');
    setSubscriptionFilter('');
    setPage(1);
  };

  const hasActiveFilters =
    category !== 'all' || sort !== 'popular' || search || subscriptionFilter;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Study Library
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mb-4">
            Browse our curated collection of NCLEX prep materials, pharmacology guides,
            clinical skills references, and more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/80 backdrop-blur-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5">
          <BookOpen className="h-full w-full" />
        </div>
      </div>

      {/* Featured Carousel */}
      {!featuredLoading && featuredBooks.length > 0 && (
        <FeaturedCarousel
          books={featuredBooks}
          userTier={userTier}
          onBookmark={handleBookmark}
        />
      )}
      {featuredLoading && (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] shrink-0">
              <Skeleton className="h-[260px] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Category Tabs + Sort + Filters */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                category === cat.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sort:</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    setPage(1);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    sort === opt.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Tier:</span>
              {SUBSCRIPTION_FILTER.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSubscriptionFilter(opt.value);
                    setPage(1);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    subscriptionFilter === opt.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results Info */}
      {!loading && pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total === 0
              ? 'No books found'
              : `Showing ${(page - 1) * pagination.limit + 1}-${Math.min(
                  page * pagination.limit,
                  pagination.total
                )} of ${pagination.total} books`}
          </p>
        </div>
      )}

      {/* Book Grid - Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Book Grid - Empty */}
      {!loading && books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No books found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'No books are available in the library yet. Check back soon!'
          }
        >
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </EmptyState>
      )}

      {/* Book Grid - Results */}
      {!loading && books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => {
            const canAccess =
              TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[book.requiredSubscription];
            const progress = book.userBook?.progressPercent || 0;
            const isStarted = progress > 0;
            const isBookmarked = book.userBook?.isBookmarked || false;

            return (
              <Card
                key={book.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Cover */}
                <div
                  className={cn(
                    'h-36 bg-gradient-to-br flex items-center justify-center relative overflow-hidden',
                    book.coverUrl ? '' : getGradient(book.id)
                  )}
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-white/30" />
                  )}

                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {book.isFeatured && (
                      <Badge className="bg-amber-500 border-0 text-white text-[10px]">
                        <Sparkles className="h-3 w-3 mr-0.5" />
                        Featured
                      </Badge>
                    )}
                    {!isStarted && !book.isFeatured && (
                      <Badge className="bg-emerald-500 border-0 text-white text-[10px]">
                        New
                      </Badge>
                    )}
                  </div>

                  {/* Bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(book.id, isBookmarked ? 'unbookmark' : 'bookmark');
                    }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>

                  {/* Lock overlay for gated content */}
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Lock className="h-5 w-5 text-white" />
                        <span className="text-[10px] text-white font-medium">
                          {book.requiredSubscription} Only
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 flex-1 flex flex-col space-y-2">
                  <h3 className="font-bold text-sm line-clamp-2 flex-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {book.author || 'Unknown Author'}
                  </p>

                  {/* Rating + Category + Tier */}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <StarRating
                      rating={book.ratingAvg}
                      count={book.ratingCount}
                      interactive={!!session}
                      onRate={(val) => handleRate(book.id, val)}
                    />
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', getTierColor(book.requiredSubscription))}
                    >
                      {book.requiredSubscription === 'Free'
                        ? 'Free'
                        : book.requiredSubscription}
                      {!canAccess && <Lock className="h-2.5 w-2.5 ml-0.5" />}
                    </Badge>
                  </div>

                  <Badge variant="secondary" className="text-[10px] w-fit">
                    {CATEGORIES.find((c) => c.value === book.category)?.label || book.category}
                  </Badge>

                  {/* Downloads */}
                  {book.downloadCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Download className="h-3 w-3" />
                      {book.downloadCount.toLocaleString()} downloads
                    </div>
                  )}

                  {/* Progress */}
                  {isStarted && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 mt-auto">
                    {canAccess ? (
                      <Button size="sm" className="w-full text-xs h-8">
                        {isStarted ? (
                          <>
                            Continue Reading
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            Read Now
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8"
                        onClick={() => router.push('/account/billing')}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Upgrade to Access
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
              let pageNum: number;
              const total = pagination.totalPages;

              if (total <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= total - 3) {
                pageNum = total - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm font-medium transition-colors',
                    page === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
