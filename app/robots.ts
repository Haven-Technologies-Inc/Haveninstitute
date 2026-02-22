import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.havenstudy.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/nclex-rn',
          '/nclex-pn',
          '/features',
          '/pricing',
          '/about',
          '/contact',
          '/blog',
          '/compare',
          '/testimonials',
          '/faq',
          '/signup',
          '/login',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/settings/',
          '/account/',
          '/onboarding',
          '/verify-email',
          '/reset-password',
          '/*.json$',
          '/*?*token=',
          '/*?*session=',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
      // Allow social media crawlers for rich previews
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
