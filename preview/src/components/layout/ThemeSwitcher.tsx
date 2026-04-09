import { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw, CircleOff, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "default", label: "Default" },
  { value: "dark-minimal", label: "Dark Minimal" },
  { value: "fluent-light", label: "Fluent 2 Light" },
  { value: "fluent-dark", label: "Fluent 2 Dark" },
  { value: "bebop-light", label: "Bebop Light" },
  { value: "bebop-dark", label: "Bebop Dark" },
  { value: "nova-dark", label: "Nova Dark" },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

export function SidebarThemePicker() {
  const [theme, setTheme] = useState<ThemeValue>("default");

  const handleChange = (value: string) => {
    const t = value as ThemeValue;
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const currentLabel = THEMES.find((t) => t.value === theme)?.label ?? "Default";

  return (
    <div className="px-2">
      <p className="pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
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

/* ─── Motion theme picker ────────────────────────────────────────────────── */

const MOTION_THEMES = [
  { value: "fluent2", label: "Fluent 2" },
  { value: "balanced", label: "Balanced" },
  { value: "dense", label: "Dense" },
  { value: "expressive", label: "Expressive" },
  { value: "reduced", label: "Reduced" },
] as const;

type MotionThemeValue = (typeof MOTION_THEMES)[number]["value"];

export function SidebarMotionPicker() {
  const [motionTheme, setMotionTheme] = useState<MotionThemeValue>("fluent2");

  const handleChange = (value: string) => {
    const t = value as MotionThemeValue;
    setMotionTheme(t);
    document.documentElement.setAttribute("data-motion-theme", t);
  };

  const currentLabel = MOTION_THEMES.find((t) => t.value === motionTheme)?.label ?? "Fluent 2";

  return (
    <div className="px-2">
      <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
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
      <div className="flex items-center gap-2 pt-2.5 mb-1">
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Global Spacing</span>
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
      <p className="pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
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
              <CircleOff className="h-5 w-5 text-muted-foreground" />
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
          <SidebarAccentPicker />
          <SidebarSpacingSlider />
        </div>
      )}
    </div>
  );
}
