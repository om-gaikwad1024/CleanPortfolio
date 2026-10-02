import type { CSSProperties } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import ScrollLink from "@/components/SmoothScroll/ScrollLink";
import { nav } from "@/content/nav";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ScrollLink href="#home" className={styles.logo} aria-label={`${nav.logo} — back to top`}>
        {nav.logo}
      </ScrollLink>
      <ul className={styles.links}>
        {nav.links.map((link, i) => (
          <li key={link.href} className={styles.item} style={{ "--i": i } as CSSProperties}>
            <ScrollLink href={link.href} className={styles.link}>
              <span className={styles.number}>{link.number}</span>
              {link.label}
            </ScrollLink>
          </li>
        ))}
        <li className={styles.item} style={{ "--i": nav.links.length } as CSSProperties}>
          <ArrowButton href={nav.cta.href} className={styles.cta}>
            <span className={styles.ctaLabel}>{nav.cta.label}</span>
          </ArrowButton>
        </li>
      </ul>
    </nav>
  );
}
