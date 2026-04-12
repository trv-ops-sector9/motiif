# Motiif — Plan

## Context

Motiif is a motion token system for Tailwind v4, prepared as a portfolio piece targeting Waabi (Senior Product Designer, Driverless Ops). Ships 4 motion themes and 3 color theme pairs (Graphite, Guchi, Tactical). **Live:** https://trv-ops-sector9.github.io/motif/

**Deadline: 2026-04-12 (today)**

---

## Completed

- [x] Cleanup (dead deps, legacy themes)
- [x] Revise motion themes — Standard, Dense, Expressive, Precision
- [x] Color themes — 3 pairs (Graphite, Guchi, Tactical)
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
- [x] Incident button — calm pill badge + chevron (PR #24)
- [x] Header layout — LIVE indicator next to title, incidents button right-aligned
- [x] README rewritten for portfolio
- [x] CLAUDE.md updated to current state
- [x] Mobile spot-check — sidebar collapse on small screens
- [x] Splash page — modal overlay with section cards, logo mark (PR #25)
- [x] Rename to Motiif + MotiifMark logo (PR #26)
- [x] Choose vehicle from list → centers on map

---

## Today's focus — in order

### 1. Fleet Ops polish (Waabi-relevant — do first)

- [ ] **Event log stagger + refresh fix** — staggered entry animation on new event feed items
- [ ] **Vehicle card transition** — animate out/in when selecting a new vehicle

### 2. Brand page design pass (weakest view — needs attention)

- [ ] **Brand page revision** — design audit + polish so it holds up next to Fleet Ops. Use ui-ux-pro-max skill.

### 3. Quick audit (if time)

- [ ] **Component design & motion audit** — fast sweep across all views for visual issues

### Skip today

- Collapsed sidebar controls — nice-to-have, not interview-relevant
- Graphite dark lightness — good enough
- Brand inner page gallery, landing strip, incident page link — scope creep
- Portfolio items (LinkedIn, case study, etc.) — outside this repo

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
