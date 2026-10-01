"use client";

import { useEffect, useState } from "react";
import { contact } from "@/content/contact";
import styles from "./ContactEmail.module.css";

// Big mailto link with a copy-to-clipboard button.
export default function ContactEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
    } catch {
      // Clipboard blocked: the mailto link still works.
    }
  };

  return (
    <div className={styles.row}>
      <a className={styles.email} href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
      <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
        {copied ? contact.copy.done : contact.copy.idle}
      </button>
    </div>
  );
}
