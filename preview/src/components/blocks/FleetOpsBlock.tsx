import { useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import {
  IconCarSuv,
  IconBatteryCharging,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconActivity,
  IconNavigation,
  IconGauge,
  IconArrowsUpDown,
  IconSearch,
  IconShield,
  IconRadar,
  IconArrowLeft,
  IconTemperature,
  IconCpu,
  IconEye,
  IconWifi,
  IconFlame,
  IconMap,
} from "@tabler/icons-react";

import { cssMs, cssCurve } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ─── Data ────────────────────────────────────────────────────────────────────

type VehicleStatus = "Active" | "Idle" | "Charging" | "Maintenance" | "Offline";

interface Vehicle {
  id: string;
  status: VehicleStatus;
  location: string;
  battery: number;
  currentTrip: string;
  lastPing: string;
  coords: { x: number; y: number };
}

const STATUS_VARIANT: Record<VehicleStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Active:      "default",
  Idle:        "secondary",
  Charging:    "outline",
  Maintenance: "outline",
  Offline:     "destructive",
};

const VEHICLES: Vehicle[] = [
  { id: "AV-001", status: "Active",      location: "Market St & 4th",     battery: 87, currentTrip: "TRP-4821", lastPing: "2s ago",  coords: { x: 38, y: 52 } },
  { id: "AV-002", status: "Active",      location: "Mission Bay Loop",    battery: 64, currentTrip: "TRP-4819", lastPing: "5s ago",  coords: { x: 62, y: 72 } },
  { id: "AV-003", status: "Charging",    location: "Depot A — Bay 3",    battery: 42, currentTrip: "—",        lastPing: "1m ago",  coords: { x: 78, y: 85 } },
  { id: "AV-004", status: "Active",      location: "Embarcadero & King",  battery: 91, currentTrip: "TRP-4823", lastPing: "3s ago",  coords: { x: 72, y: 58 } },
  { id: "AV-005", status: "Idle",        location: "Soma Standby Zone",   battery: 78, currentTrip: "—",        lastPing: "30s ago", coords: { x: 48, y: 62 } },
  { id: "AV-006", status: "Maintenance", location: "Depot B — Bay 1",    battery: 55, currentTrip: "—",        lastPing: "12m ago", coords: { x: 22, y: 88 } },
  { id: "AV-007", status: "Active",      location: "Potrero & 16th",     battery: 73, currentTrip: "TRP-4825", lastPing: "1s ago",  coords: { x: 55, y: 78 } },
  { id: "AV-008", status: "Offline",     location: "Last: Depot A",       battery: 12, currentTrip: "—",        lastPing: "2h ago",  coords: { x: 80, y: 88 } },
  { id: "AV-009", status: "Active",      location: "Hayes Valley",        battery: 82, currentTrip: "TRP-4827", lastPing: "4s ago",  coords: { x: 28, y: 42 } },
  { id: "AV-010", status: "Charging",    location: "Depot A — Bay 7",    battery: 29, currentTrip: "—",        lastPing: "3m ago",  coords: { x: 82, y: 82 } },
];

const TRIP_DATA = [
  { hour: "6 AM",  trips: 12 },
  { hour: "7 AM",  trips: 28 },
  { hour: "8 AM",  trips: 64 },
  { hour: "9 AM",  trips: 78 },
  { hour: "10 AM", trips: 52 },
  { hour: "11 AM", trips: 41 },
  { hour: "12 PM", trips: 58 },
  { hour: "1 PM",  trips: 63 },
  { hour: "2 PM",  trips: 49 },
  { hour: "3 PM",  trips: 55 },
  { hour: "4 PM",  trips: 72 },
  { hour: "5 PM",  trips: 89 },
  { hour: "6 PM",  trips: 94 },
  { hour: "7 PM",  trips: 67 },
  { hour: "8 PM",  trips: 38 },
  { hour: "9 PM",  trips: 22 },
];

const tripChartConfig = {
  trips: { label: "Trips", color: "var(--chart-1)" },
} satisfies ChartConfig;

type AlertSeverity = "critical" | "warning" | "info";

