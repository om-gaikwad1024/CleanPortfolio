import { hero } from "@/content/hero";
import styles from "./HeroMeta.module.css";

// Year, tick ruler and time, bottom left.
export default function HeroMeta() {
  const { year, time } = hero.meta;

  return (
    <div className={styles.meta}>
      <span>{year}</span>
      <span className={styles.ticks} aria-hidden="true" />
      <span>{time}</span>
    </div>
  );
}
