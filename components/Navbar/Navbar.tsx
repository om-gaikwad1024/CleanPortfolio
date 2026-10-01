import ArrowButton from "@/components/ArrowButton/ArrowButton";
import { nav } from "@/content/nav";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>{nav.logo}</div>
      <ul className={styles.links}>
        {nav.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={styles.link}>
              <span className={styles.number}>{link.number}</span>
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <ArrowButton href={nav.cta.href}>{nav.cta.label}</ArrowButton>
        </li>
      </ul>
    </nav>
  );
}
