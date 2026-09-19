import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Events & Hackathons",
  description:
    `Explore upcoming national hackathons, open source workshops, Linux bootcamps, and developer sprints hosted by ${siteConfig.shortName} at SRMIST Kattankulathur.`,
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
  openGraph: {
    title: `Events & Hackathons | ${siteConfig.shortName}`,
    description:
      `Explore upcoming national hackathons, open source workshops, Linux bootcamps, and developer sprints hosted by ${siteConfig.shortName} at SRMIST Kattankulathur.`,
    url: `${siteConfig.url}/events`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.shortName} Events and Hackathons`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Events & Hackathons | ${siteConfig.shortName}`,
    description:
      `Explore upcoming hackathons, open source workshops, and sprints at SRMIST Kattankulathur.`,
    images: ["/images/logo.png"],
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
