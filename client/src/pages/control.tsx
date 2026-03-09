import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Monitor,
  Server,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Wifi,
  WifiOff,
  Bell,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface VpsWithMetric {
  id: string;
  name: string;
  ip: string;
  status: string;
  os: string | null;
  latestMetric: {
    cpuPercent: string | null;
    memoryPercent: string | null;
    diskPercent: string | null;
    loadAvg1: string | null;
    processCount: number | null;
    uptimeSeconds: number | null;
    networkIn: string | null;
    networkOut: string | null;
    collectedAt: string;
  } | null;
}

interface AppMonitorWithMetric {
  id: string;
  appId: string;
  monitorType: string;
  endpoint: string | null;
  enabled: boolean;
  latestMetric: {
    status: string;
    responseTimeMs: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    collectedAt: string;
  } | null;
}

interface DbWithMetric {
  id: string;
  name: string;
  type: string;
  vpsId: string;
  status: string | null;
  latestMetric: {
    status: string;
    connectionsActive: number | null;
    sizeBytes: string | null;
    responseTimeMs: number | null;
    collectedAt: string;
  } | null;
}

interface AlertItem {
  id: string;
  targetType: string;
  targetId: string | null;
  metric: string;
  value: string | null;
  threshold: string | null;
  severity: string;
  status: string;
  message: string | null;
  firedAt: string;
  resolvedAt: string | null;
}

interface OverviewData {
  vps: VpsWithMetric[];
  appMonitors: AppMonitorWithMetric[];
  databases: DbWithMetric[];
  alerts: AlertItem[];
  summary: {
    vpsOnline: number;
    vpsTotal: number;
    appsUp: number;
    appsTotal: number;
    dbsUp: number;
    dbsTotal: number;
    activeAlerts: number;
  };
}

interface VpsMetricPoint {
  id: string;
  cpuPercent: string | null;
  memoryPercent: string | null;
  diskPercent: string | null;
  loadAvg1: string | null;
  collectedAt: string;
}

