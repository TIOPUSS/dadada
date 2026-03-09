import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAppSchema } from "@shared/schema";
import type { App, Developer, Client, AppChecklist, AppNote } from "@shared/schema";
import {
  LayoutGrid,
  GripVertical,
  X,
  Save,
  ExternalLink,
  Pencil,
  Globe,
  GitBranch,
  Code2,
  User,
  Building2,
  FileText,
  Tag,
  Layers,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  StickyNote,
  ClipboardList,
  Send,
} from "lucide-react";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLUMN_ORDER = [
  "waiting",
  "backlog",
  "in_dev",
  "validation_1",
  "validation_2",
  "validation_3",
  "testing",
  "deploying",
  "staging",
  "archived",
  "paused",
] as const;

const COLUMN_LABELS: Record<string, string> = {
  waiting: "Aguardando",
  backlog: "Backlog",
  in_dev: "Em Dev",
  staging: "Melhoria",
  validation_1: "Validação 1",
  validation_2: "Validação 2",
  validation_3: "Validação 3",
  testing: "Em Teste",
  deploying: "Em Implantação",
  archived: "Concluído",
  paused: "Pausado",
};

const COLUMN_DOT_COLORS: Record<string, string> = {
  waiting: "bg-orange-400",
  backlog: "bg-slate-400",
  in_dev: "bg-blue-400",
  staging: "bg-cyan-400",
  validation_1: "bg-violet-400",
  validation_2: "bg-purple-400",
  validation_3: "bg-fuchsia-400",
  testing: "bg-teal-400",
  deploying: "bg-amber-400",
  archived: "bg-emerald-400",
  paused: "bg-red-400",
};

const COLUMN_ACCENT_COLORS: Record<string, string> = {
  waiting: "from-orange-500/60 to-orange-500/0",
  backlog: "from-slate-500/60 to-slate-500/0",
  in_dev: "from-blue-500/60 to-blue-500/0",
  staging: "from-cyan-500/60 to-cyan-500/0",
  validation_1: "from-violet-500/60 to-violet-500/0",
  validation_2: "from-purple-500/60 to-purple-500/0",
  validation_3: "from-fuchsia-500/60 to-fuchsia-500/0",
  testing: "from-teal-500/60 to-teal-500/0",
  deploying: "from-amber-500/60 to-amber-500/0",
  archived: "from-emerald-500/60 to-emerald-500/0",
  paused: "from-red-500/60 to-red-500/0",
};

const DEV_COLORS: Record<string, string> = {
  "Felipe Lacerda": "#3b82f6",
  "Lucas Marquisio": "#8b5cf6",
  "Daniel Lacerda": "#ec4899",
  "Cristhian Sidoly": "#f97316",
  "Kauan": "#f59e0b",
  "Maico Fernandes": "#22c55e",
  "Cauã (TheCorp)": "#10b981",
};

const ORIGIN_LABELS: Record<string, { label: string; color: string }> = {
  acelera: { label: "Acelera IT", color: "text-cyan-400" },
  opus: { label: "Opus", color: "text-amber-400" },
  both: { label: "Opus + Acelera", color: "text-violet-400" },
  thecorp: { label: "TheCorp", color: "text-emerald-400" },
  vittaverde: { label: "VittaVerde", color: "text-pink-400" },
};

