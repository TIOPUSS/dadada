import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  AppWindow,
  AlertTriangle,
  CalendarClock,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Code2,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { App, Contract, Developer, KanbanTask } from "@shared/schema";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return formatBRL(value);
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const DEV_COLORS: Record<string, string> = {
  "Felipe": "#3b82f6",
  "Lucas": "#8b5cf6",
  "Daniel": "#ec4899",
  "Cristhian": "#f97316",
  "Kauan": "#f59e0b",
  "Maico": "#22c55e",
  "Cauã": "#10b981",
};

const revenueData = [
  { month: "Abr", revenue: 13900, expense: 8200 },
  { month: "Mai", revenue: 15600, expense: 8800 },
  { month: "Jun", revenue: 16200, expense: 9100 },
  { month: "Jul", revenue: 17100, expense: 9400 },
  { month: "Ago", revenue: 16800, expense: 9200 },
  { month: "Set", revenue: 18400, expense: 9600 },
  { month: "Out", revenue: 19200, expense: 9900 },
  { month: "Nov", revenue: 20100, expense: 10200 },
  { month: "Dez", revenue: 21500, expense: 10500 },
  { month: "Jan", revenue: 22300, expense: 10800 },
  { month: "Fev", revenue: 23100, expense: 11000 },
  { month: "Mar", revenue: 24800, expense: 11200 },
];

