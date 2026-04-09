import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Zap, Shield, Layers, Plus, CheckCheck, AlertTriangle, Activity, Users2, Flame, Clock, TrendingUp, GitMerge, MessageSquare } from "lucide-react";
import { RadialBar, RadialBarChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// ── Page transition state ─────────────────────────────────────────────────────
type Page  = "marketing" | "workspace";
type Phase = "idle" | "exiting" | "entering";

// ── Marketing page data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    title: "Lightning fast",
    desc: "Built on Vite and optimized for production. Zero unnecessary re-renders and tree-shaking by default.",
  },
  {
    icon: Shield,
    title: "Accessible by default",
    desc: "Every component ships with ARIA attributes, keyboard navigation, and screen-reader support out of the box.",
  },
  {
    icon: Layers,
    title: "Fully composable",
    desc: "Mix, match, and extend. Each primitive is headless at heart — bring your own styles or use ours.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The theme system is exactly what I needed. Switching from Fluent to a dark minimal aesthetic took less than 30 seconds.",
    author: "Alex Kim",
    role: "Senior Frontend Engineer",
    initials: "AK",
  },
  {
    quote: "Finally a component library that doesn't fight you when you want to change the radius or tweak the color palette.",
    author: "Sam Rivera",
    role: "Design Systems Lead",
    initials: "SR",
  },
];

// ── Workspace page data ───────────────────────────────────────────────────────
const STATS = [
  { label: "Total tasks",   value: "64", icon: CheckCheck,    delta: "+8 this week" },
  { label: "Completed",     value: "41", icon: Activity,      delta: "+12 vs last"  },
  { label: "Overdue",       value: "8",  icon: AlertTriangle, delta: "↓ 2 resolved" },
  { label: "Contributors",  value: "5",  icon: Users2,        delta: "2 active now" },
] as const;

type ProjectStatus = "In progress" | "In review" | "Blocked" | "Shipped";

const STATUS_BADGE: Record<ProjectStatus, "secondary" | "outline" | "destructive" | "default"> = {
  "In progress": "secondary",
  "In review":   "outline",
  "Blocked":     "destructive",
  "Shipped":     "default",
};

const PROJECTS: { name: string; owner: string; status: ProjectStatus; progress: number; tag: string; ago: string }[] = [
  { name: "Motion token system",      owner: "AK", status: "In progress", progress: 72,  tag: "Design systems", ago: "2h ago" },
  { name: "Component library v3",     owner: "SR", status: "In review",   progress: 91,  tag: "Engineering",    ago: "5h ago" },
  { name: "Mobile onboarding flow",   owner: "JL", status: "In progress", progress: 34,  tag: "Product",        ago: "1d ago" },
  { name: "API v2 migration",         owner: "CN", status: "Blocked",     progress: 55,  tag: "Backend",        ago: "2d ago" },
  { name: "Accessibility audit",      owner: "MC", status: "Shipped",     progress: 100, tag: "QA",             ago: "3d ago" },
];

const TEAM = [
  { name: "Alex Kim",      role: "Design Lead", initials: "AK", active: true  },
  { name: "Sam Rivera",    role: "Frontend",    initials: "SR", active: true  },
  { name: "Jordan Lee",    role: "Product",     initials: "JL", active: false },
  { name: "Casey Nguyen",  role: "Backend",     initials: "CN", active: false },
  { name: "Morgan Chen",   role: "Design",      initials: "MC", active: false },
];

const ACTIVITY = [
  { icon: CheckCheck,    text: "Accessibility audit shipped to production",  user: "MC", time: "just now", accent: "text-green-500"       },
  { icon: AlertTriangle, text: "API migration blocked on auth handshake",     user: "CN", time: "1h ago",   accent: "text-destructive"     },
  { icon: GitMerge,      text: "PR #42 merged — component library v3 RC",    user: "SR", time: "2h ago",   accent: "text-primary"         },
  { icon: Plus,          text: "New task: dark mode token audit",             user: "AK", time: "3h ago",   accent: "text-primary"         },
  { icon: MessageSquare, text: "Comment thread on mobile onboarding flow",    user: "JL", time: "5h ago",   accent: "text-muted-foreground" },
  { icon: Activity,      text: "Component library review session started",    user: "SR", time: "1d ago",   accent: "text-muted-foreground" },
];

