# Motif

A motion token system for Tailwind CSS v4 — CSS-first, theme-switchable, reduced-motion aware. No JavaScript, no configuration, no build step for the tokens themselves.

Live preview app: [preview/](preview/) — switch themes, adjust spacing, and interact with every component in real time.

---

## What it does

Motif solves a problem most design systems quietly ignore: motion is an afterthought, hardcoded per-component, and impossible to change globally without touching every animation declaration.

This system decouples *how* things move from *what* things are animated. A sidebar, a dialog, and a data table cell all share the same underlying duration and easing vocabulary — but that vocabulary can be swapped at runtime with a single attribute change on the root element.

There are four motion themes, each with its own curve vocabulary:

- **Standard** — neutral ease-out, no personality. 3 curves (ease-out, ease-in, ease-in-out). The safe default.
- **Dense** — compressed durations, minimal transforms. 3 curves (snap, ease-in-out, linear). For data-heavy dashboards where motion should be felt, not watched.
- **Expressive** — spring overshoot on enter, bounce on press-release, fast exits. 6 curves including overlay-tuned springs. Feels alive.
- **Precision** — fade + blur focus control, no transforms, sub-100ms. 2 curves. For interfaces where motion must never distract.

Every theme supports reduced motion via both `@media (prefers-reduced-motion)` and a `data-motion-theme="reduced"` override.

Three color theme pairs (light + dark each) run independently on a separate `data-theme` attribute. Each pair varies far more than hue — border-radius, shadow style, font family, border-width, letter-spacing, and font-weight all change per theme to make each feel like a different product:

- **Default** / **Dark Default** — neutral baseline / Vercel-style developer calm
- **Guchi** — luxury fashion. Pillow-soft 1.25rem radius, warm diffused shadows, DM Sans, 0.5px borders, gold accent
- **Tactical** — FUI command-and-control. Tight radius, no shadows, Quantico font, olive drab palette, lime accent

An accent color picker overrides the primary palette at runtime. A spacing slider scales every gap, padding, and margin in the UI proportionally.

The preview app demonstrates all of this across four full-page mock application views: a SaaS dashboard, a settings page, an auth flow, and a marketing landing page. The Tokens page provides a live reference of every active token value and an **Export JSON** button that downloads the complete token set for the current theme combination.

---

## Why this is interesting technically

### CSS custom properties all the way down

The token system is two layers of pure CSS:

1. **Primitive tokens** — seven duration stops and a theme-specific set of named easing curves (2–6 depending on theme), bound to `:root` and `[data-motion-theme="..."]` selectors. Focus control tokens (`--motion-blur-radius`, `--motion-overlay-opacity`) vary per theme. No hardcoded values in components.

2. **Alias tokens inside `@theme {}`** — Tailwind v4 reads these and generates `animate-*` utility classes. Each alias is a complete animation declaration that references primitives via `var()`, not hardcoded values. This is the key insight: `@theme` variables resolve at runtime, not at build time, so switching `data-motion-theme` rewires every alias simultaneously without recompiling CSS.

The result is a single DOM attribute change that hot-swaps durations, easing curves, and keyframe variants across every animated element on the page.

### The semantic bridge layer

Components never reference theme-specific variables like `--motion-curve-decelerate-mid`. They reference semantic intent variables:

```css
--motion-curve-press-release   /* button/card tap feedback */
--motion-curve-navigation      /* tab slide, toast enter */
--motion-curve-expand-in       /* dialog, dropdown open */
--motion-curve-accordion       /* height animation — no spring allowed here */
```

The bridge layer in `index.css` maps these to the active theme's primitives. For Standard, `--motion-curve-navigation` is `ease-out`. For Expressive, it's `spring` — a cubic-bezier with ~12% overshoot. Components don't change; the semantic meaning of their curves does.

### Tailwind v4 individual transform properties

Tailwind v4 generates `translate` and `scale` as individual CSS properties, not as `transform` shorthand. A `transition-property: transform` declaration won't catch them. Every interactive component here uses `[transition-property:translate,scale,box-shadow]` explicitly. This is easy to get wrong and hard to debug — tracking it down informed a standing convention in the codebase.

