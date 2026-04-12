import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
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
    color:  document.documentElement.getAttribute("data-theme") || "default",
  }));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemes({
        motion: document.documentElement.getAttribute("data-motion-theme") || "standard",
        color:  document.documentElement.getAttribute("data-theme") || "default",
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion-theme", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  return themes;
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
      <span
        className="select-none text-base font-bold tracking-wide text-foreground"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        Motif
      </span>
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

type Phase = "idle" | "exiting" | "entering";

export default function App() {
  const [activeView, setActiveView] = useState<View>("components");
  const [displayView, setDisplayView] = useState<View>("components");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const pending = useRef<View>("components");
  const mainRef = useRef<HTMLElement>(null);

  const handleViewChange = (next: View) => {
    if (next === activeView || phase !== "idle") return;
    pending.current = next;
    setActiveView(next);
    setPhase("exiting");
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
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TopBar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(c => !c)} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar activeView={activeView} onViewChange={handleViewChange} collapsed={sidebarCollapsed} />
          <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
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
          </main>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
