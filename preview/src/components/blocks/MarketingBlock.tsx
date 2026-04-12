import { useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import volantOneImg from "@/assets/volant-one.jpg";
import volantTwoImg from "@/assets/volant-one_2.jpg";

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

// ── Car image with theme tint ─────────────────────────────────────────────────
function CarSilhouette({ className, src }: { className?: string; src?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-sm", className)}
      style={{ animation: "var(--anim-fade-in)", animationFillMode: "both" }}
    >
      <img
        src={src ?? volantOneImg}
        alt="Volant One"
        className="w-full object-cover"
        draggable={false}
      />
      {/* Primary color tint — shifts with each theme automatically */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--primary)", mixBlendMode: "color", opacity: 0.08 }}
        aria-hidden="true"
      />
      {/* Bottom fade into page background */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Spec selector card ────────────────────────────────────────────────────────
function SpecCard({
  label, desc, selected, onSelect,
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
      {/* ── Hero with full-bleed car image ── */}
      <section className="relative min-h-[75vh] overflow-hidden">
        <style>{HERO_KEYFRAMES}</style>

        {/* Car image — full bleed background */}
        <img
          src={volantTwoImg}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Scrim — heavier on the left where text sits, lighter on the right to show the car */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(to right, var(--background) 25%, color-mix(in oklch, var(--background) 60%, transparent) 55%, color-mix(in oklch, var(--background) 30%, transparent) 100%)" }}
        />

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          aria-hidden="true"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />

        {/* Gradient mesh — drifting color blobs */}
        <div
          className="absolute pointer-events-none"
          aria-hidden="true"
          style={{
            inset: "-30%",
            animation: "volant-drift 14s ease-in-out infinite",
            background: [
              "radial-gradient(ellipse 65% 55% at 12% 55%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%)",
              "radial-gradient(ellipse 60% 75% at 88% 25%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 55%)",
            ].join(", "),
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col justify-end min-h-[75vh] px-8 pb-12 pt-8">
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
                className="h-full bg-primary transition-[width]"
                style={{ width: `${(REMAINING / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          {/* Headline block — flush left */}
          <div className="max-w-xl" style={{ animation: "var(--anim-fade-in)" }}>
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-primary mb-5">
              Series I · 2026
            </p>
            <h1
              className="font-bold leading-[0.9] tracking-[-0.04em] text-foreground mb-7"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
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
                "px-5 py-2.5 rounded-full border border-foreground/25",
                "hover:border-foreground/60 hover:text-foreground transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              Configure yours
              <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features — staggered numeral list ── */}
      <section className="px-8 py-16 max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-16">
          The specification
        </p>
        <div className="space-y-16">
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className="grid items-start gap-8"
              style={{
                gridTemplateColumns: "72px 1fr",
                animation: "var(--anim-slide-up-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 1})`,
                animationFillMode: "both",
              }}
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
      <div className="px-8 py-7 flex items-center justify-between gap-4">
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
          <CarSilhouette className="w-full mb-10 mr-8" />

          <div className="space-y-10">
            {/* Powertrain */}
            <fieldset style={{ animation: "var(--anim-slide-up-in)", animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)", animationFillMode: "both" }}>
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
            <fieldset style={{ animation: "var(--anim-slide-up-in)", animationDelay: "calc(var(--motion-duration-ultra-fast) * 3)", animationFillMode: "both" }}>
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
            <fieldset style={{ animation: "var(--anim-slide-up-in)", animationDelay: "calc(var(--motion-duration-ultra-fast) * 4)", animationFillMode: "both" }}>
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
        <div className="px-6 py-8 flex flex-col min-h-[600px]">
          {/* Live spec summary */}
          <div className="mb-6 rounded-lg bg-muted/30 px-4 py-4">
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

          {/* Form area — stable height, no layout jump */}
          <div className="flex-1 flex flex-col min-h-[340px]">
            {formState === "success" ? (
              /* ── Success state ─────────────────────────────────── */
              <div
                className="flex flex-col gap-5"
                role="status"
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
