import type { CSSProperties } from "react";
import { hero } from "@/content/hero";
import styles from "./HeroServices.module.css";

// Numbered services list.
export default function HeroServices() {
  const { lead, items } = hero.services;

  return (
    <ol className={styles.services}>
      {items.map((item, i) => (
        <li key={item} className={styles.item} style={{ "--i": i } as CSSProperties}>
          {i === 0 && <span className={styles.muted}>{lead}</span>}
          {item}
        </li>
      ))}
    </ol>
  );
}