// Radial chart data — one bar per weekday
const velocityChartData = [
  { day: "Mon", completed: 8,  fill: "var(--color-mon)" },
  { day: "Tue", completed: 11, fill: "var(--color-tue)" },
  { day: "Wed", completed: 6,  fill: "var(--color-wed)" },
  { day: "Thu", completed: 13, fill: "var(--color-thu)" },
  { day: "Fri", completed: 9,  fill: "var(--color-fri)" },
];

const velocityChartConfig = {
  completed: { label: "Tasks completed" },
  mon: { label: "Monday",    color: "var(--chart-1)" },
  tue: { label: "Tuesday",   color: "var(--chart-2)" },
  wed: { label: "Wednesday", color: "var(--chart-3)" },
  thu: { label: "Thursday",  color: "var(--chart-4)" },
  fri: { label: "Friday",    color: "var(--chart-5)" },
} satisfies ChartConfig;

type Priority = "P0" | "P1" | "P2" | "P3";
const PRIORITY_COLOR: Record<Priority, string> = {
  P0: "bg-destructive text-destructive-foreground",
  P1: "bg-orange-500 text-white",
  P2: "bg-primary text-primary-foreground",
  P3: "bg-muted text-muted-foreground",
};

const PRIORITIES: { label: string; priority: Priority; due: string; assignee: string }[] = [
  { label: "Ship token documentation",         priority: "P0", due: "Today",     assignee: "AK" },
  { label: "Fix accordion in dense theme",     priority: "P1", due: "Tomorrow",  assignee: "SR" },
  { label: "Write v1 migration guide",         priority: "P1", due: "This week", assignee: "MC" },
  { label: "Add integration tests for tokens", priority: "P2", due: "Next week", assignee: "CN" },
  { label: "Performance benchmark suite",      priority: "P3", due: "Backlog",   assignee: "JL" },
];

type DeadlineStatus = "on-track" | "at-risk" | "overdue";
const DEADLINE_COLOR: Record<DeadlineStatus, string> = {
  "on-track": "bg-green-500/15 text-green-600",
  "at-risk":  "bg-orange-500/15 text-orange-600",
  "overdue":  "bg-destructive/15 text-destructive",
};

const DEADLINES: { name: string; date: string; daysLeft: number; status: DeadlineStatus }[] = [
  { name: "Beta launch",    date: "Q2 W1",  daysLeft: 4,  status: "at-risk"  },
  { name: "Docs freeze",    date: "Q2 W2",  daysLeft: 8,  status: "on-track" },
  { name: "v1.0 RC",        date: "Q2 W4",  daysLeft: 18, status: "on-track" },
  { name: "Public release", date: "Q2 W6",  daysLeft: 32, status: "on-track" },
];

const CATEGORY_BREAKDOWN = [
  { label: "Design systems", count: 18, pct: 72 },
  { label: "Engineering",    count: 14, pct: 56 },
  { label: "Product",        count: 9,  pct: 36 },
  { label: "Backend",        count: 7,  pct: 28 },
  { label: "QA",             count: 5,  pct: 20 },
];

// ── Sub-pages ─────────────────────────────────────────────────────────────────

