import ArrowButton from "@/components/ArrowButton/ArrowButton";
import ScrollLink from "@/components/SmoothScroll/ScrollLink";
import { nav } from "@/content/nav";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>{nav.logo}</div>
      <ul className={styles.links}>
        {nav.links.map((link) => (
          <li key={link.href}>
            <ScrollLink href={link.href} className={styles.link}>
              <span className={styles.number}>{link.number}</span>
              {link.label}
            </ScrollLink>
          </li>
        ))}
        <li>
          <ArrowButton href={nav.cta.href} className={styles.cta}>
            <span className={styles.ctaLabel}>{nav.cta.label}</span>
          </ArrowButton>
        </li>
      </ul>
    </nav>
  );
}
