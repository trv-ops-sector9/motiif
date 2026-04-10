import { useState } from "react";
import {
  IconChartBar,
  IconSettings,
  IconLogin2,
  IconSpeakerphone,
  IconRoute,
  IconComponents,
  IconColorSwatch,
  IconChevronRight,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarThemeControls } from "@/components/layout/ThemeSwitcher";

export type View =
  | "components"
  | "tokens"
  | "dashboard"
  | "settings"
  | "auth"
  | "marketing"
  | "fleet-ops";

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GALLERY_ITEMS: NavItem[] = [
  { id: "components", label: "Components", icon: IconComponents },
  { id: "tokens",     label: "Tokens",     icon: IconColorSwatch },
];

const BLOCK_ITEMS: NavItem[] = [
  { id: "fleet-ops", label: "Fleet Ops", icon: IconRoute          },
  { id: "marketing", label: "Marketing", icon: IconSpeakerphone   },
  { id: "dashboard", label: "Analytics", icon: IconChartBar       },
  { id: "settings",  label: "Settings",  icon: IconSettings       },
  { id: "auth",      label: "Auth",      icon: IconLogin2         },
];

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  collapsed: boolean;
}

export function AppSidebar({ activeView, onViewChange, collapsed }: AppSidebarProps) {
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-56"
      )}
    >
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
            <IconChevronRight
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
            <IconChevronRight
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

      {/* Footer */}
      {!collapsed && (
        <FooterContact />
      )}
    </aside>
  );
}

const EMAIL = "traver4@gmail.com";

function FooterContact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
      <p className="truncate text-xs font-medium text-sidebar-foreground leading-tight">
        Traver Phillips
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <a
          href={`mailto:${EMAIL}`}
          className="truncate text-xs leading-tight text-muted-foreground hover:text-sidebar-foreground transition-colors"
        >
          {EMAIL}
        </a>
        <button
          onClick={handleCopy}
          aria-label="Copy email address"
          className={cn(
            "shrink-0 cursor-pointer rounded p-0.5 transition-colors",
            "text-muted-foreground hover:text-sidebar-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
          )}
        >
          {copied
            ? <IconCheck className="h-3 w-3 text-green-500" />
            : <IconCopy className="h-3 w-3" />
          }
        </button>
      </div>
    </div>
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
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}