### Expressive keyframes with baked-in scale

Spring easing curves only produce visible overshoot if the animation starts at a value the spring can shoot past. Expressive theme keyframes bake an initial scale (0.80–0.96 depending on archetype) directly into the `@keyframes` declaration. This means the spring timing function has room to overshoot scale(1) on the way to rest. Without it, the spring curve lands at 1.0 anyway and the overshoot is invisible.

### Tabs sliding pill

The active tab indicator is an absolutely-positioned element that slides laterally. Measuring the target tab's position and animating the indicator requires knowing the DOM layout — but React state updates and DOM measurement can race. The solution: `useLayoutEffect` for initial measurement (synchronous, prevents flash on mount), plus `MutationObserver` + `requestAnimationFrame` for subsequent changes (deferred measurement after the DOM settles, prevents stutter).

### Drawer built on Radix Dialog, not Vaul

Most shadcn/ui drawer implementations use Vaul, which drives its slide animation via JavaScript spring physics with hardcoded duration and easing. That means the drawer ignores the motion token system entirely — switching themes changes nothing.

The solution: replace Vaul with Radix Dialog and pure CSS keyframe animations. Eight directional slide keyframes (`slide-left/right/top/bottom-in/out`) are defined per theme with personality-appropriate transforms — Expressive gets spring overshoot via scale, Dense gets raw translate with no opacity fade. The drawer's `side` prop selects the correct animation pair via CSS custom property indirection, and theme switching rewires everything automatically. One fewer JS dependency, 28 KB less gzip, and the drawer now participates in the motion system like every other component.

### Sonner toast overrides

Sonner hardcodes `transition: all 400ms ease` in its own stylesheet. Motion tokens can't override this without `!important`. The bridge layer overrides the specific Sonner CSS variables with `!important` so toasts respect `--motion-duration-normal` and `--motion-curve-navigation` like every other component. It's ugly but contained.

---

## Technical decisions

**Why Tailwind v4?**
The `@theme {}` block is the linchpin. It's the only mechanism that lets CSS custom properties generate utility classes at build time while still resolving at runtime. v3 doesn't have this — you'd need a JavaScript config and lose the runtime switching story.

**Why pure CSS, no token generator?**
Token generators (Style Dictionary, Theo, etc.) add a pipeline step and a transformation layer between what you write and what ships. The audience for these tokens is CSS — there's no benefit to compiling through JSON or YAML. The token files are readable, editable, and portable to any project that can import a CSS file.

**Why four motion themes, not infinite? And why different curve counts?**
Four named personalities cover the real design space: neutral/baseline, dense/productivity, expressive/consumer, precision/focus. More themes without more distinct personalities would be taxonomy for its own sake. The architecture supports additional themes trivially — just add a new CSS file and bridge section. Each theme defines only the curves it needs — Precision has 2 because it doesn't need variety, Expressive has 6 because springs and bounces demand separate overlay-safe variants. A smaller curve vocabulary means tighter consistency, not a lesser theme.

**Why Radix UI?**
Radix handles accessibility and keyboard interaction primitives so the preview components don't need to. More relevantly: Radix exposes CSS custom properties like `--radix-accordion-content-height` that make height animation possible without JS. Without that, the accordion would need a JavaScript height measurement loop.

**Why React 19 + Vite for the preview?**
The preview is a demonstration artifact, not the product. It needed to be fast to build and disposable if the token system outgrows it. Vite's native `@tailwindcss/vite` plugin integrates cleanly with v4. React 19 for the preview means no added complexity from concurrent features — it's mostly static UI with local state.

---

## Run it locally

```bash
cd preview
npm install
npm run dev
```

Requires Node 18+. No environment variables. Opens at `http://localhost:5173`.

The token CSS files in `tokens/` have no build step — import them directly into any project:

```css
/* In your global CSS */
@import "./tokens/theme-standard.css";
@import "./tokens/theme-expressive.css";
/* etc. */
```

---

## Repository

[github.com/trv-ops-sector9/motif](https://github.com/trv-ops-sector9/motif)
