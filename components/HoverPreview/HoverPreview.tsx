"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./HoverPreview.module.css";

type Props = {
  images: (string | undefined)[];
  /** Index being hovered, or null when nothing is. */
  active: number | null;
  /** Image to keep showing while the card fades out. */
  shown: number;
};

// How quickly the card catches up with the pointer (per second).
const FOLLOW = 10;
// Gap between the pointer and the card.
const GAP = 28;

// Floating image card that trails the pointer (inspired by legacy/hover.txt).
// Images slide up or down depending on whether a later or earlier item was
// hovered. Place it inside a positioned container; it stays within its bounds.
export default function HoverPreview({ images, active, shown }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let last = 0;

    const place = () => {
      el.style.translate = `${pos.x.toFixed(1)}px ${pos.y.toFixed(1)}px`;
    };
    const tick = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      const k = 1 - Math.exp(-dt * FOLLOW);
      pos.x += (pos.tx - pos.x) * k;
      pos.y += (pos.ty - pos.y) * k;
      place();
      if (Math.abs(pos.tx - pos.x) < 0.3 && Math.abs(pos.ty - pos.y) < 0.3) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const box = (el.offsetParent as HTMLElement | null) ?? el.parentElement;
      if (!box) return;
      const r = box.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      // Right of the pointer, or left of it near the right edge.
      const x = px + GAP + w > r.width ? px - GAP - w : px + GAP;
      pos.tx = Math.min(Math.max(x, 0), Math.max(r.width - w, 0));
      pos.ty = Math.min(Math.max(py - h / 2, 0), Math.max(r.height - h, 0));
      // Hidden: jump straight to the pointer so it appears where you are.
      if (activeRef.current === null) {
        pos.x = pos.tx;
        pos.y = pos.ty;
        place();
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={active !== null ? `${styles.preview} ${styles.visible}` : styles.preview}
      aria-hidden="true"
    >
      {images.map((src, i) =>
        src ? (
          <div
            key={i}
            className={styles.slide}
            style={{ "--y": i < shown ? "-100%" : i > shown ? "100%" : "0%" } as CSSProperties}
          >
            <Image src={src} alt="" fill sizes="320px" loading="eager" />
          </div>
        ) : null,
      )}
    </div>
  );
}
