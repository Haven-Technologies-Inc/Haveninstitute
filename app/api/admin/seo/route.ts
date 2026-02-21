import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// In-memory store for SEO data (persists across requests in the same process)
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

const defaultPages: PageMeta[] = [
  {
    path: '/',
    title: 'Haven Institute - NCLEX Prep with AI-Powered Learning',
    description: 'Pass the NCLEX exam on your first attempt with Haven Institute. AI-powered adaptive learning, 3,000+ practice questions, and personalized study plans.',
    ogImage: '/og/home.png',
    indexed: true,
    canonical: 'https://haveninstitute.com',
    h1: 'Pass the NCLEX on Your First Attempt',
    jsonLd: true,
  },
  {
    path: '/nclex-rn',
    title: 'NCLEX-RN Prep Course - Haven Institute',
    description: 'Comprehensive NCLEX-RN preparation with adaptive CAT simulations, AI tutoring, and evidence-based study materials. 97% pass rate.',
    ogImage: '/og/nclex-rn.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/nclex-rn',
    h1: 'NCLEX-RN Preparation',
    jsonLd: true,
  },
  {
    path: '/nclex-pn',
    title: 'NCLEX-PN Prep Course - Haven Institute',
    description: 'Master the NCLEX-PN exam with adaptive practice tests, AI-powered explanations, and targeted review materials. Start your nursing career today.',
    ogImage: '/og/nclex-pn.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/nclex-pn',
    h1: 'NCLEX-PN Preparation',
    jsonLd: true,
  },
  {
    path: '/features',
    title: 'Features - AI-Powered NCLEX Prep Tools | Haven Institute',
    description: 'Discover Haven Institute features: adaptive CAT simulations, AI tutor, smart flashcards, detailed analytics, and personalized study plans for NCLEX success.',
    ogImage: '/og/features.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/features',
    h1: 'Features Built for NCLEX Success',
    jsonLd: true,
  },
  {
    path: '/pricing',
    title: 'Pricing Plans - Affordable NCLEX Prep | Haven Institute',
    description: 'Choose the perfect NCLEX prep plan. Free trial available. Plans starting at $29/month with full access to AI tutoring, practice questions, and CAT simulations.',
    ogImage: '/og/pricing.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/pricing',
    h1: 'Simple, Transparent Pricing',
    jsonLd: true,
  },
  {
    path: '/about',
    title: 'About Haven Institute - Our Mission for Nursing Education',
    description: 'Learn about Haven Institute\'s mission to make NCLEX preparation accessible, affordable, and effective through AI-powered adaptive learning technology.',
    ogImage: '/og/about.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/about',
    h1: 'About Haven Institute',
    jsonLd: true,
  },
  {
    path: '/compare',
    title: 'Compare NCLEX Prep - Haven Institute vs UWorld, Archer, Kaplan',
    description: 'See how Haven Institute compares to UWorld, Archer, Kaplan, and other NCLEX prep programs. Feature-by-feature comparison with transparent pricing.',
    ogImage: '/og/compare.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/compare',
    h1: 'How We Compare',
    jsonLd: true,
  },
  {
    path: '/blog',
    title: 'NCLEX Study Tips & Nursing Blog | Haven Institute',
    description: 'Expert NCLEX study tips, nursing career advice, and exam strategies from Haven Institute. Free resources to help you pass the NCLEX on your first attempt.',
    ogImage: '/og/blog.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/blog',
    h1: 'Blog & Resources',
    jsonLd: true,
  },
  {
    path: '/testimonials',
    title: 'Student Success Stories - NCLEX Pass Reviews | Haven Institute',
    description: 'Read real success stories from nursing students who passed the NCLEX with Haven Institute. Join thousands of nurses who achieved their dreams.',
    ogImage: '/og/testimonials.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/testimonials',
    h1: 'Student Success Stories',
    jsonLd: true,
  },
  {
    path: '/contact',
    title: 'Contact Us - Haven Institute Support',
    description: 'Get in touch with Haven Institute. We\'re here to help with your NCLEX preparation journey. Email, chat, or call our support team.',
    ogImage: '/og/contact.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/contact',
    h1: 'Contact Us',
    jsonLd: false,
  },
  {
    path: '/faq',
    title: 'FAQ - Common Questions About NCLEX Prep | Haven Institute',
    description: 'Find answers to frequently asked questions about Haven Institute NCLEX prep, pricing, features, study tips, and account management.',
    ogImage: '/og/faq.png',
    indexed: true,
    canonical: 'https://haveninstitute.com/faq',
    h1: 'Frequently Asked Questions',
    jsonLd: true,
  },
];

