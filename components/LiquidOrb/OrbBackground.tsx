"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { character, orb } from "@/content/orb";
import { useBackdropOpaque } from "@/lib/backdrop";
import { useIsMobile } from "@/lib/useIsMobile";
import styles from "./OrbBackground.module.css";

// WebGL only exists in the browser, so the orb is never server-rendered.
const LiquidOrb = dynamic(() => import("./LiquidOrb"), { ssr: false });

// The character image's placement (from content/orb.ts) as plain numbers, so
// the CSS can work out where its neck is and centre the orb there.
const n = (v: string) => parseFloat(v);
const placement = {
  "--img-top": n(orb.desktop.image.top),
  "--img-max-w": n(orb.desktop.image.maxWidth),
  "--img-max-h": n(orb.desktop.image.maxHeight),
  "--img-top-m": n(orb.mobile.image.top),
  "--img-max-w-m": n(orb.mobile.image.maxWidth),
  "--img-max-h-m": n(orb.mobile.image.maxHeight),
  "--img-aspect": character.height / character.width,
  "--img-natural-h": `${character.height}px`,
  "--orb-center": character.orbCenter,
} as CSSProperties;

// Fixed full-screen layer behind the page that hosts the orb.
export default function OrbBackground() {
  const isMobile = useIsMobile();
  // Fully hidden behind the portfolio backdrop: no need to render.
  const covered = useBackdropOpaque();
  const sphere = isMobile ? orb.mobile.sphere : orb.desktop.sphere;

  return (
    <div className={styles.background} style={placement} data-orb="">
      <LiquidOrb {...sphere} paused={covered} />
    </div>
  );
}
