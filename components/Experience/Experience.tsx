import ExperienceTimeline from "./ExperienceTimeline";
import { experience } from "@/content/experience";
import styles from "./Experience.module.css";

// Internships, freelancing, hackathons and awards along a ruler timeline.
export default function Experience() {
  return (
    <section id="experience" className={styles.experience}>
      <h2 className="sr-only">{experience.label}</h2>
      <ExperienceTimeline />
    </section>
  );
}
