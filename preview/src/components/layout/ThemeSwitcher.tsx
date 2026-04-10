import { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw, Circle, Palette, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "default", label: "Default", light: "default", dark: "dark-minimal" },
  { value: "drive", label: "Drive", light: "drive", dark: "drive-dark" },
  { value: "brutalist", label: "Brutalist", light: "brutalist", dark: "brutalist-dark" },
  { value: "lux", label: "Lux", light: "lux", dark: "lux-dark" },
  { value: "vapor", label: "Vapor", light: "vapor", dark: "vapor-dark" },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];
type ColorMode = "light" | "dark";

/** Shared state so the theme picker and mode toggle stay in sync */
let currentThemeValue: ThemeValue = "default";
let currentMode: ColorMode = "light";
let listeners: (() => void)[] = [];

function applyTheme(theme: ThemeValue, mode: ColorMode) {
  currentThemeValue = theme;
  currentMode = mode;
  const entry = THEMES.find((t) => t.value === theme) ?? THEMES[0];
  const cssValue = mode === "dark" ? entry.dark : entry.light;
  document.documentElement.setAttribute("data-theme", cssValue);
  listeners.forEach((fn) => fn());
}

function useThemeSync() {
  const [, setTick] = useState(0);
  useState(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  });
  return { theme: currentThemeValue, mode: currentMode };
}

