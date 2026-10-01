// A line of hero copy: plain strings, or a span with its own language.
export type HeroSegment = string | { text: string; lang: string };

export const hero = {
  intro: {
    lines: [
      ["Before the code,"],
      ["comes the ", { text: "こうきしん", lang: "ja" }],
    ] as HeroSegment[][],
    muted: "Here’s where it started.",
  },
  cta: { label: "Explore Now", href: "#portfolio" },
  services: {
    lead: "01/ ",
    items: ["Development", "Interfaces", "Architecture"],
  },
  meta: { year: "© 2026", time: "23′" },
  // Decorative "+" marks, positioned as a % of the hero.
  plusMarks: [
    { left: "41%", top: "54%" },
    { left: "57%", top: "39%" },
    { left: "72%", top: "54%" },
    { left: "88%", top: "39%" },
  ],
  signature: "Om Gaikwad",
};
