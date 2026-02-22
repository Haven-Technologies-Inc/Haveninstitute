import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema, softwareApplicationSchema } from "@/lib/seo";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.havenstudy.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Haven Institute - #1 AI-Powered NCLEX Prep Platform | Pass First Try",
    template: "%s | Haven Institute",
  },
  description:
    "Pass the NCLEX on your first attempt with Haven Institute's AI-powered adaptive learning. 50,000+ practice questions, CAT simulations, AI tutor, and personalized study plans. 95%+ pass rate. Better than UWorld, Archer & Kaplan.",
  keywords: [
    "NCLEX prep",
    "NCLEX review",
    "NCLEX practice questions",
    "NCLEX-RN prep",
    "NCLEX-PN prep",
    "nursing exam prep",
    "NCLEX test bank",
    "NCLEX CAT simulator",
    "AI NCLEX tutor",
    "pass NCLEX first attempt",
    "best NCLEX prep course",
    "NCLEX study guide",
    "adaptive NCLEX prep",
    "NCLEX practice test",
    "nursing licensure exam",
  ],
  manifest: "/manifest.json",
  applicationName: "Haven Institute",
  authors: [{ name: "Haven Institute", url: SITE_URL }],
  creator: "Haven Institute",
  publisher: "Haven Institute",
  category: "Education",
  classification: "Nursing Education",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Haven Study",
  },
  openGraph: {
    title: "Haven Institute - #1 AI-Powered NCLEX Prep Platform",
    description:
      "Pass the NCLEX on your first attempt with AI-powered adaptive learning. 50,000+ questions, CAT simulations, and personalized study plans. 95%+ pass rate.",
    url: SITE_URL,
    siteName: "Haven Institute",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Haven Institute - AI-Powered NCLEX Prep Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haven Institute - #1 AI-Powered NCLEX Prep Platform",
    description:
      "Pass the NCLEX first try with AI-powered prep. 50,000+ questions, CAT simulations, AI tutor. 95%+ pass rate.",
    creator: "@haveninstitute",
    site: "@haveninstitute",
    images: [`${SITE_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "msapplication-TileColor": "#6366f1",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={softwareApplicationSchema()} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
