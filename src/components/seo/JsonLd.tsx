import React from "react";
import { siteConfig } from "@/lib/siteConfig";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: siteConfig.name,
    alternateName: [
      siteConfig.fullName,
      "FOSS SRM",
      "FOSS United SRM",
      "SRM FOSS Club",
    ],
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    image: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "SRM Nagar",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.state,
      postalCode: siteConfig.location.postalCode,
      addressCountry: "IN",
    },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: siteConfig.location.institution,
      url: "https://www.srmist.edu.in/",
    },
    memberOf: {
      "@type": "Organization",
      name: "FOSS United Foundation",
      url: "https://fossunited.org",
    },
    sameAs: [
      siteConfig.social.fossUnited,
      siteConfig.social.github,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.fullName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function EventsJsonLd({
  events,
}: {
  events: Array<{
    title: string;
    description: string;
    date: string;
    venue: string;
    posterUrl?: string;
    registrationUrl?: string;
  }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        description: event.description,
        startDate: event.date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kattankulathur",
            addressRegion: "Tamil Nadu",
            addressCountry: "IN",
          },
        },
        image: event.posterUrl || `${siteConfig.url}/images/logo.png`,
        organizer: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        offers: event.registrationUrl
          ? {
              "@type": "Offer",
              url: event.registrationUrl,
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            }
          : undefined,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
