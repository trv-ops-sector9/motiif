import React, { useEffect, useRef, useState } from "react";
import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import { MapContainer, TileLayer, Circle, CircleMarker, Polygon, Tooltip, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  IconCarSuv,
  IconBatteryCharging,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconActivity,
  IconNavigation,
  IconGauge,
  IconSearch,
  IconShield,
  IconRadar,
  IconArrowLeft,
  IconTemperature,
  IconCpu,
  IconEye,
  IconWifi,
  IconBolt,
  IconRoute,
  IconCircleCheck,
  IconCircleX,
  IconChartBar,
  IconWifiOff,
  IconArrowRight,
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

// ─── Data ────────────────────────────────────────────────────────────────────

type VehicleStatus = "Active" | "Idle" | "Charging" | "Maintenance" | "Offline";

interface Vehicle {
  id: string;
  status: VehicleStatus;
  location: string;
  battery: number;
  currentTrip: string;
  lastPing: string;
  coords: LatLngTuple;
}

const STATUS_VARIANT: Record<VehicleStatus, "default" | "secondary" | "outline" | "destructive"> = {
  Active:      "default",
  Idle:        "secondary",
  Charging:    "outline",
  Maintenance: "outline",
  Offline:     "destructive",
};

const VEHICLES: Vehicle[] = [
  { id: "AV-001", status: "Active",      location: "1st Ave & Pike St",         battery: 87, currentTrip: "TRP-4821", lastPing: "2s ago",  coords: [47.608,  -122.341] },
  { id: "AV-002", status: "Active",      location: "Capitol Hill — Broadway",   battery: 64, currentTrip: "TRP-4819", lastPing: "5s ago",  coords: [47.621,  -122.319] },
  { id: "AV-003", status: "Charging",    location: "Depot A — SODO Bay 3",      battery: 42, currentTrip: "—",        lastPing: "1m ago",  coords: [47.580,  -122.326] },
  { id: "AV-004", status: "Active",      location: "South Lake Union — Westlake",battery: 91, currentTrip: "TRP-4823", lastPing: "3s ago",  coords: [47.628,  -122.338] },
  { id: "AV-005", status: "Idle",        location: "Fremont Hub",               battery: 78, currentTrip: "—",        lastPing: "30s ago", coords: [47.651,  -122.350] },
  { id: "AV-006", status: "Maintenance", location: "Depot B — Bellevue Bay 1",  battery: 55, currentTrip: "—",        lastPing: "12m ago", coords: [47.608,  -122.196] },
  { id: "AV-007", status: "Active",      location: "University District",        battery: 73, currentTrip: "TRP-4825", lastPing: "1s ago",  coords: [47.659,  -122.313] },
  { id: "AV-008", status: "Offline",     location: "Last: Depot A — SODO",      battery: 12, currentTrip: "—",        lastPing: "2h ago",  coords: [47.582,  -122.328] },
  { id: "AV-009", status: "Active",      location: "Kirkland — Downtown",        battery: 82, currentTrip: "TRP-4827", lastPing: "4s ago",  coords: [47.681,  -122.209] },
  { id: "AV-010", status: "Charging",    location: "Depot C — Redmond Bay 2",   battery: 29, currentTrip: "—",        lastPing: "3m ago",  coords: [47.672,  -122.125] },
  { id: "AV-011", status: "Active",      location: "Bellevue — Crossroads",     battery: 68, currentTrip: "TRP-4831", lastPing: "6s ago",  coords: [47.612,  -122.170] },
  { id: "AV-012", status: "Idle",        location: "Northgate — Roosevelt Way",  battery: 81, currentTrip: "—",        lastPing: "45s ago", coords: [47.686,  -122.320] },
  { id: "AV-013", status: "Active",      location: "Mercer Island — East Chnl", battery: 74, currentTrip: "TRP-4833", lastPing: "3s ago",  coords: [47.571,  -122.225] },
];

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
  { severity: "critical", message: "Sensor array fault — lidar primary",           vehicle: "AV-008", time: "14m ago" },
  { severity: "critical", message: "Emergency stop — wrong-way vehicle on Eastlake",vehicle: "AV-003", time: "6h ago"  },
  { severity: "warning",  message: "Disengagement event — construction zone",      vehicle: "AV-001", time: "28m ago" },
  { severity: "warning",  message: "Battery below 30% threshold",                  vehicle: "AV-010", time: "42m ago" },
  { severity: "info",     message: "Geofence boundary approached — Colman Dock",   vehicle: "AV-004", time: "1h ago"  },
  { severity: "warning",  message: "Passenger no-show — trip auto-cancelled",      vehicle: "AV-005", time: "1h ago"  },
  { severity: "info",     message: "Route recalculated — traffic on I-5",          vehicle: "AV-002", time: "2h ago"  },
  { severity: "critical", message: "Emergency stop triggered — pedestrian",         vehicle: "AV-007", time: "3h ago"  },
  { severity: "info",     message: "Scheduled maintenance reminder",                vehicle: "AV-006", time: "4h ago"  },
];

// ─── Fleet map ──────────────────────────────────────────────────────────────

