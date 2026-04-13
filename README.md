# Motiif

A runtime motion and design token system for Tailwind CSS v4. Pure CSS, theme-switchable, reduced-motion aware. No JavaScript runtime, no build step for the tokens themselves.

**[Live demo](https://trv-ops-sector9.github.io/motif/)**

---

## What it does

Most design systems treat motion as an afterthought — hardcoded per-component, impossible to change globally. Motif decouples *how* things move from *what* gets animated. A sidebar, a dialog, and a fleet dashboard all share the same duration and easing vocabulary, and that vocabulary can be swapped at runtime with a single DOM attribute change.

### Motion themes

Four named motion personalities, each with its own curve vocabulary:

| Theme | Character | Curves | Use case |
|-------|-----------|--------|----------|
| **Standard** | Neutral ease-out | 3 | Safe default for any product |
| **Dense** | Compressed, minimal transforms | 3 | Data-heavy dashboards |
| **Expressive** | Spring overshoot, bounce on press | 6 | Consumer-facing, playful |
| **Precision** | Fade + blur, no transforms, sub-100ms | 2 | Focus-critical interfaces |

All themes support reduced motion via `@media (prefers-reduced-motion)` and a `data-motion-theme="reduced"` manual override.

### Color themes

Three design theme pairs (light + dark each), varying far more than hue — radius, shadow style, font family, border-width, letter-spacing, and font-weight all change per theme:

| Theme | Mood | Radius | Shadows | Font |
|-------|------|--------|---------|------|
| **Graphite** | Design-tool neutral, Figma/Cursor feel | `0.5rem` | Soft, luminance-driven | Inter |
| **Guchi** | Luxury fashion house | `1.25rem` | Warm diffused | DM Sans |
| **Tactical** | FUI command-and-control | `0.125rem` | None | Quantico |

### Preview app

The preview app demonstrates all tokens across interactive components and full-page application views:

- **Component Gallery** — every shadcn/ui primitive with motion wiring and variant controls
- **Tokens** — live reference of every active duration, curve, and alias. Duration sliders propagate changes across the entire app in real time
- **Fleet Ops** — mission control dashboard with Leaflet map, vehicle detail pages, incident review. Built as a portfolio piece for autonomous vehicle fleet management roles
- **Brand** — product landing page and configurator demonstrating page transitions and theme adaptation

---

## How it works

### Two-layer CSS token architecture

1. **Primitive tokens** — seven duration stops and theme-specific easing curves, bound to `:root` and `[data-motion-theme]` selectors. No hardcoded values in components.

2. **Alias tokens inside `@theme {}`** — Tailwind v4 generates `animate-*` utility classes from these. Each alias references primitives via `var()`, resolving at runtime. Switching `data-motion-theme` rewires every animation simultaneously without recompiling CSS.

### Semantic bridge layer

Components reference intent variables, never theme-specific ones:

```css
--motion-curve-press-release   /* button/card tap feedback */
--motion-curve-navigation      /* tab slide, toast enter */
--motion-curve-expand-in       /* dialog, dropdown open */
--motion-curve-accordion       /* height animation — no spring */
```

The bridge in `index.css` maps these to the active theme's primitives. For Standard, navigation is `ease-out`. For Expressive, it's a spring with ~12% overshoot. Components don't change; the meaning of their curves does.

### Why this matters

A single `data-motion-theme` attribute change hot-swaps durations, easing curves, and keyframe variants across every animated element on the page. A single `data-theme` attribute change swaps the entire visual identity — colors, radius, shadows, typography, spacing. Both are pure CSS. Both are instant. No re-render, no recompile.

---

## Technical notes

**Tailwind v4 individual transforms** — v4 generates `translate` and `scale` as individual CSS properties, not `transform` shorthand. `transition-property: transform` silently fails. Every component uses explicit property lists.

**Expressive spring overshoot** — Spring curves only produce visible overshoot if the animation starts below the rest value. Expressive keyframes bake initial scale (0.80-0.96) into `@keyframes` so the spring has room to shoot past `scale(1)`.

**Accordion height safety** — Height animations use `--radix-accordion-content-height` keyframes. Spring/bounce easing is banned here — height overshoot causes layout glitches.

**Sonner toast overrides** — Sonner hardcodes `transition: all 400ms ease`. The bridge layer uses `!important` on Sonner's CSS variables so toasts respect motion tokens. Ugly but contained.

---

## Run locally

```bash
cd preview
npm install
npm run dev
```

Requires Node 18+. No environment variables. Opens at `http://localhost:5174`.

Token CSS files in `tokens/` have no build step — import directly:

```css
@import "./tokens/theme-standard.css";
@import "./tokens/theme-expressive.css";
```

---

## Stack

| Layer | Technology |
|-------|------------|
| Tokens | Pure CSS custom properties |
| Tailwind | v4 with `@tailwindcss/vite` |
| Primitives | Radix UI |
| Components | shadcn/ui + motion wiring |
| Charts | Recharts |
| Maps | Leaflet + CartoDB tiles |
| Icons | Tabler Icons |
| Build | Vite, React 19 |

---

## Repository

[github.com/trv-ops-sector9/motif](https://github.com/trv-ops-sector9/motif)
