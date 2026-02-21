'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Globe,
  BarChart3,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  FileText,
  Link2,
  Bot,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageMeta {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  indexed: boolean;
  canonical: string;
  h1: string;
  jsonLd: boolean;
}

interface KeywordEntry {
  id: string;
  keyword: string;
  category: 'primary' | 'long-tail' | 'competitor';
  searchVolume: number;
  currentRank: number | null;
  targetRank: number;
  status: 'ranking' | 'not-ranking' | 'improving' | 'declining';
}

interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  type: 301 | 302;
  active: boolean;
  createdAt: string;
}

interface CompetitorData {
  name: string;
  slug: string;
  domainAuthority: number;
  indexedPages: number;
  keyAdvantages: string[];
  ourAdvantages: string[];
}

interface CrawlerStats {
  totalCrawls7d: number;
  avgCrawlsPerDay: number;
  mostCrawledPages: { path: string; crawls: number }[];
  crawlErrors: { path: string; error: string; lastSeen: string }[];
  crawlerActivity: { day: string; googlebot: number; bingbot: number; other: number }[];
}

interface SeoHealth {
  score: number;
  passed: number;
  total: number;
  checks: {
    uniqueTitles: boolean;
    allDescriptions: boolean;
    ogImages: boolean;
    jsonLd: boolean;
    sitemapExists: boolean;
    robotsTxt: boolean;
    canonicalUrls: boolean;
    mobileFriendly: boolean;
    sslEnabled: boolean;
    noBrokenLinks: boolean;
    pageSpeed: boolean;
    h1Tags: boolean;
  };
}