interface Alert {
  severity: AlertSeverity;
  message: string;
  vehicle: string;
  time: string;
}

const ALERT_STYLE: Record<AlertSeverity, { badge: "destructive" | "outline" | "secondary"; icon: string }> = {
  critical: { badge: "destructive", icon: "text-destructive" },
  warning:  { badge: "outline",     icon: "text-orange-500"  },
  info:     { badge: "secondary",   icon: "text-muted-foreground" },
};

const ALERTS: Alert[] = [
  { severity: "critical", message: "Sensor array fault — lidar primary",        vehicle: "AV-008", time: "14m ago" },
  { severity: "warning",  message: "Disengagement event — construction zone",   vehicle: "AV-001", time: "28m ago" },
  { severity: "warning",  message: "Battery below 30% threshold",               vehicle: "AV-010", time: "42m ago" },
  { severity: "info",     message: "Geofence boundary approached — Pier 39",    vehicle: "AV-004", time: "1h ago"  },
  { severity: "warning",  message: "Passenger no-show — trip auto-cancelled",   vehicle: "AV-005", time: "1h ago"  },
  { severity: "info",     message: "Route recalculated — traffic on 101",       vehicle: "AV-002", time: "2h ago"  },
  { severity: "critical", message: "Emergency stop triggered — pedestrian",      vehicle: "AV-007", time: "3h ago"  },
  { severity: "info",     message: "Scheduled maintenance reminder",             vehicle: "AV-006", time: "4h ago"  },
];

// ─── Table columns ───────────────────────────────────────────────────────────

const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
        Vehicle
        <IconArrowsUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as VehicleStatus;
      return <Badge variant={STATUS_VARIANT[status]} className="text-[10px]">{status}</Badge>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <IconMapPin className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs truncate max-w-[180px]">{row.getValue("location")}</span>
      </div>
    ),
  },
  {
    accessorKey: "battery",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
        Battery
        <IconArrowsUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const pct = row.getValue("battery") as number;
      return (
        <div className="flex items-center gap-2">
          <IconBatteryCharging className={`h-3.5 w-3.5 shrink-0 ${pct < 30 ? "text-destructive" : pct < 50 ? "text-orange-500" : "text-green-500"}`} />
          <div className="flex items-center gap-2 min-w-[4.5rem]">
            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${pct < 30 ? "bg-destructive" : pct < 50 ? "bg-orange-500" : "bg-green-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs tabular-nums">{pct}%</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "currentTrip",
    header: "Trip",
    cell: ({ row }) => {
      const trip = row.getValue("currentTrip") as string;
      return <span className={`text-xs font-mono ${trip === "—" ? "text-muted-foreground" : ""}`}>{trip}</span>;
    },
  },
  {
    accessorKey: "lastPing",
    header: "Last Ping",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <IconRadar className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">{row.getValue("lastPing")}</span>
      </div>
    ),
  },
];

// ─── Fleet map ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<VehicleStatus, string> = {
  Active:      "var(--chart-1)",
  Idle:        "var(--chart-3)",
  Charging:    "var(--chart-4)",
  Maintenance: "var(--chart-5)",
  Offline:     "var(--color-destructive, hsl(0 84% 60%))",
};

function centroid(points: string): { cx: number; cy: number } {
  const pts = points.split(" ").map((p) => p.split(",").map(Number));
  return {
    cx: pts.reduce((s, p) => s + p[0], 0) / pts.length,
    cy: pts.reduce((s, p) => s + p[1], 0) / pts.length,
  };
}

// Zones — each gets a distinct chart color for topographic identity
const ZONES = [
  { id: "downtown",   points: "25,35 55,35 55,58 35,65 25,55",  label: "Downtown",    fill: "var(--chart-1)", activity: 0.10 },
  { id: "soma",       points: "35,65 55,58 65,68 55,80 35,78",  label: "SoMa",        fill: "var(--chart-2)", activity: 0.08 },
  { id: "missionbay", points: "55,58 75,50 85,65 75,78 65,68",  label: "Mission Bay", fill: "var(--chart-3)", activity: 0.08 },
  { id: "potrero",    points: "45,78 55,80 60,90 40,92",         label: "Potrero",     fill: "var(--chart-4)", activity: 0.06 },
  { id: "depot",      points: "70,78 88,78 88,92 70,92",         label: "Depot Zone",  fill: "var(--chart-5)", activity: 0.06 },
].map((z) => ({ ...z, ...centroid(z.points) }));

