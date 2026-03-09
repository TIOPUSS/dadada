import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FinancialEntry, App } from "@shared/schema";
import { insertFinancialEntrySchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";

import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Pencil,
  Trash2,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Filter,
  X,
  Search,
  RefreshCw,
  BarChart3,
  Receipt,
  Tag,
  Layers,
} from "lucide-react";

const formSchema = insertFinancialEntrySchema.extend({
  amount: z.string().min(1, "Valor obrigatório"),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "Data obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatShortMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}

export default function FinancialPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<FinancialEntry | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const { data: entries = [], isLoading: entriesLoading } = useQuery<FinancialEntry[]>({
    queryKey: ["/api/financial-entries"],
  });

  const { data: apps = [], isLoading: appsLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Record<string, any>>({
    queryKey: ["/api/dashboard/stats"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "income",
      category: "",
      appId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      recurring: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("POST", "/api/financial-entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Entrada criada com sucesso" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar entrada", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PUT", `/api/financial-entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Entrada atualizada com sucesso" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar entrada", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/financial-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Entrada removida com sucesso" });
      setDeleteDialogOpen(false);
      setDeletingEntry(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover entrada", description: error.message, variant: "destructive" });
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    form.reset({
      type: "income",
      category: "",
      appId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      recurring: false,
    });
  }

  function openCreate() {
    setEditingEntry(null);
    form.reset({
      type: "income",
      category: "",
      appId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      recurring: false,
    });
    setDialogOpen(true);
  }

  function openEditDialog(entry: FinancialEntry) {
    setEditingEntry(entry);
    form.reset({
      type: entry.type,
      category: entry.category || "",
      appId: entry.appId || "",
      amount: entry.amount?.toString() || "",
      date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
      description: entry.description || "",
      recurring: entry.recurring || false,
    });
    setDialogOpen(true);
  }

  function openDelete(entry: FinancialEntry) {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const payload = {
      type: values.type,
      category: values.category || null,
      appId: values.appId === "none" ? null : values.appId || null,
      amount: values.amount,
      date: new Date(values.date).toISOString(),
      description: values.description || null,
      recurring: values.recurring || false,
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredEntries = useMemo(() => {
    let result = [...entries];
    if (activeTab === "income") {
      result = result.filter((e) => e.type === "income");
    } else if (activeTab === "expenses") {
      result = result.filter((e) => e.type === "expense");
    } else if (activeTab === "recurring") {
      result = result.filter((e) => e.recurring);
    }
    if (filterCategory) {
      result = result.filter((e) =>
        e.category?.toLowerCase().includes(filterCategory.toLowerCase()) ||
        e.description?.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, activeTab, filterCategory]);

  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthIncome = monthEntries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const monthExpense = monthEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const mrr = monthIncome;
    const arr = mrr * 12;
    const margin = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;
    const netProfit = monthIncome - monthExpense;
    return { mrr, arr, monthIncome, monthExpense, margin, netProfit };
  }, [entries]);

  const revenueByApp = useMemo(() => {
    const appMap: Record<string, number> = {};
    entries
      .filter((e) => e.type === "income")
      .forEach((e) => {
        const appName = apps.find((a) => a.id === e.appId)?.name || "Sem App";
        appMap[appName] = (appMap[appName] || 0) + parseFloat(e.amount || "0");
      });
    return Object.entries(appMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [entries, apps]);

  const monthlyTrend = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number }> = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
      if (e.type === "income") {
        monthMap[key].income += parseFloat(e.amount || "0");
      } else {
        monthMap[key].expense += parseFloat(e.amount || "0");
      }
    });
    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month: formatShortMonth(month),
        receita: data.income,
        despesa: data.expense,
        lucro: data.income - data.expense,
      }));
  }, [entries]);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, { income: number; expense: number }> = {};
    entries.forEach((e) => {
      const cat = e.category || "Sem Categoria";
      if (!cats[cat]) cats[cat] = { income: 0, expense: 0 };
      if (e.type === "income") cats[cat].income += parseFloat(e.amount || "0");
      else cats[cat].expense += parseFloat(e.amount || "0");
    });
    return Object.entries(cats)
      .map(([name, data]) => ({ name, ...data, total: data.income - data.expense }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [entries]);

  const appNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    apps.forEach((a) => { map[a.id] = a.name; });
    return map;
  }, [apps]);

  const tabCounts = useMemo(() => ({
    all: entries.length,
    income: entries.filter((e) => e.type === "income").length,
    expenses: entries.filter((e) => e.type === "expense").length,
    recurring: entries.filter((e) => e.recurring).length,
  }), [entries]);

  const isLoading = entriesLoading || appsLoading || statsLoading;
  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0 animate-pulse" data-testid="financial-loading">
        <div className="h-[140px] bg-gradient-to-br from-muted/30 to-transparent" />
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 min-h-full" data-testid="financial-page">
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/5 via-transparent to-transparent rounded-full translate-x-1/3 -translate-y-1/3" />

        <div className="relative px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 ring-1 ring-emerald-500/15 shadow-lg shadow-emerald-500/5">
                <Landmark className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Gestão Financeira</h1>
                <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-page-subtitle">
                  Receitas, despesas e indicadores financeiros
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${showFilters ? "bg-accent" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-3.5 w-3.5" />
                Filtros
              </Button>
              <Button onClick={openCreate} className="gap-2 shadow-sm" data-testid="button-new-entry">
                <Plus className="h-4 w-4" />
                Nova Entrada
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { key: "mrr", label: "MRR", value: formatCurrency(kpis.mrr), icon: DollarSign, color: "text-blue-500", bgColor: "from-blue-500/15 to-blue-500/5", ringColor: "ring-blue-500/15" },
            { key: "arr", label: "ARR", value: formatCurrency(kpis.arr), icon: TrendingUp, color: "text-emerald-500", bgColor: "from-emerald-500/15 to-emerald-500/5", ringColor: "ring-emerald-500/15" },
            { key: "monthIncome", label: "Receita do Mês", value: formatCurrency(kpis.monthIncome), icon: ArrowUpRight, color: "text-green-500", bgColor: "from-green-500/15 to-green-500/5", ringColor: "ring-green-500/15" },
            { key: "monthExpense", label: "Despesas do Mês", value: formatCurrency(kpis.monthExpense), icon: ArrowDownRight, color: "text-red-500", bgColor: "from-red-500/15 to-red-500/5", ringColor: "ring-red-500/15" },
            { key: "margin", label: "Margem Líquida", value: `${kpis.margin.toFixed(1)}%`, icon: Percent, color: "text-violet-500", bgColor: "from-violet-500/15 to-violet-500/5", ringColor: "ring-violet-500/15", extra: kpis.netProfit },
          ].map((kpi) => (
            <div
              key={kpi.key}
              className="rounded-2xl border border-border/30 bg-card/50 p-5 hover:border-border/50 transition-all duration-200 hover:shadow-sm"
              data-testid={`card-${kpi.key}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.bgColor} flex items-center justify-center ring-1 ${kpi.ringColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                {kpi.key === "margin" && (
                  <Badge
                    variant={kpis.margin >= 0 ? "default" : "destructive"}
                    className="text-[10px] h-5 px-2"
                  >
                    {kpis.margin >= 0 ? "+" : ""}{kpis.margin.toFixed(0)}%
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60">{kpi.label}</p>
                <p className={`text-xl font-bold font-mono mt-1 ${kpi.key === "monthExpense" ? "text-red-500" : ""}`} data-testid={`text-${kpi.key}`}>
                  {kpi.value}
                </p>
                {kpi.key === "margin" && kpi.extra !== undefined && (
                  <p className={`text-xs font-mono mt-0.5 ${kpi.extra >= 0 ? "text-emerald-500/70" : "text-red-500/70"}`}>
                    Lucro: {formatCurrency(kpi.extra)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-border/30 bg-card/50 p-5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary/60" />
                <h3 className="text-sm font-semibold">Buscar entradas</h3>
              </div>
              {filterCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => setFilterCategory("")}
                  data-testid="button-clear-filters"
                >
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
            <Input
              placeholder="Buscar por categoria ou descrição..."
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="max-w-md"
              data-testid="filter-category"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/30 bg-card/50 p-6 hover:shadow-sm transition-all" data-testid="chart-revenue-by-app">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/5 flex items-center justify-center ring-1 ring-blue-500/15">
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold">Receita por App</h3>
            </div>
            {revenueByApp.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByApp} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={100} />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" fill="hsl(217 91% 52%)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-center mb-3">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground/50">Sem dados de receita</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/50 p-6 hover:shadow-sm transition-all" data-testid="chart-income-expense-trend">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center ring-1 ring-emerald-500/15">
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold">Receitas vs Despesas</h3>
            </div>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend} margin={{ left: 10, right: 10 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 76% 45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(142 76% 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name === "receita" ? "Receita" : "Despesa"]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(142 76% 45%)" fill="url(#incomeGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="despesa" stroke="hsl(0 84% 60%)" fill="url(#expenseGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-center mb-3">
                  <Activity className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground/50">Sem dados de tendência</p>
              </div>
            )}
          </div>
        </div>

        {categoryBreakdown.length > 0 && (
          <div className="rounded-2xl border border-border/30 bg-card/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/15 to-violet-500/5 flex items-center justify-center ring-1 ring-violet-500/15">
                <Layers className="h-4 w-4 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold">Resumo por Categoria</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryBreakdown.slice(0, 6).map((cat) => {
                const maxVal = Math.max(...categoryBreakdown.map((c) => Math.max(c.income, c.expense))) || 1;
                return (
                  <div key={cat.name} className="rounded-xl border border-border/20 bg-card/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <span className={`text-xs font-bold font-mono ${cat.total >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {cat.total >= 0 ? "+" : ""}{formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 mb-1">
                          <span>Receita</span>
                          <span className="font-mono">{formatCurrency(cat.income)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                            style={{ width: `${(cat.income / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 mb-1">
                          <span>Despesa</span>
                          <span className="font-mono">{formatCurrency(cat.expense)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500/60 transition-all duration-500"
                            style={{ width: `${(cat.expense / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 dark:bg-white/5 w-fit mb-5" data-testid="tabs-financial">
            {[
              { value: "all", label: "Todas", count: tabCounts.all },
              { value: "income", label: "Receitas", count: tabCounts.income },
              { value: "expenses", label: "Despesas", count: tabCounts.expenses },
              { value: "recurring", label: "Recorrentes", count: tabCounts.recurring },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
                data-testid={`tab-${tab.value === "all" ? "overview" : tab.value}`}
              >
                {tab.label}
                <span className={`
                  text-[10px] font-mono px-1.5 py-0.5 rounded-md
                  ${activeTab === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground/60"
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border/30 bg-gradient-to-b from-muted/10 to-transparent p-16 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Receipt className="h-10 w-10 text-primary/25" />
              </div>
              <div>
                <p className="text-base font-semibold text-muted-foreground/70" data-testid="text-empty-table">Nenhuma entrada encontrada</p>
                <p className="text-sm text-muted-foreground/40 mt-1">Adicione receitas e despesas para começar</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3" data-testid="table-entries">
              {filteredEntries.map((entry) => {
                const isIncome = entry.type === "income";
                const amount = parseFloat(entry.amount || "0");

                return (
                  <div
                    key={entry.id}
                    className={`
                      group relative rounded-xl border bg-card/50 p-4 transition-all duration-200 hover:shadow-sm
                      ${isIncome
                        ? "border-border/30 hover:border-emerald-500/30"
                        : "border-border/30 hover:border-red-500/30"
                      }
                    `}
                    data-testid={`row-entry-${entry.id}`}
                  >
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full" style={{ backgroundColor: isIncome ? "hsl(142 76% 45% / 0.5)" : "hsl(0 84% 60% / 0.5)" }} />

                    <div className="flex items-center gap-4 flex-wrap pl-2">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${isIncome ? "from-emerald-500/15 to-emerald-500/5" : "from-red-500/15 to-red-500/5"} flex items-center justify-center ring-1 ${isIncome ? "ring-emerald-500/15" : "ring-red-500/15"} shrink-0`}>
                        {isIncome ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">
                            {entry.description || (isIncome ? "Receita" : "Despesa")}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? "bg-emerald-500" : "bg-red-500"}`} />
                            {isIncome ? "Receita" : "Despesa"}
                          </span>
                          {entry.recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                              <RefreshCw className="h-2.5 w-2.5" />
                              Recorrente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.date)}
                          </span>
                          {entry.category && (
                            <span className="flex items-center gap-1" data-testid={`text-category-${entry.id}`}>
                              <Tag className="h-3 w-3" />
                              {entry.category}
                            </span>
                          )}
                          {entry.appId && appNameMap[entry.appId] && (
                            <span className="flex items-center gap-1" data-testid={`text-app-${entry.id}`}>
                              <Layers className="h-3 w-3" />
                              {appNameMap[entry.appId]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`text-lg font-bold font-mono ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} data-testid={`text-amount-${entry.id}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(amount)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${entry.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(entry)}
                              className="gap-2"
                              data-testid={`button-edit-${entry.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDelete(entry)}
                              className="gap-2 text-destructive focus:text-destructive"
                              data-testid={`button-delete-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-entry">
          <DialogHeader>
            <DialogTitle>Excluir Entrada?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir esta {deletingEntry?.type === "income" ? "receita" : "despesa"} de{" "}
            <strong>{formatCurrency(parseFloat(deletingEntry?.amount || "0"))}</strong>?
            {deletingEntry?.description && (
              <> — <em>{deletingEntry.description}</em></>
            )}
            {" "}Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" data-testid="button-cancel-delete">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deletingEntry && deleteMutation.mutate(deletingEntry.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-entry-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingEntry ? "Editar Entrada" : "Nova Entrada"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-entry">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0,00" data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Ex: SaaS, Infra" data-testid="input-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="appId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-app">
                          <SelectValue placeholder="Selecione o app" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {apps.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder="Descrição da entrada" data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/30 p-3">
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-recurring"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-medium cursor-pointer">Recorrente</FormLabel>
                      <p className="text-xs text-muted-foreground/50">Marque se esta entrada se repete mensalmente</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isMutating} data-testid="button-submit">
                  {isMutating ? "Salvando..." : editingEntry ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
