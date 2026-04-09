import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  LogIn,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Paintbrush,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarThemeControls } from "@/components/layout/ThemeSwitcher";

export type View =
  | "components"
  | "tokens"
  | "dashboard"
  | "settings"
  | "auth"
  | "marketing";

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GALLERY_ITEMS: NavItem[] = [
  { id: "components", label: "Components", icon: Layers },
  { id: "tokens",     label: "Tokens",     icon: Paintbrush },
];

const BLOCK_ITEMS: NavItem[] = [
  { id: "marketing", label: "Marketing", icon: Megaphone       },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings",  label: "Settings",  icon: Settings        },
  { id: "auth",      label: "Auth",      icon: LogIn           },
];

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex min-h-14 shrink-0 items-center border-b border-sidebar-border px-3 py-3">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="block truncate text-sm font-semibold text-sidebar-foreground leading-tight">
              Motif
            </span>
            <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">
              Runtime design & motion token system
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {/* Theme controls — collapsible section */}
        <SidebarThemeControls collapsed={collapsed} />

        <Separator className="my-1 bg-sidebar-border" />

        {/* Gallery section */}
        {!collapsed ? (
          <button
            onClick={() => setGalleryOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between px-2 pb-0.5 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm"
            aria-expanded={galleryOpen}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gallery
            </span>
            <ChevronRight
              className={cn(
                "h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-150",
                galleryOpen && "rotate-90"
              )}
            />
          </button>
        ) : null}
        {(collapsed || galleryOpen) &&
          GALLERY_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              collapsed={collapsed}
              onClick={() => onViewChange(item.id)}
            />
          ))}

        <Separator className="my-1 bg-sidebar-border" />

        {/* Blocks section */}
        {!collapsed ? (
          <button
            onClick={() => setBlocksOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between px-2 pb-0.5 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm"
            aria-expanded={blocksOpen}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blocks
            </span>
            <ChevronRight
              className={cn(
                "h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-150",
                blocksOpen && "rotate-90"
              )}
            />
          </button>
        ) : null}
        {(collapsed || blocksOpen) &&
          BLOCK_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              collapsed={collapsed}
              onClick={() => onViewChange(item.id)}
            />
          ))}
      </nav>

      {/* Footer — user card */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <button
          className={cn(
            "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed && "justify-center px-0"
          )}
          aria-label="User menu"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src="" alt="Traver Phillips" />
            <AvatarFallback className="text-xs">TP</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-xs font-medium leading-tight">
                  Traver Phillips
                </span>
                <span className="truncate text-xs leading-tight text-muted-foreground">
                  traver@example.com
                </span>
              </div>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active &&
          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}