const tooltipStyle = {
  backgroundColor: "hsl(222 35% 8% / 0.97)",
  border: "1px solid hsl(222 20% 18% / 0.7)",
  borderRadius: "12px",
  fontSize: "12px",
  backdropFilter: "blur(16px)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
  padding: "10px 14px",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalClients: number;
    activeApps: number;
    mrr: number;
    arr: number;
    overduePayments: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: apps } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: developers } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
  });

  const { data: tasks } = useQuery<KanbanTask[]>({
    queryKey: ["/api/kanban-tasks"],
  });

  const statusCounts = apps
    ? [
        { name: "Em Dev", value: apps.filter((a) => a.status === "in_dev").length, color: "#a78bfa" },
        { name: "Melhorias", value: apps.filter((a) => a.status === "staging").length, color: "#22d3ee" },
        { name: "Aguardando", value: apps.filter((a) => a.status === "paused").length, color: "#f59e0b" },
        { name: "Arquivados", value: apps.filter((a) => a.status === "archived").length, color: "#6b7280" },
      ].filter((s) => s.value > 0)
    : [];

  const topAppsByRevenue = contracts && apps
    ? apps
        .map((app) => {
          const appContracts = contracts.filter(
            (c) => c.appId === app.id && c.status === "active"
          );
          const revenue = appContracts.reduce((sum, c) => sum + Number(c.value || 0), 0);
          return { name: app.name, revenue, status: app.status };
        })
        .filter((a) => a.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
    : [];

  const upcomingRenewals = contracts && apps
    ? contracts
        .filter((c) => {
          if (!c.endDate) return false;
          const days = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
          return days >= 0 && days <= 90;
        })
        .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
        .slice(0, 5)
        .map((c) => ({
          ...c,
          appName: apps.find((a) => a.id === c.appId)?.name || "---",
          daysLeft: Math.ceil((new Date(c.endDate!).getTime() - Date.now()) / 86400000),
        }))
    : [];

  const devWorkload = developers && tasks
    ? developers
        .filter((d) => d.status === "active")
        .map((dev) => {
          const devTasks = tasks.filter((t) => t.devId === dev.id && t.status !== "done");
          const totalEst = devTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          const firstName = dev.name.split(" ")[0].replace("(TheCorp)", "").trim();
          return {
            id: dev.id,
            name: firstName,
            fullName: dev.name,
            level: dev.level,
            activeTasks: devTasks.length,
            totalHours: totalEst,
            capacity: Math.min(100, (totalEst / 160) * 100),
            color: DEV_COLORS[firstName] || "#6b7280",
          };
        })
        .sort((a, b) => b.activeTasks - a.activeTasks)
    : [];

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="page-dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card p-5">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-card p-6"><Skeleton className="h-64 w-full" /></div>
          <div className="glass-card p-6"><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" data-testid="page-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" data-testid="text-dashboard-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            Dashboard Central
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão executiva da operação Acelera IT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-inset text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 glow-dot text-emerald-400" />
            <span className="text-emerald-500 dark:text-emerald-400">Sistema operacional</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card p-5" style={{ "--kpi-accent": "#3b82f6" } as React.CSSProperties} data-testid="card-kpi-mrr">
          <div className="flex items-center justify-between gap-1 mb-3">
            <span className="section-label">MRR</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="text-[28px] font-bold tracking-tight leading-none" data-testid="text-mrr-value">
            {formatBRL(stats?.mrr ?? 0)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              +12.5%
            </span>
            <span className="text-[11px] text-muted-foreground/60">vs mês anterior</span>
          </div>
        </div>

        <div className="kpi-card p-5" style={{ "--kpi-accent": "#10b981" } as React.CSSProperties} data-testid="card-kpi-arr">
          <div className="flex items-center justify-between gap-1 mb-3">
            <span className="section-label">ARR</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-[28px] font-bold tracking-tight leading-none" data-testid="text-arr-value">
            {formatBRL(stats?.arr ?? 0)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              +8.2%
            </span>
            <span className="text-[11px] text-muted-foreground/60">crescimento anual</span>
          </div>
        </div>

        <div className="kpi-card p-5" style={{ "--kpi-accent": "#8b5cf6" } as React.CSSProperties} data-testid="card-kpi-active-apps">
          <div className="flex items-center justify-between gap-1 mb-3">
            <span className="section-label">Apps Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 flex items-center justify-center">
              <AppWindow className="h-5 w-5 text-violet-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight leading-none" data-testid="text-active-apps-value">
              {stats?.activeApps ?? 0}
            </span>
            <span className="text-sm text-muted-foreground/50 font-medium">/ {apps?.length ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <Zap className="w-3 h-3 text-violet-400/60" />
            <span className="text-[11px] text-muted-foreground/60">{apps?.filter(a => a.status === "in_dev").length || 0} em desenvolvimento</span>
          </div>
        </div>

        <div className="kpi-card p-5" style={{ "--kpi-accent": (stats?.overduePayments ?? 0) > 0 ? "#ef4444" : "#22c55e" } as React.CSSProperties} data-testid="card-kpi-overdue">
          <div className="flex items-center justify-between gap-1 mb-3">
            <span className="section-label">Inadimplentes</span>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${(stats?.overduePayments ?? 0) > 0 ? "from-red-500/20 to-red-600/5" : "from-emerald-500/20 to-emerald-600/5"} flex items-center justify-center`}>
              <AlertTriangle className={`h-5 w-5 ${(stats?.overduePayments ?? 0) > 0 ? "text-red-400" : "text-emerald-400"}`} />
            </div>
          </div>
          <div className="text-[28px] font-bold tracking-tight leading-none" data-testid="text-overdue-value">
            {stats?.overduePayments ?? 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            {(stats?.overduePayments ?? 0) > 0 ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-semibold">
                <ArrowDownRight className="w-3 h-3" />
                Requer atenção
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                Todos em dia
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5" data-testid="card-revenue-chart">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-semibold">Receita vs Despesas</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-1 rounded-full bg-blue-500" />
                <span className="text-[11px] text-muted-foreground/60">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-1 rounded-full bg-red-400" />
                <span className="text-[11px] text-muted-foreground/60">Despesas</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="40%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.15} vertical={false} />
              <XAxis dataKey="month" className="text-[11px]" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis className="text-[11px]" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatBRL(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" name="Receita" dot={false} activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={1.5} fill="url(#expGrad)" name="Despesas" dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5" data-testid="card-status-chart">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <AppWindow className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm font-semibold">Apps por Status</span>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 flex-wrap justify-center mt-1">
              {statusCounts.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-muted-foreground/70">{s.name} <span className="font-semibold text-foreground/70">({s.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 glass-card p-5" data-testid="card-top-revenue">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold">Top Receita</span>
          </div>
          <div className="space-y-3">
            {topAppsByRevenue.map((app, idx) => (
              <div key={app.name} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-muted-foreground/40 w-4 text-right">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-medium truncate">{app.name}</span>
                    <span className="text-[12px] font-bold font-mono text-emerald-500 dark:text-emerald-400 shrink-0">{formatCompact(app.revenue)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${(app.revenue / (topAppsByRevenue[0]?.revenue || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-5" data-testid="card-dev-workload">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-semibold">Carga dos Desenvolvedores</span>
          </div>
          <div className="space-y-3.5">
            {devWorkload.map((dev) => (
              <div key={dev.id} data-testid={`dev-workload-${dev.id}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${dev.color}20`, color: dev.color }}
                    >
                      <span className="text-[11px] font-bold">{dev.name[0]}{dev.name[1]?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{dev.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{dev.level}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/60">
                    <span className="text-[11px] font-medium">{dev.activeTasks} tarefas</span>
                    <span className="text-[11px] font-mono">{dev.totalHours}h</span>
                  </div>
                </div>
                <div className="relative ml-[42px]">
                  <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dev.capacity}%`,
                        background: `linear-gradient(90deg, ${dev.color}cc, ${dev.color})`,
                        boxShadow: dev.capacity > 70 ? `0 0 8px ${dev.color}40` : 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5" data-testid="card-renewals">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-semibold">Próximas Renovações</span>
          {upcomingRenewals.length > 0 && (
            <Badge variant="outline" className="text-[10px] ml-1">{upcomingRenewals.length}</Badge>
          )}
        </div>
        {upcomingRenewals.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 py-4 text-center">Nenhuma renovação próxima</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {upcomingRenewals.map((c) => (
              <div
                key={c.id}
                className="glass-inset p-3.5 rounded-xl transition-all duration-200"
                data-testid={`renewal-${c.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[13px] font-semibold truncate">{c.appName}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      c.daysLeft <= 15
                        ? "bg-red-500/15 text-red-400"
                        : c.daysLeft <= 30
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {c.daysLeft}d
                  </span>
                </div>
                <p className="text-[12px] font-mono font-semibold text-muted-foreground">{formatBRL(Number(c.value || 0))}/mês</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
