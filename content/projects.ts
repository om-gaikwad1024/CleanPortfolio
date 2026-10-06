// Projects shown in the portfolio carousel, in carousel order.
// Each image is public/portN.png (landscape, ~1600×1000 recommended).
// DUMMY DATA — replace titles, descriptions, stacks and links with real projects.

export type Project = {
  title: string;
  description: string;
  stack: string[];
  github: string;
  /** Optional: leave it out (or empty) and the "Live site" button is hidden. */
  live?: string;
  image: string;
};

const GITHUB = "https://github.com/om-gaikwad1024";

export const projects: Project[] = [
  {
    title: "MindOS",
    description:
      "A personal operating system that unifies tasks, knowledge, journaling, finances, and goals, with Claude connected through a custom MCP server that reads live data and provides context-aware advice across sessions.",
    stack: ["Next.js 14", "TypeScript", "PostgreSQL", "Prisma", "Claude API", "MCP", "Tailwind CSS", "Recharts", "Vercel"],
    github: `${GITHUB}/pulseboard`,
    image: "/port1.png",
  },
  {
    title: "Community Water Quality Assessor",
    description:
      "A full-stack groundwater monitoring platform that analyzes real water test parameters, predicts contamination spread, and provides instant safety assessments and remediation guidance for groundwater-dependent communities.",
    stack: ["React", "Flask", "XGBoost", "Scikit-learn", "PCA", "SQLite", "Recharts", "React Leaflet"],
    github: `${GITHUB}/kanji-flow`,
    live: "https://example.com",
    image: "/port2.png",
  },
  {
    title: "Anvaya",
    description:
      "A 3D interactive platform making Ayurvedic knowledge and yoga engaging through immersive plant showcases, guided yoga training, interactive quizzes, and a dynamic web experience.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Three.js", "Spline", "JWT"],
    github: `${GITHUB}/orbit-cms`,
    live: "https://example.com",
    image: "/port3.png",
  },
  { 
    title: "Beneficial Ownership Explorer",
    description:
      "A graph-based investigation tool that traces ultimate beneficial ownership across offshore companies, revealing hidden control structures through chains of intermediate entities using ICIJ Offshore Leaks records.",
    stack: ["Next.js", "TypeScript", "Neo4j", "Cytoscape.js", "Dagre", "CognoDB", "Vercel"],
    github: `https://github.com/om-gaikwad1024/beneficial-ownership-explorer`,
    live: "https://beneficial-ownership-explorer.vercel.app/",
    image: "/port4.png",
  },
  {
    title: "EventHive",
    description:
      "A modern mobile event discovery platform that helps users find nearby events, explore locations on an interactive map, and register seamlessly through a polished, community-focused experience.",
    stack: ["React Native", "Expo", "TypeScript", "Firebase", "NativeWind"],
    github: `${GITHUB}/glyph-studio`,
    live: "https://example.com",
    image: "/port5.png",
  },
  {
    title: "Enterprise RAG Intelligence System",
    description:
      "A production-grade enterprise RAG system that processes heterogeneous data, enforces role-based access at the vector layer, and delivers grounded, cited responses with complete retrieval traceability.",
    stack: ["FastAPI", "Python", "Qdrant", "Groq", "Sentence Transformers", "FlagEmbedding", "PyTorch"],
    github: `${GITHUB}/courier-api`,
    live: "https://example.com",
    image: "/port6.png",
  },
  {
    title: "CipherTrust",
    description:
      "A multi-tenant secure data pipeline protecting real-time drone threat data across defense, aviation, and critical infrastructure domains with encrypted streaming, authentication, and concurrent data handling.",
    stack: ["Go", "React", "AES-256-GCM", "JWT", "WebSockets", "Gorilla Mux", "Vite", "Tailwind CSS"],
    github: `${GITHUB}/fieldnotes`,
    live: "https://example.com",
    image: "/port7.png",
  },
  {
    title: "REDGIT",
    description:
      "A Git implementation built from scratch in Go, recreating core version-control functionality including content-addressable storage, branching, merging, and repository management.",
    stack: ["Go"],
    github: `${GITHUB}/shelf-scout`,
    live: "https://example.com",
    image: "/port8.png",
  },
  {
    title: "Movie Recommender System",
    description:
      "A movie discovery and recommendation platform providing details for films across languages, eras, and release stages, with similar-movie recommendations based on the movie currently being explored.",
    stack: ["Flask", "Python", "TMDB API", "Scikit-learn", "NLTK", "Pandas", "NumPy", "BeautifulSoup"],
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
