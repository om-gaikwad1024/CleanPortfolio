import type { OrbSettings } from "@/components/LiquidOrb/LiquidOrb";

type ImageSettings = {
  top: string;
  left: string;
  maxWidth: string;
  maxHeight: string;
};

type Breakpoint = { sphere: OrbSettings; image: ImageSettings };

// Orb look and character image placement. Mobile applies below 768px.
export const orb: { desktop: Breakpoint; mobile: Breakpoint } = {
  desktop: {
    sphere: {
      orbStyle: "ember",
      tint: "#ff3a32",
      core: "#ff3a32",
      highlight: "#ffffff",
      speed: 50,
      ripples: 100,
      amplitude: 100,
    },
    image: {
      top: "55%",
      left: "50%",
      maxWidth: "85%",
      maxHeight: "85%",
    },
  },
  mobile: {
    sphere: {
      orbStyle: "ember",
      tint: "#ff3a32",
      core: "#ff3a32",
      highlight: "#ffffff",
      speed: 50,
      ripples: 100,
      amplitude: 60,
    },
    image: {
      top: "48%",
      left: "50%",
      maxWidth: "95%",
      maxHeight: "95%",
    },
  },
};

export const character = {
  src: "/toplayer.png",
  alt: "Character",
  width: 1269,
  height: 1239,
  // Where the orb's centre sits on the character, as a share of the image's
  // height from the top. 0.55 ≈ just above the neck: low enough to frame the
  // shoulders, high enough that the orb's bottom stays hidden behind the body.
  orbCenter: 0.55,
};
