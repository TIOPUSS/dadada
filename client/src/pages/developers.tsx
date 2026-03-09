import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import {
  Plus, Pencil, Trash2, Code2, LayoutGrid, Table, CheckCircle2,
  ChevronDown, ChevronRight, ExternalLink, ArrowRight, User, Briefcase,
  Activity, Zap, Clock, Pause, Archive, AlertCircle, Monitor,
  GitBranch, Layers, TrendingUp, Eye,
} from "lucide-react";
import { insertDeveloperSchema, type Developer, type InsertDeveloper, type App } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const DEV_COLORS: Record<string, string> = {
  "Felipe Lacerda": "#3b82f6",
  "Lucas Marquisio": "#8b5cf6",
  "Daniel Lacerda": "#ec4899",
  "Cristhian Sidoly": "#f97316",
  "Kauan": "#f59e0b",
  "Maico Fernandes": "#22c55e",
  "Cauã (TheCorp)": "#10b981",
};

const STATUS_CONFIG: Record<string, { label: string; shortLabel: string; color: string; icon: typeof Activity }> = {
  waiting:      { label: "Aguardando",   shortLabel: "AGU",  color: "#f97316", icon: Clock },
  backlog:      { label: "Backlog",      shortLabel: "BACK", color: "#94a3b8", icon: Layers },
  in_dev:       { label: "Em Dev",       shortLabel: "DEV",  color: "#3b82f6", icon: Code2 },
  staging:      { label: "Melhoria",     shortLabel: "MELH", color: "#06b6d4", icon: TrendingUp },
  validation_1: { label: "Validação 1",  shortLabel: "V1",   color: "#8b5cf6", icon: Eye },
  validation_2: { label: "Validação 2",  shortLabel: "V2",   color: "#a855f7", icon: Eye },
  validation_3: { label: "Validação 3",  shortLabel: "V3",   color: "#d946ef", icon: Eye },
  testing:      { label: "Em Teste",     shortLabel: "TEST", color: "#14b8a6", icon: Monitor },
  deploying:    { label: "Implantação",  shortLabel: "IMPL", color: "#f59e0b", icon: Zap },
  active:       { label: "Ativo",        shortLabel: "ATIV", color: "#22c55e", icon: Activity },
  paused:       { label: "Pausado",      shortLabel: "PAUS", color: "#ef4444", icon: Pause },
  disabled:     { label: "Desativado",   shortLabel: "INAT", color: "#ef4444", icon: AlertCircle },
  archived:     { label: "Concluído",    shortLabel: "CONC", color: "#10b981", icon: Archive },
};

const ALL_STATUSES = ["waiting", "backlog", "in_dev", "validation_1", "validation_2", "validation_3", "testing", "deploying", "staging", "active", "paused", "archived"] as const;

const ORIGIN_LABELS: Record<string, { label: string; color: string }> = {
  acelera:    { label: "Acelera IT",     color: "#22d3ee" },
  opus:       { label: "Opus",           color: "#f59e0b" },
  both:       { label: "Opus + Acelera", color: "#a78bfa" },
  thecorp:    { label: "TheCorp",        color: "#10b981" },
  vittaverde: { label: "VittaVerde",     color: "#ec4899" },
};

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  junior: { label: "Junior", color: "#94a3b8" },
  mid:    { label: "Pleno",  color: "#3b82f6" },
  senior: { label: "Senior", color: "#8b5cf6" },
  lead:   { label: "Lead",   color: "#f59e0b" },
};

