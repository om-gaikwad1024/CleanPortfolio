"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { nav } from "@/content/nav";
import { whenReady } from "@/lib/loading";
import styles from "./Loader.module.css";

// Never keep visitors waiting longer than this, even if something stalls.
const MAX_WAIT_MS = 10000;

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

const nextFrames = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

// Full-screen cover shown until the heavy WebGL start-up is done. Once it has
// faded out it sets html[data-loaded], which releases the page's load-in animations.
export default function Loader() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const lenis = useLenis();

  // No scrolling underneath the cover.
  useEffect(() => {
    if (!lenis) return;
    if (phase === "gone") lenis.start();
    else lenis.stop();
  }, [lenis, phase]);

  useEffect(() => {
    let cancelled = false;
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS));
    const ready = Promise.all([
      whenReady(["orb", "carousel"]),
      document.fonts.ready,
      pageLoaded(),
    ]);
    Promise.race([ready, timeout])
      .then(nextFrames)
      .then(() => {
        if (!cancelled) setPhase("leaving");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback in case the fade's transitionend never fires (e.g. background tab).
  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("gone"), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  // Cover is fully gone: release the page's load-in animations.
  useEffect(() => {
    if (phase === "gone") document.documentElement.dataset.loaded = "";
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={phase === "leaving" ? `${styles.loader} ${styles.leaving}` : styles.loader}
      data-loader=""
      role="status"
      aria-label="Loading"
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "opacity") setPhase("gone");
      }}
    >
      <span className={styles.logo}>{nav.logo}</span>
      <span className={styles.bar} aria-hidden="true" />
    </div>
  );
}
