import About from "@/components/About/About";
import BackdropFade from "@/components/BackdropFade/BackdropFade";
import CharacterOverlay from "@/components/CharacterOverlay/CharacterOverlay";
import Contact from "@/components/Contact/Contact";
import Experience from "@/components/Experience/Experience";
import Hero from "@/components/Hero/Hero";
import OrbBackground from "@/components/LiquidOrb/OrbBackground";
import Navbar from "@/components/Navbar/Navbar";
import Portfolio from "@/components/Portfolio/Portfolio";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Navbar />
      <OrbBackground />
      <CharacterOverlay />
      <BackdropFade targetId="portfolio" />
      <Hero />
      <About />
      <Portfolio />
      <Experience />
      <Contact />
    </main>
  );
}
