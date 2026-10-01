import type { DitherSettings } from "@/components/DitherReveal/DitherReveal";

export const contact = {
  label: "Contact",
  heading: { lead: "Let's build", tail: "something", script: "together." },
  intro:
    "Open to internships, freelance projects and hackathon teams. Got an idea, a role or just want to say hi? My inbox is always open.",

  // PLACEHOLDER — replace with your real email and LinkedIn profile URL.
  email: "hello@example.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle" },
    { label: "GitHub", href: "https://github.com/om-gaikwad1024" },
  ],

  copy: { idle: "Copy", done: "Copied" },
  revealHint: "Hover to reveal",

  // Dithered art on the side; the pointer reveals the real colours.
  art: {
    src: "/contact.png",
    settings: {
      fit: "cover",
      ditherStyle: "bayer8",
      dotSize: 4,
      revealRadius: 150,
      revealSoftness: 55,
      wave: true,
      waveSpeed: 55,
      waveDensity: 25,
    } satisfies DitherSettings,
  },
};
