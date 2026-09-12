"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures the browser tab header stays strictly and permanently "FOSS Club SRM"
 * across all client-side navigations and route changes.
 */
export function BrowserTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = "FOSS Club SRM";
  }, [pathname]);

  return null;
}
