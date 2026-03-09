import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead, TagConfig, Client, App } from "@shared/schema";
import { insertLeadSchema } from "@shared/schema";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  DollarSign,
  Trophy,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  Target,
  Clock,
  MoreHorizontal,
  GripVertical,
  X,
  Tag,
  Palette,
  CheckSquare,
  Square,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const STAGES = [
  { key: "new", label: "Novo", color: "#3b82f6", borderColor: "border-l-blue-500", headerBg: "from-blue-500/15 to-blue-500/5", dotBg: "bg-blue-500", countBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { key: "contacted", label: "Contatado", color: "#06b6d4", borderColor: "border-l-cyan-500", headerBg: "from-cyan-500/15 to-cyan-500/5", dotBg: "bg-cyan-500", countBg: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  { key: "proposal", label: "Proposta", color: "#a855f7", borderColor: "border-l-purple-500", headerBg: "from-purple-500/15 to-purple-500/5", dotBg: "bg-purple-500", countBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  { key: "negotiating", label: "Negociando", color: "#f59e0b", borderColor: "border-l-amber-500", headerBg: "from-amber-500/15 to-amber-500/5", dotBg: "bg-amber-500", countBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { key: "won", label: "Ganho", color: "#22c55e", borderColor: "border-l-green-500", headerBg: "from-green-500/15 to-green-500/5", dotBg: "bg-green-500", countBg: "bg-green-500/15 text-green-700 dark:text-green-300" },
  { key: "lost", label: "Perdido", color: "#ef4444", borderColor: "border-l-red-500", headerBg: "from-red-500/15 to-red-500/5", dotBg: "bg-red-500", countBg: "bg-red-500/15 text-red-700 dark:text-red-300" },
] as const;

const STATUS_OPTIONS = ["new", "contacted", "proposal", "negotiating", "won", "lost"] as const;

const SERVICE_TYPE_OPTIONS = [
  { value: "projeto", label: "Projeto" },
  { value: "sistema", label: "Sistema" },
  { value: "bpo", label: "BPO" },
] as const;

const PRICING_MODEL_OPTIONS = [
  { value: "fixed", label: "Fixo" },
  { value: "per_user", label: "Por Usuário" },
  { value: "fixed_plus_user", label: "Fixo + Usuário" },
] as const;

const formSchema = insertLeadSchema.extend({
  name: z.string().min(1, "Nome obrigatorio"),
  estimatedValue: z.string().optional().nullable(),
  serviceType: z.array(z.string()).optional().nullable(),
  projectType: z.string().default("new_app"),
  existingAppId: z.coerce.number().optional().nullable(),
  monthlyFee: z.string().optional().nullable(),
  implantationFee: z.string().optional().nullable(),
  pricingModel: z.string().optional().nullable(),
  pricePerUser: z.string().optional().nullable(),
  estimatedUsers: z.coerce.number().optional().nullable(),
  installments: z.coerce.number().optional().nullable(),
  teamSize: z.coerce.number().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  clientId: z.string().optional().nullable(),
});

const TAG_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e", "#64748b", "#059669", "#dc2626", "#0284c7",
];

function hexToTagStyle(hex: string) {
  return {
    backgroundColor: `${hex}18`,
    color: hex,
    borderColor: `${hex}40`,
  };
}

const FALLBACK_TAG_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#f43f5e",
  "#06b6d4", "#6366f1", "#f97316",
];

function getFallbackColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_TAG_COLORS[Math.abs(hash) % FALLBACK_TAG_COLORS.length];
}

type FormValues = z.infer<typeof formSchema>;

function formatBRL(value: string | null | undefined): string {
  if (!value) return "---";
  const num = parseFloat(value);
  if (isNaN(num)) return "---";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCompactBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
  return `${Math.floor(days / 30)}m atrás`;
}

const KPI_ACCENTS = [
  "hsl(217 91% 52%)",
  "hsl(142 76% 42%)",
  "hsl(43 96% 52%)",
  "hsl(280 87% 52%)",
];

function getServiceTypeBadges(serviceType: string[] | null | undefined) {
  if (!serviceType || serviceType.length === 0) return null;
  const badgeMap: Record<string, JSX.Element> = {
    projeto: <Badge key="projeto" className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px] px-1.5 py-0">Projeto</Badge>,
    sistema: <Badge key="sistema" className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-[10px] px-1.5 py-0">Sistema</Badge>,
    bpo: <Badge key="bpo" className="bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30 text-[10px] px-1.5 py-0">BPO</Badge>,
  };
  return <>{serviceType.map(t => badgeMap[t]).filter(Boolean)}</>;
}

