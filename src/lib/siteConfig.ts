/**
 * Site configuration and SEO metadata constants for FOSS Club SRM.
 * Automatically resolves canonical domain whether running locally, on Vercel preview, or production.
 */

export function getSiteUrl(): string {
  // 1. Explicitly configured public site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    // In production, ensure dev localhost never leaks into canonical URLs
    if (process.env.NODE_ENV === "production" && (url.includes("localhost") || url.includes("127.0.0.1"))) {
      return "https://fossclubsrm.in";
    }
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  // 2. Canonical production domain (takes priority over vercel.app preview URLs)
  if (process.env.NODE_ENV === "production") {
    return "https://fossclubsrm.in";
  }

  // 3. Fallback for local development
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "FOSS Club SRM KTR | SRMIST Kattankulathur",
  shortName: "FOSS Club SRM KTR",
  fullName: "Free and Open Source Software Club — SRMIST Kattankulathur",
  description:
    "The official Free and Open Source Software (FOSS) Club at SRM Institute of Science and Technology (SRMIST), Kattankulathur (KTR). Empowering developers through open source software, hackathons, Linux workshops, Git sprints, and community projects in Chennai.",
  alternateName: ["FOSS Club SRM Kattankulathur", "FOSS Club SRM KTR"],
  tagline: "Build in Public. Contribute to Free & Open Source Software.",
  url: getSiteUrl(),
  email: "fossclubsrmktr@gmail.com",
  themeColor: "#22c55e",
  backgroundColor: "#000000",
  location: {
    city: "Kattankulathur",
    state: "Tamil Nadu",
    country: "India",
    postalCode: "603203",
    institution: "SRM Institute of Science and Technology",
  },
  social: {
    fossUnited: "https://fossunited.org/c/srm-ktr",
    github: "https://github.com/fossclubsrm",
    instagram: "https://www.instagram.com/fossclubsrm",
    linkedin: "https://linkedin.com/company/foss-club-srm",
    whatsapp: "https://chat.whatsapp.com/Cb9D0dZey1ZCVB0C7gpXUh",
  },
  keywords: [
    "FOSS Club SRM",
    "foss club ktr",
    "foss club srm ktr",
    "foss srm",
    "foss ktr",
    "foss srm ktr",
    "FOSS Club SRM KTR",
    "FOSS Club Kattankulathur",
    "SRM KTR FOSS",
    "open source club srm",
    "FOSS Club SRMIST",
    "FOSS United SRM",
    "srmist kattankulathur",
    "SRM Open Source Club",
    "Open Source Software India",
    "SRMIST Hackathons",
    "FOSS Hack SRM",
    "Linux Workshops SRM",
    "Kattankulathur Developer Community",
    "Git GitHub Sprints",
    "SRM Tech Clubs",
    "FOSS United Chapter Chennai",
    "Student Developer Community",
    "FOSS SRM recruitments",
    "Rust Linux Web Development",
  ],
  authors: [
    {
      name: "FOSS Club SRM Core Team",
      url: "https://fossunited.org/c/srm-ktr",
    },
  ],
  creator: "FOSS Club SRM",
  publisher: "FOSS Club SRM & FOSS United",
};

export type SiteConfig = typeof siteConfig;
