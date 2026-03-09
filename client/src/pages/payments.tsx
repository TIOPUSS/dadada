import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Payment, Client, Contract } from "@shared/schema";
import { insertPaymentSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Clock,
  CircleCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  Banknote,
  Receipt,
  Wallet,
  BarChart3,
  Users,
  X,
} from "lucide-react";

const formSchema = insertPaymentSchema.extend({
  amount: z.string().min(1, "Valor obrigatório"),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(value: string | number | null | undefined): string {
  if (!value) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d atrás`;
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return `Em ${diffDays}d`;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Pendente", dot: "bg-amber-500", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
  paid: { label: "Pago", dot: "bg-emerald-500", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CircleCheck },
  overdue: { label: "Em Atraso", dot: "bg-red-500", bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: AlertTriangle },
  negotiating: { label: "Negociando", dot: "bg-blue-500", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Wallet },
};

const METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  credit_card: "Cartão de Crédito",
  bank_transfer: "Transferência",
  boleto: "Boleto",
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: payments = [], isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });
  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const clientMap = useMemo(() => {
    const m: Record<string, string> = {};
    clients.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [clients]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      clientId: "",
      amount: "",
      dueDate: "",
      paidDate: "",
      status: "pending",
      paymentMethod: "",
      notes: "",
    },
  });

  function openCreate() {
    setEditingPayment(null);
    form.reset({
      contractId: "",
      clientId: "",
      amount: "",
      dueDate: "",
      paidDate: "",
      status: "pending",
      paymentMethod: "",
      notes: "",
    });
    setDialogOpen(true);
  }

  function openEdit(p: Payment) {
    setEditingPayment(p);
    form.reset({
      contractId: p.contractId || "",
      clientId: p.clientId || "",
      amount: p.amount?.toString() || "",
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
      paidDate: p.paidDate ? new Date(p.paidDate).toISOString().split("T")[0] : "",
      status: p.status,
      paymentMethod: p.paymentMethod || "",
      notes: p.notes || "",
    });
    setDialogOpen(true);
  }

  function openDelete(p: Payment) {
    setDeletingPayment(p);
    setDeleteDialogOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Pagamento criado com sucesso" });
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar pagamento", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PUT", `/api/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Pagamento atualizado com sucesso" });
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar pagamento", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Pagamento removido" });
      setDeleteDialogOpen(false);
      setDeletingPayment(null);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao remover pagamento", description: err.message, variant: "destructive" });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/payments/${id}`, {
        status: "paid",
        paidDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Pagamento marcado como pago" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  function onSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      ...values,
      amount: values.amount,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      paidDate: values.paidDate ? new Date(values.paidDate).toISOString() : null,
      contractId: values.contractId || null,
      clientId: values.clientId || null,
    };
    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (activeTab === "pending") result = result.filter((p) => p.status === "pending");
    else if (activeTab === "overdue") result = result.filter((p) => p.status === "overdue");
    else if (activeTab === "paid") result = result.filter((p) => p.status === "paid");

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      result = result.filter((p) => p.dueDate && new Date(p.dueDate) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((p) => p.dueDate && new Date(p.dueDate) <= to);
    }
    return result.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [payments, activeTab, filterDateFrom, filterDateTo]);

  const overduePayments = useMemo(
    () => payments.filter((p) => p.status === "overdue"),
    [payments]
  );

  const totalOverdue = useMemo(
    () => overduePayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
    [overduePayments]
  );

  const totalPending = useMemo(
    () => payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
    [payments]
  );

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
    [payments]
  );

  const totalAll = useMemo(
    () => payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
    [payments]
  );

  const overdueRanking = useMemo(() => {
    const byClient: Record<string, number> = {};
    overduePayments.forEach((p) => {
      const cid = p.clientId || "unknown";
      byClient[cid] = (byClient[cid] || 0) + parseFloat(p.amount || "0");
    });
    return Object.entries(byClient)
      .map(([clientId, amount]) => ({ clientId, name: clientMap[clientId] || clientId, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [overduePayments, clientMap]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const tabCounts = useMemo(() => ({
    all: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    overdue: overduePayments.length,
    paid: payments.filter((p) => p.status === "paid").length,
  }), [payments, overduePayments]);

  if (loadingPayments) {
    return (
      <div className="flex flex-col gap-0 animate-pulse" data-testid="payments-loading">
        <div className="h-[140px] bg-gradient-to-br from-muted/30 to-transparent" />
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 min-h-full" data-testid="payments-page">
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent dark:from-violet-500/15 dark:via-violet-500/5" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/5 via-transparent to-transparent rounded-full translate-x-1/3 -translate-y-1/3" />

        <div className="relative px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-violet-500/5 ring-1 ring-violet-500/15 shadow-lg shadow-violet-500/5">
                <CreditCard className="h-7 w-7 text-violet-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Pagamentos</h1>
                <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-page-subtitle">
                  Controle de recebimentos e cobranças
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
              <Button onClick={openCreate} className="gap-2 shadow-sm" data-testid="button-new-payment">
                <Plus className="h-4 w-4" />
                Novo Pagamento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Geral", value: totalAll, icon: Banknote, color: "text-violet-500", bgColor: "from-violet-500/15 to-violet-500/5", ringColor: "ring-violet-500/15", testId: "text-total-all" },
            { label: "Total Pendente", value: totalPending, icon: Clock, color: "text-amber-500", bgColor: "from-amber-500/15 to-amber-500/5", ringColor: "ring-amber-500/15", testId: "text-total-pending" },
            { label: "Total Em Atraso", value: totalOverdue, icon: AlertTriangle, color: "text-red-500", bgColor: "from-red-500/15 to-red-500/5", ringColor: "ring-red-500/15", testId: "text-total-overdue-kpi", isAlert: true },
            { label: "Total Pago", value: totalPaid, icon: CircleCheck, color: "text-emerald-500", bgColor: "from-emerald-500/15 to-emerald-500/5", ringColor: "ring-emerald-500/15", testId: "text-total-paid" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-border/30 bg-card/50 p-5 hover:border-border/50 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.bgColor} flex items-center justify-center ring-1 ${kpi.ringColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                {kpi.isAlert && totalOverdue > 0 && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-2">
                    {overduePayments.length}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60">{kpi.label}</p>
                <p className={`text-xl font-bold font-mono mt-1 ${kpi.isAlert && totalOverdue > 0 ? "text-red-500" : ""}`} data-testid={kpi.testId}>
                  {formatCurrency(kpi.value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-border/30 bg-card/50 p-5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/60" />
                <h3 className="text-sm font-semibold">Filtrar por período</h3>
              </div>
              {(filterDateFrom || filterDateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }}
                  data-testid="button-clear-filters"
                >
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">De:</label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-auto text-sm"
                  data-testid="input-filter-date-from"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Até:</label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-auto text-sm"
                  data-testid="input-filter-date-to"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 dark:bg-white/5 w-fit mb-5" data-testid="tabs-payment-status">
            {[
              { value: "all", label: "Todos", count: tabCounts.all },
              { value: "pending", label: "Pendentes", count: tabCounts.pending },
              { value: "overdue", label: "Em Atraso", count: tabCounts.overdue },
              { value: "paid", label: "Pagos", count: tabCounts.paid },
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
                data-testid={`tab-${tab.value}`}
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

          {filteredPayments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border/30 bg-gradient-to-b from-muted/10 to-transparent p-16 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Receipt className="h-10 w-10 text-primary/25" />
              </div>
              <div>
                <p className="text-base font-semibold text-muted-foreground/70">Nenhum pagamento encontrado</p>
                <p className="text-sm text-muted-foreground/40 mt-1">Ajuste os filtros ou crie um novo pagamento</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3" data-testid="table-payments">
              {filteredPayments.map((payment) => {
                const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                const isOverdue = payment.status === "overdue";
                const isPaid = payment.status === "paid";
                const clientName = clientMap[payment.clientId || ""] || "—";

                return (
                  <div
                    key={payment.id}
                    className={`
                      group relative rounded-xl border bg-card/50 p-4 transition-all duration-200 hover:shadow-sm
                      ${isOverdue
                        ? "border-red-500/30 bg-red-500/3 hover:border-red-500/40"
                        : isPaid
                          ? "border-border/20 hover:border-border/40"
                          : "border-border/30 hover:border-border/50"
                      }
                    `}
                    data-testid={`row-payment-${payment.id}`}
                  >
                    {isOverdue && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-red-500" />
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${isOverdue ? "from-red-500/15 to-red-500/5" : isPaid ? "from-emerald-500/15 to-emerald-500/5" : "from-amber-500/15 to-amber-500/5"} flex items-center justify-center ring-1 ${isOverdue ? "ring-red-500/15" : isPaid ? "ring-emerald-500/15" : "ring-amber-500/15"} shrink-0`}>
                        <StatusIcon className={`h-5 w-5 ${isOverdue ? "text-red-500" : isPaid ? "text-emerald-500" : "text-amber-500"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold" data-testid={`text-client-${payment.id}`}>
                            {clientName}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusCfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/60">
                          {payment.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Venc: {formatDate(payment.dueDate)}
                            </span>
                          )}
                          {payment.paidDate && (
                            <span className="flex items-center gap-1">
                              <CircleCheck className="h-3 w-3 text-emerald-500/60" />
                              Pago: {formatDate(payment.paidDate)}
                            </span>
                          )}
                          {payment.paymentMethod && (
                            <span className="flex items-center gap-1" data-testid={`text-method-${payment.id}`}>
                              <Wallet className="h-3 w-3" />
                              {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {isOverdue && payment.dueDate && (
                          <Badge variant="destructive" className="text-[10px] font-mono h-5 px-2">
                            {formatRelativeDate(payment.dueDate)}
                          </Badge>
                        )}
                        {payment.status === "pending" && payment.dueDate && (
                          <span className="text-[10px] font-mono text-muted-foreground/50">
                            {formatRelativeDate(payment.dueDate)}
                          </span>
                        )}

                        <span className={`text-lg font-bold font-mono ${isOverdue ? "text-red-500" : isPaid ? "text-emerald-600 dark:text-emerald-400" : ""}`} data-testid={`text-amount-${payment.id}`}>
                          {formatCurrency(payment.amount)}
                        </span>

                        <div className="flex items-center gap-1">
                          {(payment.status === "pending" || payment.status === "overdue") && (
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                                    onClick={() => markPaidMutation.mutate(payment.id)}
                                    disabled={markPaidMutation.isPending}
                                    data-testid={`button-mark-paid-${payment.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Marcar como pago</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${payment.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => openEdit(payment)}
                                className="gap-2"
                                data-testid={`button-edit-${payment.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDelete(payment)}
                                className="gap-2 text-destructive focus:text-destructive"
                                data-testid={`button-delete-${payment.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {overduePayments.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-card/50 overflow-hidden" data-testid="card-inadimplencia">
            <div className="px-6 py-4 border-b border-red-500/15 bg-gradient-to-r from-red-500/8 via-red-500/3 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center ring-1 ring-red-500/15">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Inadimplência</h3>
                    <p className="text-xs text-muted-foreground/60">Pagamentos em atraso por cliente</p>
                  </div>
                </div>
                <Badge variant="destructive" className="font-mono">{overduePayments.length} em atraso</Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-red-500/15 bg-red-500/3 p-4">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60">Valor Total em Atraso</p>
                  <p className="text-2xl font-bold font-mono text-red-500 mt-1" data-testid="text-total-overdue">
                    {formatCurrency(totalOverdue)}
                  </p>
                </div>
                <div className="rounded-xl border border-red-500/15 bg-red-500/3 p-4">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60">Quantidade em Atraso</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold font-mono text-red-500" data-testid="text-count-overdue">
                      {overduePayments.length}
                    </p>
                    <span className="text-xs text-muted-foreground/50">pagamento{overduePayments.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              {overdueRanking.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-red-500/60" />
                    <h4 className="text-sm font-semibold">Ranking por Valor em Atraso</h4>
                  </div>
                  <div className="flex flex-col gap-2" data-testid="table-overdue-ranking">
                    {overdueRanking.map((item, idx) => {
                      const maxAmount = overdueRanking[0]?.amount || 1;
                      const percentage = (item.amount / maxAmount) * 100;
                      return (
                        <div
                          key={item.clientId}
                          className="relative rounded-xl border border-border/20 bg-card/30 p-4 overflow-hidden"
                          data-testid={`row-ranking-${idx}`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-red-500/5 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-500/70">
                                {idx + 1}
                              </span>
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold font-mono text-red-500">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-payment">
          <DialogHeader>
            <DialogTitle>Excluir Pagamento?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o pagamento de{" "}
            <strong>{formatCurrency(deletingPayment?.amount)}</strong> do cliente{" "}
            <strong>{clientMap[deletingPayment?.clientId || ""] || "—"}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" data-testid="button-cancel-delete">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deletingPayment && deleteMutation.mutate(deletingPayment.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-payment-form">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Editar Pagamento" : "Novo Pagamento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contract">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts.map((ct) => (
                            <SelectItem key={ct.id} value={ct.id}>
                              {clientMap[ct.clientId || ""] || "N/A"} - {ct.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" data-testid="input-amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="overdue">Em Atraso</SelectItem>
                          <SelectItem value="negotiating">Negociando</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-due-date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Pagamento</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-paid-date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="bank_transfer">Transferência</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isMutating} data-testid="button-submit">
                  {isMutating ? "Salvando..." : editingPayment ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
