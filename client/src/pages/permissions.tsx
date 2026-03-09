import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type NodeTypes,
  type Connection,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  RefreshCw,
  Plus,
  Users,
  Trash2,
  Edit3,
  X,
  LayoutDashboard,
  Target,
  FileCheck,
  AppWindow,
  FileText,
  Terminal,
  CreditCard,
  BarChart3,
  Kanban,
  Code2,
  UserCog,
  Server,
  Activity,
  Monitor,
  Settings,
  Plug,
  Sparkles,
  Tag,
  Bell,
  ChevronRight,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PermissionRole, PermissionAction } from "@shared/schema";
import { SYSTEM_MODULES } from "@shared/schema";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Target, FileCheck, AppWindow, FileText, Terminal,
  Users, CreditCard, BarChart3, Kanban, Code2, UserCog, Server,
  Activity, Monitor, Shield, Settings, Plug, Sparkles, Tag, Bell,
};

const ACTION_LABELS: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  export: "Exportar",
  execute: "Executar",
  send: "Enviar",
  upload: "Upload",
  download: "Download",
  move: "Mover",
  ssh: "SSH",
  manage_databases: "Gerenciar BDs",
  configure: "Configurar",
  manage_alerts: "Gerenciar Alertas",
  manage_roles: "Gerenciar Grupos",
  assign_users: "Atribuir Usuários",
  assign_role: "Atribuir Grupo",
};

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6b7280",
];

interface RoleWithDetails extends PermissionRole {
  permissions: Array<{ moduleKey: string; permissions: Record<string, boolean> }>;
  usersCount: number;
}

interface PermMapData {
  roles: RoleWithDetails[];
  modules: typeof SYSTEM_MODULES;
  users: Array<{ id: string; name: string; username: string; roleId: string | null }>;
}

const POSITIONS_KEY = "acelera-permissions-positions-v3";

function savePositions(nodes: Node[]) {
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n) => {
    if (n.type === "roleNode" || n.type === "moduleGroupNode") {
      positions[n.id] = n.position;
    }
  });
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

function loadPositions(): Record<string, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function RoleNode({ data }: { data: any }) {
  const role: RoleWithDetails = data.role;
  const isSelected: boolean = data.isSelected;

  return (
    <div
      className={`relative rounded-2xl border-2 bg-card/95 backdrop-blur-sm shadow-xl min-w-[220px] max-w-[260px] transition-all ${isSelected ? "ring-2 ring-white/30" : ""}`}
      style={{ borderColor: `${role.color}80` }}
      data-testid={`node-role-${role.id}`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-background !-top-1.5" style={{ backgroundColor: role.color }} />

      <div
        className="px-4 py-2 border-b rounded-t-2xl"
        style={{
          background: `linear-gradient(135deg, ${role.color}40, ${role.color}10)`,
          borderColor: `${role.color}30`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: role.color }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: role.color }}>
              Grupo
            </span>
          </div>
          {role.isSystem && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-400">
              Sistema
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-bold truncate">{role.name}</p>
        {role.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{role.description}</p>
        )}
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" /> Usuários
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: `${role.color}40` }}>
            {role.usersCount}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground">Nível</span>
          <span className="text-[10px] font-mono">{role.level}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-background !-bottom-1.5" style={{ backgroundColor: role.color }} />
    </div>
  );
}

function ModuleNode({ data }: { data: any }) {
  const mod = data.module;
  const permCount: number = data.permCount;
  const totalActions: number = data.totalActions;
  const IconComp = ICON_MAP[mod.icon] || Shield;

  const hasPerms = permCount > 0;

  return (
    <div
      className="relative rounded-xl border bg-card/90 backdrop-blur-sm shadow-md min-w-[180px] max-w-[220px]"
      style={{ borderColor: hasPerms ? "#22c55e40" : "#6b728040" }}
      data-testid={`node-module-${mod.key}`}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-background !-left-1" />

      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${hasPerms ? "bg-emerald-500/15" : "bg-muted/30"}`}>
            <IconComp className={`w-3 h-3 ${hasPerms ? "text-emerald-400" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{mod.label}</p>
            <p className="text-[9px] text-muted-foreground">{mod.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {mod.actions.map((action: string) => {
            const isActive = data.activeActions?.includes(action);
            return (
              <div
                key={action}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? "#22c55e" : "#6b728050" }}
                title={`${ACTION_LABELS[action] || action}: ${isActive ? "Sim" : "Não"}`}
              />
            );
          })}
          <span className="text-[9px] text-muted-foreground ml-1">{permCount}/{totalActions}</span>
        </div>
      </div>
    </div>
  );
}

