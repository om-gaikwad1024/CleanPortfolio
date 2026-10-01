import { Fragment } from "react";
import { hero } from "@/content/hero";
import styles from "./HeroIntro.module.css";

// Opening lines and the "Explore Now" link, top left.
export default function HeroIntro() {
  const { intro, cta } = hero;

  return (
    <div className={styles.intro}>
      <p>
        {intro.lines.map((line, i) => (
          <Fragment key={i}>
            {line.map((seg, j) =>
              typeof seg === "string" ? (
                <Fragment key={j}>{seg}</Fragment>
              ) : (
                <span key={j} lang={seg.lang}>
                  {seg.text}
                </span>
              ),
            )}
            <br />
          </Fragment>
        ))}
        <span className={styles.muted}>{intro.muted}</span>
      </p>
      <a href={cta.href} className={styles.cta}>
        {cta.label}
      </a>
    </div>
  );
}
