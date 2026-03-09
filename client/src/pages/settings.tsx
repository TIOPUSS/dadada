import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Integration, Origin, ClientType, AlertRule, AlertDestination, AppMonitor, MonitoringConfig, VpsServer, App } from "@shared/schema";
import { insertUserSchema, insertIntegrationSchema } from "@shared/schema";
import {
  Settings as SettingsIcon,
  Plus,
  Pencil,
  Trash2,
  Users,
  Shield,
  Eye,
  UserCog,
  Power,
  PowerOff,
  Plug,
  Clock,
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Database,
  Terminal,
  Bot,
  Key,
  CircleDot,
  Globe,
  Tag,
  Monitor,
  Bell,
  AlertTriangle,
  Webhook,
  Timer,
  Activity,
  Save,
} from "lucide-react";
import { SiOpenai } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type SafeUser = Omit<User, "password">;

interface AiConfigSafe {
  id: string;
  provider: string;
  name: string;
  model: string;
  active: boolean;
  priority: number;
  apiKeyMasked: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  viewer: "Visualizador",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  admin: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  manager: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  viewer: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
};

const INTEGRATION_TYPE_LABELS: Record<string, string> = {
  messaging: "Mensageria",
  calendar: "Calendário",
  payment: "Pagamento",
  development: "Desenvolvimento",
  productivity: "Produtividade",
};

const INTEGRATION_TYPE_BADGE_CLASSES: Record<string, string> = {
  messaging: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  calendar: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  payment: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  development: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
  productivity: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

const KPI_ACCENTS = [
  "hsl(217 91% 52%)",
  "hsl(0 84% 52%)",
  "hsl(217 91% 60%)",
  "hsl(220 9% 52%)",
];

const PROVIDER_INFO: Record<string, { label: string; color: string; models: string[] }> = {
  openai: {
    label: "OpenAI",
    color: "text-emerald-500",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o3-mini"],
  },
  anthropic: {
    label: "Anthropic",
    color: "text-orange-500",
    models: ["claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
  },
  google: {
    label: "Google",
    color: "text-blue-500",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
  },
};

const AI_CAPABILITIES = [
  { icon: Server, title: "Análise de VPS", desc: "Monitore CPU, RAM, disco e processos automaticamente" },
  { icon: Terminal, title: "Comandos Inteligentes", desc: "Gere comandos Linux com linguagem natural" },
  { icon: Zap, title: "Deploy Automatizado", desc: "Auxílio em deploy, Docker, PM2, Nginx" },
  { icon: Database, title: "Consultas ao Banco", desc: "Análise de dados e otimização de queries" },
  { icon: Bot, title: "Troubleshooting", desc: "Diagnóstico de problemas em servidores e apps" },
  { icon: Sparkles, title: "Análise de Negócio", desc: "Insights sobre leads, contratos e financeiro" },
];

const userCreateSchema = insertUserSchema.extend({
  name: z.string().min(1, "Nome obrigatório"),
  username: z.string().min(1, "Username obrigatório"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
});

const userEditSchema = insertUserSchema.extend({
  name: z.string().min(1, "Nome obrigatório"),
  username: z.string().min(1, "Username obrigatório"),
  password: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
});

type UserFormValues = z.infer<typeof userCreateSchema>;

const integrationFormSchema = insertIntegrationSchema.extend({
  name: z.string().min(1, "Nome obrigatório"),
  type: z.string().min(1, "Tipo obrigatório"),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

const aiConfigCreateSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  provider: z.enum(["openai", "anthropic", "google"]),
  model: z.string().min(1, "Modelo obrigatório"),
  apiKey: z.string().min(1, "API Key obrigatória"),
  active: z.boolean().default(true),
  priority: z.coerce.number().default(0),
});

const aiConfigEditSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  provider: z.enum(["openai", "anthropic", "google"]),
  model: z.string().min(1, "Modelo obrigatório"),
  apiKey: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  priority: z.coerce.number().default(0),
});

type AiConfigFormValues = z.infer<typeof aiConfigCreateSchema>;

const originFormSchema = z.object({
  key: z.string().min(1, "Chave obrigatória").regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  label: z.string().min(1, "Nome obrigatório"),
  color: z.string().min(1, "Cor obrigatória"),
  active: z.boolean().default(true),
});

type OriginFormValues = z.infer<typeof originFormSchema>;

const defaultOriginValues: OriginFormValues = {
  key: "",
  label: "",
  color: "#3b82f6",
  active: true,
};

const clientTypeFormSchema = z.object({
  key: z.string().min(1, "Chave obrigatória").regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  label: z.string().min(1, "Nome obrigatório"),
  color: z.string().min(1, "Cor obrigatória"),
  active: z.boolean().default(true),
});

type ClientTypeFormValues = z.infer<typeof clientTypeFormSchema>;

const defaultClientTypeValues: ClientTypeFormValues = {
  key: "",
  label: "",
  color: "#3b82f6",
  active: true,
};

const alertRuleFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  targetType: z.enum(["vps", "app", "db"]),
  targetId: z.string().optional().or(z.literal("")),
  metric: z.string().min(1, "Métrica obrigatória"),
  operator: z.enum(["gt", "lt", "eq"]),
  threshold: z.coerce.number().min(0),
  duration: z.coerce.number().min(1).default(1),
  severity: z.enum(["warning", "critical"]),
  enabled: z.boolean().default(true),
});
type AlertRuleFormValues = z.infer<typeof alertRuleFormSchema>;
const defaultAlertRuleValues: AlertRuleFormValues = { name: "", targetType: "vps", targetId: "", metric: "cpu_percent", operator: "gt", threshold: 80, duration: 1, severity: "warning", enabled: true };

const alertDestFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  type: z.enum(["hub", "webhook", "email"]),
  config: z.string().default("{}"),
  enabled: z.boolean().default(true),
});
type AlertDestFormValues = z.infer<typeof alertDestFormSchema>;
const defaultAlertDestValues: AlertDestFormValues = { name: "", type: "hub", config: "{}", enabled: true };

const appMonitorFormSchema = z.object({
  appId: z.string().min(1, "App obrigatório"),
  vpsId: z.string().optional().or(z.literal("")),
  monitorType: z.enum(["http", "pm2", "docker"]),
  endpoint: z.string().optional().or(z.literal("")),
  expectedStatus: z.coerce.number().default(200),
  checkIntervalMinutes: z.coerce.number().min(1).default(5),
  enabled: z.boolean().default(true),
});
type AppMonitorFormValues = z.infer<typeof appMonitorFormSchema>;
const defaultAppMonitorValues: AppMonitorFormValues = { appId: "", vpsId: "", monitorType: "http", endpoint: "", expectedStatus: 200, checkIntervalMinutes: 5, enabled: true };

const METRIC_OPTIONS: Record<string, { label: string; options: { value: string; label: string }[] }> = {
  vps: { label: "VPS", options: [
    { value: "cpu_percent", label: "CPU (%)" },
    { value: "memory_percent", label: "Memória (%)" },
    { value: "disk_percent", label: "Disco (%)" },
    { value: "load_avg_1", label: "Load 1min" },
    { value: "process_count", label: "Processos" },
  ]},
  app: { label: "App", options: [
    { value: "response_time_ms", label: "Response Time (ms)" },
    { value: "status_code", label: "Status Code" },
  ]},
  db: { label: "Banco", options: [
    { value: "connections_active", label: "Conexões Ativas" },
    { value: "response_time_ms", label: "Response Time (ms)" },
  ]},
};

