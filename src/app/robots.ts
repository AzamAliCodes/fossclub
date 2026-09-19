import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  // Always use canonical production domain https://fossclubsrm.in for search engines
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
          ? process.env.NEXT_PUBLIC_SITE_URL
          : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
      : (siteConfig.url.includes("localhost") || siteConfig.url.includes("vercel.app")
          ? "https://fossclubsrm.in"
          : siteConfig.url);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cms",
          "/cms/*",
          "/api",
          "/api/*",
          "/_next/*",
        ],
      },
      // AI Search & LLM Engine Crawlers (ChatGPT Search, Perplexity, Claude, Gemini, Apple Intelligence)
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
        ],
        allow: [
          "/",
          "/events",
          "/team",
          "/recruitments",
          "/llms.txt",
          "/agent.txt",
          "/agents.txt",
        ],
        disallow: [
          "/cms",
          "/cms/*",
          "/api",
          "/api/*",
          "/_next/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
