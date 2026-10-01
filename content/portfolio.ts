import type { CarouselSettings, FocusLayout } from "@/components/LiquidCarousel/engine";
import { projects } from "./projects";

export const portfolio = {
  title: "Portfolio",
  hint: "Scroll or drag to explore",
  // Labels for the project details panel shown when a card is opened.
  details: {
    live: "Live site",
    github: "GitHub",
    close: "Close",
    stack: "Tech stack",
  },
};

// Liquid Glass Carousel look and feel. Images come from the project list.
export const carousel: CarouselSettings = {
  items: projects.map((p) => p.image),
  background: "#000000",
  // Cards take each image's own (landscape) shape; height sets the size.
  sizeMode: "image",
  cardHeight: 400,
  gap: 12,
  lens: {
    shape: "circle",
    // Big enough that the centred card's corners stay inside the lens's
    // undistorted core; only the neighbouring cards bend at the rim.
    width: 0.85,
    height: 1.15,
    rotation: 65,
    dispersion: 11,
    ringColor: "#ff3a32",
    ring: 0, // no blue ring / glow on the lens edge
  },
  motion: { sensitivity: 5, glide: 5, snap: true },
  // Intro: cards fly in alternately from the top and the bottom.
  entry: { enabled: true, enterFrom: "alternate" },
  interaction: { wheel: true, drag: true, clickToFocus: true },
};

// Overrides below 768px so a landscape card fits a phone screen.
export const carouselMobile: Partial<CarouselSettings> = {
  cardHeight: 200,
};

// Where an opened card settles. Wide screens (≥1100px): left half, details on
// the right. Narrower: at the top, details underneath. Keep in sync with
// ProjectDetails.module.css.
export const focusLayouts: Record<"side" | "stacked", FocusLayout> = {
  side: { align: "left", scale: 1.15, margin: 40, maxWidth: 0.5, maxHeight: 0.7 },
  stacked: { align: "top", scale: 1.1, margin: 100, maxWidth: 0.9, maxHeight: 0.36 },
};
