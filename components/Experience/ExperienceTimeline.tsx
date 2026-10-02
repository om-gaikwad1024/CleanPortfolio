"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import HoverPreview from "@/components/HoverPreview/HoverPreview";
import TimelineEntry from "./TimelineEntry";
import { experience } from "@/content/experience";
import { clamp } from "@/lib/clamp";
import styles from "./ExperienceTimeline.module.css";

// How quickly the track catches up with the scroll position (per second).
// Higher = snappier, lower = floatier. Keeps travel smooth even when the
// page itself scrolls in coarse wheel steps.
const GLIDE = 9;

const pad = (n: number) => String(n).padStart(2, "0");

// Ruler timeline. Wide screens: the section pins and scrolling glides the
// ruler sideways, lighting each entry as it reaches the centre needle.
// Phones: a vertical list, lit as each entry passes the middle of the screen.
export default function ExperienceTimeline() {
  const { entries, label } = experience;
  const n = entries.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const entryRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Hovered entry (for the floating image), and the last one shown.
  const [hovered, setHovered] = useState<number | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    const wideQuery = window.matchMedia("(min-width: 768px)");
    let raf = 0;
    let lastT = 0;
    let current = 0; // eased track offset (px)
    let settled = true;
    let first = true;
    let lastActive = -1;

    const setActive = (active: number) => {
      if (active === lastActive) return;
      lastActive = active;
      if (yearRef.current) yearRef.current.textContent = String(entries[active].year);
      if (countRef.current) countRef.current.textContent = `${pad(active + 1)} / ${pad(n)}`;
    };

    const frame = (t: number) => {
      raf = 0;
      const items = entryRefs.current;

      if (!wideQuery.matches) {
        // Vertical list: light whichever entries are near the screen's middle.
        track.style.translate = "";
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
        settled = true;
        return;
      }

      // Horizontal: where the scroll says the track should be...
      const slot = items[0]?.offsetWidth || 1;
      const run = section.offsetHeight - sticky.offsetHeight;
      const p = run > 0 ? clamp(-section.getBoundingClientRect().top / run, 0, 1) : 0;
      const target = -p * (n - 1) * slot;

      // ...and ease towards it (snap on the very first frame).
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
      lastT = t;
      current = first ? target : current + (target - current) * (1 - Math.exp(-dt * GLIDE));
      first = false;
      if (Math.abs(target - current) < 0.25) current = target;
      track.style.translate = `${current.toFixed(2)}px 0`;

      // Entry i sits on the needle when current = -i * slot.
      const pos = -current / slot;
      items.forEach((li, i) => {
        li?.style.setProperty("--focus", clamp(1 - Math.abs(i - pos), 0, 1).toFixed(3));
      });
      setActive(clamp(Math.round(pos), 0, n - 1));

      settled = current === target;
      if (settled) lastT = 0;
      else raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    wideQuery.addEventListener("change", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      wideQuery.removeEventListener("change", kick);
    };
  }, [entries, n]);

  return (
    <div ref={sectionRef} className={styles.timeline} style={{ "--n": n } as CSSProperties}>
      <div ref={stickyRef} className={styles.sticky}>
        <span ref={yearRef} className={styles.bgYear} aria-hidden="true">
          {entries[0].year}
        </span>
        <p className={styles.header}>
          <span>{label}</span>
          <span ref={countRef} aria-hidden="true">
            01 / {pad(n)}
          </span>
        </p>
        <span className={styles.needle} aria-hidden="true" />
        <HoverPreview images={entries.map((e) => e.image)} active={hovered} shown={shown} />
        <ol ref={trackRef} className={styles.track}>
          {entries.map((entry, i) => (
            <TimelineEntry
              key={`${entry.title}-${entry.date}`}
              ref={(el) => {
                entryRefs.current[i] = el;
              }}
              entry={entry}
              side={i % 2 === 0 ? "above" : "below"}
              yearStart={i === 0 || entries[i - 1].year !== entry.year}
              onHover={(on) => {
                setHovered((h) => (on ? i : h === i ? null : h));
                if (on) setShown(i);
              }}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
