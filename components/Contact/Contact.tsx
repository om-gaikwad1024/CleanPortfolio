import Image from "next/image";
import type { CSSProperties } from "react";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import DitherReveal from "@/components/DitherReveal/DitherReveal";
import ContactEmail from "./ContactEmail";
import { contact } from "@/content/contact";
import { hero } from "@/content/hero";
import styles from "./Contact.module.css";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

// Closing section: the invitation, signed with the hero signature, then how
// to reach me — beside the dithered "reaching hands".
export default function Contact() {
  const { links, art } = contact;
  const sign = hero.signatureImage;

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.content}>
        <span className={`${styles.reveal} ${styles.pill}`} style={order(0)}>
          {contact.label}
        </span>

        <h2 className={`${styles.reveal} ${styles.heading}`} style={order(1)}>
          {contact.heading}
        </h2>
        <div className={styles.signature}>
          <Image
            src={sign.src}
            alt={hero.signature}
            width={sign.width}
            height={sign.height}
            sizes="(max-width: 768px) 290px, 34vw"
            className={styles.signatureImage}
          />
        </div>

        <div className={`${styles.reveal} ${styles.email}`} style={order(2)}>
          <ContactEmail />
        </div>
        <div className={`${styles.reveal} ${styles.links}`} style={order(3)}>
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
      </div>
    </section>
  );
}
