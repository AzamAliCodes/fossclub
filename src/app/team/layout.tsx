import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "FOSS Club SRM",
  description:
    "Meet the student leads, technical maintainers, open source contributors, and creatives driving FOSS Club SRM at SRMIST Kattankulathur.",
  alternates: {
    canonical: `${siteConfig.url}/team`,
  },
  openGraph: {
    title: "Core Team & Contributors | FOSS Club SRM",
    description:
      "Meet the student leads, technical maintainers, open source contributors, and creatives driving FOSS Club SRM at SRMIST Kattankulathur.",
    url: `${siteConfig.url}/team`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "FOSS Club SRM Core Team",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Core Team & Contributors | FOSS Club SRM",
    description:
      "Meet the student leads and maintainers powering FOSS Club SRM at SRMIST Kattankulathur.",
    images: ["/images/logo.png"],
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
