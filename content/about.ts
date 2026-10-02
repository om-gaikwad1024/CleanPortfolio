import {
  siCplusplus,
  siDocker,
  siFigma,
  siGit,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siThreedotjs,
  siTypescript,
} from "simple-icons";

export const about = {
  label: "About",
  text: "Om Gaikwad (オム) Software Engineer builds across the full stack, from the architecture nobody sees to the interfaces everyone touches, writing clean, considered code that keeps products fast, stable and easy to grow.",
  // Share of the pinned scroll at which the text is fully lit; the rest is a short hold.
  lightEnd: 0.9,
  // Little handwritten note inviting people to play with the orb; it changes
  // once they actually grab it.
  nudge: { text: "psst… it's liquid. drag it.", done: "told you." },

  // Tech-stack logos in the strip along the bottom of the About screen.
  // To add one: import its `si…` icon from "simple-icons" (see simpleicons.org).
  stackLabel: "Tech stack",
  stack: [
    siReact,
    siCplusplus,
    siNextdotjs,
    siTypescript,
    siJavascript,
    siNodedotjs,
    siThreedotjs,
    siPython,
    siPostgresql,
    siMongodb,
    siGit,
    siDocker,
    siFigma,
  ].map(({ title, path }) => ({ title, path })),
};
