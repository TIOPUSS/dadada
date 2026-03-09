import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Proposal, Lead, Client } from "@shared/schema";
import { insertProposalSchema } from "@shared/schema";
import { Plus, Pencil, Trash2, FileSignature, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STATUS_OPTIONS = ["draft", "sent", "accepted", "rejected", "expired"] as const;

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  accepted: "Aceita",
  rejected: "Rejeitada",
  expired: "Expirada",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  draft: "bg-gray-400",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-amber-500",
};

const STATUS_GLOW_COLORS: Record<string, string> = {
  draft: "text-gray-400",
  sent: "text-blue-500",
  accepted: "text-green-500",
  rejected: "text-red-500",
  expired: "text-amber-500",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  projeto: "Projeto",
  sistema: "Sistema",
  bpo: "BPO",
};

const SERVICE_TYPE_BADGE_CLASSES: Record<string, string> = {
  projeto: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  sistema: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  bpo: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const PRICING_MODEL_LABELS: Record<string, string> = {
  fixed: "Fixo",
  per_user: "Por Usuario",
  fixed_plus_user: "Fixo + Usuario",
};

interface CostItem {
  desc: string;
  qty: number;
  unit: string;
}

const formSchema = insertProposalSchema.extend({
  title: z.string().min(1, "Titulo obrigatorio"),
  value: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
  monthlyFee: z.string().optional().nullable(),
  implantationFee: z.string().optional().nullable(),
  pricingModel: z.string().optional().nullable(),
  pricePerUser: z.string().optional().nullable(),
  estimatedUsers: z.coerce.number().optional().nullable(),
  installments: z.coerce.number().optional().nullable(),
  teamSize: z.coerce.number().optional().nullable(),
  costItems: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

function formatBRL(value: string | null | undefined): string {
  if (!value) return "---";
  const num = parseFloat(value);
  if (isNaN(num)) return "---";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "---";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "---";
  return d.toLocaleDateString("pt-BR");
}

const emptyDefaults: FormValues = {
  title: "",
  leadId: null,
  clientId: null,
  status: "draft",
  value: "",
  validUntil: "",
  description: "",
  items: "",
  serviceType: null,
  monthlyFee: "",
  implantationFee: "",
  pricingModel: null,
  pricePerUser: "",
  estimatedUsers: null,
  installments: null,
  teamSize: null,
  costItems: null,
};

export default function ProposalsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [costItemsList, setCostItemsList] = useState<CostItem[]>([]);

  const { data: proposals, isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyDefaults,
  });

  const watchServiceType = form.watch("serviceType");

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/proposals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      setDialogOpen(false);
      form.reset();
      setCostItemsList([]);
      toast({ title: "Proposta criada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar proposta", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/proposals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      setDialogOpen(false);
      setEditingProposal(null);
      form.reset();
      setCostItemsList([]);
      toast({ title: "Proposta atualizada com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar proposta", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/proposals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposta excluida com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir proposta", description: error.message, variant: "destructive" });
    },
  });

  function openCreateDialog() {
    setEditingProposal(null);
    form.reset({ ...emptyDefaults });
    setCostItemsList([]);
    setDialogOpen(true);
  }

  function openEditDialog(proposal: Proposal) {
    setEditingProposal(proposal);
    const validDate = proposal.validUntil
      ? new Date(proposal.validUntil).toISOString().split("T")[0]
      : "";

    let parsedCostItems: CostItem[] = [];
    if (proposal.costItems) {
      try {
        parsedCostItems = JSON.parse(proposal.costItems);
      } catch {
        parsedCostItems = [];
      }
    }
    setCostItemsList(parsedCostItems);

    form.reset({
      title: proposal.title,
      leadId: proposal.leadId || null,
      clientId: proposal.clientId || null,
      status: proposal.status,
      value: proposal.value || "",
      validUntil: validDate,
      description: proposal.description || "",
      items: proposal.items || "",
      serviceType: proposal.serviceType || null,
      monthlyFee: proposal.monthlyFee || "",
      implantationFee: proposal.implantationFee || "",
      pricingModel: proposal.pricingModel || null,
      pricePerUser: proposal.pricePerUser || "",
      estimatedUsers: proposal.estimatedUsers || null,
      installments: proposal.installments || null,
      teamSize: proposal.teamSize || null,
      costItems: proposal.costItems || null,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const serializedCostItems = values.serviceType === "bpo" && costItemsList.length > 0
      ? JSON.stringify(costItemsList)
      : null;

    const payload = {
      ...values,
      value: values.value || null,
      validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : null,
      leadId: values.leadId === "none" ? null : values.leadId || null,
      clientId: values.clientId === "none" ? null : values.clientId || null,
      description: values.description || null,
      items: values.items || null,
      serviceType: values.serviceType === "none" ? null : values.serviceType || null,
      monthlyFee: values.monthlyFee || null,
      implantationFee: values.implantationFee || null,
      pricingModel: values.pricingModel === "none" ? null : values.pricingModel || null,
      pricePerUser: values.pricePerUser || null,
      estimatedUsers: values.estimatedUsers || null,
      installments: values.installments || null,
      teamSize: values.teamSize || null,
      costItems: serializedCostItems,
    };
    if (editingProposal) {
      updateMutation.mutate({ id: editingProposal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const getLeadName = (leadId: string | null) => {
    if (!leadId || !leads) return "---";
    return leads.find((l) => l.id === leadId)?.name || "---";
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId || !clients) return "---";
    return clients.find((c) => c.id === clientId)?.name || "---";
  };

  const filteredProposals = proposals?.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "drafts") return p.status === "draft";
    if (activeTab === "sent") return p.status === "sent";
    if (activeTab === "accepted") return p.status === "accepted";
    return true;
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  function addCostItem() {
    setCostItemsList([...costItemsList, { desc: "", qty: 1, unit: "" }]);
  }

  function removeCostItem(index: number) {
    setCostItemsList(costItemsList.filter((_, i) => i !== index));
  }

  function updateCostItem(index: number, field: keyof CostItem, value: string | number) {
    const updated = [...costItemsList];
    if (field === "qty") {
      updated[index] = { ...updated[index], qty: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCostItemsList(updated);
  }

  const costItemsTotal = costItemsList.reduce((sum, item) => {
    const unitVal = parseFloat(item.unit) || 0;
    return sum + item.qty * unitVal;
  }, 0);

  function getProposalDisplayValue(proposal: Proposal): string {
    if (proposal.serviceType === "sistema" && proposal.monthlyFee) {
      return formatBRL(proposal.monthlyFee);
    }
    if (proposal.serviceType === "bpo" && proposal.monthlyFee) {
      return formatBRL(proposal.monthlyFee);
    }
    return formatBRL(proposal.value);
  }

  function getProposalValueSuffix(proposal: Proposal): string | null {
    if (proposal.serviceType === "sistema") {
      return "/mes";
    }
    if (proposal.serviceType === "bpo") {
      return "/mes";
    }
    if (proposal.serviceType === "projeto" && proposal.installments && proposal.installments > 1) {
      return `${proposal.installments}x parcelas`;
    }
    return null;
  }

  function getProposalSecondaryInfo(proposal: Proposal): string | null {
    if (proposal.serviceType === "projeto" && proposal.installments && proposal.installments > 1) {
      return `${proposal.installments}x parcelas`;
    }
    if (proposal.serviceType === "sistema" && proposal.implantationFee) {
      return `Impl: ${formatBRL(proposal.implantationFee)}`;
    }
    if (proposal.serviceType === "bpo" && proposal.teamSize) {
      return `${proposal.teamSize} pessoas`;
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-proposals">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5">
              <FileSignature className="h-5 w-5 text-indigo-400" />
            </div>
            Propostas
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">Gerencie propostas comerciais e acompanhe status</p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-new-proposal">
          <Plus className="mr-2 h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-proposals">
        <TabsList className="glass-inset">
          <TabsTrigger value="all" data-testid="tab-all">Todas</TabsTrigger>
          <TabsTrigger value="drafts" data-testid="tab-drafts">Rascunhos</TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">Enviadas</TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">Aceitas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="glass-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4" data-testid="loading-skeleton">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !filteredProposals || filteredProposals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground" data-testid="text-empty-state">
                Nenhuma proposta encontrada.
              </div>
            ) : (
              <Table data-testid="table-proposals">
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/20">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Titulo</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Cliente/Lead</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Valor (R$)</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Validade</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal, idx) => (
                    <TableRow key={proposal.id} className={`border-b border-border/30 transition-colors duration-200 ${idx % 2 === 1 ? "bg-muted/5" : ""}`} data-testid={`row-proposal-${proposal.id}`}>
                      <TableCell className="font-medium" data-testid={`text-title-${proposal.id}`}>
                        {proposal.title}
                      </TableCell>
                      <TableCell data-testid={`text-type-${proposal.id}`}>
                        {proposal.serviceType ? (
                          <Badge variant="outline" className={SERVICE_TYPE_BADGE_CLASSES[proposal.serviceType] || ""}>
                            {SERVICE_TYPE_LABELS[proposal.serviceType] || proposal.serviceType}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">---</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-client-lead-${proposal.id}`}>
                        <div className="flex flex-col gap-0.5">
                          {proposal.clientId && (
                            <span className="text-sm">{getClientName(proposal.clientId)}</span>
                          )}
                          {proposal.leadId && (
                            <span className="text-xs text-muted-foreground">
                              Lead: {getLeadName(proposal.leadId)}
                            </span>
                          )}
                          {!proposal.clientId && !proposal.leadId && "---"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5" data-testid={`badge-status-${proposal.id}`}>
                          <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT_COLORS[proposal.status] || "bg-gray-400"} ${STATUS_GLOW_COLORS[proposal.status] ? "glow-dot " + STATUS_GLOW_COLORS[proposal.status] : ""}`} />
                          <span className="text-sm">{STATUS_LABELS[proposal.status] || proposal.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="font-mono" data-testid={`text-value-${proposal.id}`}>
                        <div className="flex flex-col gap-0.5">
                          <span>
                            {getProposalDisplayValue(proposal)}
                            {getProposalValueSuffix(proposal) && (
                              <span className="text-xs text-muted-foreground ml-1">{getProposalValueSuffix(proposal)}</span>
                            )}
                          </span>
                          {getProposalSecondaryInfo(proposal) && (
                            <span className="text-xs text-muted-foreground">{getProposalSecondaryInfo(proposal)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-valid-until-${proposal.id}`}>
                        {formatDate(proposal.validUntil)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(proposal)}
                            data-testid={`button-edit-${proposal.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(proposal.id)}
                            data-testid={`button-delete-${proposal.id}`}
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
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-proposal-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingProposal ? "Editar Proposta" : "Nova Proposta"}
            </DialogTitle>
            <DialogDescription>
              {editingProposal ? "Atualize os dados da proposta." : "Preencha os dados da nova proposta."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titulo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Servico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-serviceType">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="projeto">Projeto</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                        <SelectItem value="bpo">BPO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-leadId">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {leads?.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-clientId">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
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
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchServiceType === "projeto" ? "Valor Total (R$)" : "Valor Estimado Total (R$)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          step="0.01"
                          data-testid="input-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchServiceType === "projeto" && (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          data-testid="input-installments"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchServiceType === "sistema" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensalidade (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              step="0.01"
                              data-testid="input-monthlyFee"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="implantationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Implantacao (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              step="0.01"
                              data-testid="input-implantationFee"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="pricingModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo de Cobranca</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-pricingModel">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="fixed">Fixo</SelectItem>
                            <SelectItem value="per_user">Por Usuario</SelectItem>
                            <SelectItem value="fixed_plus_user">Fixo + Usuario</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pricePerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preco por Usuario (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              step="0.01"
                              data-testid="input-pricePerUser"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimatedUsers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuarios Estimados</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              data-testid="input-estimatedUsers"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {watchServiceType === "bpo" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mensal (R$)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              step="0.01"
                              data-testid="input-monthlyFee"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho da Equipe</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              data-testid="input-teamSize"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-3" data-testid="section-cost-items">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium">Planilha de Custos</span>
                      <Button type="button" variant="outline" size="sm" onClick={addCostItem} data-testid="button-add-cost-item">
                        <Plus className="mr-1 h-3 w-3" />
                        Adicionar Item
                      </Button>
                    </div>
                    {costItemsList.map((item, index) => (
                      <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                        <div>
                          {index === 0 && <span className="text-xs text-muted-foreground">Descricao</span>}
                          <Input
                            value={item.desc}
                            onChange={(e) => updateCostItem(index, "desc", e.target.value)}
                            placeholder="Descricao"
                            data-testid={`input-cost-desc-${index}`}
                          />
                        </div>
                        <div>
                          {index === 0 && <span className="text-xs text-muted-foreground">Qtd</span>}
                          <Input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => updateCostItem(index, "qty", e.target.value)}
                            className="w-20"
                            data-testid={`input-cost-qty-${index}`}
                          />
                        </div>
                        <div>
                          {index === 0 && <span className="text-xs text-muted-foreground">Valor Unit.</span>}
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit}
                            onChange={(e) => updateCostItem(index, "unit", e.target.value)}
                            className="w-28"
                            placeholder="0.00"
                            data-testid={`input-cost-unit-${index}`}
                          />
                        </div>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeCostItem(index)} data-testid={`button-remove-cost-${index}`}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {costItemsList.length > 0 && (
                      <div className="text-sm text-right font-medium text-muted-foreground" data-testid="text-cost-total">
                        Total: {formatBRL(costItemsTotal.toFixed(2))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={(field.value as string) ?? ""}
                        type="date"
                        data-testid="input-validUntil"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itens</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="input-items" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isMutating} data-testid="button-submit">
                  {isMutating ? "Salvando..." : editingProposal ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
