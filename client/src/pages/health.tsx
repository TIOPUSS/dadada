import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Server,
  AppWindow,
  WifiOff,
  Cpu,
  Activity,
  AlertTriangle,
  Code2,
  RefreshCw,
  Layers,
  Wrench,
  Globe,
  Database,
  HardDrive,
  Users,
} from "lucide-react";
import type { App, Developer, KanbanTask, VpsServer, VpsAppLink, VpsDatabase, VpsDbAppLink, Client, AppClient } from "@shared/schema";

interface VpsMetricData {
  cpuPercent: string;
  memoryPercent: string;
  diskPercent: string;
}

interface AppMetricData {
  status: string;
  responseTimeMs: number | null;
  monitorType: string;
}

interface ActiveAlertData {
  targetType: string;
  targetId: string | null;
  severity: string;
  message: string | null;
}

interface HealthMapData {
  vpsServers: VpsServer[];
  apps: App[];
  links: VpsAppLink[];
  developers: Developer[];
  tasks: KanbanTask[];
  databases: VpsDatabase[];
  dbAppLinks: VpsDbAppLink[];
  clients: Client[];
  appClients: AppClient[];
  vpsMetrics?: Record<string, VpsMetricData>;
  appMetrics?: Record<string, AppMetricData>;
  activeAlerts?: ActiveAlertData[];
}

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active: { dot: "#22c55e", bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Ativo" },
  in_dev: { dot: "#a78bfa", bg: "bg-violet-500/15", text: "text-violet-400", label: "Em Dev" },
  staging: { dot: "#22d3ee", bg: "bg-cyan-500/15", text: "text-cyan-400", label: "Staging" },
  paused: { dot: "#f59e0b", bg: "bg-amber-500/15", text: "text-amber-400", label: "Pausado" },
  disabled: { dot: "#ef4444", bg: "bg-red-500/15", text: "text-red-400", label: "Inativo" },
  archived: { dot: "#10b981", bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Concluído" },
  backlog: { dot: "#94a3b8", bg: "bg-slate-500/15", text: "text-slate-400", label: "Backlog" },
  waiting: { dot: "#f59e0b", bg: "bg-amber-500/15", text: "text-amber-400", label: "Aguardando" },
  dev: { dot: "#a78bfa", bg: "bg-violet-500/15", text: "text-violet-400", label: "Dev" },
};

const VPS_STATUS_COLORS: Record<string, { dot: string; label: string; ring: string }> = {
  online: { dot: "#22c55e", label: "Online", ring: "ring-emerald-500/30" },
  offline: { dot: "#ef4444", label: "Offline", ring: "ring-red-500/30" },
  maintenance: { dot: "#f59e0b", label: "Manutenção", ring: "ring-amber-500/30" },
  unknown: { dot: "#6b7280", label: "Verificando...", ring: "ring-gray-500/30" },
};

const DB_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  postgresql: { color: "text-blue-400", bg: "bg-blue-500/15" },
  mysql: { color: "text-orange-400", bg: "bg-orange-500/15" },
  mongodb: { color: "text-green-400", bg: "bg-green-500/15" },
  redis: { color: "text-red-400", bg: "bg-red-500/15" },
  sqlite: { color: "text-cyan-400", bg: "bg-cyan-500/15" },
  mariadb: { color: "text-amber-400", bg: "bg-amber-500/15" },
  mssql: { color: "text-violet-400", bg: "bg-violet-500/15" },
};

const ORIGIN_LABELS: Record<string, string> = {
  acelera: "Acelera IT",
  opus: "Opus",
  both: "Ambos",
  thecorp: "TheCorp",
  vittaverde: "VittaVerde",
};

const TYPE_ICONS: Record<string, typeof AppWindow> = {
  saas: Globe,
  internal: Layers,
  custom: Code2,
  automation: Wrench,
  ai_agent: Cpu,
};

