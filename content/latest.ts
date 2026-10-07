// "Latest project", shown at the start of the Experience journey: it glides in
// from the right, holds, then shrinks away left as the timeline arrives.
// PLACEHOLDER copy — replace with your real latest project.

export const latest = {
  tag: "Latest project",
  title: "Load Balancer",
  description:
    "A Windows HTTP/1.1 reverse proxy and load balancer built on Winsock IOCP, featuring five balancing strategies, health checks, sticky sessions, hot reload, and a live MFC dashboard.",
  stack: ["C++20", "Winsock", "IOCP", "MFC", "GoogleTest", "vcpkg", "k6", "AddressSanitizer"],
  github: "https://github.com/om-gaikwad1024/LoadBalancer",
  /** Optional: leave it out (or empty) and the "Live site" button is hidden. */
  live: "",
  // Looping preview video (starts muted; a speaker button toggles sound).
  // Path is case-sensitive once deployed (Vercel runs on Linux): match the file name exactly.
  video: { src: "/LatestProject.mp4", label: "Latest project preview video" },

  labels: {
    live: "Live site",
    github: "GitHub",
    stack: "Tech stack",
    mute: "Mute video",
    unmute: "Unmute video",
    // Under the content: fills while the project is held, full when it moves on.
    next: "Scroll to Experience",
  },
};
