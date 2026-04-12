import { useEffect, useState, useCallback } from "react";
import { IconDownload, IconCheck, IconRotate } from "@tabler/icons-react";
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
            m.attributeName === "data-theme")
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

/** Shared range input styles — custom track + thumb for theme consistency */
const rangeTrackCn = cn(
  "flex-1 cursor-pointer appearance-none rounded-full h-1.5",
  "bg-muted",
  /* webkit thumb */
  "[&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
  "[&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:bg-primary",
  "[&::-webkit-slider-thumb]:cursor-pointer",
  "[&::-webkit-slider-thumb]:transition-transform",
  "[&::-webkit-slider-thumb]:hover:scale-125",
  "[&::-webkit-slider-thumb]:shadow-sm",
  /* firefox thumb */
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5",
  "[&::-moz-range-thumb]:rounded-full",
  "[&::-moz-range-thumb]:border-0",
  "[&::-moz-range-thumb]:bg-primary",
  "[&::-moz-range-thumb]:cursor-pointer",
);

function DurationSection() {
  const { getCSSVar } = useTokenValues();
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // Detect motion theme changes and clear all overrides
  useEffect(() => {
    const observer = new MutationObserver(() => {
      for (const token of DURATION_TOKENS) {
        document.documentElement.style.removeProperty(token.name);
      }
      setOverrides({});
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const handleChange = (tokenName: string, ms: number) => {
    document.documentElement.style.setProperty(tokenName, `${ms}ms`);
    setOverrides((prev) => ({ ...prev, [tokenName]: ms }));
  };

  const resetOne = (tokenName: string) => {
    document.documentElement.style.removeProperty(tokenName);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[tokenName];
      return next;
    });
  };

  const resetAll = () => {
    for (const token of DURATION_TOKENS) {
      document.documentElement.style.removeProperty(token.name);
    }
    setOverrides({});
  };

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="bg-muted/30 rounded-lg px-4 pt-4 pb-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-sm font-semibold">Duration scale</h3>
        <button
          onClick={resetAll}
          className={cn(
            "flex items-center gap-1 shrink-0 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            !hasOverrides && "invisible",
          )}
          title="Reset all durations to theme defaults"
        >
          <IconRotate className="h-3 w-3" />
          Reset all
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Drag to override — changes propagate live across all components
      </p>
      <div className="space-y-2.5">
        {DURATION_TOKENS.map((token) => {
          const isOverridden = token.name in overrides;
          // Use React state for overridden values (instant), CSS query for defaults
          const ms = isOverridden
            ? overrides[token.name]
            : parseInt(getCSSVar(token.name)) || 0;
          const pct = Math.round(((ms - 10) / (1000 - 10)) * 100);

          return (
            <div key={token.name} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{token.label}</span>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={ms}
                onChange={(e) => handleChange(token.name, Number(e.target.value))}
                className={rangeTrackCn}
                style={{
                  background: `linear-gradient(to right, var(--primary) ${pct}%, var(--muted) ${pct}%)`,
                }}
              />
              <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end">
                <code className={cn(
                  "text-xs font-mono tabular-nums",
                  isOverridden ? "text-primary font-semibold" : "text-muted-foreground",
                )}>
                  {ms}ms
                </code>
                {isOverridden && (
                  <button
                    onClick={() => resetOne(token.name)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none"
                    title="Reset to theme default"
                  >
                    <IconRotate className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const inner = h - pad * 2;

  // Expand y range only when curve overshoots [0, 1] (e.g. spring, bounce)
  const hasOvershoot = y1 > 1 || y2 > 1 || y1 < 0 || y2 < 0;
  const margin = 0.1;
  const yMin = hasOvershoot ? Math.min(0, y1, y2) - margin : 0;
  const yMax = hasOvershoot ? Math.max(1, y1, y2) + margin : 1;
  const yRange = yMax - yMin;

  const sx = (v: number) => pad + v * inner;
  const sy = (v: number) => h - pad - ((v - yMin) / yRange) * inner;

  // Grid rect tracks the logical [0,1] output space
  const gridBottom = sy(0);
  const gridTop = sy(1);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-12 w-12 shrink-0"
      fill="none"
    >
      {/* Grid — [0,1] output space */}
      <rect x={pad} y={gridTop} width={inner} height={gridBottom - gridTop} rx={2}
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
    <div className="bg-muted/30 rounded-lg px-4 pt-4 pb-4">
      <h3 className="text-sm font-semibold">Easing curves</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        {THEME_LABELS[motionTheme] ?? `${curves.length} curves`}
      </p>
      <div className="mt-3 space-y-3">
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
      </div>
    </div>
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
    <div>
      <h3 className="text-sm font-semibold">Semantic bridge</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Intent-based variables — components use these, never raw curve names
      </p>
      <div className="mt-3 space-y-2">
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
    </div>
  );
}

// ── Animation archetypes ─────────────────────────────────────────────────────

/** Pair enter/exit archetypes for compact display */
const ARCHETYPE_PAIRS = [
  { enter: "fade-in",         exit: "fade-out",         usage: "Default" },
  { enter: "slide-up-in",     exit: "slide-up-out",     usage: "Toast, popover" },
  { enter: "slide-down-in",   exit: "slide-down-out",   usage: "Dropdown" },
  { enter: "slide-left-in",   exit: "slide-left-out",   usage: "Drawer →" },
  { enter: "slide-right-in",  exit: "slide-right-out",  usage: "Drawer ←" },
  { enter: "slide-top-in",    exit: "slide-top-out",    usage: "Drawer ↑" },
  { enter: "slide-bottom-in", exit: "slide-bottom-out", usage: "Drawer ↓" },
  { enter: "expand-in",       exit: "expand-out",       usage: "Dialog, sheet" },
  { enter: "collapse-in",     exit: "collapse-out",     usage: "Accordion" },
  { enter: "page-enter",      exit: "page-exit",        usage: "Route transition" },
  { enter: "overlay-in",      exit: "overlay-out",      usage: "Backdrop" },
];

function ArchetypesSection() {
  return (
    <div>
      <h3 className="text-sm font-semibold">Animation archetypes</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        22 animations via <code className="font-mono">--anim-*</code> — paired enter/exit
      </p>
      <div className="mt-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Enter", "Exit", "Usage"].map((h) => (
                <th key={h} className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pr-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARCHETYPE_PAIRS.map((p) => (
              <tr key={p.enter} className="border-b border-border/50 last:border-0">
                <td className="py-1.5 pr-3"><code className="font-mono text-[11px]">{p.enter}</code></td>
                <td className="py-1.5 pr-3"><code className="font-mono text-[11px] text-muted-foreground">{p.exit}</code></td>
                <td className="py-1.5 text-[11px] text-muted-foreground">{p.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
    <div>
      <h3 className="text-sm font-semibold">Motion principles</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Four named personalities — curve vocabulary, duration range, transform style
      </p>
      <div className="mt-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Theme", "Durations", "Curves", "Transforms"].map((h) => (
                <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOTION_PRINCIPLES.map((p) => (
              <tr key={p.theme} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-4 font-semibold">{p.theme}</td>
                <td className="py-2 pr-4 font-mono text-[11px] text-muted-foreground">{p.durations}</td>
                <td className="py-2 pr-4 tabular-nums text-muted-foreground">{p.curves}</td>
                <td className="py-2 font-mono text-[11px] text-muted-foreground">{p.transforms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
    <div>
      <h3 className="text-sm font-semibold">Color tokens</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Semantic colors — all OkLCh values, switch themes in sidebar to compare
      </p>
      <div className="mt-3 space-y-4">
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
      </div>
    </div>
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
    <div>
      <h3 className="text-sm font-semibold">Shadows</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Elevation scale — 4 stops</p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
    </div>
  );
}

// ── Spacing token ────────────────────────────────────────────────────────────

function SpacingSection() {
  const { getCSSVar } = useTokenValues();
  const spacing = getCSSVar("--spacing");
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

  return (
    <div>
      <h3 className="text-sm font-semibold">Spacing</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Base: {spacing || "0.25rem"} — all utilities use calc(--spacing * N)
      </p>
      <div className="mt-3 space-y-1.5">
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
    </div>
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
      {done ? <IconCheck className="h-3.5 w-3.5" /> : <IconDownload className="h-3.5 w-3.5" />}
      {done ? "Downloaded" : "Download tokens"}
    </button>
  );
}

// ── Main layout ──────────────────────────────────────────────────────────────

export function TokensView() {
  // Re-render on theme change
  useTokenValues();

  const motionTheme = document.documentElement.getAttribute("data-motion-theme") || "standard";
  const colorTheme = document.documentElement.getAttribute("data-theme") || "default";

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Design tokens</h1>
        <p className="text-sm text-muted-foreground">
          Live reference — values update when you switch themes in the sidebar.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground">
            motion-{motionTheme.charAt(0).toUpperCase() + motionTheme.slice(1)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            design-{colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}
          </span>
          <div className="ml-auto">
            <ExportButton />
          </div>
        </div>
      </div>

      <Separator />

      {/* Motion tokens */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Motion</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <DurationSection />
          <CurvesSection />
        </div>
        <Separator className="my-5" />
        <PrinciplesSection />
        <Separator className="my-5" />
        <div className="grid sm:grid-cols-2 gap-4">
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
          <div className="space-y-5">
            <ShadowsSection />
            <Separator />
            <SpacingSection />
          </div>
        </div>
      </section>
    </div>
  );
}
