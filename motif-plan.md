# Motif — Plan

## Context

Motif is a motion token system for Tailwind v4, prepared as a portfolio piece targeting Waabi (Senior Product Designer, Driverless Ops). Ships 4 motion themes and 3 color theme pairs (Graphite, Guchi, Tactical). **Live:** https://trv-ops-sector9.github.io/motif/

---

## Completed

- [x] Cleanup (dead deps, legacy themes)
- [x] Revise motion themes — Standard, Dense, Expressive, Precision
- [x] Color themes — Default, Dark Default, Drive, Brutalist, Lux, Vapor (original 6 pairs)
- [x] Fleet Ops dashboard — stat cards, chart, alert feed, vehicle table, Leaflet map
- [x] Shared lib/motion.ts
- [x] UI Polish — sidebar rebrand, page headers, page transitions, stagger animations
- [x] Fleet density pass, token page revision, map redesign
- [x] Token editing (duration sliders with live propagation)
- [x] Sidebar polish — accent picker removed, divider added, spacing normalized
- [x] Deploy — GitHub Pages via Actions
- [x] Icons consolidated to Tabler
- [x] ComponentGallery restructured to 2-column card grid
- [x] Per-theme spacing baked into each theme CSS file
- [x] First impression polish, Gallery polish, Token page flat redesign
- [x] Fleet Ops Mission Control — Leaflet map, incident review, vehicle detail, real coords
- [x] Dashboard, Auth, Settings blocks removed — sidebar renamed to "Demos"
- [x] Brand Demo (Volant EV) — landing page, configurator, page transitions
- [x] Fleet Ops — Seattle Metro, route removal, incident card, dot glow/pulse
- [x] Theme overhaul — replaced Brutalist/Vapor/Drive with Guchi + Tactical (PR #20)
- [x] Mode toggle — split button replaced with inline icon toggle (PR #21)
- [x] Graphite theme — new default, Figma/Cursor aesthetic, borderless surfaces (PR #22)
- [x] Default theme removed from switcher
- [x] Fix fleet map dot glow — tint overlay z-index was hiding markers (PR #23)
- [x] Incident button — replaced noisy pulsing button with calm pill badge + chevron
- [x] Header layout — LIVE indicator moved next to title, incidents button isolated right
- [x] README rewritten for portfolio
- [x] CLAUDE.md updated to current state
- [x] Mobile spot-check — sidebar collapse on small screens

---

## Remaining — prioritized

### P0 — Ship blockers

- [ ] **Splash page** — intro screen on first load. Brief hero, what Motif is, 3-4 clickable cards pointing to Fleet Ops / Components / Tokens / Brand. Guides the demo user.
- [ ] **Commit + deploy current uncommitted work** (incident button, header layout changes)

### P1 — Fleet Ops polish (Waabi-relevant)

- [ ] **Event log stagger + refresh fix** — animation on new entries
- [ ] **Vehicle card transition** — animate out/in when selecting a new vehicle
- [ ] **Choose vehicle from list → centers on map**

### P2 — UI polish

- [ ] **Collapsed sidebar controls** — dark/light mode icon in collapsed state, popout dropdown for theme controls
- [ ] **Component design & motion audit** — full audit across all views

### P3 — Brand page polish

- [ ] **Inner page image gallery**
- [ ] **Landing page image strip**
- [ ] **Press incident list card → open incident page**

### P4 — Theme refinements

- [ ] **Graphite dark** — user feels it's still too dark, may need further lightness bump toward true Figma/Cursor canvas values

### P5 — Portfolio (outside this repo)

- [ ] **Update LinkedIn profile**
- [ ] **Rewrite F2 case study**
- [ ] **Add note about 3D video work**
- [ ] **Motion token generator under Experiments (if time)**
- [ ] **Add other 3D work to Experiments**
- [ ] **CV-style message in About**
- [ ] **Work history**

---

## Key Files

- Token CSS: `tokens/theme-*.css` (4 files)
- Bridge layer: `preview/src/index.css`
- Color themes: `preview/src/themes/*.css` (6 files: 3 pairs)
- ThemeSwitcher: `preview/src/components/layout/ThemeSwitcher.tsx`
- Blocks: `preview/src/components/blocks/*.tsx`
- Gallery: `preview/src/components/gallery/ComponentGallery.tsx`
- Tokens: `preview/src/components/gallery/TokensView.tsx`
- Sidebar: `preview/src/components/layout/AppSidebar.tsx`
- Motion helpers: `preview/src/lib/motion.ts`

## Verification

```bash
cd preview && npm run build && npm run lint
```
