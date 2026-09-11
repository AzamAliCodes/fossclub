import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { initialEvents } from "@/lib/initialData";
import { EventsJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Events & Hackathons",
  description:
    "Explore upcoming national hackathons, open source workshops, Linux bootcamps, and developer sprints hosted by FOSS Club SRM at SRMIST Kattankulathur.",
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
  openGraph: {
    title: "Events & Hackathons | FOSS Club SRM",
    description:
      "Explore upcoming national hackathons, open source workshops, Linux bootcamps, and developer sprints hosted by FOSS Club SRM at SRMIST Kattankulathur.",
    url: `${siteConfig.url}/events`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "FOSS Club SRM Events and Hackathons",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events & Hackathons | FOSS Club SRM",
    description:
      "Explore upcoming hackathons, open source workshops, and sprints at SRMIST Kattankulathur.",
    images: ["/images/logo.png"],
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EventsJsonLd events={initialEvents} />
      {children}
    </>
  );
}
