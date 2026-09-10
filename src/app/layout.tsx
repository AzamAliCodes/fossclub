import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParticlesBackground from "@/components/3d/ParticlesBackground";
import FloatingFOSSLogos from "@/components/3d/FloatingFOSSLogos";
import CursorGlow from "@/components/ui/CursorGlow";
import CursorGrid from "@/components/ui/CursorGrid";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "FOSS Club SRM",
  description: "Official FOSS United student chapter at SRM Institute of Science and Technology, Kattankulathur. Learn, build, and collaborate with fellow open-source enthusiasts.",
  keywords: ["FOSS Club SRM", "SRMIST", "Open Source", "FOSS United", "Kattankulathur", "Hackathon", "Linux", "Git", "Rust"],
  authors: [{ name: "FOSS Club SRM" }],
  openGraph: {
    title: "FOSS Club SRM",
    description: "Learn, build, and collaborate with fellow open-source enthusiasts. Official FOSS United Chapter.",
    url: "https://fossunited.org/c/srm-ktr",
    siteName: "FOSS Club SRM",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/images/logo-transparent.png",
    apple: "/images/logo-transparent.png",
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
        {/* Global Particle Galaxy Starfield & Nebula (with instant 0ms pixel snow) */}
        <ParticlesBackground />

        {/* Global React Bits Green Cursor Grid Matrix */}
        <CursorGrid
          color="#22c55e"
          cellSize={64}
          radius={180}
          className="fixed inset-0 pointer-events-none z-0"
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
