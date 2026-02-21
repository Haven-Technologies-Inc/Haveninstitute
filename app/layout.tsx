import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Haven Institute - AI-Powered NCLEX Prep Platform",
  description:
    "Master the NCLEX exam with Haven Institute's AI-powered adaptive learning platform. Personalized study plans, practice questions, and real-time analytics to help nursing students pass on their first attempt.",
  metadataBase: new URL("https://www.havenstudy.com"),
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
