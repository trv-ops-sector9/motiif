import { useState } from "react";
import { CheckCircle, Loader2, Send, Star, User, Settings, CreditCard, Bell, LogOut, ChevronDown, Palette, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-b pb-10 mb-10 last:border-0 last:mb-0 last:pb-0">
      {children}
    </section>
  );
}

/* ── Buttons section ── */
type BtnVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type BtnSize    = "sm" | "default" | "lg" | "icon";
type BtnState   = "normal" | "loading" | "disabled";
type BtnIcon    = "none" | "leading" | "only";

function ControlGroup({ label, name, value, options, onChange }: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-20 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map(opt => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
            <Label htmlFor={`${name}-${opt.value}`} className="text-sm font-normal cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function ButtonDemo() {
  const [variant,  setVariant]  = useState<BtnVariant>("default");
  const [size,     setSize]     = useState<BtnSize>("default");
  const [state,    setState]    = useState<BtnState>("normal");
  const [iconMode, setIconMode] = useState<BtnIcon>("none");

  const isLoading  = state === "loading";
  const isDisabled = state === "disabled";
  const isIconOnly = iconMode === "only" || size === "icon";

  return (
    <div className="space-y-8">
      {/* Live button */}
      <div className="flex items-center justify-center rounded-xl border bg-muted/30 py-12">
        <Button variant={variant} size={size} disabled={isDisabled}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{!isIconOnly && "Loading…"}</>
            : isIconOnly
              ? <Bell className="h-4 w-4" />
              : <>{iconMode === "leading" && <Send className="h-4 w-4" />}Click me</>
          }
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <ControlGroup
          label="Variant" name="variant" value={variant}
          onChange={v => setVariant(v as BtnVariant)}
          options={[
            { value: "default",     label: "Default"     },
            { value: "secondary",   label: "Secondary"   },
            { value: "outline",     label: "Outline"     },
            { value: "ghost",       label: "Ghost"       },
            { value: "destructive", label: "Destructive" },
            { value: "link",        label: "Link"        },
          ]}
        />
        <ControlGroup
          label="Size" name="size" value={size}
          onChange={v => setSize(v as BtnSize)}
          options={[
            { value: "sm",      label: "Small"   },
            { value: "default", label: "Default" },
            { value: "lg",      label: "Large"   },
            { value: "icon",    label: "Icon"    },
          ]}
        />
        <ControlGroup
          label="State" name="state" value={state}
          onChange={v => setState(v as BtnState)}
          options={[
            { value: "normal",   label: "Normal"   },
            { value: "loading",  label: "Loading"  },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <ControlGroup
          label="Icon" name="icon" value={iconMode}
          onChange={v => setIconMode(v as BtnIcon)}
          options={[
            { value: "none",    label: "None"      },
            { value: "leading", label: "Leading"   },
            { value: "only",    label: "Icon only" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Dialog section ── */
function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) { setSaved(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setOpen(false), 900);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="">
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name and bio. Changes are saved immediately.
          </DialogDescription>
        </DialogHeader>
        {saved ? (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 my-2">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium">Profile saved successfully!</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-name">Display name</Label>
              <Input
                id="dialog-name"
                placeholder="Jordan Lee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-bio">Bio</Label>
              <Input
                id="dialog-bio"
                placeholder="Designer & developer"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving || saved}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className=""
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Toast section ── */
function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => toast("Changes saved successfully.")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Profile updated.")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Payment failed. Please retry.")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Your session expires in 5 minutes.")}>
        Warning
      </Button>
      <Button variant="outline" onClick={() =>
        toast("File uploaded.", {
          description: "report-q4-2024.pdf · 2.4 MB",
          action: { label: "View", onClick: () => {} },
        })
      }>
        With action
      </Button>
    </div>
  );
}

/* ── Card section ── */
function CardDemo() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const releaseTransition = `
    translate var(--motion-duration-fast) var(--motion-curve-press-release),
    scale var(--motion-duration-fast) var(--motion-curve-press-release),
    box-shadow var(--motion-duration-fast) var(--motion-curve-easy-ease)
  `;

  return (
    <Card
      className="w-72 overflow-hidden cursor-pointer select-none"
      style={{
        translate: pressed ? "0 1px" : hovered ? "0 -2px" : "0 0",
        scale: pressed ? "0.98" : "1",
        boxShadow: hovered && !pressed ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transition: pressed ? "none" : releaseTransition,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <div className="h-36 bg-muted flex items-center justify-center">
        <Layers className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Design System</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-amber-500" />
            4.9
          </span>
        </div>
        <CardTitle className="mt-2">Fluent 2 Tokens</CardTitle>
        <CardDescription>
          Motion primitives and alias tokens for consistent animation across surfaces.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

/* ── Selection & Menus section ── */
function SelectDemo() {
  const [assignee, setAssignee] = useState("");

  return (
    <div className="space-y-1.5 w-full max-w-xs">
      <Label htmlFor="gallery-select">Assign to</Label>
      <Select value={assignee} onValueChange={setAssignee}>
        <SelectTrigger id="gallery-select" className="w-full">
          <SelectValue placeholder="Choose a team member…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Design</SelectLabel>
            <SelectItem value="alex">Alex Rivera</SelectItem>
            <SelectItem value="morgan">Morgan Chen</SelectItem>
            <SelectItem value="sam">Sam Okafor</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Engineering</SelectLabel>
            <SelectItem value="taylor">Taylor Kim</SelectItem>
            <SelectItem value="jordan">Jordan Patel</SelectItem>
            <SelectItem value="casey">Casey Nguyen</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {assignee && (
        <p className="text-xs text-muted-foreground">
          Assigned to <span className="font-medium text-foreground capitalize">{assignee.replace(/-/g, " ")}</span>
        </p>
      )}
    </div>
  );
}

function DropdownMenuDemo() {
  const [notifications, setNotifications] = useState(true);
  const [status, setStatus] = useState("online");
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <Label>Account menu</Label>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 ">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                JL
              </span>
              Jordan Lee
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setLastAction("profile")} className="gap-2">
              <User className="h-4 w-4" />
              Profile
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLastAction("settings")} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLastAction("billing")} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Preferences</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              <DropdownMenuRadioItem value="online">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  Online
                </span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="away">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  Away
                </span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dnd">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  Do not disturb
                </span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setLastAction("sign-out")}
              className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {lastAction && (
          <p className="text-xs text-muted-foreground">
            Selected:{" "}
            <span className="font-medium text-foreground capitalize">{lastAction.replace(/-/g, " ")}</span>
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground pt-0.5">
        Notifications {notifications ? "on" : "off"} · Status:{" "}
        <span className="capitalize text-foreground font-medium">{status}</span>
      </p>
    </div>
  );
}

function AppearanceDemo() {
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="space-y-4 w-full max-w-xs">
      <div className="space-y-1.5">
        <Label>Density</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between  gap-2">
              <span className="flex items-center gap-2">
                <Palette className="h-4 w-4 opacity-60" />
                <span className="capitalize">{density}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ── Accordion section ── */
const FAQ_ITEMS = [
  {
    value: "what-is-it",
    question: "What is this component library?",
    answer:
      "A curated set of accessible UI primitives built on Radix UI and styled with Tailwind CSS v4. Every component adapts to the active theme via CSS custom properties — switch themes in the sidebar to see them respond in real time.",
  },
  {
    value: "dark-mode",
    question: "How does multi-theme support work?",
    answer:
      "Themes are CSS files that override a shared set of semantic tokens (--primary, --card, --shadow-lg, etc.) scoped to a [data-theme] attribute on the root element. Swapping themes is a single setAttribute call — no re-renders required.",
  },
  {
    value: "spacing",
    question: "What controls the global spacing?",
    answer:
      "Tailwind v4 generates all spacing utilities as calc(var(--spacing) * N). The sidebar slider sets --spacing on :root at runtime, scaling every gap, padding, and margin across the entire UI simultaneously.",
  },
  {
    value: "accessibility",
    question: "Are these components accessible?",
    answer:
      "Yes. All interactive primitives use Radix UI under the hood, which handles ARIA roles, keyboard navigation, focus management, and screen reader announcements out of the box. Focus rings, colour contrast, and reduced-motion support are applied consistently.",
  },
  {
    value: "customise",
    question: "Can I add my own theme?",
    answer:
      "Create a new CSS file in src/themes/ that overrides the token set, import it in index.css, and add the entry to the THEMES array in ThemeSwitcher.tsx. The sidebar picker will include it automatically.",
  },
] as const;

function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="what-is-it" className="w-full max-w-lg">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ── Root ── */
export function ComponentGallery() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Component Gallery</h1>
        <p className="text-muted-foreground mt-1.5">
          One component per category — switch the theme to see how each responds.
        </p>
      </div>

      <Section>
        <SectionHeading
          title="Buttons"
          description="All variants, sizes, and states — color transitions use motion token timing."
        />
        <ButtonDemo />
      </Section>

      <Section>
        <SectionHeading
          title="Selection & Menus"
          description="Select for picking a value from a list; dropdown menu for contextual actions."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SelectDemo />
          </div>
          <div className="space-y-6">
            <DropdownMenuDemo />
          </div>
          <div className="space-y-6">
            <AppearanceDemo />
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          title="Display"
          description="Interactive cards — hover to lift, click anywhere to save. Elevation shadows match the active theme."
        />
        <CardDemo />
      </Section>

      <Section>
        <SectionHeading
          title="Overlay"
          description="Dialog with inline form, save loading state, and auto-close on success."
        />
        <DialogDemo />
      </Section>

      <Section>
        <SectionHeading
          title="Navigation"
          description="Tab switcher with sliding pill indicator — more tabs means more travel for the animation."
        />
        <Tabs defaultValue="overview" className="w-full max-w-lg">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Overview — project summary, recent activity, and quick stats live here.
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Analytics — charts, metrics, and usage trends would appear in this panel.
            </div>
          </TabsContent>
          <TabsContent value="members" className="mt-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Members — team roster, roles, and permission management live here.
            </div>
          </TabsContent>
          <TabsContent value="activity" className="mt-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Activity — audit log, recent changes, and timeline of events belong here.
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Settings — configuration options and preferences belong here.
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      <Section>
        <SectionHeading
          title="Accordion"
          description="Single-open FAQ — click any item to expand, click again or open another to collapse."
        />
        <AccordionDemo />
      </Section>

      <Section>
        <SectionHeading
          title="Toasts"
          description="Sonner notifications — fire different types to see them animate in and out."
        />
        <ToastDemo />
      </Section>
    </div>
  );
}

