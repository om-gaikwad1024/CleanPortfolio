import { Fragment, type CSSProperties } from "react";
import ScrollLink from "@/components/SmoothScroll/ScrollLink";
import { hero } from "@/content/hero";
import styles from "./HeroIntro.module.css";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

// Opening lines and the "Explore Now" link, top left.
export default function HeroIntro() {
  const { intro, cta } = hero;

  return (
    <div className={styles.intro}>
      <p>
        {intro.lines.map((line, i) => (
          <span key={i} className={styles.line} style={order(i)}>
            {line.map((seg, j) =>
              typeof seg === "string" ? (
                <Fragment key={j}>{seg}</Fragment>
              ) : (
                <span key={j} lang={seg.lang}>
                  {seg.text}
                </span>
              ),
            )}
          </span>
        ))}
        <span
          className={`${styles.line} ${styles.muted}`}
          style={order(intro.lines.length)}
        >
          {intro.muted}
        </span>
      </p>
      <ScrollLink href={cta.href} className={styles.cta}>
        {cta.label}
      </ScrollLink>
    </div>
  );
}
