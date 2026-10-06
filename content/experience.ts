// Experience section: scroll-through ruler timeline.
// Entries are listed in chronological order (oldest first).

export type ExperienceCategory = "work" | "freelance" | "hackathon" | "award";

export type ExperienceEntry = {
  category: ExperienceCategory;
  title: string;
  org: string;
  date: string; // as displayed, e.g. "Jul 2024" or "Aug 2024 – Feb 2025"
  year: string; // where it sits on the ruler
  description: string; // keep it to ~30 words so the card fits
  result?: string; // short badge, e.g. "1st of 200+"
  link?: { label: string; href: string };
  /** Shown in a floating card when the entry is hovered (public/expN.png). */
  image?: string;
};

export const experience = {
  label: "Experience",

  // Kanji + English name shown on each card's tag.
  categories: {
    work: { kanji: "仕事", label: "Internship" },
    freelance: { kanji: "独立", label: "Freelance" },
    hackathon: { kanji: "挑戦", label: "Hackathon" },
    award: { kanji: "栄誉", label: "Award" },
  } satisfies Record<ExperienceCategory, { kanji: string; label: string }>,

  entries: [
    {
      image: "/exp1.png",
      category: "hackathon",
      title: "1st Place, Hack for Hire",
      org: "Anvesana",
      date: "",
      year: "",
      description:
        "Beat 200+ participants building a React solution to a live business problem under competition conditions and was the only one offered an internship by the sponsoring startup on the spot.",
      result: "1st of 200+",
    },
    {
      // PLACEHOLDER — replace with your real internship (7 months).
      image: "/exp2.png",
      category: "work",
      title: "Software Engineer",
      org: "Cubic Logics",
      date: "",
      year: "",
      description:
        "Developed responsive front-end components using React for enterprise web applications. Supported back-end development using Spring Boot to create and maintain REST APIs, contributing to scalable and reliable application features.",
      result: "7 months",
    },
    {
      image: "/exp3.png",
      category: "hackathon",
      title: "Top 3 Finalist, HackElite",
      org: "JSSSTU · PES University",
      date: "",
      year: "",
      description:
        "Top 3 of 284 teams (972 participants). Built a 3D platform blending Ayurveda and yoga in under 24 hours: 131 custom Three.js models, a JWT-secured backend and a quiz module.",
      result: "Top 3 of 284 teams",
    },
    {
      // PLACEHOLDER — replace with your third hackathon win.
      image: "/exp4.png",
      category: "hackathon",
      title: "Winner, Hackathon Name",
      org: "Organiser · Location",
      date: "",
      year: "",
      description:
        "Placeholder: the problem, what your team shipped in the time limit and why the judges picked it. Keep it to two or three punchy lines.",
      result: "Winner",
    },
    {
      // PLACEHOLDER — replace with your freelancing details (10+ months).
      image: "/exp5.png",
      category: "freelance",
      title: "Freelance Full-Stack Developer",
      org: "Independent",
      date: "",
      year: "",
      description:
        "Placeholder: the kinds of clients and products you build for, your go-to stack, and a standout result — a launch, a performance win or a returning client.",
      result: "10+ months",
    },
  ] satisfies ExperienceEntry[],
};