function getLeadValueDisplay(lead: Lead): { primary: string; secondary?: string } {
  const st = lead.serviceType || [];
  if (st.includes("projeto")) {
    const primary = formatBRL(lead.estimatedValue);
    const secondary = lead.installments && lead.installments > 1 ? `${lead.installments}x parcelas` : undefined;
    return { primary, secondary };
  }
  if (st.includes("sistema")) {
    const primary = lead.monthlyFee ? `${formatBRL(lead.monthlyFee)}/mês` : formatBRL(lead.estimatedValue);
    const model = PRICING_MODEL_OPTIONS.find(p => p.value === lead.pricingModel);
    const secondary = model ? model.label : undefined;
    return { primary, secondary };
  }
  if (st.includes("bpo")) {
    const primary = lead.monthlyFee ? `${formatBRL(lead.monthlyFee)}/mês` : formatBRL(lead.estimatedValue);
    const secondary = lead.teamSize ? `${lead.teamSize} pessoas` : undefined;
    return { primary, secondary };
  }
  return { primary: formatBRL(lead.estimatedValue) };
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-emerald-500 to-emerald-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const defaultFormValues: FormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "new",
  source: "",
  estimatedValue: "",
  notes: "",
  serviceType: [],
  projectType: "new_app",
  existingAppId: null,
  monthlyFee: "",
  implantationFee: "",
  pricingModel: null,
  pricePerUser: "",
  estimatedUsers: null,
  installments: null,
  teamSize: null,
  tags: [],
  clientId: null,
};