interface SeoData {
  pages: PageMeta[];
  health: SeoHealth;
  keywords: KeywordEntry[];
  competitors: CompetitorData[];
  sitemap: {
    urls: string[];
    urlCount: number;
    lastGenerated: string;
  };
  redirects: RedirectRule[];
  crawlerStats: CrawlerStats;
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SeoSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: character count color
// ---------------------------------------------------------------------------

function charCountColor(len: number, min: number, max: number) {
  if (len >= min && len <= max) return 'text-emerald-600';
  if (len > 0 && (len < min - 10 || len > max + 10)) return 'text-red-500';
  if (len > 0) return 'text-amber-500';
  return 'text-muted-foreground';
}

// ---------------------------------------------------------------------------
// Helper: keyword status badge
// ---------------------------------------------------------------------------

function KeywordStatusBadge({ status }: { status: KeywordEntry['status'] }) {
  switch (status) {
    case 'ranking':
      return <Badge variant="success">Ranking</Badge>;
    case 'not-ranking':
      return <Badge variant="destructive">Not Ranking</Badge>;
    case 'improving':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent">
          <TrendingUp className="h-3 w-3 mr-1" />
          Improving
        </Badge>
      );
    case 'declining':
      return (
        <Badge variant="warning">
          <TrendingDown className="h-3 w-3 mr-1" />
          Declining
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Component: SEO Health Check Item
// ---------------------------------------------------------------------------

function HealthCheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {passed ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
      )}
      <span className={cn('text-sm', passed ? 'text-foreground' : 'text-red-600 dark:text-red-400 font-medium')}>
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Pages & Meta state
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PageMeta>>({});

  // Keywords state
  const [keywordFilter, setKeywordFilter] = useState<string>('all');
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState({ keyword: '', category: 'primary', searchVolume: '', targetRank: '' });

  // Redirects state
  const [showAddRedirect, setShowAddRedirect] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ source: '', destination: '', type: '301' });

  // Competitor comparison
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/seo');
      if (!res.ok) throw new Error('Failed to fetch SEO data');
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // API actions
  // -------------------------------------------------------------------------

  async function postAction(body: Record<string, any>, successMsg: string) {
    try {
      setActionLoading(body.action);
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      toast.success(successMsg);
      await fetchData();
      return json.data;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    } finally {
      setActionLoading(null);
    }
  }

  // Page meta actions
  function startEditPage(page: PageMeta) {
    setEditingPage(page.path);
    setEditForm({ ...page });
  }

  function cancelEditPage() {
    setEditingPage(null);
    setEditForm({});
  }

  async function savePageMeta() {
    if (!editForm.path) return;
    await postAction({ action: 'update-meta', ...editForm }, 'Page meta updated successfully');
    setEditingPage(null);
    setEditForm({});
  }

  async function handleBulkIndex() {
    await postAction({ action: 'bulk-index', indexed: true }, 'All pages set to indexed');
  }

  // Redirect actions
  async function addRedirect() {
    if (!newRedirect.source || !newRedirect.destination) {
      toast.error('Source and destination are required');
      return;
    }
    const result = await postAction(
      { action: 'add-redirect', source: newRedirect.source, destination: newRedirect.destination, type: parseInt(newRedirect.type) },
      'Redirect added successfully'
    );
    if (result) {
      setShowAddRedirect(false);
      setNewRedirect({ source: '', destination: '', type: '301' });
    }
  }

  async function deleteRedirect(id: string) {
    await postAction({ action: 'delete-redirect', id }, 'Redirect deleted');
  }

  // Sitemap
  async function regenerateSitemap() {
    await postAction({ action: 'regenerate-sitemap' }, 'Sitemap regenerated successfully');
  }

  // Keyword actions
  async function addKeyword() {
    if (!newKeyword.keyword) {
      toast.error('Keyword is required');
      return;
    }
    const result = await postAction(
      {
        action: 'add-keyword',
        keyword: newKeyword.keyword,
        category: newKeyword.category,
        searchVolume: parseInt(newKeyword.searchVolume) || 0,
        targetRank: parseInt(newKeyword.targetRank) || 10,
      },
      'Keyword added successfully'
    );
    if (result) {
      setShowAddKeyword(false);
      setNewKeyword({ keyword: '', category: 'primary', searchVolume: '', targetRank: '' });
    }
  }

  async function deleteKeyword(id: string) {
    await postAction({ action: 'delete-keyword', id }, 'Keyword deleted');
  }

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------

  if (loading) return <SeoSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load SEO Data</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { pages, health, keywords, competitors, sitemap, redirects, crawlerStats } = data;

  // Filtered keywords
  const filteredKeywords = keywordFilter === 'all' ? keywords : keywords.filter((k) => k.category === keywordFilter);

  // -------------------------------------------------------------------------
  // Overview stats
  // -------------------------------------------------------------------------

  const overviewStats = [
    {
      label: 'SEO Score',
      value: `${health.score}%`,
      icon: Shield,
      iconColor: health.score >= 80 ? 'text-emerald-600' : health.score >= 60 ? 'text-amber-600' : 'text-red-600',
      description: `${health.passed}/${health.total} checks passed`,
    },
    {
      label: 'Indexed Pages',
      value: pages.filter((p) => p.indexed).length.toString(),
      icon: Globe,
      iconColor: 'text-blue-600',
      description: `of ${pages.length} total pages`,
    },
    {
      label: 'Keywords Tracked',
      value: keywords.length.toString(),
      icon: Search,
      iconColor: 'text-purple-600',
      description: `${keywords.filter((k) => k.status === 'ranking').length} ranking`,
    },
    {
      label: 'Active Redirects',
      value: redirects.filter((r) => r.active).length.toString(),
      icon: Link2,
      iconColor: 'text-amber-600',
      description: `${redirects.length} total rules`,
    },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="SEO Management"
        description="Search engine optimization, meta tags, keywords, and site health."
      >
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </PageHeader>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pages" className="text-xs sm:text-sm">
            <FileText className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Pages & Meta
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs sm:text-sm">
            <Search className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="competitors" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="text-xs sm:text-sm">
            <Globe className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="redirects" className="text-xs sm:text-sm">
            <Link2 className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Redirects
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* OVERVIEW TAB                                                       */}
        {/* ================================================================= */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6 mt-4">
            {/* SEO Health Score */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  SEO Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div
                    className={cn(
                      'h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold border-4',
                      health.score >= 80
                        ? 'border-emerald-500 text-emerald-600'
                        : health.score >= 60
                        ? 'border-amber-500 text-amber-600'
                        : 'border-red-500 text-red-600'
                    )}
                  >
                    {health.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {health.score >= 80 ? 'Excellent' : health.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {health.passed} of {health.total} checks passing
                    </p>
                  </div>
                </div>

                <div className="space-y-0.5 border-t pt-4">
                  <HealthCheckItem label="All pages have unique titles" passed={health.checks.uniqueTitles} />
                  <HealthCheckItem label="All pages have meta descriptions" passed={health.checks.allDescriptions} />
                  <HealthCheckItem label="Open Graph images configured" passed={health.checks.ogImages} />
                  <HealthCheckItem label="JSON-LD structured data present" passed={health.checks.jsonLd} />
                  <HealthCheckItem label="Sitemap.xml exists" passed={health.checks.sitemapExists} />
                  <HealthCheckItem label="Robots.txt configured" passed={health.checks.robotsTxt} />
                  <HealthCheckItem label="Canonical URLs set" passed={health.checks.canonicalUrls} />
                  <HealthCheckItem label="Mobile-friendly" passed={health.checks.mobileFriendly} />
                  <HealthCheckItem label="SSL enabled" passed={health.checks.sslEnabled} />
                  <HealthCheckItem label="No broken internal links" passed={health.checks.noBrokenLinks} />
                  <HealthCheckItem label="Page load speed < 3s" passed={health.checks.pageSpeed} />
                  <HealthCheckItem label="H1 tags on all pages" passed={health.checks.h1Tags} />
                </div>
              </CardContent>
            </Card>

            {/* Crawler Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Crawler Activity (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-2xl font-bold">{crawlerStats.totalCrawls7d.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total crawls</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-2xl font-bold">{crawlerStats.avgCrawlsPerDay}</p>
                    <p className="text-xs text-muted-foreground">Avg per day</p>
                  </div>
                </div>

                {/* Crawler activity chart (simplified bar representation) */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Daily Activity</p>
                  <div className="space-y-2">
                    {crawlerStats.crawlerActivity.map((day) => {
                      const total = day.googlebot + day.bingbot + day.other;
                      const maxTotal = Math.max(...crawlerStats.crawlerActivity.map((d) => d.googlebot + d.bingbot + d.other));
                      return (
                        <div key={day.day} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-8 shrink-0">{day.day}</span>
                          <div className="flex-1 flex items-center gap-0.5 h-5">
                            <div
                              className="bg-blue-500 h-full rounded-l"
                              style={{ width: `${(day.googlebot / maxTotal) * 100}%` }}
                              title={`Googlebot: ${day.googlebot}`}
                            />
                            <div
                              className="bg-amber-500 h-full"
                              style={{ width: `${(day.bingbot / maxTotal) * 100}%` }}
                              title={`Bingbot: ${day.bingbot}`}
                            />
                            <div
                              className="bg-gray-400 h-full rounded-r"
                              style={{ width: `${(day.other / maxTotal) * 100}%` }}
                              title={`Other: ${day.other}`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{total}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                      <span className="text-[11px] text-muted-foreground">Googlebot</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                      <span className="text-[11px] text-muted-foreground">Bingbot</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-gray-400" />
                      <span className="text-[11px] text-muted-foreground">Other</span>
                    </div>
                  </div>
                </div>

                {/* Most crawled pages */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Most Crawled Pages</p>
                  <div className="space-y-2">
                    {crawlerStats.mostCrawledPages.map((page) => (
                      <div key={page.path} className="flex items-center justify-between text-sm">
                        <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{page.path}</code>
                        <span className="text-muted-foreground text-xs">{page.crawls} crawls</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crawl errors */}
                {crawlerStats.crawlErrors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Crawl Errors
                    </p>
                    <div className="space-y-2">
                      {crawlerStats.crawlErrors.map((err, idx) => (
                        <div key={idx} className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
                          <div className="flex items-center justify-between">
                            <code className="text-xs text-red-700 dark:text-red-400">{err.path}</code>
                            <Badge variant="destructive" className="text-[10px]">{err.error}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Last seen: {new Date(err.lastSeen).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats: Keywords by status */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Keyword Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {keywords.filter((k) => k.status === 'ranking').length}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Ranking</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {keywords.filter((k) => k.status === 'improving').length}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500">Improving</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4">
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {keywords.filter((k) => k.status === 'declining').length}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">Declining</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {keywords.filter((k) => k.status === 'not-ranking').length}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500">Not Ranking</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Top Keywords by Volume</p>
                  <div className="space-y-2">
                    {[...keywords]
                      .sort((a, b) => b.searchVolume - a.searchVolume)
                      .slice(0, 5)
                      .map((kw) => (
                        <div key={kw.id} className="flex items-center justify-between">
                          <span className="text-sm truncate flex-1 mr-3">{kw.keyword}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{kw.searchVolume.toLocaleString()}/mo</span>
                            <KeywordStatusBadge status={kw.status} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats: Sitemap + Redirects */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Sitemap & Redirects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Sitemap Status</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-2xl font-bold">{sitemap.urlCount}</p>
                        <p className="text-xs text-muted-foreground">URLs in sitemap</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-sm font-medium">{new Date(sitemap.lastGenerated).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Last generated</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Redirect Summary</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-muted/40 p-3 text-center">
                        <p className="text-xl font-bold">{redirects.length}</p>
                        <p className="text-[11px] text-muted-foreground">Total</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3 text-center">
                        <p className="text-xl font-bold">{redirects.filter((r) => r.type === 301).length}</p>
                        <p className="text-[11px] text-muted-foreground">301 Permanent</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3 text-center">
                        <p className="text-xl font-bold">{redirects.filter((r) => r.type === 302).length}</p>
                        <p className="text-[11px] text-muted-foreground">302 Temporary</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Competitor Overview</p>
                    <div className="space-y-2">
                      {competitors.map((c) => (
                        <div key={c.slug} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{c.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">DA: {c.domainAuthority}</span>
                            <span className="text-xs text-muted-foreground">{c.indexedPages.toLocaleString()} pages</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* PAGES & META TAB                                                   */}
        {/* ================================================================= */}
        <TabsContent value="pages">
          <div className="mt-4 space-y-4">
            {/* Bulk actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkIndex}
                disabled={actionLoading === 'bulk-index'}
              >
                <Eye className="h-4 w-4 mr-2" />
                Set All as Indexed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateSitemap}
                disabled={actionLoading === 'regenerate-sitemap'}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', actionLoading === 'regenerate-sitemap' && 'animate-spin')} />
                Regenerate Sitemap
              </Button>
            </div>

            {/* Pages table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Path</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Title</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Description</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">OG Image</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Indexed</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pages.map((page) => (
                      <tr key={page.path} className="hover:bg-muted/20 transition-colors">
                        {editingPage === page.path ? (
                          /* Inline editing row */
                          <td colSpan={6} className="px-4 py-4">
                            <div className="space-y-4 max-w-4xl">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="text-sm font-semibold bg-muted/50 px-2 py-0.5 rounded">{page.path}</code>
                                <Badge variant="outline" className="text-[10px]">Editing</Badge>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Title</Label>
                                    <span className={cn('text-[11px]', charCountColor(editForm.title?.length || 0, 50, 60))}>
                                      {editForm.title?.length || 0}/60 chars
                                    </span>
                                  </div>
                                  <Input
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="Page title"
                                  />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Description</Label>
                                    <span className={cn('text-[11px]', charCountColor(editForm.description?.length || 0, 150, 160))}>
                                      {editForm.description?.length || 0}/160 chars
                                    </span>
                                  </div>
                                  <textarea
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Meta description"
                                    rows={3}
                                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">OG Image Path</Label>
                                  <Input
                                    value={editForm.ogImage || ''}
                                    onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
                                    placeholder="/og/page.png"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Canonical URL</Label>
                                  <Input
                                    value={editForm.canonical || ''}
                                    onChange={(e) => setEditForm({ ...editForm, canonical: e.target.value })}
                                    placeholder="https://haveninstitute.com/path"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">H1 Tag</Label>
                                  <Input
                                    value={editForm.h1 || ''}
                                    onChange={(e) => setEditForm({ ...editForm, h1: e.target.value })}
                                    placeholder="Page heading"
                                  />
                                </div>
                                <div className="flex items-center gap-6 pt-6">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={editForm.indexed ?? true}
                                      onCheckedChange={(checked) => setEditForm({ ...editForm, indexed: checked })}
                                    />
                                    <Label className="text-xs">Indexed</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={editForm.jsonLd ?? false}
                                      onCheckedChange={(checked) => setEditForm({ ...editForm, jsonLd: checked })}
                                    />
                                    <Label className="text-xs">JSON-LD</Label>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <Button size="sm" onClick={savePageMeta} disabled={actionLoading === 'update-meta'}>
                                  {actionLoading === 'update-meta' ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                  )}
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditPage}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          /* Display row */
                          <>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{page.path}</code>
                                <a
                                  href={page.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm truncate max-w-[250px]" title={page.title}>{page.title}</p>
                                <span className={cn('text-[11px]', charCountColor(page.title.length, 50, 60))}>
                                  {page.title.length} chars
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-xs text-muted-foreground truncate max-w-[250px]" title={page.description}>
                                  {page.description}
                                </p>
                                <span className={cn('text-[11px]', charCountColor(page.description.length, 150, 160))}>
                                  {page.description.length} chars
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {page.ogImage ? (
                                <Badge variant="success" className="text-[10px]">Set</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">Missing</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {page.indexed ? (
                                <Eye className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm" onClick={() => startEditPage(page)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* KEYWORDS TAB                                                       */}
        {/* ================================================================= */}
        <TabsContent value="keywords">
          <div className="mt-4 space-y-4">
            {/* Filters + Add */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Select value={keywordFilter} onValueChange={setKeywordFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="long-tail">Long-tail</SelectItem>
                  <SelectItem value="competitor">Competitor</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowAddKeyword(!showAddKeyword)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>

            {/* Add keyword form */}
            {showAddKeyword && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Keyword</Label>
                      <Input
                        value={newKeyword.keyword}
                        onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                        placeholder="e.g. NCLEX tips"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Category</Label>
                      <Select value={newKeyword.category} onValueChange={(val) => setNewKeyword({ ...newKeyword, category: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="long-tail">Long-tail</SelectItem>
                          <SelectItem value="competitor">Competitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Est. Search Volume</Label>
                      <Input
                        type="number"
                        value={newKeyword.searchVolume}
                        onChange={(e) => setNewKeyword({ ...newKeyword, searchVolume: e.target.value })}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Target Rank</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={newKeyword.targetRank}
                          onChange={(e) => setNewKeyword({ ...newKeyword, targetRank: e.target.value })}
                          placeholder="10"
                        />
                        <Button size="sm" onClick={addKeyword} disabled={actionLoading === 'add-keyword'}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keywords table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Keyword</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Search Volume</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Current Rank</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Target Rank</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredKeywords.map((kw) => (
                      <tr key={kw.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{kw.keyword}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] capitalize">{kw.category}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">{kw.searchVolume.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          {kw.currentRank !== null ? (
                            <span className={cn('text-sm font-medium', kw.currentRank <= 10 ? 'text-emerald-600' : kw.currentRank <= 20 ? 'text-amber-600' : 'text-red-500')}>
                              #{kw.currentRank}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">#{kw.targetRank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <KeywordStatusBadge status={kw.status} />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteKeyword(kw.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredKeywords.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No keywords found for the selected filter.
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* COMPETITORS TAB                                                    */}
        {/* ================================================================= */}
        <TabsContent value="competitors">
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.map((comp) => {
              const isExpanded = expandedCompetitor === comp.slug;
              return (
                <Card
                  key={comp.slug}
                  className={cn('border-0 shadow-sm transition-all cursor-pointer', isExpanded && 'ring-2 ring-primary/30')}
                  onClick={() => setExpandedCompetitor(isExpanded ? null : comp.slug)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{comp.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">DA: {comp.domainAuthority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{comp.indexedPages.toLocaleString()} indexed pages</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Domain Authority bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Domain Authority</span>
                        <span>{comp.domainAuthority}/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            comp.domainAuthority >= 70 ? 'bg-red-500' : comp.domainAuthority >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${comp.domainAuthority}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded comparison */}
                    {isExpanded && (
                      <div className="space-y-4 pt-2 border-t">
                        <div>
                          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Their Advantages
                          </p>
                          <ul className="space-y-1">
                            {comp.keyAdvantages.map((adv, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                                {adv}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Our Advantages
                          </p>
                          <ul className="space-y-1">
                            {comp.ourAdvantages.map((adv, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                                {adv}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {!isExpanded && (
                      <p className="text-[11px] text-muted-foreground text-center">Click to compare</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* SITEMAP TAB                                                        */}
        {/* ================================================================= */}
        <TabsContent value="sitemap">
          <div className="mt-4 space-y-4">
            {/* Sitemap info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Sitemap Management
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateSitemap}
                    disabled={actionLoading === 'regenerate-sitemap'}
                  >
                    <RefreshCw className={cn('h-4 w-4 mr-2', actionLoading === 'regenerate-sitemap' && 'animate-spin')} />
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg bg-muted/40 p-4">
                    <p className="text-2xl font-bold">{sitemap.urlCount}</p>
                    <p className="text-xs text-muted-foreground">Total URLs</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-4">
                    <p className="text-sm font-medium">{new Date(sitemap.lastGenerated).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Last Generated</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Active</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500">sitemap.xml</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">URLs in Sitemap</p>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {sitemap.urls.map((url) => (
                      <div key={url} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/40 transition-colors">
                        <code className="text-xs">{url}</code>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* REDIRECTS TAB                                                      */}
        {/* ================================================================= */}
        <TabsContent value="redirects">
          <div className="mt-4 space-y-4">
            {/* Add redirect button */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowAddRedirect(!showAddRedirect)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Redirect
              </Button>
            </div>

            {/* Add redirect form */}
            {showAddRedirect && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Source Path</Label>
                      <Input
                        value={newRedirect.source}
                        onChange={(e) => setNewRedirect({ ...newRedirect, source: e.target.value })}
                        placeholder="/old-path"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Destination Path</Label>
                      <Input
                        value={newRedirect.destination}
                        onChange={(e) => setNewRedirect({ ...newRedirect, destination: e.target.value })}
                        placeholder="/new-path"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select value={newRedirect.type} onValueChange={(val) => setNewRedirect({ ...newRedirect, type: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="301">301 Permanent</SelectItem>
                          <SelectItem value="302">302 Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button size="sm" onClick={addRedirect} disabled={actionLoading === 'add-redirect'}>
                        {actionLoading === 'add-redirect' ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Redirects table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Destination</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Created</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {redirects.map((rd) => (
                      <tr key={rd.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{rd.source}</code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Link2 className="h-3 w-3 text-muted-foreground" />
                            <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{rd.destination}</code>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={rd.type === 301 ? 'secondary' : 'warning'} className="text-[10px]">
                            {rd.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {rd.active ? (
                            <Badge variant="success" className="text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(rd.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRedirect(rd.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {redirects.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No redirects configured. Click "Add Redirect" to create one.
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
