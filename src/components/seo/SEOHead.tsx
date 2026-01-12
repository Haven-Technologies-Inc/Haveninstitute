import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogType?: 'website' | 'article' | 'product' | 'course';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const BASE_URL = 'https://www.havenstudy.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Haven Institute';

const DEFAULT_KEYWORDS = [
  'NCLEX prep',
  'NCLEX-RN',
  'NCLEX-PN',
  'nursing exam preparation',
  'NCLEX practice questions',
  'NCLEX study guide',
  'nursing board exam',
  'CAT exam prep',
  'nursing student resources',
  'pass NCLEX first time',
  'NCLEX review course',
  'AI nursing tutor',
  'adaptive learning nursing',
  'NCLEX question bank',
  'nursing test prep'
];

export function SEOHead({
  title,
  description = 'Haven Institute - The #1 AI-Powered NCLEX Prep Platform. Pass your NCLEX-RN or NCLEX-PN exam on the first attempt with our adaptive learning technology, 10,000+ practice questions, and personalized study plans. Trusted by 50,000+ nursing students.',
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = 'Haven Institute NCLEX Prep Platform',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
  author = 'Haven Institute',
  publishedTime,
  modifiedTime
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Haven Institute - NCLEX Prep` 
    : 'Haven Institute - #1 AI-Powered NCLEX Prep Platform | Pass Your Nursing Exam';
  
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));
    updateMeta('author', author);
    updateMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:image:alt', ogImageAlt, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('og:site_name', SITE_NAME, true);
    updateMeta('og:locale', 'en_US', true);

    updateMeta('twitter:card', twitterCard);
    updateMeta('twitter:site', '@HavenInstitute');
    updateMeta('twitter:creator', '@HavenInstitute');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    updateMeta('twitter:image:alt', ogImageAlt);

    if (publishedTime) {
      updateMeta('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateMeta('article:modified_time', modifiedTime, true);
    }

    updateLink('canonical', canonicalUrl);

    if (structuredData) {
      let script = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, description, keywords, canonicalUrl, ogType, ogImage, ogImageAlt, twitterCard, noIndex, structuredData, author, publishedTime, modifiedTime]);

  return null;
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Haven Institute',
  alternateName: 'Haven Study',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512
  },
  image: `${BASE_URL}/og-image.png`,
  description: 'Haven Institute is the leading AI-powered NCLEX preparation platform, helping nursing students pass their board exams on the first attempt.',
  foundingDate: '2024',
  sameAs: [
    'https://www.facebook.com/HavenInstitute',
    'https://twitter.com/HavenInstitute',
    'https://www.instagram.com/haveninstitute',
    'https://www.linkedin.com/company/haven-institute',
    'https://www.youtube.com/@HavenInstitute'
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-800-HAVEN-RN',
    contactType: 'customer service',
    email: 'support@havenstudy.com',
    availableLanguage: ['English']
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States'
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'NCLEX Preparation Courses',
    itemListElement: [
      {
        '@type': 'Course',
        name: 'NCLEX-RN Complete Prep Course',
        description: 'Comprehensive NCLEX-RN preparation with AI-powered adaptive learning',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Haven Institute'
        }
      },
      {
        '@type': 'Course',
        name: 'NCLEX-PN Complete Prep Course',
        description: 'Comprehensive NCLEX-PN preparation with AI-powered adaptive learning',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Haven Institute'
        }
      }
    ]
  }
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Haven Institute',
  description: 'AI-Powered NCLEX Prep Platform',
  publisher: {
    '@id': `${BASE_URL}/#organization`
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  },
  inLanguage: 'en-US'
};

export const courseSchema = (courseName: string, courseDescription: string, price: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: courseName,
  description: courseDescription,
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Haven Institute',
    sameAs: BASE_URL
  },
  offers: {
    '@type': 'Offer',
    price: price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2024-01-01'
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: 'PT100H'
  },
  educationalLevel: 'Professional',
  teaches: [
    'NCLEX-RN preparation',
    'Nursing pharmacology',
    'Medical-surgical nursing',
    'Pediatric nursing',
    'Maternal-newborn nursing',
    'Psychiatric nursing',
    'Community health nursing'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2847',
    bestRating: '5',
    worstRating: '1'
  }
});

export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Haven Institute NCLEX Prep',
  description: 'AI-Powered NCLEX Preparation Platform',
  brand: {
    '@type': 'Brand',
    name: 'Haven Institute'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2847',
    bestRating: '5',
    worstRating: '1'
  },
  review: [
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'Sarah M., RN'
      },
      reviewBody: 'Haven Institute helped me pass my NCLEX-RN on the first attempt! The AI tutor explained concepts so clearly, and the practice questions were incredibly similar to the actual exam.'
    },
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'Michael T., RN'
      },
      reviewBody: 'After failing with another prep course, I switched to Haven Institute and passed in 75 questions. The adaptive learning technology really works!'
    },
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: 'Jennifer L., RN'
      },
      reviewBody: 'The CAT simulation exams were exactly like the real NCLEX. I felt completely prepared on test day. Highly recommend Haven Institute to all nursing students!'
    }
  ]
};

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${BASE_URL}${item.url}`
  }))
});

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#localbusiness`,
  name: 'Haven Institute',
  image: `${BASE_URL}/logo.png`,
  telephone: '+1-800-HAVEN-RN',
  email: 'support@havenstudy.com',
  url: BASE_URL,
  priceRange: '$$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59'
  }
};
