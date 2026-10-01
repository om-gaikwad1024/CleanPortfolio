@AGENTS.md

# Portfolio (Next.js port of `legacy/index.html`)

## Rules
- Next.js App Router + TypeScript. Deployed on Vercel; `npm run lint` and `npm run build` must pass.
- Styling: plain CSS Modules, one `.module.css` per component. Shared variables/reset only in `app/globals.css`.
- Every visual piece is its own component in `components/<Name>/`.
- Text and settings (nav, hero copy, services, about text, orb config) live in `content/`, never hardcoded in components.
- Orb shader lives in `components/LiquidOrb/shader.ts`. Don't open it unless the task is about the orb.
- `legacy/index.html` is the visual/behaviour reference; the new site must match it. Only read the part relevant to the current phase, never the whole file.
- Work one phase at a time, then stop. Tick the phase below and give a commit message; the user commits manually.
- Keep this file short.

## Phases
- [x] 1. Scaffold the project
- [x] 2. Global styles and fonts
- [ ] 3. Navbar and ArrowButton
- [ ] 4. LiquidOrb (client-only, `touch-action: pan-y` on canvas)
- [ ] 5. Hero
- [ ] 6. About section with the character lighting
- [ ] 7. Portfolio placeholder
- [ ] 8. Lenis smooth scroll (drop `scroll-behavior: smooth`, navbar links scroll via Lenis)