const OPERATOR_LABELS: Record<string, string> = { gt: ">", lt: "<", eq: "=" };
const SEVERITY_LABELS: Record<string, { label: string; cls: string }> = {
  warning: { label: "Aviso", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  critical: { label: "Crítico", cls: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
};
const DEST_TYPE_LABELS: Record<string, { label: string; icon: typeof Bell }> = {
  hub: { label: "Hub (interno)", icon: Bell },
  webhook: { label: "Webhook", icon: Webhook },
  email: { label: "Email", icon: Globe },
};
const MONITOR_TYPE_LABELS: Record<string, string> = { http: "HTTP", pm2: "PM2", docker: "Docker" };

function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "Nunca sincronizado";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Nunca sincronizado";
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

const defaultUserValues: UserFormValues = {
  name: "",
  username: "",
  password: "",
  email: "",
  role: "viewer",
  active: true,
};

const defaultIntegrationValues: IntegrationFormValues = {
  name: "",
  type: "messaging",
  status: "disconnected",
  config: "",
  lastSync: null,
};

const defaultAiConfigValues: AiConfigFormValues = {
  name: "",
  provider: "openai",
  model: "gpt-4o",
  apiKey: "",
  active: true,
  priority: 0,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [deleteIntegrationDialogOpen, setDeleteIntegrationDialogOpen] = useState(false);
  const [deletingIntegrationId, setDeletingIntegrationId] = useState<string | null>(null);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingAiConfig, setEditingAiConfig] = useState<AiConfigSafe | null>(null);
  const [deleteAiDialogOpen, setDeleteAiDialogOpen] = useState(false);
  const [deletingAiId, setDeletingAiId] = useState<string | null>(null);
  const [testingAiId, setTestingAiId] = useState<string | null>(null);

  const [originDialogOpen, setOriginDialogOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<Origin | null>(null);
  const [deleteOriginDialogOpen, setDeleteOriginDialogOpen] = useState(false);
  const [deletingOriginId, setDeletingOriginId] = useState<string | null>(null);

  const [clientTypeDialogOpen, setClientTypeDialogOpen] = useState(false);
  const [editingClientType, setEditingClientType] = useState<ClientType | null>(null);
  const [deleteClientTypeDialogOpen, setDeleteClientTypeDialogOpen] = useState(false);
  const [deletingClientTypeId, setDeletingClientTypeId] = useState<string | null>(null);

  const [alertRuleDialogOpen, setAlertRuleDialogOpen] = useState(false);
  const [editingAlertRule, setEditingAlertRule] = useState<AlertRule | null>(null);
  const [deleteAlertRuleDialogOpen, setDeleteAlertRuleDialogOpen] = useState(false);
  const [deletingAlertRuleId, setDeletingAlertRuleId] = useState<string | null>(null);

  const [alertDestDialogOpen, setAlertDestDialogOpen] = useState(false);
  const [editingAlertDest, setEditingAlertDest] = useState<AlertDestination | null>(null);
  const [deleteAlertDestDialogOpen, setDeleteAlertDestDialogOpen] = useState(false);
  const [deletingAlertDestId, setDeletingAlertDestId] = useState<string | null>(null);

  const [appMonitorDialogOpen, setAppMonitorDialogOpen] = useState(false);
  const [editingAppMonitor, setEditingAppMonitor] = useState<AppMonitor | null>(null);
  const [deleteAppMonitorDialogOpen, setDeleteAppMonitorDialogOpen] = useState(false);
  const [deletingAppMonitorId, setDeletingAppMonitorId] = useState<string | null>(null);

  const [monitorConfigInterval, setMonitorConfigInterval] = useState("5");
  const [monitorConfigRetention, setMonitorConfigRetention] = useState("7");
  const [monitorConfigAlerts, setMonitorConfigAlerts] = useState(true);

  const { data: users, isLoading: usersLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/users"],
  });

  const { data: integrations, isLoading: integrationsLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  const { data: aiConfigs, isLoading: aiConfigsLoading } = useQuery<AiConfigSafe[]>({
    queryKey: ["/api/ai-configs"],
  });

  const { data: originsData, isLoading: originsLoading } = useQuery<Origin[]>({
    queryKey: ["/api/origins"],
  });

  const { data: clientTypesData, isLoading: clientTypesLoading } = useQuery<ClientType[]>({
    queryKey: ["/api/client-types"],
  });

  const { data: alertRulesData, isLoading: alertRulesLoading } = useQuery<AlertRule[]>({
    queryKey: ["/api/monitoring/alert-rules"],
  });

  const { data: alertDestsData, isLoading: alertDestsLoading } = useQuery<AlertDestination[]>({
    queryKey: ["/api/monitoring/alert-destinations"],
  });

  const { data: appMonitorsData, isLoading: appMonitorsLoading } = useQuery<AppMonitor[]>({
    queryKey: ["/api/monitoring/app-monitors"],
  });

  const { data: monitorConfigData } = useQuery<MonitoringConfig[]>({
    queryKey: ["/api/monitoring/config"],
  });

  const { data: vpsServersData } = useQuery<VpsServer[]>({
    queryKey: ["/api/vps"],
  });

  const { data: appsData } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  useEffect(() => {
    if (monitorConfigData) {
      const cfgMap: Record<string, string> = {};
      monitorConfigData.forEach((c) => { cfgMap[c.key] = c.value; });
      if (cfgMap.collection_interval) setMonitorConfigInterval(cfgMap.collection_interval);
      if (cfgMap.retention_days) setMonitorConfigRetention(cfgMap.retention_days);
      if (cfgMap.alerts_enabled !== undefined) setMonitorConfigAlerts(cfgMap.alerts_enabled === "true");
    }
  }, [monitorConfigData]);

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(editingUser ? userEditSchema : userCreateSchema),
    defaultValues: defaultUserValues,
  });

  const integrationForm = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: defaultIntegrationValues,
  });

  const aiConfigForm = useForm<AiConfigFormValues>({
    resolver: zodResolver(editingAiConfig ? aiConfigEditSchema : aiConfigCreateSchema),
    defaultValues: defaultAiConfigValues,
  });

  const selectedProvider = aiConfigForm.watch("provider");

  const originForm = useForm<OriginFormValues>({
    resolver: zodResolver(originFormSchema),
    defaultValues: defaultOriginValues,
  });

  const createOriginMutation = useMutation({
    mutationFn: async (data: OriginFormValues) => {
      const res = await apiRequest("POST", "/api/origins", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/origins"] });
      setOriginDialogOpen(false);
      originForm.reset(defaultOriginValues);
      toast({ title: "Origem criada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar origem", description: error.message, variant: "destructive" });
    },
  });

  const updateOriginMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OriginFormValues> }) => {
      const res = await apiRequest("PUT", `/api/origins/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/origins"] });
      setOriginDialogOpen(false);
      setEditingOrigin(null);
      originForm.reset(defaultOriginValues);
      toast({ title: "Origem atualizada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar origem", description: error.message, variant: "destructive" });
    },
  });

  const deleteOriginMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/origins/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/origins"] });
      setDeleteOriginDialogOpen(false);
      setDeletingOriginId(null);
      toast({ title: "Origem excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir origem", description: error.message, variant: "destructive" });
    },
  });

  function openCreateOriginDialog() {
    setEditingOrigin(null);
    originForm.reset(defaultOriginValues);
    setOriginDialogOpen(true);
  }

  function openEditOriginDialog(origin: Origin) {
    setEditingOrigin(origin);
    originForm.reset({
      key: origin.key,
      label: origin.label,
      color: origin.color,
      active: origin.active,
    });
    setOriginDialogOpen(true);
  }

  function onOriginSubmit(values: OriginFormValues) {
    if (editingOrigin) {
      updateOriginMutation.mutate({ id: editingOrigin.id, data: values });
    } else {
      createOriginMutation.mutate(values);
    }
  }

  const isOriginMutating = createOriginMutation.isPending || updateOriginMutation.isPending;

  const clientTypeForm = useForm<ClientTypeFormValues>({
    resolver: zodResolver(clientTypeFormSchema),
    defaultValues: defaultClientTypeValues,
  });

  const createClientTypeMutation = useMutation({
    mutationFn: async (data: ClientTypeFormValues) => {
      const res = await apiRequest("POST", "/api/client-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-types"] });
      setClientTypeDialogOpen(false);
      clientTypeForm.reset(defaultClientTypeValues);
      toast({ title: "Tipo de cliente criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar tipo de cliente", description: error.message, variant: "destructive" });
    },
  });

  const updateClientTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientTypeFormValues> }) => {
      const res = await apiRequest("PUT", `/api/client-types/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-types"] });
      setClientTypeDialogOpen(false);
      setEditingClientType(null);
      clientTypeForm.reset(defaultClientTypeValues);
      toast({ title: "Tipo de cliente atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar tipo de cliente", description: error.message, variant: "destructive" });
    },
  });

  const deleteClientTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/client-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-types"] });
      setDeleteClientTypeDialogOpen(false);
      setDeletingClientTypeId(null);
      toast({ title: "Tipo de cliente excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir tipo de cliente", description: error.message, variant: "destructive" });
    },
  });

  function openCreateClientTypeDialog() {
    setEditingClientType(null);
    clientTypeForm.reset(defaultClientTypeValues);
    setClientTypeDialogOpen(true);
  }

  function openEditClientTypeDialog(ct: ClientType) {
    setEditingClientType(ct);
    clientTypeForm.reset({
      key: ct.key,
      label: ct.label,
      color: ct.color,
      active: ct.active,
    });
    setClientTypeDialogOpen(true);
  }

  function onClientTypeSubmit(values: ClientTypeFormValues) {
    if (editingClientType) {
      updateClientTypeMutation.mutate({ id: editingClientType.id, data: values });
    } else {
      createClientTypeMutation.mutate(values);
    }
  }

  const isClientTypeMutating = createClientTypeMutation.isPending || updateClientTypeMutation.isPending;

  const alertRuleForm = useForm<AlertRuleFormValues>({ resolver: zodResolver(alertRuleFormSchema), defaultValues: defaultAlertRuleValues });
  const alertDestForm = useForm<AlertDestFormValues>({ resolver: zodResolver(alertDestFormSchema), defaultValues: defaultAlertDestValues });
  const appMonitorForm = useForm<AppMonitorFormValues>({ resolver: zodResolver(appMonitorFormSchema), defaultValues: defaultAppMonitorValues });
  const watchTargetType = alertRuleForm.watch("targetType");

  const createAlertRuleMutation = useMutation({
    mutationFn: async (data: AlertRuleFormValues) => { const res = await apiRequest("POST", "/api/monitoring/alert-rules", { ...data, threshold: String(data.threshold) }); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }); setAlertRuleDialogOpen(false); alertRuleForm.reset(defaultAlertRuleValues); toast({ title: "Regra de alerta criada" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const updateAlertRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlertRuleFormValues> }) => { const res = await apiRequest("PUT", `/api/monitoring/alert-rules/${id}`, { ...data, threshold: data.threshold !== undefined ? String(data.threshold) : undefined }); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }); setAlertRuleDialogOpen(false); setEditingAlertRule(null); alertRuleForm.reset(defaultAlertRuleValues); toast({ title: "Regra atualizada" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const deleteAlertRuleMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/monitoring/alert-rules/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-rules"] }); setDeleteAlertRuleDialogOpen(false); setDeletingAlertRuleId(null); toast({ title: "Regra excluída" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  function openCreateAlertRuleDialog() { setEditingAlertRule(null); alertRuleForm.reset(defaultAlertRuleValues); setAlertRuleDialogOpen(true); }
  function openEditAlertRuleDialog(r: AlertRule) { setEditingAlertRule(r); alertRuleForm.reset({ name: r.name, targetType: r.targetType as any, targetId: r.targetId || "", metric: r.metric, operator: r.operator as any, threshold: Number(r.threshold), duration: r.duration, severity: r.severity as any, enabled: r.enabled }); setAlertRuleDialogOpen(true); }
  function onAlertRuleSubmit(v: AlertRuleFormValues) { if (editingAlertRule) updateAlertRuleMutation.mutate({ id: editingAlertRule.id, data: v }); else createAlertRuleMutation.mutate(v); }
  const isAlertRuleMutating = createAlertRuleMutation.isPending || updateAlertRuleMutation.isPending;

  const createAlertDestMutation = useMutation({
    mutationFn: async (data: AlertDestFormValues) => { const res = await apiRequest("POST", "/api/monitoring/alert-destinations", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-destinations"] }); setAlertDestDialogOpen(false); alertDestForm.reset(defaultAlertDestValues); toast({ title: "Destino criado" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const updateAlertDestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlertDestFormValues> }) => { const res = await apiRequest("PUT", `/api/monitoring/alert-destinations/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-destinations"] }); setAlertDestDialogOpen(false); setEditingAlertDest(null); alertDestForm.reset(defaultAlertDestValues); toast({ title: "Destino atualizado" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const deleteAlertDestMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/monitoring/alert-destinations/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/alert-destinations"] }); setDeleteAlertDestDialogOpen(false); setDeletingAlertDestId(null); toast({ title: "Destino excluído" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  function openCreateAlertDestDialog() { setEditingAlertDest(null); alertDestForm.reset(defaultAlertDestValues); setAlertDestDialogOpen(true); }
  function openEditAlertDestDialog(d: AlertDestination) { setEditingAlertDest(d); alertDestForm.reset({ name: d.name, type: d.type as any, config: d.config, enabled: d.enabled }); setAlertDestDialogOpen(true); }
  function onAlertDestSubmit(v: AlertDestFormValues) { if (editingAlertDest) updateAlertDestMutation.mutate({ id: editingAlertDest.id, data: v }); else createAlertDestMutation.mutate(v); }
  const isAlertDestMutating = createAlertDestMutation.isPending || updateAlertDestMutation.isPending;

  const createAppMonitorMutation = useMutation({
    mutationFn: async (data: AppMonitorFormValues) => { const res = await apiRequest("POST", "/api/monitoring/app-monitors", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/app-monitors"] }); setAppMonitorDialogOpen(false); appMonitorForm.reset(defaultAppMonitorValues); toast({ title: "Monitor criado" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const updateAppMonitorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppMonitorFormValues> }) => { const res = await apiRequest("PUT", `/api/monitoring/app-monitors/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/app-monitors"] }); setAppMonitorDialogOpen(false); setEditingAppMonitor(null); appMonitorForm.reset(defaultAppMonitorValues); toast({ title: "Monitor atualizado" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  const deleteAppMonitorMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/monitoring/app-monitors/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/app-monitors"] }); setDeleteAppMonitorDialogOpen(false); setDeletingAppMonitorId(null); toast({ title: "Monitor excluído" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });
  function openCreateAppMonitorDialog() { setEditingAppMonitor(null); appMonitorForm.reset(defaultAppMonitorValues); setAppMonitorDialogOpen(true); }
  function openEditAppMonitorDialog(m: AppMonitor) { setEditingAppMonitor(m); appMonitorForm.reset({ appId: m.appId, vpsId: m.vpsId || "", monitorType: m.monitorType as any, endpoint: m.endpoint || "", expectedStatus: m.expectedStatus || 200, checkIntervalMinutes: m.checkIntervalMinutes, enabled: m.enabled }); setAppMonitorDialogOpen(true); }
  function onAppMonitorSubmit(v: AppMonitorFormValues) { if (editingAppMonitor) updateAppMonitorMutation.mutate({ id: editingAppMonitor.id, data: v }); else createAppMonitorMutation.mutate(v); }
  const isAppMonitorMutating = createAppMonitorMutation.isPending || updateAppMonitorMutation.isPending;

  const saveMonitorConfigMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => { const res = await apiRequest("PUT", "/api/monitoring/config", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/monitoring/config"] }); toast({ title: "Configurações salvas" }); },
    onError: (e: Error) => { toast({ title: "Erro", description: e.message, variant: "destructive" }); },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserDialogOpen(false);
      userForm.reset(defaultUserValues);
      toast({ title: "Usuário criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserDialogOpen(false);
      setEditingUser(null);
      userForm.reset(defaultUserValues);
      toast({ title: "Usuário atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar usuário", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteUserDialogOpen(false);
      setDeletingUserId(null);
      toast({ title: "Usuário excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir usuário", description: error.message, variant: "destructive" });
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/integrations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIntegrationDialogOpen(false);
      integrationForm.reset(defaultIntegrationValues);
      toast({ title: "Integração criada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar integração", description: error.message, variant: "destructive" });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/integrations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIntegrationDialogOpen(false);
      setEditingIntegration(null);
      integrationForm.reset(defaultIntegrationValues);
      toast({ title: "Integração atualizada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar integração", description: error.message, variant: "destructive" });
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/integrations/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Status da integração atualizado" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar integração", description: error.message, variant: "destructive" });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setDeleteIntegrationDialogOpen(false);
      setDeletingIntegrationId(null);
      toast({ title: "Integração excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir integração", description: error.message, variant: "destructive" });
    },
  });

  const createAiConfigMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/ai-configs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-configs"] });
      setAiDialogOpen(false);
      aiConfigForm.reset(defaultAiConfigValues);
      toast({ title: "Provedor de IA configurado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao configurar IA", description: error.message, variant: "destructive" });
    },
  });

  const updateAiConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/ai-configs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-configs"] });
      setAiDialogOpen(false);
      setEditingAiConfig(null);
      aiConfigForm.reset(defaultAiConfigValues);
      toast({ title: "Provedor de IA atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar IA", description: error.message, variant: "destructive" });
    },
  });

  const deleteAiConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-configs"] });
      setDeleteAiDialogOpen(false);
      setDeletingAiId(null);
      toast({ title: "Provedor de IA removido" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover IA", description: error.message, variant: "destructive" });
    },
  });

  const testAiConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      setTestingAiId(id);
      const res = await apiRequest("POST", `/api/ai-configs/${id}/test`);
      return res.json();
    },
    onSuccess: (data: { success: boolean; error?: string }) => {
      setTestingAiId(null);
      if (data.success) {
        toast({ title: "Conexão com IA estabelecida com sucesso!" });
      } else {
        toast({ title: "Falha na conexão", description: data.error, variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      setTestingAiId(null);
      toast({ title: "Erro ao testar conexão", description: error.message, variant: "destructive" });
    },
  });

  function openCreateUserDialog() {
    setEditingUser(null);
    userForm.reset(defaultUserValues);
    setUserDialogOpen(true);
  }

  function openEditUserDialog(user: SafeUser) {
    setEditingUser(user);
    userForm.reset({
      name: user.name,
      username: user.username,
      password: "",
      email: user.email || "",
      role: user.role,
      active: user.active,
    });
    setUserDialogOpen(true);
  }

  function onUserSubmit(values: UserFormValues) {
    const payload: Record<string, unknown> = {
      name: values.name,
      username: values.username,
      email: values.email || null,
      role: values.role,
      active: values.active,
    };
    if (values.password) {
      payload.password = values.password;
    }
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      payload.password = values.password;
      createUserMutation.mutate(payload);
    }
  }

  function openCreateIntegrationDialog() {
    setEditingIntegration(null);
    integrationForm.reset(defaultIntegrationValues);
    setIntegrationDialogOpen(true);
  }

  function openEditIntegrationDialog(integration: Integration) {
    setEditingIntegration(integration);
    integrationForm.reset({
      name: integration.name,
      type: integration.type,
      status: integration.status,
      config: integration.config || "",
      lastSync: integration.lastSync,
    });
    setIntegrationDialogOpen(true);
  }

  function onIntegrationSubmit(values: IntegrationFormValues) {
    const payload: Record<string, unknown> = {
      name: values.name,
      type: values.type,
      status: values.status || "disconnected",
      config: values.config || null,
    };
    if (editingIntegration) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data: payload });
    } else {
      createIntegrationMutation.mutate(payload);
    }
  }

  function openCreateAiDialog() {
    setEditingAiConfig(null);
    aiConfigForm.reset(defaultAiConfigValues);
    setAiDialogOpen(true);
  }

  function openEditAiDialog(config: AiConfigSafe) {
    setEditingAiConfig(config);
    aiConfigForm.reset({
      name: config.name,
      provider: config.provider as "openai" | "anthropic" | "google",
      model: config.model,
      apiKey: "",
      active: config.active,
      priority: config.priority,
    });
    setAiDialogOpen(true);
  }

  function onAiConfigSubmit(values: AiConfigFormValues) {
    const payload: Record<string, unknown> = {
      name: values.name,
      provider: values.provider,
      model: values.model,
      active: values.active,
      priority: values.priority,
    };
    if (values.apiKey) {
      payload.apiKey = values.apiKey;
    }
    if (editingAiConfig) {
      updateAiConfigMutation.mutate({ id: editingAiConfig.id, data: payload });
    } else {
      payload.apiKey = values.apiKey;
      createAiConfigMutation.mutate(payload);
    }
  }

  const adminCount = users?.filter((u) => u.role === "admin").length || 0;
  const managerCount = users?.filter((u) => u.role === "manager").length || 0;
  const viewerCount = users?.filter((u) => u.role === "viewer").length || 0;

  const userKpis = [
    { label: "Total Usuários", value: (users?.length || 0).toString(), icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Administradores", value: adminCount.toString(), icon: Shield, iconBg: "bg-rose-500/10", iconColor: "text-rose-600 dark:text-rose-400" },
    { label: "Gerentes", value: managerCount.toString(), icon: UserCog, iconBg: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Visualizadores", value: viewerCount.toString(), icon: Eye, iconBg: "bg-gray-500/10", iconColor: "text-gray-600 dark:text-gray-400" },
  ];

  const isUserMutating = createUserMutation.isPending || updateUserMutation.isPending;
  const isIntegrationMutating = createIntegrationMutation.isPending || updateIntegrationMutation.isPending;
  const isAiMutating = createAiConfigMutation.isPending || updateAiConfigMutation.isPending;

  const activeAiConfig = aiConfigs ? [...aiConfigs].sort((a, b) => a.priority - b.priority).find(c => c.active) : undefined;

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-settings">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5">
              <SettingsIcon className="h-5 w-5 text-indigo-400" />
            </div>
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
            Gerencie usuários, integrações e configurações do sistema
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-inset">
          <TabsTrigger value="users" data-testid="tab-users">Usuários</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrações</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5" data-testid="tab-ai">
            <Brain className="h-3.5 w-3.5" />
            IA
          </TabsTrigger>
          <TabsTrigger value="origins" className="flex items-center gap-1.5" data-testid="tab-origins">
            <Globe className="h-3.5 w-3.5" />
            Origens
          </TabsTrigger>
          <TabsTrigger value="client-types" className="flex items-center gap-1.5" data-testid="tab-client-types">
            <Tag className="h-3.5 w-3.5" />
            Tipos de Cliente
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-1.5" data-testid="tab-monitoring">
            <Monitor className="h-3.5 w-3.5" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div />
              <Button onClick={openCreateUserDialog} data-testid="button-new-user">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userKpis.map((kpi, idx) => (
                <div
                  key={kpi.label}
                  className="kpi-card p-4 flex items-center gap-4 transition-all duration-300"
                  style={{ "--kpi-accent": KPI_ACCENTS[idx] } as React.CSSProperties}
                  data-testid={`kpi-${kpi.label}`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${kpi.iconBg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">{kpi.label}</span>
                    <span className="text-xl font-bold tracking-tight">{kpi.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card overflow-hidden">
              {usersLoading ? (
                <div className="p-6 space-y-4" data-testid="loading-skeleton-users">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !users || users.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="text-empty-users">
                  Nenhum usuário encontrado.
                </div>
              ) : (
                <Table data-testid="table-users">
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/20">
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Nome</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Username</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Email</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Perfil</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, idx) => (
                      <TableRow
                        key={user.id}
                        className={`border-b border-border/30 transition-colors duration-200 ${idx % 2 === 1 ? "bg-muted/5" : ""}`}
                        data-testid={`row-user-${user.id}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-name-${user.id}`}>
                          {user.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-username-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-email-${user.id}`}>
                          {user.email || "---"}
                        </TableCell>
                        <TableCell data-testid={`badge-role-${user.id}`}>
                          <Badge variant="outline" className={ROLE_BADGE_CLASSES[user.role] || ""}>
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`status-${user.id}`}>
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`inline-block h-2 w-2 rounded-full glow-dot ${
                                user.active ? "bg-green-500 text-green-500" : "bg-gray-400 text-gray-400"
                              }`}
                            />
                            <span className="text-sm">{user.active ? "Ativo" : "Inativo"}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditUserDialog(user)}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setDeletingUserId(user.id);
                                setDeleteUserDialogOpen(true);
                              }}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div />
              <Button onClick={openCreateIntegrationDialog} data-testid="button-new-integration">
                <Plus className="mr-2 h-4 w-4" />
                Nova Integração
              </Button>
            </div>

            {integrationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="loading-skeleton-integrations">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : !integrations || integrations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground" data-testid="text-empty-integrations">
                Nenhuma integração encontrada.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="glass-card-hover p-5 flex flex-col gap-3"
                    data-testid={`card-integration-${integration.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold" data-testid={`text-integration-name-${integration.id}`}>
                          {integration.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={INTEGRATION_TYPE_BADGE_CLASSES[integration.type] || ""}
                          data-testid={`badge-type-${integration.id}`}
                        >
                          {INTEGRATION_TYPE_LABELS[integration.type] || integration.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditIntegrationDialog(integration)}
                          data-testid={`button-edit-integration-${integration.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setDeletingIntegrationId(integration.id);
                            setDeleteIntegrationDialogOpen(true);
                          }}
                          data-testid={`button-delete-integration-${integration.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" data-testid={`status-integration-${integration.id}`}>
                      <span
                        className={`inline-block h-2 w-2 rounded-full glow-dot ${
                          integration.status === "connected" ? "bg-green-500 text-green-500" : "bg-gray-400 text-gray-400"
                        }`}
                      />
                      <span className="text-sm">
                        {integration.status === "connected" ? "Conectado" : "Desconectado"}
                      </span>
                    </div>

                    {integration.lastSync && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid={`text-last-sync-${integration.id}`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(integration.lastSync)}</span>
                      </div>
                    )}

                    <div className="mt-auto pt-2">
                      <Button
                        variant={integration.status === "connected" ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        disabled={toggleIntegrationMutation.isPending}
                        onClick={() =>
                          toggleIntegrationMutation.mutate({
                            id: integration.id,
                            status: integration.status === "connected" ? "disconnected" : "connected",
                          })
                        }
                        data-testid={`button-toggle-${integration.id}`}
                      >
                        {integration.status === "connected" ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desconectar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Conectar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="flex flex-col gap-6">
            <Card className="border-border/30 bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20">
                      <Brain className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold" data-testid="text-ai-title">Integrações IA</h2>
                      <p className="text-sm text-muted-foreground">
                        Conecte provedores de IA para análise, automação e assistência inteligente
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeAiConfig ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" variant="outline" data-testid="badge-ai-active">
                        <CircleDot className="h-3 w-3 mr-1" />
                        {PROVIDER_INFO[activeAiConfig.provider]?.label} - {activeAiConfig.model}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" variant="outline" data-testid="badge-ai-inactive">
                        Nenhum provedor ativo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="ai-capabilities-grid">
              {AI_CAPABILITIES.map((cap) => (
                <Card key={cap.title} className="border-border/20 bg-card/50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/10 shrink-0">
                      <cap.icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cap.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                Provedores Configurados
              </h3>
              <Button onClick={openCreateAiDialog} data-testid="button-new-ai-config">
                <Plus className="mr-2 h-4 w-4" />
                Novo Provedor
              </Button>
            </div>

            {aiConfigsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="loading-skeleton-ai">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : !aiConfigs || aiConfigs.length === 0 ? (
              <Card className="border-border/20 border-dashed" data-testid="text-empty-ai">
                <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/50">
                    <Brain className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum provedor de IA configurado. Adicione sua API Key da OpenAI, Anthropic ou Google para começar.
                  </p>
                  <Button variant="outline" onClick={openCreateAiDialog} data-testid="button-add-first-ai">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Provedor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...aiConfigs].sort((a, b) => a.priority - b.priority).map((config, idx) => {
                  const providerInfo = PROVIDER_INFO[config.provider];
                  const activeConfigs = aiConfigs.filter(c => c.active).sort((a, b) => a.priority - b.priority);
                  const roleLabel = !config.active ? null : activeConfigs[0]?.id === config.id ? "Principal" : "Fallback";
                  const roleBadgeClass = roleLabel === "Principal"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
                  return (
                    <Card
                      key={config.id}
                      className={`border-border/30 transition-all ${config.active ? "ring-1 ring-emerald-500/30" : ""}`}
                      data-testid={`card-ai-config-${config.id}`}
                    >
                      <CardContent className="p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                              config.provider === "openai" ? "bg-emerald-500/10" :
                              config.provider === "anthropic" ? "bg-orange-500/10" : "bg-blue-500/10"
                            }`}>
                              {config.provider === "openai" ? (
                                <SiOpenai className={`h-5 w-5 ${providerInfo?.color}`} />
                              ) : (
                                <Brain className={`h-5 w-5 ${providerInfo?.color}`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold" data-testid={`text-ai-name-${config.id}`}>{config.name}</p>
                                {roleLabel && (
                                  <Badge className={`text-[10px] px-1.5 py-0 ${roleBadgeClass}`} data-testid={`badge-ai-role-${config.id}`}>
                                    {roleLabel === "Principal" ? "★ " : "↻ "}{roleLabel}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{providerInfo?.label || config.provider}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditAiDialog(config)}
                              data-testid={`button-edit-ai-${config.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setDeletingAiId(config.id);
                                setDeleteAiDialogOpen(true);
                              }}
                              data-testid={`button-delete-ai-${config.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Modelo</span>
                            <Badge variant="outline" className="font-mono text-xs" data-testid={`text-ai-model-${config.id}`}>
                              {config.model}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">API Key</span>
                            <span className="text-xs font-mono text-muted-foreground/60">{config.apiKeyMasked}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Status</span>
                            <span className="flex items-center gap-1.5">
                              <span className={`inline-block h-2 w-2 rounded-full ${config.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                              <span className="text-xs">{config.active ? "Ativo" : "Inativo"}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            disabled={testAiConfigMutation.isPending}
                            onClick={() => testAiConfigMutation.mutate(config.id)}
                            data-testid={`button-test-ai-${config.id}`}
                          >
                            {testingAiId === config.id ? (
                              <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-3.5 w-3.5" />
                                Testar Conexão
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="origins">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Gerencie as origens disponíveis para classificar aplicativos e leads.
              </p>
              <Button onClick={openCreateOriginDialog} data-testid="button-new-origin">
                <Plus className="mr-2 h-4 w-4" />
                Nova Origem
              </Button>
            </div>

            {originsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : !originsData?.length ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                <Globe className="h-10 w-10 opacity-30" />
                <p className="text-sm">Nenhuma origem cadastrada</p>
                <Button variant="outline" size="sm" onClick={openCreateOriginDialog} data-testid="button-new-origin-empty">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Origem
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {originsData.map((origin) => (
                  <div
                    key={origin.id}
                    className="group relative p-4 rounded-xl border border-border/40 bg-card flex flex-col gap-3 hover-elevate transition-all"
                    data-testid={`card-origin-${origin.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: origin.color }}
                          data-testid={`color-origin-${origin.id}`}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" data-testid={`text-origin-label-${origin.id}`}>
                            {origin.label}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-origin-key-${origin.id}`}>
                            {origin.key}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={origin.active
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30 text-xs"
                        }
                        data-testid={`badge-origin-status-${origin.id}`}
                      >
                        {origin.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditOriginDialog(origin)}
                        data-testid={`button-edit-origin-${origin.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { setDeletingOriginId(origin.id); setDeleteOriginDialogOpen(true); }}
                        data-testid={`button-delete-origin-${origin.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="client-types">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Gerencie os tipos disponíveis para classificar clientes.
              </p>
              <Button onClick={openCreateClientTypeDialog} data-testid="button-new-client-type">
                <Plus className="mr-2 h-4 w-4" />
                Novo Tipo
              </Button>
            </div>

            {clientTypesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : !clientTypesData?.length ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                <Tag className="h-10 w-10 opacity-30" />
                <p className="text-sm">Nenhum tipo de cliente cadastrado</p>
                <Button variant="outline" size="sm" onClick={openCreateClientTypeDialog} data-testid="button-new-client-type-empty">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Tipo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientTypesData.map((ct) => (
                  <div
                    key={ct.id}
                    className="group relative p-4 rounded-xl border border-border/40 bg-card flex flex-col gap-3 hover-elevate transition-all"
                    data-testid={`card-client-type-${ct.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: ct.color }}
                          data-testid={`color-client-type-${ct.id}`}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" data-testid={`text-client-type-label-${ct.id}`}>
                            {ct.label}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-client-type-key-${ct.id}`}>
                            {ct.key}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={ct.active
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30 text-xs"
                        }
                        data-testid={`badge-client-type-status-${ct.id}`}
                      >
                        {ct.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditClientTypeDialog(ct)}
                        data-testid={`button-edit-client-type-${ct.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { setDeletingClientTypeId(ct.id); setDeleteClientTypeDialogOpen(true); }}
                        data-testid={`button-delete-client-type-${ct.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="flex flex-col gap-8">
            <Card className="border-border/30 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" data-testid="text-monitoring-title">Configurações de Monitoramento</h2>
                    <p className="text-sm text-muted-foreground">Ajuste a coleta de métricas, regras de alerta e destinos de notificação</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-muted-foreground" /> Intervalo de Coleta (min)</label>
                    <Input type="number" min={1} max={60} value={monitorConfigInterval} onChange={(e) => setMonitorConfigInterval(e.target.value)} data-testid="input-monitor-interval" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-muted-foreground" /> Retenção de Dados (dias)</label>
                    <Input type="number" min={1} max={90} value={monitorConfigRetention} onChange={(e) => setMonitorConfigRetention(e.target.value)} data-testid="input-monitor-retention" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-muted-foreground" /> Alertas Habilitados</label>
                    <div className="flex items-center gap-2 h-9">
                      <Switch checked={monitorConfigAlerts} onCheckedChange={setMonitorConfigAlerts} data-testid="switch-monitor-alerts" />
                      <span className="text-sm">{monitorConfigAlerts ? "Sim" : "Não"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    disabled={saveMonitorConfigMutation.isPending}
                    onClick={() => saveMonitorConfigMutation.mutate({ collection_interval: monitorConfigInterval, retention_days: monitorConfigRetention, alerts_enabled: String(monitorConfigAlerts) })}
                    data-testid="button-save-monitor-config"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saveMonitorConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Regras de Alerta
                </h3>
                <Button onClick={openCreateAlertRuleDialog} data-testid="button-new-alert-rule">
                  <Plus className="mr-2 h-4 w-4" />Nova Regra
                </Button>
              </div>
              {alertRulesLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !alertRulesData?.length ? (
                <Card className="border-border/20 border-dashed">
                  <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nenhuma regra de alerta configurada</p>
                    <Button variant="outline" size="sm" onClick={openCreateAlertRuleDialog} data-testid="button-new-alert-rule-empty"><Plus className="mr-2 h-4 w-4" />Adicionar Regra</Button>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Alvo</TableHead>
                      <TableHead>Métrica</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertRulesData.map((rule) => {
                      const sevCfg = SEVERITY_LABELS[rule.severity] || SEVERITY_LABELS.warning;
                      return (
                        <TableRow key={rule.id} data-testid={`row-alert-rule-${rule.id}`}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{rule.targetType.toUpperCase()}</Badge></TableCell>
                          <TableCell className="text-xs font-mono">{rule.metric}</TableCell>
                          <TableCell className="text-xs font-mono">{OPERATOR_LABELS[rule.operator] || rule.operator} {rule.threshold} ({rule.duration}x)</TableCell>
                          <TableCell><Badge variant="outline" className={`text-xs ${sevCfg.cls}`}>{sevCfg.label}</Badge></TableCell>
                          <TableCell>
                            <span className={`inline-block h-2 w-2 rounded-full ${rule.enabled ? "bg-emerald-500" : "bg-gray-400"}`} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openEditAlertRuleDialog(rule)} data-testid={`button-edit-alert-rule-${rule.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => { setDeletingAlertRuleId(rule.id); setDeleteAlertRuleDialogOpen(true); }} data-testid={`button-delete-alert-rule-${rule.id}`}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  Destinos de Alerta
                </h3>
                <Button onClick={openCreateAlertDestDialog} data-testid="button-new-alert-dest">
                  <Plus className="mr-2 h-4 w-4" />Novo Destino
                </Button>
              </div>
              {alertDestsLoading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !alertDestsData?.length ? (
                <Card className="border-border/20 border-dashed">
                  <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nenhum destino configurado. Alertas serão registrados apenas no Hub.</p>
                    <Button variant="outline" size="sm" onClick={openCreateAlertDestDialog} data-testid="button-new-alert-dest-empty"><Plus className="mr-2 h-4 w-4" />Adicionar Destino</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alertDestsData.map((dest) => {
                    const dtCfg = DEST_TYPE_LABELS[dest.type] || DEST_TYPE_LABELS.hub;
                    const DestIcon = dtCfg.icon;
                    return (
                      <div key={dest.id} className="p-4 rounded-xl border border-border/40 bg-card flex flex-col gap-3" data-testid={`card-alert-dest-${dest.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><DestIcon className="h-4 w-4 text-blue-400" /></div>
                            <div>
                              <p className="text-sm font-semibold">{dest.name}</p>
                              <p className="text-xs text-muted-foreground">{dtCfg.label}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs ${dest.enabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                            {dest.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => openEditAlertDestDialog(dest)} data-testid={`button-edit-alert-dest-${dest.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setDeletingAlertDestId(dest.id); setDeleteAlertDestDialogOpen(true); }} data-testid={`button-delete-alert-dest-${dest.id}`}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-violet-500" />
                  Monitores de Apps
                </h3>
                <Button onClick={openCreateAppMonitorDialog} data-testid="button-new-app-monitor">
                  <Plus className="mr-2 h-4 w-4" />Novo Monitor
                </Button>
              </div>
              {appMonitorsLoading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !appMonitorsData?.length ? (
                <Card className="border-border/20 border-dashed">
                  <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                    <Monitor className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nenhum monitor de app configurado</p>
                    <Button variant="outline" size="sm" onClick={openCreateAppMonitorDialog} data-testid="button-new-app-monitor-empty"><Plus className="mr-2 h-4 w-4" />Adicionar Monitor</Button>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Intervalo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appMonitorsData.map((mon) => {
                      const appName = appsData?.find((a) => a.id === mon.appId)?.name || mon.appId;
                      return (
                        <TableRow key={mon.id} data-testid={`row-app-monitor-${mon.id}`}>
                          <TableCell className="font-medium">{appName}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{MONITOR_TYPE_LABELS[mon.monitorType]}</Badge></TableCell>
                          <TableCell className="text-xs font-mono truncate max-w-[200px]">{mon.endpoint || "—"}</TableCell>
                          <TableCell className="text-xs">{mon.checkIntervalMinutes}min</TableCell>
                          <TableCell><span className={`inline-block h-2 w-2 rounded-full ${mon.enabled ? "bg-emerald-500" : "bg-gray-400"}`} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openEditAppMonitorDialog(mon)} data-testid={`button-edit-app-monitor-${mon.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => { setDeletingAppMonitorId(mon.id); setDeleteAppMonitorDialogOpen(true); }} data-testid={`button-delete-app-monitor-${mon.id}`}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={alertRuleDialogOpen} onOpenChange={(o) => { setAlertRuleDialogOpen(o); if (!o) { setEditingAlertRule(null); alertRuleForm.reset(defaultAlertRuleValues); } }}>
        <DialogContent className="max-w-lg" data-testid="dialog-alert-rule-form">
          <DialogHeader>
            <DialogTitle>{editingAlertRule ? "Editar Regra de Alerta" : "Nova Regra de Alerta"}</DialogTitle>
            <DialogDescription>Configure quando um alerta deve ser disparado.</DialogDescription>
          </DialogHeader>
          <Form {...alertRuleForm}>
            <form onSubmit={alertRuleForm.handleSubmit(onAlertRuleSubmit)} className="flex flex-col gap-4">
              <FormField control={alertRuleForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Ex: CPU Alta VPS" data-testid="input-alert-rule-name" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={alertRuleForm.control} name="targetType" render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Alvo</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); alertRuleForm.setValue("metric", METRIC_OPTIONS[v]?.options[0]?.value || ""); }} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-alert-target-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="vps">VPS</SelectItem>
                        <SelectItem value="app">App</SelectItem>
                        <SelectItem value="db">Banco</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={alertRuleForm.control} name="metric" render={({ field }) => (
                  <FormItem><FormLabel>Métrica</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-alert-metric"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(METRIC_OPTIONS[watchTargetType]?.options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={alertRuleForm.control} name="targetId" render={({ field }) => (
                <FormItem><FormLabel>Alvo Específico (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger data-testid="select-alert-target-id"><SelectValue placeholder="Todos" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {watchTargetType === "vps" && vpsServersData?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                      {watchTargetType === "app" && appsData?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={alertRuleForm.control} name="operator" render={({ field }) => (
                  <FormItem><FormLabel>Operador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-alert-operator"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="gt">Maior que (&gt;)</SelectItem>
                        <SelectItem value="lt">Menor que (&lt;)</SelectItem>
                        <SelectItem value="eq">Igual a (=)</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={alertRuleForm.control} name="threshold" render={({ field }) => (
                  <FormItem><FormLabel>Threshold</FormLabel><FormControl><Input {...field} type="number" data-testid="input-alert-threshold" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={alertRuleForm.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Ciclos</FormLabel><FormControl><Input {...field} type="number" min={1} data-testid="input-alert-duration" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={alertRuleForm.control} name="severity" render={({ field }) => (
                  <FormItem><FormLabel>Severidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-alert-severity"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={alertRuleForm.control} name="enabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-2 rounded-lg border border-border/30 p-3 mt-5">
                    <FormLabel className="text-sm">Ativa</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-alert-rule-enabled" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAlertRuleMutating} data-testid="button-submit-alert-rule">
                  {isAlertRuleMutating ? "Salvando..." : editingAlertRule ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAlertRuleDialogOpen} onOpenChange={setDeleteAlertRuleDialogOpen}>
        <DialogContent data-testid="dialog-delete-alert-rule">
          <DialogHeader>
            <DialogTitle>Excluir Regra de Alerta</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir esta regra? Alertas baseados nela não serão mais gerados.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAlertRuleDialogOpen(false)} data-testid="button-cancel-delete-alert-rule">Cancelar</Button>
            <Button variant="destructive" disabled={deleteAlertRuleMutation.isPending} onClick={() => deletingAlertRuleId && deleteAlertRuleMutation.mutate(deletingAlertRuleId)} data-testid="button-confirm-delete-alert-rule">
              {deleteAlertRuleMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={alertDestDialogOpen} onOpenChange={(o) => { setAlertDestDialogOpen(o); if (!o) { setEditingAlertDest(null); alertDestForm.reset(defaultAlertDestValues); } }}>
        <DialogContent className="max-w-lg" data-testid="dialog-alert-dest-form">
          <DialogHeader>
            <DialogTitle>{editingAlertDest ? "Editar Destino" : "Novo Destino de Alerta"}</DialogTitle>
            <DialogDescription>Configure para onde os alertas serão enviados.</DialogDescription>
          </DialogHeader>
          <Form {...alertDestForm}>
            <form onSubmit={alertDestForm.handleSubmit(onAlertDestSubmit)} className="flex flex-col gap-4">
              <FormField control={alertDestForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Ex: Discord Webhook" data-testid="input-alert-dest-name" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={alertDestForm.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-alert-dest-type"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="hub">Hub (interno)</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={alertDestForm.control} name="config" render={({ field }) => (
                <FormItem><FormLabel>Configuração (URL/email/JSON)</FormLabel><FormControl>
                  <Textarea {...field} className="resize-none font-mono text-sm" rows={3} placeholder='{"url": "https://..."}' data-testid="textarea-alert-dest-config" />
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={alertDestForm.control} name="enabled" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-lg border border-border/30 p-3">
                  <FormLabel className="text-sm">Ativo</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-alert-dest-enabled" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={isAlertDestMutating} data-testid="button-submit-alert-dest">
                  {isAlertDestMutating ? "Salvando..." : editingAlertDest ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAlertDestDialogOpen} onOpenChange={setDeleteAlertDestDialogOpen}>
        <DialogContent data-testid="dialog-delete-alert-dest">
          <DialogHeader>
            <DialogTitle>Excluir Destino</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este destino?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAlertDestDialogOpen(false)} data-testid="button-cancel-delete-alert-dest">Cancelar</Button>
            <Button variant="destructive" disabled={deleteAlertDestMutation.isPending} onClick={() => deletingAlertDestId && deleteAlertDestMutation.mutate(deletingAlertDestId)} data-testid="button-confirm-delete-alert-dest">
              {deleteAlertDestMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={appMonitorDialogOpen} onOpenChange={(o) => { setAppMonitorDialogOpen(o); if (!o) { setEditingAppMonitor(null); appMonitorForm.reset(defaultAppMonitorValues); } }}>
        <DialogContent className="max-w-lg" data-testid="dialog-app-monitor-form">
          <DialogHeader>
            <DialogTitle>{editingAppMonitor ? "Editar Monitor" : "Novo Monitor de App"}</DialogTitle>
            <DialogDescription>Configure o monitoramento de um aplicativo.</DialogDescription>
          </DialogHeader>
          <Form {...appMonitorForm}>
            <form onSubmit={appMonitorForm.handleSubmit(onAppMonitorSubmit)} className="flex flex-col gap-4">
              <FormField control={appMonitorForm.control} name="appId" render={({ field }) => (
                <FormItem><FormLabel>Aplicativo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-app-monitor-app"><SelectValue placeholder="Selecione o app" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {appsData?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={appMonitorForm.control} name="monitorType" render={({ field }) => (
                  <FormItem><FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-app-monitor-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="pm2">PM2</SelectItem>
                        <SelectItem value="docker">Docker</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={appMonitorForm.control} name="vpsId" render={({ field }) => (
                  <FormItem><FormLabel>VPS (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger data-testid="select-app-monitor-vps"><SelectValue placeholder="Nenhum" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {vpsServersData?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={appMonitorForm.control} name="endpoint" render={({ field }) => (
                <FormItem><FormLabel>Endpoint / Nome do Processo</FormLabel><FormControl>
                  <Input {...field} placeholder="https://app.example.com/health" data-testid="input-app-monitor-endpoint" />
                </FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={appMonitorForm.control} name="expectedStatus" render={({ field }) => (
                  <FormItem><FormLabel>Status Esperado</FormLabel><FormControl><Input {...field} type="number" data-testid="input-app-monitor-status" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={appMonitorForm.control} name="checkIntervalMinutes" render={({ field }) => (
                  <FormItem><FormLabel>Intervalo (min)</FormLabel><FormControl><Input {...field} type="number" min={1} data-testid="input-app-monitor-interval" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={appMonitorForm.control} name="enabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-2 rounded-lg border border-border/30 p-3 mt-5">
                    <FormLabel className="text-sm">Ativo</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-app-monitor-enabled" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAppMonitorMutating} data-testid="button-submit-app-monitor">
                  {isAppMonitorMutating ? "Salvando..." : editingAppMonitor ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAppMonitorDialogOpen} onOpenChange={setDeleteAppMonitorDialogOpen}>
        <DialogContent data-testid="dialog-delete-app-monitor">
          <DialogHeader>
            <DialogTitle>Excluir Monitor</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este monitor?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAppMonitorDialogOpen(false)} data-testid="button-cancel-delete-app-monitor">Cancelar</Button>
            <Button variant="destructive" disabled={deleteAppMonitorMutation.isPending} onClick={() => deletingAppMonitorId && deleteAppMonitorMutation.mutate(deletingAppMonitorId)} data-testid="button-confirm-delete-app-monitor">
              {deleteAppMonitorMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-user-form">
          <DialogHeader>
            <DialogTitle data-testid="text-user-dialog-title">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Atualize os dados do usuário." : "Preencha os dados do novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="flex flex-col gap-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-user-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-user-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{editingUser ? "Senha (deixe vazio para manter)" : "Senha"}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" value={field.value ?? ""} data-testid="input-user-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" value={field.value ?? ""} data-testid="input-user-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "viewer"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user-role">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>Ativo</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          data-testid="switch-user-active"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUserMutating} data-testid="button-submit-user">
                  {isUserMutating ? "Salvando..." : editingUser ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent data-testid="dialog-delete-user">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)} data-testid="button-cancel-delete-user">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteUserMutation.isPending}
              onClick={() => deletingUserId && deleteUserMutation.mutate(deletingUserId)}
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-integration-form">
          <DialogHeader>
            <DialogTitle data-testid="text-integration-dialog-title">
              {editingIntegration ? "Editar Integração" : "Nova Integração"}
            </DialogTitle>
            <DialogDescription>
              {editingIntegration ? "Atualize os dados da integração." : "Preencha os dados da nova integração."}
            </DialogDescription>
          </DialogHeader>
          <Form {...integrationForm}>
            <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="flex flex-col gap-4">
              <FormField
                control={integrationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-integration-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={integrationForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "messaging"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-integration-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="messaging">Mensageria</SelectItem>
                        <SelectItem value="calendar">Calendário</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="development">Desenvolvimento</SelectItem>
                        <SelectItem value="productivity">Produtividade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={integrationForm.control}
                name="config"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuração (API Key / Webhook URL)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-integration-config"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isIntegrationMutating} data-testid="button-submit-integration">
                  {isIntegrationMutating ? "Salvando..." : editingIntegration ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteIntegrationDialogOpen} onOpenChange={setDeleteIntegrationDialogOpen}>
        <DialogContent data-testid="dialog-delete-integration">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta integração? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIntegrationDialogOpen(false)} data-testid="button-cancel-delete-integration">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteIntegrationMutation.isPending}
              onClick={() => deletingIntegrationId && deleteIntegrationMutation.mutate(deletingIntegrationId)}
              data-testid="button-confirm-delete-integration"
            >
              {deleteIntegrationMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-ai-form">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" data-testid="text-ai-dialog-title">
              <Brain className="h-5 w-5 text-violet-400" />
              {editingAiConfig ? "Editar Provedor de IA" : "Novo Provedor de IA"}
            </DialogTitle>
            <DialogDescription>
              {editingAiConfig
                ? "Atualize as configurações do provedor."
                : "Configure um provedor de IA para habilitar funcionalidades inteligentes no sistema."}
            </DialogDescription>
          </DialogHeader>
          <Form {...aiConfigForm}>
            <form onSubmit={aiConfigForm.handleSubmit(onAiConfigSubmit)} className="flex flex-col gap-4">
              <FormField
                control={aiConfigForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Configuração</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: OpenAI Principal" data-testid="input-ai-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={aiConfigForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provedor</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          const models = PROVIDER_INFO[val]?.models;
                          if (models && models.length > 0) {
                            aiConfigForm.setValue("model", models[0]);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-provider">
                            <SelectValue placeholder="Selecione o provedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={aiConfigForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-model">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(PROVIDER_INFO[selectedProvider]?.models || []).map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={aiConfigForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingAiConfig ? "API Key (deixe vazio para manter)" : "API Key"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={editingAiConfig ? "••••••••" : "sk-..."}
                        data-testid="input-ai-key"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={aiConfigForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-2 rounded-lg border border-border/30 p-3">
                      <div>
                        <FormLabel className="text-sm font-medium">Ativo</FormLabel>
                        <p className="text-xs text-muted-foreground">Habilitar provedor</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-ai-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={aiConfigForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-2 rounded-lg border border-border/30 p-3">
                      <div>
                        <FormLabel className="text-sm font-medium">Prioridade</FormLabel>
                        <p className="text-xs text-muted-foreground">Menor = principal</p>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={99}
                          className="w-16 text-center"
                          data-testid="input-ai-priority"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                O provedor ativo com menor prioridade será o principal. Os demais serão usados como fallback em caso de falha.
              </p>
              <DialogFooter>
                <Button type="submit" disabled={isAiMutating} data-testid="button-submit-ai">
                  {isAiMutating ? "Salvando..." : editingAiConfig ? "Atualizar" : "Configurar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAiDialogOpen} onOpenChange={setDeleteAiDialogOpen}>
        <DialogContent data-testid="dialog-delete-ai">
          <DialogHeader>
            <DialogTitle>Remover Provedor de IA</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este provedor? As funcionalidades de IA que dependem dele deixarão de funcionar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAiDialogOpen(false)} data-testid="button-cancel-delete-ai">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAiConfigMutation.isPending}
              onClick={() => deletingAiId && deleteAiConfigMutation.mutate(deletingAiId)}
              data-testid="button-confirm-delete-ai"
            >
              {deleteAiConfigMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Origins Dialog */}
      <Dialog open={originDialogOpen} onOpenChange={(o) => { setOriginDialogOpen(o); if (!o) { setEditingOrigin(null); originForm.reset(defaultOriginValues); } }}>
        <DialogContent className="max-w-md" data-testid="dialog-origin-form">
          <DialogHeader>
            <DialogTitle>{editingOrigin ? "Editar Origem" : "Nova Origem"}</DialogTitle>
            <DialogDescription>
              {editingOrigin ? "Altere as informações da origem." : "Cadastre uma nova origem para classificar aplicativos."}
            </DialogDescription>
          </DialogHeader>
          <Form {...originForm}>
            <form onSubmit={originForm.handleSubmit(onOriginSubmit)} className="flex flex-col gap-4">
              <FormField
                control={originForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de exibição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Acelera IT" data-testid="input-origin-label" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={originForm.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave interna</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: acelera_it"
                        disabled={!!editingOrigin}
                        className={editingOrigin ? "opacity-60" : ""}
                        data-testid="input-origin-key"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Identificador único. Somente letras minúsculas, números e _.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={originForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-9 w-12 rounded-md border border-input cursor-pointer p-0.5"
                            data-testid="input-origin-color"
                          />
                          <Input
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="font-mono text-xs"
                            placeholder="#3b82f6"
                            data-testid="input-origin-color-text"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={originForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 h-9">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-origin-active"
                          />
                          <span className="text-sm">{field.value ? "Ativo" : "Inativo"}</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isOriginMutating} data-testid="button-submit-origin">
                  {isOriginMutating ? "Salvando..." : editingOrigin ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Origin Dialog */}
      <Dialog open={deleteOriginDialogOpen} onOpenChange={setDeleteOriginDialogOpen}>
        <DialogContent data-testid="dialog-delete-origin">
          <DialogHeader>
            <DialogTitle>Excluir Origem</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta origem? Aplicativos que usam esta origem não serão afetados, mas ela não estará mais disponível para novos registros.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOriginDialogOpen(false)} data-testid="button-cancel-delete-origin">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteOriginMutation.isPending}
              onClick={() => deletingOriginId && deleteOriginMutation.mutate(deletingOriginId)}
              data-testid="button-confirm-delete-origin"
            >
              {deleteOriginMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clientTypeDialogOpen} onOpenChange={(o) => { setClientTypeDialogOpen(o); if (!o) { setEditingClientType(null); clientTypeForm.reset(defaultClientTypeValues); } }}>
        <DialogContent className="max-w-md" data-testid="dialog-client-type-form">
          <DialogHeader>
            <DialogTitle>{editingClientType ? "Editar Tipo de Cliente" : "Novo Tipo de Cliente"}</DialogTitle>
            <DialogDescription>
              {editingClientType ? "Altere as informações do tipo de cliente." : "Cadastre um novo tipo para classificar clientes."}
            </DialogDescription>
          </DialogHeader>
          <Form {...clientTypeForm}>
            <form onSubmit={clientTypeForm.handleSubmit(onClientTypeSubmit)} className="flex flex-col gap-4">
              <FormField
                control={clientTypeForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de exibição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Parceiro" data-testid="input-client-type-label" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientTypeForm.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave interna</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: parceiro"
                        disabled={!!editingClientType}
                        className={editingClientType ? "opacity-60" : ""}
                        data-testid="input-client-type-key"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Identificador único. Somente letras minúsculas, números e _.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={clientTypeForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-9 w-12 rounded-md border border-input cursor-pointer p-0.5"
                            data-testid="input-client-type-color"
                          />
                          <Input
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="font-mono text-xs"
                            placeholder="#3b82f6"
                            data-testid="input-client-type-color-text"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={clientTypeForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 h-9">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-client-type-active"
                          />
                          <span className="text-sm">{field.value ? "Ativo" : "Inativo"}</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isClientTypeMutating} data-testid="button-submit-client-type">
                  {isClientTypeMutating ? "Salvando..." : editingClientType ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteClientTypeDialogOpen} onOpenChange={setDeleteClientTypeDialogOpen}>
        <DialogContent data-testid="dialog-delete-client-type">
          <DialogHeader>
            <DialogTitle>Excluir Tipo de Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este tipo? Clientes que usam este tipo não serão afetados, mas ele não estará mais disponível para novos registros.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteClientTypeDialogOpen(false)} data-testid="button-cancel-delete-client-type">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteClientTypeMutation.isPending}
              onClick={() => deletingClientTypeId && deleteClientTypeMutation.mutate(deletingClientTypeId)}
              data-testid="button-confirm-delete-client-type"
            >
              {deleteClientTypeMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
