import { clamp } from "./clamp";

export type RGB = [number, number, number];

// Parses #hex, rgb()/rgba() and hsl()/hsla() into 0–1 RGB; returns fallback otherwise.
export function parseColor(input: string | undefined, fallback: RGB): RGB {
  if (!input) return fallback;
  const s = input.trim();

  if (s[0] === "#") {
    const hex = s.slice(1);
    const short = hex.length === 3 || hex.length === 4;
    const long = hex.length === 6 || hex.length === 8;
    if (!short && !long) return fallback;
    const grab = (i: number) =>
      short
        ? parseInt(hex[i] + hex[i], 16)
        : parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    const r = grab(0);
    const g = grab(1);
    const b = grab(2);
    if ([r, g, b].some(Number.isNaN)) return fallback;
    return [r / 255, g / 255, b / 255];
  }

  const rgb = s.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const p = rgb[1].split(/[,/\s]+/).map((v) => parseFloat(v));
    if (p.length >= 3 && p.slice(0, 3).every((v) => !Number.isNaN(v))) {
      return [p[0] / 255, p[1] / 255, p[2] / 255];
    }
  }

  const hsl = s.match(/hsla?\(([^)]+)\)/i);
  if (hsl) {
    const p = hsl[1].split(/[,/\s]+/).map((v) => parseFloat(v));
    if (p.length >= 3 && p.slice(0, 3).every((v) => !Number.isNaN(v))) {
      const h = ((((p[0] % 360) + 360) % 360) / 360) * 6;
      const sat = clamp(p[1] / 100, 0, 1);
      const li = clamp(p[2] / 100, 0, 1);
      const c = (1 - Math.abs(2 * li - 1)) * sat;
      const x = c * (1 - Math.abs((h % 2) - 1));
      const m = li - c / 2;
      const seg = Math.floor(h) % 6;
      const t: RGB =
        seg === 0
          ? [c, x, 0]
          : seg === 1
            ? [x, c, 0]
            : seg === 2
              ? [0, c, x]
              : seg === 3
                ? [0, x, c]
                : seg === 4
                  ? [x, 0, c]
                  : [c, 0, x];
      return [t[0] + m, t[1] + m, t[2] + m];
    }
  }

  return fallback;
}
