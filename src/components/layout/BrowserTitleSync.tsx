"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/siteConfig";

/**
 * Ensures the browser tab header reflects the canonical brand name on the home page
 * while allowing subpages to maintain their dedicated route titles.
 */
export function BrowserTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      document.title = siteConfig.name;
    }
  }, [pathname]);

  return null;
}