const STATUS_COLOR_HEX: Record<VehicleStatus, string> = {
  Active:      "#22c55e",
  Idle:        "#f59e0b",
  Charging:    "#3b82f6",
  Maintenance: "#a855f7",
  Offline:     "#ef4444",
};

const MAP_CENTER: LatLngTuple = [47.635, -122.255];
const MAP_ZOOM = 11;

// Tile URLs — CartoDB Positron (light) and Dark Matter (dark)
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK  = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR  = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Routes removed per design decision

// Geofence zones — operational boundaries (Seattle area)
const GEOFENCES: { center: LatLngTuple; radius: number; label: string; type: "depot" | "restricted" | "operational" }[] = [
  { center: [47.580,  -122.326], radius: 400,  label: "Depot A — SODO",      type: "depot"      },
  { center: [47.608,  -122.196], radius: 350,  label: "Depot B — Bellevue",   type: "depot"      },
  { center: [47.672,  -122.125], radius: 300,  label: "Depot C — Redmond",    type: "depot"      },
  { center: [47.603,  -122.337], radius: 250,  label: "Ferry Zone",           type: "restricted" },
  { center: [47.643,  -122.131], radius: 400,  label: "SR-520 Corridor",      type: "restricted" },
];

// Operational coverage polygon — approximate Seattle metro service area
const COVERAGE_ZONE: LatLngTuple[] = [
  [47.730, -122.390], [47.730, -122.180], [47.700, -122.110],
  [47.620, -122.095], [47.540, -122.140], [47.480, -122.240],
  [47.490, -122.380], [47.570, -122.415], [47.650, -122.415],
];

// Incident locations (Seattle area)
const INCIDENT_COORDS: { id: string; coords: LatLngTuple; severity: AlertSeverity }[] = [
  { id: "INC-0041", coords: [47.601,  -122.334], severity: "critical" },  // Pioneer Square — no vehicle here
  { id: "INC-0042", coords: [47.582,  -122.328], severity: "critical" },  // AV-008 (Offline) — both red, consistent
  { id: "INC-0043", coords: [47.617,  -122.335], severity: "warning"  },  // Eastlake — no vehicle here
  { id: "INC-0044", coords: [47.630,  -122.341], severity: "warning"  },  // SLU north — no vehicle here
  { id: "INC-0048", coords: [47.565,  -122.219], severity: "critical" },  // Mercer Island south — no vehicle here
];

/** Syncs tile layer when theme changes (react-leaflet doesn't re-render TileLayer on url change) */
function TileSync({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const prev = useRef(isDark);
  useEffect(() => {
    if (prev.current !== isDark) {
      prev.current = isDark;
      map.eachLayer((l) => {
        if ("_url" in l) map.removeLayer(l);
      });
      import("leaflet").then((L) => {
        L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, { attribution: TILE_ATTR }).addTo(map);
      });
    }
  }, [isDark, map]);
  return null;
}

// ── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let rafId: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(target * ease);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}

