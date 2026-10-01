import { portfolio } from "@/content/portfolio";
import styles from "./PortfolioPlaceholder.module.css";

// Stand-in for the portfolio section; also the "Explore Now" / navbar target.
export default function PortfolioPlaceholder() {
  return (
    <section id="portfolio" className={styles.placeholder}>
      {portfolio.title}
    </section>
  );
}
