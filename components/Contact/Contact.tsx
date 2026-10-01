import type { CSSProperties } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import DitherReveal from "@/components/DitherReveal/DitherReveal";
import ContactEmail from "./ContactEmail";
import { contact } from "@/content/contact";
import styles from "./Contact.module.css";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

// Closing section: how to reach me, beside the dithered "reaching hands" art.
export default function Contact() {
  const { heading, links, art } = contact;

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.content}>
        <span className={`${styles.reveal} ${styles.pill}`} style={order(0)}>
          {contact.label}
        </span>
        <h2 className={`${styles.reveal} ${styles.heading}`} style={order(1)}>
          <span className={styles.line}>{heading.lead}</span>
          <span className={styles.line}>
            {heading.tail} <span className={styles.script}>{heading.script}</span>
          </span>
        </h2>
        <p className={`${styles.reveal} ${styles.intro}`} style={order(2)}>
          {contact.intro}
        </p>
        <div className={`${styles.reveal} ${styles.email}`} style={order(3)}>
          <ContactEmail />
        </div>
        <div className={`${styles.reveal} ${styles.links}`} style={order(4)}>
          {links.map((link, i) => (
            <ArrowButton
              key={link.href}
              href={link.href}
              variant={i === 0 ? "solid" : "outline"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </ArrowButton>
          ))}
        </div>
      </div>

      <div className={styles.art}>
        <DitherReveal src={art.src} {...art.settings} />
        <span className={styles.hint} aria-hidden="true">
          {contact.revealHint}
        </span>
      </div>
    </section>
  );
}
