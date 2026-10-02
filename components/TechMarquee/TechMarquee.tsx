"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp } from "@/lib/clamp";
import styles from "./TechMarquee.module.css";

type Icon = { title: string; path: string };

type Props = {
  icons: Icon[];
  label: string;
  /** Section whose scroll progress drives the strip. */
  targetRef: RefObject<HTMLElement | null>;
};

// Copies of the set laid end to end, so the strip never runs out mid-scroll.
const COPIES = 4;
// How far the strip travels while the section passes, in whole sets.
const TRAVEL = 1.5;
// How quickly it catches up with the scroll position (per second).
const GLIDE = 8;
// Share of half the screen width over which a logo brightens towards the centre.
const GLOW_REACH = 0.6;

// Scroll-driven strip of tech logos: slides right-to-left as the page scrolls
// down; logos brighten as they pass the middle and fade out at the edges.
export default function TechMarquee({ icons, label, targetRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const target = targetRef.current;
    if (!root || !track || !target) return;
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length < 2) return;

    let pitch = 0;
    let size = 0;
    let setWidth = 0;
    const measure = () => {
      pitch = items[1].offsetLeft - items[0].offsetLeft;
      size = items[0].offsetWidth;
      setWidth = pitch * icons.length;
    };
    measure();

    let raf = 0;
    let last = 0;
    let first = true;
    let current = 0;

    const frame = (t: number) => {
      raf = 0;
      const vh = window.innerHeight;
      const r = target.getBoundingClientRect();
      // 0 as the section enters at the bottom, 1 as it leaves at the top.
      const q = clamp((vh - r.top) / (r.height + vh), 0, 1);
      const goal = -q * setWidth * TRAVEL;

      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      current = first ? goal : current + (goal - current) * (1 - Math.exp(-dt * GLIDE));
      first = false;
      if (Math.abs(goal - current) < 0.25) current = goal;
      track.style.translate = `${current.toFixed(2)}px 0`;

      // Brightness from each logo's distance to the centre (no layout reads).
      const half = root.clientWidth / 2;
      const start = items[0].offsetLeft;
      items.forEach((el, i) => {
        const cx = start + i * pitch + size / 2 + current;
        const g = clamp(1 - Math.abs(cx - half) / (half * GLOW_REACH), 0, 1);
        el.style.setProperty("--glow", (g * g).toFixed(3));
      });

      if (current !== goal) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      kick();
    };

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, [icons.length, targetRef]);

  return (
    <div ref={rootRef} className={styles.marquee}>
      <p className="sr-only">
        {label}: {icons.map((icon) => icon.title).join(", ")}
      </p>
      <div ref={trackRef} className={styles.track} aria-hidden="true">
        {Array.from({ length: COPIES }, (_, c) =>
          icons.map((icon) => (
            <span key={`${c}-${icon.title}`} className={styles.item}>
              <svg viewBox="0 0 24 24" className={styles.icon}>
                <path d={icon.path} />
              </svg>
            </span>
          )),
        )}
      </div>
    </div>
  );
}
