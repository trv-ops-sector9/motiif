# Motif — Ship It

## Context

Motif is a motion token system for Tailwind v4, being prepared as a portfolio piece for a job application (AV startup). The codebase ships 4 motion themes and 6 color theme pairs. **Deadline: 2026-04-12 (2 days).** Branch: `feature/ui-polish` (PR #11 open).

---

## ~~1. Cleanup~~ ✓

## ~~2. Revise Motion Themes~~ ✓

## ~~3. New Color Themes~~ ✓

## ~~4. Commit & PR~~ ✓

## ~~5. Fleet Ops Dashboard~~ ✓

> Merged as PR #10. FleetOpsBlock with stat cards, TanStack table, area chart, alerts feed, SVG fleet map. Shared `lib/motion.ts` extracted.

---

## 6. UI Polish (in progress — PR #11)

> Branch: `feature/ui-polish`. Two commits merged so far (brand identity, page headers, shared font token, root TooltipProvider).

### 6a. Completed

- [x] Sidebar header rebrand — Rajdhani brand font, favicon SVG, subtitle → tooltip
- [x] Page headers for Component Gallery and Tokens pages
- [x] Shared `--font-brand` token, root `<TooltipProvider>`, cleaner theme hook
- [x] **A1: Page transitions in App.tsx** — exit/enter state machine on top-level view switch using `--anim-page-exit` / `--anim-page-enter`, auto-scroll to top
- [x] **A2: Staggered enter animations in FleetOpsBlock** — header fade-in, map/stat cards/chart/alerts/table all cascade with `--anim-slide-up-in` + stagger delays, alert items and table rows individually fade in
- [x] **A3: Fleet second page (Vehicle Detail)** — click table row → page transition to detail view with vehicle stats, battery bar, distance-by-hour bar chart, sensor status grid, event log, vehicle-specific alerts. Back button with reverse transition.
- [x] CSS `.stagger-children` utility added to motion bridge layer

### 6b. Remaining — prioritized

**Group A — Motion (P0)** ✅ Done this session

**Group B — Fleet Ops (P1):**
- [ ] B1: Fleet map redesign — topographic texture, route lines, vehicle heading indicators, heat density
- [ ] B2: Pull card patterns from Marketing workspace page — progress bars, priority queue, deadline countdown, category breakdown
- [ ] B3: Fleet overview density pass — page feels sparse compared to Marketing workspace. Smaller/tighter cards, more data-dense layout, fill the viewport. Use Marketing workspace page as the density benchmark. Overall design polish pass on the Fleet Ops block.

**Group C — Token Page (P1-P2):**
- [ ] C1: Card layout revision — compare to Marketing workspace card density
- [ ] C2: Ease curve clipping — CurvePreview viewBox clips overshoot values (y>1) for expressive theme
- [ ] C3: Content review — archetypes section is flat text grid, needs visual demos

**Group D — Design Identity (P2):**
- [ ] D1: Icons feel stock — all Lucide everywhere. Consider Tabler (already imported for Dashboard), Phosphor, or custom SVG per domain
- [ ] D2: Drive theme: less round corners, bigger titles, tighter tracking
- [ ] D3: Component card alignment — left-align like tokens? Or keep centered?

**Group E — Sidebar (P2-P3):**
- [ ] E1: Left nav vertical spacing — theme controls too dense
- [ ] E2: Title hover area too large — Tooltip trigger spans full header width
- [ ] E3: Accent picker: improve (add hover/press/chart color sync) or remove (partial override looks broken)

**Group F — Structural (P2):**
- [ ] F1: Dashboard block — remove, merge best patterns into Fleet, or rebrand

**Token Editing (P1 — major feature):**
- [x] Tier 1: Duration sliders — interactive range inputs on Tokens page, `setProperty()` on drag, live propagation across entire app, per-token + global reset, clears on theme switch
- [ ] Tier 2 (if time): Draggable curve control points in CurvePreview SVG — drag bezier handles, update `cubic-bezier()` live

### Suggested execution order (remaining)

~~1. F1 — Dashboard → Analytics rebrand~~ ✓
~~2. B2+B3 — Fleet density pass~~ ✓
~~3. Tier 1 token editing (duration sliders)~~ ✓

**Branch: `feature/token-page-polish`** ✓ merged as PR #12
~~4. C1 — Token page card layout revision~~ ✓
~~5. C2 — Ease curve clipping fix (viewBox for overshoot)~~ ✓
~~6. C3 — Archetypes section visual demos~~ skipped (user declined)
~~7. B1 — Fleet map redesign (topographic, route lines, heading indicators)~~ ✓

**Branch: `feature/final-polish`** (in progress)
~~8. Token card spacing overhaul — tighter padding, consistent slider layout, simplified archetypes table, export button repositioned~~ ✓
9. E3 — Accent picker: improve or remove
10. E1 + E2 — Sidebar polish (spacing, tooltip area)
11. D1-D3 — Icons/theme personality (if time)

---

## 7. README & Portfolio Presentation

> The README is the first thing a hiring manager sees on GitHub.

- [ ] Add a hero screenshot or GIF showing theme switching in action
- [ ] Add live demo link (after deploy)
- [ ] Tell the story: what Motif is, why it exists, what it demonstrates (motion tokens, design systems, Tailwind v4, theming architecture)
- [ ] Commit & PR: `feature/readme-polish`

---

## 8. Mobile Spot-Check

> They might open it on their phone. It shouldn't fall apart.

- [ ] Test all views at mobile (375px) and tablet (768px) breakpoints
- [ ] Fix any layout breaks or overflow issues — don't over-engineer, just don't be broken
- [ ] Verify theme switcher and sidebar work on small screens
- [ ] Commit & PR: `feature/responsive-fixes`

---

## 9. Deploy (GitHub Pages)

> Last real step. Everything is polished, now make it live.

- [ ] Configure GitHub Pages deployment from `preview/dist` via GitHub Actions
  - Build: `cd preview && npm run build`
  - Output: `preview/dist`
  - Set `base` in `vite.config.ts` for the GitHub Pages subpath
- [ ] Verify deployed URL loads and theme switching works
- [ ] Add deploy URL to README
- [ ] Commit & PR: `feature/deploy-setup`

---

## 10. Final Cleanup

- [ ] Update `CLAUDE.md` — reflect current state, any new conventions
- [ ] Final `npm run build` and `npm run lint` — zero warnings
- [ ] Commit & PR: `feature/final-cleanup`

---

## Verification (run after each PR)

- `cd preview && npm run build && npm run lint` — must pass clean
- After step 6: re-screenshot all views, compare before/after across 3+ themes
- After step 8: test on mobile viewport
- After step 9: verify deployed URL end-to-end

## Key Files

- Token CSS: `tokens/theme-*.css` (4 files)
- Bridge layer: `preview/src/index.css`
- Color themes: `preview/src/themes/*.css` (12 files: 6 pairs)
- ThemeSwitcher: `preview/src/components/layout/ThemeSwitcher.tsx`
- Blocks: `preview/src/components/blocks/*.tsx`
- Gallery: `preview/src/components/gallery/ComponentGallery.tsx`
- Tokens: `preview/src/components/gallery/TokensView.tsx`
- Sidebar: `preview/src/components/layout/AppSidebar.tsx`
- Motion helpers: `preview/src/lib/motion.ts`
- Package config: `preview/package.json`
- Docs: `CLAUDE.md`, `README.md`
