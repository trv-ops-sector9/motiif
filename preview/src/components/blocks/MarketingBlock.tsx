import { useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Page  = "landing" | "configure";
type Phase = "idle" | "exiting" | "entering";

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: "01",
    headline: "0–60 in 1.4 seconds.",
    body: "A carbon-fibre monocoque chassis and 1,000 bhp electric drivetrain built for one purpose: the fastest road-legal lap time ever recorded.",
  },
  {
    num: "02",
    headline: "147 produced. That's all.",
    body: "Every chassis numbered, every owner known. No second production run. No exceptions. If you're reading this, you're still in time.",
  },
  {
    num: "03",
    headline: "Ground-effect. Not aerodynamics.",
    body: "Over 2,000 kg of downforce at 150 mph. The Volant One doesn't fight the air — it uses it.",
  },
];

const SPECS = {
  powertrain: [
    { id: "standard",    label: "Standard",    desc: "1,000 bhp · 450 mi range" },
    { id: "performance", label: "Performance", desc: "1,200 bhp · 380 mi range" },
    { id: "track",       label: "Track",       desc: "1,400 bhp · circuit-only"  },
  ],
  exterior: [
    { id: "obsidian",  label: "Obsidian",  desc: "Satin black"          },
    { id: "arctic",    label: "Arctic",    desc: "Gloss white"          },
    { id: "bespoke",   label: "Bespoke",   desc: "Custom paint program" },
  ],
  interior: [
    { id: "carbon",   label: "Carbon",   desc: "Exposed weave + alcantara"  },
    { id: "heritage", label: "Heritage", desc: "Full grain leather"          },
    { id: "minimal",  label: "Minimal",  desc: "Stripped, weight-optimised" },
  ],
} as const;

type PowertrainId = typeof SPECS.powertrain[number]["id"];
type ExteriorId   = typeof SPECS.exterior[number]["id"];
type InteriorId   = typeof SPECS.interior[number]["id"];

const REMAINING = 53;
const TOTAL     = 200;

// ── Hero keyframes (React 19 <style> dedup) ───────────────────────────────────
const HERO_KEYFRAMES = `
@keyframes volant-drift {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(10%, 6%) scale(1.15); }
  66%  { transform: translate(-7%, 8%) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
`;

// ── SVG silhouette ────────────────────────────────────────────────────────────
function CarSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body fill */}
      <path
        d="M90 210 C90 210 120 210 155 207 L175 207 C190 207 205 198 220 183 L255 150 C272 128 305 112 360 107 L465 105 C510 105 548 112 578 128 L628 155 C648 168 665 190 670 198 L688 205 L700 208 L712 210 L90 210 Z"
        fill="var(--foreground)"
        opacity="0.04"
      />
      {/* Cabin fill */}
      <path
        d="M255 150 C265 135 285 118 322 110 L405 106 L488 106 C525 106 550 116 574 134 L614 155 L255 150 Z"
        fill="var(--primary)"
        opacity="0.08"
      />
      {/* Cabin outline */}
      <path
        d="M255 150 C265 135 285 118 322 110 L405 106 L488 106 C525 106 550 116 574 134 L614 155"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body outline */}
      <path
        d="M108 208 L160 207 C178 207 198 202 215 188 L255 150 L614 155 L648 176 C662 186 672 198 680 204 L706 208"
        stroke="var(--foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      {/* Rear overhang */}
      <path d="M90 210 L78 210 L76 214 L92 214 Z" fill="var(--foreground)" opacity="0.18" />
      {/* Front splitter */}
      <path d="M710 208 L748 210 L748 214 L708 214 Z" fill="var(--foreground)" opacity="0.18" />
      {/* Headlight */}
      <path d="M718 186 L738 190 L736 198 L717 194 Z" fill="var(--primary)" opacity="0.5" />
      {/* Taillight */}
      <path d="M96 185 L80 188 L81 196 L98 193 Z" fill="var(--primary)" opacity="0.5" />
      {/* Door seam A */}
      <path d="M300 152 L287 208" stroke="var(--foreground)" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.18" />
      {/* Door seam B */}
      <path d="M450 153 L462 208" stroke="var(--foreground)" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.18" />
      {/* Rear wheel */}
      <circle cx="210" cy="214" r="32" stroke="var(--foreground)" strokeWidth="1.5" fill="none" opacity="0.55" />
      <circle cx="210" cy="214" r="20" stroke="var(--foreground)" strokeWidth="1"   fill="none" opacity="0.25" />
      <circle cx="210" cy="214" r="5"  fill="var(--foreground)" opacity="0.35" />
      {/* Front wheel */}
      <circle cx="618" cy="214" r="32" stroke="var(--foreground)" strokeWidth="1.5" fill="none" opacity="0.55" />
      <circle cx="618" cy="214" r="20" stroke="var(--foreground)" strokeWidth="1"   fill="none" opacity="0.25" />
      <circle cx="618" cy="214" r="5"  fill="var(--foreground)" opacity="0.35" />
      {/* Ground shadow */}
      <ellipse cx="210" cy="248" rx="42" ry="5" fill="var(--foreground)" opacity="0.05" />
      <ellipse cx="618" cy="248" rx="42" ry="5" fill="var(--foreground)" opacity="0.05" />
      {/* Ground line */}
      <line x1="40" y1="248" x2="780" y2="248" stroke="var(--foreground)" strokeWidth="0.5" opacity="0.12" />
    </svg>
  );
}

