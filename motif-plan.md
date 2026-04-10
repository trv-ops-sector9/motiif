# Motif — Ship It

## Context

Motif is a motion token system for Tailwind v4, being prepared as a portfolio piece for a job application (AV startup). The codebase ships 4 motion themes and 6 color theme pairs. Cleanup, motion revisions, and new color themes are done. What remains: build the standout feature, polish, present, and deploy. **Deadline: 2026-04-12 (3 days).**

---

## ~~1. Cleanup~~ ✓

## ~~2. Revise Motion Themes~~ ✓

## ~~3. New Color Themes~~ ✓

## ~~4. Commit & PR~~ ✓

---

## 5. Fleet Ops Dashboard

> The centerpiece. A hiring manager at an AV company sees fleet ops data and thinks "this person gets our domain." This is a new block alongside the existing ones — MarketingBlock stays.

- [ ] Build `FleetOpsBlock.tsx` (new block, not replacing anything)
  - Top stats row: active vehicles, trips today, avg wait time, fleet utilization %
  - Vehicle status table (TanStack Table): vehicle ID, status badge, location, battery %, current trip, last ping
  - Area chart (Recharts): trips over time, reuse `cssCurve` pattern from DashboardBlock
  - Recent alerts feed: sensor warnings, disengagement events, geofence violations
  - Map visualization showing vehicle locations / coverage zones
  - Reuse patterns from `DashboardBlock.tsx` and existing shadcn/ui components
- [ ] Add to `App.tsx` and sidebar nav ("Fleet Ops")
- [ ] Run `/motion`
- [ ] Verify all 6 color theme pairs render correctly
- [ ] Run `/simplify`
- [ ] Commit & PR: `feature/fleet-ops-dashboard`

### Skill prompts for step 5 (run in this order)

**Step 5.1 → `/motion`**
```
Audit FleetOpsBlock.tsx. Ensure all enter/exit animations, table row
transitions, stat counter changes, and chart renders use Motif motion
tokens (--anim-* variables from index.css). No hardcoded durations or
easings. Flag anything not wired through the token system.
```

**Step 5.2 → `/simplify`**
```
Review FleetOpsBlock.tsx and any files changed in this branch for code
reuse, quality, and efficiency. Check for duplicated patterns with
DashboardBlock.tsx.
```

---

## 6. De-shadcn & UI Polish

> Make it feel like a real product, not a component library demo.
> Pipeline: audit → design direction → build new layout elements → clean up → verify.

### 6a. Audit — find every issue

- [ ] Run `/design-audit`
- [ ] Run `/motion-audit`

### 6b. Design direction

- [ ] Run `/ui-ux-pro-max`

### 6c. Build — new layout elements + structural changes

- [ ] **Sidebar header rebrand** — Add the favicon SVG inline next to the "Motif" title. Change the title font to a geometric/futuristic Google Font (Orbitron or Rajdhani) so it reads as a brand mark, not a label. Remove the subtitle text below the title and move it into a tooltip on hover (use existing Radix tooltip component).
- [ ] Run `/bencium-impact-designer` — propose and build new layout elements (top bar, headers, etc.)
- [ ] Clean up Tokens page — remove unnecessary previews (Archetypes don't need demos)
- [ ] Fix remaining issues from the audit hit list

### 6d. Verify

- [ ] Run `/design-audit` again — confirm fixes
- [ ] Run `/simplify`
- [ ] Commit & PR: `feature/ui-polish`

### Skill prompts for step 6 (run in this order)

**Step 6.1 → `/design-audit`**
```
Run a full visual audit of this preview app. Screenshot every view:
Component Gallery, Tokens, Dashboard, Settings, Auth, Fleet Ops. Test
under Default light, Dark Minimal, and Brutalist themes. Flag issues by
severity (critical/high/medium/low) with exact file paths and line
numbers. Focus on: spacing inconsistencies, typography hierarchy,
alignment, anything that looks like a default shadcn template, color
contrast issues, visual weight imbalance.
```

**Step 6.2 → `/motion-audit`**
```
Audit all CSS and Motion animations in the preview app for performance.
Rank each animation S through F. Flag any layout-triggering properties
in transitions (width, height, top, left), missing will-change hints on
heavy animations, and any jank-prone patterns. Check that no
transition-property uses 'all' or 'transform' (Tailwind v4 uses
individual translate/scale).
```

**Step 6.3 → `/ui-ux-pro-max`**
```
I have a motion token design system preview app (React + Tailwind v4 +
shadcn/ui). It currently feels too much like a default shadcn template.
I need design direction for:
1. A top bar or header area for the Component Gallery page that gives it
   presence and identity — "this is Motif" not "this is another shadcn app"
2. A redesigned header area for the Tokens page — the current title +
   download button layout feels weak
3. General guidance on spacing, elevation, and visual hierarchy to make
   the whole app feel more considered and less generic
The app has 6 color themes — solutions must work across all of them
using CSS custom properties, not hardcoded colors.
```

**Step 6.4 → `/bencium-impact-designer`**
```
I need you to propose and build structural layout changes to this app —
not just color/spacing tweaks. Think new UI elements. Consider:
1. A persistent top bar for the whole app (branding, theme switcher
   relocation, breadcrumbs, or status)
2. A proper hero/header section for the Component Gallery page
3. A redesigned header for the Tokens page (current title + download
   button is weak)
4. Any other layout elements that would make this feel like a shipped
   product instead of a component library starter
Propose the changes first with rationale, then implement. Must work
across 6 color themes using CSS custom properties. Use existing
shadcn/ui components. Wire animations through Motif motion tokens
(--anim-* variables).
```

**Step 6.5 → `/design-audit` (re-audit)**
```
Re-audit the Component Gallery and Tokens pages after the redesign.
Compare against the issues flagged in the previous audit. Check under
Default light, Dark Minimal, Brutalist, and Vapor themes. Flag anything
still off.
```

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
- After step 5: FleetOpsBlock renders, table works, chart animates, all themes look good
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
- Package config: `preview/package.json`
- Docs: `CLAUDE.md`, `README.md`
