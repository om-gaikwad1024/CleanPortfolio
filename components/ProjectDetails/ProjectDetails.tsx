"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import { portfolio } from "@/content/portfolio";
import type { Project } from "@/content/projects";
import styles from "./ProjectDetails.module.css";

type Props = {
  project: Project | null;
  index: number;
  total: number;
  open: boolean;
  onClose: () => void;
};

const order = (i: number) => ({ "--i": i }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

// Details for the opened carousel card: title, description, stack and links.
// Only visible (and reachable by keyboard) while a card is open.
export default function ProjectDetails({ project, index, total, open, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labels = portfolio.details;

  // Move focus into the panel once it has appeared, for keyboard/screen-reader users.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(t);
  }, [open, project]);

  return (
    <aside
      className={open ? `${styles.panel} ${styles.open}` : styles.panel}
      aria-hidden={!open}
      inert={!open}
    >
      {project && (
        <>
          <button type="button" className={styles.close} onClick={onClose} aria-label={labels.close}>
            <span aria-hidden="true">×</span>
          </button>
          <p className={`${styles.item} ${styles.count}`} style={order(0)}>
            {pad(index + 1)} / {pad(total)}
          </p>
          <h3 ref={headingRef} tabIndex={-1} className={`${styles.item} ${styles.title}`} style={order(1)}>
            {project.title}
          </h3>
          <p className={`${styles.item} ${styles.description}`} style={order(2)}>
            {project.description}
          </p>
          <ul className={`${styles.item} ${styles.stack}`} style={order(3)} aria-label={labels.stack}>
            {project.stack.map((tech) => (
              <li key={tech} className={styles.chip}>
                {tech}
              </li>
            ))}
          </ul>
          <div className={`${styles.item} ${styles.links}`} style={order(4)}>
            <ArrowButton href={project.live} target="_blank" rel="noopener noreferrer">
              {labels.live}
            </ArrowButton>
            <ArrowButton
              href={project.github}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {labels.github}
            </ArrowButton>
          </div>
        </>
      )}
    </aside>
  );
}