// Routes: primary (named, with arrows) + secondary grid
const PRIMARY_ROUTES = [
  { d: "M 18,32 L 72,62",          label: "Market St"    },
  { d: "M 75,30 Q 92,45 88,70",    label: "Embarcadero"  },
  { d: "M 15,55 L 90,55",          label: "Mission St"   },
];
const SECONDARY_ROUTES = [
  "M 30,25 L 30,92", "M 50,25 L 50,92", "M 70,25 L 70,78",
  "M 15,40 L 90,40", "M 15,70 L 90,70", "M 15,85 L 90,85",
];

// Per-vehicle heading in degrees (0 = north, clockwise)
const VEHICLE_HEADING: Record<string, number> = {
  "AV-001": 45,   // NE along Market
  "AV-002": 170,  // S through Mission Bay
  "AV-003": 0,    // at depot, pointing N
  "AV-004": 120,  // SE toward Embarcadero
  "AV-005": 260,  // W, idling
  "AV-006": 0,    // at depot
  "AV-007": 200,  // SW toward Potrero
  "AV-008": 0,    // offline
  "AV-009": 80,   // E through Hayes Valley
  "AV-010": 0,    // charging at depot
};

function FleetMap({ vehicles, selectedId, onSelect }: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Fleet Map</CardTitle>
            <CardDescription className="text-xs">San Francisco coverage area</CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {(["Active", "Idle", "Charging", "Offline"] as VehicleStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative w-full rounded-lg border bg-muted/30 overflow-hidden" style={{ aspectRatio: "2.4 / 1" }}>
          <svg viewBox="10 20 85 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Arrowhead marker for primary routes */}
              <marker id="route-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M 0 0 L 5 2.5 L 0 5 z" fill="currentColor" opacity="0.35" />
              </marker>
            </defs>

            {/* Topographic zone fills — outer ring (low opacity) */}
            {ZONES.map((zone) => (
              <polygon
                key={`${zone.id}-outer`}
                points={zone.points}
                fill={zone.fill}
                fillOpacity={zone.activity}
                stroke={zone.fill}
                strokeOpacity={0.25}
                strokeWidth="0.4"
              />
            ))}

            {/* Topographic zone fills — inner highlight ring */}
            {ZONES.map((zone) => {
              // Shrink polygon slightly toward centroid for inner ring
              const pts = zone.points.split(" ").map((p) => {
                const [x, y] = p.split(",").map(Number);
                return `${zone.cx + (x - zone.cx) * 0.55},${zone.cy + (y - zone.cy) * 0.55}`;
              });
              return (
                <polygon
                  key={`${zone.id}-inner`}
                  points={pts.join(" ")}
                  fill={zone.fill}
                  fillOpacity={zone.activity * 0.8}
                  stroke="none"
                />
              );
            })}

            {/* Secondary road grid */}
            {SECONDARY_ROUTES.map((d, i) => (
              <path key={i} d={d} stroke="currentColor" strokeOpacity={0.08} strokeWidth="0.35" fill="none" strokeLinecap="round" />
            ))}

            {/* Primary named routes with direction arrows */}
            {PRIMARY_ROUTES.map((r) => (
              <path
                key={r.label}
                d={r.d}
                stroke="currentColor"
                strokeOpacity={0.22}
                strokeWidth="0.7"
                fill="none"
                strokeLinecap="round"
                markerMid="url(#route-arrow)"
                markerEnd="url(#route-arrow)"
              />
            ))}

            {/* Zone labels */}
            {ZONES.map((zone) => (
              <text
                key={zone.id}
                x={zone.cx}
                y={zone.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fillOpacity={0.45}
                fontSize="2.5"
                fontWeight="700"
                className="select-none pointer-events-none uppercase tracking-wide"
                style={{ letterSpacing: "0.05em" }}
              >
                {zone.label}
              </text>
            ))}

            {/* Vehicle markers */}
            {vehicles.map((v) => {
              const color = STATUS_COLOR[v.status];
              const isActive = v.status === "Active";
              const isSelected = selectedId === v.id;
              const heading = VEHICLE_HEADING[v.id] ?? 0;
              const { x, y } = v.coords;
              const s = 2.4;
              // Triangle pointing north, rotated to heading
              const tri = `${x},${y - s} ${x - s * 0.65},${y + s * 0.55} ${x + s * 0.65},${y + s * 0.55}`;

              return (
                <g key={v.id} className="cursor-pointer" onClick={() => onSelect(isSelected ? null : v.id)}>
                  {/* Expanded transparent hit area */}
                  <circle cx={x} cy={y} r={5} fill="transparent" />

                  {/* Pulse ring for active vehicles */}
                  {isActive && (
                    <circle cx={x} cy={y} r="3.5" fill="none" stroke={color} strokeWidth="0.4" className="animate-fleet-pulse" />
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <circle cx={x} cy={y} r="4.2" fill="none" stroke="currentColor" strokeOpacity={0.8} strokeWidth="0.6" />
                  )}

                  {/* Heading triangle (active/idle/charging) or dim circle (offline/maintenance) */}
                  {v.status === "Offline" || v.status === "Maintenance" ? (
                    <circle cx={x} cy={y} r="1.8" fill={color} opacity={0.3} />
                  ) : (
                    <polygon
                      points={tri}
                      fill={color}
                      transform={`rotate(${heading}, ${x}, ${y})`}
                    />
                  )}

                  {/* ID label */}
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.75}
                    fontSize="2"
                    fontWeight="700"
                    className="select-none pointer-events-none"
                  >
                    {v.id.replace("AV-0", "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

const STATS = [
  { label: "Active Vehicles",  value: "6",   icon: IconCarSuv,      delta: "+2 vs yesterday" },
  { label: "Trips Today",      value: "847", icon: IconNavigation,  delta: "+12% vs avg"     },
  { label: "Avg Wait Time",    value: "3.2m",icon: IconClock,       delta: "-18s vs last wk" },
  { label: "Fleet Utilization", value: "72%", icon: IconGauge,      delta: "+4pp vs target"  },
] as const;

const FLEET_SUMMARY = [
  { icon: IconActivity,       label: "active",             count: VEHICLES.filter((v) => v.status === "Active").length },
  { icon: IconBatteryCharging, label: "charging",           count: VEHICLES.filter((v) => v.status === "Charging").length },
  { icon: IconAlertTriangle,  label: "offline/maintenance", count: VEHICLES.filter((v) => v.status === "Maintenance" || v.status === "Offline").length },
];

// Status breakdown for fleet health card
const STATUS_BAR_CLASS: Record<VehicleStatus, string> = {
  Active:      "bg-[var(--chart-1)]",
  Idle:        "bg-[var(--chart-3)]",
  Charging:    "bg-[var(--chart-4)]",
  Maintenance: "bg-[var(--chart-5)]",
  Offline:     "bg-destructive",
};

const STATUS_BREAKDOWN = (["Active", "Idle", "Charging", "Maintenance", "Offline"] as VehicleStatus[]).map(
  (status) => ({
    label: status,
    count: VEHICLES.filter((v) => v.status === status).length,
    pct: Math.round((VEHICLES.filter((v) => v.status === status).length / VEHICLES.length) * 100),
    barClass: STATUS_BAR_CLASS[status],
  })
);

type FleetPriority = "P0" | "P1" | "P2" | "P3";

const FLEET_PRIORITY_COLOR: Record<FleetPriority, string> = {
  P0: "bg-destructive text-destructive-foreground",
  P1: "bg-orange-500 text-white",
  P2: "bg-primary text-primary-foreground",
  P3: "bg-muted text-muted-foreground",
};

const RESPONSE_QUEUE: { priority: FleetPriority; label: string; vehicle: string; due: string }[] = [
  { priority: "P0", label: "Sensor array fault — lidar primary", vehicle: "AV-008", due: "Now"   },
  { priority: "P1", label: "Battery critical threshold",          vehicle: "AV-010", due: "30m"   },
  { priority: "P1", label: "Disengagement event logged",          vehicle: "AV-001", due: "1h"    },
  { priority: "P2", label: "Scheduled bay maintenance",           vehicle: "AV-006", due: "Today" },
  { priority: "P3", label: "Route deviation reported",            vehicle: "AV-002", due: "EOD"   },
];

const ZONE_ACTIVITY = [
  { label: "Downtown",    trips: 34, pct: 72 },
  { label: "SoMa",        trips: 28, pct: 59 },
  { label: "Mission Bay", trips: 22, pct: 47 },
  { label: "Potrero",     trips: 14, pct: 30 },
  { label: "Depot Zone",  trips: 8,  pct: 17 },
];

// ─── Vehicle detail data ────────────────────────────────────────────────────

const VEHICLE_TRIPS = [
  { hour: "6 AM", distance: 2.4 }, { hour: "7 AM", distance: 5.1 }, { hour: "8 AM", distance: 8.7 },
  { hour: "9 AM", distance: 11.2 }, { hour: "10 AM", distance: 7.3 }, { hour: "11 AM", distance: 4.8 },
  { hour: "12 PM", distance: 6.2 }, { hour: "1 PM", distance: 9.1 }, { hour: "2 PM", distance: 7.5 },
  { hour: "3 PM", distance: 8.9 }, { hour: "4 PM", distance: 12.1 }, { hour: "5 PM", distance: 14.3 },
];

const vehicleTripConfig = {
  distance: { label: "Miles", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SENSOR_DATA = [
  { label: "Lidar",       icon: IconEye,         value: "Nominal", status: "ok" },
  { label: "Camera Array", icon: IconEye,         value: "6/6 online", status: "ok" },
  { label: "CPU Temp",     icon: IconTemperature, value: "62°C", status: "ok" },
  { label: "GPU Load",     icon: IconCpu,         value: "41%", status: "ok" },
  { label: "Connectivity", icon: IconWifi,        value: "5G — 42ms", status: "ok" },
  { label: "IMU",          icon: IconActivity,    value: "Calibrated", status: "ok" },
] as const;

const VEHICLE_EVENTS = [
  { time: "2m ago",  event: "Passenger picked up — Market & 4th",    type: "info" as const },
  { time: "8m ago",  event: "Route recalculated — congestion on 3rd", type: "info" as const },
  { time: "14m ago", event: "Yielded to pedestrian — crosswalk",      type: "info" as const },
  { time: "22m ago", event: "Lane change executed — Highway 101 on-ramp", type: "info" as const },
  { time: "31m ago", event: "Passenger dropped off — Embarcadero",    type: "info" as const },
  { time: "45m ago", event: "Construction zone — reduced speed",       type: "warning" as const },
  { time: "1h ago",  event: "Trip TRP-4819 completed — 4.2mi",        type: "info" as const },
];

// ─── Sub-pages ──────────────────────────────────────────────────────────────

function FleetOverviewPage({ onSelectVehicle }: { onSelectVehicle: (id: string) => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [alertTab, setAlertTab] = useState<"all" | AlertSeverity>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const table = useReactTable({
    data: VEHICLES,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredAlerts = alertTab === "all"
    ? ALERTS
    : ALERTS.filter((a) => a.severity === alertTab);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div style={{ animation: "var(--anim-fade-in)" }}>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Operations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time autonomous vehicle fleet monitoring
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 @3xl/main:grid-cols-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} style={{
              animation: "var(--anim-slide-up-in)",
              animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 1})`,
              animationFillMode: "both",
            }}>
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

      {/* Fleet map */}
      <div style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 5)",
        animationFillMode: "both",
      }}>
        <FleetMap vehicles={VEHICLES} selectedId={selectedVehicle} onSelect={setSelectedVehicle} />
      </div>

      {/* Chart + Alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
        animationFillMode: "both",
      }}>
        {/* Trips over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Trips Today</CardTitle>
            <CardDescription className="text-xs">Hourly trip volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tripChartConfig} className="h-[240px] w-full">
              <AreaChart data={TRIP_DATA}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.replace(" ", "")}
                  className="text-[10px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[10px]"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="trips"
                  type="natural"
                  fill="var(--color-trips)"
                  fillOpacity={0.2}
                  stroke="var(--color-trips)"
                  strokeWidth={2}
                  animationDuration={cssMs("--motion-duration-slow")}
                  animationEasing={cssCurve("--motion-curve-decelerate-max")}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alerts feed */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Alerts</CardTitle>
              <IconShield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <Tabs value={alertTab} onValueChange={(v) => setAlertTab(v as "all" | AlertSeverity)}>
              <TabsList className="w-full mb-3">
                <TabsTrigger value="all" className="text-xs flex-1">All</TabsTrigger>
                <TabsTrigger value="critical" className="text-xs flex-1">Critical</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs flex-1">Warning</TabsTrigger>
              </TabsList>

              <div className="space-y-1 max-h-[240px] overflow-y-auto">
                {filteredAlerts.map((alert, i) => {
                  const style = ALERT_STYLE[alert.severity];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
                      style={{
                        animation: "var(--anim-fade-in)",
                        animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                        animationFillMode: "both",
                      }}
                    >
                      <IconAlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={style.badge} className="text-[9px] h-4 px-1.5">{alert.vehicle}</Badge>
                          <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Fleet health + Response queue + Zone activity */}
      <div className="grid gap-3 sm:grid-cols-3" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 7)",
        animationFillMode: "both",
      }}>
        {/* Fleet status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Fleet Health</CardTitle>
              <IconActivity className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 space-y-2.5">
            {STATUS_BREAKDOWN.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <span className="text-[11px] font-semibold tabular-nums ml-2 shrink-0">{s.count}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${s.barClass}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Response queue */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Response Queue</CardTitle>
              <IconFlame className="h-3.5 w-3.5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            {RESPONSE_QUEUE.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${FLEET_PRIORITY_COLOR[item.priority]}`}>
                  {item.priority}
                </span>
                <p className="flex-1 text-xs truncate">{item.label}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{item.due}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{item.vehicle}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Zone activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Zone Activity</CardTitle>
              <IconMap className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 space-y-2.5">
            {ZONE_ACTIVITY.map((z) => (
              <div key={z.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-muted-foreground truncate">{z.label}</p>
                  <span className="text-[11px] font-semibold tabular-nums ml-2 shrink-0">{z.trips}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle status table */}
      <Card style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 8)",
        animationFillMode: "both",
      }}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Vehicle Status</CardTitle>
              <CardDescription className="text-xs">{VEHICLES.length} vehicles in fleet</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, rowIdx) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => onSelectVehicle(row.original.id)}
                      style={{
                        animation: "var(--anim-fade-in)",
                        animationDelay: `calc(var(--motion-duration-ultra-fast) * ${rowIdx})`,
                        animationFillMode: "both",
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Fleet summary */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {FLEET_SUMMARY.map(({ icon: Icon, label, count }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {count} {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VehicleDetailPage({ vehicleId, onBack }: { vehicleId: string; onBack: () => void }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[0];
  const vehicleAlerts = ALERTS.filter((a) => a.vehicle === vehicle.id);
  const batteryColor = vehicle.battery < 30 ? "text-destructive" : vehicle.battery < 50 ? "text-orange-500" : "text-green-500";
  const batteryBg = vehicle.battery < 30 ? "bg-destructive" : vehicle.battery < 50 ? "bg-orange-500" : "bg-green-500";

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3" style={{ animation: "var(--anim-fade-in)" }}>
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to fleet overview">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{vehicle.id}</h1>
            <Badge variant={STATUS_VARIANT[vehicle.status]}>{vehicle.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <IconMapPin className="h-3 w-3" />
            {vehicle.location}
          </p>
        </div>
      </div>

      {/* Vital stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { label: "Battery", value: `${vehicle.battery}%`, icon: IconBatteryCharging, sub: vehicle.battery < 30 ? "Low — charge soon" : "Healthy" },
          { label: "Current Trip", value: vehicle.currentTrip, icon: IconNavigation, sub: vehicle.currentTrip === "—" ? "No active trip" : "In progress" },
          { label: "Last Ping", value: vehicle.lastPing, icon: IconRadar, sub: "Telemetry active" },
          { label: "Today's Distance", value: "47.3 mi", icon: IconGauge, sub: "12 trips completed" },
        ] as const).map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} style={{
              animation: "var(--anim-slide-up-in)",
              animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 1})`,
              animationFillMode: "both",
            }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">{s.label}</CardDescription>
                  <Icon className={`h-4 w-4 ${s.label === "Battery" ? batteryColor : "text-muted-foreground"}`} />
                </div>
                <CardTitle className="text-2xl font-bold tabular-nums">{s.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Battery bar */}
      <Card style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 5)",
        animationFillMode: "both",
      }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Battery Level</span>
            <span className={`text-sm font-bold tabular-nums ${batteryColor}`}>{vehicle.battery}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${batteryBg} transition-[width] duration-500`} style={{ width: `${vehicle.battery}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {vehicle.battery < 30 ? "Estimated range: ~12 mi" : vehicle.battery < 50 ? "Estimated range: ~35 mi" : `Estimated range: ~${Math.round(vehicle.battery * 1.1)} mi`}
          </p>
        </CardContent>
      </Card>

      {/* Distance chart + Sensor grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
        animationFillMode: "both",
      }}>
        {/* Distance per hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Distance by Hour</CardTitle>
            <CardDescription className="text-xs">Miles driven today</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vehicleTripConfig} className="h-[200px] w-full">
              <BarChart data={VEHICLE_TRIPS}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.replace(" ", "")}
                  className="text-[10px]"
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="distance"
                  fill="var(--color-distance)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={cssMs("--motion-duration-slow")}
                  animationEasing={cssCurve("--motion-curve-decelerate-max")}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sensor status grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sensor Status</CardTitle>
            <CardDescription className="text-xs">All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SENSOR_DATA.map((sensor, i) => {
                const Icon = sensor.icon;
                return (
                  <div
                    key={sensor.label}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                    style={{
                      animation: "var(--anim-fade-in)",
                      animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                      animationFillMode: "both",
                    }}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{sensor.label}</p>
                      <p className="text-[11px] text-muted-foreground">{sensor.value}</p>
                    </div>
                    <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event log + Vehicle alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 7)",
        animationFillMode: "both",
      }}>
        {/* Event log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
            <CardDescription className="text-xs">Recent vehicle activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {VEHICLE_EVENTS.map((evt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
                style={{
                  animation: "var(--anim-fade-in)",
                  animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                  animationFillMode: "both",
                }}
              >
                <IconActivity className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${evt.type === "warning" ? "text-orange-500" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{evt.event}</p>
                  <span className="text-[10px] text-muted-foreground">{evt.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle-specific alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Alerts for {vehicle.id}</CardTitle>
              <IconShield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {vehicleAlerts.length > 0 ? vehicleAlerts.map((alert, i) => {
              const style = ALERT_STYLE[alert.severity];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                    animationFillMode: "both",
                  }}
                >
                  <IconAlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground px-2.5 py-4 text-center">No alerts for this vehicle</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Root with page transitions ─────────────────────────────────────────────

type FleetPage = "overview" | "detail";
type Phase = "idle" | "exiting" | "entering";

export function FleetOpsBlock() {
  const [activePage, setActivePage] = useState<FleetPage>("overview");
  const [displayPage, setDisplayPage] = useState<FleetPage>("overview");
  const [phase, setPhase] = useState<Phase>("idle");
  const [detailVehicleId, setDetailVehicleId] = useState<string>("AV-001");
  const pending = useRef<FleetPage>("overview");

  const navigate = (next: FleetPage) => {
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

  const goToDetail = (vehicleId: string) => {
    setDetailVehicleId(vehicleId);
    navigate("detail");
  };

  const goToOverview = () => navigate("overview");

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
        {displayPage === "overview"
          ? <FleetOverviewPage onSelectVehicle={goToDetail} />
          : <VehicleDetailPage vehicleId={detailVehicleId} onBack={goToOverview} />
        }
      </div>
    </div>
  );
}
