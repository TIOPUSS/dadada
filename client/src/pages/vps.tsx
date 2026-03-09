import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Server, Plus, Wifi, Terminal as TerminalIcon, Cpu, HardDrive, MemoryStick,
  Clock, Trash2, Pencil, Link2, Unlink, Activity,
  ChevronLeft, RotateCw, Eye, EyeOff, MonitorSpeaker,
  Shield, Globe, Hash, AlertTriangle, Gauge, ArrowUpRight,
  Power, PlugZap,
} from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

type VpsSafe = {
  id: string;
  name: string;
  hostname: string | null;
  ip: string;
  port: number;
  username: string;
  authType: "password" | "key";
  status: "online" | "offline" | "maintenance" | "unknown";
  os: string | null;
  notes: string | null;
  hasPassword: boolean;
  hasKey: boolean;
  createdAt: string;
};

type VpsAppLink = {
  id: string;
  vpsId: string;
  appId: string;
  createdAt: string;
};

type VpsCommandLog = {
  id: string;
  vpsId: string;
  command: string;
  output: string | null;
  exitCode: number | null;
  executedAt: string;
};

type ServerInfo = {
  hostname: string;
  os: string;
  uptime: string;
  cpu: string;
  memory: { total: string; used: string; free: string; percent: string };
  disk: { total: string; used: string; free: string; percent: string };
  loadAvg: string;
};

type App = { id: string; name: string; status: string };

const STATUS_MAP: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: "Online", color: "#22c55e", dotColor: "#22c55e" },
  offline: { label: "Offline", color: "#ef4444", dotColor: "#ef4444" },
  maintenance: { label: "Manutenção", color: "#f59e0b", dotColor: "#f59e0b" },
  unknown: { label: "Verificando...", color: "#94a3b8", dotColor: "#94a3b8" },
};

const serverFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  ip: z.string().min(1, "IP obrigatório"),
  hostname: z.string().optional(),
  port: z.coerce.number().min(1).max(65535).default(22),
  username: z.string().min(1, "Usuário obrigatório"),
  authType: z.enum(["password", "key"]).default("password"),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  notes: z.string().optional(),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

const QUICK_COMMANDS = [
  { label: "Uptime", cmd: "uptime", icon: Clock },
  { label: "Disco", cmd: "df -h", icon: HardDrive },
  { label: "Memória", cmd: "free -h", icon: MemoryStick },
  { label: "Top 10", cmd: "ps aux --sort=-%mem | head -n 11", icon: Activity },
  { label: "Docker", cmd: "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'", icon: Server },
  { label: "Logs", cmd: "journalctl -n 50 --no-pager", icon: TerminalIcon },
  { label: "Rede", cmd: "ss -tulpn", icon: Globe },
  { label: "CPU", cmd: "lscpu | grep -E 'Model name|CPU\\(s\\)|Thread'", icon: Cpu },
  { label: "PM2", cmd: "pm2 list", icon: Gauge },
];

function parsePercent(val: string): number {
  const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : Math.min(n, 100);
}

function CircularGauge({ percent, color, size = 64, strokeWidth = 5 }: { percent: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/20" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
    </svg>
  );
}

