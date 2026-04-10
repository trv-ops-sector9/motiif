import { lazy, Suspense, useRef, useState } from "react";
import { AppSidebar, type View } from "@/components/layout/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const ComponentGallery = lazy(() => import("@/components/gallery/ComponentGallery").then(m => ({ default: m.ComponentGallery })));
const TokensView       = lazy(() => import("@/components/gallery/TokensView").then(m => ({ default: m.TokensView })));
const DashboardBlock   = lazy(() => import("@/components/blocks/DashboardBlock").then(m => ({ default: m.DashboardBlock })));
const SettingsBlock    = lazy(() => import("@/components/blocks/SettingsBlock").then(m => ({ default: m.SettingsBlock })));
const AuthBlock        = lazy(() => import("@/components/blocks/AuthBlock").then(m => ({ default: m.AuthBlock })));
const MarketingBlock   = lazy(() => import("@/components/blocks/MarketingBlock").then(m => ({ default: m.MarketingBlock })));
const FleetOpsBlock    = lazy(() => import("@/components/blocks/FleetOpsBlock").then(m => ({ default: m.FleetOpsBlock })));

function ActiveView({ view }: { view: View }) {
  switch (view) {
    case "components":
      return <ComponentGallery />;
    case "tokens":
      return <TokensView />;
    case "dashboard":
      return <DashboardBlock />;
    case "settings":
      return <SettingsBlock />;
    case "auth":
      return <AuthBlock />;
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
  const pending = useRef<View>("components");
  const mainRef = useRef<HTMLElement>(null);

  const handleViewChange = (next: View) => {
    if (next === activeView || phase !== "idle") return;
    pending.current = next;
    setActiveView(next);
    setPhase("exiting");
  };

  const handleAnimationEnd = () => {
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
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar activeView={activeView} onViewChange={handleViewChange} />

        <main ref={mainRef} className="flex-1 overflow-y-auto">
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
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
