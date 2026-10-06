// "Latest project", shown at the start of the Experience journey: it glides in
// from the right, holds, then shrinks away left as the timeline arrives.
// PLACEHOLDER copy — replace with your real latest project.

export const latest = {
  tag: "Latest project",
  title: "Your Project Title",
  description:
    "A short description of the project goes here. Talk about what it is, what problem it solves, and the tools or ideas behind it.",
  stack: ["Next.js", "TypeScript", "Three.js"],
  github: "https://github.com/om-gaikwad1024",
  /** Optional: leave it out (or empty) and the "Live site" button is hidden. */
  live: "https://example.com",
  image: { src: "/image.png", width: 900, height: 563, alt: "Latest project preview" },

  labels: {
    live: "Live site",
    github: "GitHub",
    stack: "Tech stack",
    // Under the content: fills while the project is held, full when it moves on.
    next: "Scroll to Experience",
  },
};