function FleetMap({ vehicles, selectedId, onSelect, selectedIncidentId, onSelectIncident }: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
}) {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute("data-theme") || "default"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "default");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const dark = theme.includes("dark");

  // Per-theme map tint — matches the background palette, not the accent/primary color.
  const THEME_TINT: Record<string, [r: number, g: number, b: number]> = {
    "default":       [100, 110, 130],
    "dark-minimal":  [ 90,  95, 110],
    "drive":         [ 80, 100, 180],
    "drive-dark":    [ 60,  80, 160],
    "brutalist":     [ 30,  30,  30],
    "brutalist-dark":[  0,   0,   0],
    "lux":           [160, 140,  90],
    "lux-dark":      [ 90,  75,  50],
    "vapor":         [110,  60, 190],
    "vapor-dark":    [ 80,  40, 200],
  };
  const [tr, tg, tb] = THEME_TINT[theme] ?? [80, 90, 120];
  const tintColor = `rgb(${tr} ${tg} ${tb} / ${dark ? 0.10 : 0.06})`;

  const geofenceColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const geofenceStroke = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const restrictedColor = "#ef4444";
  const coverageStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const coverageFill = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)";

  // Dynamic values go on the div as CSS custom properties — static <style> reads them via var().
  // This avoids React 19 style deduplication swallowing dynamic template-literal style tags.
  const mapCssVars = {
    "--fleet-map-bg":      dark ? "#0d0d0d"                                        : "#f2f2f2",
    "--fleet-tile-filter": dark ? "grayscale(1) brightness(0.70) contrast(1.10)"  : "grayscale(1) brightness(0.97) contrast(1.15)",
  } as React.CSSProperties;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border" style={mapCssVars}>
      <style>{`
        .fleet-map .leaflet-container { background: var(--fleet-map-bg) !important; }
        .fleet-map .leaflet-tile-pane { filter: var(--fleet-tile-filter) !important; }
        .fleet-map .leaflet-control-attribution { font-size: 7px !important; opacity: 0.3; background: transparent !important; }
        .fleet-map .leaflet-control-attribution a { color: inherit !important; }
        .fleet-marker-tooltip .leaflet-tooltip,
        .fleet-map .leaflet-tooltip {
          background: var(--color-card) !important;
          border: 1px solid var(--color-border) !important;
          color: var(--color-muted-foreground) !important;
          font-size: 9px;
          font-family: ui-monospace, monospace;
          padding: 2px 5px;
          border-radius: 3px;
          box-shadow: var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.08));
          letter-spacing: 0.02em;
        }
        .fleet-marker-tooltip .leaflet-tooltip::before,
        .fleet-map .leaflet-tooltip::before { display: none; }
        .fleet-map .leaflet-interactive { outline: none; }
        .fleet-map .leaflet-tooltip {
          font-size: 10px !important;
          padding: 3px 7px !important;
        }
        @keyframes fleet-sonar {
          0%   { opacity: 0.65; }
          70%  { opacity: 0.05; }
          100% { opacity: 0; }
        }
        .fleet-sonar-ring { animation: fleet-sonar 1.8s ease-out infinite; }
        @keyframes fleet-red-pulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 0.35; }
        }
        .fleet-dot-offline     { animation: fleet-red-pulse 2s ease-in-out infinite; filter: drop-shadow(0 0 5px #ef4444); }
        .fleet-dot-active      { filter: drop-shadow(0 0 5px #22c55e); }
        .fleet-dot-idle        { filter: drop-shadow(0 0 4px #f59e0b); }
        .fleet-dot-charging    { filter: drop-shadow(0 0 4px #3b82f6); }
        .fleet-dot-maintenance { filter: drop-shadow(0 0 4px #a855f7); }
      `}</style>

      <div className="fleet-map w-full h-full">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          zoomControl={false}
          attributionControl={true}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url={dark ? TILE_DARK : TILE_LIGHT} attribution={TILE_ATTR} />
          <TileSync isDark={dark} />

          {/* Operational coverage zone — subtle boundary */}
          <Polygon
            positions={COVERAGE_ZONE}
            pathOptions={{
              color: coverageStroke,
              weight: 1,
              fillColor: coverageFill,
              fillOpacity: 1,
              dashArray: "4 3",
            }}
          />

          {/* Geofence zones */}
          {GEOFENCES.map((gf) => (
            <Circle
              key={gf.label}
              center={gf.center}
              radius={gf.radius}
              pathOptions={{
                color: gf.type === "restricted" ? restrictedColor : geofenceStroke,
                weight: 0.8,
                fillColor: gf.type === "restricted" ? restrictedColor : geofenceColor,
                fillOpacity: gf.type === "restricted" ? 0.06 : 0.15,
                dashArray: gf.type === "restricted" ? "3 2" : undefined,
              }}
            >
              <Tooltip direction="center" permanent className="fleet-marker-tooltip">
                <span style={{ fontSize: "7px", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {gf.label}
                </span>
              </Tooltip>
            </Circle>
          ))}

          {/* Incident markers — clickable, selected state highlighted */}
          {INCIDENT_COORDS.map((inc) => {
            const isIncSelected = selectedIncidentId === inc.id;
            const incColor = inc.severity === "critical" ? "#ef4444" : "#f59e0b";
            return (
              <CircleMarker
                key={inc.id}
                center={inc.coords}
                radius={isIncSelected ? 7 : 5}
                pathOptions={{
                  color: isIncSelected ? "white" : incColor,
                  weight: isIncSelected ? 2 : 1,
                  fillColor: incColor,
                  fillOpacity: isIncSelected ? 0.9 : 0.7,
                  opacity: 1,
                  className: "",
                }}
                eventHandlers={{ click: () => onSelectIncident(isIncSelected ? null : inc.id) }}
              >
                <Tooltip direction="top" offset={[0, -5]} className="fleet-marker-tooltip" permanent={isIncSelected}>
                  <span>{inc.id}</span>
                  {isIncSelected && <span style={{ marginLeft: 4, opacity: 0.55 }}>{inc.severity}</span>}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Vehicle markers — on top of everything */}
          {vehicles.map((v) => {
            const hasAlert = ALERTS.some(a => a.vehicle === v.id);
            const color = hasAlert ? "#ef4444" : STATUS_COLOR_HEX[v.status];
            const isSelected = selectedId === v.id;
            const isOffline = v.status === "Offline" || v.status === "Maintenance";

            return (
              <React.Fragment key={v.id}>
              {/* Sonar pulse ring — selected only, smaller than before */}
              {isSelected && (
                <CircleMarker
                  center={v.coords}
                  radius={16}
                  interactive={false}
                  pathOptions={{
                    color: color,
                    weight: 1.5,
                    fillColor: color,
                    fillOpacity: 0,
                    opacity: 1,
                    className: "fleet-sonar-ring",
                  }}
                />
              )}
              <CircleMarker
                center={v.coords}
                radius={isSelected ? 9 : isOffline ? 5 : 7}
                pathOptions={{
                  color: color,
                  stroke: !isSelected,
                  weight: 1,
                  fillColor: color,
                  fillOpacity: isOffline ? 0.3 : isSelected ? 1 : 0.85,
                  opacity: 1,
                  className: hasAlert ? "fleet-dot-offline" : `fleet-dot-${v.status.toLowerCase()}`,
                }}
                eventHandlers={{
                  click: () => onSelect(isSelected ? null : v.id),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -6]}
                  className="fleet-marker-tooltip"
                  permanent={isSelected}
                >
                  <span>{v.id}</span>
                  {isSelected && (
                    <span style={{ marginLeft: 4, opacity: 0.5 }}>{v.status}</span>
                  )}
                </Tooltip>
              </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Per-theme tint overlay — matches map tone to the background palette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tintColor, zIndex: 450 }}
      />

      {/* Legend — bottom left overlay */}
      <div className="absolute bottom-5 left-2 z-[1000] flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 border text-[8px]">
        {(["Active", "Idle", "Charging", "Offline"] as VehicleStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1 text-muted-foreground font-medium">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR_HEX[s] }} />
            {s}
          </span>
        ))}
        <span className="border-l pl-2 ml-0.5 flex items-center gap-1 text-muted-foreground font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
          Incident
        </span>
      </div>

      {/* Coordinates + vehicle count watermark */}
      <div className="absolute top-2 right-2 z-[1000] text-[7px] text-muted-foreground/40 font-mono tracking-wider">
        47.63°N · 122.25°W · {vehicles.filter((v) => v.status === "Active").length} active
      </div>
    </div>
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

// ─── Incident data ───────────────────────────────────────────────────────────

type IncidentType = "disengagement" | "emergency_stop" | "sensor_fault" | "geofence" | "comm_loss";

interface Incident {
  id: string;
  type: IncidentType;
  severity: AlertSeverity;
  vehicle: string;
  location: string;
  description: string;
  time: string;
  responseTimeSec: number;
  resolved: boolean;
}

const INCIDENT_TYPE_META: Record<IncidentType, { label: string; icon: React.ElementType; color: string }> = {
  disengagement:  { label: "Disengagement",  icon: IconRoute,             color: "text-orange-500"  },
  emergency_stop: { label: "Emergency Stop", icon: IconBolt,              color: "text-destructive" },
  sensor_fault:   { label: "Sensor Fault",   icon: IconEye,               color: "text-yellow-500"  },
  geofence:       { label: "Geofence",       icon: IconShield,            color: "text-blue-400"    },
  comm_loss:      { label: "Comm Loss",      icon: IconWifiOff,           color: "text-muted-foreground" },
};

const INCIDENTS: Incident[] = [
  { id: "INC-0041", type: "emergency_stop",  severity: "critical", vehicle: "AV-007", location: "1st Ave & Pike St",           description: "Pedestrian entered active ODD — full autonomy stop executed, remote ops notified", time: "3h ago",      responseTimeSec: 1.4, resolved: true  },
  { id: "INC-0042", type: "sensor_fault",    severity: "critical", vehicle: "AV-008", location: "Depot A — SODO Bay 3",        description: "Lidar primary array lost signal — fallback to camera-only, vehicle sidelined",  time: "14m ago",     responseTimeSec: 8.2, resolved: false },
  { id: "INC-0043", type: "disengagement",   severity: "warning",  vehicle: "AV-001", location: "2nd Ave & Pine St",           description: "Construction zone cone displacement — operator assumed manual control",          time: "28m ago",     responseTimeSec: 3.1, resolved: true  },
  { id: "INC-0044", type: "geofence",        severity: "warning",  vehicle: "AV-004", location: "Colman Dock Ferry Terminal",  description: "Approaching restricted ferry zone — route correction automatically applied",      time: "1h ago",      responseTimeSec: 2.0, resolved: true  },
  { id: "INC-0045", type: "comm_loss",       severity: "warning",  vehicle: "AV-002", location: "SR-99 Tunnel Approach",       description: "5G primary degraded below 10 Mbps — switched to V2X mesh backup",               time: "1h 14m ago",  responseTimeSec: 0.8, resolved: true  },
  { id: "INC-0046", type: "sensor_fault",    severity: "warning",  vehicle: "AV-005", location: "Capitol Hill — E Pike St",    description: "Camera 3 (left rear) lens obstruction detected — auto-clean sequence initiated",  time: "2h ago",      responseTimeSec: 4.4, resolved: true  },
  { id: "INC-0047", type: "disengagement",   severity: "warning",  vehicle: "AV-009", location: "Aurora Ave & Denny Way",      description: "Anomalous cyclist trajectory in adjacent lane — operator intervened, re-engaged",  time: "4h ago",      responseTimeSec: 2.8, resolved: true  },
  { id: "INC-0048", type: "emergency_stop",  severity: "critical", vehicle: "AV-003", location: "Eastlake Ave & Campus Pkwy", description: "Wrong-way vehicle detected on one-way — immediate full stop, hazard lights on",   time: "6h ago",      responseTimeSec: 1.1, resolved: true  },
  { id: "INC-0049", type: "sensor_fault",    severity: "info",     vehicle: "AV-006", location: "Depot B — Bellevue Bay 1",   description: "Radar calibration drift exceeds 0.3° threshold — recalibration queued",          time: "8h ago",      responseTimeSec: 0,   resolved: true  },
  { id: "INC-0050", type: "geofence",        severity: "info",     vehicle: "AV-010", location: "Pike Place Market Approach", description: "Pedestrian density spike (>200/min) — adaptive speed reduction applied",          time: "10h ago",     responseTimeSec: 0,   resolved: true  },
];

// Incident distribution across 6-hour windows (last 24h)
const INCIDENT_TIMELINE = [
  { window: "00–06", disengagement: 1, emergency_stop: 1, sensor_fault: 0, geofence: 0, comm_loss: 0 },
  { window: "06–12", disengagement: 0, emergency_stop: 0, sensor_fault: 1, geofence: 1, comm_loss: 1 },
  { window: "12–18", disengagement: 1, emergency_stop: 0, sensor_fault: 1, geofence: 1, comm_loss: 0 },
  { window: "18–24", disengagement: 1, emergency_stop: 1, sensor_fault: 1, geofence: 0, comm_loss: 0 },
];

const incidentChartConfig = {
  disengagement:  { label: "Disengagement",  color: "var(--chart-3)" },
  emergency_stop: { label: "Emergency Stop", color: "var(--chart-1)" },
  sensor_fault:   { label: "Sensor Fault",   color: "var(--chart-2)" },
  geofence:       { label: "Geofence",       color: "var(--chart-4)" },
  comm_loss:      { label: "Comm Loss",      color: "var(--chart-5)" },
} satisfies ChartConfig;

// ─── Stat tile with count-up ─────────────────────────────────────────────────

function StatTile({ stat, delay }: { stat: typeof STATS[number]; delay: number }) {
  const Icon = stat.icon;
  const numMatch = stat.value.match(/^([\d.]+)(.*)$/);
  const numericPart = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : "";
  const counted = useCountUp(numericPart, 800 + delay * 120);
  const display = numericPart % 1 !== 0
    ? counted.toFixed(1) + suffix
    : Math.round(counted) + suffix;

  return (
    <div
      className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between gap-2"
      style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: `calc(var(--motion-duration-ultra-fast) * ${delay + 2})`,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground/60 truncate ml-1 text-right leading-tight">{stat.delta}</span>
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">{display}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
      </div>
    </div>
  );
}

// ─── Selected vehicle mini-panel ─────────────────────────────────────────────

function VehicleMiniPanel({ vehicle, onOpenDetail }: { vehicle: Vehicle; onOpenDetail: () => void }) {
  const batteryBg = vehicle.battery < 30 ? "bg-destructive" : vehicle.battery < 50 ? "bg-orange-500" : "bg-green-500";
  const batteryText = vehicle.battery < 30 ? "text-destructive" : vehicle.battery < 50 ? "text-orange-500" : "text-green-500";

  return (
    <div
      className="h-full rounded-lg border bg-muted/20 p-3 space-y-2 overflow-hidden"
      style={{ animation: "var(--anim-expand-in)", animationFillMode: "both" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{vehicle.id}</span>
          <Badge variant={STATUS_VARIANT[vehicle.status]} className="text-[9px] h-4 px-1.5">{vehicle.status}</Badge>
        </div>
        <button
          onClick={onOpenDetail}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-full px-3 py-1 cursor-pointer transition-all active:scale-95 shrink-0"
          style={{ boxShadow: "0 0 10px 1px color-mix(in oklch, var(--destructive) 35%, transparent)" }}
        >
          View Details
          <IconArrowRight className="h-3 w-3" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
        <IconMapPin className="h-3 w-3 shrink-0" />
        {vehicle.location}
      </p>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Battery</span>
          <span className={`text-[10px] font-mono font-semibold ${batteryText}`}>{vehicle.battery}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${batteryBg}`} style={{ width: `${vehicle.battery}%` }} />
        </div>
      </div>
      {vehicle.currentTrip !== "—" && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <IconNavigation className="h-3 w-3 shrink-0" />
          <span className="font-mono">{vehicle.currentTrip}</span>
          <span className="text-muted-foreground/50">· {vehicle.lastPing}</span>
        </p>
      )}
    </div>
  );
}

// ─── Compact vehicle list ─────────────────────────────────────────────────────

function VehicleList({ vehicles, selectedId, onSelect, onOpenDetail, globalFilter, setGlobalFilter }: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenDetail: (id: string) => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
}) {
  const filtered = vehicles.filter((v) =>
    globalFilter === "" ||
    v.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
    v.location.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicles</h2>
        <div className="relative">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-6 h-6 text-xs w-32"
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 divide-y">
        {filtered.map((v, i) => {
          const isSelected = selectedId === v.id;
          const batteryBg = v.battery < 30 ? "bg-destructive" : v.battery < 50 ? "bg-orange-500" : "bg-green-500";
          return (
            <div
              key={v.id}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-muted/40 ${isSelected ? "bg-muted/60" : ""}`}
              onClick={() => onSelect(isSelected ? null : v.id)}
              style={{
                animation: "var(--anim-fade-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.4})`,
                animationFillMode: "both",
              }}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STATUS_COLOR_HEX[v.status] }} />
              <span className="font-mono text-xs font-bold w-12 shrink-0">{v.id}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">{v.location}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${batteryBg}`} style={{ width: `${v.battery}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">{v.battery}%</span>
              </div>
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenDetail(v.id); }}
                  className="text-[10px] text-primary hover:underline shrink-0 cursor-pointer"
                >
                  →
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 px-3 py-2 border-t bg-muted/10 shrink-0">
        {FLEET_SUMMARY.map(({ icon: Icon, label, count }) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon className="h-3 w-3" />{count} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts panel ─────────────────────────────────────────────────────────────

function AlertsPanel({ alerts, filter, onFilterChange }: {
  alerts: Alert[];
  filter: "all" | AlertSeverity;
  onFilterChange: (f: "all" | AlertSeverity) => void;
}) {
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alerts</h2>
          {criticalCount > 0 && (
            <span className="text-[9px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full">
              {criticalCount} critical
            </span>
          )}
        </div>
        <IconShield className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex border-b shrink-0">
        {(["all", "critical", "warning", "info"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={`flex-1 text-[10px] py-1.5 font-medium transition-colors capitalize cursor-pointer ${
              filter === tab ? "text-foreground border-b border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1 divide-y">
        {filtered.map((alert, i) => {
          const style = ALERT_STYLE[alert.severity];
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors"
              style={{
                animation: "var(--anim-fade-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.4})`,
                animationFillMode: "both",
              }}
            >
              <IconAlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">{alert.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{alert.vehicle}</span>
                  <span className="text-[10px] text-muted-foreground/50">{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incidents dashboard card ─────────────────────────────────────────────────

function IncidentListCard({ selectedId, onSelect }: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const active = INCIDENTS.filter((i) => !i.resolved || i.severity === "critical").slice(0, 6);
  return (
    <div className="rounded-lg border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Incidents</h2>
          <span className="text-[9px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full">
            {INCIDENTS.filter((i) => !i.resolved).length} open
          </span>
        </div>
        <IconAlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="overflow-y-auto flex-1 divide-y">
        {active.map((inc, i) => {
          const isSelected = selectedId === inc.id;
          const meta = INCIDENT_TYPE_META[inc.type];
          const TypeIcon = meta.icon;
          const dotColor = inc.severity === "critical" ? "bg-destructive" : inc.severity === "warning" ? "bg-orange-500" : "bg-muted-foreground";
          return (
            <div
              key={inc.id}
              onClick={() => onSelect(isSelected ? null : inc.id)}
              className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${isSelected ? "bg-muted/60" : "hover:bg-muted/40"}`}
              style={{
                animation: "var(--anim-fade-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.4})`,
                animationFillMode: "both",
              }}
            >
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <TypeIcon className={`h-3 w-3 shrink-0 ${meta.color}`} />
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{inc.id}</span>
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">{inc.time}</span>
                </div>
                <p className="text-[11px] leading-snug mt-0.5 truncate">{inc.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{inc.vehicle}</span>
                  {!inc.resolved && (
                    <span className="text-[9px] font-bold text-destructive">OPEN</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incident Review page ────────────────────────────────────────────────────

function IncidentReviewPage({ onBack }: { onBack: () => void }) {
  const [typeFilter, setTypeFilter] = useState<"all" | IncidentType>("all");
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);

  const filtered = INCIDENTS.filter(
    (i) => (typeFilter === "all" || i.type === typeFilter) && (!unresolvedOnly || !i.resolved)
  );

  const criticalCount  = INCIDENTS.filter((i) => i.severity === "critical").length;
  const unresolvedCount = INCIDENTS.filter((i) => !i.resolved).length;
  const withResponse   = INCIDENTS.filter((i) => i.responseTimeSec > 0);
  const avgResponse    = (withResponse.reduce((s, i) => s + i.responseTimeSec, 0) / withResponse.length).toFixed(1);

  const totalCounted   = useCountUp(INCIDENTS.length, 700);
  const criticalCounted = useCountUp(criticalCount, 700);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3"
        style={{ animation: "var(--anim-fade-in)" }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to fleet overview">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">Incident Review</h1>
            <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Last 24h
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seattle Metro · {VEHICLES.length} vehicles · {INCIDENTS.length} recorded events
          </p>
        </div>
        {unresolvedCount > 0 && (
          <span
            className="shrink-0 text-[10px] font-bold bg-destructive/15 text-destructive px-2.5 py-1 rounded-full"
            style={{ animation: "var(--anim-fade-in)", animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)", animationFillMode: "both" }}
          >
            {unresolvedCount} unresolved
          </span>
        )}
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)",
          animationFillMode: "both",
        }}
      >
        {[
          { label: "Total Events",     value: Math.round(totalCounted),    unit: "",   icon: IconChartBar,     delta: "Last 24 hours"          },
          { label: "Critical",         value: Math.round(criticalCounted), unit: "",   icon: IconAlertTriangle, delta: `${unresolvedCount} unresolved` },
          { label: "Avg Response",     value: avgResponse,                 unit: "s",  icon: IconClock,         delta: "Autonomy to safe-stop"  },
          { label: "Safety Score",     value: "94.2",                      unit: "/100", icon: IconShield,      delta: "+1.3 vs yesterday"      },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between gap-2"
              style={{
                animation: "var(--anim-slide-up-in)",
                animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 2})`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground/60 truncate ml-1 text-right leading-tight">{kpi.delta}</span>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums tracking-tight leading-none">
                  {kpi.value}<span className="text-sm font-medium text-muted-foreground ml-0.5">{kpi.unit}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Timeline chart + Category breakdown ─────────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-[1fr_260px]"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 4)",
          animationFillMode: "both",
        }}
      >
        {/* Stacked bar timeline */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-sm font-semibold">Incident Timeline</p>
            <p className="text-xs text-muted-foreground">Distribution across 6-hour windows</p>
          </div>
          <div className="px-3 pb-3">
            <ChartContainer config={incidentChartConfig} className="h-[180px] w-full">
              <BarChart data={INCIDENT_TIMELINE} barSize={32}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="window" tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="disengagement"  stackId="a" fill="var(--color-disengagement)"  radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="emergency_stop" stackId="a" fill="var(--color-emergency_stop)" radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="sensor_fault"   stackId="a" fill="var(--color-sensor_fault)"   radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="geofence"       stackId="a" fill="var(--color-geofence)"       radius={[0,0,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
                <Bar dataKey="comm_loss"      stackId="a" fill="var(--color-comm_loss)"      radius={[4,4,0,0]} animationDuration={cssMs("--motion-duration-slow")} animationEasing={cssCurve("--motion-curve-decelerate-max")} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-sm font-semibold">By Category</p>
            <p className="text-xs text-muted-foreground">Event type distribution</p>
          </div>
          <div className="px-3 pb-3 space-y-3">
            {(Object.entries(INCIDENT_TYPE_META) as [IncidentType, typeof INCIDENT_TYPE_META[IncidentType]][]).map(([type, meta], i) => {
              const count = INCIDENTS.filter((inc) => inc.type === type).length;
              const pct = Math.round((count / INCIDENTS.length) * 100);
              const Icon = meta.icon;
              return (
                <div
                  key={type}
                  className="space-y-1"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i})`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 text-[11px] font-medium ${meta.color}`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${pct}%`, background: `currentColor` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Incident event log ───────────────────────────────────────────── */}
      <div
        className="rounded-lg border bg-muted/20 overflow-hidden"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
          animationFillMode: "both",
        }}
      >
        <div className="px-3 pt-3 pb-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold">Event Log</p>
              <p className="text-xs text-muted-foreground">{filtered.length} events {typeFilter !== "all" ? `· ${INCIDENT_TYPE_META[typeFilter].label}` : ""}</p>
            </div>
            <button
              onClick={() => setUnresolvedOnly((v) => !v)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                unresolvedOnly
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
              }`}
            >
              {unresolvedOnly ? "Unresolved only" : "All events"}
            </button>
          </div>
          {/* Type filter tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {(["all", "disengagement", "emergency_stop", "sensor_fault", "geofence", "comm_loss"] as const).map((tab) => {
              const isAll = tab === "all";
              const label = isAll ? "All" : INCIDENT_TYPE_META[tab].label;
              return (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors font-medium ${
                    typeFilter === tab
                      ? "bg-foreground text-background border-foreground"
                      : "text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-3 pt-4 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No events match the current filter</p>
          ) : (
            filtered.map((incident, i) => {
              const meta = INCIDENT_TYPE_META[incident.type];
              const TypeIcon = meta.icon;
              const severityDot =
                incident.severity === "critical" ? "bg-destructive" :
                incident.severity === "warning"  ? "bg-orange-500"  : "bg-muted-foreground";
              return (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-muted/40 transition-colors"
                  style={{
                    animation: "var(--anim-fade-in)",
                    animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i * 0.3})`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Severity indicator */}
                  <div className="mt-1 flex flex-col items-center gap-1.5 shrink-0">
                    <span className={`h-2 w-2 rounded-full ${severityDot}`} />
                    <TypeIcon className={`h-3.5 w-3.5 ${meta.color}`} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">{incident.id}</span>
                      <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                      <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0">{incident.time}</span>
                    </div>
                    <p className="text-xs leading-snug mt-0.5 text-foreground">{incident.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <IconCarSuv className="h-3 w-3" />
                        {incident.vehicle}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <IconMapPin className="h-3 w-3" />
                        {incident.location}
                      </span>
                      {incident.responseTimeSec > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <IconClock className="h-3 w-3" />
                          {incident.responseTimeSec}s response
                        </span>
                      )}
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${incident.resolved ? "text-green-500" : "text-destructive"}`}>
                        {incident.resolved
                          ? <IconCircleCheck className="h-3 w-3" />
                          : <IconCircleX className="h-3 w-3" />
                        }
                        {incident.resolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-pages ──────────────────────────────────────────────────────────────

function FleetOverviewPage({ onSelectVehicle, onGoToIncidents }: { onSelectVehicle: (id: string) => void; onGoToIncidents: () => void }) {
  const [selectedVehicle,  setSelectedVehicle]  = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [alertFilter,      setAlertFilter]      = useState<"all" | AlertSeverity>("all");
  const [globalFilter,     setGlobalFilter]     = useState("");

  const selectedV = selectedVehicle ? VEHICLES.find((v) => v.id === selectedVehicle) ?? null : null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-5">

      {/* Header — compact single line */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "var(--anim-fade-in)" }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Fleet Operations</h1>
          <p className="text-xs text-muted-foreground">Seattle Metro · {VEHICLES.length} vehicles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToIncidents}
            className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-full px-3 py-1.5 transition-colors cursor-pointer"
          >
            <span className="relative flex items-center">
              <IconAlertTriangle className="h-3.5 w-3.5 text-destructive animate-ping absolute opacity-60" />
              <IconAlertTriangle className="h-3.5 w-3.5 text-destructive relative" />
            </span>
            INCIDENTS
            <span className="font-mono font-bold text-destructive">
              {INCIDENTS.filter((i) => i.severity === "critical").length}
            </span>
          </button>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">LIVE</span>
        </div>
      </div>

      {/* ── Hero row: Map + Stats ─────────────────────────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-[1fr_340px]"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 2)",
          animationFillMode: "both",
        }}
      >
        {/* Tactical map */}
        <div className="h-[352px]">
          <FleetMap
            vehicles={VEHICLES}
            selectedId={selectedVehicle}
            onSelect={setSelectedVehicle}
            selectedIncidentId={selectedIncident}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        {/* Right column: vehicle panel (top) + stat tiles (below) */}
        <div className="flex flex-col gap-3">
          {/* Vehicle panel — fixed height always, content never shifts layout */}
          <div className="h-[148px] shrink-0 overflow-hidden">
            {selectedV ? (
              <VehicleMiniPanel
                vehicle={selectedV}
                onOpenDetail={() => onSelectVehicle(selectedV.id)}
              />
            ) : (
              <div className="h-full rounded-lg border bg-muted/10 px-4 text-center flex flex-col items-center justify-center gap-2">
                <IconNavigation className="h-5 w-5 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground/60">Select a vehicle on the map</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1">
            {STATS.map((s, i) => (
              <StatTile key={s.label} stat={s} delay={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Vehicles | Incidents | Alerts ────────────────────── */}
      <div
        className="grid gap-4 lg:grid-cols-3"
        style={{
          animation: "var(--anim-slide-up-in)",
          animationDelay: "calc(var(--motion-duration-ultra-fast) * 4)",
          animationFillMode: "both",
          minHeight: "280px",
        }}
      >
        <VehicleList
          vehicles={VEHICLES}
          selectedId={selectedVehicle}
          onSelect={setSelectedVehicle}
          onOpenDetail={onSelectVehicle}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <IncidentListCard
          selectedId={selectedIncident}
          onSelect={setSelectedIncident}
        />
        <AlertsPanel
          alerts={ALERTS}
          filter={alertFilter}
          onFilterChange={setAlertFilter}
        />
      </div>
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
            <div key={s.label} className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between gap-2" style={{
              animation: "var(--anim-slide-up-in)",
              animationDelay: `calc(var(--motion-duration-ultra-fast) * ${i + 1})`,
              animationFillMode: "both",
            }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.label === "Battery" ? batteryColor : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums tracking-tight leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Battery bar */}
      <div className="rounded-lg border bg-muted/20 p-3" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 5)",
        animationFillMode: "both",
      }}>
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
      </div>

      {/* Distance chart + Sensor grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 6)",
        animationFillMode: "both",
      }}>
        {/* Distance per hour */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-sm font-semibold">Distance by Hour</p>
            <p className="text-xs text-muted-foreground">Miles driven today</p>
          </div>
          <div className="px-3 pb-3">
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
          </div>
        </div>

        {/* Sensor status grid */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-sm font-semibold">Sensor Status</p>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </div>
          <div className="px-3 pb-3">
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
          </div>
        </div>
      </div>

      {/* Event log + Vehicle alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]" style={{
        animation: "var(--anim-slide-up-in)",
        animationDelay: "calc(var(--motion-duration-ultra-fast) * 7)",
        animationFillMode: "both",
      }}>
        {/* Event log */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b">
            <p className="text-sm font-semibold">Event Log</p>
            <p className="text-xs text-muted-foreground">Recent vehicle activity</p>
          </div>
          <div className="px-1 py-1 space-y-0.5">
            {VEHICLE_EVENTS.map((evt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/40 transition-colors"
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
          </div>
        </div>

        {/* Vehicle-specific alerts */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Alerts for {vehicle.id}</p>
            </div>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-1 py-1 space-y-0.5">
            {vehicleAlerts.length > 0 ? vehicleAlerts.map((alert, i) => {
              const style = ALERT_STYLE[alert.severity];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/40 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root with page transitions ─────────────────────────────────────────────

type FleetPage = "overview" | "detail" | "incidents";
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

  const goToOverview   = () => navigate("overview");
  const goToIncidents  = () => navigate("incidents");

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
        {displayPage === "overview"   && <FleetOverviewPage onSelectVehicle={goToDetail} onGoToIncidents={goToIncidents} />}
        {displayPage === "detail"     && <VehicleDetailPage vehicleId={detailVehicleId} onBack={goToOverview} />}
        {displayPage === "incidents"  && <IncidentReviewPage onBack={goToOverview} />}
      </div>
    </div>
  );
}
