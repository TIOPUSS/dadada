import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { App, Client, Developer, AppDocument, RepoFile } from "@shared/schema";
import {
  AppWindow, Pencil, Trash2, Power, ArrowLeft,
  FileText, Upload, Download, FolderOpen,
  ExternalLink, GitBranch, ChevronRight,
  FileSpreadsheet, Presentation, FileCheck, File,
  Code, Globe, Building2, Layers, Tag,
  Activity, Calendar, Folder, FolderPlus,
  MoreHorizontal, Sparkles, ArrowUpRight, Check,
  CircleDot, Hash, Mail, Phone, Briefcase,
  Target, Shield, Zap, Cpu, Box,
  Image, Archive, FileCode, FileCog,
  HardDrive, LayoutGrid, List, Search,
  Clock, Eye, Package, Server, Workflow,
  GripVertical, UploadCloud, FolderArchive,
  FileUp, X, ChevronDown, Info, Link2,
  Terminal, Database, FileJson,
  ArrowUpDown, ArrowUp, ArrowDown,
  CheckSquare, Square, Minus,
  GitCommit, Lock, Copy, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_CFG: Record<string, { label: string; color: string; textColor: string; bgClass: string; barColor: string; gradient: string }> = {
  backlog: { label: "Backlog", color: "#94a3b8", textColor: "text-slate-600 dark:text-slate-400", bgClass: "bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", barColor: "bg-slate-400", gradient: "from-slate-400 to-slate-500" },
  in_dev: { label: "Em Dev", color: "#3b82f6", textColor: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", barColor: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
  staging: { label: "Melhoria", color: "#06b6d4", textColor: "text-cyan-600 dark:text-cyan-400", bgClass: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800", barColor: "bg-cyan-500", gradient: "from-cyan-500 to-teal-500" },
  validation_1: { label: "Validação 1", color: "#8b5cf6", textColor: "text-violet-600 dark:text-violet-400", bgClass: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", barColor: "bg-violet-500", gradient: "from-violet-500 to-purple-500" },
  validation_2: { label: "Validação 2", color: "#a855f7", textColor: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", barColor: "bg-purple-500", gradient: "from-purple-500 to-fuchsia-500" },
  validation_3: { label: "Validação 3", color: "#d946ef", textColor: "text-fuchsia-600 dark:text-fuchsia-400", bgClass: "bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800", barColor: "bg-fuchsia-500", gradient: "from-fuchsia-500 to-pink-500" },
  testing: { label: "Em Teste", color: "#14b8a6", textColor: "text-teal-600 dark:text-teal-400", bgClass: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", barColor: "bg-teal-500", gradient: "from-teal-500 to-emerald-500" },
  deploying: { label: "Implantação", color: "#f59e0b", textColor: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", barColor: "bg-amber-500", gradient: "from-amber-500 to-orange-500" },
  active: { label: "Ativo", color: "#22c55e", textColor: "text-green-600 dark:text-green-400", bgClass: "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", barColor: "bg-green-500", gradient: "from-green-500 to-emerald-500" },
  paused: { label: "Pausado", color: "#ef4444", textColor: "text-red-600 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", barColor: "bg-red-400", gradient: "from-red-400 to-rose-500" },
  disabled: { label: "Desativado", color: "#ef4444", textColor: "text-red-600 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", barColor: "bg-red-500", gradient: "from-red-500 to-rose-600" },
  archived: { label: "Concluído", color: "#10b981", textColor: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", barColor: "bg-emerald-500", gradient: "from-emerald-500 to-green-500" },
};

const PIPELINE = ["backlog", "in_dev", "validation_1", "validation_2", "validation_3", "testing", "deploying", "staging", "active"];

const TYPE_MAP: Record<string, { label: string; icon: typeof Box }> = {
  saas: { label: "SaaS", icon: Globe },
  internal: { label: "Interno", icon: Shield },
  custom: { label: "Custom", icon: Cpu },
  automation: { label: "Automação", icon: Zap },
  ai_agent: { label: "Agente IA", icon: Sparkles },
};

const ORIGIN_MAP: Record<string, string> = {
  acelera: "Acelera IT", opus: "Opus", both: "Opus + Acelera", thecorp: "TheCorp", vittaverde: "VittaVerde",
};

const DOC_CATS = ["documentation", "pricing", "presentation", "contract", "proposal", "report", "other"] as const;

const DOC_CAT_MAP: Record<string, { label: string; icon: typeof FileText; color: string; gradient: string }> = {
  documentation: { label: "Documentação", icon: FileText, color: "text-blue-500", gradient: "from-blue-500 to-blue-600" },
  pricing: { label: "Precificação", icon: FileSpreadsheet, color: "text-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
  presentation: { label: "Apresentação", icon: Presentation, color: "text-purple-500", gradient: "from-purple-500 to-purple-600" },
  contract: { label: "Contrato", icon: FileCheck, color: "text-amber-500", gradient: "from-amber-500 to-amber-600" },
  proposal: { label: "Proposta", icon: File, color: "text-cyan-500", gradient: "from-cyan-500 to-cyan-600" },
  report: { label: "Relatório", icon: FileSpreadsheet, color: "text-rose-500", gradient: "from-rose-500 to-rose-600" },
  other: { label: "Outro", icon: File, color: "text-muted-foreground", gradient: "from-gray-500 to-gray-600" },
};

function fmtSize(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function fmtDate(d: string | Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtRelative(d: string | Date | null): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return fmtDate(d);
}

function getPipelineIdx(status: string): number {
  return PIPELINE.indexOf(status);
}

function getProgress(status: string): number {
  const idx = getPipelineIdx(status);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / PIPELINE.length) * 100);
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function getFileIcon(mime: string | null, name: string) {
  if (!mime && !name) return File;
  const n = name.toLowerCase();
  if (mime?.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp)$/.test(n)) return Image;
  if (/\.(zip|rar|7z|tar|gz)$/.test(n)) return Archive;
  if (/\.(js|ts|jsx|tsx)$/.test(n)) return FileCode;
  if (/\.(py|java|go|rs|rb|php|c|cpp|h|cs)$/.test(n)) return Terminal;
  if (/\.(json)$/.test(n)) return FileJson;
  if (/\.(yaml|yml|toml|xml|env|ini|cfg)$/.test(n)) return FileCog;
  if (/\.(sql|db)$/.test(n)) return Database;
  if (/\.(pdf)$/.test(n)) return FileText;
  if (/\.(doc|docx|xls|xlsx|ppt|pptx|csv)$/.test(n)) return FileSpreadsheet;
  return File;
}

function getFileColor(mime: string | null, name: string): string {
  const n = name.toLowerCase();
  if (mime?.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp)$/.test(n)) return "from-pink-500 to-rose-500";
  if (/\.(zip|rar|7z|tar|gz)$/.test(n)) return "from-amber-500 to-orange-500";
  if (/\.(js|jsx)$/.test(n)) return "from-yellow-400 to-amber-500";
  if (/\.(ts|tsx)$/.test(n)) return "from-blue-500 to-blue-600";
  if (/\.(py)$/.test(n)) return "from-green-500 to-emerald-600";
  if (/\.(json)$/.test(n)) return "from-slate-600 to-slate-700";
  if (/\.(pdf)$/.test(n)) return "from-red-500 to-red-600";
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(n)) return "from-blue-600 to-indigo-600";
  return "from-slate-400 to-slate-500";
}

type SortField = "name" | "size" | "date";
type SortDir = "asc" | "desc";

const STORAGE_QUOTA = 3 * 1024 * 1024 * 1024;

const LANG_COLORS: Record<string, string> = {
  js: "#f1e05a", jsx: "#f1e05a", ts: "#3178c6", tsx: "#3178c6",
  py: "#3572A5", java: "#b07219", go: "#00ADD8", rs: "#dea584",
  rb: "#701516", php: "#4F5D95", c: "#555555", cpp: "#f34b7d",
  cs: "#178600", html: "#e34c26", css: "#563d7c", scss: "#c6538c",
  json: "#292929", yaml: "#cb171e", yml: "#cb171e", md: "#083fa1",
  sql: "#e38c00", sh: "#89e051", bash: "#89e051", xml: "#0060ac",
  svg: "#ff9900", png: "#a0522d", jpg: "#a0522d", jpeg: "#a0522d",
  gif: "#a0522d", webp: "#a0522d", pdf: "#db1f29",
  doc: "#2b579a", docx: "#2b579a", xls: "#217346", xlsx: "#217346",
  zip: "#6e5494", rar: "#6e5494", tar: "#6e5494", gz: "#6e5494",
  env: "#4e9a06", toml: "#9c4221", ini: "#888888", cfg: "#888888",
  other: "#6e7681",
};

function getLangColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "other";
  return LANG_COLORS[ext] || LANG_COLORS.other;
}

function RepositorySection({ appId }: { appId: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [currentFolder, setCurrentFolder] = useState("/");
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [previewFile, setPreviewFile] = useState<RepoFile | null>(null);

  const { data: files = [], isLoading } = useQuery<RepoFile[]>({
    queryKey: ["/api/apps", appId, "repo"],
    queryFn: async () => {
      const res = await fetch(`/api/apps/${appId}/repo`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileList: File[]) => {
      for (const file of fileList) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folderPath", currentFolder);
        fd.append("name", file.name);
        const res = await fetch(`/api/apps/${appId}/repo`, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "repo"] });
      toast({ title: "Arquivos enviados com sucesso" });
    },
    onError: () => toast({ title: "Erro ao enviar", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/repo/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "repo"] });
      toast({ title: "Arquivo removido" });
      setDeleteFileId(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map(id => apiRequest("DELETE", `/api/repo/${id}`)));
      const failed = results.filter(r => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} arquivo(s) falharam`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "repo"] });
      toast({ title: `${selectedFiles.size} arquivo(s) removido(s)` });
      setSelectedFiles(new Set());
      setBulkDeleteOpen(false);
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "repo"] });
      toast({ title: "Erro na exclusão em lote", description: err.message, variant: "destructive" });
      setSelectedFiles(new Set());
      setBulkDeleteOpen(false);
    },
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (fl && fl.length > 0) {
      uploadMutation.mutate(Array.from(fl));
      e.target.value = "";
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const fl = e.dataTransfer.files;
    if (fl && fl.length > 0) uploadMutation.mutate(Array.from(fl));
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const folders = [...new Set(files.map(f => f.folderPath).filter(f => f !== "/"))].sort();
  const currentFilesRaw = files
    .filter(f => f.folderPath === currentFolder)
    .filter(f => !searchTerm || f.originalName.toLowerCase().includes(searchTerm.toLowerCase()));

  const currentSorted = useMemo(() => {
    const sorted = [...currentFilesRaw];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.originalName.localeCompare(b.originalName);
      else if (sortField === "size") cmp = (a.size || 0) - (b.size || 0);
      else if (sortField === "date") cmp = new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [currentFilesRaw, sortField, sortDir]);

  const subFolders = folders.filter(f => {
    if (currentFolder === "/") return f.split("/").filter(Boolean).length === 1;
    return f.startsWith(currentFolder) && f !== currentFolder && f.replace(currentFolder, "").split("/").filter(Boolean).length === 1;
  });

  const toggleSelectAll = () => {
    if (selectedFiles.size === currentSorted.length && currentSorted.length > 0) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(currentSorted.map(f => f.id)));
  };

  const prevFolder = useRef(currentFolder);
  const prevSearch = useRef(searchTerm);
  if (prevFolder.current !== currentFolder || prevSearch.current !== searchTerm) {
    prevFolder.current = currentFolder;
    prevSearch.current = searchTerm;
    if (selectedFiles.size > 0) setSelectedFiles(new Set());
  }

  const breadcrumbs = currentFolder === "/" ? ["/"] : ["/", ...currentFolder.split("/").filter(Boolean).map((_, i, arr) => "/" + arr.slice(0, i + 1).join("/"))];
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const storagePercent = Math.min((totalSize / STORAGE_QUOTA) * 100, 100);

  const langStats = useMemo(() => {
    const map: Record<string, number> = {};
    files.forEach(f => {
      const ext = f.originalName.split(".").pop()?.toLowerCase() || "other";
      map[ext] = (map[ext] || 0) + (f.size || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([ext, bytes]) => ({ ext, bytes, pct: (bytes / total) * 100, color: LANG_COLORS[ext] || LANG_COLORS.other }));
  }, [files]);

  const latestUpload = useMemo(() => {
    if (files.length === 0) return null;
    return files.reduce((a, b) => new Date(a.uploadedAt || 0) > new Date(b.uploadedAt || 0) ? a : b);
  }, [files]);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const path = currentFolder === "/" ? `/${newFolderName.trim()}` : `${currentFolder}/${newFolderName.trim()}`;
    setCurrentFolder(path);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/25" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-muted-foreground" /> : <ArrowDown className="h-3 w-3 text-muted-foreground" />;
  };

  const isImage = (f: RepoFile) => f.mimeType?.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f.originalName);
  const isTextFile = (f: RepoFile) => /\.(js|jsx|ts|tsx|py|java|go|rs|rb|php|c|cpp|h|cs|json|yaml|yml|toml|xml|html|css|scss|md|txt|sh|bash|sql|env|ini|cfg|svg)$/i.test(f.originalName);

  return (
    <div className="flex flex-col gap-5" data-testid={`repo-section-${appId}`} ref={dropZoneRef} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>

      <div className="rounded-xl border border-border/40 overflow-hidden bg-card relative">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/[0.06] border-b border-border/30">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/40 bg-background text-sm font-semibold hover:bg-accent/50 transition-colors" data-testid="button-branch-selector">
              <GitBranch className="h-4 w-4 text-muted-foreground/60" />
              <span>main</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground/50">
              <button className="flex items-center gap-1 hover:text-foreground/70 transition-colors">
                <GitBranch className="h-3.5 w-3.5" /> <span className="font-semibold text-foreground/60">1</span> branch
              </button>
              <span className="text-muted-foreground/20">•</span>
              <button className="flex items-center gap-1 hover:text-foreground/70 transition-colors">
                <Tag className="h-3.5 w-3.5" /> <span className="font-semibold text-foreground/60">0</span> tags
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
              <Input placeholder="Ir para arquivo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8 pl-8 w-48 text-xs border-border/30 bg-background" data-testid="input-search-repo" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNewFolder(!showNewFolder)} data-testid="button-new-folder">
              <FolderPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nova pasta</span>
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} data-testid={`input-repo-file-${appId}`} />
            <Button size="sm" className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} data-testid={`button-upload-repo-${appId}`}>
              <Upload className="h-3.5 w-3.5" />
              {uploadMutation.isPending ? "Enviando..." : "Upload"}
            </Button>
          </div>
        </div>

        {showNewFolder && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-blue-500/[0.03]">
            <FolderPlus className="h-4 w-4 text-blue-500/60" />
            <Input placeholder="Nome da pasta..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === "Enter" && createFolder()} className="max-w-xs h-8 text-sm" data-testid="input-folder-name" autoFocus />
            <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={createFolder} disabled={!newFolderName.trim()} data-testid="button-create-folder">Criar</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-blue-500/20 bg-blue-500/[0.04]" data-testid="bulk-actions-bar">
            <Badge variant="secondary" className="font-mono text-[11px] h-6">{selectedFiles.size} selecionado{selectedFiles.size !== 1 ? "s" : ""}</Badge>
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs border-destructive/30 text-destructive" onClick={() => setBulkDeleteOpen(true)} data-testid="button-bulk-delete">
              <Trash2 className="h-3 w-3" /> Excluir
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedFiles(new Set())} data-testid="button-clear-selection">
              Limpar
            </Button>
          </div>
        )}

        {latestUpload && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/20 bg-muted/[0.03]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-[9px] font-black text-white">A</span>
            </div>
            <div className="flex items-center gap-2 text-xs min-w-0 flex-1">
              <span className="font-semibold text-foreground/70 shrink-0">Acelera IT</span>
              <span className="text-muted-foreground/50 truncate">
                <GitCommit className="h-3 w-3 inline mr-1 text-muted-foreground/30" />
                Upload: {latestUpload.originalName}
              </span>
            </div>
            <span className="text-xs text-muted-foreground/40 shrink-0">{fmtRelative(latestUpload.uploadedAt)}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground/40 shrink-0">
              <Clock className="h-3 w-3" />
              <span className="font-semibold text-foreground/50">{files.length}</span> commit{files.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {currentFolder !== "/" && (
          <div className="flex items-center gap-2 px-4 py-1.5 text-xs border-b border-border/15">
            {breadcrumbs.map((bc, i) => (
              <span key={bc} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/25">/</span>}
                <button
                  onClick={() => setCurrentFolder(bc)}
                  className={`px-1 py-0.5 rounded transition-colors font-semibold ${bc === currentFolder ? "text-foreground" : "text-blue-500 hover:underline"}`}
                  data-testid={`breadcrumb-${bc}`}
                >
                  {bc === "/" ? "root" : bc.split("/").pop()}
                </button>
              </span>
            ))}
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 z-50 bg-blue-500/5 backdrop-blur-sm border-2 border-dashed border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center animate-bounce">
              <UploadCloud className="h-8 w-8 text-blue-500/60" />
            </div>
            <p className="text-base font-bold text-blue-600/70">Solte os arquivos aqui</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 space-y-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-2 border-b border-border/10">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
                <div className="flex-1" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (subFolders.length === 0 && currentSorted.length === 0 && !searchTerm) ? (
          <div className="py-16 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/10 border-2 border-dashed border-border/40 flex items-center justify-center">
              <Code className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground/60">Repositório vazio</p>
              <p className="text-sm text-muted-foreground/50 mt-1 max-w-md leading-relaxed">
                Faça upload dos arquivos do seu app para mantê-los seguros e organizados.
                Arraste e solte ou use o botão Upload.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => fileInputRef.current?.click()} data-testid="button-upload-empty">
                <Upload className="h-4 w-4" /> Enviar arquivos
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowNewFolder(true)}>
                <FolderPlus className="h-4 w-4" /> Criar pasta
              </Button>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/[0.04] border border-border/20 max-w-lg w-full text-left">
              <p className="text-xs font-bold text-foreground/50 mb-2 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-500/70" /> Armazenamento seguro
              </p>
              <p className="text-[11px] text-muted-foreground/40 leading-relaxed">
                Seus arquivos são armazenados com segurança no servidor com backup automático.
                Quota de {fmtSize(STORAGE_QUOTA)} disponível por app.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {currentSorted.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border/15 bg-muted/[0.03] text-[11px] text-muted-foreground/40">
                <button onClick={toggleSelectAll} className="shrink-0" aria-label="Selecionar todos" data-testid="button-select-all">
                  {selectedFiles.size === currentSorted.length && currentSorted.length > 0 ? (
                    <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                  ) : selectedFiles.size > 0 ? (
                    <Minus className="h-3.5 w-3.5 text-blue-500/60" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-muted-foreground/20" />
                  )}
                </button>
                <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground/60 transition-colors flex-1 text-left font-semibold" data-testid="sort-name">
                  Nome <SortIcon field="name" />
                </button>
                <button onClick={() => handleSort("size")} className="flex items-center gap-1 hover:text-foreground/60 transition-colors w-16 font-semibold" data-testid="sort-size">
                  Tamanho <SortIcon field="size" />
                </button>
                <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-foreground/60 transition-colors w-24 text-right font-semibold" data-testid="sort-date">
                  Data <SortIcon field="date" />
                </button>
                <span className="w-[72px]" />
              </div>
            )}
            {subFolders.map(folder => (
              <button
                key={folder}
                onClick={() => setCurrentFolder(folder)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/[0.04] transition-colors text-left group border-b border-border/[0.08]"
                data-testid={`folder-${folder}`}
              >
                <Folder className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-sm font-medium text-blue-500 group-hover:underline flex-1 truncate">{folder.split("/").pop()}</span>
                <span className="text-xs text-muted-foreground/35">{files.filter(f => f.folderPath.startsWith(folder)).length} itens</span>
                <span className="text-xs text-muted-foreground/30">{fmtRelative(
                  files.filter(f => f.folderPath.startsWith(folder)).reduce((latest, f) =>
                    new Date(f.uploadedAt || 0) > new Date(latest) ? f.uploadedAt || "" : latest, ""
                  ) || null
                )}</span>
              </button>
            ))}
            {currentSorted.map(file => {
              const Icon = getFileIcon(file.mimeType, file.originalName);
              const isSelected = selectedFiles.has(file.id);
              const canPreview = isImage(file) || isTextFile(file);
              const dotColor = getLangColor(file.originalName);
              return (
                <div key={file.id} className={`group flex items-center gap-3 px-4 py-2 hover:bg-muted/[0.04] transition-colors border-b border-border/[0.06] ${isSelected ? "bg-blue-500/[0.03]" : ""}`} data-testid={`repo-file-${file.id}`}>
                  <button onClick={() => toggleSelect(file.id)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Selecionar ${file.originalName}`} data-testid={`checkbox-${file.id}`}>
                    {isSelected ? <CheckSquare className="h-4 w-4 text-blue-500" /> : <Square className="h-4 w-4 text-muted-foreground/25" />}
                  </button>
                  {!isSelected && <Icon className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:hidden" />}
                  <button
                    className="text-sm text-blue-500 hover:underline font-medium truncate text-left flex-1 min-w-0"
                    onClick={() => canPreview ? setPreviewFile(file) : undefined}
                    data-testid={`text-repo-file-${file.id}`}
                  >
                    {file.originalName}
                  </button>
                  <span className="text-xs text-muted-foreground/35 hidden md:block truncate max-w-[200px]">
                    <GitCommit className="h-3 w-3 inline mr-1 text-muted-foreground/20" />
                    Upload de arquivo
                  </span>
                  <span className="text-xs text-muted-foreground/35 font-mono shrink-0">{fmtSize(file.size)}</span>
                  <span className="text-xs text-muted-foreground/35 shrink-0 w-24 text-right">{fmtRelative(file.uploadedAt)}</span>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" asChild data-testid={`button-download-repo-${file.id}`}>
                            <a href={`/api/repo/${file.id}/download`} aria-label={`Baixar ${file.originalName}`}>
                              <Download className="h-3.5 w-3.5 text-muted-foreground/50" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Baixar</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setDeleteFileId(file.id)} aria-label={`Excluir ${file.originalName}`} data-testid={`button-delete-repo-${file.id}`}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive/50" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Excluir</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20 bg-muted/[0.03]">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-500/70" />
                  Armazenamento Seguro
                </h4>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground/50">{fmtSize(totalSize)} usado de {fmtSize(STORAGE_QUOTA)}</span>
                  <span className="text-xs font-semibold" style={{ color: storagePercent > 80 ? "#ef4444" : storagePercent > 50 ? "#f59e0b" : "#22c55e" }}>{storagePercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${Math.max(storagePercent, 1)}%`,
                    backgroundColor: storagePercent > 80 ? "#ef4444" : storagePercent > 50 ? "#f59e0b" : "#22c55e"
                  }} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground/40">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {files.length} arquivos</span>
                  <span className="flex items-center gap-1"><FolderArchive className="h-3 w-3" /> {folders.length + 1} pastas</span>
                </div>
              </div>
            </div>

            {langStats.length > 0 && (
              <div className="rounded-xl border border-border/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/20 bg-muted/[0.03]">
                  <h4 className="text-sm font-bold">Linguagens</h4>
                </div>
                <div className="p-4">
                  <div className="flex h-2.5 rounded-full overflow-hidden gap-[1px] mb-3" data-testid="language-bar">
                    {langStats.filter(l => l.pct >= 1).map(l => (
                      <div key={l.ext} className="h-full rounded-sm transition-all" style={{ width: `${l.pct}%`, backgroundColor: l.color }} title={`${l.ext}: ${l.pct.toFixed(1)}%`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {langStats.slice(0, 8).map(l => (
                      <span key={l.ext} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                        <span className="font-semibold text-foreground/60">.{l.ext}</span>
                        <span className="text-muted-foreground/35">{l.pct.toFixed(1)}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20 bg-muted/[0.03]">
                <h4 className="text-sm font-bold">Sobre</h4>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground/50 leading-relaxed">
                  Repositório de arquivos do aplicativo. Upload de código, documentos e assets.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                  <Lock className="h-3.5 w-3.5 text-emerald-500/60" />
                  <span>Privado · Acelera IT</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                  <Star className="h-3.5 w-3.5" />
                  <span>Backup automático</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                  <Shield className="h-3.5 w-3.5 text-emerald-500/60" />
                  <span>Criptografia em repouso</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20 bg-muted/[0.03]">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  Atividade recente
                  <Badge variant="secondary" className="text-[10px] h-5 font-mono">{Math.min(files.length, 5)}</Badge>
                </h4>
              </div>
              <div className="p-3 space-y-0">
                {files
                  .sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime())
                  .slice(0, 5)
                  .map(f => (
                    <div key={f.id} className="flex items-center gap-2.5 py-2 px-1 text-xs group rounded-md hover:bg-muted/[0.04] transition-colors">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getLangColor(f.originalName) }} />
                      <span className="font-medium text-foreground/60 truncate flex-1">{f.originalName}</span>
                      <span className="text-muted-foreground/30 shrink-0">{fmtRelative(f.uploadedAt)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreviewFile(null)} data-testid="preview-overlay">
          <div className="relative max-w-5xl max-h-[90vh] w-full bg-card rounded-xl border border-border/30 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-muted/[0.04]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getLangColor(previewFile.originalName) }} />
                <span className="text-sm font-bold truncate">{previewFile.originalName}</span>
                <Badge variant="secondary" className="text-[10px] h-5 font-mono shrink-0">{fmtSize(previewFile.size)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
                  <a href={`/api/repo/${previewFile.id}/download`}><Download className="h-3.5 w-3.5" /> Baixar</a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewFile(null)} data-testid="button-close-preview">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-auto">
              {isImage(previewFile) ? (
                <div className="flex items-center justify-center p-8 bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
                  <img src={`/api/repo/${previewFile.id}/download`} alt={previewFile.originalName} className="max-w-full max-h-[65vh] object-contain rounded shadow-lg" data-testid="preview-image" />
                </div>
              ) : (
                <div className="p-4 bg-muted/[0.02]">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-t-lg border border-border/20 border-b-0 bg-muted/[0.05] text-xs text-muted-foreground/50">
                    <Code className="h-3.5 w-3.5" />
                    <span className="font-mono">{previewFile.originalName}</span>
                    <span className="text-muted-foreground/30 ml-auto">{fmtSize(previewFile.size)}</span>
                  </div>
                  <div className="rounded-b-lg border border-border/20 bg-background p-4 font-mono text-xs text-muted-foreground/60 leading-relaxed whitespace-pre-wrap break-all min-h-[200px]" data-testid="preview-code">
                    Conteúdo do arquivo disponível para download.
                    Clique em "Baixar" para ver o arquivo completo.
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-border/15 bg-muted/[0.03] flex items-center justify-between text-[11px] text-muted-foreground/35">
              <span>{fmtDate(previewFile.uploadedAt)}</span>
              <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500/50" /> Armazenamento seguro</span>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteFileId} onOpenChange={o => !o && setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O arquivo será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-repo">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFileId && deleteMutation.mutate(deleteFileId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete-repo">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedFiles.size} arquivo{selectedFiles.size !== 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>Todos os arquivos selecionados serão removidos permanentemente. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-bulk-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkDeleteMutation.mutate([...selectedFiles])} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={bulkDeleteMutation.isPending} data-testid="button-confirm-bulk-delete">
              {bulkDeleteMutation.isPending ? "Excluindo..." : `Excluir ${selectedFiles.size}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function canPreview(mime: string | null, name: string): boolean {
  if (!mime && !name) return false;
  const n = name.toLowerCase();
  if (mime?.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(n)) return true;
  if (mime === "application/pdf" || /\.pdf$/i.test(n)) return true;
  if (mime?.startsWith("text/") || /\.(txt|md|log|csv|json|xml|yaml|yml|html|css|js|ts|jsx|tsx|py|java|go|rs|rb|php|c|cpp|h|cs|sql|sh|env|ini|cfg|toml)$/i.test(n)) return true;
  if (mime?.startsWith("video/") || /\.(mp4|webm|ogg)$/i.test(n)) return true;
  if (mime?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(n)) return true;
  return false;
}

function getPreviewType(mime: string | null, name: string): "image" | "pdf" | "text" | "video" | "audio" | "none" {
  const n = name.toLowerCase();
  if (mime?.startsWith("image/") || /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(n)) return "image";
  if (mime === "application/pdf" || /\.pdf$/i.test(n)) return "pdf";
  if (mime?.startsWith("video/") || /\.(mp4|webm|ogg)$/i.test(n)) return "video";
  if (mime?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(n)) return "audio";
  if (mime?.startsWith("text/") || /\.(txt|md|log|csv|json|xml|yaml|yml|html|css|js|ts|jsx|tsx|py|java|go|rs|rb|php|c|cpp|h|cs|sql|sh|env|ini|cfg|toml)$/i.test(n)) return "text";
  return "none";
}

function DocumentsSection({ appId }: { appId: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("documentation");
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AppDocument | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const { data: docs = [], isLoading } = useQuery<AppDocument[]>({
    queryKey: ["/api/apps", appId, "documents"],
    queryFn: async () => {
      const res = await fetch(`/api/apps/${appId}/documents`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", uploadCategory);
      fd.append("name", file.name);
      const res = await fetch(`/api/apps/${appId}/documents`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "documents"] });
      toast({ title: "Documento enviado" });
    },
    onError: () => toast({ title: "Erro ao enviar", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/documents/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "documents"] });
      toast({ title: "Documento removido" });
      setDeleteDocId(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { uploadMutation.mutate(f); e.target.value = ""; }
  };

  const openPreview = async (doc: AppDocument) => {
    setPreviewDoc(doc);
    setTextContent(null);
    const pType = getPreviewType(doc.mimeType, doc.originalName);
    if (pType === "text") {
      try {
        const res = await fetch(`/api/documents/${doc.id}/preview`);
        if (!res.ok) { setTextContent("Erro ao carregar conteúdo."); return; }
        const text = await res.text();
        setTextContent(text);
      } catch { setTextContent("Erro ao carregar conteúdo."); }
    }
  };

  const grouped = docs.reduce((acc, doc) => {
    const c = doc.category;
    if (!acc[c]) acc[c] = [];
    acc[c].push(doc);
    return acc;
  }, {} as Record<string, AppDocument[]>);

  return (
    <div className="flex flex-col gap-6" data-testid={`docs-section-${appId}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">{docs.length}</p>
            <p className="text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Documentos</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">{Object.keys(grouped).length}</p>
            <p className="text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Categorias</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight">{fmtSize(docs.reduce((s, d) => s + (d.size || 0), 0))}</p>
            <p className="text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Tamanho total</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/20 bg-gradient-to-r from-muted/30 to-transparent">
          <h3 className="text-sm font-bold flex items-center gap-2" data-testid="docs-title">
            <FileText className="h-4 w-4 text-blue-500" />
            Gerenciar Documentos
          </h3>
          <div className="flex items-center gap-2">
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="w-44 h-8 text-xs border-border/30" data-testid={`select-doc-category-${appId}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_CATS.map(cat => {
                  const ci = DOC_CAT_MAP[cat];
                  const CI = ci.icon;
                  return (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <CI className={`h-3.5 w-3.5 ${ci.color}`} />
                        {ci.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} data-testid={`input-file-${appId}`} />
            <Button size="sm" className="gap-1.5 h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md shadow-blue-500/20 border-0" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} data-testid={`button-upload-${appId}`}>
              <Upload className="h-3.5 w-3.5" />
              {uploadMutation.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : docs.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 flex items-center justify-center">
                <FileText className="h-14 w-14 text-blue-300 dark:text-blue-700" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-foreground/60">Nenhum documento</p>
              <p className="text-sm text-muted-foreground/50 mt-1.5 max-w-sm leading-relaxed">
                Selecione uma categoria e envie seus documentos
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/[0.08]">
            {Object.entries(grouped).map(([cat, catDocs]) => {
              const ci = DOC_CAT_MAP[cat] || DOC_CAT_MAP["other"];
              const CI = ci.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 px-5 py-3 bg-muted/[0.03]">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${ci.gradient} flex items-center justify-center`}>
                      <CI className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold">{ci.label}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono h-5 px-2">{catDocs.length}</Badge>
                  </div>
                  <div className="space-y-1 px-4 py-2">
                    {catDocs.map(doc => {
                      const FileIcon = getFileIcon(doc.mimeType, doc.originalName);
                      const fileColor = getFileColor(doc.mimeType, doc.originalName);
                      const previewable = canPreview(doc.mimeType, doc.originalName);
                      const ext = doc.originalName.split(".").pop()?.toUpperCase() || "";
                      return (
                        <div
                          key={doc.id}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-all ${previewable ? "cursor-pointer" : ""}`}
                          onClick={() => { if (previewable) openPreview(doc); }}
                          data-testid={`doc-row-${doc.id}`}
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${fileColor} flex items-center justify-center shrink-0`}>
                            <FileIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate" data-testid={`text-doc-name-${doc.id}`}>{doc.originalName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 py-0 border-border/30">{ext}</Badge>
                              <span className="text-[10px] text-muted-foreground/50 font-mono">{fmtSize(doc.size)}</span>
                              {doc.uploadedAt && (
                                <>
                                  <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
                                  <span className="text-[10px] text-muted-foreground/40">{fmtRelative(doc.uploadedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {previewable && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 rounded-lg" onClick={(e) => { e.stopPropagation(); openPreview(doc); }} data-testid={`button-preview-${doc.id}`}>
                                <Eye className="h-3.5 w-3.5 text-primary" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 rounded-lg" asChild data-testid={`button-download-${doc.id}`}>
                              <a href={`/api/documents/${doc.id}/download`} onClick={(e) => e.stopPropagation()} aria-label={`Baixar ${doc.originalName}`}><Download className="h-3.5 w-3.5 text-primary" /></a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 rounded-lg" onClick={(e) => { e.stopPropagation(); setDeleteDocId(doc.id); }} aria-label={`Excluir ${doc.originalName}`} data-testid={`button-delete-doc-${doc.id}`}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteDocId} onOpenChange={o => !o && setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-doc">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDocId && deleteMutation.mutate(deleteDocId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete-doc">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewDoc && (() => {
        const pType = getPreviewType(previewDoc.mimeType, previewDoc.originalName);
        const previewUrl = `/api/documents/${previewDoc.id}/preview`;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)} data-testid="preview-overlay">
            <div className="bg-background rounded-2xl shadow-2xl border border-border/30 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/20 shrink-0">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getFileColor(previewDoc.mimeType, previewDoc.originalName)} flex items-center justify-center`}>
                  {(() => { const FI = getFileIcon(previewDoc.mimeType, previewDoc.originalName); return <FI className="h-4 w-4 text-white" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" data-testid="preview-doc-name">{previewDoc.originalName}</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono">{fmtSize(previewDoc.size)} · {previewDoc.mimeType || "desconhecido"}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs rounded-lg" asChild data-testid="button-download-preview">
                  <a href={`/api/documents/${previewDoc.id}/download`}><Download className="h-3.5 w-3.5 mr-1.5" /> Baixar</a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10" onClick={() => setPreviewDoc(null)} data-testid="button-close-preview">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto bg-muted/5 flex items-center justify-center min-h-[400px]">
                {pType === "pdf" && (
                  <div className="w-full h-full min-h-[70vh] flex flex-col" data-testid="preview-pdf-container">
                    <object data={`${previewUrl}#toolbar=1&navpanes=0`} type="application/pdf" className="w-full flex-1 min-h-[65vh]">
                      <div className="flex flex-col items-center justify-center gap-4 p-8 h-full min-h-[50vh]">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">Não foi possível exibir o PDF diretamente.</p>
                        <Button variant="default" size="sm" asChild>
                          <a href={previewUrl} target="_blank" rel="noopener noreferrer" data-testid="button-open-pdf-tab">Abrir em nova aba</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/api/documents/${previewDoc.id}/download`} data-testid="button-download-pdf-fallback"><Download className="h-3.5 w-3.5 mr-1.5" /> Baixar PDF</a>
                        </Button>
                      </div>
                    </object>
                  </div>
                )}
                {pType === "image" && (
                  <img src={previewUrl} alt={previewDoc.originalName} className="max-w-full max-h-[75vh] object-contain p-4" data-testid="preview-image" />
                )}
                {pType === "video" && (
                  <video src={previewUrl} controls className="max-w-full max-h-[75vh] p-4" data-testid="preview-video" />
                )}
                {pType === "audio" && (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-sm font-semibold">{previewDoc.originalName}</p>
                    <audio src={previewUrl} controls className="w-full max-w-md" data-testid="preview-audio" />
                  </div>
                )}
                {pType === "text" && (
                  <pre className="w-full h-full min-h-[70vh] p-6 text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-auto bg-zinc-950 text-zinc-300" data-testid="preview-text">
                    {textContent === null ? "Carregando..." : textContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function AppDetailPage() {
  const [, params] = useRoute("/apps/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const appId = params?.id || "";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: app, isLoading } = useQuery<App>({ queryKey: ["/api/apps", appId], enabled: !!appId });
  const { data: clients } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: developers } = useQuery<Developer[]>({ queryKey: ["/api/developers"] });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => { const r = await apiRequest("POST", `/api/apps/${id}/toggle`); return r.json(); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId] });
      toast({ title: "Status alternado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/apps/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/apps"] }); toast({ title: "App removido" }); navigate("/apps"); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const getClient = (id: string | null) => id && clients ? clients.find(c => c.id === id)?.name || null : null;
  const getDev = (id: string | null) => id && developers ? developers.find(d => d.id === id) || null : null;

  if (isLoading) {
    return (
      <div className="animate-pulse p-8 space-y-8">
        <div className="flex gap-6 items-start">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-4 rounded-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8 p-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
            <AppWindow className="h-16 w-16 text-muted-foreground/15" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-muted-foreground/50">App não encontrado</p>
          <p className="text-base text-muted-foreground/35 mt-2">O aplicativo pode ter sido removido ou o link está incorreto</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/apps")} data-testid="button-back-apps" className="gap-2 rounded-xl px-6 h-11">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Apps
        </Button>
      </div>
    );
  }

  const sc = STATUS_CFG[app.status] || STATUS_CFG["active"];
  const ti = TYPE_MAP[app.type] || { label: app.type, icon: Box };
  const TI = ti.icon;
  const clientName = getClient(app.clientId);
  const dev = getDev(app.devResponsibleId);
  const progress = getProgress(app.status);
  const pipeIdx = getPipelineIdx(app.status);

  return (
    <div className="flex flex-col min-h-full" data-testid="page-app-detail">
      <div className="relative overflow-hidden border-b border-border/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${sc.color}12 0%, ${sc.color}06 30%, transparent 60%)` }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px]" style={{ background: `radial-gradient(circle at 80% 20%, ${sc.color}10 0%, transparent 50%)` }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px]" style={{ background: `radial-gradient(circle at 20% 80%, ${sc.color}08 0%, transparent 50%)` }} />
          <div className="absolute inset-0 backdrop-blur-3xl" />
        </div>

        <div className="relative px-8 pt-6 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground/60 hover:text-foreground h-8 px-3 rounded-lg" onClick={() => navigate("/apps")} data-testid="button-back">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Apps</span>
            </Button>
            <ChevronRight className="h-3 w-3 text-muted-foreground/25" />
            <span className="text-xs text-muted-foreground/50 font-medium">{app.name}</span>
          </div>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${sc.color}30, ${sc.color}15)`, boxShadow: `0 20px 60px ${sc.color}20, 0 8px 20px ${sc.color}10` }}>
                  <TI className="h-10 w-10" style={{ color: sc.color }} />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center ring-[3px] ring-background shadow-lg" style={{ backgroundColor: sc.color }}>
                  {app.status === "active" || app.status === "archived" ? <Check className="h-3.5 w-3.5 text-white" /> : <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black tracking-tight" data-testid="text-app-name">{app.name}</h1>
                  <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border ${sc.bgClass}`} data-testid="badge-app-status">{sc.label}</span>
                  {app.version && (
                    <code className="text-[11px] font-mono text-muted-foreground/45 bg-muted/20 px-2.5 py-1 rounded-lg border border-border/20" data-testid="text-version">v{app.version}</code>
                  )}
                </div>
                {app.description && (
                  <p className="text-sm text-muted-foreground/60 mt-2 max-w-lg leading-relaxed" data-testid="text-description">{app.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50" data-testid="text-app-meta">
                  <span className="flex items-center gap-1.5 font-medium"><TI className="h-3.5 w-3.5" /> {ti.label}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/15" />
                  <span className="font-medium">{ORIGIN_MAP[app.origin] || app.origin}</span>
                  {clientName && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/15" />
                      <span className="flex items-center gap-1.5 font-medium"><Building2 className="h-3.5 w-3.5" /> {clientName}</span>
                    </>
                  )}
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/15" />
                  <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-3.5 w-3.5" /> {fmtDate(app.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm shadow-sm rounded-xl h-9 px-4 border-border/30" onClick={() => navigate(`/apps?edit=${appId}`)} data-testid="button-edit">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm shadow-sm px-2.5 rounded-xl h-9 border-border/30" data-testid="button-more-actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => toggleMutation.mutate(app.id)} className="gap-2" data-testid="button-toggle">
                    <Power className="h-4 w-4" />{app.status === "active" ? "Desativar" : "Ativar"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="gap-2 text-destructive focus:text-destructive" data-testid="button-delete">
                    <Trash2 className="h-4 w-4" />Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Workflow className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em]">Pipeline de Desenvolvimento</span>
              </div>
              <span className="text-xs font-mono font-black" style={{ color: sc.color }} data-testid="text-pipeline-progress">{progress}%</span>
            </div>
            <div className="flex gap-1.5">
              {PIPELINE.map((s, i) => {
                const cfg = STATUS_CFG[s];
                const isCurrent = s === app.status;
                const isPast = pipeIdx > i;
                return (
                  <TooltipProvider key={s} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex flex-col gap-2 items-center cursor-default group">
                          <div className={`w-full h-2.5 rounded-full transition-all duration-700 overflow-hidden ${isCurrent ? "shadow-md ring-1 ring-white/20" : ""}`} style={isCurrent ? { backgroundColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}40` } : isPast ? { backgroundColor: `${cfg.color}60` } : { backgroundColor: "hsl(var(--muted) / 0.15)" }}>
                            {isCurrent && <div className="w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />}
                          </div>
                          <span className={`text-[9px] font-bold leading-none hidden lg:block transition-colors ${isCurrent ? "font-black" : isPast ? "text-muted-foreground/40" : "text-muted-foreground/20"}`} style={isCurrent ? { color: cfg.color } : isPast ? { color: `${cfg.color}80` } : {}}>
                            {cfg.label}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs font-semibold">
                        {cfg.label} {isCurrent ? "— Atual" : isPast ? "— Concluído" : "— Pendente"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-muted/20 dark:bg-white/[0.03] p-1.5 rounded-2xl h-auto w-auto inline-flex border border-border/20" data-testid="tabs-app">
            <TabsTrigger value="overview" className="gap-2.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-background px-6 py-3 text-sm font-semibold transition-all" data-testid="tab-overview">
              <Activity className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-background px-6 py-3 text-sm font-semibold transition-all" data-testid="tab-documents">
              <FileText className="h-4 w-4" /> Documentos
            </TabsTrigger>
            <TabsTrigger value="repository" className="gap-2.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-background px-6 py-3 text-sm font-semibold transition-all" data-testid="tab-repository">
              <Code className="h-4 w-4" /> Repositório
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {app.techStack && app.techStack.length > 0 && (
                  <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Code className="h-4 w-4 text-white" />
                        </div>
                        Tech Stack
                      </h3>
                      <Badge variant="secondary" className="text-[10px] font-mono">{app.techStack.length} tecnologias</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid="tech-stack">
                      {app.techStack.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/10 text-foreground/70 hover:border-primary/25 hover:shadow-sm transition-all cursor-default">
                          <span className="w-2 h-2 rounded-full bg-primary/50" />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(app.gitRepo || app.controlUrl) && (
                  <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-border/15 bg-gradient-to-r from-muted/20 to-transparent">
                      <h3 className="text-sm font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-300 dark:to-slate-400 flex items-center justify-center">
                          <Link2 className="h-4 w-4 text-white dark:text-slate-900" />
                        </div>
                        Links Externos
                      </h3>
                    </div>
                    <div className="divide-y divide-border/10">
                      {app.gitRepo && (
                        <a href={app.gitRepo} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-4.5 hover:bg-accent/20 transition-all group" data-testid="link-git">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-[1.03] transition-all">
                            <GitBranch className="h-6 w-6 text-white dark:text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold group-hover:text-primary transition-colors">Repositório Git</span>
                            <p className="text-xs text-muted-foreground/35 truncate mt-0.5 font-mono">{app.gitRepo}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground/15 group-hover:text-primary/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </a>
                      )}
                      {app.controlUrl && (
                        <a href={app.controlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-4.5 hover:bg-accent/20 transition-all group" data-testid="link-control">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-[1.03] transition-all">
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Painel de Controle</span>
                            <p className="text-xs text-muted-foreground/35 truncate mt-0.5 font-mono">{app.controlUrl}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground/15 group-hover:text-amber-500/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-bold flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    Pipeline Completo
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                    {PIPELINE.map((s, i) => {
                      const cfg = STATUS_CFG[s];
                      const isCurrent = s === app.status;
                      const isPast = pipeIdx > i;
                      return (
                        <div key={s} className={`flex flex-col items-center gap-2.5 p-3.5 rounded-xl transition-all border ${isCurrent ? "shadow-lg" : isPast ? "bg-primary/[0.03] border-primary/10" : "border-transparent bg-muted/[0.04] dark:bg-white/[0.01]"}`} style={isCurrent ? { borderColor: `${cfg.color}40`, backgroundColor: `${cfg.color}08`, boxShadow: `0 4px 20px ${cfg.color}15` } : {}}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={isCurrent ? { background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}10)` } : isPast ? { background: "hsl(var(--primary) / 0.06)" } : {}}>
                            {isPast ? <Check className="h-4 w-4 text-primary/50" /> : isCurrent ? <CircleDot className="h-4.5 w-4.5" style={{ color: cfg.color }} /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/10" />}
                          </div>
                          <span className={`text-[9px] font-bold leading-tight text-center ${isPast ? "text-primary/50" : !isCurrent ? "text-muted-foreground/25" : ""}`} style={isCurrent ? { color: cfg.color } : {}}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-border/15" style={{ background: `linear-gradient(135deg, ${sc.color}10, ${sc.color}04, transparent)` }}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: sc.color }}>
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <span className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-15" style={{ backgroundColor: sc.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-black" style={{ color: sc.color }}>{sc.label}</p>
                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.15em]">Status atual</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/40 mb-2.5 font-bold uppercase tracking-[0.15em]">
                        <span>Progresso</span>
                        <span className="font-mono font-black text-xs" style={{ color: sc.color }}>{progress}%</span>
                      </div>
                      <div className="h-3.5 rounded-full bg-muted/15 dark:bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${sc.color}cc, ${sc.color})` }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl bg-muted/[0.04] border border-border/10 p-3.5 text-center">
                        <p className="text-lg font-black">{pipeIdx + 1}</p>
                        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-wider">Etapa</p>
                      </div>
                      <div className="rounded-xl bg-muted/[0.04] border border-border/10 p-3.5 text-center">
                        <p className="text-lg font-black">{PIPELINE.length - pipeIdx - 1}</p>
                        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-wider">Restantes</p>
                      </div>
                    </div>
                    {app.version && (
                      <div className="pt-3 border-t border-border/10">
                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.15em] mb-2">Versão</p>
                        <code className="text-sm font-mono font-bold bg-muted/10 px-3.5 py-2 rounded-xl inline-flex items-center gap-2 border border-border/15">
                          <Hash className="h-3 w-3 text-muted-foreground/25" /> v{app.version}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {dev && (
                  <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/15 bg-gradient-to-r from-primary/[0.04] to-transparent">
                      <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.15em]">Responsável</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/8 flex items-center justify-center shadow-lg shadow-primary/8 ring-2 ring-primary/10">
                          <span className="text-xl font-black text-primary">{initials(dev.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold" data-testid="text-info-responsável">{dev.name}</p>
                          {dev.role && (
                            <p className="text-xs text-muted-foreground/45 flex items-center gap-1.5 mt-1">
                              <Briefcase className="h-3 w-3" />{dev.role}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2.5 text-xs text-muted-foreground/45">
                        {dev.email && (
                          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/20 transition-colors">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-mono truncate text-[11px]">{dev.email}</span>
                          </div>
                        )}
                        {dev.phone && (
                          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/20 transition-colors">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-mono text-[11px]">{dev.phone}</span>
                          </div>
                        )}
                      </div>
                      {dev.skills && dev.skills.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-border/10">
                          <p className="text-[10px] text-muted-foreground/35 font-bold uppercase tracking-[0.15em] mb-3">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dev.skills.slice(0, 6).map((s: string, i: number) => (
                              <span key={i} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-primary/[0.04] border border-primary/8 text-foreground/55 font-semibold">{s}</span>
                            ))}
                            {dev.skills.length > 6 && <span className="text-[10px] px-2.5 py-1.5 rounded-lg bg-muted/10 text-muted-foreground/30 font-semibold">+{dev.skills.length - 6}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentsSection appId={app.id} />
          </TabsContent>

          <TabsContent value="repository" className="mt-0">
            <RepositorySection appId={app.id} />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aplicativo?</AlertDialogTitle>
            <AlertDialogDescription>Isso vai remover o app "{app.name}" e todos os dados associados. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(app.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
