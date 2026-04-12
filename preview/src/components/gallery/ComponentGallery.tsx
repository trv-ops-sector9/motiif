import { useState } from "react";
import { CheckCircle, Loader2, Send, Star, Bell, ChevronDown, Layers, User, Settings, CreditCard, LogOut, AlertCircle, Info, Mail, Bold, Italic, Underline } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ── Shared layout helpers ── */

function ControlGroup({ label, name, value, options, onChange }: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-16 shrink-0 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-x-3 gap-y-1">
        {options.map(opt => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} className="h-3 w-3" />
            <Label htmlFor={`${name}-${opt.value}`} className="text-[11px] font-normal cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

/* ── Buttons ── */
type BtnVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type BtnSize    = "sm" | "default" | "lg" | "icon";
type BtnState   = "normal" | "loading" | "disabled";
type BtnIcon    = "none" | "leading" | "only";

function ButtonDemo() {
  const [variant,  setVariant]  = useState<BtnVariant>("default");
  const [size,     setSize]     = useState<BtnSize>("default");
  const [state,    setState]    = useState<BtnState>("normal");
  const [iconMode, setIconMode] = useState<BtnIcon>("none");

  const isLoading  = state === "loading";
  const isDisabled = state === "disabled";
  const isIconOnly = iconMode === "only" || size === "icon";

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Button variant={variant} size={size} disabled={isDisabled}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{!isIconOnly && "Loading…"}</>
            : isIconOnly
              ? <Bell className="h-4 w-4" />
              : <>{iconMode === "leading" && <Send className="h-4 w-4" />}Click me</>
          }
        </Button>
      </div>
      <div className="mt-auto space-y-2">
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

/* ── Card ── */
type CardLayout = "media" | "stat" | "profile";
type CardElevation = "sm" | "md" | "lg";
type CardInteraction = "static" | "hover-lift" | "pressable";

function CardDemo() {
  const [layout, setLayout] = useState<CardLayout>("media");
  const [elevation, setElevation] = useState<CardElevation>("sm");
  const [interaction, setInteraction] = useState<CardInteraction>("pressable");
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isHoverable = interaction === "hover-lift" || interaction === "pressable";
  const isPressable = interaction === "pressable";

  const shadowVar = `var(--shadow-${elevation})`;
  const hoverShadow = elevation === "sm" ? "var(--shadow-md)" : elevation === "md" ? "var(--shadow-lg)" : "var(--shadow-xl)";

  const releaseTransition = `
    translate var(--motion-duration-fast) var(--motion-curve-press-release),
    scale var(--motion-duration-fast) var(--motion-curve-press-release),
    box-shadow var(--motion-duration-fast) var(--motion-curve-press-release)
  `;

  const cardProps = {
    className: cn("select-none overflow-hidden", layout === "stat" ? "w-56" : "w-72"),
    style: {
      cursor: isHoverable ? "pointer" as const : "default" as const,
      translate: isPressable && pressed ? "0 1px" : isHoverable && hovered ? "0 -2px" : "0 0",
      scale: isPressable && pressed ? "0.98" : "1",
      boxShadow: isHoverable && hovered && !pressed ? hoverShadow : shadowVar,
      transition: pressed ? "none" : releaseTransition,
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); setPressed(false); },
    onMouseDown: () => isPressable && setPressed(true),
    onMouseUp: () => setPressed(false),
  };

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        {layout === "media" && (
          <Card {...cardProps}>
            <div className="h-32 bg-muted flex items-center justify-center">
              <Layers className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">Design System</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-current text-amber-500" /> 4.9
                </span>
              </div>
              <CardTitle className="text-base mt-1.5">Motion Tokens</CardTitle>
              <CardDescription className="text-xs">
                Duration, easing, and blur primitives for animation.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0 pb-4 px-6">
              <Button size="sm" className="w-full text-xs">View details</Button>
            </CardFooter>
          </Card>
        )}

        {layout === "stat" && (
          <Card {...cardProps}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Revenue</CardDescription>
              <div className="flex items-baseline gap-2 mt-1">
                <CardTitle className="text-2xl tabular-nums">$45,231</CardTitle>
                <span className="text-xs font-medium text-emerald-500">+20.1%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="flex gap-1 items-end h-10">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/20" style={{ height: `${h}%` }}>
                    <div className="w-full rounded-sm bg-primary mt-auto" style={{ height: `${Math.min(h + 10, 100)}%` }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {layout === "profile" && (
          <Card {...cardProps}>
            <CardHeader className="pb-3 items-center text-center">
              <Avatar className="h-14 w-14 mb-2">
                <AvatarFallback className="text-lg font-semibold">TP</AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">Traver Phillips</CardTitle>
              <CardDescription className="text-xs">Design Engineer</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="grid grid-cols-3 text-center divide-x">
                <div className="px-2">
                  <p className="text-sm font-semibold tabular-nums">128</p>
                  <p className="text-[10px] text-muted-foreground">Projects</p>
                </div>
                <div className="px-2">
                  <p className="text-sm font-semibold tabular-nums">4.9k</p>
                  <p className="text-[10px] text-muted-foreground">Followers</p>
                </div>
                <div className="px-2">
                  <p className="text-sm font-semibold tabular-nums">312</p>
                  <p className="text-[10px] text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6 gap-2">
              <Button size="sm" className="flex-1 text-xs">Follow</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs">Message</Button>
            </CardFooter>
          </Card>
        )}
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Layout" name="card-layout" value={layout}
          onChange={v => setLayout(v as CardLayout)}
          options={[
            { value: "media",   label: "Media"   },
            { value: "stat",    label: "Stat"     },
            { value: "profile", label: "Profile"  },
          ]}
        />
        <ControlGroup
          label="Shadow" name="card-elevation" value={elevation}
          onChange={v => setElevation(v as CardElevation)}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <ControlGroup
          label="Interact" name="card-interaction" value={interaction}
          onChange={v => setInteraction(v as CardInteraction)}
          options={[
            { value: "static",     label: "Static"     },
            { value: "hover-lift", label: "Hover lift"  },
            { value: "pressable",  label: "Pressable"  },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Dialog ── */
type DialogSize = "sm" | "default" | "lg";
type DialogState = "form" | "loading" | "success";

function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DialogSize>("default");
  const [demoState, setDemoState] = useState<DialogState>("form");
  const [name, setName] = useState("");

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) setDemoState("form");
  };

  const handleSave = async () => {
    setDemoState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setDemoState("success");
    setTimeout(() => setOpen(false), 900);
  };

  const sizeClass = size === "sm" ? "sm:max-w-sm" : size === "lg" ? "sm:max-w-xl" : "sm:max-w-md";

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Dialog open={open} onOpenChange={handleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent className={sizeClass}>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Update your display name. Changes are saved immediately.
              </DialogDescription>
            </DialogHeader>
            {demoState === "success" ? (
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
                    disabled={demoState === "loading"}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={demoState !== "form"}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={demoState !== "form"}>
                {demoState === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                ) : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Size" name="dialog-size" value={size}
          onChange={v => setSize(v as DialogSize)}
          options={[
            { value: "sm",      label: "Small"   },
            { value: "default", label: "Default" },
            { value: "lg",      label: "Large"   },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Dropdown Menu ── */

function DropdownMenuDemo() {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Actions
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" /> Profile
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" /> Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <CreditCard className="h-4 w-4" /> Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-xs text-muted-foreground text-center">Click to open — the slide animation responds to the active motion theme.</p>
    </div>
  );
}

/* ── Tabs ── */
type TabCount = "3" | "4" | "5" | "6" | "7";

function TabsDemo() {
  const [count, setCount] = useState<TabCount>("7");
  const n = parseInt(count);

  const allTabs = [
    { value: "overview",  label: "Overview",  content: "3 projects active. Last deployment 2 hours ago." },
    { value: "analytics", label: "Analytics", content: "1,247 req/min · 42ms avg latency · 99.97% uptime" },
    { value: "members",   label: "Members",   content: "Alex Kim — Owner · Sam Rivera — Editor · Jordan Lee — Viewer" },
    { value: "activity",  label: "Activity",  content: "Config updated 2h ago · Deploy triggered 5h ago · Branch merged 1d ago" },
    { value: "settings",  label: "Settings",  content: "Production — us-east-1 · Node 20 · 2 vCPU" },
    { value: "billing",   label: "Billing",   content: "Plan: Pro · $49/mo · Next invoice: Apr 15, 2026" },
    { value: "security",  label: "Security",  content: "2FA enabled · 3 active sessions · Last password change 30d ago" },
  ];
  const tabs = allTabs.slice(0, n);

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Tabs defaultValue="overview" className="w-full max-w-lg">
          <TabsList>
            {tabs.map(t => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(t => (
            <TabsContent key={t.value} value={t.value} className="mt-4">
              <div className="rounded-lg border bg-muted/40 p-6">
                <p className="text-sm text-muted-foreground">{t.content}</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Tabs" name="tab-count" value={count}
          onChange={v => setCount(v as TabCount)}
          options={[
            { value: "3", label: "3 tabs" },
            { value: "4", label: "4 tabs" },
            { value: "5", label: "5 tabs" },
            { value: "6", label: "6 tabs" },
            { value: "7", label: "7 tabs" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Accordion ── */
type AccordionMode = "single" | "multiple";

const FAQ_ITEMS = [
  {
    value: "what-is-it",
    question: "What is this component library?",
    answer: "A curated set of accessible UI primitives built on Radix UI and styled with Tailwind CSS v4. Every component adapts to the active theme via CSS custom properties.",
  },
  {
    value: "themes",
    question: "How does multi-theme support work?",
    answer: "Themes are CSS files that override semantic tokens scoped to a [data-theme] attribute. Swapping themes is a single setAttribute call — no re-renders required.",
  },
  {
    value: "spacing",
    question: "What controls the global spacing?",
    answer: "Tailwind v4 generates all spacing utilities as calc(var(--spacing) * N). Each visual theme sets its own --spacing value — from tight (Tactical) to generous (Guchi) — so density adapts automatically when you switch themes.",
  },
  {
    value: "accessibility",
    question: "Are these components accessible?",
    answer: "Yes. All interactive primitives use Radix UI which handles ARIA roles, keyboard navigation, focus management, and screen reader announcements.",
  },
] as const;

function AccordionDemo() {
  const [mode, setMode] = useState<AccordionMode>("single");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        {mode === "single" ? (
          <Accordion type="single" collapsible defaultValue="what-is-it" className="w-full max-w-lg">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Accordion type="multiple" defaultValue={["what-is-it"]} className="w-full max-w-lg">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Mode" name="accordion-mode" value={mode}
          onChange={v => setMode(v as AccordionMode)}
          options={[
            { value: "single",   label: "Single"   },
            { value: "multiple", label: "Multiple"  },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Toasts ── */
type ToastType = "default" | "success" | "error" | "warning" | "action";

function ToastDemo() {
  const [type, setType] = useState<ToastType>("default");

  const fireToast = () => {
    switch (type) {
      case "success": toast.success("Profile updated."); break;
      case "error":   toast.error("Payment failed. Please retry."); break;
      case "warning": toast.warning("Your session expires in 5 minutes."); break;
      case "action":  toast("File uploaded.", {
        description: "report-q4-2024.pdf · 2.4 MB",
        action: { label: "View", onClick: () => {} },
      }); break;
      default:        toast("Changes saved successfully."); break;
    }
  };

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Button variant="outline" onClick={fireToast}>Fire toast</Button>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Type" name="toast-type" value={type}
          onChange={v => setType(v as ToastType)}
          options={[
            { value: "default", label: "Default" },
            { value: "success", label: "Success" },
            { value: "error",   label: "Error"   },
            { value: "warning", label: "Warning" },
            { value: "action",  label: "Action"  },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Tooltip ── */
type TooltipSide = "top" | "right" | "bottom" | "left";

function TooltipDemo() {
  const [side, setSide] = useState<TooltipSide>("top");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Side" name="tooltip-side" value={side}
          onChange={v => setSide(v as TooltipSide)}
          options={[
            { value: "top",    label: "Top"    },
            { value: "right",  label: "Right"  },
            { value: "bottom", label: "Bottom" },
            { value: "left",   label: "Left"   },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Switch ── */
type SwitchLayout = "inline" | "stacked";

function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState<"enabled" | "disabled">("enabled");
  const [layout, setLayout] = useState<SwitchLayout>("inline");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        {layout === "inline" ? (
          <div className="flex items-center gap-3">
            <Switch
              id="switch-demo"
              checked={checked}
              onCheckedChange={setChecked}
              disabled={disabled === "disabled"}
            />
            <Label htmlFor="switch-demo" className="cursor-pointer">
              Enable notifications
            </Label>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-4">
            {[
              { id: "notif", label: "Notifications", desc: "Receive push notifications" },
              { id: "email", label: "Email digest", desc: "Weekly summary emails" },
              { id: "market", label: "Marketing", desc: "Product updates and tips" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={`switch-${item.id}`} className="cursor-pointer text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch id={`switch-${item.id}`} disabled={disabled === "disabled"} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Layout" name="switch-layout" value={layout}
          onChange={v => setLayout(v as SwitchLayout)}
          options={[
            { value: "inline",  label: "Inline"  },
            { value: "stacked", label: "Stacked" },
          ]}
        />
        <ControlGroup
          label="State" name="switch-state" value={disabled}
          onChange={v => setDisabled(v as "enabled" | "disabled")}
          options={[
            { value: "enabled",  label: "Enabled"  },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Input ── */
type InputState = "default" | "error" | "disabled";
type InputAdornment = "none" | "icon" | "prefix";

function InputDemo() {
  const [state, setState] = useState<InputState>("default");
  const [adornment, setAdornment] = useState<InputAdornment>("none");
  const [value, setValue] = useState("");

  const isError = state === "error";
  const isDisabled = state === "disabled";

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <div className="w-full max-w-xs space-y-1.5">
          <Label htmlFor="input-demo" className={isError ? "text-destructive" : ""}>
            Email address
          </Label>
          <div className="relative">
            {adornment === "icon" && (
              <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            {adornment === "prefix" && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            )}
            <Input
              id="input-demo"
              type="email"
              placeholder="you@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isDisabled}
              className={[
                adornment === "icon" ? "pl-8" : adornment === "prefix" ? "pl-7" : "",
                isError ? "border-destructive focus-visible:ring-destructive" : "",
              ].join(" ")}
            />
          </div>
          {isError && (
            <p className="text-xs text-destructive">Please enter a valid email address.</p>
          )}
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="State" name="input-state" value={state}
          onChange={v => setState(v as InputState)}
          options={[
            { value: "default",  label: "Default"  },
            { value: "error",    label: "Error"    },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <ControlGroup
          label="Adorn" name="input-adorn" value={adornment}
          onChange={v => setAdornment(v as InputAdornment)}
          options={[
            { value: "none",   label: "None"   },
            { value: "icon",   label: "Icon"   },
            { value: "prefix", label: "Prefix" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Select ── */

function SelectDemo() {
  const [value, setValue] = useState("");
  const [disabled, setDisabled] = useState<"enabled" | "disabled">("enabled");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <div className="w-full max-w-xs space-y-1.5">
          <Label>Assign to</Label>
          <Select value={value} onValueChange={setValue} disabled={disabled === "disabled"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a team member…" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Design</SelectLabel>
                <SelectItem value="alex">Alex Rivera</SelectItem>
                <SelectItem value="morgan">Morgan Chen</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Engineering</SelectLabel>
                <SelectItem value="taylor">Taylor Kim</SelectItem>
                <SelectItem value="jordan">Jordan Patel</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="State" name="select-state" value={disabled}
          onChange={v => setDisabled(v as "enabled" | "disabled")}
          options={[
            { value: "enabled",  label: "Enabled"  },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Checkbox ── */
type CheckboxLayout = "single" | "group";

function CheckboxDemo() {
  const [disabled, setDisabled] = useState<"enabled" | "disabled">("enabled");
  const [layout, setLayout] = useState<CheckboxLayout>("single");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        {layout === "single" ? (
          <div className="flex items-center gap-2.5">
            <Checkbox id="checkbox-single" disabled={disabled === "disabled"} />
            <Label htmlFor="checkbox-single" className="cursor-pointer">
              Accept terms and conditions
            </Label>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { id: "analytics", label: "Usage analytics" },
              { id: "crash",     label: "Crash reports" },
              { id: "marketing", label: "Marketing emails" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <Checkbox id={`cb-${item.id}`} disabled={disabled === "disabled"} />
                <Label htmlFor={`cb-${item.id}`} className="cursor-pointer text-sm font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Layout" name="checkbox-layout" value={layout}
          onChange={v => setLayout(v as CheckboxLayout)}
          options={[
            { value: "single", label: "Single"  },
            { value: "group",  label: "Group"   },
          ]}
        />
        <ControlGroup
          label="State" name="checkbox-state" value={disabled}
          onChange={v => setDisabled(v as "enabled" | "disabled")}
          options={[
            { value: "enabled",  label: "Enabled"  },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Badge ── */
type BadgeVariant = "default" | "secondary" | "outline" | "destructive";
type BadgeIcon = "none" | "icon";

function BadgeDemo() {
  const [variant, setVariant] = useState<BadgeVariant>("default");
  const [icon, setIcon] = useState<BadgeIcon>("none");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Badge variant={variant}>
          {icon === "icon" && <CheckCircle className="h-3 w-3" />}
          Badge
        </Badge>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Variant" name="badge-variant" value={variant}
          onChange={v => setVariant(v as BadgeVariant)}
          options={[
            { value: "default",     label: "Default"     },
            { value: "secondary",   label: "Secondary"   },
            { value: "outline",     label: "Outline"     },
            { value: "destructive", label: "Destructive" },
          ]}
        />
        <ControlGroup
          label="Icon" name="badge-icon" value={icon}
          onChange={v => setIcon(v as BadgeIcon)}
          options={[
            { value: "none", label: "None" },
            { value: "icon", label: "With icon" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Avatar ── */
type AvatarSize = "sm" | "default" | "lg";
type AvatarContent = "image" | "fallback";

function AvatarDemo() {
  const [size, setSize] = useState<AvatarSize>("default");
  const [content, setContent] = useState<AvatarContent>("fallback");

  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-12 w-12 text-base" : "h-8 w-8 text-sm";

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <div className="flex items-center gap-4">
          <Avatar className={sizeClass}>
            {content === "image" ? (
              <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Jordan" alt="Jordan" />
            ) : null}
            <AvatarFallback>JL</AvatarFallback>
          </Avatar>
          <Avatar className={sizeClass}>
            {content === "image" ? (
              <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Alex" alt="Alex" />
            ) : null}
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <Avatar className={sizeClass}>
            {content === "image" ? (
              <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Sam" alt="Sam" />
            ) : null}
            <AvatarFallback>SO</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Size" name="avatar-size" value={size}
          onChange={v => setSize(v as AvatarSize)}
          options={[
            { value: "sm",      label: "Small"   },
            { value: "default", label: "Default" },
            { value: "lg",      label: "Large"   },
          ]}
        />
        <ControlGroup
          label="Content" name="avatar-content" value={content}
          onChange={v => setContent(v as AvatarContent)}
          options={[
            { value: "fallback", label: "Initials" },
            { value: "image",    label: "Image"    },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Alert ── */
type AlertType = "info" | "destructive";

function AlertDemo() {
  const [type, setType] = useState<AlertType>("info");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Alert variant={type === "destructive" ? "destructive" : "default"} className="max-w-md">
          {type === "destructive" ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          <AlertTitle>{type === "destructive" ? "Error" : "Heads up"}</AlertTitle>
          <AlertDescription>
            {type === "destructive"
              ? "Your session has expired. Please sign in again to continue."
              : "You can switch themes and motion profiles in the sidebar to see how components respond."
            }
          </AlertDescription>
        </Alert>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Variant" name="alert-variant" value={type}
          onChange={v => setType(v as AlertType)}
          options={[
            { value: "info",        label: "Info"        },
            { value: "destructive", label: "Destructive" },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Drawer ── */
type DrawerSide = "top" | "bottom" | "left" | "right";

function DrawerDemo() {
  const [side, setSide] = useState<DrawerSide>("right");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>Edit profile</DrawerTitle>
              <DrawerDescription>Make changes to your profile. Click save when you're done.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="drawer-name">Name</Label>
                  <Input id="drawer-name" placeholder="Jordan Lee" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="drawer-email">Email</Label>
                  <Input id="drawer-email" placeholder="jordan@example.com" />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button>Save changes</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Side" name="drawer-side" value={side}
          onChange={v => setSide(v as DrawerSide)}
          options={[
            { value: "right",  label: "Right"  },
            { value: "left",   label: "Left"   },
            { value: "bottom", label: "Bottom" },
            { value: "top",    label: "Top"    },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Toggle Group ── */
type ToggleVariant = "default" | "outline";
type ToggleSize = "sm" | "default" | "lg";
type ToggleType = "single" | "multiple";

function ToggleGroupDemo() {
  const [variant, setVariant] = useState<ToggleVariant>("default");
  const [size, setSize] = useState<ToggleSize>("default");
  const [type, setType] = useState<ToggleType>("multiple");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        {type === "multiple" ? (
          <ToggleGroup type="multiple" variant={variant} size={size}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <ToggleGroup type="single" variant={variant} size={size}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Variant" name="toggle-variant" value={variant}
          onChange={v => setVariant(v as ToggleVariant)}
          options={[
            { value: "default", label: "Default" },
            { value: "outline", label: "Outline" },
          ]}
        />
        <ControlGroup
          label="Size" name="toggle-size" value={size}
          onChange={v => setSize(v as ToggleSize)}
          options={[
            { value: "sm",      label: "Small"   },
            { value: "default", label: "Default" },
            { value: "lg",      label: "Large"   },
          ]}
        />
        <ControlGroup
          label="Select" name="toggle-type" value={type}
          onChange={v => setType(v as ToggleType)}
          options={[
            { value: "single",   label: "Single"   },
            { value: "multiple", label: "Multiple"  },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Progress ── */

function ProgressDemo() {
  const [value, setValue] = useState(60);
  const [animated, setAnimated] = useState<"static" | "animated">("animated");

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 py-6 px-4 min-h-[120px]">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums">{value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${value}%`,
                transition: animated === "animated"
                  ? "width var(--motion-duration-slow) var(--motion-curve-navigation)"
                  : "none",
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <ControlGroup
          label="Value" name="progress-value" value={String(value)}
          onChange={v => setValue(parseInt(v))}
          options={[
            { value: "0",   label: "0%"   },
            { value: "25",  label: "25%"  },
            { value: "60",  label: "60%"  },
            { value: "100", label: "100%" },
          ]}
        />
        <ControlGroup
          label="Motion" name="progress-motion" value={animated}
          onChange={v => setAnimated(v as "static" | "animated")}
          options={[
            { value: "animated", label: "Animated" },
            { value: "static",   label: "Static"   },
          ]}
        />
      </div>
    </div>
  );
}

/* ── Root ── */

function DemoCard({ title, description, children, className }: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">{description}</p>
      <div className="flex-1 flex flex-col pb-3">
        {children}
      </div>
    </div>
  );
}

export function ComponentGallery() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Component Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Interactive demos — every component wired to the active motion and color tokens.
        </p>
      </div>

      <Separator />

      <DemoCard title="Accordion" description="Height animation — no spring curves, only smooth easing.">
        <AccordionDemo />
      </DemoCard>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Alert" description="Inline banners — info and destructive variants.">
          <AlertDemo />
        </DemoCard>
        <DemoCard title="Avatar" description="Image or fallback initials at different sizes.">
          <AvatarDemo />
        </DemoCard>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Badge" description="Inline status labels — all semantic color variants.">
          <BadgeDemo />
        </DemoCard>
        <DemoCard title="Checkbox" description="Background and check transition via motion tokens.">
          <CheckboxDemo />
        </DemoCard>
      </div>

      <Separator />

      <DemoCard title="Button" description="All variants, sizes, and states — color transitions use motion token timing.">
        <ButtonDemo />
      </DemoCard>

      <Separator />

      <DemoCard title="Card" description="Shadow elevation — hover lift and press use motion token curves.">
        <CardDemo />
      </DemoCard>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Dialog" description="Modal overlay with fade-in and expand animation.">
          <DialogDemo />
        </DemoCard>
        <DemoCard title="Drawer" description="Slides from any edge with motion tokens.">
          <DrawerDemo />
        </DemoCard>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Dropdown Menu" description="Slide animation responds to motion theme.">
          <DropdownMenuDemo />
        </DemoCard>
        <DemoCard title="Input" description="Text input with label, error state, and adornments.">
          <InputDemo />
        </DemoCard>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Progress" description="Fill animates with motion token duration and easing.">
          <ProgressDemo />
        </DemoCard>
        <DemoCard title="Select" description="Grouped options — uses slide animation tokens.">
          <SelectDemo />
        </DemoCard>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Switch" description="Thumb slides with motion token timing.">
          <SwitchDemo />
        </DemoCard>
        <DemoCard title="Toast" description="Sonner notifications — animate in and out.">
          <ToastDemo />
        </DemoCard>
      </div>

      <Separator />

      <DemoCard title="Tabs" description="Sliding pill indicator — more tabs means more travel for the animation.">
        <TabsDemo />
      </DemoCard>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-8">
        <DemoCard title="Toggle Group" description="Segmented toggles — color transitions use motion tokens.">
          <ToggleGroupDemo />
        </DemoCard>
        <DemoCard title="Tooltip" description="Hover tooltip with configurable placement.">
          <TooltipDemo />
        </DemoCard>
      </div>
    </div>
  );
}
