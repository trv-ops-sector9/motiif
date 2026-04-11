# Motif — Ship It

## Context

Motif is a motion token system for Tailwind v4, being prepared as a portfolio piece for a job application (AV startup). The codebase ships 4 motion themes and 6 color theme pairs. **Deadline: 2026-04-12.** Live: https://trv-ops-sector9.github.io/motif/

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

**Branch: `feature/final-polish`** ✓ merged as PR #13 + #14
~~8. Token card spacing overhaul~~ ✓
~~9. E3 — Accent picker: removed (partial override broke consistency)~~ ✓
~~10. E1 + E2 — Sidebar polish (divider, tooltip area, spacing, header alignment)~~ ✓

---

## ~~7. Deploy (GitHub Pages)~~ ✓

> Merged as PR #13 + #14. GH Actions workflow, Vite `base: "/motif/"`, `.npmrc` for peer deps.
> **Live at:** https://trv-ops-sector9.github.io/motif/

---

## ~~8. Bug Fixes & Theme Refinements~~ ✓

### ~~8a. Duration sliders~~ ✓
- Fixed: custom track+thumb styling (range inputs were invisible on dark themes), use React state for override values instead of CSS queries, removed unnecessary `style` MutationObserver

### ~~8b. Accent colors~~ ✓
- Root cause: `--primary` (the most visible color — buttons, active states) was achromatic for Drive/Lux. The `--accent` CSS var was themed but only used for subtle hover backgrounds.
- Fix: gave Drive and Lux themed `--primary` + `--sidebar-primary` colors matching their personality hues:
  - Drive: performance red (oklch hue 25)
  - Lux: warm gold (oklch hue 75)
  - Brutalist: stays monochrome (intentional identity)
  - Vapor: already had colored primary

### ~~8c. Drive theme — automotive identity~~ ✓
- Radius: `0.5rem` → `0.25rem` (sharper, instrument-panel precision)
- Letter-spacing: `-0.01em` → `-0.015em` (tighter tracking)
- Borders: stronger contrast (lightness 0.88 → 0.84 light, 0.22 → 0.25 dark)
- Shadows: crisper/tighter spread, higher opacity — less diffused cloud, more machined edge

### ~~8d. Dark theme background variation~~ ✓
- Drive dark: 0.10 → 0.14 (slate-blue tinted)
- Lux dark: 0.10 → 0.15 (warm chocolate)
- Vapor dark: 0.07 → 0.11 (purple-tinted, bumped chroma)
- Brutalist + Dark Minimal: kept near-black (intentional identity)

---

## ~~9. Icons & Card Alignment~~ ✓

> Branch: `feature/final-polish`. Consolidated icons to Tabler (sidebar, Fleet Ops, Marketing, Tokens, Settings, Auth, ThemeSwitcher). Kept Lucide in ComponentGallery demos and shadcn/ui primitives. Widened gallery to `max-w-5xl`, restructured to 2-column card grid.

---

## ~~10. Per-Theme Spacing~~ ✓

> Removed global spacing slider. Added `--spacing` per theme: Drive/Vapor `0.22rem`, Dark Minimal `0.23rem`, Brutalist `0.24rem`, Default `0.25rem`, Lux `0.3rem`. Fixed `:root` override bug in index.css.

---

## ~~11. P0 — First Impression~~ ✓

> Completed in feature/polish-r1. Drive Dark default, contrast fixes, view transitions, themed scrollbars.

- [x] 11a: Default to Drive Dark + Standard on first load
- [x] 11b: Default dark theme contrast — borders and secondary bg fixed
- [x] 11c: Default card shadows — tightened

---

## ~~12. P1 — Component Gallery Polish~~ ✓

> Completed in feature/polish-r2. Card grid polish, persistent top bar, transition fixes.

- [x] 12a: Variant controls sticky to card bottom
- [x] 12b: Card component demo — 3-layout redesign (media/stat/profile)
- [x] 12c: Badge — single variant + icon toggle controls
- [x] 12d: Gallery header — "Component Gallery" sub-header matching Tokens page
- [x] 12e: Persistent top bar — brand + theme badges, full-width, sidebar toggle
- [x] 12f: Sidebar cleanup — removed brand header, collapse driven from top bar
- [x] 12g: Fix animationend bubbling in all page transition handlers
- [x] 12h: Overlay scrollbars + stable gutter — no reflow on transitions

