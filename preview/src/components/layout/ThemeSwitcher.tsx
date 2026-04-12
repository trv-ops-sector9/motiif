import { useState } from "react";
import { IconChevronDown, IconChevronRight, IconPalette, IconSun, IconMoon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "graphite", label: "Graphite", light: "graphite", dark: "graphite-dark" },
  { value: "guchi", label: "Guchi", light: "guchi", dark: "guchi-dark" },
  { value: "tactical", label: "Tactical", light: "tactical", dark: "tactical-dark" },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];
type ColorMode = "light" | "dark";

/** Shared state so the theme picker and mode toggle stay in sync */
let currentThemeValue: ThemeValue = "graphite";
let currentMode: ColorMode = "dark";
let listeners: (() => void)[] = [];

function applyTheme(theme: ThemeValue, mode: ColorMode) {
  currentThemeValue = theme;
  currentMode = mode;
  const entry = THEMES.find((t) => t.value === theme) ?? THEMES[0];
  const cssValue = mode === "dark" ? entry.dark : entry.light;

  const apply = () => {
    document.documentElement.setAttribute("data-theme", cssValue);
    listeners.forEach((fn) => fn());
  };

  // View Transition API — smooth crossfade instead of staggered repaint
  if ((document as any).startViewTransition) {
    (document as any).startViewTransition(apply);
  } else {
    apply();
  }
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
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Switch visual theme"
              className={cn(
                "flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-xs transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              )}
            >
              <span className="flex-1 truncate text-left">{currentLabel}</span>
              <IconChevronDown className="h-3 w-3 shrink-0 opacity-50" />
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
        <SidebarModeToggle />
      </div>
    </div>
  );
}

/* ─── Light / Dark mode toggle ──────────────────────────────────────────── */

export function SidebarModeToggle() {
  const { mode } = useThemeSync();
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => applyTheme(currentThemeValue, nextMode)}
      aria-label={`Switch to ${nextMode} mode`}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors",
        "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      )}
    >
      {mode === "dark" ? (
        <IconSun className="h-3.5 w-3.5" />
      ) : (
        <IconMoon className="h-3.5 w-3.5" />
      )}
    </button>
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
      <p className="pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">
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
            <IconChevronDown className="h-3 w-3 shrink-0 opacity-50" />
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

/* ─── Collapsible theme controls wrapper ────────────────────────────────── */

export function SidebarThemeControls({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div
        title="Theme Controls"
        className="flex h-8 w-8 mx-auto items-center justify-center text-sidebar-foreground/40 select-none"
      >
        <IconPalette className="h-4 w-4" />
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
        <IconChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-150",
            open && "rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="mt-1 flex flex-col">
          <SidebarThemePicker />
          <SidebarMotionPicker />
        </div>
      )}
    </div>
  );
}
