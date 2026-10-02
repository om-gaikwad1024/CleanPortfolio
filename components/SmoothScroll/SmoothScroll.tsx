"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Global Lenis instance driving smooth window scrolling. The site is built
// around motion, so it stays smooth even with the OS "reduce motion" setting
// (which would otherwise make every scroll and link jump).
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ respectReducedMotion: false }}>
      {children}
    </ReactLenis>
  );
}
