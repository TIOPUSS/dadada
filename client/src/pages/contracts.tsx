import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contract, Client, App } from "@shared/schema";
import { insertContractSchema } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, AlertTriangle, FileText } from "lucide-react";

const formSchema = insertContractSchema.extend({
  value: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const statusDotColors: Record<string, string> = {
  active: "bg-green-500",
  renewing: "bg-amber-500",
  expired: "bg-red-500",
  cancelled: "bg-gray-400",
  suspended: "bg-orange-500",
};

const statusGlowColors: Record<string, string> = {
  active: "text-green-500",
  renewing: "text-amber-500",
  expired: "text-red-500",
  cancelled: "text-gray-400",
  suspended: "text-orange-500",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  renewing: "Renovando",
  expired: "Expirado",
  cancelled: "Cancelado",
  suspended: "Suspenso",
};

const typeLabels: Record<string, string> = {
  monthly: "Mensal",
  per_seat: "Por Assento",
  revenue_share: "Revenue Share",
  milestone: "Milestone",
  setup_monthly: "Setup + Mensal",
  free: "Gratuito",
};

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

function toInputDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export default function ContractsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: apps = [] } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: null,
      appId: null,
      type: "monthly",
      status: "active",
      value: "",
      startDate: "",
      endDate: "",
      autoRenew: true,
      paymentDay: null,
      notes: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/contracts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contrato criado com sucesso" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar contrato", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/contracts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contrato atualizado com sucesso" });
      setDialogOpen(false);
      setEditingContract(null);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar contrato", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contrato excluido com sucesso" });
      setDeleteDialogOpen(false);
      setDeletingContract(null);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir contrato", description: err.message, variant: "destructive" });
    },
  });

  function openCreate() {
    setEditingContract(null);
    form.reset({
      clientId: null,
      appId: null,
      type: "monthly",
      status: "active",
      value: "",
      startDate: "",
      endDate: "",
      autoRenew: true,
      paymentDay: null,
      notes: null,
    });
    setDialogOpen(true);
  }

  function openEdit(contract: Contract) {
    setEditingContract(contract);
    form.reset({
      clientId: contract.clientId,
      appId: contract.appId,
      type: contract.type,
      status: contract.status,
      value: contract.value ?? "",
      startDate: toInputDate(contract.startDate),
      endDate: toInputDate(contract.endDate),
      autoRenew: contract.autoRenew ?? true,
      paymentDay: contract.paymentDay,
      notes: contract.notes,
    });
    setDialogOpen(true);
  }

  function openDelete(contract: Contract) {
    setDeletingContract(contract);
    setDeleteDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      ...values,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      value: values.value || null,
    };

    if (editingContract) {
      updateMutation.mutate({ id: editingContract.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));
  const appMap = new Map(apps.map((a) => [a.id, a.name]));

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingRenewals = contracts.filter((c) => {
    if (!c.endDate || c.status === "expired" || c.status === "cancelled") return false;
    const end = new Date(c.endDate);
    return end >= now && end <= thirtyDaysFromNow;
  });

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "renewing") return c.status === "renewing" || upcomingRenewals.some((r) => r.id === c.id);
    if (activeTab === "expired") return c.status === "expired";
    return true;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6" data-testid="page-contracts">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            Contratos
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">Gestao de contratos e renovacoes</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-contract">
          <Plus className="mr-2 h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      {upcomingRenewals.length > 0 && (
        <div className="glass-card p-5" style={{ "--kpi-accent": "hsl(43 96% 56%)" } as React.CSSProperties} data-testid="card-upcoming-renewals">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-amber-500/15">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
              </div>
              <span className="text-base font-semibold">Contratos Vencendo em 30 dias</span>
            </div>
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-300 border-amber-500/30" data-testid="badge-renewal-count">{upcomingRenewals.length}</Badge>
          </div>
          <div className="space-y-2.5">
            {upcomingRenewals.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 flex-wrap text-sm glass-inset px-4 py-2.5"
                data-testid={`renewal-item-${c.id}`}
              >
                <span className="font-medium">{clientMap.get(c.clientId ?? "") ?? "N/A"} - {appMap.get(c.appId ?? "") ?? "N/A"}</span>
                <span className="text-amber-400/80 text-xs font-mono">Vence em {formatDate(c.endDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-contracts">
        <TabsList className="glass-inset">
          <TabsTrigger value="all" data-testid="tab-all">Todos</TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">Ativos</TabsTrigger>
          <TabsTrigger value="renewing" data-testid="tab-renewing">Vencendo</TabsTrigger>
          <TabsTrigger value="expired" data-testid="tab-expired">Expirados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="glass-card overflow-hidden">
            {contractsLoading ? (
              <div className="p-6 space-y-3" data-testid="skeleton-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table data-testid="table-contracts">
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/20">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">App</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Inicio</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Fim</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Auto-Renov.</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Nenhum contrato encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract, idx) => (
                      <TableRow key={contract.id} className={`border-b border-border/30 transition-colors duration-200 ${idx % 2 === 1 ? "bg-muted/5" : ""}`} data-testid={`row-contract-${contract.id}`}>
                        <TableCell className="font-medium" data-testid={`text-client-${contract.id}`}>
                          {clientMap.get(contract.clientId ?? "") ?? "N/A"}
                        </TableCell>
                        <TableCell data-testid={`text-app-${contract.id}`}>
                          {appMap.get(contract.appId ?? "") ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono" data-testid={`badge-type-${contract.id}`}>
                            {typeLabels[contract.type] ?? contract.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm" data-testid={`text-value-${contract.id}`}>
                          {formatCurrency(contract.value)}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5" data-testid={`badge-status-${contract.id}`}>
                            <span className={`inline-block h-2 w-2 rounded-full ${statusDotColors[contract.status] ?? "bg-gray-400"} ${statusGlowColors[contract.status] ? "glow-dot " + statusGlowColors[contract.status] : ""}`} />
                            <span className="text-sm">{statusLabels[contract.status] ?? contract.status}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-start-${contract.id}`}>
                          {formatDate(contract.startDate)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-end-${contract.id}`}>
                          {formatDate(contract.endDate)}
                        </TableCell>
                        <TableCell data-testid={`text-autorenew-${contract.id}`}>
                          <span className={`text-xs font-medium ${contract.autoRenew ? "text-green-400" : "text-muted-foreground"}`}>
                            {contract.autoRenew ? "Sim" : "Nao"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(contract)}
                              data-testid={`button-edit-${contract.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openDelete(contract)}
                              data-testid={`button-delete-${contract.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-contract">
          <DialogHeader>
            <DialogTitle>Excluir Contrato?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o contrato de{" "}
            <strong>{clientMap.get(deletingContract?.clientId ?? "") ?? "N/A"}</strong> -{" "}
            <strong>{appMap.get(deletingContract?.appId ?? "") ?? "N/A"}</strong>?
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
              onClick={() => deletingContract && deleteMutation.mutate(deletingContract.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-contract-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingContract ? "Editar Contrato" : "Novo Contrato"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id} data-testid={`option-client-${c.id}`}>
                            {c.name}
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
                name="appId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-app">
                          <SelectValue placeholder="Selecione um app" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {apps.map((a) => (
                          <SelectItem key={a.id} value={a.id} data-testid={`option-app-${a.id}`}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="per_seat">Por Assento</SelectItem>
                          <SelectItem value="revenue_share">Revenue Share</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="setup_monthly">Setup + Mensal</SelectItem>
                          <SelectItem value="free">Gratuito</SelectItem>
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
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="renewing">Renovando</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="suspended">Suspenso</SelectItem>
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
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          data-testid="input-value"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia Pagamento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="1-31"
                          data-testid="input-payment-day"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-start-date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-end-date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel className="mt-0">Auto-Renovar</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                        data-testid="switch-auto-renew"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observacoes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-notes"
                      />
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
                <Button type="submit" disabled={isPending} data-testid="button-submit">
                  {isPending ? "Salvando..." : editingContract ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