function formatBytes(bytes: string | null): string {
  if (!bytes) return "N/A";
  const n = parseInt(bytes);
  if (isNaN(n)) return bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = clamped > 80 ? "#ef4444" : clamped > 60 ? "#f59e0b" : color;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-8 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${clamped}%`, backgroundColor: barColor }} />
      </div>
      <span className="text-[9px] font-mono w-8 text-right" style={{ color: barColor }}>{clamped}%</span>
    </div>
  );
}

function VpsNode({ data }: { data: any }) {
  const vps: VpsServer = data.vps;
  const linkedAppsCount: number = data.linkedAppsCount;
  const linkedDbsCount: number = data.linkedDbsCount;
  const metrics: VpsMetricData | null = data.metrics;
  const hasAlert: boolean = data.hasAlert;
  const statusCfg = VPS_STATUS_COLORS[vps.status] || VPS_STATUS_COLORS.unknown;

  return (
    <div
      className={`relative rounded-2xl border-2 bg-card/95 backdrop-blur-sm shadow-xl min-w-[270px] transition-all ${hasAlert ? "border-red-500/60" : "border-blue-500/50"}`}
      data-testid={`node-vps-${vps.id}`}
    >
      {hasAlert && (
        <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 animate-pulse" data-testid={`alert-indicator-vps-${vps.id}`}>
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background !-top-1.5" />

      <div className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-500/10 border-b border-blue-500/30 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Servidor VPS</span>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${vps.status === "online" ? "animate-pulse" : ""}`}
            style={{ backgroundColor: statusCfg.dot }}
          />
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-bold truncate">{vps.name}</p>
        <p className="text-[10px] text-blue-400/70 font-mono mt-0.5">{vps.ip}:{vps.port}</p>
      </div>

      {metrics && (
        <div className="px-4 pb-2 space-y-1" data-testid={`metrics-vps-${vps.id}`}>
          <MiniBar label="CPU" value={Number(metrics.cpuPercent)} color="#3b82f6" />
          <MiniBar label="RAM" value={Number(metrics.memoryPercent)} color="#8b5cf6" />
          <MiniBar label="Disco" value={Number(metrics.diskPercent)} color="#22c55e" />
        </div>
      )}

      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><AppWindow className="w-3 h-3" /> Apps</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/30">{linkedAppsCount}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Database className="w-3 h-3" /> Bancos</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/30">{linkedDbsCount}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground">Status</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${statusCfg.dot}15` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
            <span className="text-[10px] font-semibold" style={{ color: statusCfg.dot }}>{statusCfg.label}</span>
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background !-bottom-1.5" />
    </div>
  );
}