function ModuleGroupNode({ data }: { data: any }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5 backdrop-blur-sm"
      style={{ width: data.width || 240, height: data.height || 200 }}
      data-testid={`node-group-${data.category}`}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background !-left-1.5" />
      <div className="px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {data.category}
        </span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  roleNode: RoleNode,
  moduleNode: ModuleNode,
  moduleGroupNode: ModuleGroupNode,
};

function buildGraph(data: PermMapData, selectedRoleId: string | null) {
  const saved = loadPositions();
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const sortedRoles = [...data.roles].sort((a, b) => a.level - b.level);

  sortedRoles.forEach((role, i) => {
    const id = `role-${role.id}`;
    nodes.push({
      id,
      type: "roleNode",
      position: saved[id] || { x: 50, y: 50 + i * 200 },
      data: { role, isSelected: role.id === selectedRoleId },
    });

    if (role.parentRoleId) {
      edges.push({
        id: `edge-role-inherit-${role.id}`,
        source: `role-${role.parentRoleId}`,
        target: id,
        type: "smoothstep",
        animated: false,
        label: "herança",
        labelStyle: { fontSize: 9, fill: "#a78bfa" },
        style: { stroke: "#a78bfa", strokeWidth: 1.5, strokeDasharray: "6 3", opacity: 0.6 },
      });
    }
  });

  const categories = Array.from(new Set(SYSTEM_MODULES.map((m) => m.category)));
  const MODULE_START_X = 500;
  const CATEGORY_SPACING = 280;
  const MODULE_SPACING = 75;
  const GROUP_PADDING = 45;

  const selectedRole = selectedRoleId ? data.roles.find((r) => r.id === selectedRoleId) : null;
  const selectedPerms = selectedRole?.permissions || [];

  categories.forEach((cat, catIdx) => {
    const catModules = SYSTEM_MODULES.filter((m) => m.category === cat);
    const groupX = MODULE_START_X + catIdx * CATEGORY_SPACING;
    const groupY = 20;
    const groupHeight = GROUP_PADDING + catModules.length * MODULE_SPACING + 25;

    const groupId = `group-${cat}`;
    nodes.push({
      id: groupId,
      type: "moduleGroupNode",
      position: saved[groupId] || { x: groupX, y: groupY },
      data: { category: cat, width: 250, height: groupHeight },
      draggable: true,
      selectable: false,
    });

    catModules.forEach((mod, modIdx) => {
      const modId = `module-${mod.key}`;
      const rolePerm = selectedPerms.find((p) => p.moduleKey === mod.key);
      const activeActions = rolePerm
        ? Object.entries(rolePerm.permissions).filter(([, v]) => v).map(([k]) => k)
        : [];

      nodes.push({
        id: modId,
        type: "moduleNode",
        parentId: groupId,
        draggable: false,
        position: { x: 15, y: GROUP_PADDING + modIdx * MODULE_SPACING },
        data: {
          module: mod,
          permCount: activeActions.length,
          totalActions: mod.actions.length,
          activeActions,
        },
      });

    });

    if (selectedRole) {
      const catHasPerms = catModules.some((mod) => {
        const rolePerm = selectedPerms.find((p) => p.moduleKey === mod.key);
        return rolePerm && Object.values(rolePerm.permissions).some((v) => v);
      });
      edges.push({
        id: `edge-role-group-${selectedRole.id}-${cat}`,
        source: `role-${selectedRole.id}`,
        target: groupId,
        type: "smoothstep",
        animated: catHasPerms,
        style: {
          stroke: catHasPerms ? selectedRole.color || "#22c55e" : "#6b728040",
          strokeWidth: catHasPerms ? 1.5 : 1,
          opacity: catHasPerms ? 0.5 : 0.15,
        },
      });
    }
  });

  return { nodes, edges };
}