const formSchema = insertDeveloperSchema.extend({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  skillsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  role: "",
  level: "mid",
  status: "active",
  monthlyRate: "",
  contractType: "",
  skills: [],
  githubUrl: "",
  skillsInput: "",
};

function getInitials(name: string): string {
  const clean = name.replace(/\(.*\)/, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "").toUpperCase();
}

type ViewMode = "dev-vision" | "table";
type StatusFilter = "todos" | typeof ALL_STATUSES[number];
type OriginFilter = "todos" | "acelera" | "opus" | "both" | "thecorp" | "vittaverde";

function StatusPill({ status, size = "sm" }: { status: string; size?: "sm" | "xs" }) {
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG["in_dev"];
  const Icon = sc.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${
        size === "sm" ? "text-[11px] px-2.5 py-1" : "text-[10px] px-2 py-0.5"
      }`}
      style={{
        color: sc.color,
        background: `${sc.color}12`,
        border: `1px solid ${sc.color}25`,
      }}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-2.5 w-2.5"} />
      {sc.label}
    </span>
  );
}

function StatusDropdown({ app, onStatusChange }: { app: App; onStatusChange: (appId: string, newStatus: string) => void }) {
  const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG["in_dev"];
  const Icon = sc.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 font-semibold rounded-full text-[11px] px-2.5 py-1 cursor-pointer transition-all"
          style={{
            color: sc.color,
            background: `${sc.color}12`,
            border: `1px solid ${sc.color}25`,
          }}
          data-testid={`dropdown-status-${app.id}`}
        >
          <Icon className="h-3 w-3" />
          {sc.label}
          <ChevronDown className="h-2.5 w-2.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const SIcon = cfg.icon;
          const isActive = app.status === s;
          return (
            <DropdownMenuItem
              key={s}
              className={`text-xs font-medium gap-2 ${isActive ? "bg-accent" : ""}`}
              onClick={() => { if (!isActive) onStatusChange(app.id, s); }}
              data-testid={`status-option-${s}`}
            >
              <SIcon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
              <span style={{ color: isActive ? cfg.color : undefined }}>{cfg.label}</span>
              {isActive && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OriginDot({ origin }: { origin: string }) {
  const om = ORIGIN_LABELS[origin] || ORIGIN_LABELS["acelera"];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5"
      style={{
        color: om.color,
        background: `${om.color}10`,
        border: `1px solid ${om.color}20`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: om.color }} />
      {om.label}
    </span>
  );
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof Activity }) {
  const testSlug = label.toLowerCase().replace(/\s/g, "-");
  return (
    <Card
      className="border px-4 py-3 rounded-xl"
      style={{ borderColor: `${color}20`, background: `${color}06` }}
      data-testid={`stat-${testSlug}`}
    >
      <CardContent className="p-0 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <div className="text-2xl font-black text-foreground leading-none tracking-tight" data-testid={`stat-value-${testSlug}`}>{value}</div>
          <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DevelopersPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [deletingDev, setDeletingDev] = useState<Developer | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dev-vision");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("todos");
  const [expandedDevs, setExpandedDevs] = useState<Record<string, boolean>>({});

  const { data: developers = [], isLoading } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
  });

  const { data: apps = [] } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDeveloper) => apiRequest("POST", "/api/developers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({ title: "Desenvolvedor criado com sucesso" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar desenvolvedor", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertDeveloper & { id: string }) =>
      apiRequest("PUT", `/api/developers/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({ title: "Desenvolvedor atualizado com sucesso" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar desenvolvedor", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/developers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({ title: "Desenvolvedor excluído com sucesso" });
      setDeletingDev(null);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir desenvolvedor", description: err.message, variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/apps/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      toast({ title: "Status atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar status", description: err.message, variant: "destructive" });
    },
  });

  function handleStatusChange(appId: string, newStatus: string) {
    statusMutation.mutate({ id: appId, status: newStatus });
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingDev(null);
    form.reset(defaultValues);
  }

  function openCreate() {
    form.reset(defaultValues);
    setEditingDev(null);
    setDialogOpen(true);
  }

  function openEdit(dev: Developer) {
    setEditingDev(dev);
    form.reset({
      name: dev.name,
      email: dev.email,
      phone: dev.phone ?? "",
      role: dev.role ?? "",
      level: dev.level,
      status: dev.status,
      monthlyRate: dev.monthlyRate ?? "",
      contractType: dev.contractType ?? "",
      skills: dev.skills ?? [],
      githubUrl: dev.githubUrl ?? "",
      skillsInput: (dev.skills ?? []).join(", "),
    });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const { skillsInput, ...rest } = values;
    const skills = skillsInput
      ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : (rest.skills ?? []);
    const payload: InsertDeveloper = { ...rest, skills };

    if (editingDev) {
      updateMutation.mutate({ ...payload, id: editingDev.id });
    } else {
      createMutation.mutate(payload);
    }
  }

  const devProjectsMap = useMemo(() => {
    const map: Record<string, App[]> = {};
    apps.forEach((app) => {
      if (app.devResponsibleId) {
        if (!map[app.devResponsibleId]) map[app.devResponsibleId] = [];
        map[app.devResponsibleId].push(app);
      }
    });
    return map;
  }, [apps]);

  const stats = useMemo(() => {
    const total = apps.length;
    const inDev = apps.filter((a) => a.status === "in_dev").length;
    const staging = apps.filter((a) => a.status === "staging").length;
    const paused = apps.filter((a) => a.status === "paused").length;
    const archived = apps.filter((a) => a.status === "archived").length;
    const waiting = apps.filter((a) => a.status === "waiting").length;
    const testing = apps.filter((a) => ["testing", "validation_1", "validation_2", "validation_3"].includes(a.status)).length;
    return { total, inDev, staging, paused, archived, waiting, testing };
  }, [apps]);

  const filteredProjects = useMemo(() => {
    return apps.filter((app) => {
      if (statusFilter !== "todos" && app.status !== statusFilter) return false;
      if (originFilter !== "todos" && app.origin !== originFilter) return false;
      return true;
    });
  }, [apps, statusFilter, originFilter]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  function toggleDevExpanded(devId: string) {
    setExpandedDevs((prev) => ({ ...prev, [devId]: !prev[devId] }));
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-developers">
      <Card className="relative overflow-hidden rounded-2xl border-border/30 bg-gradient-to-br from-card via-card to-primary/[0.03]">
        <CardContent className="p-6">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground" data-testid="text-page-title">
                Esteira de Desenvolvimento
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-page-subtitle">
                Visão completa da equipe e projetos da Acelera IT
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/30">
              <button
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "dev-vision"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("dev-vision")}
                data-testid="button-view-dev"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Por Dev
              </button>
              <button
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("table")}
                data-testid="button-view-table"
              >
                <Table className="h-3.5 w-3.5" />
                Tabela
              </button>
            </div>
            <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5 shadow-sm" data-testid="button-new-developer">
              <Plus className="h-4 w-4" />
              Novo Dev
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3" data-testid="stats-bar">
        <StatCard label="Total" value={stats.total} color="#8b5cf6" icon={Layers} />
        <StatCard label="Em Dev" value={stats.inDev} color="#3b82f6" icon={Code2} />
        <StatCard label="Melhoria" value={stats.staging} color="#06b6d4" icon={TrendingUp} />
        <StatCard label="Validação" value={stats.testing} color="#a855f7" icon={Eye} />
        <StatCard label="Aguardando" value={stats.waiting} color="#f97316" icon={Clock} />
        <StatCard label="Pausado" value={stats.paused} color="#ef4444" icon={Pause} />
        <StatCard label="Concluído" value={stats.archived} color="#10b981" icon={Archive} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="loading-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl"><CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </CardContent></Card>
          ))}
        </div>
      ) : viewMode === "dev-vision" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="grid-dev-cards">
          {developers
            .filter((dev) => {
              const projects = devProjectsMap[dev.id] || [];
              return projects.length > 0;
            })
            .sort((a, b) => {
              const aProjects = (devProjectsMap[a.id] || []).filter((p) => p.status !== "archived");
              const bProjects = (devProjectsMap[b.id] || []).filter((p) => p.status !== "archived");
              return bProjects.length - aProjects.length;
            })
            .map((dev) => {
              const allProjects = devProjectsMap[dev.id] || [];
              const activeProjects = allProjects.filter((p) => p.status !== "archived");
              const devCompleted = allProjects.filter((p) => p.status === "archived");
              const devColor = DEV_COLORS[dev.name] || "#6366f1";
              const isExpanded = expandedDevs[dev.id] !== false;
              const levelInfo = LEVEL_LABELS[dev.level] || LEVEL_LABELS["mid"];

              const statusCounts: Record<string, number> = {};
              activeProjects.forEach((p) => {
                statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
              });

              return (
                <Card
                  key={dev.id}
                  className="rounded-2xl border-border/30 overflow-hidden shadow-sm"
                  data-testid={`card-developer-${dev.id}`}
                >
                  <div
                    className="p-4 cursor-pointer select-none"
                    onClick={() => toggleDevExpanded(dev.id)}
                    data-testid={`header-${dev.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${devColor}, ${devColor}cc)`,
                              boxShadow: `0 4px 14px ${devColor}30`,
                            }}
                            data-testid={`avatar-${dev.id}`}
                          >
                            {getInitials(dev.name)}
                          </div>
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center"
                            style={{ background: dev.status === "active" ? "#22c55e" : "#ef4444" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-foreground text-[15px] leading-tight" data-testid={`text-name-${dev.id}`}>
                              {dev.name}
                            </p>
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                              style={{
                                color: levelInfo.color,
                                background: `${levelInfo.color}15`,
                                border: `1px solid ${levelInfo.color}25`,
                              }}
                            >
                              {levelInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            {dev.role && <span>{dev.role}</span>}
                            <span className="text-muted-foreground/40">·</span>
                            <span className="font-medium" style={{ color: devColor }}>
                              {activeProjects.length} ativo{activeProjects.length !== 1 ? "s" : ""}
                            </span>
                            {devCompleted.length > 0 && (
                              <>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-emerald-500">
                                  {devCompleted.length} concluído{devCompleted.length !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={(e) => { e.stopPropagation(); openEdit(dev); }}
                          data-testid={`button-edit-${dev.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {Object.keys(statusCounts).length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        {Object.entries(statusCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([status, count]) => {
                            const sc = STATUS_CONFIG[status];
                            if (!sc) return null;
                            return (
                              <span
                                key={status}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                style={{
                                  color: sc.color,
                                  background: `${sc.color}10`,
                                  border: `1px solid ${sc.color}20`,
                                }}
                              >
                                {sc.shortLabel}
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                  style={{ background: sc.color }}
                                >
                                  {count}
                                </span>
                              </span>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/20">
                      {activeProjects.map((project, idx) => {
                        const om = ORIGIN_LABELS[project.origin] || ORIGIN_LABELS["acelera"];
                        return (
                          <div
                            key={project.id}
                            className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                              idx !== activeProjects.length - 1 || devCompleted.length > 0
                                ? "border-b border-border/10"
                                : ""
                            }`}
                            data-testid={`project-row-${project.id}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div
                                className="w-1 h-8 rounded-full shrink-0"
                                style={{ background: devColor }}
                              />
                              <div className="min-w-0 flex-1">
                                <button
                                  className="text-sm font-semibold text-foreground truncate text-left block max-w-full"
                                  onClick={() => navigate(`/apps/${project.id}`)}
                                  data-testid={`link-app-${project.id}`}
                                >
                                  {project.name}
                                </button>
                                {project.description && (
                                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <OriginDot origin={project.origin} />
                              <StatusDropdown app={project} onStatusChange={handleStatusChange} />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-lg"
                                onClick={() => navigate(`/apps/${project.id}`)}
                                data-testid={`button-detail-${project.id}`}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {devCompleted.length > 0 && (
                        <div className="px-4 py-3 bg-emerald-500/[0.03]">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Archive className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Concluídos ({devCompleted.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {devCompleted.map((p) => (
                              <button
                                key={p.id}
                                className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                                style={{
                                  background: "rgba(16, 185, 129, 0.08)",
                                  border: "1px solid rgba(16, 185, 129, 0.15)",
                                }}
                                onClick={() => navigate(`/apps/${p.id}`)}
                                data-testid={`chip-completed-${p.id}`}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        <div className="space-y-4" data-testid="section-table">
          <Card className="rounded-2xl border-border/30">
            <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Status:
              </span>
              {([
                { value: "todos" as StatusFilter, label: "Todos" },
                ...ALL_STATUSES.map((s) => ({ value: s as StatusFilter, label: STATUS_CONFIG[s].label })),
              ]).map((f) => {
                const sc = f.value !== "todos" ? STATUS_CONFIG[f.value] : null;
                const isActive = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                      isActive
                        ? "shadow-sm"
                        : "border-transparent text-muted-foreground"
                    }`}
                    style={isActive && sc ? {
                      color: sc.color,
                      background: `${sc.color}12`,
                      borderColor: `${sc.color}30`,
                    } : isActive ? {
                      color: "hsl(var(--primary))",
                      background: "hsl(var(--primary) / 0.1)",
                      borderColor: "hsl(var(--primary) / 0.3)",
                    } : {}}
                    onClick={() => setStatusFilter(f.value)}
                    data-testid={`filter-status-${f.value}`}
                  >
                    {sc && <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-border/20" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Origem:
              </span>
              {([
                { value: "todos" as OriginFilter, label: "Todos", dot: "" },
                { value: "acelera" as OriginFilter, label: "Acelera IT", dot: "#22d3ee" },
                { value: "opus" as OriginFilter, label: "Opus", dot: "#f59e0b" },
                { value: "both" as OriginFilter, label: "Interno + Venda", dot: "#a78bfa" },
                { value: "vittaverde" as OriginFilter, label: "VittaVerde", dot: "#ec4899" },
                { value: "thecorp" as OriginFilter, label: "TheCorp", dot: "#10b981" },
              ]).map((f) => {
                const isActive = originFilter === f.value;
                return (
                  <button
                    key={f.value}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                      isActive
                        ? "shadow-sm"
                        : "border-transparent text-muted-foreground"
                    }`}
                    style={isActive && f.dot ? {
                      color: f.dot,
                      background: `${f.dot}12`,
                      borderColor: `${f.dot}30`,
                    } : isActive ? {
                      color: "hsl(var(--primary))",
                      background: "hsl(var(--primary) / 0.1)",
                      borderColor: "hsl(var(--primary) / 0.3)",
                    } : {}}
                    onClick={() => setOriginFilter(f.value)}
                    data-testid={`filter-origin-${f.value}`}
                  >
                    {f.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.dot }} />}
                    {f.label}
                  </button>
                );
              })}
              <span className="text-xs font-mono text-primary ml-auto font-semibold" data-testid="text-filter-count">
                {filteredProjects.length} projetos
              </span>
            </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/30 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/30">
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Projeto</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Dev</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Origem</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground hidden lg:table-cell">Info</th>
                  <th className="px-5 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody data-testid="table-body">
                {filteredProjects.map((project, idx) => {
                  const dev = developers.find((d) => d.id === project.devResponsibleId);
                  const devColor = dev ? (DEV_COLORS[dev.name] || "#6366f1") : "#64748b";
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border/10 transition-colors"
                      data-testid={`table-row-${project.id}`}
                    >
                      <td className="px-5 py-3">
                        <button
                          className="text-sm font-semibold text-foreground text-left"
                          onClick={() => navigate(`/apps/${project.id}`)}
                        >
                          {project.name}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        {dev ? (
                          <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                              style={{ background: devColor }}
                            >
                              {getInitials(dev.name)}
                            </span>
                            <span style={{ color: devColor }}>{dev.name.split(" ")[0]}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <OriginDot origin={project.origin} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusDropdown app={project} onStatusChange={handleStatusChange} />
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                        {project.description || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => navigate(`/apps/${project.id}`)}
                          data-testid={`button-detail-table-${project.id}`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProjects.length === 0 && (
              <div className="p-12 text-center">
                <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum projeto encontrado com os filtros selecionados.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl" data-testid="dialog-developer-form">
          <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
            <DialogHeader className="p-0 space-y-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {editingDev ? <Pencil className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold" data-testid="text-dialog-title">
                    {editingDev ? editingDev.name : "Novo Desenvolvedor"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {editingDev ? "Editar informações do desenvolvedor" : "Preencha os dados do novo membro"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-5" style={{ maxHeight: "calc(90vh - 140px)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome completo" className="rounded-lg" data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="dev@acelera.it" className="rounded-lg" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="+55 11 99999-0000" className="rounded-lg" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cargo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="Fullstack Dev" className="rounded-lg" data-testid="input-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nível</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg" data-testid="select-level">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Pleno</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg" data-testid="select-status">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Valor Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" className="rounded-lg" data-testid="input-monthly-rate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tipo de Contrato</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="PJ, CLT, etc." className="rounded-lg" data-testid="input-contract-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">GitHub</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="github.com/usuario" className="rounded-lg" data-testid="input-github-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skillsInput"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Skills (vírgula)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="React, Node.js, TypeScript" className="rounded-lg" data-testid="input-skills" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border/30 bg-muted/20 flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={closeDialog} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isMutating} className="rounded-lg" data-testid="button-submit">
                  {isMutating ? "Salvando..." : editingDev ? "Salvar Alterações" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDev} onOpenChange={(open) => { if (!open) setDeletingDev(null); }}>
        <AlertDialogContent className="rounded-2xl" data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o desenvolvedor "{deletingDev?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg"
              onClick={() => deletingDev && deleteMutation.mutate(deletingDev.id)}
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