const STATUS_TAG: Record<string, { label: string; cls: string }> = {
  waiting: { label: "AGRD", cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  backlog: { label: "BACK", cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  in_dev: { label: "DEV", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  staging: { label: "MELH", cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  validation_1: { label: "V1", cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  validation_2: { label: "V2", cls: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  validation_3: { label: "V3", cls: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
  testing: { label: "TEST", cls: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  deploying: { label: "IMPL", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  archived: { label: "CONC", cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  paused: { label: "PAUS", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
  active: { label: "ATIVO", cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  disabled: { label: "INAT", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const STATUS_TO_COLUMN: Record<string, string> = {
  waiting: "waiting",
  backlog: "backlog",
  in_dev: "in_dev",
  staging: "staging",
  validation_1: "validation_1",
  validation_2: "validation_2",
  validation_3: "validation_3",
  testing: "testing",
  deploying: "deploying",
  archived: "archived",
  paused: "paused",
  active: "archived",
  disabled: "paused",
};

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS",
  internal: "Interno",
  custom: "Custom",
  automation: "Automação",
  ai_agent: "Agente IA",
};

const TYPE_OPTIONS = ["saas", "internal", "custom", "automation", "ai_agent"];
const ORIGIN_OPTIONS = ["acelera", "opus", "both", "thecorp", "vittaverde"];
const STATUS_OPTIONS = [
  { value: "waiting", label: "Aguardando" },
  { value: "backlog", label: "Backlog" },
  { value: "in_dev", label: "Em Dev" },
  { value: "staging", label: "Melhoria" },
  { value: "validation_1", label: "Validação 1" },
  { value: "validation_2", label: "Validação 2" },
  { value: "validation_3", label: "Validação 3" },
  { value: "testing", label: "Em Teste" },
  { value: "deploying", label: "Em Implantação" },
  { value: "active", label: "Ativo" },
  { value: "archived", label: "Concluído" },
  { value: "paused", label: "Pausado" },
  { value: "disabled", label: "Desativado" },
];

function getInitials(name: string): string {
  const clean = name.replace(/\(.*\)/, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "").toUpperCase();
}

function DraggableAppCard({
  app,
  devName,
  onClick,
}: {
  app: App;
  devName: string | null;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: app.id,
      data: { app },
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
    touchAction: "none",
  };

  const devColor = devName ? (DEV_COLORS[devName] || "#6366f1") : "#6366f1";
  const origin = ORIGIN_LABELS[app.origin] || ORIGIN_LABELS["acelera"];
  const tag = STATUS_TAG[app.status] || STATUS_TAG["in_dev"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card-hover p-3 flex flex-col gap-2 select-none"
      data-testid={`card-app-${app.id}`}
      onPointerUp={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <GripVertical className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/40 shrink-0" />
          <span
            className="font-bold text-sm leading-tight text-foreground"
            data-testid={`text-app-name-${app.id}`}
          >
            {app.name}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${tag.cls}`}
          data-testid={`tag-status-${app.id}`}
        >
          {tag.label}
        </span>
      </div>

      {devName && (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white shrink-0"
            style={{ background: devColor }}
          >
            {getInitials(devName)}
          </div>
          <span
            className="text-xs text-muted-foreground truncate"
            data-testid={`text-dev-name-${app.id}`}
          >
            {devName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-medium ${origin.color}`}>
          {origin.label}
        </span>
        {app.description && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
            {app.description}
          </span>
        )}
      </div>
    </div>
  );
}

function AppCardOverlay({
  app,
  devName,
}: {
  app: App;
  devName: string | null;
}) {
  const devColor = devName ? (DEV_COLORS[devName] || "#6366f1") : "#6366f1";
  const tag = STATUS_TAG[app.status] || STATUS_TAG["in_dev"];

  return (
    <div className="glass-card-hover p-3 flex flex-col gap-2 min-w-[220px] max-w-[280px] shadow-2xl rotate-2 scale-105 ring-2 ring-primary/30">
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-sm leading-tight">{app.name}</span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${tag.cls}`}>
          {tag.label}
        </span>
      </div>
      {devName && (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white"
            style={{ background: devColor }}
          >
            {getInitials(devName)}
          </div>
          <span className="text-xs text-muted-foreground">{devName}</span>
        </div>
      )}
    </div>
  );
}

function DroppableColumn({
  status,
  apps,
  devsList,
  onAppClick,
}: {
  status: string;
  apps: App[];
  devsList: Developer[];
  onAppClick: (app: App) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });

  const getDevName = (devId: string | null) => {
    if (!devId) return null;
    return devsList.find((d) => d.id === devId)?.name ?? null;
  };

  return (
    <div
      className="min-w-[260px] max-w-[300px] flex-shrink-0 flex flex-col"
      data-testid={`column-${status}`}
    >
      <div className="glass-card relative mb-3 overflow-visible">
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-md bg-gradient-to-r ${COLUMN_ACCENT_COLORS[status]}`}
        />
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="flex items-center gap-2.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full glow-dot ${COLUMN_DOT_COLORS[status]}`}
            />
            <span
              className="font-semibold text-sm"
              data-testid={`text-column-label-${status}`}
            >
              {COLUMN_LABELS[status]}
            </span>
          </span>
          <Badge
            variant="secondary"
            className="text-xs font-mono"
            data-testid={`badge-count-${status}`}
          >
            {apps.length}
          </Badge>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 min-h-[120px] rounded-lg p-2 transition-all duration-200 ${
          isOver
            ? "bg-primary/10 ring-2 ring-primary/40 scale-[1.01]"
            : "bg-transparent"
        }`}
        data-testid={`droppable-${status}`}
      >
        {apps.map((app) => (
          <DraggableAppCard
            key={app.id}
            app={app}
            devName={getDevName(app.devResponsibleId)}
            onClick={() => onAppClick(app)}
          />
        ))}
        {apps.length === 0 && (
          <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
            isOver ? "border-primary/40 bg-primary/5" : "border-border/30"
          }`}>
            <span className="text-xs text-muted-foreground/50">
              Arraste projetos aqui
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AppManageTab({ appId }: { appId: string }) {
  const { toast } = useToast();
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newNote, setNewNote] = useState("");

  const { data: checklists = [], isLoading: loadingChecks } = useQuery<AppChecklist[]>({
    queryKey: ["/api/apps", appId, "checklists"],
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery<AppNote[]>({
    queryKey: ["/api/apps", appId, "notes"],
  });

  const addCheckMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", `/api/apps/${appId}/checklists`, { text, sortOrder: checklists.length });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "checklists"] });
      setNewCheckItem("");
    },
  });

  const toggleCheckMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiRequest("PUT", `/api/checklists/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "checklists"] });
    },
  });

  const deleteCheckMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/checklists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "checklists"] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/apps/${appId}/notes`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "notes"] });
      setNewNote("");
      toast({ title: "Nota adicionada" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "notes"] });
    },
  });

  const completedCount = checklists.filter((c) => c.completed).length;
  const totalCount = checklists.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6" data-testid="manage-tab">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Checklist
          </span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground" data-testid="text-checklist-progress">
              {completedCount}/{totalCount} ({progress}%)
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <div className="w-full bg-muted rounded-full h-1.5 mb-3">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
        )}

        {loadingChecks ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-1">
            {checklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 group rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors"
                data-testid={`checklist-item-${item.id}`}
              >
                <button
                  onClick={() => toggleCheckMutation.mutate({ id: item.id, completed: !item.completed })}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`button-toggle-check-${item.id}`}
                >
                  {item.completed ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground/60" : ""}`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => deleteCheckMutation.mutate(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                  data-testid={`button-delete-check-${item.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <Input
            value={newCheckItem}
            onChange={(e) => setNewCheckItem(e.target.value)}
            placeholder="Adicionar item..."
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCheckItem.trim()) {
                e.preventDefault();
                addCheckMutation.mutate(newCheckItem.trim());
              }
            }}
            data-testid="input-new-checklist"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={!newCheckItem.trim() || addCheckMutation.isPending}
            onClick={() => newCheckItem.trim() && addCheckMutation.mutate(newCheckItem.trim())}
            data-testid="button-add-checklist"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <StickyNote className="h-3.5 w-3.5" />
          Notas
        </span>

        <div className="flex gap-2 mb-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escreva uma nota..."
            rows={2}
            className="text-sm resize-none"
            data-testid="textarea-new-note"
          />
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 self-end"
            disabled={!newNote.trim() || addNoteMutation.isPending}
            onClick={() => newNote.trim() && addNoteMutation.mutate(newNote.trim())}
            data-testid="button-add-note"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {loadingNotes ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-4">Nenhuma nota ainda</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group glass-card p-3 rounded-lg"
                data-testid={`note-item-${note.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                  <button
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
                    data-testid={`button-delete-note-${note.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground/50 mt-1 block">
                  {new Date(note.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const editFormSchema = insertAppSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
  techStack: z.string().optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

function AppDetailDialog({
  app,
  open,
  onOpenChange,
  devsList,
  clientsList,
}: {
  app: App | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devsList: Developer[];
  clientsList: Client[];
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");

  const dev = app?.devResponsibleId
    ? devsList.find((d) => d.id === app.devResponsibleId) ?? null
    : null;

  const client = app?.clientId
    ? clientsList.find((c) => c.id === app.clientId) ?? null
    : null;

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      version: "",
      type: "saas",
      status: "active",
      origin: "acelera",
      clientId: null,
      devResponsibleId: null,
      techStack: "",
      gitRepo: "",
      controlUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    if (app && open) {
      form.reset({
        name: app.name,
        version: app.version || "",
        type: app.type,
        status: app.status,
        origin: app.origin,
        clientId: app.clientId || null,
        devResponsibleId: app.devResponsibleId || null,
        techStack: app.techStack?.join(", ") || "",
        gitRepo: app.gitRepo || "",
        controlUrl: app.controlUrl || "",
        description: app.description || "",
      });
      setActiveTab("info");
    }
  }, [app, open]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/apps/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      onOpenChange(false);
      toast({ title: "App atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  function onSubmit(values: EditFormValues) {
    if (!app) return;
    const techStackStr = values.techStack as unknown as string;
    const payload = {
      ...values,
      techStack: techStackStr ? techStackStr.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      clientId: values.clientId === "none" ? null : values.clientId || null,
      devResponsibleId: values.devResponsibleId === "none" ? null : values.devResponsibleId || null,
    };
    updateMutation.mutate({ id: app.id, data: payload });
  }

  if (!app) return null;

  const devColor = dev ? (DEV_COLORS[dev.name] || "#6366f1") : "#6366f1";
  const origin = ORIGIN_LABELS[app.origin] || ORIGIN_LABELS["acelera"];
  const statusDot = COLUMN_DOT_COLORS[app.status] || "bg-gray-400";
  const statusLabel = COLUMN_LABELS[app.status] || app.status;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0" data-testid="dialog-app-detail">
        <div className="relative">
          <div className={`h-2 w-full bg-gradient-to-r ${COLUMN_ACCENT_COLORS[app.status] || COLUMN_ACCENT_COLORS["backlog"]}`} />

          <DialogHeader className="px-6 pt-5 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold" data-testid="text-detail-title">
                  {app.name}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="text-xs" data-testid="badge-detail-status">
                    <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${statusDot}`} />
                    {statusLabel}
                  </Badge>
                  <span className={`text-xs font-medium ${origin.color}`}>{origin.label}</span>
                  {app.type && (
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABELS[app.type] || app.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pt-4 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-4" data-testid="tabs-detail">
                <TabsTrigger value="info" data-testid="tab-info">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="manage" data-testid="tab-manage">
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  Gestão
                </TabsTrigger>
                <TabsTrigger value="edit" data-testid="tab-edit">
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Editar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-5 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField icon={<Layers className="h-3.5 w-3.5" />} label="Status">
                    <Badge variant="outline" className="text-xs">
                      <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${statusDot}`} />
                      {statusLabel}
                    </Badge>
                  </InfoField>
                  <InfoField icon={<Building2 className="h-3.5 w-3.5" />} label="Origem">
                    <span className={`text-sm font-medium ${origin.color}`}>{origin.label}</span>
                  </InfoField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoField icon={<Tag className="h-3.5 w-3.5" />} label="Tipo">
                    <span className="text-sm">{TYPE_LABELS[app.type] || app.type}</span>
                  </InfoField>
                  <InfoField icon={<Code2 className="h-3.5 w-3.5" />} label="Versão">
                    <span className="text-sm font-mono">{app.version || "—"}</span>
                  </InfoField>
                </div>

                {app.description && (
                  <InfoField icon={<FileText className="h-3.5 w-3.5" />} label="Descrição">
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-detail-description">
                      {app.description}
                    </p>
                  </InfoField>
                )}

                {app.techStack && app.techStack.length > 0 && (
                  <InfoField icon={<Code2 className="h-3.5 w-3.5" />} label="Tech Stack">
                    <div className="flex flex-wrap gap-1.5">
                      {app.techStack.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </InfoField>
                )}

                {client && (
                  <InfoField icon={<Building2 className="h-3.5 w-3.5" />} label="Cliente">
                    <span className="text-sm font-medium">{client.name}</span>
                  </InfoField>
                )}

                {app.gitRepo && (
                  <InfoField icon={<GitBranch className="h-3.5 w-3.5" />} label="Repositório Git">
                    <a
                      href={app.gitRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      data-testid="link-detail-git"
                    >
                      {app.gitRepo}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </InfoField>
                )}

                {app.controlUrl && (
                  <InfoField icon={<Globe className="h-3.5 w-3.5" />} label="Painel de Controle">
                    <a
                      href={app.controlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      data-testid="link-detail-control"
                    >
                      {app.controlUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </InfoField>
                )}

                <Separator />

                {dev && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Dev Responsável
                    </span>
                    <div className="glass-card p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarFallback
                          className="text-sm font-extrabold text-white"
                          style={{ background: devColor }}
                        >
                          {getInitials(dev.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm" data-testid="text-detail-dev-name">
                          {dev.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dev.role} · {dev.level === "lead" ? "Lead" : dev.level === "senior" ? "Senior" : dev.level === "mid" ? "Pleno" : "Junior"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {app.createdAt && (
                  <div className="text-xs text-muted-foreground/60 text-right">
                    Criado em {new Date(app.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manage" className="mt-0">
                <AppManageTab appId={app.id} />
              </TabsContent>

              <TabsContent value="edit" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-edit-app">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input {...field} data-testid="input-edit-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-type"><SelectValue /></SelectTrigger>
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
                              <SelectTrigger data-testid="select-edit-origin"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORIGIN_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>{ORIGIN_LABELS[o]?.label || o}</SelectItem>
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
                              <SelectTrigger data-testid="select-edit-status"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="version" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versão</FormLabel>
                          <FormControl><Input {...field} placeholder="1.0.0" data-testid="input-edit-version" /></FormControl>
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
                              <SelectTrigger data-testid="select-edit-client"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {clientsList.map((c) => (
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
                              <SelectTrigger data-testid="select-edit-dev"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {devsList.map((d) => (
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
                        <FormControl>
                          <Input {...field} placeholder="React, Node.js, PostgreSQL" data-testid="input-edit-techstack" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="gitRepo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repositório Git</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://github.com/..." data-testid="input-edit-git" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="controlUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Painel de Controle</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-edit-control" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Descreva o app..."
                            data-testid="textarea-edit-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("info")}
                        data-testid="button-cancel-edit"
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="button-save-edit"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        {updateMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

export default function KanbanPage() {
  const { toast } = useToast();
  const [filterDev, setFilterDev] = useState<string>("all");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<App | null>(null);

  const { data: apps = [], isLoading: appsLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const { data: devsList = [] } = useQuery<Developer[]>({
    queryKey: ["/api/developers"],
  });

  const { data: clientsList = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/apps/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      toast({ title: "Status atualizado" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao mover projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredApps = apps.filter((app) => {
    if (filterDev !== "all" && app.devResponsibleId !== filterDev) return false;
    if (filterOrigin !== "all" && app.origin !== filterOrigin) return false;
    return true;
  });

  const getColumnApps = useCallback(
    (colStatus: string) =>
      filteredApps.filter((a) => {
        const mapped = STATUS_TO_COLUMN[a.status] ?? a.status;
        return mapped === colStatus;
      }),
    [filteredApps]
  );

  const getDevName = (devId: string | null) => {
    if (!devId) return null;
    return devsList.find((d) => d.id === devId)?.name ?? null;
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current;
    if (dragData?.app) {
      setActiveApp(dragData.app as App);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const overId = over.id as string;

    if (!overId.startsWith("column-")) return;

    const targetStatus = overId.replace("column-", "");
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    const currentColumn = STATUS_TO_COLUMN[app.status] ?? app.status;
    if (currentColumn === targetStatus) return;

    moveMutation.mutate({ id: appId, status: targetStatus });
  };

  const openAppDetail = (app: App) => {
    setSelectedApp(app);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="kanban-page">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2" data-testid="kanban-status-cards">
        {COLUMN_ORDER.map((col) => {
          const count = getColumnApps(col).length;
          const dotColor = COLUMN_DOT_COLORS[col] || "bg-gray-400";
          return (
            <div
              key={col}
              className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/50 px-3 py-2.5 transition-all"
              data-testid={`status-card-${col}`}
            >
              <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground truncate leading-tight">{COLUMN_LABELS[col]}</span>
                <span className="text-base font-bold leading-tight">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-row flex-wrap items-center gap-3 glass-card p-3"
        data-testid="filter-bar"
      >
        <Select value={filterDev} onValueChange={setFilterDev}>
          <SelectTrigger
            className="w-[180px] bg-background/50 dark:bg-white/5 border-border/50"
            data-testid="select-filter-dev"
          >
            <SelectValue placeholder="Filtrar por Dev" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Devs</SelectItem>
            {devsList.map((dev) => (
              <SelectItem key={dev.id} value={dev.id}>
                {dev.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOrigin} onValueChange={setFilterOrigin}>
          <SelectTrigger
            className="w-[180px] bg-background/50 dark:bg-white/5 border-border/50"
            data-testid="select-filter-origin"
          >
            <SelectValue placeholder="Filtrar por Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Origens</SelectItem>
            <SelectItem value="acelera">Acelera IT</SelectItem>
            <SelectItem value="opus">Opus</SelectItem>
            <SelectItem value="both">Opus + Acelera</SelectItem>
            <SelectItem value="thecorp">TheCorp</SelectItem>
            <SelectItem value="vittaverde">VittaVerde</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {appsLoading ? (
        <div className="flex flex-row gap-4 overflow-x-auto pb-4">
          {COLUMN_ORDER.map((col) => (
            <div key={col} className="min-w-[260px] flex-shrink-0">
              <Skeleton className="h-12 w-full mb-3 rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full mt-2 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex flex-row gap-4 overflow-x-auto pb-4"
            data-testid="kanban-board"
          >
            {COLUMN_ORDER.map((colStatus) => (
              <DroppableColumn
                key={colStatus}
                status={colStatus}
                apps={getColumnApps(colStatus)}
                devsList={devsList}
                onAppClick={openAppDetail}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeApp ? (
              <AppCardOverlay
                app={activeApp}
                devName={getDevName(activeApp.devResponsibleId)}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AppDetailDialog
        app={selectedApp}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            const freshApp = apps.find((a) => a.id === selectedApp?.id);
            if (freshApp) setSelectedApp(freshApp);
          }
        }}
        devsList={devsList}
        clientsList={clientsList}
      />
    </div>
  );
}
