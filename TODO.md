---
name: Motif portfolio roadmap
description: Prioritized checklist of features and polish for hiring manager review — the single source of truth for what's done and what's next
type: project
---

Motif is being prepared as a portfolio piece for a hiring manager at an autonomous vehicle startup. Every feature should demonstrate design-system thinking, scalable architecture, and professional git workflow (branch per feature, PR with description + test plan).

## Completed
- [x] Simplify motion theme curves — each theme has its own distinct vocabulary
- [x] Sidebar reorganization — collapsible sections, accent picker, spacing slider, theme controls
- [x] Footer with name/email, mailto link, copy-to-clipboard
- [x] Export JSON button on Tokens page — downloads all live token values
- [x] Git workflow — feature branches, PRs with descriptions, auto-delete off
- [x] Update README — accurate curve counts, mention export/accent/spacing features
- [x] Simplify color themes — 3 themes with light/dark mode toggle, Nova commented out
- [x] Component gallery overhaul — 18 components with variant controls, trimmed to 1 demo each

## Up next — Refining components
- [ ] Review and polish each component demo for visual quality
- [ ] Ensure all animated components visibly respond to motion theme switching
- [ ] Consistent spacing and layout across all 18 sections

## Later
- [ ] Blocks polish — make blocks look less templated/shadcn, more like real apps
- [ ] Add new color themes — replace Nova, all themes need light + dark
- [ ] Add more motion themes — shows architecture scales (Cinematic? Micro? TBD)
- [ ] Deploy to public URL (Vercel/Netlify)
- [ ] Design pass — overall layout and spacing polish
- [ ] Update CLAUDE.md

## Ideas backlog (unprioritized)
- [ ] Token export as CSS custom properties (not just JSON)
- [ ] Side-by-side theme comparison view
- [ ] Animation playground / custom curve editor
- [ ] Responsive / mobile polish
- [ ] Add a "How to use" section in the app explaining the token architecture
