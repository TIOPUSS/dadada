import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { App, Client, Developer } from "@shared/schema";
import { insertAppSchema } from "@shared/schema";
import {
  Plus, Pencil, Trash2, Power, AppWindow, CheckCircle2,
  Clock, Users, Search, FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_OPTIONS = [
  "waiting", "backlog", "in_dev", "validation_1", "validation_2", "validation_3",
  "testing", "deploying", "staging", "active", "paused", "disabled", "archived",
] as const;

const TYPE_OPTIONS = ["saas", "internal", "custom", "automation", "ai_agent"] as const;
const ORIGIN_OPTIONS = ["acelera", "opus", "both", "thecorp", "vittaverde"] as const;

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  waiting: { label: "Aguardando", dot: "bg-orange-400", bg: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  backlog: { label: "Backlog", dot: "bg-slate-400", bg: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  in_dev: { label: "Em Dev", dot: "bg-blue-400", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  staging: { label: "Melhoria", dot: "bg-cyan-400", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  validation_1: { label: "Validação 1", dot: "bg-violet-400", bg: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  validation_2: { label: "Validação 2", dot: "bg-purple-400", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  validation_3: { label: "Validação 3", dot: "bg-fuchsia-400", bg: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  testing: { label: "Em Teste", dot: "bg-teal-400", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  deploying: { label: "Implantação", dot: "bg-amber-400", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  active: { label: "Ativo", dot: "bg-green-400", bg: "bg-green-500/15 text-green-300 border-green-500/30" },
  paused: { label: "Pausado", dot: "bg-red-400", bg: "bg-red-500/15 text-red-300 border-red-500/30" },
  disabled: { label: "Desativado", dot: "bg-red-500", bg: "bg-red-500/15 text-red-300 border-red-500/30" },
  archived: { label: "Concluído", dot: "bg-emerald-400", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS", internal: "Interno", custom: "Custom", automation: "Automação", ai_agent: "Agente IA",
};

const ORIGIN_LABELS: Record<string, string> = {
  acelera: "Acelera IT", opus: "Opus", both: "Opus + Acelera", thecorp: "TheCorp", vittaverde: "VittaVerde",
};

const formSchema = insertAppSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
  techStack: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AppsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [editChecked, setEditChecked] = useState(false);

  const { data: apps, isLoading: appsLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: developers } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", version: "", type: "saas", status: "active", origin: "acelera",
      clientId: null, devResponsibleId: null, techStack: "", gitRepo: "", controlUrl: "", description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/apps", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "App criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar app", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/apps/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      setDialogOpen(false);
      setEditingApp(null);
      form.reset();
      toast({ title: "App atualizado" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/apps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      toast({ title: "App removido" });
      setDeleteAppId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/apps/${id}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      toast({ title: "Status alternado" });
    },
  });

  function openCreateDialog() {
    setEditingApp(null);
    form.reset({
      name: "", version: "", type: "saas", status: "active", origin: "acelera",
      clientId: null, devResponsibleId: null, techStack: "", gitRepo: "", controlUrl: "", description: "",
    });
    setDialogOpen(true);
  }

  function openEditDialog(app: App) {
    setEditingApp(app);
    form.reset({
      name: app.name, version: app.version || "", type: app.type, status: app.status,
      origin: app.origin, clientId: app.clientId || null,
      devResponsibleId: app.devResponsibleId || null,
      techStack: app.techStack?.join(", ") || "",
      gitRepo: app.gitRepo || "", controlUrl: app.controlUrl || "", description: app.description || "",
    });
    setDialogOpen(true);
  }

  useEffect(() => {
    if (apps && !editChecked) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      if (editId) {
        const appToEdit = apps.find((a) => a.id === editId);
        if (appToEdit) {
          openEditDialog(appToEdit);
        }
        window.history.replaceState({}, "", "/apps");
      }
      setEditChecked(true);
    }
  }, [apps, editChecked]);

  function onSubmit(values: FormValues) {
    const techStackStr = values.techStack as unknown as string;
    const payload = {
      ...values,
      techStack: techStackStr ? techStackStr.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      clientId: values.clientId === "none" ? null : values.clientId || null,
      devResponsibleId: values.devResponsibleId === "none" ? null : values.devResponsibleId || null,
    };
    if (editingApp) {
      updateMutation.mutate({ id: editingApp.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId || !clients) return "—";
    return clients.find((c) => c.id === clientId)?.name || "—";
  };

  const getDevName = (devId: string | null) => {
    if (!devId || !developers) return "—";
    return developers.find((d) => d.id === devId)?.name || "—";
  };

  const filteredApps = apps?.filter((app) => {
    if (filterStatus !== "all" && app.status !== filterStatus) return false;
    if (filterType !== "all" && app.type !== filterType) return false;
    if (filterOrigin !== "all" && app.origin !== filterOrigin) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return app.name.toLowerCase().includes(q) || (app.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const totalApps = apps?.length || 0;
  const activeApps = apps?.filter((a) => a.status === "active").length || 0;
  const inDevApps = apps?.filter((a) => a.status === "in_dev" || a.status === "backlog").length || 0;
  const totalDevs = new Set(apps?.map((a) => a.devResponsibleId).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-apps">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5">
              <AppWindow className="h-5 w-5 text-blue-400" />
            </div>
            Aplicativos
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
            Gerencie aplicativos, documentações e status
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-new-app">
          <Plus className="mr-2 h-4 w-4" />
          Novo App
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-row">
        {[
          { label: "Total de Apps", value: totalApps, icon: AppWindow, color: "blue" },
          { label: "Apps Ativos", value: activeApps, icon: CheckCircle2, color: "green" },
          { label: "Em Desenvolvimento", value: inDevApps, icon: Clock, color: "purple" },
          { label: "Devs Envolvidos", value: totalDevs, icon: Users, color: "amber" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-4" data-testid={`kpi-${i}`}>
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-md bg-${kpi.color}-500/10`}>
                <kpi.icon className={`h-5 w-5 text-${kpi.color}-400`} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">{kpi.value}</span>
                <span className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground">{kpi.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap glass-card p-3" data-testid="filter-bar">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar app..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50 dark:bg-white/5 border-border/50"
              data-testid="input-search"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] h-9 bg-background/50 dark:bg-white/5 border-border/50" data-testid="select-filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] h-9 bg-background/50 dark:bg-white/5 border-border/50" data-testid="select-filter-type">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOrigin} onValueChange={setFilterOrigin}>
            <SelectTrigger className="w-[140px] h-9 bg-background/50 dark:bg-white/5 border-border/50" data-testid="select-filter-origin">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Origens</SelectItem>
              {ORIGIN_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{ORIGIN_LABELS[o]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {appsLoading ? (
        <div className="glass-card overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border/20">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20 ml-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden" data-testid="apps-list">
          <div className="hidden md:grid grid-cols-[1fr_100px_100px_120px_140px_120px] gap-4 items-center px-4 py-2.5 border-b border-border/30 bg-muted/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">App</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Origem</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Responsável</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</span>
          </div>

          {filteredApps?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-empty">
              Nenhum app encontrado
            </div>
          )}

          {filteredApps?.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["active"];
            return (
              <div
                key={app.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_120px_140px_120px] gap-2 md:gap-4 items-center px-4 py-3 border-b border-border/15 hover:bg-muted/5 transition-colors group cursor-pointer"
                data-testid={`row-app-${app.id}`}
                onClick={() => navigate(`/apps/${app.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                  <div className="min-w-0">
                    <button
                      className="text-sm font-semibold hover:text-primary transition-colors text-left truncate block max-w-full"
                      onClick={() => navigate(`/apps/${app.id}`)}
                      data-testid={`link-app-name-${app.id}`}
                    >
                      {app.name}
                    </button>
                    {app.description && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-[300px]">
                        {app.description}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="text-[10px]" data-testid={`badge-type-${app.id}`}>
                    {TYPE_LABELS[app.type] || app.type}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground" data-testid={`text-origin-${app.id}`}>
                    {ORIGIN_LABELS[app.origin] || app.origin}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusCfg.bg}`} data-testid={`badge-status-${app.id}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <div>
                  <span className="text-xs" data-testid={`text-dev-${app.id}`}>
                    {getDevName(app.devResponsibleId)}
                  </span>
                </div>

                <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigate(`/apps/${app.id}`)}
                          data-testid={`button-docs-${app.id}`}
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Documentos</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => toggleMutation.mutate(app.id)}
                          data-testid={`button-toggle-${app.id}`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ligar/Desligar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEditDialog(app)}
                          data-testid={`button-edit-${app.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => setDeleteAppId(app.id)}
                          data-testid={`button-delete-${app.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aplicativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai remover o app e todos os documentos associados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAppId && deleteMutation.mutate(deleteAppId)}
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-app-form">
          <DialogHeader>
            <DialogTitle>{editingApp ? "Editar App" : "Novo App"}</DialogTitle>
            <DialogDescription>
              {editingApp ? "Atualize as informações do app" : "Preencha as informações do novo app"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} data-testid="input-app-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app-type"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="origin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app-origin"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORIGIN_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>{ORIGIN_LABELS[o]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app-status"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="version" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl><Input {...field} placeholder="1.0.0" data-testid="input-app-version" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app-client"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {clients?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="devResponsibleId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dev Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app-dev"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {developers?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="techStack" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormControl><Input {...field} placeholder="React, Node.js, PostgreSQL" data-testid="input-app-tech" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gitRepo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Git Repo</FormLabel>
                  <FormControl><Input {...field} placeholder="https://github.com/..." data-testid="input-app-git" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="controlUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Painel de Controle</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." data-testid="input-app-control" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea {...field} rows={3} data-testid="input-app-desc" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={isMutating} data-testid="button-submit-app">
                  {isMutating ? "Salvando..." : editingApp ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