function TagInput({ tags, onChange, tagConfigs = [] }: { tags: string[]; onChange: (tags: string[]) => void; tagConfigs?: TagConfig[] }) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showNewTagColor, setShowNewTagColor] = useState(false);
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const inputRef = useRef<HTMLInputElement>(null);

  const tagColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    tagConfigs.forEach(tc => { map[tc.name.toLowerCase()] = tc.color; });
    return map;
  }, [tagConfigs]);

  const getColor = useCallback((tag: string) => {
    return tagColorMap[tag.toLowerCase()] || getFallbackColor(tag);
  }, [tagColorMap]);

  const filteredSuggestions = useMemo(() => {
    const existing = new Set(tags.map(t => t.toLowerCase()));
    return tagConfigs
      .filter(tc => !existing.has(tc.name.toLowerCase()) && (inputValue === "" || tc.name.toLowerCase().includes(inputValue.toLowerCase())))
      .slice(0, 12);
  }, [inputValue, tags, tagConfigs]);

  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await apiRequest("POST", "/api/tag-configs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tag-configs"] });
    },
  });

  const updateTagColorMutation = useMutation({
    mutationFn: async ({ id, color }: { id: string; color: string }) => {
      const res = await apiRequest("PATCH", `/api/tag-configs/${id}`, { color });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tag-configs"] });
      setShowColorPicker(null);
      toast({ title: "Cor atualizada" });
    },
  });

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    setShowNewTagColor(false);
    inputRef.current?.focus();
  }, [tags, onChange]);

  const addNewTag = useCallback((tag: string, color: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const existing = tagConfigs.find(tc => tc.name.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      createTagMutation.mutate({ name: trimmed, color });
    }
    addTag(trimmed);
  }, [tagConfigs, createTagMutation, addTag]);

  const removeTag = useCallback((index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  }, [tags, onChange]);

  const isNewTag = inputValue.trim() !== "" && !tagConfigs.some(tc => tc.name.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map((tag, i) => {
          const color = getColor(tag);
          const config = tagConfigs.find(tc => tc.name.toLowerCase() === tag.toLowerCase());
          return (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border cursor-default group relative"
              style={hexToTagStyle(color)}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {tag}
              {config && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowColorPicker(showColorPicker === config.id ? null : config.id); }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-0.5"
                  data-testid={`button-edit-color-${i}`}
                >
                  <Palette className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                data-testid={`button-remove-tag-${i}`}
              >
                <X className="h-3 w-3" />
              </button>
              {showColorPicker === config?.id && (
                <div className="absolute z-[60] top-full left-0 mt-1.5 p-3 bg-popover border border-border rounded-xl shadow-xl min-w-[220px]" onClick={e => e.stopPropagation()}>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Cor da tag "{tag}"</p>
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {TAG_PALETTE.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${c === color ? "border-foreground scale-110 shadow-md" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => config && updateTagColorMutation.mutate({ id: config.id, color: c })}
                        data-testid={`color-option-${c}`}
                      />
                    ))}
                  </div>
                  <button type="button" className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors" onClick={() => setShowColorPicker(null)}>
                    Fechar
                  </button>
                </div>
              )}
            </span>
          );
        })}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setShowNewTagColor(false);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => { setShowSuggestions(false); setShowNewTagColor(false); }, 250)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputValue.trim()) {
                  if (isNewTag) {
                    addNewTag(inputValue, newTagColor);
                  } else {
                    addTag(inputValue);
                  }
                }
              }
              if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
                removeTag(tags.length - 1);
              }
            }}
            placeholder="Digite ou selecione uma tag..."
            className="text-sm"
            data-testid="input-tag"
          />
          {inputValue.trim() && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (isNewTag) addNewTag(inputValue, newTagColor);
                else addTag(inputValue);
              }}
              className="shrink-0"
              data-testid="button-add-tag"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {showSuggestions && (filteredSuggestions.length > 0 || isNewTag) && (
          <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-xl shadow-xl overflow-hidden" data-testid="tag-suggestions">
            {filteredSuggestions.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                {filteredSuggestions.map((tc) => (
                  <button
                    key={tc.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2.5"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addTag(tc.name);
                    }}
                    data-testid={`suggestion-${tc.name}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: tc.color }} />
                    <span className="font-medium">{tc.name}</span>
                  </button>
                ))}
              </div>
            )}
            {isNewTag && (
              <div className="border-t border-border/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-5 h-5 rounded-md border border-border/40 shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: newTagColor }}
                    onMouseDown={(e) => { e.preventDefault(); setShowNewTagColor(!showNewTagColor); }}
                    data-testid="button-new-tag-color-toggle"
                  />
                  <button
                    type="button"
                    className="flex-1 text-left text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addNewTag(inputValue, newTagColor);
                    }}
                    data-testid="button-create-new-tag"
                  >
                    <span className="text-muted-foreground/50">Criar tag </span>
                    <span className="font-bold" style={{ color: newTagColor }}>"{inputValue.trim()}"</span>
                  </button>
                </div>
                {showNewTagColor && (
                  <div className="grid grid-cols-9 gap-1.5 mt-2.5 pt-2.5 border-t border-border/20">
                    {TAG_PALETTE.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${c === newTagColor ? "border-foreground scale-110 shadow-md" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onMouseDown={(e) => { e.preventDefault(); setNewTagColor(c); }}
                        data-testid={`new-tag-color-${c}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DroppableColumn({ id, children, isEmpty }: { id: string; children: React.ReactNode; isEmpty: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 min-h-[120px] rounded-xl p-1.5 transition-all duration-300 ${
        isOver
          ? "bg-primary/[0.06] dark:bg-primary/[0.08] ring-2 ring-primary/20 ring-inset scale-[1.01]"
          : ""
      }`}
      data-testid={`dropzone-${id}`}
    >
      {children}
      {isEmpty && !isOver && (
        <div className="rounded-xl border-2 border-dashed border-border/30 dark:border-white/[0.06] flex flex-col items-center justify-center py-10 text-center" data-testid={`text-empty-${id}`}>
          <GripVertical className="h-5 w-5 text-muted-foreground/20 mb-1" />
          <span className="text-[11px] text-muted-foreground/40">Arraste um lead aqui</span>
        </div>
      )}
      {isEmpty && isOver && (
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] flex flex-col items-center justify-center py-10 text-center animate-pulse">
          <Plus className="h-5 w-5 text-primary/40 mb-1" />
          <span className="text-[11px] text-primary/50 font-medium">Soltar aqui</span>
        </div>
      )}
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  stage: typeof STAGES[number];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  tagConfigs?: TagConfig[];
}

function SortableLeadCard({ lead, stage, onEdit, onDelete, tagConfigs }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: "lead", lead, status: lead.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCardContent lead={lead} stage={stage} onEdit={onEdit} onDelete={onDelete} tagConfigs={tagConfigs} />
    </div>
  );
}

function LeadCardContent({ lead, stage, onEdit, onDelete, isOverlay, tagConfigs = [] }: LeadCardProps & { dragListeners?: Record<string, unknown>; isOverlay?: boolean }) {
  const valueDisplay = getLeadValueDisplay(lead);
  const initials = getInitials(lead.name);
  const avatarGrad = getAvatarGradient(lead.name);
  const relDate = formatRelativeDate(lead.createdAt);

  return (
    <div
      className={`rounded-xl border-l-[3px] ${stage.borderColor} group transition-all duration-200 ${isOverlay ? "shadow-2xl scale-105 rotate-1" : "hover:shadow-lg dark:hover:shadow-black/30 cursor-grab active:cursor-grabbing"} bg-card dark:bg-[hsl(222_35%_9%)] border border-border/50 dark:border-white/[0.06]`}
      data-testid={`card-lead-${lead.id}`}
      onClick={() => !isOverlay && onEdit(lead)}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[11px] font-bold shrink-0 text-white bg-gradient-to-br select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-full h-full rounded-lg bg-gradient-to-br ${avatarGrad} flex items-center justify-center`}>
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[13px] font-semibold leading-tight truncate" data-testid={`text-lead-name-${lead.id}`}>
                {lead.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5"
                    data-testid={`button-menu-${lead.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(lead); }} data-testid={`button-edit-${lead.id}`}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
                    data-testid={`button-delete-${lead.id}`}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {lead.company && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate" data-testid={`text-lead-company-${lead.id}`}>
                  {lead.company}
                </span>
              </div>
            )}
          </div>
        </div>

        {lead.tags && lead.tags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {lead.tags.map((tag, i) => {
              const tc = tagConfigs.find(c => c.name.toLowerCase() === tag.toLowerCase());
              const color = tc?.color || getFallbackColor(tag);
              return (
                <span
                  key={`${tag}-${i}`}
                  className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border"
                  style={hexToTagStyle(color)}
                  data-testid={`tag-${lead.id}-${i}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {lead.projectType === "existing_app" && (
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/30" data-testid={`badge-project-type-${lead.id}`}>
              App Existente
            </Badge>
          </div>
        )}

        <div className="mt-2.5 rounded-lg px-3 py-2 bg-muted/30 dark:bg-white/[0.03] border border-border/30 dark:border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Valor</span>
            {valueDisplay.secondary && (
              <span className="text-[10px] text-muted-foreground/50">{valueDisplay.secondary}</span>
            )}
          </div>
          <span className="text-sm font-bold font-mono" data-testid={`text-lead-value-${lead.id}`}>
            {valueDisplay.primary}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {lead.email && (
              <div title={lead.email} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                <Mail className="h-3 w-3 text-muted-foreground/40" />
              </div>
            )}
            {lead.phone && (
              <div title={lead.phone} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                <Phone className="h-3 w-3 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {relDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">{relDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: tagConfigs = [] } = useQuery<TagConfig[]>({
    queryKey: ["/api/tag-configs"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: allApps = [] } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const watchServiceType = form.watch("serviceType");
  const watchProjectType = form.watch("projectType");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/leads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Lead criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar lead", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setDialogOpen(false);
      setEditingLead(null);
      form.reset();
      toast({ title: "Lead atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar lead", description: error.message, variant: "destructive" });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao mover lead", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setDeleteDialogOpen(false);
      setDeletingLeadId(null);
      toast({ title: "Lead excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir lead", description: error.message, variant: "destructive" });
    },
  });

  function openCreateDialog() {
    setEditingLead(null);
    form.reset({ ...defaultFormValues });
    setDialogOpen(true);
  }

  function openEditDialog(lead: Lead) {
    setEditingLead(lead);
    form.reset({
      name: lead.name,
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status,
      source: lead.source || "",
      estimatedValue: lead.estimatedValue || "",
      notes: lead.notes || "",
      serviceType: lead.serviceType || [],
      projectType: lead.projectType || "new_app",
      existingAppId: lead.existingAppId ?? null,
      monthlyFee: lead.monthlyFee || "",
      implantationFee: lead.implantationFee || "",
      pricingModel: lead.pricingModel || null,
      pricePerUser: lead.pricePerUser || "",
      estimatedUsers: lead.estimatedUsers ?? null,
      installments: lead.installments ?? null,
      teamSize: lead.teamSize ?? null,
      tags: lead.tags || [],
      clientId: lead.clientId || null,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      name: values.name,
      company: values.company || null,
      email: values.email || null,
      phone: values.phone || null,
      status: values.status,
      source: values.source || null,
      notes: values.notes || null,
      estimatedValue: values.estimatedValue || null,
      serviceType: values.serviceType && values.serviceType.length > 0 ? values.serviceType : null,
      projectType: values.projectType || "new_app",
      existingAppId: values.projectType === "existing_app" ? (values.existingAppId || null) : null,
      monthlyFee: values.monthlyFee || null,
      implantationFee: values.implantationFee || null,
      pricingModel: values.pricingModel || null,
      pricePerUser: values.pricePerUser || null,
      estimatedUsers: values.estimatedUsers || null,
      installments: values.installments || null,
      teamSize: values.teamSize || null,
      tags: values.tags && values.tags.length > 0 ? values.tags : null,
      clientId: values.clientId || null,
    };
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const totalLeads = leads?.length || 0;
  const activeLeads = leads?.filter(l => l.status !== "lost" && l.status !== "won") || [];
  const pipelineValue = activeLeads.reduce((sum, l) => {
    const val = parseFloat(l.estimatedValue || "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const wonCount = leads?.filter((l) => l.status === "won").length || 0;
  const wonValue = leads?.filter(l => l.status === "won").reduce((sum, l) => {
    const val = parseFloat(l.estimatedValue || "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0) || 0;
  const closedCount = leads?.filter((l) => l.status === "won" || l.status === "lost").length || 0;
  const conversionRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

  const kpis = [
    { label: "Total de Leads", value: totalLeads.toString(), sub: `${activeLeads.length} ativos`, icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Pipeline Ativo", value: formatCompactBRL(pipelineValue), sub: `${activeLeads.length} negócios`, icon: DollarSign, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Ganhos", value: wonCount.toString(), sub: wonValue > 0 ? formatCompactBRL(wonValue) : "---", icon: Trophy, iconBg: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400" },
    { label: "Taxa de Conversão", value: `${conversionRate}%`, sub: `${wonCount}/${closedCount} fechados`, icon: TrendingUp, iconBg: "bg-purple-500/10", iconColor: "text-purple-600 dark:text-purple-400" },
  ];

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const stage of STAGES) {
      map[stage.key] = leads?.filter(l => l.status === stage.key) || [];
    }
    return map;
  }, [leads]);

  const activeLead = activeId ? leads?.find(l => l.id === activeId) : null;
  const activeStage = activeLead ? STAGES.find(s => s.key === activeLead.status) : null;

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const stageKeys = STAGES.map(s => s.key);
      const droppableHit = pointerCollisions.find(c => stageKeys.includes(String(c.id)));
      if (droppableHit) return [droppableHit];
      return pointerCollisions;
    }
    return rectIntersection(args);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(_event: DragOverEvent) {
  }

  function findColumnForId(id: string | number): string | null {
    const stageKeys = STAGES.map(s => s.key);
    const strId = String(id);
    if (stageKeys.includes(strId as typeof stageKeys[number])) {
      return strId;
    }
    const lead = leads?.find(l => l.id === strId);
    return lead ? lead.status : null;
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !active) return;

    const draggedLead = leads?.find(l => l.id === active.id);
    if (!draggedLead) return;

    const targetStatus = findColumnForId(over.id);

    if (targetStatus && targetStatus !== draggedLead.status) {
      queryClient.setQueryData(["/api/leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(l => l.id === draggedLead.id ? { ...l, status: targetStatus } : l);
      });
      moveMutation.mutate({ id: draggedLead.id, status: targetStatus });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-leads">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5" data-testid="text-page-title">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            Pipeline Comercial
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
            Gerencie seus leads e acompanhe o funil de vendas
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-new-lead" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-row">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="kpi-card p-4 flex items-center gap-4"
            style={{ "--kpi-accent": KPI_ACCENTS[idx] } as React.CSSProperties}
            data-testid={`kpi-${kpi.label}`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${kpi.iconBg}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">{kpi.label}</span>
              <span className="text-xl font-bold tracking-tight">{kpi.value}</span>
              <span className="text-[11px] text-muted-foreground/70">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" data-testid="loading-skeleton">
          {STAGES.map((stage) => (
            <div key={stage.key} className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" data-testid="kanban-board">
            {STAGES.map((stage) => {
              const stageLeads = leadsByStage[stage.key] || [];
              const stageValue = stageLeads.reduce((sum, l) => {
                const val = parseFloat(l.estimatedValue || "0");
                return sum + (isNaN(val) ? 0 : val);
              }, 0);
              const leadIds = stageLeads.map(l => l.id);

              return (
                <div key={stage.key} className="flex flex-col gap-2.5" data-testid={`column-${stage.key}`}>
                  <div className={`rounded-xl px-3.5 py-3 bg-gradient-to-b ${stage.headerBg} border border-border/30 dark:border-white/[0.06]`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.dotBg}`} style={{ boxShadow: `0 0 8px ${stage.color}60` }} />
                        <span className="text-sm font-bold" data-testid={`text-column-label-${stage.key}`}>
                          {stage.label}
                        </span>
                      </div>
                      <span className={`inline-flex items-center justify-center min-w-[24px] h-[24px] rounded-lg text-[11px] font-bold ${stage.countBg}`} data-testid={`badge-count-${stage.key}`}>
                        {stageLeads.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <div className="mt-1.5 text-[11px] font-semibold font-mono text-muted-foreground" data-testid={`text-column-value-${stage.key}`}>
                        {formatCompactBRL(stageValue)}
                      </div>
                    )}
                  </div>

                  <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                    <DroppableColumn id={stage.key} isEmpty={stageLeads.length === 0}>
                      {stageLeads.map((lead) => (
                        <SortableLeadCard
                          key={lead.id}
                          lead={lead}
                          stage={stage}
                          onEdit={openEditDialog}
                          onDelete={(id) => {
                            setDeletingLeadId(id);
                            setDeleteDialogOpen(true);
                          }}
                          tagConfigs={tagConfigs}
                        />
                      ))}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLead && activeStage ? (
              <LeadCardContent
                lead={activeLead}
                stage={activeStage}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
                tagConfigs={tagConfigs}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[780px] max-h-[94vh] overflow-hidden p-0 gap-0 rounded-2xl" data-testid="dialog-lead-form">
          {(() => {
            const currentStage = STAGES.find((st) => st.key === form.watch("status")) || STAGES[0];
            const watchedName = form.watch("name");
            const watchedValue = form.watch("estimatedValue");
            const watchedMonthly = form.watch("monthlyFee");
            const avatarGrad = watchedName ? getAvatarGradient(watchedName) : AVATAR_GRADIENTS[0];

            return (
              <>
                <div
                  className="relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${currentStage.color}10 0%, transparent 80%)` }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${currentStage.color} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
                  <div className="relative px-6 pt-5 pb-4">
                    <DialogHeader className="p-0 space-y-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${avatarGrad} shrink-0 shadow-lg`}
                            style={{ boxShadow: `0 4px 14px ${currentStage.color}30` }}
                          >
                            {watchedName ? getInitials(watchedName) : <Plus className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <DialogTitle className="text-lg font-bold leading-tight" data-testid="text-dialog-title">
                              {editingLead ? watchedName || editingLead.name : "Novo Lead"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                              {editingLead ? (
                                <>
                                  {editingLead.company && <span>{editingLead.company}</span>}
                                  {editingLead.createdAt && (
                                    <span className="text-muted-foreground/40">
                                      · {formatRelativeDate(editingLead.createdAt)}
                                    </span>
                                  )}
                                </>
                              ) : "Preencha as informações do lead"}
                            </DialogDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {watchedValue && parseFloat(watchedValue) > 0 && (
                            <div className="text-right">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Valor</div>
                              <div className="text-sm font-bold font-mono" style={{ color: currentStage.color }}>
                                {formatBRL(watchedValue)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <div className="mt-4">
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 dark:bg-white/[0.04] border border-border/30 dark:border-white/[0.06]">
                              {STAGES.map((st) => {
                                const isActive = field.value === st.key;
                                return (
                                  <button
                                    key={st.key}
                                    type="button"
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                      isActive
                                        ? "text-white shadow-sm"
                                        : "text-muted-foreground/60"
                                    }`}
                                    style={isActive ? { background: st.color, boxShadow: `0 2px 8px ${st.color}40` } : {}}
                                    onClick={() => field.onChange(st.key)}
                                    data-testid={`status-pill-${st.key}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#fff" : st.color }} />
                                    <span className="hidden sm:inline">{st.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      />
                    </DialogHeader>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
                    <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(94vh - 220px)" }}>

                      <div className="px-6 pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-3 w-3 text-blue-500" />
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground/70">Informações do Lead</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Nome do lead" data-testid="input-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> Empresa
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} placeholder="Nome da empresa" data-testid="input-company" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <Target className="h-3 w-3" /> Origem
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} placeholder="Indicação, Google, etc." data-testid="input-source" />
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
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> Email
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} type="email" placeholder="email@empresa.com" data-testid="input-email" />
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
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> Telefone
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} placeholder="+55 11 99999-0000" data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                      <div className="px-6 pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground/70">Negócio & Financeiro</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                          <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => {
                              const selected = field.value || [];
                              const toggleType = (val: string) => {
                                const current = [...selected];
                                const idx = current.indexOf(val);
                                if (idx >= 0) current.splice(idx, 1);
                                else current.push(val);
                                field.onChange(current);
                              };
                              return (
                                <FormItem>
                                  <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tipo de Serviço</FormLabel>
                                  <div className="flex flex-wrap gap-2" data-testid="multiselect-serviceType">
                                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleType(opt.value)}
                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                          selected.includes(opt.value)
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
                                        }`}
                                        data-testid={`toggle-serviceType-${opt.value}`}
                                      >
                                        {selected.includes(opt.value) ? (
                                          <CheckSquare className="h-3.5 w-3.5" />
                                        ) : (
                                          <Square className="h-3.5 w-3.5" />
                                        )}
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="projectType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tipo de Projeto</FormLabel>
                                <div className="flex flex-wrap gap-2" data-testid="select-projectType">
                                  <button
                                    type="button"
                                    onClick={() => { field.onChange("new_app"); form.setValue("existingAppId", null); }}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                      field.value === "new_app"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
                                    }`}
                                    data-testid="toggle-projectType-new"
                                  >
                                    {field.value === "new_app" ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                    App Novo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => field.onChange("existing_app")}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                      field.value === "existing_app"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
                                    }`}
                                    data-testid="toggle-projectType-existing"
                                  >
                                    {field.value === "existing_app" ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                    App Existente
                                  </button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {watchProjectType === "existing_app" && (
                            <FormField
                              control={form.control}
                              name="existingAppId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">App Existente</FormLabel>
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-existingApp">
                                        <SelectValue placeholder="Selecione o app" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {allApps.filter(a => a.status !== "disabled").map((app) => (
                                        <SelectItem key={app.id} value={app.id.toString()} data-testid={`option-app-${app.id}`}>
                                          {app.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={form.control}
                            name="estimatedValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {watchServiceType?.includes("projeto") ? "Valor Total" : "Valor Estimado"}
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" data-testid="input-estimatedValue" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {watchServiceType?.includes("projeto") && (
                            <FormField
                              control={form.control}
                              name="installments"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Parcelas</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      placeholder="Ex: 3"
                                      data-testid="input-installments"
                                      value={field.value ?? ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {watchServiceType?.includes("sistema") && (
                            <>
                              <FormField
                                control={form.control}
                                name="monthlyFee"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Mensalidade (R$)</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" data-testid="input-monthlyFee" />
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
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Implantação (R$)</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" data-testid="input-implantationFee" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pricingModel"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Modelo de Cobrança</FormLabel>
                                    <Select
                                      onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                                      value={field.value ?? "__none__"}
                                    >
                                      <FormControl>
                                        <SelectTrigger data-testid="select-pricingModel">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="__none__">Nenhum</SelectItem>
                                        {PRICING_MODEL_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pricePerUser"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Preço/Usuário (R$)</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" data-testid="input-pricePerUser" />
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
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Usuários Estimados</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 10"
                                        data-testid="input-estimatedUsers"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

                          {watchServiceType?.includes("bpo") && (
                            <>
                              <FormField
                                control={form.control}
                                name="monthlyFee"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Valor Mensal (R$)</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0,00" data-testid="input-monthlyFee" />
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
                                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tamanho da Equipe</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        placeholder="Ex: 4"
                                        data-testid="input-teamSize"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

                          <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> Cliente Vinculado
                                  <span className="text-muted-foreground/30 font-normal normal-case tracking-normal ml-1">(opcional)</span>
                                </FormLabel>
                                <Select
                                  onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                                  value={field.value ?? "__none__"}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-clientId">
                                      <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="__none__">Nenhum (será criado ao ganhar)</SelectItem>
                                    {clients.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {(watchedValue || watchedMonthly) && (
                          <div className="mt-4 rounded-xl border border-border/30 dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02] p-3">
                            <div className="flex items-center gap-4 flex-wrap">
                              {watchedValue && parseFloat(watchedValue) > 0 && (
                                <div>
                                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold">
                                    {watchServiceType?.includes("projeto") ? "Total" : "Estimado"}
                                  </div>
                                  <div className="text-base font-bold font-mono text-foreground">{formatBRL(watchedValue)}</div>
                                </div>
                              )}
                              {watchedMonthly && parseFloat(watchedMonthly) > 0 && (
                                <div className="border-l border-border/30 pl-4">
                                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold">Mensal</div>
                                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatBRL(watchedMonthly)}/mês</div>
                                </div>
                              )}
                              {watchServiceType && watchServiceType.length > 0 && (
                                <div className="border-l border-border/30 pl-4">
                                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold">Tipo</div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {watchServiceType.map(t => SERVICE_TYPE_OPTIONS.find(o => o.value === t)?.label).filter(Boolean).join(", ")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                      <div className="px-6 pt-4 pb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-md bg-purple-500/10 flex items-center justify-center">
                            <Tag className="h-3 w-3 text-purple-500" />
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground/70">Tags & Observações</span>
                        </div>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <TagInput
                                    tags={field.value || []}
                                    onChange={(newTags) => field.onChange(newTags)}
                                    tagConfigs={tagConfigs}
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
                                <FormControl>
                                  <Textarea {...field} value={field.value ?? ""} rows={2} placeholder="Notas internas sobre o lead..." data-testid="input-notes" className="resize-none text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-3.5 border-t border-border/40 bg-muted/20 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5">
                        {editingLead?.createdAt && (
                          <>
                            <Clock className="h-3 w-3" />
                            Criado em {new Date(editingLead.createdAt).toLocaleDateString("pt-BR")}
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isMutating}
                          data-testid="button-submit"
                          style={{ background: currentStage.color }}
                          className="text-white shadow-sm min-w-[140px]"
                        >
                          {isMutating ? "Salvando..." : editingLead ? "Salvar Alterações" : "Criar Lead"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-lead">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingLeadId && deleteMutation.mutate(deletingLeadId)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