---

## ~~13. P2 — Token Page~~ ✓

- [x] 13a: Card wrappers stripped. Duration and Curves get subtle `bg-muted/30` well (interactive widget treatment). All other sections: flat div + heading + separator. Separator between motion sub-groups. Badge format updated: `motion-Standard` / `design-Drive-dark`.

---

## ~~14. P3 — Fleet Ops (flagship for AV startup)~~ ✓

> Branch: `feature/polish-r3` merged as PR #17. `feature/polish-r4` in progress.

- [x] 14a: Stat cards + map combined into Mission Control hero row (`lg:grid-cols-[1fr_300px]`)
- [x] 14b: Map SVG redesigned — tactical dark, dot grid, zone glows, marching dashed routes, chevron markers with sonar rings, coordinate watermark.
- [x] 14c: Vehicle mini-panel appears in stat column when vehicle selected on map. Vehicle list below with direct row access.
- [x] 14d: Incident Review page — third Fleet page. KPI row (count-up), stacked bar timeline (6h windows × 5 types), category breakdown, filterable event log with 10 AV-domain incidents. Accessible from "Incidents" button in overview header.
- [x] 14e: Fleet map replaced SVG with Leaflet + CartoDB tiles — real SF coordinates, geofences, route polylines, incident markers.
- [x] 14f: Fleet map theme-aware color system — per-theme tint overlay (Drive=blue, Vapor=purple, Lux=gold etc.), grayscale tile neutralization, React 19 CSS var fix, boosted light theme contrast, enlarged markers for easier clicking.
- [x] 14g: Vehicle panel layout — moved above stat tiles, fixed static height (h-[148px] + overflow-hidden), no layout shift on vehicle select or content difference. Map panned south to show SF label, height increased to h-[352px].

**branch: `feature/polish-r4` (in progress, not yet PR'd)**
- [x] 14h: Fleet map routes redesigned — street-following with right-angle grid turns. Each route distinct: AV-001 Market diagonal NW, AV-002 Mariposa→7th→Market, AV-004 Embarcadero north→Market, AV-007 16th→Mission south→24th east, AV-009 Octavia north→McAllister→Larkin south.
- [x] 14i: Card consistency — Vehicle Detail and Incident Review pages converted from shadcn `<Card>` to `rounded-lg border bg-muted/20` matching Fleet Overview.
- [x] 14j: Selected vehicle sonar ring — pulsing `@keyframes fleet-sonar` outer ring (radius 26) + inner marker radius 9→13. "View Details" button: slide animation replaced with animate-ping border ring.
- [x] 14k: Drive light shadows halved (sm 0.18→0.08). Route lines thicker/more opaque for light mode visibility. Map recentered to [37.772, -122.408].
- [x] 14l: Gallery Tabs default 7, Tooltip delayDuration 100ms.
- [ ] 14m: Selected vehicle sonar ring — user wants revision. Needs new session with full prompt.

---

## 15. P4 — Scope Decisions (need user call)

- [ ] 15a: Cut or keep Dashboard/Auth/Settings blocks
- [ ] 15b: Differentiate Marketing workspace from Fleet Ops
- [ ] 15c: Avatar component — fix styling or remove

---

## 16. Component Design & Motion Audit

> Added to plan — detailed audit of component design and motion token usage across all views.

- [ ] 16a: Full component design audit
- [ ] 16b: Motion token usage review

---

## 17. Mobile Spot-Check

- [ ] Test all views at 375px and 768px breakpoints
- [ ] Fix layout breaks — don't over-engineer, just don't be broken
- [ ] Verify sidebar and theme switcher on small screens

---

## 18. Final Cleanup

- [ ] Update `CLAUDE.md` — reflect current state
- [ ] Final `npm run build` and `npm run lint` — zero warnings

---

## 19. README & Portfolio Presentation

> Skipped earlier — do last.

- [ ] Hero screenshot or GIF showing theme switching
- [ ] Live demo link
- [ ] Tell the story: what Motif is, why it exists, what it demonstrates

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
