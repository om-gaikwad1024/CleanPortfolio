"use client";

import { useEffect, useState } from "react";
import { about } from "@/content/about";
import styles from "./OrbNudge.module.css";

// Handwritten note pointing at the orb. When someone actually grabs the orb it
// answers "told you." and then bows out for good.
export default function OrbNudge({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"ask" | "done" | "gone">("ask");

  // Any press on the orb canvas counts as taking the hint.
  useEffect(() => {
    if (phase !== "ask") return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-orb]")) setPhase("done");
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setPhase("gone"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  const cls = [
    styles.nudge,
    visible && phase !== "gone" && styles.visible,
    phase === "done" && styles.done,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} aria-hidden="true">
      <svg className={styles.arrow} viewBox="0 0 120 80" fill="none">
        <path d="M112 70 C 92 66, 58 58, 38 30 C 32 22, 28 14, 26 6" />
        <path d="M14 16 L26 4 L34 19" />
      </svg>
      <span className={styles.text}>{phase === "ask" ? about.nudge.text : about.nudge.done}</span>
    </div>
  );
}
