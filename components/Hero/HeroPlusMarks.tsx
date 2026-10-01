import { hero } from "@/content/hero";
import styles from "./HeroPlusMarks.module.css";

// Decorative "+" crosshairs scattered over the hero.
export default function HeroPlusMarks() {
  return hero.plusMarks.map((pos, i) => (
    <span key={i} className={styles.plus} style={pos} aria-hidden="true" />
  ));
}