function formatUptime(seconds: number | null): string {
  if (!seconds) return "---";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes: string | null): string {
  if (!bytes) return "---";
  const n = parseFloat(bytes);
  if (isNaN(n)) return bytes;
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function GaugeRing({ value, color, size = 60, label }: { value: number; color: string; size?: number; label: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const gaugeColor = value > 90 ? "#ef4444" : value > 70 ? "#f59e0b" : color;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth="4" fill="none" opacity="0.3" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={gaugeColor} strokeWidth="4" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono" style={{ color: gaugeColor }}>{value.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function MonitoringPage() {
  const { toast } = useToast();
  const [selectedVps, setSelectedVps] = useState<string | null>(null);
  const [chartHours, setChartHours] = useState("24");
  const [expandedVps, setExpandedVps] = useState<Set<string>>(new Set());

  const { data: overview, isLoading } = useQuery<OverviewData>({
    queryKey: ["/api/monitoring/overview"],
    refetchInterval: 30000,
  });

  const { data: apps } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/apps"],
  });

  const { data: vpsMetrics } = useQuery<VpsMetricPoint[]>({
    queryKey: ["/api/monitoring/vps", selectedVps, "metrics", chartHours],
    queryFn: async () => {
      if (!selectedVps) return [];
      const res = await fetch(`/api/monitoring/vps/${selectedVps}/metrics?hours=${chartHours}`);
      return res.json();
    },
    enabled: !!selectedVps,
    refetchInterval: 60000,
  });

  const { data: alertHistory } = useQuery<AlertItem[]>({
    queryKey: ["/api/monitoring/alerts"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/vps/monitor-all");
    },
    onSuccess: () => {
      toast({ title: "Monitoramento iniciado" });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/monitoring/overview"] });
      }, 5000);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/monitoring/alerts/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alerts"] });
      toast({ title: "Alerta resolvido" });
    },
  });

  useEffect(() => {
    if (overview?.vps?.length && !selectedVps) {
      setSelectedVps(overview.vps[0].id);
    }
  }, [overview, selectedVps]);

  const chartData = (vpsMetrics || []).map((m) => ({
    time: new Date(m.collectedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    cpu: parseFloat(m.cpuPercent || "0"),
    memory: parseFloat(m.memoryPercent || "0"),
    disk: parseFloat(m.diskPercent || "0"),
    load: parseFloat(m.loadAvg1 || "0"),
  }));

  const getAppName = (appId: string) => apps?.find(a => a.id === appId)?.name || appId.slice(0, 8);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="page-monitoring">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  const s = overview?.summary || { vpsOnline: 0, vpsTotal: 0, appsUp: 0, appsTotal: 0, dbsUp: 0, dbsTotal: 0, activeAlerts: 0 };

  return (
    <div className="p-6 space-y-6" data-testid="page-monitoring">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5">
              <Monitor className="h-5 w-5 text-cyan-400" />
            </div>
            Monitoramento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Infraestrutura em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          {s.activeAlerts > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              {s.activeAlerts} alerta{s.activeAlerts > 1 ? "s" : ""}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending} data-testid="button-refresh-all">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(142 76% 45%)" } as React.CSSProperties}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Servidores</p>
              <p className="text-xl font-bold" data-testid="text-kpi-vps">{s.vpsOnline}/{s.vpsTotal} <span className="text-xs font-normal text-green-400">online</span></p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(217 91% 52%)" } as React.CSSProperties}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Apps Monitorados</p>
              <p className="text-xl font-bold" data-testid="text-kpi-apps">{s.appsUp}/{s.appsTotal} <span className="text-xs font-normal text-blue-400">up</span></p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(280 87% 55%)" } as React.CSSProperties}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Bancos</p>
              <p className="text-xl font-bold" data-testid="text-kpi-dbs">{s.dbsUp}/{s.dbsTotal} <span className="text-xs font-normal text-violet-400">up</span></p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": s.activeAlerts > 0 ? "hsl(0 84% 50%)" : "hsl(142 76% 45%)" } as React.CSSProperties}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${s.activeAlerts > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
              {s.activeAlerts > 0 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Alertas</p>
              <p className="text-xl font-bold" data-testid="text-kpi-alerts">
                {s.activeAlerts > 0 ? <span className="text-red-400">{s.activeAlerts} ativos</span> : <span className="text-green-400">Tudo OK</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList data-testid="tabs-monitoring">
          <TabsTrigger value="servers" data-testid="tab-servers">Servidores</TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">Gráficos</TabsTrigger>
          <TabsTrigger value="apps" data-testid="tab-apps">Apps</TabsTrigger>
          <TabsTrigger value="databases" data-testid="tab-databases">Bancos</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            Alertas
            {s.activeAlerts > 0 && <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-[10px]">{s.activeAlerts}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-3">
          {overview?.vps.map((vps) => {
            const m = vps.latestMetric;
            const cpu = parseFloat(m?.cpuPercent || "0");
            const mem = parseFloat(m?.memoryPercent || "0");
            const disk = parseFloat(m?.diskPercent || "0");
            const isExpanded = expandedVps.has(vps.id);

            return (
              <div key={vps.id} className="glass-card overflow-hidden" data-testid={`card-vps-${vps.id}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${vps.status === "online" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          {vps.status === "online" ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                        </div>
                        {vps.status === "online" && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card">
                            <span className="w-full h-full block rounded-full bg-green-500 animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" data-testid={`text-vps-name-${vps.id}`}>{vps.name}</span>
                          <Badge variant={vps.status === "online" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                            {vps.status === "online" ? "Online" : vps.status === "unknown" ? "Verificando..." : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {vps.ip} &middot; {vps.os || "---"}
                          {m && <span className="ml-2 text-muted-foreground/60">&middot; Atualizado {timeAgo(m.collectedAt)}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {m && vps.status === "online" && (
                        <div className="hidden md:flex items-center gap-4">
                          <GaugeRing value={cpu} color="#06b6d4" size={52} label="CPU" />
                          <GaugeRing value={mem} color="#8b5cf6" size={52} label="RAM" />
                          <GaugeRing value={disk} color="#f59e0b" size={52} label="Disco" />
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setExpandedVps(prev => {
                          const next = new Set(prev);
                          if (next.has(vps.id)) next.delete(vps.id); else next.add(vps.id);
                          return next;
                        });
                      }} data-testid={`button-expand-${vps.id}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && m && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                          <span className={`text-sm font-bold font-mono ${cpu > 80 ? "text-red-400" : cpu > 50 ? "text-amber-400" : "text-green-400"}`}>{cpu.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><MemoryStick className="w-3 h-3" /> RAM</span>
                          <span className={`text-sm font-bold font-mono ${mem > 80 ? "text-red-400" : mem > 50 ? "text-amber-400" : "text-green-400"}`}>{mem.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><HardDrive className="w-3 h-3" /> Disco</span>
                          <span className={`text-sm font-bold font-mono ${disk > 80 ? "text-red-400" : disk > 50 ? "text-amber-400" : "text-green-400"}`}>{disk.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Load</span>
                          <span className="text-sm font-bold font-mono text-cyan-400">{m.loadAvg1 || "---"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Processos</span>
                          <span className="text-sm font-bold font-mono">{m.processCount || "---"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2.5 rounded-md glass-inset">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Uptime</span>
                          <span className="text-sm font-bold font-mono text-emerald-400">{formatUptime(m.uptimeSeconds)}</span>
                        </div>
                      </div>
                      {(m.networkIn || m.networkOut) && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Rede In: <span className="font-mono font-semibold text-foreground">{formatBytes(m.networkIn)}</span></span>
                          <span>Rede Out: <span className="font-mono font-semibold text-foreground">{formatBytes(m.networkOut)}</span></span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex md:hidden items-center gap-3 mt-3">
                    {m && vps.status === "online" && (
                      <>
                        <GaugeRing value={cpu} color="#06b6d4" size={44} label="CPU" />
                        <GaugeRing value={mem} color="#8b5cf6" size={44} label="RAM" />
                        <GaugeRing value={disk} color="#f59e0b" size={44} label="Disco" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {(!overview?.vps || overview.vps.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Server className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum servidor cadastrado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Select value={selectedVps || ""} onValueChange={setSelectedVps}>
                <SelectTrigger className="w-[200px]" data-testid="select-chart-vps">
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {overview?.vps.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              {["1", "6", "24", "168"].map(h => (
                <Button key={h} variant={chartHours === h ? "default" : "ghost"} size="sm" className="text-xs h-7 px-2"
                  onClick={() => setChartHours(h)} data-testid={`button-hours-${h}`}>
                  {h === "1" ? "1h" : h === "6" ? "6h" : h === "24" ? "24h" : "7d"}
                </Button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /> CPU & Memória (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fillOpacity={1} fill="url(#cpuGrad)" strokeWidth={2} name="CPU" />
                    <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#memGrad)" strokeWidth={2} name="Memória" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><HardDrive className="w-4 h-4 text-amber-400" /> Disco (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="disk" stroke="#f59e0b" fillOpacity={1} fill="url(#diskGrad)" strokeWidth={2} name="Disco" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Load Average</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="load" stroke="#10b981" strokeWidth={2} dot={false} name="Load 1min" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground glass-card">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sem dados de métricas ainda</p>
              <p className="text-xs mt-1">As métricas serão coletadas automaticamente</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="apps" className="space-y-3">
          {overview?.appMonitors && overview.appMonitors.length > 0 ? (
            overview.appMonitors.map((mon) => {
              const m = mon.latestMetric;
              return (
                <div key={mon.id} className="glass-card p-4" data-testid={`card-app-monitor-${mon.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        m?.status === "up" ? "bg-green-500/10" : m?.status === "degraded" ? "bg-amber-500/10" : "bg-red-500/10"
                      }`}>
                        {m?.status === "up" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                         m?.status === "degraded" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                         <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{getAppName(mon.appId)}</span>
                        <p className="text-xs text-muted-foreground">
                          {mon.monitorType.toUpperCase()} &middot; {mon.endpoint || "---"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {m && (
                        <>
                          <Badge variant={m.status === "up" ? "default" : m.status === "degraded" ? "secondary" : "destructive"}>
                            {m.status === "up" ? "Online" : m.status === "degraded" ? "Degradado" : "Offline"}
                          </Badge>
                          {m.responseTimeMs !== null && (
                            <span className="font-mono text-muted-foreground">{m.responseTimeMs}ms</span>
                          )}
                          {m.statusCode && <span className="font-mono text-muted-foreground">HTTP {m.statusCode}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  {m?.errorMessage && (
                    <p className="text-xs text-red-400 mt-2 px-11">{m.errorMessage}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground glass-card">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum app monitorado</p>
              <p className="text-xs mt-1">Configure monitores em Configurações → Monitoramento</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="databases" className="space-y-3">
          {overview?.databases && overview.databases.length > 0 ? (
            overview.databases.map((db) => {
              const m = db.latestMetric;
              return (
                <div key={db.id} className="glass-card p-4" data-testid={`card-db-${db.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        m?.status === "up" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        <Database className={`w-4 h-4 ${m?.status === "up" ? "text-emerald-400" : "text-red-400"}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{db.name}</span>
                        <p className="text-xs text-muted-foreground">{db.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {m && (
                        <>
                          <Badge variant={m.status === "up" ? "default" : "destructive"}>
                            {m.status === "up" ? "Online" : "Offline"}
                          </Badge>
                          {m.connectionsActive !== null && (
                            <span className="font-mono text-muted-foreground">{m.connectionsActive} conn</span>
                          )}
                          {m.sizeBytes && (
                            <span className="font-mono text-muted-foreground">{formatBytes(m.sizeBytes)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground glass-card">
              <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum banco cadastrado</p>
              <p className="text-xs mt-1">Cadastre bancos na página de VPS</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {overview?.alerts && overview.alerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Alertas Ativos
              </h3>
              {overview.alerts.map((alert) => (
                <div key={alert.id} className="glass-card p-4 border-l-2 border-red-500" data-testid={`card-alert-${alert.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(alert.firedAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                        {alert.severity === "critical" ? "Crítico" : "Aviso"}
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending} data-testid={`button-resolve-${alert.id}`}>
                        Resolver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-sm font-semibold text-muted-foreground mt-4">Histórico</h3>
          {alertHistory && alertHistory.length > 0 ? (
            alertHistory.map((alert) => (
              <div key={alert.id} className={`glass-card p-3 ${alert.status === "resolved" ? "opacity-60" : "border-l-2 border-red-500"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(alert.firedAt).toLocaleString("pt-BR")}
                      {alert.resolvedAt && <span className="ml-2 text-green-400">&middot; Resolvido {new Date(alert.resolvedAt).toLocaleString("pt-BR")}</span>}
                    </p>
                  </div>
                  <Badge variant={alert.status === "resolved" ? "outline" : alert.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                    {alert.status === "resolved" ? "Resolvido" : alert.severity === "critical" ? "Crítico" : "Aviso"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Nenhum alerta registrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
