"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import type { CarouselControl } from "@/components/LiquidCarousel/LiquidCarousel";
import ProjectDetails from "@/components/ProjectDetails/ProjectDetails";
import { carousel, carouselMobile, focusLayouts, portfolio } from "@/content/portfolio";
import { projects } from "@/content/projects";
import { clamp } from "@/lib/clamp";
import { useIsMobile } from "@/lib/useIsMobile";
import { useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./Portfolio.module.css";

// Three.js needs the browser, so the carousel is never server-rendered.
const LiquidCarousel = dynamic(
  () => import("@/components/LiquidCarousel/LiquidCarousel"),
  { ssr: false },
);

// Share of each project's scroll step spent resting on it (each side), so a
// card is centred wherever the scroll stops.
const DWELL = 0.18;
const smooth = (t: number) => t * t * (3 - 2 * t);
const pad = (n: number) => String(n).padStart(2, "0");

const n = projects.length;
// Cards are laid out right-to-left (project 1 rightmost) so that scrolling
// down moves them left-to-right — opposite to the Experience timeline —
// while still counting 01 → 10.
const items = [...(carousel.items ?? [])].reverse();
const toProject = (itemIndex: number) => n - 1 - itemIndex;

// Pinned project carousel. Its intro plays (page held) once the section is in
// view; then page scroll travels through every project before moving on.
// Clicking the centred card opens it with the project's details.
export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const controlRef = useRef<CarouselControl | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [play, setPlay] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Last opened project, kept while the panel fades out.
  const [shownIndex, setShownIndex] = useState(0);
  const [closeRequest, setCloseRequest] = useState(0);
  const isMobile = useIsMobile();
  const wide = useMediaQuery("(min-width: 1100px)");

  // Page scroll is held while the intro plays, so it can't be scrolled past.
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const holdingRef = useRef(false);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const releaseHold = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    lenisRef.current?.start();
  };

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    let failsafe = 0;

    // Glide the section to its start, then hold the page until the intro ends.
    const holdForIntro = () => {
      const l = lenisRef.current;
      if (!l) return;
      const bottom = section.getBoundingClientRect().bottom + window.scrollY;
      // Jumping well past this section (e.g. a navbar link)? Don't hijack it.
      if (l.targetScroll > bottom + window.innerHeight * 0.5) return;
      holdingRef.current = true;
      l.scrollTo(section, {
        lock: true,
        force: true,
        onComplete: (ln) => {
          if (holdingRef.current) ln.stop();
        },
      });
      failsafe = window.setTimeout(() => {
        holdingRef.current = false;
        lenisRef.current?.start();
      }, 9000);
    };

    // Render only while any part is visible; close an open card when leaving.
    const visible = new IntersectionObserver(([entry]) => {
      setOnScreen(entry.isIntersecting);
      if (!entry.isIntersecting) setCloseRequest((c) => c + 1);
    });
    // Start the intro once 60% of the pinned screen is in view.
    const mostly = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          mostly.disconnect();
          holdForIntro();
        }
      },
      { threshold: 0.6 },
    );
    visible.observe(section);
    mostly.observe(sticky);

    // Page scroll → which project is centred (with a rest zone on each).
    let raf = 0;
    let lastActive = -1;
    const update = () => {
      raf = 0;
      const run = section.offsetHeight - sticky.offsetHeight;
      const p = run > 0 ? clamp(-section.getBoundingClientRect().top / run, 0, 1) : 0;
      const t = p * (n - 1);
      const i = Math.min(Math.floor(t), Math.max(n - 2, 0));
      const f = t - i;
      const pos = i + smooth(clamp((f - DWELL) / (1 - 2 * DWELL), 0, 1));
      controlRef.current?.driveTo(toProject(pos));

      const active = Math.round(pos);
      if (active !== lastActive && countRef.current) {
        lastActive = active;
        countRef.current.textContent = `${pad(active + 1)} / ${pad(n)}`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      visible.disconnect();
      mostly.disconnect();
      clearTimeout(failsafe);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const onFocusChange = (itemIndex: number | null) => {
    const project = itemIndex === null ? null : toProject(itemIndex);
    setOpenIndex(project);
    if (project !== null) setShownIndex(project);
  };

  const open = openIndex !== null;
  const showChrome = introDone && !open;

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className={styles.portfolio}
      style={{ "--n": n } as CSSProperties}
    >
      <div ref={stickyRef} className={styles.sticky}>
        <h2 className="sr-only">{portfolio.title}</h2>
        <LiquidCarousel
          {...carousel}
          {...(isMobile ? carouselMobile : {})}
          items={items}
          startIndex={toProject(0)}
          interaction={{
            ...carousel.interaction,
            focusLayout: wide ? focusLayouts.side : focusLayouts.stacked,
          }}
          play={play}
          active={onScreen}
          onEntryComplete={() => {
            setIntroDone(true);
            releaseHold();
          }}
          onFocusChange={onFocusChange}
          closeRequest={closeRequest}
          controlRef={controlRef}
        />
        <ProjectDetails
          project={projects[shownIndex] ?? null}
          index={shownIndex}
          total={n}
          open={open}
          onClose={() => setCloseRequest((c) => c + 1)}
        />
        <p className={showChrome ? `${styles.hint} ${styles.shown}` : styles.hint}>
          <span aria-hidden="true">←</span> {portfolio.hint}{" "}
          <span aria-hidden="true">→</span>
        </p>
        <span
          ref={countRef}
          className={showChrome ? `${styles.count} ${styles.shown}` : styles.count}
          aria-hidden="true"
        >
          01 / {pad(n)}
        </span>
      </div>
    </section>
  );
}