const defaultKeywords: KeywordEntry[] = [
  { id: 'kw-1', keyword: 'NCLEX prep', category: 'primary', searchVolume: 18100, currentRank: 12, targetRank: 5, status: 'improving' },
  { id: 'kw-2', keyword: 'NCLEX-RN practice questions', category: 'primary', searchVolume: 14800, currentRank: 8, targetRank: 3, status: 'ranking' },
  { id: 'kw-3', keyword: 'NCLEX study guide', category: 'primary', searchVolume: 12100, currentRank: 15, targetRank: 5, status: 'improving' },
  { id: 'kw-4', keyword: 'NCLEX-PN prep', category: 'primary', searchVolume: 6600, currentRank: 10, targetRank: 3, status: 'ranking' },
  { id: 'kw-5', keyword: 'best NCLEX prep course', category: 'primary', searchVolume: 9900, currentRank: 18, targetRank: 5, status: 'improving' },
  { id: 'kw-6', keyword: 'AI NCLEX prep', category: 'primary', searchVolume: 2400, currentRank: 3, targetRank: 1, status: 'ranking' },
  { id: 'kw-7', keyword: 'NCLEX CAT simulation practice', category: 'long-tail', searchVolume: 1900, currentRank: 5, targetRank: 1, status: 'ranking' },
  { id: 'kw-8', keyword: 'how to pass NCLEX first try', category: 'long-tail', searchVolume: 8100, currentRank: 22, targetRank: 10, status: 'improving' },
  { id: 'kw-9', keyword: 'NCLEX next generation questions', category: 'long-tail', searchVolume: 5400, currentRank: 14, targetRank: 5, status: 'improving' },
  { id: 'kw-10', keyword: 'free NCLEX practice test', category: 'long-tail', searchVolume: 22200, currentRank: null, targetRank: 10, status: 'not-ranking' },
  { id: 'kw-11', keyword: 'NCLEX pharmacology review', category: 'long-tail', searchVolume: 4400, currentRank: 19, targetRank: 5, status: 'declining' },
  { id: 'kw-12', keyword: 'UWorld NCLEX alternative', category: 'competitor', searchVolume: 3600, currentRank: 7, targetRank: 1, status: 'ranking' },
  { id: 'kw-13', keyword: 'Archer NCLEX review', category: 'competitor', searchVolume: 2900, currentRank: null, targetRank: 5, status: 'not-ranking' },
  { id: 'kw-14', keyword: 'cheaper alternative to UWorld', category: 'competitor', searchVolume: 1300, currentRank: 4, targetRank: 1, status: 'ranking' },
  { id: 'kw-15', keyword: 'Kaplan vs UWorld NCLEX', category: 'competitor', searchVolume: 2200, currentRank: null, targetRank: 10, status: 'not-ranking' },
];

const defaultRedirects: RedirectRule[] = [
  { id: 'rd-1', source: '/register', destination: '/signup', type: 301, active: true, createdAt: '2025-11-01T00:00:00Z' },
  { id: 'rd-2', source: '/nclex', destination: '/nclex-rn', type: 301, active: true, createdAt: '2025-11-15T00:00:00Z' },
  { id: 'rd-3', source: '/login', destination: '/signin', type: 301, active: true, createdAt: '2025-12-01T00:00:00Z' },
  { id: 'rd-4', source: '/free-trial', destination: '/pricing', type: 302, active: true, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'rd-5', source: '/app', destination: '/dashboard', type: 301, active: true, createdAt: '2026-01-20T00:00:00Z' },
];

const competitors: CompetitorData[] = [
  {
    name: 'UWorld',
    slug: 'uworld',
    domainAuthority: 72,
    indexedPages: 5200,
    keyAdvantages: ['Large question bank (2,100+)', 'Strong brand recognition', 'Detailed rationales', 'High pass rates advertised'],
    ourAdvantages: ['AI-powered adaptive learning', 'More affordable pricing', 'CAT simulation engine', 'Real-time AI tutoring'],
  },
  {
    name: 'Archer',
    slug: 'archer',
    domainAuthority: 45,
    indexedPages: 1800,
    keyAdvantages: ['Affordable pricing', 'Readiness assessments', 'Large question bank', 'Popular on social media'],
    ourAdvantages: ['Superior AI technology', 'Better UX/UI', 'Personalized study plans', 'Smarter analytics'],
  },
  {
    name: 'Kaplan',
    slug: 'kaplan',
    domainAuthority: 78,
    indexedPages: 12000,
    keyAdvantages: ['Established brand (80+ years)', 'Live instruction options', 'Decision tree method', 'Extensive content library'],
    ourAdvantages: ['Modern AI approach', 'Fraction of the cost', 'More intuitive platform', 'Faster content updates'],
  },
  {
    name: 'Nursing.com',
    slug: 'nursing-com',
    domainAuthority: 58,
    indexedPages: 3400,
    keyAdvantages: ['Large content library', 'Video-focused approach', 'Active community', 'Nursing school coverage'],
    ourAdvantages: ['Focused NCLEX prep', 'AI-powered learning', 'Better practice questions', 'CAT simulation'],
  },
  {
    name: 'Remar Nurse',
    slug: 'remar-nurse',
    domainAuthority: 35,
    indexedPages: 800,
    keyAdvantages: ['Virtual Trainer method', 'Passionate instructor', 'YouTube presence', 'Simple approach'],
    ourAdvantages: ['Scalable AI technology', 'Larger question bank', 'Data-driven insights', 'Comprehensive platform'],
  },
];