function AppNode({ data }: { data: any }) {
  const app: App = data.app;
  const devName: string = data.devName;
  const pendingTasks: number = data.pendingTasks;
  const criticalTasks: number = data.criticalTasks;
  const isLinked: boolean = data.isLinked;
  const hasDb: boolean = data.hasDb;
  const clients: Client[] = data.clients || [];
  const appMetric: AppMetricData | null = data.appMetric;
  const hasAlert: boolean = data.hasAlert;
  const [showClients, setShowClients] = useState(false);

  const statusCfg = STATUS_COLORS[app.status] || STATUS_COLORS.disabled;
  const isOnline = ["active", "in_dev", "staging", "archived"].includes(app.status);
  const TypeIcon = TYPE_ICONS[app.type || "custom"] || AppWindow;

  return (
    <div
      className={`relative rounded-2xl border-2 bg-card/95 backdrop-blur-sm shadow-lg min-w-[230px] transition-all ${hasAlert ? "border-red-500/50" : "border-violet-500/40"}`}
      data-testid={`node-app-${app.id}`}
    >
      {hasAlert && (
        <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 animate-pulse" data-testid={`alert-indicator-app-${app.id}`}>
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background !-top-1.5" />

      <div className="px-4 py-2 bg-gradient-to-r from-violet-600/25 to-violet-500/5 border-b border-violet-500/25 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppWindow className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Aplicativo</span>
          </div>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }} />
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
            {isOnline ? (
              <TypeIcon className={`w-3.5 h-3.5 ${statusCfg.text}`} />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{app.name}</p>
            <p className="text-[10px] text-violet-400/60">{ORIGIN_LABELS[app.origin || "acelera"]}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Code2 className="w-3 h-3" /> Dev</span>
          <span className="text-[10px] font-medium truncate max-w-[120px]">{devName}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Status</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Tasks</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono">{pendingTasks}</span>
            {criticalTasks > 0 && (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />{criticalTasks}
              </span>
            )}
          </div>
        </div>
        {clients.length > 0 && (
          <div className="pt-1 border-t border-border/20">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowClients(!showClients); }}
              className="flex items-center justify-between w-full text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              data-testid={`button-toggle-clients-${app.id}`}
            >
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {clients.length} cliente{clients.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[9px]">{showClients ? "▲" : "▼"}</span>
            </button>
            {showClients && (
              <div className="mt-1.5 space-y-1" data-testid={`list-clients-${app.id}`}>
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                    data-testid={`client-item-${client.id}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-cyan-300 truncate">{client.name}</p>
                      {client.status && (
                        <p className="text-[8px] text-cyan-400/50">{client.status === "active" ? "Ativo" : "Inativo"}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {appMetric && (
          <div className="pt-1.5 border-t border-border/20" data-testid={`monitor-app-${app.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Monitor</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${appMetric.status === "up" ? "bg-emerald-500" : appMetric.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                <span className={`text-[10px] font-semibold ${appMetric.status === "up" ? "text-emerald-400" : appMetric.status === "degraded" ? "text-amber-400" : "text-red-400"}`}>
                  {appMetric.status === "up" ? "UP" : appMetric.status === "degraded" ? "LENTO" : "DOWN"}
                </span>
                {appMetric.responseTimeMs !== null && (
                  <span className="text-[9px] text-muted-foreground font-mono">{appMetric.responseTimeMs}ms</span>
                )}
              </div>
            </div>
          </div>
        )}
        {!isLinked && (
          <div className="text-[9px] text-amber-400/80 flex items-center gap-1 pt-1 border-t border-border/20">
            <AlertTriangle className="w-2.5 h-2.5" />Sem VPS vinculado
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background !-bottom-1.5" />
    </div>
  );
}

function DbNode({ data }: { data: any }) {
  const dbInfo: VpsDatabase = data.db;
  const linkedAppsCount: number = data.linkedAppsCount;
  const hasAlert: boolean = data.hasAlert;
  const typeCfg = DB_TYPE_COLORS[dbInfo.type] || DB_TYPE_COLORS.postgresql;
  const statusCfg = VPS_STATUS_COLORS[dbInfo.status] || VPS_STATUS_COLORS.unknown;

  return (
    <div
      className={`relative rounded-2xl border-2 bg-card/95 backdrop-blur-sm shadow-lg min-w-[210px] transition-all ${hasAlert ? "border-red-500/50" : "border-emerald-500/40"}`}
      data-testid={`node-db-${dbInfo.id}`}
    >
      {hasAlert && (
        <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 animate-pulse" data-testid={`alert-indicator-db-${dbInfo.id}`}>
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background !-top-1.5" />

      <div className="px-4 py-2 bg-gradient-to-r from-emerald-600/25 to-emerald-500/5 border-b border-emerald-500/25 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Banco de Dados</span>
          </div>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }} />
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${typeCfg.bg} flex items-center justify-center flex-shrink-0`}>
            <Database className={`w-3.5 h-3.5 ${typeCfg.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{dbInfo.name}</p>
            <p className="text-[10px] text-emerald-400/60 font-mono uppercase">{dbInfo.type}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Host</span>
          <span className="text-[10px] font-mono text-foreground/70 truncate max-w-[120px]">{dbInfo.host}:{dbInfo.port}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Database</span>
          <span className="text-[10px] font-mono text-foreground/70 truncate max-w-[120px]">{dbInfo.databaseName}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><HardDrive className="w-3 h-3" /> Tamanho</span>
          <span className="text-[10px] font-mono">{formatBytes(dbInfo.sizeBytes)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><AppWindow className="w-3 h-3" /> Apps</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30">{linkedAppsCount}</Badge>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background !-bottom-1.5" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  vpsNode: VpsNode,
  appNode: AppNode,
  dbNode: DbNode,
};

const POSITIONS_KEY = "acelera-health-map-positions-v2";

function savePositions(nodes: Node[]) {
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n) => { positions[n.id] = n.position; });
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

function loadPositions(): Record<string, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function buildGraph(data: HealthMapData) {
  const saved = loadPositions();
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const vpsServers = data.vpsServers;
  const filteredApps = data.apps;
  const linkedAppIds = new Set(data.links.map((l) => l.appId));
  const unlinkedApps = filteredApps.filter((a) => !linkedAppIds.has(a.id));
  const dbLinkedAppIds = new Set(data.dbAppLinks.map((l) => l.appId));

  const TIER_VPS_Y = 50;
  const TIER_APP_Y = 350;
  const TIER_DB_Y = 650;
  const TIER_UNLINKED_Y = 350;
  const COL_SPACING = 320;
  const APP_COL_SPACING = 280;
  const DB_COL_SPACING = 260;

  const totalVpsWidth = (vpsServers.length - 1) * COL_SPACING;
  const vpsStartX = Math.max(0, -totalVpsWidth / 2);

  const activeAlerts = data.activeAlerts || [];
  const vpsAlertIds = new Set(activeAlerts.filter((a) => a.targetType === "vps").map((a) => a.targetId));
  const appAlertIds = new Set(activeAlerts.filter((a) => a.targetType === "app").map((a) => a.targetId));
  const dbAlertIds = new Set(activeAlerts.filter((a) => a.targetType === "db").map((a) => a.targetId));

  vpsServers.forEach((vps, i) => {
    const id = `vps-${vps.id}`;
    const linkedCount = data.links.filter((l) => l.vpsId === vps.id).length;
    const dbCount = data.databases.filter((d) => d.vpsId === vps.id).length;
    nodes.push({
      id,
      type: "vpsNode",
      position: saved[id] || { x: vpsStartX + i * COL_SPACING, y: TIER_VPS_Y },
      data: {
        vps, linkedAppsCount: linkedCount, linkedDbsCount: dbCount,
        metrics: data.vpsMetrics?.[vps.id] || null,
        hasAlert: vpsAlertIds.has(vps.id),
      },
    });
  });

  const vpsAppCounters: Record<string, number> = {};

  data.links.forEach((link) => {
    const app = filteredApps.find((a) => a.id === link.appId);
    if (!app) return;

    const appNodeId = `app-${link.appId}`;
    const vpsNodeId = `vps-${link.vpsId}`;
    const vpsIndex = vpsServers.findIndex((v) => v.id === link.vpsId);
    if (vpsIndex < 0) return;

    const appIdx = vpsAppCounters[link.vpsId] || 0;
    vpsAppCounters[link.vpsId] = appIdx + 1;

    const vpsApps = data.links.filter((l) => l.vpsId === link.vpsId).length;
    const appsWidth = (vpsApps - 1) * APP_COL_SPACING;
    const appStartX = vpsStartX + vpsIndex * COL_SPACING + (COL_SPACING - appsWidth) / 2 - APP_COL_SPACING / 2 + 20;

    if (!nodes.find((n) => n.id === appNodeId)) {
      const dev = data.developers.find((d) => d.id === app.devResponsibleId);
      const appTasks = data.tasks.filter((t) => t.appId === app.id && t.status !== "done");
      const linkedClientIds = (data.appClients || []).filter((ac: AppClient) => ac.appId === app.id).map((ac: AppClient) => ac.clientId);
      const appLinkedClients = (data.clients || []).filter((c: Client) => linkedClientIds.includes(c.id));

      nodes.push({
        id: appNodeId,
        type: "appNode",
        position: saved[appNodeId] || { x: appStartX + appIdx * APP_COL_SPACING, y: TIER_APP_Y },
        data: {
          app,
          devName: dev?.name || "---",
          pendingTasks: appTasks.length,
          criticalTasks: appTasks.filter((t) => t.priority === "critical").length,
          isLinked: true,
          hasDb: dbLinkedAppIds.has(app.id),
          clients: appLinkedClients,
          appMetric: data.appMetrics?.[app.id] || null,
          hasAlert: appAlertIds.has(app.id),
        },
      });
    }

    const isOnline = ["active", "in_dev", "staging", "archived"].includes(app.status);
    edges.push({
      id: `edge-vps-app-${link.id}`,
      source: vpsNodeId,
      target: appNodeId,
      type: "smoothstep",
      animated: isOnline,
      style: { stroke: isOnline ? "#a78bfa" : "#6b7280", strokeWidth: 2, opacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isOnline ? "#a78bfa" : "#6b7280", width: 14, height: 14 },
    });
  });

  if (unlinkedApps.length > 0) {
    const allLinkedX = nodes.filter(n => n.type === "appNode").map(n => n.position.x);
    const maxLinkedX = allLinkedX.length > 0 ? Math.max(...allLinkedX) + APP_COL_SPACING + 100 : vpsStartX + totalVpsWidth + 200;

    unlinkedApps.forEach((app, i) => {
      const appNodeId = `app-${app.id}`;
      if (nodes.find((n) => n.id === appNodeId)) return;
      const dev = data.developers.find((d) => d.id === app.devResponsibleId);
      const appTasks = data.tasks.filter((t) => t.appId === app.id && t.status !== "done");
      const linkedClientIds = (data.appClients || []).filter((ac: AppClient) => ac.appId === app.id).map((ac: AppClient) => ac.clientId);
      const appLinkedClients = (data.clients || []).filter((c: Client) => linkedClientIds.includes(c.id));

      nodes.push({
        id: appNodeId,
        type: "appNode",
        position: saved[appNodeId] || { x: maxLinkedX + (i % 3) * APP_COL_SPACING, y: TIER_UNLINKED_Y + Math.floor(i / 3) * 240 },
        data: {
          app,
          devName: dev?.name || "---",
          pendingTasks: appTasks.length,
          criticalTasks: appTasks.filter((t) => t.priority === "critical").length,
          isLinked: false,
          hasDb: dbLinkedAppIds.has(app.id),
          clients: appLinkedClients,
          appMetric: data.appMetrics?.[app.id] || null,
          hasAlert: appAlertIds.has(app.id),
        },
      });
    });
  }

  const vpsDbCounters: Record<string, number> = {};

  data.databases.forEach((dbInfo) => {
    const dbNodeId = `db-${dbInfo.id}`;
    const vpsNodeId = `vps-${dbInfo.vpsId}`;
    const vpsIndex = vpsServers.findIndex((v) => v.id === dbInfo.vpsId);
    if (vpsIndex < 0) return;

    const dbIdx = vpsDbCounters[dbInfo.vpsId] || 0;
    vpsDbCounters[dbInfo.vpsId] = dbIdx + 1;

    const vpsDbs = data.databases.filter((d) => d.vpsId === dbInfo.vpsId).length;
    const dbsWidth = (vpsDbs - 1) * DB_COL_SPACING;
    const dbStartX = vpsStartX + vpsIndex * COL_SPACING + (COL_SPACING - dbsWidth) / 2 - DB_COL_SPACING / 2 + 30;

    const linkedDbApps = data.dbAppLinks.filter((l) => l.databaseId === dbInfo.id).length;

    nodes.push({
      id: dbNodeId,
      type: "dbNode",
      position: saved[dbNodeId] || { x: dbStartX + dbIdx * DB_COL_SPACING, y: TIER_DB_Y },
      data: { db: dbInfo, linkedAppsCount: linkedDbApps, hasAlert: dbAlertIds.has(dbInfo.id) },
    });

    const dbOnline = dbInfo.status === "online";
    edges.push({
      id: `edge-vps-db-${dbInfo.id}`,
      source: vpsNodeId,
      target: dbNodeId,
      type: "smoothstep",
      animated: dbOnline,
      style: { stroke: dbOnline ? "#22c55e" : "#6b7280", strokeWidth: 2, opacity: 0.5, strokeDasharray: "6 3" },
      markerEnd: { type: MarkerType.ArrowClosed, color: dbOnline ? "#22c55e" : "#6b7280", width: 14, height: 14 },
    });
  });

  data.dbAppLinks.forEach((link) => {
    const dbNodeId = `db-${link.databaseId}`;
    const appNodeId = `app-${link.appId}`;
    if (!nodes.find((n) => n.id === dbNodeId) || !nodes.find((n) => n.id === appNodeId)) return;

    edges.push({
      id: `edge-db-app-${link.id}`,
      source: appNodeId,
      target: dbNodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#22c55e", strokeWidth: 1.5, opacity: 0.4 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e", width: 12, height: 12 },
    });
  });

  return { nodes, edges };
}

export default function Health() {
  const { data: mapData, isLoading, refetch } = useQuery<HealthMapData>({
    queryKey: ["/api/health-map"],
    refetchInterval: 30000,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (mapData && !initialized) {
      const { nodes: n, edges: e } = buildGraph(mapData);
      setNodes(n);
      setEdges(e);
      setInitialized(true);
    }
  }, [mapData, initialized]);

  useEffect(() => {
    if (mapData && initialized) {
      const { edges: newEdges } = buildGraph(mapData);
      setEdges(newEdges);
      const alerts = mapData.activeAlerts || [];
      const vpsAlerts = new Set(alerts.filter((a) => a.targetType === "vps").map((a) => a.targetId));
      const appAlerts = new Set(alerts.filter((a) => a.targetType === "app").map((a) => a.targetId));
      const dbAlerts = new Set(alerts.filter((a) => a.targetType === "db").map((a) => a.targetId));
      setNodes((prev) =>
        prev.map((node) => {
          if (node.type === "vpsNode") {
            const vps = mapData.vpsServers.find((v) => `vps-${v.id}` === node.id);
            if (vps) {
              const linkedCount = mapData.links.filter((l) => l.vpsId === vps.id).length;
              const dbCount = mapData.databases.filter((d) => d.vpsId === vps.id).length;
              return { ...node, data: { ...node.data, vps, linkedAppsCount: linkedCount, linkedDbsCount: dbCount, metrics: mapData.vpsMetrics?.[vps.id] || null, hasAlert: vpsAlerts.has(vps.id) } };
            }
          }
          if (node.type === "appNode") {
            const app = mapData.apps.find((a) => `app-${a.id}` === node.id);
            if (app) {
              const dev = mapData.developers.find((d) => d.id === app.devResponsibleId);
              const appTasks = mapData.tasks.filter((t) => t.appId === app.id && t.status !== "done");
              const linkedClientIds = (mapData.appClients || []).filter((ac: any) => ac.appId === app.id).map((ac: any) => ac.clientId);
              const appLinkedClients = (mapData.clients || []).filter((c) => linkedClientIds.includes(c.id));
              return {
                ...node,
                data: {
                  ...node.data,
                  app,
                  devName: dev?.name || "---",
                  pendingTasks: appTasks.length,
                  criticalTasks: appTasks.filter((t: any) => t.priority === "critical").length,
                  clients: appLinkedClients,
                  appMetric: mapData.appMetrics?.[app.id] || null,
                  hasAlert: appAlerts.has(app.id),
                },
              };
            }
          }
          if (node.type === "dbNode") {
            const dbInfo = mapData.databases.find((d) => `db-${d.id}` === node.id);
            if (dbInfo) {
              const linkedDbApps = mapData.dbAppLinks.filter((l) => l.databaseId === dbInfo.id).length;
              return { ...node, data: { ...node.data, db: dbInfo, linkedAppsCount: linkedDbApps, hasAlert: dbAlerts.has(dbInfo.id) } };
            }
          }
          return node;
        })
      );
    }
  }, [mapData, initialized]);

  const onNodeDragStop = useCallback(
    () => { savePositions(nodes); },
    [nodes]
  );

  const stats = useMemo(() => {
    if (!mapData) return { vpsOnline: 0, vpsOffline: 0, totalApps: 0, totalVps: 0, totalDbs: 0, linkedApps: 0, unlinkedApps: 0, onlineApps: 0 };
    const filteredApps = mapData.apps;
    const onlineApps = filteredApps.filter((a) => ["active", "in_dev", "staging", "archived"].includes(a.status));
    const linkedIds = new Set(mapData.links.map((l) => l.appId));
    return {
      vpsOnline: mapData.vpsServers.filter((v) => v.status === "online").length,
      vpsOffline: mapData.vpsServers.filter((v) => v.status !== "online").length,
      totalApps: filteredApps.length,
      totalVps: mapData.vpsServers.length,
      totalDbs: mapData.databases.length,
      linkedApps: filteredApps.filter((a) => linkedIds.has(a.id)).length,
      unlinkedApps: filteredApps.filter((a) => !linkedIds.has(a.id)).length,
      onlineApps: onlineApps.length,
    };
  }, [mapData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="page-health">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]" data-testid="page-health">
      <div
        className="flex-1 rounded-xl border border-border/30 overflow-hidden relative"
        style={{ background: "hsl(var(--background))" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.08)" />
          <Controls
            className="!bg-card !border-border/30 !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border/30 [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          />
          <MiniMap
            className="!bg-card/90 !border-border/30 !rounded-lg"
            nodeColor={(n) => {
              if (n.type === "vpsNode") return "#3b82f6";
              if (n.type === "dbNode") return "#22c55e";
              return "#a78bfa";
            }}
            maskColor="hsl(var(--background) / 0.8)"
          />

          <Panel position="top-left" className="!m-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">Mapa de Infraestrutura</span>
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm text-xs text-muted-foreground transition-colors hover:text-foreground"
                data-testid="button-refresh-health"
              >
                <RefreshCw className="w-3 h-3" />
                Atualizar
              </button>
            </div>
          </Panel>

          <Panel position="top-right" className="!m-3">
            <div className="flex flex-col gap-2" data-testid="panel-health-stats">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium">VPS</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {stats.vpsOnline} on
                </Badge>
                {stats.vpsOffline > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-red-500/10 text-red-400 border-red-500/30">
                    {stats.vpsOffline} off
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <AppWindow className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-medium">Apps</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {stats.totalApps}
                </Badge>
                {stats.unlinkedApps > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-400 border-amber-500/30">
                    {stats.unlinkedApps} soltos
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium">Bancos</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {stats.totalDbs}
                </Badge>
              </div>
            </div>
          </Panel>

          <Panel position="bottom-left" className="!m-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
                  VPS Server
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-violet-500/30 border border-violet-500/50" />
                  Aplicativo
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                  Banco de Dados
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-violet-500 rounded" />
                  VPS → App
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-emerald-500 rounded border-dashed" style={{ borderTop: "2px dashed #22c55e", height: 0 }} />
                  VPS → DB
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-emerald-500/60 rounded" />
                  App → DB
                </div>
              </div>
            </div>
          </Panel>

          <Panel position="bottom-right" className="!m-3">
            <div className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground/60 uppercase tracking-wider text-[9px]">Hierarquia</span>
              <div className="flex items-center gap-1.5">
                <Server className="w-3 h-3 text-blue-400" />
                <span>Servidores (topo)</span>
              </div>
              <div className="flex items-center gap-1.5 pl-3">
                <AppWindow className="w-3 h-3 text-violet-400" />
                <span>Aplicativos (meio)</span>
              </div>
              <div className="flex items-center gap-1.5 pl-6">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Bancos (base)</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
