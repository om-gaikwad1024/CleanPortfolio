import type { CarouselSettings } from "@/components/LiquidCarousel/engine";

export const portfolio = {
  title: "Portfolio",
  hint: "Drag to explore",
};

// Liquid Glass Carousel look and feel.
export const carousel: CarouselSettings = {
  items: Array.from({ length: 10 }, (_, i) => `/port${i + 1}.png`),
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
    ringColor: "#009dff",
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
