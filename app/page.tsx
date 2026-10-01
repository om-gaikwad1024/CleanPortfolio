import About from "@/components/About/About";
import CharacterOverlay from "@/components/CharacterOverlay/CharacterOverlay";
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
      <Hero />
      <About />
      <Portfolio />
    </main>
  );
}
