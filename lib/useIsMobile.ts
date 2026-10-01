"use client";

import { useSyncExternalStore } from "react";

// Same breakpoint as the legacy `window.innerWidth < 768` check.
const QUERY = "(max-width: 767.98px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
