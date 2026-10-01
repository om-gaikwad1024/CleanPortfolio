"use client";

import dynamic from "next/dynamic";
import { orb } from "@/content/orb";
import { useBackdropOpaque } from "@/lib/backdrop";
import { useIsMobile } from "@/lib/useIsMobile";
import styles from "./OrbBackground.module.css";

// WebGL only exists in the browser, so the orb is never server-rendered.
const LiquidOrb = dynamic(() => import("./LiquidOrb"), { ssr: false });

// Fixed full-screen layer behind the page that hosts the orb.
export default function OrbBackground() {
  const isMobile = useIsMobile();
  // Fully hidden behind the portfolio backdrop: no need to render.
  const covered = useBackdropOpaque();
  const sphere = isMobile ? orb.mobile.sphere : orb.desktop.sphere;

  return (
    <div className={styles.background}>
      <LiquidOrb {...sphere} paused={covered} />
    </div>
  );
}
