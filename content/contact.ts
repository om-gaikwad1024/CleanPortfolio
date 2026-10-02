import type { DitherSettings } from "@/components/DitherReveal/DitherReveal";

export const contact = {
  label: "Contact",
  // Heading line; the hero's signature image (content/hero.ts) is signed underneath.
  heading: "Let's build something as a team",

  // PLACEHOLDER — replace with your real email and LinkedIn profile URL.
  email: "om.gaikwad1024@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/om-gaikwad1024" },
    { label: "GitHub", href: "https://github.com/om-gaikwad1024" },
  ],

  copy: { idle: "Copy", done: "Copied" },

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
