import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Core Team & Contributors",
  description:
    `Meet the student leads, technical maintainers, open source contributors, and creatives driving ${siteConfig.shortName} at SRMIST Kattankulathur.`,
  alternates: {
    canonical: `${siteConfig.url}/team`,
  },
  openGraph: {
    title: `Core Team & Contributors | ${siteConfig.shortName}`,
    description:
      `Meet the student leads, technical maintainers, open source contributors, and creatives driving ${siteConfig.shortName} at SRMIST Kattankulathur.`,
    url: `${siteConfig.url}/team`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.shortName} Core Team`,
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: `Core Team & Contributors | ${siteConfig.shortName}`,
    description:
      `Meet the student leads and maintainers powering ${siteConfig.shortName} at SRMIST Kattankulathur.`,
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
