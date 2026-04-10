import { useEffect, useState, useCallback } from "react";
import { Download, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Read a resolved CSS custom property from :root */
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Parse cubic-bezier string into 4 control points */
function parseBezier(value: string): [number, number, number, number] | null {
  const m = value.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/
  );
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
}

// ── Hook: live token values ──────────────────────────────────────────────────

function useTokenValues() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    // Re-read tokens when data-motion-theme or data-theme changes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          (m.attributeName === "data-motion-theme" ||
            m.attributeName === "data-theme" ||
            m.attributeName === "style")
        ) {
          refresh();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [refresh]);

  return { getCSSVar };
}

// ── Duration tokens ──────────────────────────────────────────────────────────

const DURATION_TOKENS = [
  { name: "--motion-duration-ultra-fast", label: "Ultra Fast" },
  { name: "--motion-duration-fast",       label: "Fast"       },
  { name: "--motion-duration-normal",     label: "Normal"     },
  { name: "--motion-duration-moderate",   label: "Moderate"   },
  { name: "--motion-duration-slow",       label: "Slow"       },
  { name: "--motion-duration-slower",     label: "Slower"     },
  { name: "--motion-duration-ultra-slow", label: "Ultra Slow" },
];

function DurationSection() {
  const { getCSSVar } = useTokenValues();
  const maxMs = 600; // for bar width scaling

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Duration scale</CardTitle>
        <CardDescription className="text-xs">7 stops from ultra-fast to ultra-slow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {DURATION_TOKENS.map((token) => {
          const raw = getCSSVar(token.name);
          const ms = parseInt(raw) || 0;
          return (
            <div key={token.name} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{token.label}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, (ms / maxMs) * 100)}%` }}
                />
              </div>
              <code className="w-14 shrink-0 text-right text-xs font-mono tabular-nums text-muted-foreground">
                {raw || "—"}
              </code>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Easing curves ────────────────────────────────────────────────────────────

/** Each theme defines its own curve vocabulary — not all themes need 9 curves. */
const THEME_CURVES: Record<string, { name: string; label: string; category: string }[]> = {
  standard: [
    { name: "--motion-curve-ease-out",    label: "ease-out",    category: "Enter"   },
    { name: "--motion-curve-ease-in",     label: "ease-in",     category: "Exit"    },
    { name: "--motion-curve-linear",      label: "linear",      category: "Utility" },
  ],
  dense: [
    { name: "--motion-curve-snap",        label: "snap",        category: "Core"    },
    { name: "--motion-curve-ease-in-out", label: "ease-in-out", category: "Utility" },
    { name: "--motion-curve-linear",      label: "linear",      category: "Utility" },
  ],
  expressive: [
    { name: "--motion-curve-spring",      label: "spring",      category: "Overshoot"  },
    { name: "--motion-curve-bounce",      label: "bounce",      category: "Overshoot"  },
    { name: "--motion-curve-ease-out",    label: "ease-out",    category: "Supporting" },
    { name: "--motion-curve-ease-in",     label: "ease-in",     category: "Supporting" },
    { name: "--motion-curve-ease-in-out", label: "ease-in-out", category: "Supporting" },
  ],
  precision: [
    { name: "--motion-curve-ease-out",    label: "ease-out",    category: "Core"    },
    { name: "--motion-curve-linear",      label: "linear",      category: "Utility" },
  ],
};

/** Mini SVG bezier curve visualization — 48x48 */
function CurvePreview({ points }: { points: [number, number, number, number] }) {
  const [x1, y1, x2, y2] = points;
  const w = 48, h = 48, pad = 4;
  const sx = (v: number) => pad + v * (w - pad * 2);
  const sy = (v: number) => h - pad - v * (h - pad * 2);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-12 w-12 shrink-0"
      fill="none"
    >
      {/* Grid */}
      <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={2}
        className="stroke-border fill-none" strokeWidth={0.5} />
      {/* Curve */}
      <path
        d={`M ${sx(0)} ${sy(0)} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${sx(1)} ${sy(1)}`}
        className="stroke-primary"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Control point handles */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(x1)} y2={sy(y1)}
        className="stroke-muted-foreground" strokeWidth={0.5} strokeDasharray="2 2" />
      <line x1={sx(1)} y1={sy(1)} x2={sx(x2)} y2={sy(y2)}
        className="stroke-muted-foreground" strokeWidth={0.5} strokeDasharray="2 2" />
      {/* Control points */}
      <circle cx={sx(x1)} cy={sy(y1)} r={2} className="fill-primary" />
      <circle cx={sx(x2)} cy={sy(y2)} r={2} className="fill-primary" />
      {/* Endpoints */}
      <circle cx={sx(0)} cy={sy(0)} r={1.5} className="fill-muted-foreground" />
      <circle cx={sx(1)} cy={sy(1)} r={1.5} className="fill-muted-foreground" />
    </svg>
  );
}

function CurveRow({ name, label, raw }: { name: string; label: string; raw: string }) {
  const points = parseBezier(raw);
  const hasOvershoot = points && (points[1] > 1 || points[3] > 1 || points[1] < 0 || points[3] < 0);

  return (
    <div className="flex items-center gap-3 py-1.5">
      {points ? <CurvePreview points={points} /> : <div className="h-12 w-12 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono font-medium">{label}</code>
          {hasOvershoot && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">overshoot</Badge>
          )}
        </div>
        <code className="text-[10px] text-muted-foreground font-mono block truncate mt-0.5">
          {raw || "—"}
        </code>
        <code className="text-[10px] text-muted-foreground/60 font-mono block truncate">
          {name}
        </code>
      </div>
    </div>
  );
}

function CurvesSection() {
  const { getCSSVar } = useTokenValues();
  const motionTheme = document.documentElement.getAttribute("data-motion-theme") || "standard";
  const curves = THEME_CURVES[motionTheme] ?? THEME_CURVES.standard;

  // Group curves by category
  const categories = new Map<string, typeof curves>();
  for (const c of curves) {
    const group = categories.get(c.category) ?? [];
    group.push(c);
    categories.set(c.category, group);
  }

  const THEME_LABELS: Record<string, string> = {
    standard:   "3 curves — clean ease-out, no personality",
    dense:      "3 curves — snap-first, minimal ceremony",
    expressive: "5 curves — spring + bounce overshoot",
    precision:  "2 curves — fade only, sub-100ms",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Easing curves</CardTitle>
        <CardDescription className="text-xs">
          {THEME_LABELS[motionTheme] ?? `${curves.length} curves`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from(categories.entries()).map(([category, catCurves]) => (
          <div key={category}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {category}
            </p>
            <div className="space-y-0.5">
              {catCurves.map((c) => (
                <CurveRow key={c.name} name={c.name} label={c.label} raw={getCSSVar(c.name)} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Semantic bridge variables ────────────────────────────────────────────────

const BRIDGE_CURVES = [
  { name: "--motion-curve-press-release", label: "press-release", usage: "Button/card tap feedback" },
  { name: "--motion-curve-navigation",    label: "navigation",    usage: "Tab pill slide, toast enter" },
  { name: "--motion-curve-expand-in",     label: "expand-in",     usage: "Dialog, dropdown open" },
  { name: "--motion-curve-expand-out",    label: "expand-out",    usage: "Dialog, dropdown close" },
  { name: "--motion-curve-accordion",     label: "accordion",     usage: "Accordion height + chevron" },
];

function BridgeSection() {
  const { getCSSVar } = useTokenValues();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Semantic bridge</CardTitle>
        <CardDescription className="text-xs">
          Intent-based variables — components use these, never raw curve names
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {BRIDGE_CURVES.map((b) => {
            const raw = getCSSVar(b.name);
            const points = parseBezier(raw);
            return (
              <div key={b.name} className="flex items-center gap-3 py-1">
                {points ? <CurvePreview points={points} /> : <div className="h-12 w-12 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono font-medium">{b.label}</code>
                  <p className="text-[10px] text-muted-foreground">{b.usage}</p>
                  <code className="text-[10px] text-muted-foreground/60 font-mono block truncate mt-0.5">
                    resolves to: {raw || "—"}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Animation archetypes ─────────────────────────────────────────────────────

const ARCHETYPES = [
  { name: "fade-in",        direction: "enter", usage: "Default enter" },
  { name: "fade-out",       direction: "exit",  usage: "Default exit" },
  { name: "slide-up-in",    direction: "enter", usage: "Toast, popover" },
  { name: "slide-up-out",   direction: "exit",  usage: "Toast dismiss" },
  { name: "slide-down-in",  direction: "enter", usage: "Dropdown open" },
  { name: "slide-down-out", direction: "exit",  usage: "Dropdown close" },
  { name: "slide-left-in",  direction: "enter", usage: "Drawer from right" },
  { name: "slide-left-out", direction: "exit",  usage: "Drawer close right" },
  { name: "slide-right-in", direction: "enter", usage: "Drawer from left" },
  { name: "slide-right-out",direction: "exit",  usage: "Drawer close left" },
  { name: "slide-top-in",   direction: "enter", usage: "Drawer from bottom" },
  { name: "slide-top-out",  direction: "exit",  usage: "Drawer close bottom" },
  { name: "slide-bottom-in",direction: "enter", usage: "Drawer from top" },
  { name: "slide-bottom-out",direction: "exit", usage: "Drawer close top" },
  { name: "expand-in",      direction: "enter", usage: "Dialog, sheet open" },
  { name: "expand-out",     direction: "exit",  usage: "Dialog, sheet close" },
  { name: "collapse-in",    direction: "enter", usage: "Accordion expand" },
  { name: "collapse-out",   direction: "exit",  usage: "Accordion collapse" },
  { name: "page-enter",     direction: "enter", usage: "Route transition in" },
  { name: "page-exit",      direction: "exit",  usage: "Route transition out" },
  { name: "overlay-in",     direction: "enter", usage: "Backdrop fade in" },
  { name: "overlay-out",    direction: "exit",  usage: "Backdrop fade out" },
] as const;

function ArchetypesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Animation archetypes</CardTitle>
        <CardDescription className="text-xs">
          22 named animations — each resolves to theme-specific keyframes, duration, and easing via <code className="font-mono">--anim-*</code> variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {ARCHETYPES.map((a) => (
            <div key={a.name} className="flex items-center gap-2 py-1">
              <Badge
                variant={a.direction === "enter" ? "default" : "secondary"}
                className="text-[9px] px-1.5 py-0 shrink-0 w-10 justify-center"
              >
                {a.direction}
              </Badge>
              <code className="text-xs font-mono font-medium">{a.name}</code>
              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{a.usage}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Motion principles ───────────────────────────────────────────────────────

const MOTION_PRINCIPLES = [
  {
    theme: "Standard",
    curves: 3,
    personality: "Neutral default — clean ease-out, no personality, predictable.",
    durations: "80ms – 400ms",
    transforms: "6px slides, scale 0.96 — subtle, clean",
    philosophy: "The safe default. Motion communicates state changes without drawing attention to itself. Suitable for any product that hasn't decided its motion personality yet.",
  },
  {
    theme: "Dense",
    curves: 3,
    personality: "Fast and tight — compressed durations, minimal movement.",
    durations: "40ms – 200ms",
    transforms: "2px max slide, scale 0.99 — barely perceptible",
    philosophy: "For data-heavy dashboards where motion should be felt, not watched. Every animation finishes before conscious attention engages. Snap-first curves eliminate any sense of drift.",
  },
  {
    theme: "Expressive",
    curves: 6,
    personality: "Emotive and personality-forward — spring overshoot, bounce on press.",
    durations: "100ms – 500ms",
    transforms: "12px slides, scale 0.80 — room for spring overshoot",
    philosophy: "Feels alive. Spring curves overshoot on enter, giving components physical weight. Exits are fast and clean — personality on the way in, efficiency on the way out.",
  },
  {
    theme: "Precision",
    curves: 2,
    personality: "Fade only, no transforms, sub-100ms — pure state changes.",
    durations: "50ms – 80ms",
    transforms: "None — every archetype is a pure opacity crossfade",
    philosophy: "For interfaces where motion must never distract. Focus control via blur radius and overlay opacity. No spatial movement, no scale, no overshoot. State changes happen; they don't perform.",
  },
];

function PrinciplesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Motion principles</CardTitle>
        <CardDescription className="text-xs">
          Four named personalities — each defines its own curve vocabulary, duration range, and transform philosophy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOTION_PRINCIPLES.map((p) => (
          <div key={p.theme} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{p.theme}</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {p.curves} {p.curves === 1 ? "curve" : "curves"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{p.personality}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Durations</span>
                <code className="block text-[11px] font-mono">{p.durations}</code>
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Transforms</span>
                <code className="block text-[11px] font-mono">{p.transforms}</code>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">{p.philosophy}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Color tokens ─────────────────────────────────────────────────────────────

const COLOR_GROUPS = [
  {
    label: "Core",
    tokens: [
      { name: "--background",  label: "background" },
      { name: "--foreground",  label: "foreground" },
      { name: "--primary",     label: "primary" },
      { name: "--primary-foreground", label: "primary-fg" },
      { name: "--secondary",   label: "secondary" },
      { name: "--secondary-foreground", label: "secondary-fg" },
    ],
  },
  {
    label: "Surface",
    tokens: [
      { name: "--card",            label: "card" },
      { name: "--card-foreground", label: "card-fg" },
      { name: "--muted",           label: "muted" },
      { name: "--muted-foreground", label: "muted-fg" },
      { name: "--accent",          label: "accent" },
      { name: "--accent-foreground", label: "accent-fg" },
    ],
  },
  {
    label: "Feedback",
    tokens: [
      { name: "--destructive",     label: "destructive" },
      { name: "--destructive-foreground", label: "destructive-fg" },
      { name: "--border",          label: "border" },
      { name: "--input",           label: "input" },
      { name: "--ring",            label: "ring" },
    ],
  },
  {
    label: "Charts",
    tokens: [
      { name: "--chart-1", label: "chart-1" },
      { name: "--chart-2", label: "chart-2" },
      { name: "--chart-3", label: "chart-3" },
      { name: "--chart-4", label: "chart-4" },
      { name: "--chart-5", label: "chart-5" },
    ],
  },
  {
    label: "Sidebar",
    tokens: [
      { name: "--sidebar",            label: "sidebar" },
      { name: "--sidebar-foreground",  label: "sidebar-fg" },
      { name: "--sidebar-primary",     label: "sidebar-primary" },
      { name: "--sidebar-accent",      label: "sidebar-accent" },
      { name: "--sidebar-border",      label: "sidebar-border" },
    ],
  },
];

function ColorSwatch({ name, label }: { name: string; label: string }) {
  const { getCSSVar } = useTokenValues();
  const raw = getCSSVar(name);

  return (
    <div className="flex items-center gap-2.5 py-1">
      <div
        className="h-7 w-7 shrink-0 rounded-md border shadow-sm"
        style={{ backgroundColor: raw || "transparent" }}
      />
      <div className="min-w-0">
        <code className="text-xs font-mono font-medium block">{label}</code>
        <code className="text-[10px] text-muted-foreground font-mono block truncate">{raw || "—"}</code>
      </div>
    </div>
  );
}

function ColorsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Color tokens</CardTitle>
        <CardDescription className="text-xs">
          Semantic colors — all OkLCh values, switch themes in sidebar to compare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {group.label}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {group.tokens.map((t) => (
                <ColorSwatch key={t.name} name={t.name} label={t.label} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Shadow tokens ────────────────────────────────────────────────────────────

const SHADOW_TOKENS = [
  { name: "--shadow-sm", label: "shadow-sm" },
  { name: "--shadow-md", label: "shadow-md" },
  { name: "--shadow-lg", label: "shadow-lg" },
  { name: "--shadow-xl", label: "shadow-xl" },
];

function ShadowsSection() {
  const { getCSSVar } = useTokenValues();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Shadows</CardTitle>
        <CardDescription className="text-xs">Elevation scale — 4 stops</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {SHADOW_TOKENS.map((s) => {
            const raw = getCSSVar(s.name);
            return (
              <div key={s.name} className="text-center">
                <div
                  className="h-14 w-full rounded-lg bg-card border mb-2"
                  style={{ boxShadow: raw }}
                />
                <code className="text-[10px] font-mono text-muted-foreground">{s.label}</code>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Spacing token ────────────────────────────────────────────────────────────

function SpacingSection() {
  const { getCSSVar } = useTokenValues();
  const spacing = getCSSVar("--spacing");
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Spacing</CardTitle>
        <CardDescription className="text-xs">
          Base: {spacing || "0.25rem"} — all utilities use calc(--spacing * N)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {steps.map((n) => (
            <div key={n} className="flex items-center gap-3">
              <code className="w-6 shrink-0 text-right text-xs font-mono text-muted-foreground">{n}</code>
              <div
                className="h-3 rounded bg-primary/20 border border-primary/30"
                style={{ width: `calc(${spacing || "0.25rem"} * ${n})` }}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {spacing ? `${(parseFloat(spacing) * n).toFixed(2)}rem` : `${(0.25 * n).toFixed(2)}rem`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Export tokens ────────────────────────────────────────────────────────────

function collectTokens() {
  const motionTheme = document.documentElement.getAttribute("data-motion-theme") || "standard";
  const colorTheme = document.documentElement.getAttribute("data-theme") || "default";

  const durations: Record<string, string> = {};
  for (const t of DURATION_TOKENS) {
    durations[t.name] = getCSSVar(t.name);
  }

  const curves: Record<string, string> = {};
  const themeCurves = THEME_CURVES[motionTheme] ?? THEME_CURVES.standard;
  for (const c of themeCurves) {
    curves[c.name] = getCSSVar(c.name);
  }

  const bridge: Record<string, string> = {};
  for (const b of BRIDGE_CURVES) {
    bridge[b.name] = getCSSVar(b.name);
  }

  const colors: Record<string, string> = {};
  for (const group of COLOR_GROUPS) {
    for (const t of group.tokens) {
      colors[t.name] = getCSSVar(t.name);
    }
  }

  const shadows: Record<string, string> = {};
  for (const s of SHADOW_TOKENS) {
    shadows[s.name] = getCSSVar(s.name);
  }

  return {
    $schema: "motif-tokens/1.0",
    motionTheme,
    colorTheme,
    spacing: getCSSVar("--spacing") || "0.25rem",
    motion: { durations, curves, bridge },
    color: colors,
    shadows,
  };
}

function ExportButton() {
  const [done, setDone] = useState(false);

  const handleExport = () => {
    const tokens = collectTokens();
    const json = JSON.stringify(tokens, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motif-tokens-${tokens.motionTheme}-${tokens.colorTheme}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  return (
    <button
      onClick={handleExport}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
      {done ? "Downloaded" : "Download tokens"}
    </button>
  );
}

// ── Main layout ──────────────────────────────────────────────────────────────

export function TokensView() {
  const motionTheme = document.documentElement.getAttribute("data-motion-theme") || "standard";
  const colorTheme = document.documentElement.getAttribute("data-theme") || "default";

  // Re-render on theme change
  useTokenValues();

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Design tokens</h1>
          <ExportButton />
        </div>
        <p className="text-sm text-muted-foreground">
          Live reference — values update when you switch themes in the sidebar.
          Currently:{" "}
          <Badge variant="outline" className="text-[10px] mx-0.5">{motionTheme}</Badge>
          {" "}motion /{" "}
          <Badge variant="outline" className="text-[10px] mx-0.5">{colorTheme}</Badge>
          {" "}color
        </p>
      </div>

      <Separator />

      {/* Motion tokens */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Motion</h2>
        <PrinciplesSection />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <DurationSection />
          <CurvesSection />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <BridgeSection />
          <ArchetypesSection />
        </div>
      </section>

      <Separator />

      {/* Color tokens */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Color</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ColorsSection />
          <div className="space-y-4">
            <ShadowsSection />
            <SpacingSection />
          </div>
        </div>
      </section>
    </div>
  );
}
