import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Car,
  Battery,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Activity,
  Navigation,
  Gauge,
  ArrowUpDown,
  Search,
  Shield,
  Radio,
} from "lucide-react";

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
        <ArrowUpDown className="ml-1 h-3 w-3" />
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
        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs truncate max-w-[180px]">{row.getValue("location")}</span>
      </div>
    ),
  },
  {
    accessorKey: "battery",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
        Battery
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const pct = row.getValue("battery") as number;
      return (
        <div className="flex items-center gap-2">
          <Battery className={`h-3.5 w-3.5 shrink-0 ${pct < 30 ? "text-destructive" : pct < 50 ? "text-orange-500" : "text-green-500"}`} />
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
        <Radio className="h-3 w-3 text-muted-foreground shrink-0" />
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

// Geofence zone polygons (stylized SF neighborhoods)
function centroid(points: string): { cx: number; cy: number } {
  const pts = points.split(" ").map((p) => p.split(",").map(Number));
  return {
    cx: pts.reduce((s, p) => s + p[0], 0) / pts.length,
    cy: pts.reduce((s, p) => s + p[1], 0) / pts.length,
  };
}

const ZONES = [
  { id: "downtown",   points: "25,35 55,35 55,58 35,65 25,55",     label: "Downtown" },
  { id: "soma",       points: "35,65 55,58 65,68 55,80 35,78",     label: "SoMa" },
  { id: "missionbay", points: "55,58 75,50 85,65 75,78 65,68",     label: "Mission Bay" },
  { id: "potrero",    points: "45,78 55,80 60,90 40,92",           label: "Potrero" },
  { id: "depot",      points: "70,78 88,78 88,92 70,92",           label: "Depot Zone" },
].map((z) => ({ ...z, ...centroid(z.points) }));

// Stylized road grid
const ROADS = [
  // Major horizontal routes
  "M 15,40 L 90,40", "M 15,55 L 90,55", "M 15,70 L 90,70", "M 15,85 L 90,85",
  // Major vertical routes
  "M 30,25 L 30,95", "M 50,25 L 50,95", "M 70,25 L 70,95",
  // Diagonal (Market St)
  "M 18,32 L 72,62",
  // Embarcadero curve
  "M 75,30 Q 92,45 88,70",
];

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
          <svg
            viewBox="10 20 85 80"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Geofence zones */}
            {ZONES.map((zone) => (
              <polygon
                key={zone.id}
                points={zone.points}
                className="fill-primary/[0.04] stroke-primary/20"
                strokeWidth="0.3"
                strokeDasharray="2 1"
              />
            ))}

            {/* Road grid */}
            {ROADS.map((d, i) => (
              <path
                key={i}
                d={d}
                className="stroke-muted-foreground/15"
                strokeWidth="0.4"
                fill="none"
                strokeLinecap="round"
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
                className="fill-muted-foreground/30 select-none pointer-events-none"
                fontSize="2.5"
                fontWeight="600"
              >
                {zone.label}
              </text>
            ))}

            {/* Vehicle markers */}
            {vehicles.map((v) => {
              const color = STATUS_COLOR[v.status];
              const isActive = v.status === "Active";
              const isSelected = selectedId === v.id;
              return (
                <g
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(isSelected ? null : v.id)}
                >
                  {/* Pulse ring for active vehicles */}
                  {isActive && (
                    <circle
                      cx={v.coords.x}
                      cy={v.coords.y}
                      r="3"
                      fill="none"
                      stroke={color}
                      strokeWidth="0.4"
                      className="animate-fleet-pulse"
                    />
                  )}
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={v.coords.x}
                      cy={v.coords.y}
                      r="3.5"
                      fill="none"
                      className="stroke-foreground"
                      strokeWidth="0.5"
                    />
                  )}
                  {/* Dot */}
                  <circle
                    cx={v.coords.x}
                    cy={v.coords.y}
                    r="1.8"
                    fill={color}
                    opacity={v.status === "Offline" ? 0.4 : 1}
                  />
                  {/* Label */}
                  <text
                    x={v.coords.x}
                    y={v.coords.y - 3.5}
                    textAnchor="middle"
                    className="fill-foreground select-none pointer-events-none"
                    fontSize="2"
                    fontWeight="700"
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
  { label: "Active Vehicles",  value: "6",   icon: Car,        delta: "+2 vs yesterday" },
  { label: "Trips Today",      value: "847", icon: Navigation, delta: "+12% vs avg"     },
  { label: "Avg Wait Time",    value: "3.2m",icon: Clock,      delta: "-18s vs last wk" },
  { label: "Fleet Utilization", value: "72%", icon: Gauge,      delta: "+4pp vs target"  },
] as const;

const FLEET_SUMMARY = [
  { icon: Activity,      label: "active",             count: VEHICLES.filter((v) => v.status === "Active").length },
  { icon: Battery,       label: "charging",           count: VEHICLES.filter((v) => v.status === "Charging").length },
  { icon: AlertTriangle, label: "offline/maintenance", count: VEHICLES.filter((v) => v.status === "Maintenance" || v.status === "Offline").length },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function FleetOpsBlock() {
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
      <div>
        <h1 className="text-xl font-bold tracking-tight">Fleet Operations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time autonomous vehicle fleet monitoring
        </p>
      </div>

      {/* Fleet map */}
      <FleetMap vehicles={VEHICLES} selectedId={selectedVehicle} onSelect={setSelectedVehicle} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 @3xl/main:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">{s.label}</CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold tabular-nums">{s.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">{s.delta}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
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
              <Shield className="h-4 w-4 text-muted-foreground" />
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
                    >
                      <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
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

      {/* Vehicle status table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Vehicle Status</CardTitle>
              <CardDescription className="text-xs">{VEHICLES.length} vehicles in fleet</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
