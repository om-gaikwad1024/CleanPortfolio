"use client";

import { useState, type RefObject } from "react";
import HoverPreview from "@/components/HoverPreview/HoverPreview";
import TimelineEntry from "./TimelineEntry";
import { experience } from "@/content/experience";
import styles from "./ExperienceTimeline.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  trackRef: RefObject<HTMLOListElement | null>;
  entryRefs: RefObject<(HTMLLIElement | null)[]>;
  yearRef: RefObject<HTMLSpanElement | null>;
  countRef: RefObject<HTMLSpanElement | null>;
};

// Ruler timeline: big background year, header + counter, centre needle and the
// track of entries. Movement and lighting are driven by Experience (one scroll
// loop for the whole journey); this only renders, plus the hover image preview.
export default function ExperienceTimeline({ trackRef, entryRefs, yearRef, countRef }: Props) {
  const { entries, label } = experience;
  const n = entries.length;
  // Hovered entry (for the floating image), and the last one shown.
  const [hovered, setHovered] = useState<number | null>(null);
  const [shown, setShown] = useState(0);

  return (
    <>
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
            key={`${entry.title}-${entry.org}`}
            ref={(el) => {
              entryRefs.current[i] = el;
            }}
            entry={entry}
            side={i % 2 === 0 ? "above" : "below"}
            // Year marker only where a year is actually given.
            yearStart={!!entry.year && (i === 0 || entries[i - 1].year !== entry.year)}
            onHover={(on) => {
              setHovered((h) => (on ? i : h === i ? null : h));
              if (on) setShown(i);
            }}
          />
        ))}
      </ol>
    </>
  );
}
