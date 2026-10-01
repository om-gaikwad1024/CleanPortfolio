import Image from "next/image";
import type { CSSProperties } from "react";
import { character, orb } from "@/content/orb";
import styles from "./CharacterOverlay.module.css";

const { desktop, mobile } = orb;

// Placement comes from content/orb.ts; the CSS picks desktop or mobile values by media query.
const placement = {
  "--top": desktop.image.top,
  "--left": desktop.image.left,
  "--max-w": desktop.image.maxWidth,
  "--max-h": desktop.image.maxHeight,
  "--top-m": mobile.image.top,
  "--left-m": mobile.image.left,
  "--max-w-m": mobile.image.maxWidth,
  "--max-h-m": mobile.image.maxHeight,
} as CSSProperties;

// Fixed character artwork layered between the orb and the page content.
export default function CharacterOverlay() {
  return (
    <Image
      src={character.src}
      alt={character.alt}
      width={character.width}
      height={character.height}
      // Served as-is: the optimizer's srcset shrinks the intrinsic size, which
      // changes how big the art renders on large screens vs the legacy <img>.
      unoptimized
      preload
      className={styles.overlay}
      style={placement}
    />
  );
}
