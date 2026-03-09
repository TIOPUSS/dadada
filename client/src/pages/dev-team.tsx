import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Pencil, Trash2, Users, Search, Github, Linkedin, Globe,
  Mail, Phone, GraduationCap, Award, Briefcase, Code2, Clock
} from "lucide-react";
import { insertDeveloperSchema, type Developer, type InsertDeveloper } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  junior: { label: "Junior", color: "bg-green-500/20 text-green-400 dark:text-green-300" },
  mid: { label: "Pleno", color: "bg-blue-500/20 text-blue-400 dark:text-blue-300" },
  senior: { label: "Senior", color: "bg-purple-500/20 text-purple-400 dark:text-purple-300" },
  lead: { label: "Lead", color: "bg-amber-500/20 text-amber-400 dark:text-amber-300" },
};

const STATUS_CONFIG: Record<string, { label: string; dotColor: string }> = {
  active: { label: "Ativo", dotColor: "#22c55e" },
  inactive: { label: "Inativo", dotColor: "#ef4444" },
};

const AVATAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#f59e0b",
  "#22c55e", "#10b981", "#06b6d4", "#6366f1", "#e11d48",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const clean = name.replace(/\(.*\)/, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "").toUpperCase();
}

const formSchema = insertDeveloperSchema.extend({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  skillsInput: z.string().optional(),
  languagesInput: z.string().optional(),
  certificationsInput: z.string().optional(),
  specializationsInput: z.string().optional(),
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
  linkedinUrl: "",
  portfolioUrl: "",
  bio: "",
  languages: [],
  certifications: [],
  education: "",
  experienceYears: 0,
  availability: "",
  specializations: [],
  skillsInput: "",
  languagesInput: "",
  certificationsInput: "",
  specializationsInput: "",
};

export default function DevTeam() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [deletingDev, setDeletingDev] = useState<Developer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const { data: developers = [], isLoading } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
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
      linkedinUrl: dev.linkedinUrl ?? "",
      portfolioUrl: dev.portfolioUrl ?? "",
      bio: dev.bio ?? "",
      languages: dev.languages ?? [],
      certifications: dev.certifications ?? [],
      education: dev.education ?? "",
      experienceYears: dev.experienceYears ?? 0,
      availability: dev.availability ?? "",
      specializations: dev.specializations ?? [],
      skillsInput: (dev.skills ?? []).join(", "),
      languagesInput: (dev.languages ?? []).join(", "),
      certificationsInput: (dev.certifications ?? []).join(", "),
      specializationsInput: (dev.specializations ?? []).join(", "),
    });
    setDialogOpen(true);
  }

  function parseCommaSeparated(val: string | undefined): string[] {
    if (!val) return [];
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }

  function onSubmit(values: FormValues) {
    const { skillsInput, languagesInput, certificationsInput, specializationsInput, ...rest } = values;
    const payload: InsertDeveloper = {
      ...rest,
      skills: parseCommaSeparated(skillsInput),
      languages: parseCommaSeparated(languagesInput),
      certifications: parseCommaSeparated(certificationsInput),
      specializations: parseCommaSeparated(specializationsInput),
    };

    if (editingDev) {
      updateMutation.mutate({ ...payload, id: editingDev.id });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredDevs = useMemo(() => {
    return developers.filter((dev) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = dev.name.toLowerCase().includes(q);
        const skillMatch = (dev.skills ?? []).some((s) => s.toLowerCase().includes(q));
        const roleMatch = (dev.role ?? "").toLowerCase().includes(q);
        if (!nameMatch && !skillMatch && !roleMatch) return false;
      }
      if (levelFilter !== "todos" && dev.level !== levelFilter) return false;
      if (statusFilter !== "todos" && dev.status !== statusFilter) return false;
      return true;
    });
  }, [developers, searchQuery, levelFilter, statusFilter]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-dev-team">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Desenvolvedores
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
            Perfis e competências da equipe de desenvolvimento
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-developer">
          <Plus className="mr-1 h-4 w-4" />
          Novo Desenvolvedor
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, skill ou cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-level-filter">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Níveis</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="mid">Pleno</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground" data-testid="text-dev-count">
          {filteredDevs.length} desenvolvedor{filteredDevs.length !== 1 ? "es" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="loading-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDevs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold text-foreground" data-testid="text-empty-state">
              Nenhum desenvolvedor encontrado
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || levelFilter !== "todos" || statusFilter !== "todos"
                ? "Tente ajustar os filtros de busca"
                : "Clique em \"Novo Desenvolvedor\" para adicionar"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="grid-dev-cards">
          {filteredDevs.map((dev) => {
            const avatarColor = getAvatarColor(dev.name);
            const levelCfg = LEVEL_CONFIG[dev.level] ?? LEVEL_CONFIG.mid;
            const statusCfg = STATUS_CONFIG[dev.status] ?? STATUS_CONFIG.active;

            return (
              <Card key={dev.id} className="hover-elevate overflow-visible" data-testid={`card-developer-${dev.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                        style={{ background: avatarColor, boxShadow: `0 0 16px ${avatarColor}30` }}
                        data-testid={`avatar-${dev.id}`}
                      >
                        {getInitials(dev.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-base leading-tight truncate" data-testid={`text-name-${dev.id}`}>
                          {dev.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate" data-testid={`text-role-${dev.id}`}>
                          {dev.role || "Desenvolvedor"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: statusCfg.dotColor }}
                        data-testid={`status-dot-${dev.id}`}
                      />
                      <Badge variant="secondary" className={`${levelCfg.color} border-0 text-[11px]`} data-testid={`badge-level-${dev.id}`}>
                        {levelCfg.label}
                      </Badge>
                    </div>
                  </div>

                  {dev.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-bio-${dev.id}`}>
                      {dev.bio}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    {dev.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-email-${dev.id}`}>
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{dev.email}</span>
                      </div>
                    )}
                    {dev.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-phone-${dev.id}`}>
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{dev.phone}</span>
                      </div>
                    )}
                    {dev.experienceYears != null && dev.experienceYears > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-experience-${dev.id}`}>
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{dev.experienceYears} ano{dev.experienceYears !== 1 ? "s" : ""} de experiência</span>
                      </div>
                    )}
                    {dev.education && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-education-${dev.id}`}>
                        <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{dev.education}</span>
                      </div>
                    )}
                    {dev.availability && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-availability-${dev.id}`}>
                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{dev.availability}</span>
                      </div>
                    )}
                  </div>

                  {(dev.skills ?? []).length > 0 && (
                    <div className="mb-3" data-testid={`skills-${dev.id}`}>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {(dev.skills ?? []).slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]" data-testid={`badge-skill-${dev.id}-${i}`}>
                            {skill}
                          </Badge>
                        ))}
                        {(dev.skills ?? []).length > 6 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{(dev.skills ?? []).length - 6}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {(dev.languages ?? []).length > 0 && (
                    <div className="mb-3" data-testid={`languages-${dev.id}`}>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Linguagens</p>
                      <div className="flex flex-wrap gap-1">
                        {(dev.languages ?? []).map((lang, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]" data-testid={`badge-lang-${dev.id}-${i}`}>
                            <Code2 className="h-2.5 w-2.5 mr-0.5" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(dev.certifications ?? []).length > 0 && (
                    <div className="mb-3" data-testid={`certifications-${dev.id}`}>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Certificações</p>
                      <div className="flex flex-wrap gap-1">
                        {(dev.certifications ?? []).map((cert, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]" data-testid={`badge-cert-${dev.id}-${i}`}>
                            <Award className="h-2.5 w-2.5 mr-0.5" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(dev.specializations ?? []).length > 0 && (
                    <div className="mb-3" data-testid={`specializations-${dev.id}`}>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Especializações</p>
                      <div className="flex flex-wrap gap-1">
                        {(dev.specializations ?? []).map((spec, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]" data-testid={`badge-spec-${dev.id}-${i}`}>
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(dev.monthlyRate || dev.contractType) && (
                    <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground" data-testid={`financial-${dev.id}`}>
                      {dev.monthlyRate && (
                        <span className="font-mono font-semibold text-foreground">
                          R$ {Number(dev.monthlyRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {dev.contractType && (
                        <span className="text-xs">{dev.contractType}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1 flex-wrap">
                      {dev.githubUrl && (
                        <a href={dev.githubUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-github-${dev.id}`}>
                          <Button size="icon" variant="ghost">
                            <Github className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {dev.linkedinUrl && (
                        <a href={dev.linkedinUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-linkedin-${dev.id}`}>
                          <Button size="icon" variant="ghost">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {dev.portfolioUrl && (
                        <a href={dev.portfolioUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-portfolio-${dev.id}`}>
                          <Button size="icon" variant="ghost">
                            <Globe className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(dev)} data-testid={`button-edit-${dev.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeletingDev(dev)} data-testid={`button-delete-${dev.id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh]" data-testid="dialog-developer-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingDev ? "Editar Desenvolvedor" : "Novo Desenvolvedor"}
            </DialogTitle>
            <DialogDescription>
              {editingDev ? "Atualize as informações do desenvolvedor" : "Preencha os dados do novo desenvolvedor"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="dev-form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} data-testid="input-name" />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" type="email" {...field} data-testid="input-email" />
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
                          <Input placeholder="(00) 00000-0000" {...field} value={field.value ?? ""} data-testid="input-phone" />
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
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Full Stack Developer" {...field} value={field.value ?? ""} data-testid="input-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? "mid"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-level">
                              <SelectValue placeholder="Selecione o nível" />
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? "active"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Selecione o status" />
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
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Breve descrição profissional..." {...field} value={field.value ?? ""} data-testid="input-bio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input placeholder="React, TypeScript, Node.js..." {...field} value={field.value ?? ""} data-testid="input-skills" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languagesInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linguagens de Programação (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input placeholder="JavaScript, Python, Go..." {...field} value={field.value ?? ""} data-testid="input-languages" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specializationsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especializações (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input placeholder="Frontend, Backend, DevOps..." {...field} value={field.value ?? ""} data-testid="input-specializations" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificationsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificações (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input placeholder="AWS Solutions Architect, PMP..." {...field} value={field.value ?? ""} data-testid="input-certifications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formação</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciência da Computação - USP" {...field} value={field.value ?? ""} data-testid="input-education" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anos de Experiência</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            data-testid="input-experience-years"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="5000.00" {...field} value={field.value ?? ""} data-testid="input-monthly-rate" />
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
                        <FormLabel>Tipo de Contrato</FormLabel>
                        <FormControl>
                          <Input placeholder="CLT, PJ, Freelancer..." {...field} value={field.value ?? ""} data-testid="input-contract-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Full-time, Part-time, Freelancer..." {...field} value={field.value ?? ""} data-testid="input-availability" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/..." {...field} value={field.value ?? ""} data-testid="input-github" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ""} data-testid="input-linkedin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value ?? ""} data-testid="input-portfolio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" form="dev-form" disabled={isMutating} data-testid="button-submit">
              {isMutating ? "Salvando..." : editingDev ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDev} onOpenChange={(open) => { if (!open) setDeletingDev(null); }}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Desenvolvedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingDev?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
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