export function SidebarThemePicker() {
  const { theme } = useThemeSync();

  const handleChange = (value: string) => {
    applyTheme(value as ThemeValue, currentMode);
  };

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? "Default";

  return (
    <div className="px-2">
      <p className="pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
        Visual Theme
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Switch visual theme"
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-xs transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            )}
          >
            <span className="flex-1 truncate text-left">{currentLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-44"
        >
          <DropdownMenuRadioGroup value={theme} onValueChange={handleChange}>
            {THEMES.map((t) => (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                {t.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ─── Light / Dark mode toggle ──────────────────────────────────────────── */

export function SidebarModePicker() {
  const { mode } = useThemeSync();

  return (
    <div className="px-2">
      <p className="pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
        Mode
      </p>
      <div className="inline-flex w-full rounded-md border border-sidebar-border">
        <button
          onClick={() => applyTheme(currentThemeValue, "light")}
          aria-label="Light mode"
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-l-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:z-10",
            mode === "light"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <Sun className="h-3 w-3" />
          Light
        </button>
        <span className="w-px bg-sidebar-border" />
        <button
          onClick={() => applyTheme(currentThemeValue, "dark")}
          aria-label="Dark mode"
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-r-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:z-10",
            mode === "dark"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <Moon className="h-3 w-3" />
          Dark
        </button>
      </div>
    </div>
  );
}

/* ─── Motion theme picker ────────────────────────────────────────────────── */

const MOTION_THEMES = [
  { value: "standard", label: "Standard" },
  { value: "dense", label: "Dense" },
  { value: "expressive", label: "Expressive" },
  { value: "precision", label: "Precision" },
  { value: "reduced", label: "Reduced" },
] as const;

type MotionThemeValue = (typeof MOTION_THEMES)[number]["value"];

export function SidebarMotionPicker() {
  const [motionTheme, setMotionTheme] = useState<MotionThemeValue>("standard");

  const handleChange = (value: string) => {
    const t = value as MotionThemeValue;
    setMotionTheme(t);
    document.documentElement.setAttribute("data-motion-theme", t);
  };

  const currentLabel = MOTION_THEMES.find((t) => t.value === motionTheme)?.label ?? "Standard";

  return (
    <div className="px-2">
      <p className="pt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
        Motion Theme
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Switch motion theme"
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-xs transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            )}
          >
            <span className="flex-1 truncate text-left">{currentLabel}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-44"
        >
          <DropdownMenuRadioGroup value={motionTheme} onValueChange={handleChange}>
            {MOTION_THEMES.map((t) => (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                {t.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ─── Spacing slider ─────────────────────────────────────────────────────── */

const SPACING_DEFAULT = 0.25;
const SPACING_MIN = 0.2;
const SPACING_MAX = 0.35;
const SPACING_STEP = 0.005;

export function SidebarSpacingSlider() {
  const [value, setValue] = useState(SPACING_DEFAULT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setValue(v);
    document.documentElement.style.setProperty("--spacing", `${v}rem`);
  };

  const handleReset = () => {
    setValue(SPACING_DEFAULT);
    document.documentElement.style.removeProperty("--spacing");
  };

  const isDefault = Math.abs(value - SPACING_DEFAULT) < 0.001;
  const pct = ((value - SPACING_MIN) / (SPACING_MAX - SPACING_MIN)) * 100;

  return (
    <div className="px-2">
      {/* Header row */}
      <div className="flex items-center gap-2 pt-1.5 mb-0.5">
        <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Global Spacing</span>
        {!isDefault && (
          <button
            onClick={handleReset}
            aria-label="Reset spacing to default"
            className={cn(
              "flex h-4 w-4 cursor-pointer items-center justify-center rounded",
              "text-muted-foreground hover:text-sidebar-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring"
            )}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Range track */}
      <input
        type="range"
        min={SPACING_MIN}
        max={SPACING_MAX}
        step={SPACING_STEP}
        value={value}
        onChange={handleChange}
        aria-label={`Global spacing: ${value}rem`}
        aria-valuemin={SPACING_MIN}
        aria-valuemax={SPACING_MAX}
        aria-valuenow={value}
        className={cn(
          "w-full cursor-pointer appearance-none rounded-full h-1.5",
          /* webkit thumb */
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-sidebar-primary",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-125",
          /* firefox thumb */
          "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-0",
          "[&::-moz-range-thumb]:bg-sidebar-primary",
          "[&::-moz-range-thumb]:cursor-pointer"
        )}
        style={{
          background: `linear-gradient(to right, var(--sidebar-primary) ${pct}%, var(--sidebar-accent) ${pct}%)`,
        }}
      />

      {/* Min / max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground/60">Compact</span>
        <span className="text-[10px] text-muted-foreground/60">Spacious</span>
      </div>
    </div>
  );
}

/* ─── Accent color picker ───────────────────────────────────────────────── */

const ACCENT_COLORS = [
  { name: "Default", primary: null,                     fg: null               },
  { name: "Blue",    primary: "oklch(0.55 0.19 245)",   fg: "oklch(0.985 0 0)" },
  { name: "Violet",  primary: "oklch(0.55 0.22 290)",   fg: "oklch(0.985 0 0)" },
  { name: "Rose",    primary: "oklch(0.55 0.2 350)",    fg: "oklch(0.985 0 0)" },
  { name: "Orange",  primary: "oklch(0.65 0.19 55)",    fg: "oklch(0.15 0 0)"  },
  { name: "Green",   primary: "oklch(0.55 0.16 155)",   fg: "oklch(0.985 0 0)" },
  { name: "Teal",    primary: "oklch(0.55 0.12 200)",   fg: "oklch(0.985 0 0)" },
] as const;

export function SidebarAccentPicker() {
  const [active, setActive] = useState<string>("Default");

  const handleSelect = (color: (typeof ACCENT_COLORS)[number]) => {
    setActive(color.name);
    const el = document.documentElement;
    if (!color.primary) {
      el.style.removeProperty("--primary");
      el.style.removeProperty("--primary-foreground");
      el.style.removeProperty("--sidebar-primary");
      el.style.removeProperty("--sidebar-primary-foreground");
      el.style.removeProperty("--ring");
      return;
    }
    el.style.setProperty("--primary", color.primary);
    el.style.setProperty("--primary-foreground", color.fg);
    el.style.setProperty("--sidebar-primary", color.primary);
    el.style.setProperty("--sidebar-primary-foreground", color.fg);
    el.style.setProperty("--ring", color.primary);
  };

  return (
    <div className="px-2">
      <p className="pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
        Accent
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => handleSelect(color)}
            title={color.name}
            aria-label={`Accent: ${color.name}`}
            className={cn(
              "h-5 w-5 rounded-full cursor-pointer transition-transform",
              "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1",
              active === color.name && "ring-2 ring-sidebar-foreground ring-offset-1 ring-offset-sidebar"
            )}
            style={color.primary ? { backgroundColor: color.primary } : undefined}
          >
            {!color.primary && (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Collapsible theme controls wrapper ────────────────────────────────── */

export function SidebarThemeControls({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div
        title="Theme Controls"
        className="flex h-8 w-8 mx-auto items-center justify-center text-sidebar-foreground/40 select-none"
      >
        <Palette className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between px-2 pb-0.5 pt-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm",
        )}
        aria-expanded={open}
        aria-label="Toggle theme controls"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Theme Controls
        </span>
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-150",
            open && "rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="mt-1 flex flex-col">
          <SidebarMotionPicker />
          <SidebarThemePicker />
          <SidebarModePicker />
          <SidebarAccentPicker />
          <SidebarSpacingSlider />
        </div>
      )}
    </div>
  );
}
