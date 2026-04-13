import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconRoute,
  IconComponents,
  IconColorSwatch,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { AppSidebar, type View } from "@/components/layout/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const ComponentGallery = lazy(() => import("@/components/gallery/ComponentGallery").then(m => ({ default: m.ComponentGallery })));
const TokensView       = lazy(() => import("@/components/gallery/TokensView").then(m => ({ default: m.TokensView })));
const MarketingBlock   = lazy(() => import("@/components/blocks/MarketingBlock").then(m => ({ default: m.MarketingBlock })));
const FleetOpsBlock    = lazy(() => import("@/components/blocks/FleetOpsBlock").then(m => ({ default: m.FleetOpsBlock })));

function useActiveThemes() {
  const [themes, setThemes] = useState(() => ({
    motion: document.documentElement.getAttribute("data-motion-theme") || "standard",
    color:  document.documentElement.getAttribute("data-theme") || "graphite-dark",
  }));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemes({
        motion: document.documentElement.getAttribute("data-motion-theme") || "standard",
        color:  document.documentElement.getAttribute("data-theme") || "graphite-dark",
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion-theme", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  return themes;
}

function MotiifMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
    >
      <path d="M3 18 C6 18, 6 6, 12 6 S18 18, 21 18" fill="none" />
      <circle cx={3} cy={18} r={2} stroke="none" />
      <circle cx={21} cy={18} r={2} stroke="none" />
    </svg>
  );
}

function TopBar({ sidebarCollapsed, onToggleSidebar }: { sidebarCollapsed: boolean; onToggleSidebar: () => void }) {
  const { motion: motionTheme, color: colorTheme } = useActiveThemes();

  return (
    <div className="flex h-12 shrink-0 items-center border-b bg-card px-3 gap-3">
      <button
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {sidebarCollapsed ? (
          <IconLayoutSidebarLeftExpand className="h-4 w-4" />
        ) : (
          <IconLayoutSidebarLeftCollapse className="h-4 w-4" />
        )}
      </button>
      <div className="flex items-center gap-1.5">
        <MotiifMark className="h-5 w-5 text-primary" />
        <span
          className="select-none text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Motiif
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground">
          motion-{motionTheme.charAt(0).toUpperCase() + motionTheme.slice(1)}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-0.5 text-[11px] font-medium text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          design-{colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}
        </span>
      </div>
    </div>
  );
}

function ActiveView({ view }: { view: View }) {
  switch (view) {
    case "components":
      return <ComponentGallery />;
    case "tokens":
      return <TokensView />;
    case "marketing":
      return <MarketingBlock />;
    case "fleet-ops":
      return <FleetOpsBlock />;
  }
}

const SPLASH_CARDS: { view: View; icon: React.ComponentType<{ className?: string }>; title: string; description: string; accentColor?: string }[] = [
  { view: "fleet-ops",  icon: IconRoute,        title: "Fleet Ops",   description: "Mission control dashboard with live map and vehicle telemetry", accentColor: "#D69D4F" },
  { view: "marketing",  icon: IconSpeakerphone,  title: "Brand",       description: "Product landing page with theme-adaptive transitions" },
  { view: "components", icon: IconComponents,    title: "Components",  description: "Interactive gallery of motion-wired UI primitives" },
  { view: "tokens",     icon: IconColorSwatch,   title: "Tokens",      description: "Live reference of every duration, curve, and alias" },
];

function SplashOverlay({ onSelect }: { onSelect: (view: View) => void }) {
  const [hoveredView, setHoveredView] = useState<View | null>(null);
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
      style={{ animation: "var(--anim-fade-in)", animationDuration: "var(--motion-duration-slow)" }}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-xl border bg-card p-8"
        style={{ animation: "var(--anim-fade-in)", animationDuration: "var(--motion-duration-slow)", animationDelay: "60ms", boxShadow: "var(--shadow-md)" }}
      >
        <div className="pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <MotiifMark className="h-9 w-9 text-primary" />
            <h1
              className="text-3xl font-bold tracking-wide text-foreground"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Motiif
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/70">by Traver Phillips</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A pure CSS token system for motion and visual identity. Four motion themes and three design themes ship out of the box. Swap either live and everything updates instantly. Built to be expanded with new themes. Use the sidebar to switch.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60 border-l-2 border-primary/40 pl-3">
            Export motion and design theme tokens as drop-in CSS, compatible with any stack — Tailwind v4, vanilla CSS, or anything in between.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SPLASH_CARDS.map(({ view, icon: Icon, title, description, accentColor }) => (
            <button
              key={view}
              onClick={() => onSelect(view)}
              onMouseEnter={() => setHoveredView(view)}
              onMouseLeave={() => setHoveredView(null)}
              className="group flex flex-col items-start gap-2 rounded-lg border bg-background p-4 text-left cursor-pointer transition-colors hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={accentColor && hoveredView === view ? { borderColor: accentColor } : undefined}
            >
              <span className="text-primary" style={accentColor ? { color: accentColor } : undefined}><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type Phase = "idle" | "exiting" | "entering";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<View>("components");
  const [displayView, setDisplayView] = useState<View>("components");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const { color: colorTheme } = useActiveThemes();
  const pending = useRef<View>("components");
  const mainRef = useRef<HTMLElement>(null);

  const showTacticalGradient = colorTheme === "tactical-dark" && displayView !== "marketing";

  const handleViewChange = (next: View) => {
    if (next === activeView || phase !== "idle") return;
    pending.current = next;
    setActiveView(next);
    setPhase("exiting");
  };

  const handleSplashSelect = (view: View) => {
    setShowSplash(false);
    if (view !== activeView) {
      pending.current = view;
      setActiveView(view);
      setDisplayView(view);
    }
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only respond to animations on the wrapper div itself, not bubbled from children
    if (e.target !== e.currentTarget) return;
    if (phase === "exiting") {
      setDisplayView(pending.current);
      setPhase("entering");
      // Scroll to top on page swap
      mainRef.current?.scrollTo(0, 0);
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div className="relative flex h-screen flex-col overflow-hidden bg-background">
        {!showSplash && (
          <TopBar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(c => !c)} />
        )}
        <div className="flex flex-1 overflow-hidden">
          {!showSplash && (
            <AppSidebar activeView={activeView} onViewChange={handleViewChange} collapsed={sidebarCollapsed} />
          )}
          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarGutter: "stable",
              ...(showTacticalGradient ? {
                background: "linear-gradient(to bottom, var(--background) 30%, oklch(0.18 0.06 135) 100%)",
              } : {}),
            }}
          >
            {!showSplash && (
              <div
                key={displayView}
                style={{
                  animation: phase === "exiting"
                    ? "var(--anim-page-exit)"
                    : phase === "entering"
                      ? "var(--anim-page-enter)"
                      : undefined,
                }}
                onAnimationEnd={handleAnimationEnd}
              >
                <Suspense>
                  <ActiveView view={displayView} />
                </Suspense>
              </div>
            )}
          </main>
        </div>
        {showSplash && <SplashOverlay onSelect={handleSplashSelect} />}
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
