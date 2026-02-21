import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "Haven Institute - AI-Powered NCLEX Prep Platform",
  description:
    "Master the NCLEX exam with Haven Institute's AI-powered adaptive learning platform. Personalized study plans, practice questions, and real-time analytics to help nursing students pass on their first attempt.",
  metadataBase: new URL("https://www.havenstudy.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Haven Study",
  },
  openGraph: {
    title: "Haven Institute - AI-Powered NCLEX Prep Platform",
    description:
      "Master the NCLEX exam with Haven Institute's AI-powered adaptive learning platform. Personalized study plans, practice questions, and real-time analytics to help nursing students pass on their first attempt.",
    url: "https://www.havenstudy.com",
    siteName: "Haven Institute",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haven Institute - AI-Powered NCLEX Prep Platform",
    description:
      "Master the NCLEX exam with Haven Institute's AI-powered adaptive learning platform. Personalized study plans, practice questions, and real-time analytics.",
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
