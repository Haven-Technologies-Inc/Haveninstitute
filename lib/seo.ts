import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.havenstudy.com';
const SITE_NAME = 'Haven Institute';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

// Competitor keywords to target
export const TARGET_KEYWORDS = {
  primary: [
    'NCLEX prep',
    'NCLEX review',
    'NCLEX practice questions',
    'NCLEX study guide',
    'NCLEX-RN prep',
    'NCLEX-PN prep',
    'nursing exam prep',
    'NCLEX test bank',
  ],
  secondary: [
    'NCLEX practice test',
    'NCLEX CAT simulator',
    'adaptive NCLEX prep',
    'AI NCLEX tutor',
    'NCLEX flashcards',
    'NCLEX study plan',
    'pass NCLEX first attempt',
    'NCLEX pass rate',
    'best NCLEX prep course',
    'NCLEX review course online',
  ],
  longTail: [
    'best NCLEX prep program 2026',
    'NCLEX-RN practice questions free',
    'how to pass NCLEX on first try',
    'NCLEX adaptive learning platform',
    'AI powered NCLEX preparation',
    'NCLEX computer adaptive test simulator',
    'NCLEX-RN study plan generator',
    'affordable NCLEX prep online',
    'NCLEX prep better than UWorld',
    'NCLEX prep better than Archer',
    'NCLEX prep alternative to Kaplan',
  ],
  competitor: [
    'UWorld NCLEX alternative',
    'Archer review alternative',
    'Kaplan NCLEX alternative',
    'Nursing.com alternative',
    'Remar nurse alternative',
    'best NCLEX prep vs UWorld',
  ],
};

export function createMetadata({
  title,
  description,
  path = '',
  ogImage,
  keywords = [],
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@haveninstitute',
      site: '@haveninstitute',
    },
  };
}

// JSON-LD Schema generators
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Haven Institute',
    alternateName: 'Haven Study',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description:
      'AI-powered NCLEX preparation platform helping nursing students pass their licensure exam on the first attempt with adaptive learning, CAT simulations, and personalized study plans.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/haveninstitute',
      'https://linkedin.com/company/haveninstitute',
      'https://instagram.com/haveninstitute',
      'https://github.com/haveninstitute',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@havenstudy.com',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Haven Institute',
    alternateName: 'Haven Study',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function courseSchema({
  name,
  description,
  url,
  price,
  priceCurrency = 'USD',
  provider = 'Haven Institute',
  ratingValue = '4.9',
  ratingCount = '2847',
  reviewCount = '1523',
}: {
  name: string;
  description: string;
  url: string;
  price: string;
  priceCurrency?: string;
  provider?: string;
  ratingValue?: string;
  ratingCount?: string;
  reviewCount?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: provider,
      url: SITE_URL,
      sameAs: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/pricing`,
      category: 'Online Course',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT200H',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      bestRating: '5',
      ratingCount,
      reviewCount,
    },
    educationalLevel: 'Professional',
    teaches: 'NCLEX Exam Preparation',
    competencyRequired: 'Nursing school completion',
    numberOfCredits: 0,
    isAccessibleForFree: false,
    inLanguage: 'en',
  };
}

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Haven Institute NCLEX Prep',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '79.99',
      priceCurrency: 'USD',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '2847',
      reviewCount: '1523',
    },
    featureList:
      'AI-Powered Adaptive Learning, NCLEX CAT Simulator, 50000+ Practice Questions, Personalized Study Plans, Spaced Repetition Flashcards, AI Tutor, Performance Analytics, Community Study Groups',
  };
}

export function reviewSchema(reviews: Array<{
  author: string;
  rating: number;
  body: string;
  datePublished: string;
}>) {
  return reviews.map((review) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.body,
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': 'EducationalOrganization',
      name: 'Haven Institute',
    },
  }));
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineBusiness',
    name: 'Haven Institute',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    priceRange: '$0 - $79.99/month',
    telephone: '+1-800-HAVEN-NCLEX',
    email: 'support@havenstudy.com',
    sameAs: [
      'https://twitter.com/haveninstitute',
      'https://linkedin.com/company/haveninstitute',
      'https://instagram.com/haveninstitute',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '2847',
    },
  };
}

export function comparisonSchema(competitorName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Haven Institute vs ${competitorName} - NCLEX Prep Comparison`,
    description: `Compare Haven Institute with ${competitorName} for NCLEX preparation. See features, pricing, and pass rates side by side.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Product',
            name: 'Haven Institute NCLEX Prep',
            url: SITE_URL,
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Product',
            name: `${competitorName} NCLEX Prep`,
          },
        },
      ],
    },
  };
}

// Structured data component helper
export function jsonLd(schema: Record<string, unknown> | Array<Record<string, unknown>>) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return schemas.map((s, i) => ({
    __html: JSON.stringify(s),
    key: i,
  }));
}
