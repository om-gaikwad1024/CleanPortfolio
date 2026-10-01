import { hero } from "@/content/hero";
import styles from "./HeroSignature.module.css";

// Script signature that writes itself in on load.
export default function HeroSignature() {
  return <p className={styles.signature}>{hero.signature}</p>;
}