function MarketingPage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-full overflow-y-auto">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          Now in public beta
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Components that adapt<br />to your brand
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A theme-first component library built on shadcn/ui, Tailwind v4, and Radix primitives.
          Switch between design systems without touching a single component.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={onNavigate}>
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={onNavigate}>
            View on GitHub
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">
            Everything you need
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Opinionated defaults with escape hatches everywhere. Ship fast, customize later.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} interactive className="border bg-card" onClick={onNavigate}>
                  <CardHeader className="pb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-1">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          Loved by developers
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.author} className="bg-card">
              <CardContent className="pt-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground mb-4">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Motif. MIT license.</p>
          <div className="flex gap-5">
            {["Docs", "GitHub", "Changelog", "Privacy"].map((link) => (
              <button key={link} onClick={onNavigate} className="hover:text-foreground transition-colors cursor-pointer">
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkspacePage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onNavigate} aria-label="Back to landing page">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">5 active · last updated 2h ago</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 pt-5 pb-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} interactive>
              <CardHeader className="pb-4">
                <Icon className="h-4 w-4 text-muted-foreground mb-2" />
                <CardTitle className="text-2xl font-bold tabular-nums">{s.value}</CardTitle>
                <CardDescription className="text-xs">{s.label}</CardDescription>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{s.delta}</p>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Projects + Team */}
      <div className="grid sm:grid-cols-[1fr_220px] gap-4 px-6 pb-4">
        {/* Project list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Active projects</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                {/* Owner avatar */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {p.owner}
                </div>

                {/* Name + tag */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.tag}</p>
                </div>

                {/* Progress */}
                <div className="hidden sm:flex flex-col items-end gap-1 w-24 shrink-0">
                  <span className="text-[11px] text-muted-foreground tabular-nums">{p.progress}%</span>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status + time */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={STATUS_BADGE[p.status]} className="text-[10px] h-4 px-1.5">
                    {p.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{p.ago}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team roster */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Team</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            {TEAM.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {m.initials}
                  </div>
                  {m.active && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.role}</p>
                </div>
              </div>
            ))}

            <div className="px-3 pt-3 mt-1 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Plus className="h-3 w-3" />
                Invite member
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly velocity (radial) + Activity feed */}
      <div className="grid sm:grid-cols-2 gap-4 px-6 pb-4">
        {/* Radial bar chart — tasks completed per weekday */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-sm font-semibold">Weekly velocity</CardTitle>
            <CardDescription className="text-[11px]">Tasks completed · Mon – Fri</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={velocityChartConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <RadialBarChart data={velocityChartData} innerRadius={30} outerRadius={90}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="day" />}
                />
                <RadialBar dataKey="completed" background />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-1 pb-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              Trending up this week <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="flex gap-3">
              {velocityChartData.map((d) => (
                <span key={d.day} className="flex items-center gap-1 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full inline-block" style={{ background: d.fill }} />
                  {d.day}
                </span>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", a.accent)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug truncate">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.user} · {a.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Priority queue + Deadlines + Category breakdown */}
      <div className="grid sm:grid-cols-[1fr_200px_200px] gap-4 px-6 pb-6">
        {/* Priority queue */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Priority queue</CardTitle>
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            {PRIORITIES.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", PRIORITY_COLOR[p.priority])}>
                  {p.priority}
                </span>
                <p className="flex-1 text-xs truncate">{p.label}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{p.due}</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                    {p.assignee}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Deadlines</CardTitle>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 space-y-2.5">
            {DEADLINES.map((d, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium truncate">{d.name}</p>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 shrink-0", DEADLINE_COLOR[d.status])}>
                    {d.daysLeft}d
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{d.date}</span>
                  <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", d.status === "at-risk" ? "bg-orange-500" : "bg-green-500")}
                      style={{ width: `${Math.max(8, 100 - (d.daysLeft / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">By category</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 space-y-2.5">
            {CATEGORY_BREAKDOWN.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-muted-foreground truncate">{c.label}</p>
                  <span className="text-[11px] font-semibold tabular-nums ml-2 shrink-0">{c.count}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Root with page transitions ────────────────────────────────────────────────

export function MarketingBlock() {
  const [activePage,  setActivePage]  = useState<Page>("marketing");
  const [displayPage, setDisplayPage] = useState<Page>("marketing");
  const [phase,       setPhase]       = useState<Phase>("idle");
  const pending = useRef<Page>("marketing");

  const navigate = (next: Page) => {
    if (next === activePage || phase !== "idle") return;
    pending.current = next;
    setActivePage(next);
    setPhase("exiting");
  };

  const handleAnimationEnd = () => {
    if (phase === "exiting") {
      setDisplayPage(pending.current);
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  const goToWorkspace  = () => navigate("workspace");
  const goToMarketing  = () => navigate("marketing");

  return (
    <div className="min-h-full overflow-hidden">
      <div
        key={displayPage}
        style={{
          animation: phase === "exiting"
            ? "var(--anim-page-exit)"
            : phase === "entering"
              ? "var(--anim-page-enter)"
              : undefined,
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {displayPage === "marketing"
          ? <MarketingPage  onNavigate={goToWorkspace} />
          : <WorkspacePage  onNavigate={goToMarketing} />
        }
      </div>
    </div>
  );
}
