"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import ExperienceTimeline from "./ExperienceTimeline";
import LatestProject from "@/components/LatestProject/LatestProject";
import { experience } from "@/content/experience";
import { clamp } from "@/lib/clamp";
import styles from "./Experience.module.css";

// One pinned stage for the whole journey, so nothing can scroll away mid-move:
// the latest project glides in from the right, holds, then shrinks away to
// the left while the experience ruler slides in from the right and travels
// entry by entry. Phones: a plain card above a vertical timeline list.

// Journey positions, in screens of scroll from the start of the pin.
const PAUSE_END = 0.2; // black pause after Portfolio
const IN_END = 0.8; // card centred
const OUT_START = 1.8; // held for one screen
const LATEST_END = 2.6; // card gone; ruler has arrived (it slides in meanwhile)

// Latest card (motion from legacy/aa.html).
const IMAGE_W = 560;
const IMAGE_H = 350;
const TEXT_W = 480; // wide enough for a ~3-line description
const TEXT_GAP = 56;
const EASE = 0.15 - (7 / 10) * 0.13; // smoothness 7 of 10
const MAX_SCALE = 2.5; // enlarged as it enters
const MIN_SCALE = 0.1; // shrinks to this as it leaves
const DIM = 0.85; // how dark it gets while shrinking away

// Timeline: how quickly the ruler catches up with the scroll (per second).
const GLIDE = 9;

const pad = (n: number) => String(n).padStart(2, "0");

// -1 = off to the right, 0 = centred, 1 = gone off to the left.
function latestPhase(s: number) {
  if (s <= PAUSE_END) return -1;
  if (s < IN_END) return -1 + (s - PAUSE_END) / (IN_END - PAUSE_END);
  if (s <= OUT_START) return 0;
  return Math.min((s - OUT_START) / (LATEST_END - OUT_START), 1);
}

export default function Experience() {
  const { entries } = experience;
  const n = entries.length;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const entryRefs = useRef<(HTMLLIElement | null)[]>([]);
  const yearRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    const fill = fillRef.current;
    const track = trackRef.current;
    if (!section || !stage || !card || !fill || !track) return;

    const wideQuery = window.matchMedia("(min-width: 768px)");
    let W = 0;
    let cardW = 0;
    let raf = 0;
    let last = 0;
    let first = true;
    let phase = -1; // eased latest-card phase
    let x = 0; // eased ruler offset (px)
    let lastActive = -1;

    const setActive = (active: number) => {
      if (active === lastActive) return;
      lastActive = active;
      if (yearRef.current) yearRef.current.textContent = String(entries[active].year);
      if (countRef.current) countRef.current.textContent = `${pad(active + 1)} / ${pad(n)}`;
    };

    // Fit the latest card to the screen (as in the reference: ≤ 90% width).
    const measure = () => {
      W = stage.clientWidth;
      if (!wideQuery.matches) {
        ["--img-w", "--img-h", "--text-w", "--gap"].forEach((v) => card.style.removeProperty(v));
        card.style.transform = "";
        card.style.filter = "";
        card.style.visibility = "";
        return;
      }
      const f = Math.min(1, (W * 0.9) / (IMAGE_W + TEXT_GAP + TEXT_W));
      card.style.setProperty("--img-w", `${IMAGE_W * f}px`);
      card.style.setProperty("--img-h", `${IMAGE_H * f}px`);
      card.style.setProperty("--text-w", `${TEXT_W * f}px`);
      card.style.setProperty("--gap", `${TEXT_GAP * f}px`);
      cardW = card.offsetWidth;
    };

    const frame = (now: number) => {
      raf = 0;
      const items = entryRefs.current;

      if (!wideQuery.matches) {
        // Phones: vertical list, lit as entries pass the middle of the screen.
        track.style.translate = "";
        stage.style.removeProperty("--chrome");
        const vh = window.innerHeight;
        let active = 0;
        let best = Infinity;
        items.forEach((li, i) => {
          if (!li) return;
          const r = li.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - vh / 2) / (vh * 0.45);
          li.style.setProperty("--focus", clamp(1 - d, 0, 1).toFixed(3));
          if (d < best) [best, active] = [d, i];
        });
        setActive(active);
        return;
      }

      // Where the scroll says everything should be…
      const vh = stage.offsetHeight;
      const slot = items[0]?.offsetWidth || 1;
      const travel = (n - 1) * slot;
      const s = -section.getBoundingClientRect().top / vh;
      const phaseGoal = latestPhase(s);
      const xGoal =
        s < OUT_START
          ? W
          : s < LATEST_END
            ? (1 - (s - OUT_START) / (LATEST_END - OUT_START)) * W
            : -clamp(((s - LATEST_END) * vh) / travel, 0, 1) * travel;

      // …and ease towards it (snap on the very first frame).
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (first) {
        phase = phaseGoal;
        x = xGoal;
        first = false;
      } else {
        phase += (phaseGoal - phase) * (1 - Math.pow(1 - EASE, dt * 60));
        x += (xGoal - x) * (1 - Math.exp(-dt * GLIDE));
      }
      if (Math.abs(phaseGoal - phase) < 0.0005) phase = phaseGoal;
      if (Math.abs(xGoal - x) < 0.25) x = xGoal;

      // Latest card: enlarged and pushed out while on the right, shrinking
      // and dimming as it travels off to the left.
      const distance = -phase * W * 1.15;
      let scale: number;
      let push = 0;
      if (distance > 0) {
        scale = Math.min(MAX_SCALE, 1 + distance / W);
        push = (scale - 1) * cardW * 0.75;
      } else {
        scale = Math.max(MIN_SCALE, 1 + distance / W);
      }
      const left = W / 2 + distance - cardW / 2 + push;
      card.style.transform = `translate3d(${left.toFixed(1)}px, -50%, 0) scale(${scale.toFixed(4)})`;
      card.style.filter =
        scale < 1 ? `brightness(${(1 - ((1 - scale) / (1 - MIN_SCALE)) * DIM).toFixed(3)})` : "none";
      card.style.visibility = Math.abs(phase) > 0.999 ? "hidden" : "visible";
      // Bar under the content: how much of the hold has been scrolled.
      fill.style.scale = `${clamp((s - IN_END) / (OUT_START - IN_END), 0, 1).toFixed(3)} 1`;

      // Ruler: entry i sits on the needle when x = -i * slot.
      track.style.translate = `${x.toFixed(2)}px 0`;
      stage.style.setProperty("--chrome", clamp(1 - x / W, 0, 1).toFixed(3));
      const pos = -x / slot;
      items.forEach((li, i) => {
        li?.style.setProperty("--focus", clamp(1 - Math.abs(i - pos), 0, 1).toFixed(3));
      });
      setActive(clamp(Math.round(pos), 0, n - 1));

      if (phase !== phaseGoal || x !== xGoal) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      kick();
    };

    measure();
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    wideQuery.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      wideQuery.removeEventListener("change", onResize);
    };
  }, [entries, n]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className={styles.journey}
      style={{ "--n": n } as CSSProperties}
    >
      <h2 className="sr-only">{experience.label}</h2>
      <div ref={stageRef} className={styles.stage}>
        <LatestProject ref={cardRef} fillRef={fillRef} />
        <ExperienceTimeline
          trackRef={trackRef}
          entryRefs={entryRefs}
          yearRef={yearRef}
          countRef={countRef}
        />
      </div>
    </section>
  );
}
