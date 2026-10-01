import HeroIntro from "./HeroIntro";
import HeroMeta from "./HeroMeta";
import HeroPlusMarks from "./HeroPlusMarks";
import HeroServices from "./HeroServices";
import HeroSignature from "./HeroSignature";
import styles from "./Hero.module.css";

// Text, marks and signature layered over the orb.
export default function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <HeroIntro />
      <HeroServices />
      <HeroMeta />
      <HeroPlusMarks />
      <HeroSignature />
    </section>
  );
}
