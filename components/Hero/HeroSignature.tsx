import Image from "next/image";
import { hero } from "@/content/hero";
import styles from "./HeroSignature.module.css";

// Handwritten signature that writes itself in (left to right) on load.
export default function HeroSignature() {
  const { src, width, height } = hero.signatureImage;
  return (
    <div className={styles.signature}>
      <Image
        src={src}
        alt={hero.signature}
        width={width}
        height={height}
        sizes="(max-width: 768px) 290px, 34vw"
        preload
        className={styles.image}
      />
    </div>
  );
}
