import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Pencil, Trash2, Users, Building2, UserCheck, UserX } from "lucide-react";
import { insertClientSchema, type Client, type InsertClient, type ClientType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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

function getTypeBadgeStyle(type: string, clientTypes: ClientType[]) {
  const ct = clientTypes.find((t) => t.key === type);
  if (ct) {
    return { backgroundColor: `${ct.color}20`, color: ct.color, border: `1px solid ${ct.color}40` };
  }
  return {};
}

const defaultValues: InsertClient = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  type: "acelera",
  status: "active",
  notes: "",
};

export default function ClientsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientTypes = [] } = useQuery<ClientType[]>({
    queryKey: ["/api/client-types"],
  });

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertClient) => apiRequest("POST", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente criado com sucesso" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar cliente", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertClient & { id: string }) =>
      apiRequest("PUT", `/api/clients/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente atualizado com sucesso" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar cliente", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente excluido com sucesso" });
      setDeletingClient(null);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir cliente", description: err.message, variant: "destructive" });
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingClient(null);
    form.reset(defaultValues);
  }

  function openCreate() {
    form.reset(defaultValues);
    setEditingClient(null);
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    form.reset({
      name: client.name,
      cnpj: client.cnpj ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      type: client.type,
      status: client.status,
      notes: client.notes ?? "",
    });
    setDialogOpen(true);
  }

  function onSubmit(values: InsertClient) {
    if (editingClient) {
      updateMutation.mutate({ ...values, id: editingClient.id });
    } else {
      createMutation.mutate(values);
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.cnpj && c.cnpj.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const inactiveClients = clients.filter((c) => c.status !== "active").length;
  const typeBreakdown = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0];

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-clients">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">Gerencie sua base de clientes e parceiros</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-client">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-row">
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(217 91% 52%)" } as React.CSSProperties} data-testid="kpi-total">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold" data-testid="text-kpi-total">{totalClients}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(142 76% 45%)" } as React.CSSProperties} data-testid="kpi-active">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold" data-testid="text-kpi-active">{activeClients}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(0 84% 50%)" } as React.CSSProperties} data-testid="kpi-inactive">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-red-500/10">
              <UserX className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Inativos</p>
              <p className="text-2xl font-bold" data-testid="text-kpi-inactive">{inactiveClients}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card p-4" style={{ "--kpi-accent": "hsl(280 87% 55%)" } as React.CSSProperties} data-testid="kpi-top-type">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500/10">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Tipo Principal</p>
              <p className="text-2xl font-bold capitalize" data-testid="text-kpi-top-type">{topType ? (clientTypes.find((t) => t.key === topType[0])?.label || topType[0]) : "---"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/60 dark:bg-[hsl(222_30%_8%_/_0.6)] backdrop-blur-sm border-border/50"
          data-testid="input-search-clients"
        />
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4" data-testid="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground" data-testid="text-empty-state">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <Table data-testid="table-clients">
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Nome</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">CNPJ</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Email</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client, index) => (
                <TableRow
                  key={client.id}
                  className={`border-b border-border/30 transition-all duration-300 ${index % 2 === 1 ? "bg-muted/20 dark:bg-[hsl(222_30%_10%_/_0.3)]" : ""}`}
                  data-testid={`row-client-${client.id}`}
                >
                  <TableCell className="font-medium" data-testid={`text-name-${client.id}`}>
                    {client.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm" data-testid={`text-cnpj-${client.id}`}>
                    {client.cnpj || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      style={getTypeBadgeStyle(client.type, clientTypes)}
                      data-testid={`badge-type-${client.id}`}
                    >
                      {clientTypes.find((t) => t.key === client.type)?.label || client.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-email-${client.id}`}>
                    {client.email || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-phone-${client.id}`}>
                    {client.phone || "-"}
                  </TableCell>
                  <TableCell data-testid={`text-status-${client.id}`}>
                    <span className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${client.status === "active" ? "bg-green-500 glow-dot text-green-500" : "bg-gray-500 glow-dot text-gray-500"}`} />
                      <span className={client.status === "active" ? "text-green-400" : "text-muted-foreground"}>
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(client)}
                        data-testid={`button-edit-${client.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingClient(client)}
                        data-testid={`button-delete-${client.id}`}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-client-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? "Atualize os dados do cliente." : "Preencha os dados do novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-cnpj" />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="email" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {clientTypes.filter((t) => t.active).map((t) => (
                            <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-status" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereco</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="input-address" />
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
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isMutating} data-testid="button-submit">
                  {isMutating ? "Salvando..." : editingClient ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingClient} onOpenChange={(open) => { if (!open) setDeletingClient(null); }}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{deletingClient?.name}"? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClient && deleteMutation.mutate(deletingClient.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
