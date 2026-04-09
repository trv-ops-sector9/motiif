import { useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SettingsSection = "profile" | "notifications" | "appearance";

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

type SaveState = "idle" | "saving" | "saved";

function useSaveState() {
  const [state, setState] = useState<SaveState>("idle");

  const save = async () => {
    setState("saving");
    await new Promise((r) => setTimeout(r, 1300));
    setState("saved");
    setTimeout(() => setState("idle"), 2500);
  };

  return { state, save };
}

function SaveBar({
  saveState,
  onSave,
  onCancel,
  cancelLabel = "Cancel",
  saveLabel = "Save changes",
}: {
  saveState: SaveState;
  onSave: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
  saveLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-1">
      {saveState === "saved" && (
        <span className="flex items-center gap-1.5 text-sm text-primary">
          <CheckCircle className="h-4 w-4" />
          Saved!
        </span>
      )}
      {onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={saveState === "saving"}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        onClick={onSave}
        disabled={saveState === "saving" || saveState === "saved"}
      >
        {saveState === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : saveState === "saved" ? (
          "Saved"
        ) : (
          saveLabel
        )}
      </Button>
    </div>
  );
}

type TransitionPhase = "idle" | "exiting" | "entering";

export function SettingsBlock() {
  // activeSection: drives nav highlight (updates immediately on click)
  // displaySection: what's actually rendered (swaps only after exit animation)
  const [activeSection,  setActiveSection]  = useState<SettingsSection>("profile");
  const [displaySection, setDisplaySection] = useState<SettingsSection>("profile");
  const [phase,          setPhase]          = useState<TransitionPhase>("idle");
  const pending = useRef<SettingsSection>("profile");

  const navigate = (next: SettingsSection) => {
    if (next === activeSection || phase !== "idle") return;
    pending.current = next;
    setActiveSection(next);  // highlight updates immediately
    setPhase("exiting");
  };

  const handleAnimationEnd = () => {
    if (phase === "exiting") {
      // Exit done — swap content and start enter
      setDisplaySection(pending.current);
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center border-b px-6 shrink-0">
        <h1 className="text-base font-semibold">Settings</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-48 shrink-0 border-r p-3 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              className={cn(
                "w-full text-left rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === s.id
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* overflow-x-hidden clips the horizontal slide of page-enter/exit */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div
            key={displaySection}
            className="p-6"
            style={{
              animation: phase === "exiting"
                ? "var(--anim-page-exit)"
                : phase === "entering"
                  ? "var(--anim-page-enter)"
                  : undefined,
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {displaySection === "profile"       && <ProfileSection />}
            {displaySection === "notifications" && <NotificationsSection />}
            {displaySection === "appearance"    && <AppearanceSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { state, save } = useSaveState();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setBio("");
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your public profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              placeholder="Jordan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={state === "saving"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              placeholder="Lee"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={state === "saving"}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prof-email">Email</Label>
          <Input
            id="prof-email"
            type="email"
            placeholder="jordan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "saving"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="@jordanlee"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={state === "saving"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Input
            id="bio"
            placeholder="Tell us about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={state === "saving"}
          />
        </div>
        <Separator />
        <SaveBar saveState={state} onSave={save} onCancel={handleCancel} />
      </CardContent>
    </Card>
  );
}

function NotificationsSection() {
  const { state, save } = useSaveState();
  const [switches, setSwitches] = useState({
    comments: true,
    mentions: true,
    follows: true,
    updates: false,
  });
  const [checks, setChecks] = useState({
    security: true,
    billing: true,
    digest: false,
  });

  const toggleSwitch = (key: keyof typeof switches) =>
    setSwitches((s) => ({ ...s, [key]: !s[key] }));
  const toggleCheck = (key: keyof typeof checks) =>
    setChecks((c) => ({ ...c, [key]: !c[key] }));

  const SWITCH_ITEMS = [
    { id: "comments" as const, label: "Comments", desc: "When someone comments on your post" },
    { id: "mentions" as const, label: "Mentions", desc: "When someone @mentions you" },
    { id: "follows" as const, label: "New followers", desc: "When someone follows your account" },
    { id: "updates" as const, label: "Product updates", desc: "News and feature announcements" },
  ];

  const CHECK_ITEMS = [
    { id: "security" as const, label: "Security alerts" },
    { id: "billing" as const, label: "Billing reminders" },
    { id: "digest" as const, label: "Weekly digest" },
  ];

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {SWITCH_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium cursor-pointer">
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              id={`switch-${item.id}`}
              checked={switches[item.id]}
              onCheckedChange={() => toggleSwitch(item.id)}
              disabled={state === "saving"}
            />
          </div>
        ))}
        <Separator />
        <p className="text-sm font-medium">Also notify me about</p>
        <div className="space-y-2">
          {CHECK_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                id={`check-${item.id}`}
                checked={checks[item.id]}
                onCheckedChange={() => toggleCheck(item.id)}
                disabled={state === "saving"}
              />
              <Label htmlFor={`check-${item.id}`} className="text-sm cursor-pointer">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
        <Separator />
        <SaveBar
          saveState={state}
          onSave={save}
          saveLabel="Save preferences"
          onCancel={undefined}
        />
      </CardContent>
    </Card>
  );
}

function AppearanceSection() {
  const { state, save } = useSaveState();
  const [colorScheme, setColorScheme] = useState("system");
  const [density, setDensity] = useState("comfortable");

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the interface looks and feels. Use the sidebar controls for live theme switching.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Color scheme</Label>
          <RadioGroup value={colorScheme} onValueChange={setColorScheme} className="mt-2">
            {[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System (follow OS)" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`theme-${opt.value}`}
                  disabled={state === "saving"}
                />
                <Label
                  htmlFor={`theme-${opt.value}`}
                  className={cn("cursor-pointer", state === "saving" && "opacity-50")}
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-sm font-medium">Density</Label>
          <RadioGroup value={density} onValueChange={setDensity} className="mt-2">
            {["Compact", "Comfortable", "Spacious"].map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem
                  value={opt.toLowerCase()}
                  id={`density-${opt}`}
                  disabled={state === "saving"}
                />
                <Label
                  htmlFor={`density-${opt}`}
                  className={cn("cursor-pointer", state === "saving" && "opacity-50")}
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Separator />
        <SaveBar saveState={state} onSave={save} saveLabel="Apply" />
      </CardContent>
    </Card>
  );
}
