// Projects shown in the portfolio carousel, in carousel order.
// Each image is public/portN.png (landscape, ~1600×1000 recommended).
// DUMMY DATA — replace titles, descriptions, stacks and links with real projects.

export type Project = {
  title: string;
  description: string;
  stack: string[];
  github: string;
  live: string;
  image: string;
};

const GITHUB = "https://github.com/om-gaikwad1024";

export const projects: Project[] = [
  {
    title: "Pulseboard",
    description:
      "A real-time analytics dashboard that streams product metrics over WebSockets, renders thousands of live data points smoothly, and lets teams build shareable views without writing a single query.",
    stack: ["Next.js", "TypeScript", "WebSockets", "PostgreSQL"],
    github: `${GITHUB}/pulseboard`,
    live: "https://example.com",
    image: "/port1.png",
  },
  {
    title: "Kanji Flow",
    description:
      "A spaced-repetition app for learning Japanese kanji, with stroke-order animations, handwriting recognition on canvas, and adaptive review schedules that keep daily sessions short but effective for busy learners.",
    stack: ["React", "Canvas API", "Node.js", "MongoDB"],
    github: `${GITHUB}/kanji-flow`,
    live: "https://example.com",
    image: "/port2.png",
  },
  {
    title: "Orbit CMS",
    description:
      "A headless content platform with a block-based editor, role-based permissions and instant previews, designed so marketing teams can publish landing pages while developers keep full control of components.",
    stack: ["Next.js", "GraphQL", "Prisma", "AWS S3"],
    github: `${GITHUB}/orbit-cms`,
    live: "https://example.com",
    image: "/port3.png",
  },
  {
    title: "Tidepool",
    description:
      "A collaborative budgeting tool for shared households that splits expenses fairly, syncs bank transactions automatically, and turns monthly spending into clear, friendly charts everyone in the home understands.",
    stack: ["React Native", "Firebase", "Plaid", "D3.js"],
    github: `${GITHUB}/tidepool`,
    live: "https://example.com",
    image: "/port4.png",
  },
  {
    title: "Glyph Studio",
    description:
      "A browser-based generative art playground where shaders are edited live, parameters become sliders automatically, and finished pieces export as high-resolution prints or short looping videos for social sharing.",
    stack: ["Three.js", "GLSL", "Vite", "Web Workers"],
    github: `${GITHUB}/glyph-studio`,
    live: "https://example.com",
    image: "/port5.png",
  },
  {
    title: "Courier API",
    description:
      "A resilient notification service that delivers email, SMS and push messages through one API, with retries, templating, delivery analytics and rate limiting built to handle millions of events daily.",
    stack: ["Go", "Redis", "Kafka", "Docker"],
    github: `${GITHUB}/courier-api`,
    live: "https://example.com",
    image: "/port6.png",
  },
  {
    title: "Fieldnotes",
    description:
      "An offline-first note-taking app for researchers that captures photos, audio and location with every entry, syncs when back online, and turns scattered field observations into searchable, tagged collections.",
    stack: ["PWA", "IndexedDB", "React", "Supabase"],
    github: `${GITHUB}/fieldnotes`,
    live: "https://example.com",
    image: "/port7.png",
  },
  {
    title: "Shelf Scout",
    description:
      "A computer-vision inventory assistant that scans store shelves from a phone camera, detects missing or misplaced products, and sends restocking tasks to staff before customers ever notice the gaps.",
    stack: ["Python", "PyTorch", "FastAPI", "React"],
    github: `${GITHUB}/shelf-scout`,
    live: "https://example.com",
    image: "/port8.png",
  },
  {
    title: "Metronome",
    description:
      "A lightweight uptime and performance monitor that checks endpoints from multiple regions, alerts the right person on failure, and publishes a clean public status page with incident history and timelines.",
    stack: ["Node.js", "Cloudflare Workers", "SQLite", "Tailwind"],
    github: `${GITHUB}/metronome`,
    live: "https://example.com",
    image: "/port9.png",
  },
  {
    title: "Wayfare",
    description:
      "A trip-planning app that turns saved places into optimised daily itineraries, estimates travel times between stops, and lets friends vote on plans together before anyone books a single ticket.",
    stack: ["Next.js", "Mapbox", "tRPC", "PostgreSQL"],
    github: `${GITHUB}/wayfare`,
    live: "https://example.com",
    image: "/port10.png",
  },
];