const SshTerminal = memo(function SshTerminal({ serverId, serverName, username }: { serverId: string; serverName: string; username: string }) {
  const termContainerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<string[]>([]);
  const echoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
    }
    if (echoTimerRef.current) {
      clearTimeout(echoTimerRef.current);
      echoTimerRef.current = null;
    }
    fitAddonRef.current = null;
    pendingRef.current = [];
    setConnected(false);
    setConnecting(false);
  }, []);

  const connect = useCallback(() => {
    cleanup();
    setError(null);
    setConnecting(true);

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      fontSize: 13,
      lineHeight: 1.3,
      scrollback: 1000,
      fastScrollModifier: "alt",
      fastScrollSensitivity: 5,
      smoothScrollDuration: 0,
      allowProposedApi: true,
      theme: {
        background: "#0a0a0a",
        foreground: "#d4d4d8",
        cursor: "#22c55e",
        cursorAccent: "#0a0a0a",
        selectionBackground: "#3b82f633",
        black: "#18181b",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#d4d4d8",
        brightBlack: "#52525b",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#fafafa",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    if (termContainerRef.current) {
      termContainerRef.current.innerHTML = "";
      term.open(termContainerRef.current);
      setTimeout(() => {
        fitAddon.fit();
        term.focus();
      }, 80);
    }

    term.writeln("\x1b[1;32m● Conectando ao servidor...\x1b[0m\r");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/ssh`);
    wsRef.current = ws;

    ws.onopen = () => {
      const dims = fitAddon.proposeDimensions();
      ws.send(JSON.stringify({
        type: "connect",
        serverId,
        cols: dims?.cols || 120,
        rows: dims?.rows || 30,
      }));
    };

    function stripEcho(output: string): string {
      const pending = pendingRef.current;
      if (pending.length === 0) return output;

      let consumed = 0;
      let i = 0;
      while (i < output.length && consumed < pending.length) {
        if (output[i] === pending[consumed]) {
          consumed++;
          i++;
        } else {
          break;
        }
      }

      if (consumed > 0) {
        pendingRef.current = pending.slice(consumed);
        return output.substring(i);
      }

      pendingRef.current = [];
      return output;
    }

    ws.onmessage = (evt) => {
      const raw = evt.data as string;
      if (!raw.length) return;
      const prefix = raw[0];
      const payload = raw.substring(1);
      if (prefix === "o") {
        const filtered = stripEcho(payload);
        if (filtered.length > 0) term.write(filtered);
        return;
      }
      if (prefix === "c") {
        try {
          const msg = JSON.parse(payload);
          if (msg.type === "connected") {
            setConnected(true);
            setConnecting(false);
            pendingRef.current = [];
            term.clear();
            term.focus();
          } else if (msg.type === "error") {
            setConnecting(false);
            setError(msg.data);
            term.writeln(`\r\n\x1b[1;31m✖ ${msg.data}\x1b[0m\r`);
          } else if (msg.type === "disconnected") {
            setConnected(false);
            pendingRef.current = [];
            term.writeln("\r\n\x1b[1;33m● Conexão SSH encerrada.\x1b[0m\r");
          }
        } catch {}
        return;
      }
      try {
        const msg = JSON.parse(raw);
        if (msg.type === "connected") {
          setConnected(true);
          setConnecting(false);
          pendingRef.current = [];
          term.clear();
          term.focus();
        } else if (msg.type === "output") {
          term.write(msg.data);
        } else if (msg.type === "error") {
          setConnecting(false);
          setError(msg.data);
          term.writeln(`\r\n\x1b[1;31m✖ ${msg.data}\x1b[0m\r`);
        } else if (msg.type === "disconnected") {
          setConnected(false);
          pendingRef.current = [];
          term.writeln("\r\n\x1b[1;33m● Conexão SSH encerrada.\x1b[0m\r");
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      setConnecting(false);
      pendingRef.current = [];
    };

    ws.onerror = () => {
      setConnecting(false);
      setError("Erro na conexão WebSocket");
    };

    term.onData((data) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send("i" + data);

      for (let ci = 0; ci < data.length; ci++) {
        const code = data.charCodeAt(ci);
        if (code >= 32 && code < 127) {
          term.write(data[ci]);
          pendingRef.current.push(data[ci]);
        }
      }

      if (echoTimerRef.current) clearTimeout(echoTimerRef.current);
      echoTimerRef.current = setTimeout(() => {
        pendingRef.current = [];
        echoTimerRef.current = null;
      }, 3000);
    });

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    term.onResize(({ cols, rows }) => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "resize", cols, rows }));
        }
      }, 100);
    });
  }, [serverId, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && termRef.current) {
        try { fitAddonRef.current.fit(); } catch {}
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendQuickCommand = (cmd: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && termRef.current) {
      wsRef.current.send("i" + cmd + "\n");
    }
  };

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden" data-testid="terminal-section">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900">
        <TerminalIcon className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-bold text-zinc-200">Terminal SSH</span>
        <span className="text-[10px] text-zinc-500 font-mono ml-1">
          {username}@{serverName}
        </span>
        {connected && <Badge variant="outline" className="ml-2 text-[9px] border-emerald-500/40 text-emerald-400 px-1.5 py-0">Live</Badge>}
        <div className="flex items-center gap-2 ml-auto">
          {!connected && !connecting && (
            <Button variant="ghost" size="sm" className="text-xs px-2.5 rounded-lg text-emerald-400 hover:text-emerald-300" onClick={connect} data-testid="button-connect-ssh">
              <PlugZap className="h-3.5 w-3.5 mr-1" /> Conectar
            </Button>
          )}
          {connecting && (
            <span className="text-xs text-amber-400 animate-pulse flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Conectando...
            </span>
          )}
          {connected && (
            <Button variant="ghost" size="sm" className="text-xs px-2.5 rounded-lg text-red-400 hover:text-red-300" onClick={cleanup} data-testid="button-disconnect-ssh">
              <Power className="h-3.5 w-3.5 mr-1" /> Desconectar
            </Button>
          )}
          <div className="flex gap-1.5">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-500/80" : connecting ? "bg-amber-500/80 animate-pulse" : "bg-red-500/80"}`} />
          </div>
        </div>
      </div>

      {connected && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90">
          {QUICK_COMMANDS.map((qc) => {
            const QIcon = qc.icon;
            return (
              <button
                key={qc.cmd}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/60 transition-colors flex items-center gap-1 hover:text-zinc-200 hover:border-zinc-600"
                onClick={() => sendQuickCommand(qc.cmd)}
                data-testid={`quick-cmd-${qc.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <QIcon className="h-2.5 w-2.5" />
                {qc.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={termContainerRef}
        className="bg-[#0a0a0a]"
        tabIndex={-1}
        style={{ padding: connected || connecting ? "4px" : "0", minHeight: connected || connecting ? "350px" : "0", height: connected || connecting ? "350px" : "auto" }}
        onClick={() => termRef.current?.focus()}
        data-testid="terminal-output"
      />

      {!connected && !connecting && (
        <div className="flex flex-col items-center justify-center py-16 bg-zinc-950">
          <TerminalIcon className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500 mb-1">Terminal SSH Interativo</p>
          <p className="text-xs text-zinc-600 mb-4">Clique em "Conectar" para iniciar uma sessão ao vivo</p>
          {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
          <Button variant="outline" size="sm" className="rounded-lg border-emerald-500/30 text-emerald-400 hover:text-emerald-300" onClick={connect} data-testid="button-connect-ssh-main">
            <PlugZap className="h-4 w-4 mr-2" /> Conectar ao Servidor
          </Button>
        </div>
      )}
    </Card>
  );
});

interface SftpFile {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
  permissions: string;
  owner: number;
  group: number;
}

const FILE_ICONS: Record<string, { icon: any; color: string }> = {
  folder: { icon: HardDrive, color: "from-amber-500 to-amber-600" },
  pdf: { icon: Eye, color: "from-red-500 to-red-700" },
  image: { icon: Eye, color: "from-emerald-500 to-green-600" },
  video: { icon: Eye, color: "from-purple-500 to-violet-600" },
  audio: { icon: Eye, color: "from-pink-500 to-rose-600" },
  code: { icon: TerminalIcon, color: "from-blue-500 to-indigo-600" },
  text: { icon: Eye, color: "from-slate-400 to-slate-600" },
  archive: { icon: HardDrive, color: "from-orange-500 to-amber-600" },
  default: { icon: HardDrive, color: "from-zinc-500 to-zinc-600" },
};

function getFileCategory(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(ext)) return "image";
  if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["zip", "gz", "tar", "rar", "7z", "bz2", "xz"].includes(ext)) return "archive";
  if (["js", "ts", "tsx", "jsx", "py", "sh", "bash", "rb", "go", "rs", "java", "c", "cpp", "h", "php", "sql", "css", "html", "xml"].includes(ext)) return "code";
  if (["txt", "log", "md", "conf", "cfg", "ini", "yaml", "yml", "json", "env", "toml"].includes(ext)) return "text";
  return "default";
}

function canPreviewSftp(name: string): boolean {
  const cat = getFileCategory(name);
  return ["image", "video", "audio", "pdf", "text", "code"].includes(cat);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const SftpFileBrowser = memo(function SftpFileBrowser({ serverId }: { serverId: string }) {
  const { toast } = useToast();
  const [currentPath, setCurrentPath] = useState("/");
  const [previewFile, setPreviewFile] = useState<SftpFile | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showMkdir, setShowMkdir] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading, error: listError, refetch } = useQuery<SftpFile[]>({
    queryKey: ["/api/vps", serverId, "sftp", "list", currentPath],
    queryFn: async () => {
      const res = await fetch(`/api/vps/${serverId}/sftp/list?path=${encodeURIComponent(currentPath)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro ao conectar SFTP" }));
        throw new Error(err.error || "Erro ao conectar SFTP");
      }
      return res.json();
    },
    retry: false,
    staleTime: 30000,
    enabled: true,
  });

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const goUp = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath("/" + parts.join("/"));
  };

  const pathParts = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [{ name: "/", path: "/" }];
  pathParts.forEach((part, i) => {
    breadcrumbs.push({ name: part, path: "/" + pathParts.slice(0, i + 1).join("/") });
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const destPath = currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
      formData.append("path", destPath);
      const res = await fetch(`/api/vps/${serverId}/sftp/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Arquivo enviado com sucesso" });
      refetch();
      setShowUpload(false);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao enviar arquivo", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const res = await fetch(`/api/vps/${serverId}/sftp/file?path=${encodeURIComponent(filePath)}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Arquivo excluído" });
      refetch();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  const mkdirMutation = useMutation({
    mutationFn: async (dirName: string) => {
      const dirPath = currentPath === "/" ? `/${dirName}` : `${currentPath}/${dirName}`;
      const res = await apiRequest("POST", `/api/vps/${serverId}/sftp/mkdir`, { path: dirPath });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Pasta criada" });
      setNewDirName("");
      setShowMkdir(false);
      refetch();
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar pasta", description: err.message, variant: "destructive" });
    },
  });

  const openPreview = async (file: SftpFile) => {
    const cat = getFileCategory(file.name);
    if (cat === "text" || cat === "code") {
      setTextContent(null);
      setPreviewFile(file);
      try {
        const res = await fetch(`/api/vps/${serverId}/sftp/preview?path=${encodeURIComponent(file.path)}`);
        if (res.ok) {
          const text = await res.text();
          setTextContent(text);
        } else {
          setTextContent("Erro ao carregar arquivo");
        }
      } catch {
        setTextContent("Erro ao carregar arquivo");
      }
    } else {
      setPreviewFile(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <>
      <Card className="rounded-2xl border-border/30 overflow-hidden" data-testid="sftp-section">
        <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
          <HardDrive className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold">Arquivos do Servidor</span>
          <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">(SFTP)</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button variant="ghost" size="sm" className="text-xs px-2 rounded-lg" onClick={() => setShowMkdir(true)} data-testid="button-sftp-mkdir">
              <Plus className="h-3.5 w-3.5 mr-1" /> Pasta
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2 rounded-lg text-blue-400" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} data-testid="button-sftp-upload">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Enviar
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => refetch()} data-testid="button-sftp-refresh">
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-border/20 flex items-center gap-1 overflow-x-auto">
          {breadcrumbs.map((b, i) => (
            <span key={b.path} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-muted-foreground/30 text-xs">/</span>}
              <button
                className={`text-xs px-1.5 py-0.5 rounded hover:bg-accent/30 transition-colors ${i === breadcrumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                onClick={() => navigateTo(b.path)}
                data-testid={`breadcrumb-${i}`}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>

        <div className="divide-y divide-border/10 max-h-[400px] overflow-y-auto">
          {currentPath !== "/" && (
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20 transition-colors text-left"
              onClick={goUp}
              data-testid="button-sftp-go-up"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">..</span>
            </button>
          )}

          {isLoading && (
            <div className="px-4 py-12 text-center">
              <RotateCw className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
              <p className="text-xs text-muted-foreground/40">Carregando arquivos...</p>
            </div>
          )}

          {!isLoading && listError && (
            <div className="px-4 py-10 text-center">
              <AlertTriangle className="h-6 w-6 text-amber-500/60 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/60 mb-2">{(listError as Error).message}</p>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => refetch()} data-testid="button-sftp-retry">
                <RotateCw className="h-3 w-3 mr-1" /> Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !listError && files.length === 0 && (
            <div className="px-4 py-12 text-center">
              <HardDrive className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/40">Pasta vazia</p>
            </div>
          )}

          {files.map((file) => {
            const cat = file.isDirectory ? "folder" : getFileCategory(file.name);
            const iconInfo = FILE_ICONS[cat] || FILE_ICONS.default;
            const FileIcon = iconInfo.icon;
            const previewable = !file.isDirectory && canPreviewSftp(file.name);
            const ext = file.name.split(".").pop()?.toUpperCase() || "";

            return (
              <div
                key={file.path}
                className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20 transition-colors ${file.isDirectory || previewable ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (file.isDirectory) navigateTo(file.path);
                  else if (previewable) openPreview(file);
                }}
                data-testid={`sftp-file-${file.name}`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconInfo.color} flex items-center justify-center shrink-0`}>
                  <FileIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {!file.isDirectory && (
                      <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 py-0 border-border/30">{ext}</Badge>
                    )}
                    {file.isDirectory ? (
                      <span className="text-[10px] text-muted-foreground/50">Pasta</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{formatFileSize(file.size)}</span>
                    )}
                    <span className="text-[9px] text-muted-foreground/30 font-mono">{file.permissions}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {previewable && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); openPreview(file); }} data-testid={`button-sftp-preview-${file.name}`}>
                      <Eye className="h-3.5 w-3.5 text-primary" />
                    </Button>
                  )}
                  {!file.isDirectory && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10" asChild data-testid={`button-sftp-download-${file.name}`}>
                      <a href={`/api/vps/${serverId}/sftp/download?path=${encodeURIComponent(file.path)}`} onClick={(e) => e.stopPropagation()}>
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary rotate-180" />
                      </a>
                    </Button>
                  )}
                  {!file.isDirectory && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10" onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Excluir "${file.name}"?`)) deleteMutation.mutate(file.path);
                    }} data-testid={`button-sftp-delete-${file.name}`}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showMkdir && (
        <Dialog open={showMkdir} onOpenChange={setShowMkdir}>
          <DialogContent className="sm:max-w-[360px] rounded-2xl" data-testid="dialog-sftp-mkdir">
            <DialogHeader>
              <DialogTitle>Nova Pasta</DialogTitle>
              <DialogDescription>Criar pasta em: {currentPath}</DialogDescription>
            </DialogHeader>
            <Input
              value={newDirName}
              onChange={(e) => setNewDirName(e.target.value)}
              placeholder="Nome da pasta"
              data-testid="input-sftp-dirname"
            />
            <Button
              disabled={!newDirName || mkdirMutation.isPending}
              onClick={() => mkdirMutation.mutate(newDirName)}
              className="rounded-xl"
              data-testid="button-sftp-mkdir-confirm"
            >
              {mkdirMutation.isPending ? "Criando..." : "Criar Pasta"}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {previewFile && (() => {
        const cat = getFileCategory(previewFile.name);
        const previewUrl = `/api/vps/${serverId}/sftp/preview?path=${encodeURIComponent(previewFile.path)}`;
        const downloadUrl = `/api/vps/${serverId}/sftp/download?path=${encodeURIComponent(previewFile.path)}`;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setPreviewFile(null); setTextContent(null); }} data-testid="sftp-preview-overlay">
            <div className="bg-background rounded-2xl shadow-2xl border border-border/30 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/20 shrink-0">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${(FILE_ICONS[cat] || FILE_ICONS.default).color} flex items-center justify-center`}>
                  {(() => { const FI = (FILE_ICONS[cat] || FILE_ICONS.default).icon; return <FI className="h-4 w-4 text-white" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" data-testid="sftp-preview-name">{previewFile.name}</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono">{formatFileSize(previewFile.size)} · {previewFile.path}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs rounded-lg" asChild>
                  <a href={downloadUrl}><ArrowUpRight className="h-3.5 w-3.5 mr-1.5 rotate-180" /> Baixar</a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10" onClick={() => { setPreviewFile(null); setTextContent(null); }} data-testid="button-sftp-close-preview">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto bg-muted/5 flex items-center justify-center min-h-[400px]">
                {cat === "pdf" && (
                  <div className="w-full h-full min-h-[70vh] flex flex-col">
                    <object data={`${previewUrl}#toolbar=1`} type="application/pdf" className="w-full flex-1 min-h-[65vh]">
                      <div className="flex flex-col items-center justify-center gap-4 p-8 h-full min-h-[50vh]">
                        <p className="text-sm text-muted-foreground">Não foi possível exibir o PDF.</p>
                        <Button variant="default" size="sm" asChild>
                          <a href={previewUrl} target="_blank" rel="noopener noreferrer">Abrir em nova aba</a>
                        </Button>
                      </div>
                    </object>
                  </div>
                )}
                {cat === "image" && (
                  <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[75vh] object-contain p-4" data-testid="sftp-preview-image" />
                )}
                {cat === "video" && (
                  <video src={previewUrl} controls className="max-w-full max-h-[75vh] p-4" data-testid="sftp-preview-video" />
                )}
                {cat === "audio" && (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <p className="text-sm font-semibold">{previewFile.name}</p>
                    <audio src={previewUrl} controls className="w-full max-w-md" data-testid="sftp-preview-audio" />
                  </div>
                )}
                {(cat === "text" || cat === "code") && (
                  <pre className="w-full h-full min-h-[70vh] p-6 text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-auto bg-zinc-950" data-testid="sftp-preview-text">
                    {textContent === null ? "Carregando..." : textContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
});

export default function VpsPage() {
  const { toast } = useToast();
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<VpsSafe | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [linkAppDialogOpen, setLinkAppDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");

  const { data: servers = [], isLoading } = useQuery<VpsSafe[]>({ queryKey: ["/api/vps"] });
  const { data: allApps = [] } = useQuery<App[]>({ queryKey: ["/api/apps"] });

  const selectedServer = servers.find((s) => s.id === selectedServerId);

  const { data: serverInfo, isLoading: loadingInfo, refetch: refetchInfo } = useQuery<ServerInfo>({
    queryKey: ["/api/vps", selectedServerId, "info"],
    enabled: !!selectedServerId,
    retry: false,
    staleTime: 30000,
  });

  const { data: appLinks = [], refetch: refetchLinks } = useQuery<VpsAppLink[]>({
    queryKey: ["/api/vps", selectedServerId, "apps"],
    enabled: !!selectedServerId,
  });

  const { data: commandLogs = [] } = useQuery<VpsCommandLog[]>({
    queryKey: ["/api/vps", selectedServerId, "logs"],
    enabled: !!selectedServerId,
  });

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: { name: "", ip: "", hostname: "", port: 22, username: "root", authType: "password", password: "", privateKey: "", notes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: ServerFormValues) => apiRequest("POST", "/api/vps", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vps"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Servidor criado com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro ao criar", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ServerFormValues & { id: string }) => {
      const { password, privateKey, ...rest } = data;
      const payload: any = { ...rest };
      if (password && password.length > 0) payload.password = password;
      if (privateKey && privateKey.length > 0) payload.privateKey = privateKey;
      return apiRequest("PUT", `/api/vps/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vps"] });
      setDialogOpen(false);
      setEditingServer(null);
      form.reset();
      toast({ title: "Servidor atualizado" });
    },
    onError: (e: any) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vps/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vps"] });
      if (selectedServerId) setSelectedServerId(null);
      toast({ title: "Servidor removido" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/vps/${id}/test`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vps"] });
      toast({ title: data.connected ? "Conexão OK" : "Falha na conexão", description: data.error, variant: data.connected ? "default" : "destructive" });
    },
  });

  const monitorAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/vps/monitor-all");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Verificando todos os servidores...", description: "O status será atualizado em instantes." });
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["/api/vps"] }), 15000);
    },
  });

  const linkAppMutation = useMutation({
    mutationFn: async ({ vpsId, appId }: { vpsId: string; appId: string }) => {
      return apiRequest("POST", `/api/vps/${vpsId}/apps`, { appId });
    },
    onSuccess: () => {
      refetchLinks();
      setLinkAppDialogOpen(false);
      setSelectedAppId("");
      toast({ title: "App vinculado" });
    },
  });

  const unlinkAppMutation = useMutation({
    mutationFn: async ({ vpsId, linkId }: { vpsId: string; linkId: string }) => {
      return apiRequest("DELETE", `/api/vps/${vpsId}/apps/${linkId}`);
    },
    onSuccess: () => {
      refetchLinks();
      toast({ title: "App desvinculado" });
    },
  });

  function openCreate() {
    setEditingServer(null);
    form.reset({ name: "", ip: "", hostname: "", port: 22, username: "root", authType: "password", password: "", privateKey: "", notes: "" });
    setDialogOpen(true);
    setShowPassword(false);
  }

  function openEdit(s: VpsSafe) {
    setEditingServer(s);
    form.reset({
      name: s.name,
      ip: s.ip,
      hostname: s.hostname || "",
      port: s.port,
      username: s.username,
      authType: s.authType,
      password: "",
      privateKey: "",
      notes: s.notes || "",
    });
    setDialogOpen(true);
    setShowPassword(false);
  }

  function onSubmit(values: ServerFormValues) {
    if (editingServer) {
      updateMutation.mutate({ ...values, id: editingServer.id });
    } else {
      createMutation.mutate(values);
    }
  }

  function openServer(id: string) {
    setSelectedServerId(id);
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const linkedAppIds = new Set(appLinks.map((l) => l.appId));
  const availableApps = allApps.filter((a) => !linkedAppIds.has(a.id));

  if (selectedServer) {
    const st = STATUS_MAP[selectedServer.status] || STATUS_MAP.unknown;
    const memPercent = serverInfo ? parsePercent(serverInfo.memory.percent) : 0;
    const diskPercent = serverInfo ? parsePercent(serverInfo.disk.percent) : 0;

    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 border-b border-border/30 bg-card/50">
          <div className="px-6 py-4 flex items-center gap-4 flex-wrap justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1.5" onClick={() => setSelectedServerId(null)} data-testid="button-back-to-list">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </Button>
              <div className="w-px h-8 bg-border/30" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                  <Server className="h-6 w-6 text-blue-500" />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center"
                  style={{ background: st.dotColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black leading-tight tracking-tight truncate" data-testid="text-server-name">
                    {selectedServer.name}
                  </h2>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      color: st.color,
                      background: `${st.color}12`,
                      border: `1px solid ${st.color}25`,
                    }}
                    data-testid="badge-server-status"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${selectedServer.status === "online" ? "animate-pulse" : ""}`}
                      style={{ background: st.dotColor }}
                    />
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{selectedServer.ip}:{selectedServer.port}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="font-mono">{selectedServer.username}@</span>
                  {selectedServer.os && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-muted-foreground/60">{selectedServer.os}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => testMutation.mutate(selectedServer.id)} disabled={testMutation.isPending} data-testid="button-test-connection">
                <Wifi className="h-3.5 w-3.5" />
                {testMutation.isPending ? "Testando..." : "Testar"}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => refetchInfo()} disabled={loadingInfo} data-testid="button-refresh-info">
                <RotateCw className={`h-3.5 w-3.5 ${loadingInfo ? "animate-spin" : ""}`} />
                Info
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => openEdit(selectedServer)} data-testid="button-edit-server">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-6">
              {serverInfo && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="server-info-cards">
                  <Card className="rounded-2xl border-border/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <CircularGauge percent={0} color="#3b82f6" size={52} strokeWidth={4} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Cpu className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">CPU</div>
                        <div className="text-lg font-black leading-tight" data-testid="info-cpu">{serverInfo.cpu}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">Load: {serverInfo.loadAvg}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <CircularGauge percent={memPercent} color={memPercent > 80 ? "#ef4444" : memPercent > 60 ? "#f59e0b" : "#8b5cf6"} size={52} strokeWidth={4} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-black" style={{ color: memPercent > 80 ? "#ef4444" : memPercent > 60 ? "#f59e0b" : "#8b5cf6" }}>
                            {memPercent}%
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Memória</div>
                        <div className="text-lg font-black leading-tight" data-testid="info-memory">{serverInfo.memory.percent}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">{serverInfo.memory.used} / {serverInfo.memory.total}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <CircularGauge percent={diskPercent} color={diskPercent > 80 ? "#ef4444" : diskPercent > 60 ? "#f59e0b" : "#f59e0b"} size={52} strokeWidth={4} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-black" style={{ color: diskPercent > 80 ? "#ef4444" : "#f59e0b" }}>
                            {diskPercent}%
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Disco</div>
                        <div className="text-lg font-black leading-tight" data-testid="info-disk">{serverInfo.disk.percent}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">{serverInfo.disk.used} / {serverInfo.disk.total}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <CircularGauge percent={100} color="#22c55e" size={52} strokeWidth={4} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-emerald-500" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Uptime</div>
                        <div className="text-sm font-bold leading-tight" data-testid="info-uptime">{serverInfo.uptime.replace("up ", "")}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">{serverInfo.os}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {loadingInfo && !serverInfo && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl border-border/30">
                      <CardContent className="p-4 h-20 animate-pulse bg-muted/20" />
                    </Card>
                  ))}
                </div>
              )}

              <SshTerminal serverId={selectedServer.id} serverName={selectedServer.hostname || selectedServer.name} username={selectedServer.username} />

              <SftpFileBrowser serverId={selectedServer.id} />

              {commandLogs.length > 0 && (
                <Card className="rounded-2xl border-border/30 overflow-hidden" data-testid="command-history">
                  <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Histórico de Comandos</span>
                    <span className="text-[10px] text-muted-foreground/40 ml-auto font-mono">{commandLogs.length} registros</span>
                  </div>
                  <div className="divide-y divide-border/10 max-h-[250px] overflow-y-auto">
                    {commandLogs.slice(0, 20).map((log) => (
                      <div key={log.id} className="px-4 py-2.5 flex items-start gap-3 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.exitCode === 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-foreground/80 break-all">{log.command}</span>
                          <div className="text-muted-foreground/40 mt-0.5">
                            {new Date(log.executedAt).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <span className={`shrink-0 text-[9px] font-mono ${log.exitCode === 0 ? "text-emerald-500/50" : "text-red-400/50"}`}>
                          exit {log.exitCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Card className="rounded-2xl border-border/30 overflow-hidden" data-testid="linked-apps-section">
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold">Apps Conectados</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-xs px-2 rounded-lg" onClick={() => setLinkAppDialogOpen(true)} data-testid="button-link-app">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Vincular
                  </Button>
                </div>
                <div className="divide-y divide-border/10">
                  {appLinks.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <MonitorSpeaker className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground/40">Nenhum app vinculado</p>
                    </div>
                  )}
                  {appLinks.map((link) => {
                    const app = allApps.find((a) => a.id === link.appId);
                    return (
                      <div key={link.id} className="px-4 py-3 flex items-center gap-3" data-testid={`linked-app-${link.id}`}>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <MonitorSpeaker className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold truncate block">{app?.name || link.appId}</span>
                          {app && <span className="text-[10px] text-muted-foreground/50 uppercase font-medium">{app.status}</span>}
                        </div>
                        <button
                          className="text-muted-foreground/30 p-1.5 rounded-lg transition-colors"
                          onClick={() => unlinkAppMutation.mutate({ vpsId: selectedServer.id, linkId: link.id })}
                          data-testid={`button-unlink-${link.id}`}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="rounded-2xl border-border/30 overflow-hidden" data-testid="server-details">
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">Detalhes do Servidor</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  <DetailRow label="IP" value={selectedServer.ip} icon={Globe} mono />
                  <DetailRow label="Porta SSH" value={String(selectedServer.port)} icon={Hash} mono />
                  <DetailRow label="Usuário" value={selectedServer.username} icon={Activity} mono />
                  <DetailRow label="Auth" value={selectedServer.authType === "key" ? "Chave SSH" : "Senha"} icon={Shield} />
                  {selectedServer.os && <DetailRow label="SO" value={selectedServer.os} icon={Server} />}
                  {selectedServer.hostname && <DetailRow label="Hostname" value={selectedServer.hostname} icon={Globe} mono />}
                  {selectedServer.notes && (
                    <div className="pt-3 border-t border-border/20">
                      <div className="text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-wider font-bold">Observações</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{selectedServer.notes}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border/20">
                    <Button variant="destructive" size="sm" className="w-full rounded-xl gap-1.5" onClick={() => {
                      if (confirm("Remover este servidor?")) deleteMutation.mutate(selectedServer.id);
                    }} data-testid="button-delete-server">
                      <Trash2 className="h-3.5 w-3.5" /> Remover Servidor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={linkAppDialogOpen} onOpenChange={setLinkAppDialogOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl" data-testid="dialog-link-app">
            <DialogHeader>
              <DialogTitle>Vincular App</DialogTitle>
              <DialogDescription>Selecione um app para vincular a este servidor.</DialogDescription>
            </DialogHeader>
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="rounded-xl" data-testid="select-link-app">
                <SelectValue placeholder="Selecione um app" />
              </SelectTrigger>
              <SelectContent>
                {availableApps.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedAppId || linkAppMutation.isPending}
              className="rounded-xl"
              onClick={() => { if (selectedAppId && selectedServerId) linkAppMutation.mutate({ vpsId: selectedServerId, appId: selectedAppId }); }}
              data-testid="button-confirm-link"
            >
              {linkAppMutation.isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </DialogContent>
        </Dialog>

        {renderServerDialog()}
      </div>
    );
  }

  function renderServerDialog() {
    const watchAuthType = form.watch("authType");
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-2xl overflow-hidden" data-testid="dialog-server-form">
          <div className="px-6 pt-5 pb-4 border-b border-border/30 bg-gradient-to-br from-blue-500/5 to-transparent">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Server className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold" data-testid="text-dialog-server-title">
                    {editingServer ? "Editar Servidor" : "Novo Servidor"}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {editingServer ? "Atualize os dados do servidor" : "Configure o acesso SSH"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
              <div className="overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: "calc(80vh - 160px)" }}>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nome</FormLabel>
                    <FormControl><Input {...field} placeholder="Produção API" className="rounded-lg" data-testid="input-server-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="ip" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">IP / Host</FormLabel>
                      <FormControl><Input {...field} placeholder="192.168.1.100" className="font-mono rounded-lg" data-testid="input-server-ip" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="port" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Porta</FormLabel>
                      <FormControl><Input {...field} type="number" className="font-mono rounded-lg" data-testid="input-server-port" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="hostname" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Hostname <span className="text-muted-foreground/30 font-normal normal-case tracking-normal">(opcional)</span>
                    </FormLabel>
                    <FormControl><Input {...field} placeholder="srv-prod-01" className="font-mono rounded-lg" data-testid="input-server-hostname" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="h-px bg-border/30" />

                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Usuário SSH</FormLabel>
                    <FormControl><Input {...field} placeholder="root" className="font-mono rounded-lg" data-testid="input-server-username" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="authType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Método de Autenticação</FormLabel>
                    <div className="flex gap-2">
                      <button type="button"
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${field.value === "password"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-sm"
                          : "border-border/30 text-muted-foreground/50"
                        }`}
                        onClick={() => field.onChange("password")}
                        data-testid="auth-type-password"
                      >
                        Senha
                      </button>
                      <button type="button"
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${field.value === "key"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-sm"
                          : "border-border/30 text-muted-foreground/50"
                        }`}
                        onClick={() => field.onChange("key")}
                        data-testid="auth-type-key"
                      >
                        Chave SSH
                      </button>
                    </div>
                  </FormItem>
                )} />

                {watchAuthType === "password" && (
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Senha SSH
                        {editingServer?.hasPassword && <span className="text-emerald-500 ml-1">(salva)</span>}
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input {...field} type={showPassword ? "text" : "password"} placeholder={editingServer?.hasPassword ? "••••••• (manter atual)" : "Digite a senha"}
                            className="font-mono pr-10 rounded-lg" data-testid="input-server-password" />
                        </FormControl>
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {watchAuthType === "key" && (
                  <FormField control={form.control} name="privateKey" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Chave Privada SSH
                        {editingServer?.hasKey && <span className="text-emerald-500 ml-1">(salva)</span>}
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4}
                          placeholder={editingServer?.hasKey ? "Manter chave atual (deixe vazio)" : "-----BEGIN OPENSSH PRIVATE KEY-----\n..."}
                          className="font-mono text-xs resize-none rounded-lg" data-testid="input-server-privatekey" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <div className="h-px bg-border/30" />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Observações <span className="text-muted-foreground/30 font-normal normal-case tracking-normal">(opcional)</span>
                    </FormLabel>
                    <FormControl><Textarea {...field} rows={2} placeholder="Notas sobre este servidor..." className="resize-none rounded-lg" data-testid="input-server-notes" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="px-6 py-3.5 border-t border-border/30 bg-muted/20 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={() => setDialogOpen(false)} data-testid="button-cancel-server">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isMutating} className="min-w-[120px] rounded-xl" data-testid="button-save-server">
                  {isMutating ? "Salvando..." : editingServer ? "Salvar" : "Criar Servidor"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-vps">
      <Card className="relative overflow-hidden rounded-2xl border-border/30 bg-gradient-to-br from-card via-card to-blue-500/[0.03]">
        <CardContent className="p-6">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" data-testid="text-page-title">Servidores VPS</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Gerencie e acesse seus servidores remotamente via SSH</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5"
                onClick={() => monitorAllMutation.mutate()}
                disabled={monitorAllMutation.isPending}
                data-testid="button-monitor-all"
              >
                <RotateCw className={`h-4 w-4 ${monitorAllMutation.isPending ? "animate-spin" : ""}`} />
                Verificar Todas
              </Button>
              <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={openCreate} data-testid="button-add-server">
                <Plus className="h-4 w-4" /> Novo Servidor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border-border/30">
              <CardContent className="p-5 h-36 animate-pulse bg-muted/10" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && servers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
            <Server className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold text-muted-foreground/60">Nenhum servidor cadastrado</h3>
          <p className="text-sm text-muted-foreground/40 mt-1 max-w-sm">
            Adicione seus servidores VPS para monitorar e executar comandos remotamente.
          </p>
          <Button size="sm" className="mt-4 rounded-xl gap-1.5" onClick={openCreate} data-testid="button-add-first-server">
            <Plus className="h-4 w-4" /> Adicionar Servidor
          </Button>
        </div>
      )}

      {!isLoading && servers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((s) => {
            const st = STATUS_MAP[s.status] || STATUS_MAP.unknown;
            return (
              <Card
                key={s.id}
                className="group cursor-pointer rounded-2xl border-border/30 transition-all shadow-sm"
                onClick={() => openServer(s.id)}
                data-testid={`card-server-${s.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Server className="h-5 w-5 text-blue-500/70" />
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card"
                        style={{ background: st.dotColor }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 justify-between">
                        <h3 className="text-sm font-bold truncate">{s.name}</h3>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{s.ip}:{s.port}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        color: st.color,
                        background: `${st.color}12`,
                        border: `1px solid ${st.color}25`,
                      }}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono">{s.username}@</span>
                    {s.os && (
                      <span className="text-[10px] text-muted-foreground/30 truncate">{s.os}</span>
                    )}
                  </div>
                  {s.notes && (
                    <p className="text-xs text-muted-foreground/40 mt-2.5 line-clamp-1">{s.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {renderServerDialog()}
    </div>
  );
}

function DetailRow({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: typeof Activity }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs py-1">
      <span className="text-muted-foreground/50 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className={`font-medium text-foreground/80 ${mono ? "font-mono" : ""} truncate max-w-[200px]`}>{value}</span>
    </div>
  );
}
