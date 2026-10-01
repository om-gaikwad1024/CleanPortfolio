"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { carousel, carouselMobile, portfolio } from "@/content/portfolio";
import { useIsMobile } from "@/lib/useIsMobile";
import styles from "./Portfolio.module.css";

// Three.js needs the browser, so the carousel is never server-rendered.
const LiquidCarousel = dynamic(
  () => import("@/components/LiquidCarousel/LiquidCarousel"),
  { ssr: false },
);

// Full-screen portfolio carousel. Its intro plays once the section is mostly on screen.
export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [play, setPlay] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Render only while any part is visible.
    const visible = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    // Start the intro once 60% of the section is in view.
    const mostly = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          mostly.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    visible.observe(section);
    mostly.observe(section);
    return () => {
      visible.disconnect();
      mostly.disconnect();
    };
  }, []);

  return (
    <section id="portfolio" ref={sectionRef} className={styles.portfolio}>
      <h2 className="sr-only">{portfolio.title}</h2>
      <LiquidCarousel
        {...carousel}
        {...(isMobile ? carouselMobile : {})}
        play={play}
        active={onScreen}
        onEntryComplete={() => setIntroDone(true)}
      />
      <p className={introDone ? `${styles.hint} ${styles.shown}` : styles.hint}>
        <span aria-hidden="true">←</span> {portfolio.hint}{" "}
        <span aria-hidden="true">→</span>
      </p>
    </section>
  );
}
