"use client";

import { useMediaQuery } from "./useMediaQuery";

// Same breakpoint as the legacy `window.innerWidth < 768` check.
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767.98px)");
}
