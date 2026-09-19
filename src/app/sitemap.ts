import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  // Always use canonical production domain https://fossclubsrm.in for search engine sitemap
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
          ? process.env.NEXT_PUBLIC_SITE_URL
          : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
      : (siteConfig.url.includes("localhost") || siteConfig.url.includes("vercel.app")
          ? "https://fossclubsrm.in"
          : siteConfig.url);
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recruitments`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
