"use client";

import { useEffect, useRef } from "react";
import { setBackdropOpaque } from "@/lib/backdrop";
import { clamp } from "@/lib/clamp";
import styles from "./BackdropFade.module.css";

// Where the target section's top edge must reach (as a share of the screen
// height, from the top) for the backdrop to be fully black.
const FULL_AT = 0.3;

// Fixed black layer over the orb + character that fades in as the portfolio
// section scrolls into view, and back out when scrolling up.
export default function BackdropFade({ targetId }: { targetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = document.getElementById(targetId);
    if (!el || !target) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = target.getBoundingClientRect().top;
      const o = clamp((vh - top) / (vh * (1 - FULL_AT)), 0, 1);
      el.style.opacity = o.toFixed(3);
      setBackdropOpaque(o >= 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return <div ref={ref} className={styles.fade} aria-hidden="true" />;
}