// In-memory data store
let seoPages = [...defaultPages];
let seoKeywords = [...defaultKeywords];
let seoRedirects = [...defaultRedirects];
let lastSitemapGenerated = '2026-02-18T14:30:00Z';

// Sitemap URLs
const sitemapUrls = [
  'https://haveninstitute.com/',
  'https://haveninstitute.com/nclex-rn',
  'https://haveninstitute.com/nclex-pn',
  'https://haveninstitute.com/features',
  'https://haveninstitute.com/pricing',
  'https://haveninstitute.com/about',
  'https://haveninstitute.com/compare',
  'https://haveninstitute.com/blog',
  'https://haveninstitute.com/testimonials',
  'https://haveninstitute.com/contact',
  'https://haveninstitute.com/faq',
  'https://haveninstitute.com/signin',
  'https://haveninstitute.com/signup',
];

// Crawler stats (simulated)
const crawlerStats = {
  totalCrawls7d: 1247,
  avgCrawlsPerDay: 178,
  mostCrawledPages: [
    { path: '/', crawls: 312 },
    { path: '/nclex-rn', crawls: 198 },
    { path: '/pricing', crawls: 156 },
    { path: '/blog', crawls: 142 },
    { path: '/features', crawls: 118 },
  ],
  crawlErrors: [
    { path: '/blog/old-post-removed', error: '404 Not Found', lastSeen: '2026-02-19T08:15:00Z' },
    { path: '/api/legacy-endpoint', error: '500 Server Error', lastSeen: '2026-02-17T12:30:00Z' },
  ],
  crawlerActivity: [
    { day: 'Mon', googlebot: 42, bingbot: 12, other: 5 },
    { day: 'Tue', googlebot: 38, bingbot: 15, other: 3 },
    { day: 'Wed', googlebot: 55, bingbot: 10, other: 8 },
    { day: 'Thu', googlebot: 48, bingbot: 18, other: 4 },
    { day: 'Fri', googlebot: 35, bingbot: 11, other: 6 },
    { day: 'Sat', googlebot: 22, bingbot: 8, other: 2 },
    { day: 'Sun', googlebot: 28, bingbot: 9, other: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeSeoScore(pages: PageMeta[]) {
  const checks = {
    uniqueTitles: new Set(pages.map((p) => p.title)).size === pages.length,
    allDescriptions: pages.every((p) => p.description.length > 0),
    ogImages: pages.every((p) => p.ogImage.length > 0),
    jsonLd: pages.filter((p) => p.jsonLd).length >= pages.length * 0.8,
    sitemapExists: true,
    robotsTxt: true,
    canonicalUrls: pages.every((p) => p.canonical.length > 0),
    mobileFriendly: true,
    sslEnabled: true,
    noBrokenLinks: crawlerStats.crawlErrors.length < 3,
    pageSpeed: true,
    h1Tags: pages.every((p) => p.h1.length > 0),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const score = Math.round((passed / total) * 100);

  return { score, checks, passed, total };
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    await requireAdmin();

    const health = computeSeoScore(seoPages);

    return successResponse({
      pages: seoPages,
      health,
      keywords: seoKeywords,
      competitors,
      sitemap: {
        urls: sitemapUrls,
        urlCount: sitemapUrls.length,
        lastGenerated: lastSitemapGenerated,
      },
      redirects: seoRedirects,
      crawlerStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update-meta': {
        const { path, title, description, ogImage, indexed, canonical, h1, jsonLd } = body;
        if (!path) return errorResponse('Path is required', 400);

        const pageIndex = seoPages.findIndex((p) => p.path === path);
        if (pageIndex === -1) return errorResponse('Page not found', 404);

        if (title !== undefined) seoPages[pageIndex].title = title;
        if (description !== undefined) seoPages[pageIndex].description = description;
        if (ogImage !== undefined) seoPages[pageIndex].ogImage = ogImage;
        if (indexed !== undefined) seoPages[pageIndex].indexed = indexed;
        if (canonical !== undefined) seoPages[pageIndex].canonical = canonical;
        if (h1 !== undefined) seoPages[pageIndex].h1 = h1;
        if (jsonLd !== undefined) seoPages[pageIndex].jsonLd = jsonLd;

        const health = computeSeoScore(seoPages);

        return successResponse({ page: seoPages[pageIndex], health });
      }

      case 'bulk-index': {
        const { indexed } = body;
        seoPages = seoPages.map((p) => ({ ...p, indexed: indexed ?? true }));
        return successResponse({ pages: seoPages });
      }

      case 'add-redirect': {
        const { source, destination, type } = body;
        if (!source || !destination) return errorResponse('Source and destination are required', 400);

        const existing = seoRedirects.find((r) => r.source === source);
        if (existing) return errorResponse('A redirect for this source already exists', 400);

        const newRedirect: RedirectRule = {
          id: `rd-${Date.now()}`,
          source,
          destination,
          type: type === 302 ? 302 : 301,
          active: true,
          createdAt: new Date().toISOString(),
        };
        seoRedirects.push(newRedirect);

        return successResponse({ redirect: newRedirect, redirects: seoRedirects });
      }

      case 'delete-redirect': {
        const { id } = body;
        if (!id) return errorResponse('Redirect ID is required', 400);

        const idx = seoRedirects.findIndex((r) => r.id === id);
        if (idx === -1) return errorResponse('Redirect not found', 404);

        seoRedirects.splice(idx, 1);
        return successResponse({ redirects: seoRedirects });
      }

      case 'update-redirect': {
        const { id, source, destination, type, active } = body;
        if (!id) return errorResponse('Redirect ID is required', 400);

        const rdIdx = seoRedirects.findIndex((r) => r.id === id);
        if (rdIdx === -1) return errorResponse('Redirect not found', 404);

        if (source !== undefined) seoRedirects[rdIdx].source = source;
        if (destination !== undefined) seoRedirects[rdIdx].destination = destination;
        if (type !== undefined) seoRedirects[rdIdx].type = type;
        if (active !== undefined) seoRedirects[rdIdx].active = active;

        return successResponse({ redirect: seoRedirects[rdIdx], redirects: seoRedirects });
      }

      case 'regenerate-sitemap': {
        // Simulate sitemap regeneration
        lastSitemapGenerated = new Date().toISOString();
        return successResponse({
          sitemap: {
            urls: sitemapUrls,
            urlCount: sitemapUrls.length,
            lastGenerated: lastSitemapGenerated,
          },
        });
      }

      case 'update-keywords': {
        const { id, keyword, category, searchVolume, currentRank, targetRank, status } = body;
        if (!id) return errorResponse('Keyword ID is required', 400);

        const kwIdx = seoKeywords.findIndex((k) => k.id === id);
        if (kwIdx === -1) return errorResponse('Keyword not found', 404);

        if (keyword !== undefined) seoKeywords[kwIdx].keyword = keyword;
        if (category !== undefined) seoKeywords[kwIdx].category = category;
        if (searchVolume !== undefined) seoKeywords[kwIdx].searchVolume = searchVolume;
        if (currentRank !== undefined) seoKeywords[kwIdx].currentRank = currentRank;
        if (targetRank !== undefined) seoKeywords[kwIdx].targetRank = targetRank;
        if (status !== undefined) seoKeywords[kwIdx].status = status;

        return successResponse({ keyword: seoKeywords[kwIdx], keywords: seoKeywords });
      }

      case 'add-keyword': {
        const { keyword, category, searchVolume, targetRank } = body;
        if (!keyword) return errorResponse('Keyword is required', 400);

        const newKw: KeywordEntry = {
          id: `kw-${Date.now()}`,
          keyword,
          category: category || 'primary',
          searchVolume: searchVolume || 0,
          currentRank: null,
          targetRank: targetRank || 10,
          status: 'not-ranking',
        };
        seoKeywords.push(newKw);

        return successResponse({ keyword: newKw, keywords: seoKeywords });
      }

      case 'delete-keyword': {
        const { id } = body;
        if (!id) return errorResponse('Keyword ID is required', 400);

        const kwDelIdx = seoKeywords.findIndex((k) => k.id === id);
        if (kwDelIdx === -1) return errorResponse('Keyword not found', 404);

        seoKeywords.splice(kwDelIdx, 1);
        return successResponse({ keywords: seoKeywords });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
