import Image from "next/image";
import type { Ref } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import { latest } from "@/content/latest";
import styles from "./LatestProject.module.css";

type Props = {
  /** Root card (positioned and scaled by Experience on wide screens). */
  ref?: Ref<HTMLElement>;
  /** Fill of the "scroll to next section" bar (scaled 0–1 by Experience). */
  fillRef?: Ref<HTMLSpanElement>;
};

// The latest project: image, then tag, title, description, tech stack and
// links — plus a bar showing how much scrolling is left before Experience.
export default function LatestProject({ ref, fillRef }: Props) {
  const { labels } = latest;

  return (
    <article ref={ref} className={styles.card} aria-label={latest.tag}>
      <div className={styles.imageBox}>
        <Image
          src={latest.image.src}
          alt={latest.image.alt}
          width={latest.image.width}
          height={latest.image.height}
          sizes="(max-width: 760px) 90vw, 900px"
          className={styles.image}
        />
      </div>
      <div className={styles.text}>
        <p className={styles.tag}>{latest.tag}</p>
        <h3 className={styles.title}>{latest.title}</h3>
        <p className={styles.desc}>{latest.description}</p>
        <ul className={styles.stack} aria-label={labels.stack}>
          {latest.stack.map((tech) => (
            <li key={tech} className={styles.chip}>
              {tech}
            </li>
          ))}
        </ul>
        <div className={styles.links}>
          {latest.live?.trim() && (
            <ArrowButton href={latest.live} target="_blank" rel="noopener noreferrer">
              {labels.live}
            </ArrowButton>
          )}
          <ArrowButton href={latest.github} variant="outline" target="_blank" rel="noopener noreferrer">
            {labels.github}
          </ArrowButton>
        </div>
        <div className={styles.next} aria-hidden="true">
          <span>{labels.next}</span>
          <span className={styles.bar}>
            <span ref={fillRef} className={styles.fill} />
          </span>
        </div>
      </div>
    </article>
  );
}
