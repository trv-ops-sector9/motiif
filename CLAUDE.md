# Motiif — AI Assistant Context

## What this project is

Motiif is a **motion token system for Tailwind CSS v4**. It provides four named motion themes (Standard, Dense, Expressive, Relaxed) as pure CSS files, plus a live preview app that demonstrates all tokens across interactive components and full-page application mock-ups.

The core deliverable is the `tokens/` directory — four CSS files that can be dropped into any Tailwind v4 project. The `preview/` app is a demonstration artifact built in React 19 + Vite.

**Live:** https://trv-ops-sector9.github.io/motiif/

---

## Project structure

```
tokens/
├── theme-standard.css     # Default. Neutral ease-out, no personality. Sets :root defaults.
├── theme-dense.css        # Compressed durations, minimal transforms
├── theme-expressive.css   # Spring overshoot on enter, bounce on press, fast exits
└── theme-relaxed.css      # Cinematic, longer durations, X-axis drift, no scale

preview/
├── src/
│   ├── index.css                       # Motion bridge layer + color theme imports
│   ├── App.tsx                         # Root layout, lazy-loaded view routing
│   ├── components/
│   │   ├── layout/                     # AppSidebar, ThemeSwitcher
│   │   ├── gallery/                    # ComponentGallery, TokensView
│   │   ├── blocks/                     # FleetOpsBlock, MarketingBlock
│   │   └── ui/                         # shadcn/ui components with motion wiring
│   └── themes/                         # 6 color theme CSS files (OkLCh) — 3 pairs (light + dark)
```

---

## Token architecture

**Layer 1 — Primitive tokens** (`:root` and `[data-motion-theme="..."]`)
- 7 duration stops: `--motion-duration-ultra-fast` through `--motion-duration-ultra-slow`
- Easing curves per theme: Standard (3), Dense (3), Expressive (6), Relaxed (3)
- Focus control tokens: `--motion-blur-radius` (0–8px per theme), `--motion-overlay-opacity` (0.4–0.6)

**Layer 2 — Alias tokens** (`@theme {}` blocks → `animate-*` Tailwind utilities)
- 22 animation archetypes × 4 themes = 88 aliases (20 spatial + overlay-in/out)
- Each alias: `<keyframe-name> <duration-var> <curve-var> both`
- `var()` references resolve at runtime — enables theme switching without recompiling

**22 archetypes:** `fade-in`, `fade-out`, `slide-up-in`, `slide-up-out`, `slide-down-in`, `slide-down-out`, `expand-in`, `expand-out`, `collapse-in`, `collapse-out`, `page-enter`, `page-exit`, `slide-left-in`, `slide-left-out`, `slide-right-in`, `slide-right-out`, `slide-top-in`, `slide-top-out`, `slide-bottom-in`, `slide-bottom-out`, `overlay-in`, `overlay-out`

**Theme switching:** `theme-standard.css` sets `:root` baseline. Others activate via `data-motion-theme` attribute. All keyframes are prefixed per theme to avoid collision. `reduced` mode collapses durations to `1ms` and blur to `0`.

---

## Color theme architecture

**3 theme pairs** (light + dark each) in `preview/src/themes/`. All colors in OkLCh. Activated via `data-theme` attribute. **Graphite Dark is the default on load.**

| Theme | Mood | Radius | Shadows | Font | Border | Tracking |
|-------|------|--------|---------|------|--------|----------|
| **Graphite** | Design-tool neutral, Figma/Cursor feel | `0.5rem` | Soft luminance-driven | Inter | `1px` | `-0.011em` |
| **Guchi** | Luxury fashion house | `1.25rem` | Warm diffused | DM Sans | `0.5px` | `0.02em` |
| **Tactical** | FUI command-and-control | `0.125rem` | None | Quantico | `1px` | `0.02em` |

**Graphite** uses borders that match surface fills — cards feel embedded, elevation comes from luminance steps and shadows rather than strokes. Faint cool-blue undertone (oklch chroma 0.004, hue 260) across all surfaces. Desaturated blue primary accent.

**Design tokens per theme** (beyond color):
- `--radius` — border-radius scale anchor
- `--border-width` — base border width (overrides Tailwind `border` utility)
- `--letter-spacing` — applied on `body`
- `--font-weight-heading` / `--font-weight-body` — applied on `h1-h6` and `body`
- `--shadow-sm/md/lg/xl` — elevation scale, varies from none (Tactical) to warm-tinted (Guchi)
- `--font-sans` / `--font-mono` — font stack per theme

**Border-width override:** `.border`, `.border-t/b/l/r` rules live outside `@layer` in `index.css` to beat Tailwind's hardcoded `1px` utilities. Explicit width classes (`border-2`, `border-0`) are unaffected.

---

## Motion bridge layer (`preview/src/index.css`)

Components use semantic intent variables, never theme-specific ones. The bridge maps:
- `--motion-curve-press-release`, `--motion-curve-navigation`, `--motion-curve-expand-in/out`, `--motion-curve-accordion`
- `--anim-fade-in` through all 13 archetypes (including `--anim-overlay-in/out`) → active theme's alias

---

## Conventions

- **Token files:** `theme-<name>.css`. Keyframes: `<theme>-<archetype>`.
- **Transition-property:** Always list individual properties. Never `all`. Never `transform` (Tailwind v4 uses individual `translate`/`scale` properties — `transition-property: transform` silently fails).
- **`@keyframes` can use `transform`** shorthand. The restriction is on `transition-property` only.
- **Accordion:** Must use height keyframes via `--radix-accordion-content-height`. Never spring/bounce — height overshoot causes layout glitches.
- **Button press:** `button.tsx` owns `active:scale-[0.97]`. Don't add scale at callsites.
- **shadcn/ui:** Edit the `ui/` file directly. Motion wiring lives in the component, not callsite props.
- **`!important`:** Only for overriding third-party hardcoded values (Sonner). Not for general use.
- **No JS token system.** CSS only. The portability of plain CSS is intentional.
- **Theme naming:** The dark counterpart of Default is called "Default Dark", not "Dark Minimal" (internal CSS selector `dark-minimal` is legacy).

---

## Stack

| Layer | Technology |
|---|---|
| Tokens | Pure CSS custom properties |
| Tailwind | v4 with `@tailwindcss/vite` |
| Variants | CVA (class-variance-authority) |
| Primitives | Radix UI |
| Components | shadcn/ui + motion wiring |
| Charts | Recharts |
| Maps | Leaflet + CartoDB tiles |
| Toasts | Sonner |
| Tables | TanStack Table |
| Drag & Drop | dnd-kit |
| Icons | Tabler Icons |
| Fonts | Google Fonts: Inter, DM Sans, JetBrains Mono, Quantico, Rajdhani |
| Build | Vite |
| Framework | React 19 |
| Lint | ESLint (flat config) + TypeScript strict |
