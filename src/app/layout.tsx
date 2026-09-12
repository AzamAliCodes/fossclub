import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParticlesBackground from "@/components/3d/ParticlesBackground";
import FloatingFOSSLogos from "@/components/3d/FloatingFOSSLogos";
import CursorGlow from "@/components/ui/CursorGlow";
import CursorGrid from "@/components/ui/CursorGrid";

import { siteConfig } from "@/lib/siteConfig";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { BrowserTitleSync } from "@/components/layout/BrowserTitleSync";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "FOSS Club SRM",
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "technology",
  alternates: {
    canonical: siteConfig.url,
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
  openGraph: {
    title: "FOSS Club SRM",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Official FOSS United Chapter at SRMIST`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FOSS Club SRM",
    description: siteConfig.description,
    images: ["/images/logo.png"],
    creator: "@fossunited",
  },
  icons: {
    icon: [
      { url: "/images/logo-transparent.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo-transparent.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-black text-[#fafafa] min-h-screen flex flex-col relative antialiased">
        {/* Schema.org Structured Data for Google / Bing Rich Snippets */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />

        {/* Lock Browser Tab Header Title to FOSS Club SRM */}
        <BrowserTitleSync />

        {/* Global Particle Galaxy Starfield & Nebula (with instant 0ms pixel snow) */}
        <ParticlesBackground />

        {/* Global React Bits Green Cursor Grid Matrix (Desktop Only) */}
        <CursorGrid
          color="#22c55e"
          cellSize={64}
          radius={180}
          className="fixed inset-0 pointer-events-none z-0 hidden md:block"
        />

        {/* Global 3D Floating FOSS Logos */}
        <FloatingFOSSLogos />

        {/* Global Cursor Glow with fluid spring physics matching cuicui.day */}
        <CursorGlow />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative z-10">{children}</main>

        {/* Chapter Footer */}
        <Footer forceShow={true} />
      </body>
    </html>
  );
}