// ── Spec selector card ────────────────────────────────────────────────────────
function SpecCard({
  id, label, desc, selected, onSelect,
}: {
  id: string; label: string; desc: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left px-3.5 py-3 rounded-lg border transition-all cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span
          className={cn(
            "h-3 w-3 rounded-full border-2 shrink-0 transition-all",
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30 bg-transparent",
          )}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
    </button>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-full">
      <style>{HERO_KEYFRAMES}</style>

      {/* ── Hero ── */}
      {/* ── Hero ── */}
      {/* Grid baked into section bg — static, no z-index needed */}
      <section
        className="relative min-h-[88vh] overflow-hidden"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage: [
            "linear-gradient(color-mix(in oklch, var(--border) var(--volant-grid-mix, 80%), transparent) 1px, transparent 1px)",
            "linear-gradient(90deg, color-mix(in oklch, var(--border) var(--volant-grid-mix, 80%), transparent) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
        }}
      >
        {/* Gradient mesh — extended past edges so drift never clips */}
        <div
          className="absolute pointer-events-none"
          aria-hidden="true"
          style={{
            inset: "-30%",
            animation: "volant-drift 14s ease-in-out infinite",
            background: [
              "radial-gradient(ellipse 65% 55% at 12% 55%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 60%)",
              "radial-gradient(ellipse 60% 75% at 88% 25%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 55%)",
              "radial-gradient(ellipse 35% 35% at 55% 85%, color-mix(in oklch, var(--muted-foreground) 6%, transparent), transparent 50%)",
            ].join(", "),
          }}
        />

        {/* Content — position relative paints above gradient */}
        <div className="relative flex flex-col justify-end min-h-[88vh] px-8 pb-20 pt-8">
          {/* Brand mark */}
          <div className="absolute top-8 left-8">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
              Volant
            </span>
          </div>

          {/* Scarcity indicator */}
          <div className="absolute top-8 right-8 text-right">
            <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-1.5">
              {REMAINING} of {TOTAL} remaining
            </p>
            <div className="h-px w-28 bg-border overflow-hidden ml-auto">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(REMAINING / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          {/* Headline block — flush left, asymmetric */}
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-primary mb-5">
              Series I · 2026
            </p>
            <h1
              className="font-bold leading-[0.9] tracking-[-0.04em] text-foreground mb-7"
              style={{ fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)" }}
            >
              Amplified.<br />
              Electric.<br />
              Uncompromised.
            </h1>
            <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed mb-10">
              0–60 in 1.4 seconds. 147 produced.<br />
              Ground-effect aerodynamics.<br />
              The Volant One exists for those who require more.
            </p>
            <button
              onClick={onNavigate}
              className={cn(
                "group inline-flex items-center gap-3 cursor-pointer",
                "text-[13px] font-semibold tracking-wide text-foreground",
                "border-b border-foreground/60 pb-0.5",
                "hover:border-primary hover:text-primary transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              )}
            >
              Configure yours
              <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features — staggered numeral list ── */}
      <section className="px-8 py-24 max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-16">
          The specification
        </p>
        <div className="space-y-16">
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="grid items-start gap-8"
              style={{ gridTemplateColumns: "72px 1fr" }}
            >
              <span
                className="font-bold text-foreground/10 leading-none select-none tabular-nums"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}
                aria-hidden="true"
              >
                {f.num}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-2">
                  {f.headline}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA bar ── */}
      <div className="border-t px-8 py-7 flex items-center justify-between gap-4">
        <p className="text-[11px] text-muted-foreground">
          Deliveries begin Q4 2026 · UK &amp; EU
        </p>
        <Button onClick={onNavigate}>
          Reserve your position
          <IconArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Configure page ────────────────────────────────────────────────────────────
type Selections = {
  powertrain: PowertrainId;
  exterior:   ExteriorId;
  interior:   InteriorId;
};
type FormState = "idle" | "loading" | "success";

function ConfigurePage({ onNavigate }: { onNavigate: () => void }) {
  const [specs, setSpecs] = useState<Selections>({
    powertrain: "performance",
    exterior:   "obsidian",
    interior:   "carbon",
  });
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [nameErr,    setNameErr]    = useState("");
  const [emailErr,   setEmailErr]   = useState("");
  const [formState,  setFormState]  = useState<FormState>("idle");
  const [refNum,     setRefNum]     = useState("");

  const selectedPowertrain = SPECS.powertrain.find(s => s.id === specs.powertrain)!;
  const selectedExterior   = SPECS.exterior.find(s => s.id === specs.exterior)!;
  const selectedInterior   = SPECS.interior.find(s => s.id === specs.interior)!;

  const validate = () => {
    let ok = true;
    if (!name.trim())  { setNameErr("Name is required.");          ok = false; } else setNameErr("");
    if (!email.trim()) { setEmailErr("Email is required.");         ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Enter a valid email."); ok = false; }
    else setEmailErr("");
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormState("loading");
    await new Promise(r => setTimeout(r, 1800));
    setRefNum(`VOL-${String(Math.floor(Math.random() * 9000) + 1000)}`);
    setFormState("success");
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b">
        <button
          onClick={onNavigate}
          aria-label="Back to brand page"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md cursor-pointer shrink-0",
            "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-sm font-semibold tracking-tight">Volant One — Configuration</p>
          <p className="text-[11px] text-muted-foreground">Series I · {REMAINING} positions remaining</p>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-[1fr_320px]">
        {/* Left: silhouette + spec pickers */}
        <div className="px-8 py-10 border-r">
          <CarSilhouette className="w-full max-w-2xl mb-12" />

          <div className="max-w-2xl space-y-10">
            {/* Powertrain */}
            <fieldset>
              <legend className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground mb-3">
                Powertrain
              </legend>
              <div className="grid sm:grid-cols-3 gap-2">
                {SPECS.powertrain.map(opt => (
                  <SpecCard
                    key={opt.id}
                    {...opt}
                    selected={specs.powertrain === opt.id}
                    onSelect={() => setSpecs(s => ({ ...s, powertrain: opt.id }))}
                  />
                ))}
              </div>
            </fieldset>

            {/* Exterior */}
            <fieldset>
              <legend className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground mb-3">
                Exterior
              </legend>
              <div className="grid sm:grid-cols-3 gap-2">
                {SPECS.exterior.map(opt => (
                  <SpecCard
                    key={opt.id}
                    {...opt}
                    selected={specs.exterior === opt.id}
                    onSelect={() => setSpecs(s => ({ ...s, exterior: opt.id }))}
                  />
                ))}
              </div>
            </fieldset>

            {/* Interior */}
            <fieldset>
              <legend className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground mb-3">
                Interior
              </legend>
              <div className="grid sm:grid-cols-3 gap-2">
                {SPECS.interior.map(opt => (
                  <SpecCard
                    key={opt.id}
                    {...opt}
                    selected={specs.interior === opt.id}
                    onSelect={() => setSpecs(s => ({ ...s, interior: opt.id }))}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Right: summary + form */}
        <div className="px-8 py-10 flex flex-col">
          {/* Live spec summary */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground mb-4">
              Your configuration
            </p>
            <div className="space-y-0">
              {[
                { label: "Powertrain", value: `${selectedPowertrain.label} — ${selectedPowertrain.desc}` },
                { label: "Exterior",   value: `${selectedExterior.label} — ${selectedExterior.desc}`     },
                { label: "Interior",   value: `${selectedInterior.label} — ${selectedInterior.desc}`     },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0"
                >
                  <span className="text-[12px] text-muted-foreground shrink-0">{row.label}</span>
                  <span className="text-[12px] font-medium text-right leading-snug">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-6 flex-1 flex flex-col">
            {formState === "success" ? (
              /* ── Success state ─────────────────────────────────── */
              <div
                className="flex flex-col gap-5"
                style={{ animation: "var(--anim-slide-up-in)" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold mb-1.5">Position secured.</h2>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Your reservation is confirmed. Expect contact from the Volant team within 48 hours.
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-3.5">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-1">
                    Reservation reference
                  </p>
                  <p className="text-xl font-bold tracking-[0.08em]">{refNum}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {selectedPowertrain.label} · {selectedExterior.label} · {selectedInterior.label}
                </p>
              </div>
            ) : (
              /* ── Reserve form ──────────────────────────────────── */
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                  Secure your position
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="vol-name" className="text-[12px]">Full name</Label>
                  <Input
                    id="vol-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => { if (!name.trim()) setNameErr("Name is required."); else setNameErr(""); }}
                    placeholder="James Whitmore"
                    autoComplete="name"
                    aria-describedby={nameErr ? "vol-name-err" : undefined}
                    className={cn(nameErr && "border-destructive focus-visible:ring-destructive")}
                  />
                  {nameErr && (
                    <p id="vol-name-err" role="alert" className="text-[11px] text-destructive">{nameErr}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vol-email" className="text-[12px]">Email address</Label>
                  <Input
                    id="vol-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => {
                      if (!email.trim()) setEmailErr("Email is required.");
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setEmailErr("Enter a valid email.");
                      else setEmailErr("");
                    }}
                    placeholder="james@example.com"
                    autoComplete="email"
                    aria-describedby={emailErr ? "vol-email-err" : undefined}
                    className={cn(emailErr && "border-destructive focus-visible:ring-destructive")}
                  />
                  {emailErr && (
                    <p id="vol-email-err" role="alert" className="text-[11px] text-destructive">{emailErr}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-1"
                  disabled={formState === "loading"}
                >
                  {formState === "loading" ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Confirming reservation…
                    </>
                  ) : (
                    <>
                      Reserve your Volant One
                      <IconArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  A £10,000 deposit will be requested upon confirmation.
                  <br />Fully refundable within 14 days.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function MarketingBlock() {
  const [activePage,  setActivePage]  = useState<Page>("landing");
  const [displayPage, setDisplayPage] = useState<Page>("landing");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const pending = useRef<Page>("landing");

  const navigate = (next: Page) => {
    if (next === activePage || phase !== "idle") return;
    pending.current = next;
    setActivePage(next);
    setPhase("exiting");
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (phase === "exiting") {
      setDisplayPage(pending.current);
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  return (
    <div className="min-h-full overflow-hidden">
      <div
        key={displayPage}
        style={{
          animation:
            phase === "exiting"  ? "var(--anim-page-exit)"  :
            phase === "entering" ? "var(--anim-page-enter)" :
            undefined,
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {displayPage === "landing"
          ? <LandingPage   onNavigate={() => navigate("configure")} />
          : <ConfigurePage onNavigate={() => navigate("landing")}   />
        }
      </div>
    </div>
  );
}
