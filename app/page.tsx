import CharacterOverlay from "@/components/CharacterOverlay/CharacterOverlay";
import OrbBackground from "@/components/LiquidOrb/OrbBackground";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Navbar />
      <OrbBackground />
      <CharacterOverlay />
    </main>
  );
}
