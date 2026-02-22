import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.havenstudy.com' },
      { protocol: 'https', hostname: 'api.havenstudy.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  // SEO: Redirect www to non-www (or vice versa) and trailing slash consistency
  trailingSlash: false,
  // SEO: Custom headers for caching and security
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/:path*.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache CSS and JS
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Marketing pages - moderate cache
        source: '/:path(nclex-rn|nclex-pn|features|pricing|about|compare|blog|testimonials|faq|contact)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  // SEO: Redirects for common alternate URLs
  async redirects() {
    return [
      { source: '/register', destination: '/signup', permanent: true },
      { source: '/sign-up', destination: '/signup', permanent: true },
      { source: '/sign-in', destination: '/login', permanent: true },
      { source: '/signin', destination: '/login', permanent: true },
      { source: '/nclex', destination: '/nclex-rn', permanent: false },
      { source: '/nclex-review', destination: '/nclex-rn', permanent: true },
      { source: '/nclex-prep', destination: '/nclex-rn', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/plans', destination: '/pricing', permanent: true },
      { source: '/reviews', destination: '/testimonials', permanent: true },
    ];
  },
};

export default nextConfig;
