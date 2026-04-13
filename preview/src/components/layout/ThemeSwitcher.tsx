import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconChevronDown, IconChevronRight, IconPalette, IconSun, IconMoon, IconDiamond } from "@tabler/icons-react";
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

export function SidebarThemePicker({ hideModeToggle = false }: { hideModeToggle?: boolean }) {
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
        {!hideModeToggle && <SidebarModeToggle />}
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

function ThemeOptionList({ label, options, value, onSelect }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="p-1.5">
      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            opt.value === value
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60",
          )}
        >
          {opt.label}
          {opt.value === value && (
            <svg className="h-3.5 w-3.5 shrink-0 text-primary" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

function MotionOptionList({ onSelect }: { onSelect: () => void }) {
  const [motionTheme, setMotionTheme] = useState<string>(
    document.documentElement.getAttribute("data-motion-theme") ?? "standard"
  );

  const handleSelect = (v: string) => {
    setMotionTheme(v);
    document.documentElement.setAttribute("data-motion-theme", v);
    onSelect();
  };

  return (
    <ThemeOptionList
      label="Motion Theme"
      options={MOTION_THEMES.map((t) => ({ value: t.value, label: t.label }))}
      value={motionTheme}
      onSelect={handleSelect}
    />
  );
}

function CollapsedPopout({
  top,
  left,
  onClose,
  children,
}: {
  top: number;
  left: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return createPortal(
    <div
      ref={panelRef}
      style={{ position: "fixed", top, left, zIndex: 9999 }}
      className="w-52 rounded-lg border bg-sidebar shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}

export function SidebarThemeControls({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true);
  const [activePopout, setActivePopout] = useState<"visual" | "motion" | null>(null);
  const [popoutPos, setPopoutPos] = useState({ top: 0, left: 0 });
  const close = useCallback(() => setActivePopout(null), []);

  const handlePopoutClick = (type: "visual" | "motion", e: React.MouseEvent<HTMLButtonElement>) => {
    if (activePopout === type) {
      setActivePopout(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoutPos({ top: rect.top, left: rect.right + 8 });
    setActivePopout(type);
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Mode toggle — direct action */}
        <SidebarModeToggle />

        {/* Visual theme button */}
        <button
          onClick={(e) => handlePopoutClick("visual", e)}
          aria-label="Visual theme"
          aria-expanded={activePopout === "visual"}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            activePopout === "visual"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <IconPalette className="h-4 w-4" />
        </button>

        {/* Motion theme button */}
        <button
          onClick={(e) => handlePopoutClick("motion", e)}
          aria-label="Motion theme"
          aria-expanded={activePopout === "motion"}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            activePopout === "motion"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <IconDiamond className="h-4 w-4" />
        </button>

        {/* Portaled popout */}
        {activePopout === "visual" && (
          <CollapsedPopout top={popoutPos.top} left={popoutPos.left} onClose={close}>
            <ThemeOptionList
              label="Visual Theme"
              options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
              value={currentThemeValue}
              onSelect={(v) => { applyTheme(v as typeof currentThemeValue, currentMode); close(); }}
            />
          </CollapsedPopout>
        )}
        {activePopout === "motion" && (
          <CollapsedPopout top={popoutPos.top} left={popoutPos.left} onClose={close}>
            <MotionOptionList onSelect={close} />
          </CollapsedPopout>
        )}
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
