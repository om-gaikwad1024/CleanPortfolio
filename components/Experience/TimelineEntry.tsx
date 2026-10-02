import type { CSSProperties, Ref } from "react";
import { experience, type ExperienceEntry } from "@/content/experience";
import styles from "./TimelineEntry.module.css";

type Props = {
  entry: ExperienceEntry;
  /** Card above or below the ruler (alternates on wide screens). */
  side: "above" | "below";
  /** First entry of its year: draws the year marker on the ruler. */
  yearStart: boolean;
  /** Mouse entered (true) or left (false) the card. */
  onHover?: (hovering: boolean) => void;
  ref?: Ref<HTMLLIElement>;
};

// One stop on the timeline: a "+" on the ruler and its card. Brightness comes
// from --focus (0–1), set by ExperienceTimeline as it nears the centre.
export default function TimelineEntry({ entry, side, yearStart, onHover, ref }: Props) {
  const cat = experience.categories[entry.category];

  return (
    <li
      ref={ref}
      className={`${styles.entry} ${side === "above" ? styles.above : styles.below}`}
      style={{ "--focus": 0 } as CSSProperties}
    >
      {yearStart && (
        <span className={styles.year} aria-hidden="true">
          {entry.year}
        </span>
      )}
      <span className={styles.mark} aria-hidden="true" />
      <article
        className={styles.card}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onHover?.(false)}
      >
        <p className={styles.meta}>
          <span className={styles.tag}>
            <span lang="ja">{cat.kanji}</span> {cat.label}
          </span>
          <span>{entry.date}</span>
        </p>
        {/* On hover the title rolls up into a copy of itself. */}
        <h3 className={styles.title}>
          <span className={styles.roll}>
            <span className={styles.rollText}>{entry.title}</span>
            <span className={styles.rollCopy} aria-hidden="true">
              {entry.title}
            </span>
          </span>
        </h3>
        <p className={styles.org}>{entry.org}</p>
        <p className={styles.description}>{entry.description}</p>
        {(entry.result || entry.link) && (
          <p className={styles.footer}>
            {entry.result && <span className={styles.result}>{entry.result}</span>}
            {entry.link && (
              <a className={styles.link} href={entry.link.href} target="_blank" rel="noopener noreferrer">
                {entry.link.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </p>
        )}
      </article>
    </li>
  );
}
