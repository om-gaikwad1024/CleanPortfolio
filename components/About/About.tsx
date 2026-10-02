"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { about } from "@/content/about";
import { clamp } from "@/lib/clamp";
import OrbNudge from "@/components/OrbNudge/OrbNudge";
import TechMarquee from "@/components/TechMarquee/TechMarquee";
import styles from "./About.module.css";

// Splits text into words of [char, globalIndex] pairs, plus the total char count.
function splitChars(text: string) {
  let total = 0;
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word].map((ch) => [ch, total++] as const));
  return { words, total };
}

// Pins while scrolling and lights its text one character at a time.
export default function About() {
  const { label, text, lightEnd } = about;
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);

  const { words, total } = splitChars(text);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const content = contentRef.current;
    const textEl = textRef.current;
    if (!section || !sticky || !content || !textEl) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const { top, bottom } = section.getBoundingClientRect();
      const run = section.offsetHeight - sticky.offsetHeight;
      const p = run > 0 ? clamp(-top / run, 0, 1) : 1;
      const lit = Math.min(p / lightEnd, 1) * total;
      textEl.style.setProperty("--lit", lit.toFixed(2));

      // Backdrop fade: ramps in over the screen-height the section enters on,
      // and out over the one it leaves on.
      const vh = window.innerHeight;
      const fade = Math.min(clamp((vh - top) / vh, 0, 1), clamp(bottom / vh, 0, 1));
      sticky.style.setProperty("--fade", fade.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Fade the block in the first time it's 30% visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(content);

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total, lightEnd]);

  return (
    <section id="about" className={styles.about} ref={sectionRef}>
      <div className={styles.sticky} ref={stickyRef}>
        <OrbNudge visible={shown} />
        <TechMarquee icons={about.stack} label={about.stackLabel} targetRef={sectionRef} />
        <div
          className={shown ? `${styles.content} ${styles.shown}` : styles.content}
          ref={contentRef}
        >
          <div className={styles.label}>
            <span className={styles.pill}>{label}</span>
          </div>
          <p className={styles.text} ref={textRef}>
            <span className="sr-only">{text}</span>
            {words.map((chars, w) => (
              <Fragment key={w}>
                <span className={styles.word} aria-hidden="true">
                  {chars.map(([ch, i]) => (
                    <span
                      key={i}
                      className={styles.char}
                      style={{ "--i": i } as CSSProperties}
                    >
                      {ch}
                    </span>
                  ))}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