export default function Permissions() {
  const { toast } = useToast();
  const { data: mapData, isLoading, refetch } = useQuery<PermMapData>({
    queryKey: ["/api/permissions/map"],
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [initialized, setInitialized] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithDetails | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", color: "#6366f1", parentRoleId: "", level: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserAssign, setShowUserAssign] = useState(false);

  const selectedRole = useMemo(() => {
    if (!mapData || !selectedRoleId) return null;
    return mapData.roles.find((r) => r.id === selectedRoleId) || null;
  }, [mapData, selectedRoleId]);

  const parentRole = useMemo(() => {
    if (!mapData || !selectedRole?.parentRoleId) return null;
    return mapData.roles.find((r) => r.id === selectedRole.parentRoleId) || null;
  }, [mapData, selectedRole]);

  const parentPerms = useMemo(() => {
    if (!parentRole) return {};
    const result: Record<string, Record<string, boolean>> = {};
    parentRole.permissions.forEach((p) => {
      result[p.moduleKey] = p.permissions;
    });
    return result;
  }, [parentRole]);

  const roleUsers = useMemo(() => {
    if (!mapData || !selectedRoleId) return [];
    return mapData.users.filter((u) => u.roleId === selectedRoleId);
  }, [mapData, selectedRoleId]);

  const unassignedUsers = useMemo(() => {
    if (!mapData) return [];
    return mapData.users.filter((u) => !u.roleId || u.roleId !== selectedRoleId);
  }, [mapData, selectedRoleId]);

  useEffect(() => {
    if (mapData && !initialized) {
      const { nodes: n, edges: e } = buildGraph(mapData, selectedRoleId);
      setNodes(n);
      setEdges(e);
      setInitialized(true);
    }
  }, [mapData, initialized]);

  useEffect(() => {
    if (mapData && initialized) {
      const { nodes: newNodes, edges: newEdges } = buildGraph(mapData, selectedRoleId);
      setEdges(newEdges);
      setNodes((prev) =>
        prev.map((node) => {
          const updated = newNodes.find((n) => n.id === node.id);
          if (updated) {
            return { ...node, data: updated.data };
          }
          return node;
        })
      );
      const newNodeIds = newNodes.map((n) => n.id);
      const existingIds = new Set(nodes.map((n) => n.id));
      const toAdd = newNodes.filter((n) => !existingIds.has(n.id));
      if (toAdd.length > 0) {
        setNodes((prev) => [...prev, ...toAdd]);
      }
    }
  }, [mapData, selectedRoleId, initialized]);

  const onNodeDragStop = useCallback(() => { savePositions(nodes); }, [nodes]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === "roleNode") {
      const role = (node.data as any).role;
      setSelectedRoleId((prev) => prev === role.id ? null : role.id);
    }
    if (node.type === "moduleGroupNode" || node.type === "moduleNode") {
      if (!selectedRoleId && mapData?.roles.length) {
        setSelectedRoleId(mapData.roles[0].id);
      }
    }
  }, [selectedRoleId, mapData]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const sourceId = connection.source;
    if (sourceId.startsWith("role-")) {
      const roleId = sourceId.replace("role-", "");
      setSelectedRoleId(roleId);
    }
  }, []);

  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/permissions/roles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/map"] });
      setShowRoleDialog(false);
      toast({ title: "Grupo criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar grupo", description: err.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/permissions/roles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/map"] });
      setShowRoleDialog(false);
      setEditingRole(null);
      toast({ title: "Grupo atualizado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar grupo", description: err.message, variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/permissions/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/map"] });
      setSelectedRoleId(null);
      setShowDeleteConfirm(false);
      setShowRoleDialog(false);
      setEditingRole(null);
      toast({ title: "Grupo excluído com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir grupo", description: err.message, variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, entries }: { roleId: string; entries: any[] }) => {
      await apiRequest("PUT", `/api/permissions/roles/${roleId}/permissions`, { entries });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/map"] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao salvar permissões", description: err.message, variant: "destructive" });
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string | null }) => {
      await apiRequest("PATCH", `/api/users/${userId}/role`, { roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/map"] });
      toast({ title: "Usuário atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atribuir usuário", description: err.message, variant: "destructive" });
    },
  });

  const handleTogglePermission = useCallback((moduleKey: string, action: string, currentValue: boolean) => {
    if (!selectedRole) return;

    const currentPerms = selectedRole.permissions.map((p) => ({
      moduleKey: p.moduleKey,
      permissions: { ...p.permissions },
    }));

    const existing = currentPerms.find((p) => p.moduleKey === moduleKey);
    if (existing) {
      existing.permissions[action] = !currentValue;
    } else {
      currentPerms.push({
        moduleKey,
        permissions: { [action]: true },
      });
    }

    updatePermissionsMutation.mutate({
      roleId: selectedRole.id,
      entries: currentPerms,
    });
  }, [selectedRole, updatePermissionsMutation]);

  const openCreateDialog = () => {
    setEditingRole(null);
    setRoleForm({ name: "", description: "", color: "#6366f1", parentRoleId: "", level: 0 });
    setShowRoleDialog(true);
  };

  const openEditDialog = (role: RoleWithDetails) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      color: role.color,
      parentRoleId: role.parentRoleId || "",
      level: role.level,
    });
    setShowRoleDialog(true);
  };

  const handleSaveRole = () => {
    const payload = {
      name: roleForm.name,
      description: roleForm.description || null,
      color: roleForm.color,
      level: roleForm.level,
      parentRoleId: roleForm.parentRoleId || null,
      isSystem: false,
    };

    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: payload });
    } else {
      createRoleMutation.mutate(payload);
    }
  };

  const stats = useMemo(() => {
    if (!mapData) return { totalRoles: 0, totalUsers: 0 };
    return {
      totalRoles: mapData.roles.length,
      totalUsers: mapData.users.filter((u) => u.roleId).length,
    };
  }, [mapData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="page-permissions">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  const categories = Array.from(new Set(SYSTEM_MODULES.map((m) => m.category)));

  return (
    <div className="flex h-[calc(100vh-4rem)]" data-testid="page-permissions">
      <div
        className="flex-1 rounded-xl border border-border/30 overflow-hidden relative"
        style={{ background: "hsl(var(--background))" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
          connectOnClick={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.08)" />
          <Controls
            className="!bg-card !border-border/30 !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border/30 [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          />
          <MiniMap
            className="!bg-card/90 !border-border/30 !rounded-lg"
            nodeColor={(n) => {
              if (n.type === "roleNode") return (n.data as any)?.role?.color || "#6366f1";
              if (n.type === "moduleNode") return "#22c55e";
              return "#6b728050";
            }}
            maskColor="hsl(var(--background) / 0.8)"
          />

          <Panel position="top-left" className="!m-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold">Mapa de Permissões</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreateDialog}
                className="bg-card/95 border-border/30 shadow-lg backdrop-blur-sm"
                data-testid="button-add-role"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar Grupo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setInitialized(false); refetch(); }}
                className="bg-card/95 border-border/30 shadow-lg backdrop-blur-sm"
                data-testid="button-refresh-permissions"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Atualizar
              </Button>
            </div>
          </Panel>

          <Panel position="top-right" className="!m-3">
            <div className="flex flex-col gap-2" data-testid="panel-permissions-stats">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium">Grupos</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {stats.totalRoles}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium">Atribuídos</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {stats.totalUsers}
                </Badge>
              </div>
            </div>
          </Panel>

          <Panel position="bottom-left" className="!m-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/95 border border-border/30 shadow-lg backdrop-blur-sm text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/50" />
                Grupo
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                Módulo
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 rounded" style={{ borderTop: "2px dashed #a78bfa" }} />
                Herança
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {selectedRoleId && selectedRole && (
        <div
          className="w-[360px] flex-shrink-0 bg-card border-l border-border/30 shadow-2xl flex flex-col"
          data-testid="panel-role-sidebar"
        >
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedRole.color }} />
              <span className="text-sm font-bold truncate">{selectedRole.name}</span>
              {selectedRole.isSystem && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-400 flex-shrink-0">
                  Sistema
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(selectedRole)}
                data-testid="button-edit-role"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRoleId(null)}
                data-testid="button-close-sidebar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedRole.description && (
            <div className="px-4 py-2 border-b border-border/20">
              <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {categories.map((cat) => {
                const catModules = SYSTEM_MODULES.filter((m) => m.category === cat);
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{cat}</span>
                    </div>
                    <div className="space-y-2">
                      {catModules.map((mod) => {
                        const IconComp = ICON_MAP[mod.icon] || Shield;
                        const rolePerm = selectedRole.permissions.find((p) => p.moduleKey === mod.key);
                        const parentModPerm = parentPerms[mod.key] || {};

                        return (
                          <div key={mod.key} className="rounded-lg border border-border/20 bg-muted/10 p-3" data-testid={`permissions-module-${mod.key}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <IconComp className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-semibold">{mod.label}</span>
                            </div>
                            <div className="space-y-1.5">
                              {mod.actions.map((action) => {
                                const currentVal = rolePerm?.permissions?.[action] === true;
                                const inheritedVal = parentModPerm[action] === true;
                                const isInherited = !currentVal && inheritedVal;

                                return (
                                  <div key={action} className={`flex items-center justify-between gap-2 ${isInherited ? "opacity-60" : ""}`}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px]">{ACTION_LABELS[action] || action}</span>
                                      {isInherited && (
                                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-purple-500/30 text-purple-400">
                                          Herdado
                                        </Badge>
                                      )}
                                    </div>
                                    <Switch
                                      checked={currentVal || isInherited}
                                      onCheckedChange={() => handleTogglePermission(mod.key, action, currentVal)}
                                      disabled={isInherited}
                                      data-testid={`switch-${mod.key}-${action}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Usuários ({roleUsers.length})
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserAssign(true)}
                    data-testid="button-manage-users"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Gerenciar
                  </Button>
                </div>
                <div className="space-y-1">
                  {roleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/10 border border-border/20"
                      data-testid={`user-item-${user.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{user.name || user.username}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => assignUserMutation.mutate({ userId: user.id, roleId: null })}
                        data-testid={`button-remove-user-${user.id}`}
                      >
                        <UserMinus className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  ))}
                  {roleUsers.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum usuário atribuído</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent data-testid="dialog-role-form">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Nome</label>
              <Input
                value={roleForm.name}
                onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome do grupo"
                data-testid="input-role-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Descrição</label>
              <Input
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descrição opcional"
                data-testid="input-role-description"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Cor</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-md border-2 transition-all ${roleForm.color === color ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setRoleForm((f) => ({ ...f, color }))}
                    data-testid={`color-${color}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Nível</label>
              <Input
                type="number"
                value={roleForm.level}
                onChange={(e) => setRoleForm((f) => ({ ...f, level: parseInt(e.target.value) || 0 }))}
                data-testid="input-role-level"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Grupo Pai</label>
              <Select
                value={roleForm.parentRoleId || "none"}
                onValueChange={(v) => setRoleForm((f) => ({ ...f, parentRoleId: v === "none" ? "" : v }))}
              >
                <SelectTrigger data-testid="select-parent-role">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {mapData?.roles
                    .filter((r) => r.id !== editingRole?.id)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between gap-2">
            {editingRole && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="button-delete-role"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowRoleDialog(false)} data-testid="button-cancel-role">
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRole}
                disabled={!roleForm.name || createRoleMutation.isPending || updateRoleMutation.isPending}
                data-testid="button-save-role"
              >
                {editingRole ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o grupo "{editingRole?.name}"? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} data-testid="button-cancel-delete">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => editingRole && deleteRoleMutation.mutate(editingRole.id)}
              disabled={deleteRoleMutation.isPending}
              data-testid="button-confirm-delete"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserAssign} onOpenChange={setShowUserAssign}>
        <DialogContent className="max-w-md" data-testid="dialog-user-assign">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuários - {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1">
              {unassignedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/20"
                  data-testid={`assign-user-${user.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{user.name || user.username}</p>
                    <p className="text-[10px] text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedRoleId && assignUserMutation.mutate({ userId: user.id, roleId: selectedRoleId })}
                    data-testid={`button-assign-user-${user.id}`}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Atribuir
                  </Button>
                </div>
              ))}
              {unassignedUsers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Todos os usuários já estão atribuídos</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
