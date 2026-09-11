import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Join the Club | Recruitments & Waitlist",
  description:
    "Join FOSS Club SRM at SRMIST Kattankulathur. Apply for Technical, Creative, and Corporate roles or sign up for notifications on upcoming recruitment seasons.",
  alternates: {
    canonical: `${siteConfig.url}/recruitments`,
  },
  openGraph: {
    title: "Join FOSS Club SRM | Recruitments",
    description:
      "Apply for Technical, Creative, and Corporate roles or join our waitlist for upcoming seasons at SRMIST Kattankulathur.",
    url: `${siteConfig.url}/recruitments`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Join FOSS Club SRM",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join FOSS Club SRM | Recruitments",
    description:
      "Apply for Technical, Creative, and Corporate roles at SRMIST Kattankulathur.",
    images: ["/images/logo.png"],
  },
};

export default function RecruitmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
