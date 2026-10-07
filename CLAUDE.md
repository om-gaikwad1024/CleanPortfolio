@AGENTS.md

# Portfolio (Next.js port of `legacy/index.html`)

## Rules
- Next.js App Router + TypeScript. Deployed on Vercel; `npm run lint` and `npm run build` must pass.
- Styling: plain CSS Modules, one `.module.css` per component. Shared variables/reset only in `app/globals.css`.
- Every visual piece is its own component in `components/<Name>/`.
- Text and settings (nav, hero copy, services, about text + tech stack, orb config, projects, carousel, latest project, experience, contact) live in `content/`, never hardcoded in components. Projects: `content/projects.ts` (image N = `public/portN.png`).
- Orb shader lives in `components/LiquidOrb/shader.ts`. Don't open it unless the task is about the orb.
- Carousel engine/shader (`components/LiquidCarousel/engine.ts`, `lens.shader.ts`): don't open unless the task is about the carousel. Source reference: `legacy/carousel.txt`.
- Dither shader (`components/DitherReveal/dither.shader.ts`, from `legacy/dither.txt`): don't open unless the task is about the dither effect.
- `legacy/index.html` is the visual/behaviour reference; the new site must match it. Only read the part relevant to the current phase, never the whole file.
- Work one phase at a time, then stop. Tick the phase below and give a commit message; the user commits manually.
- Keep this file short.

## Phases
- [x] 1. Scaffold the project
- [x] 2. Global styles and fonts
- [x] 3. Navbar and ArrowButton
- [x] 4. LiquidOrb (client-only, `touch-action: pan-y` on canvas)
- [x] 5. Hero
- [x] 6. About section with the character lighting
- [x] 7. Portfolio placeholder
- [x] 8. Lenis smooth scroll (drop `scroll-behavior: smooth`, navbar links scroll via Lenis)
- [x] 9. Navbar without background
- [x] 10. About text at the top of its pinned screen
- [x] 11. Liquid Glass Carousel portfolio (intro plays when in view; wheel scrolls page, drag spins)
- [x] 12. Landscape carousel cards, no lens edge glow, hero load-in micro-animations
- [x] 13. Scroll-linked fade to black into Portfolio
- [x] 14. Project details panel for the opened carousel card (side layout ≥1100px, stacked below)
- [x] 15. Experience: scroll-through ruler timeline
- [x] 16. No scrollbar, page held until the carousel intro ends, smoother timeline
- [x] 17. Contact section with dither reveal art
- [x] 18. Red accent, scroll-driven pinned portfolio (all projects, opposite direction to timeline), full-width intro row, contact art + no footer
- [x] 19. Carousel starts on project 1 (no reverse jerk), Works label, timeline hover image preview, soft contact art edges
- [x] 20. Smooth link scrolling (logo → home), #8a0202 button fill, signature image, orb nudge in About, title-roll fix, drag-aware portfolio scroll + new hint
- [x] 21. Tech-stack logo strip in About (scroll-driven, right-to-left, bright at centre, fades at edges)
- [x] 22. Contact redesign: "Let's build something as a team" signed with the hero signature, no footer row, no bottom gap
- [x] 23. Latest project + Experience in one pinned journey (Experience.tsx drives both): card glides in, holds 1 screen with a "scroll to Experience" bar, shrinks left as the ruler slides in; latest project has stack chips + links
- [x] 24. Latest project video (public/LatestProject.mp4): loops, muted by default, speaker toggle, plays only while on screen
