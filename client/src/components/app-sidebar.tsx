import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import aceLeraLogoDark from "@assets/image_1772718663407.png";
import aceLeraLogoLight from "@assets/ChatGPT_Image_7_de_mar._de_2026,_17_44_00_1772916244658.png";
import {
  LayoutDashboard,
  AppWindow,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Kanban,
  Code2,
  UserCog,
  Target,
  FileCheck,
  Monitor,
  ChevronRight,
  Activity,
  Settings,
  Server,
  Bell,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Leads", url: "/leads", icon: Target },
      { title: "Propostas", url: "/proposals", icon: FileCheck },
    ],
  },
  {
    label: "Operações",
    items: [
      { title: "Apps", url: "/apps", icon: AppWindow },
      { title: "Clientes", url: "/clients", icon: Users },
      { title: "Contratos", url: "/contracts", icon: FileText },
      { title: "Pagamentos", url: "/payments", icon: CreditCard },
      { title: "Financeiro", url: "/financial", icon: BarChart3 },
    ],
  },
  {
    label: "Desenvolvimento",
    items: [
      { title: "Kanban", url: "/kanban", icon: Kanban },
      { title: "Esteira Dev", url: "/developers", icon: Code2 },
      { title: "Desenvolvedores", url: "/dev-team", icon: UserCog },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Servidores VPS", url: "/vps", icon: Server },
      { title: "Health Monitor", url: "/health", icon: Activity },
      { title: "Monitoramento", url: "/control", icon: Monitor },
      { title: "Permissões", url: "/permissions", icon: Shield },
      { title: "Configurações", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme } = useTheme();

  const { data: alertsData } = useQuery<{ id: string; status: string }[]>({
    queryKey: ["/api/monitoring/alerts"],
    refetchInterval: 30000,
  });
  const unresolvedCount = alertsData?.filter((a) => a.status === "firing").length || 0;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex flex-col items-start">
              <img
                src={aceLeraLogoDark}
                alt="Acelera IT"
                className={`object-contain w-[170px] ${theme === "dark" ? "block" : "hidden"}`}
              />
              <img
                src={aceLeraLogoLight}
                alt="Acelera IT"
                className={`object-contain w-[170px] ${theme === "dark" ? "hidden" : "block"}`}
              />
              {theme === "dark" && (
                <span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground/40 font-semibold mt-0.5 ml-0.5">
                  Business Hub
                </span>
              )}
            </div>
          </Link>
          <Link href="/control" data-testid="link-notifications">
            <div className="relative p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unresolvedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white" data-testid="badge-alert-count">
                  {unresolvedCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-1 px-3">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="pb-0.5">
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 dark:text-muted-foreground/35 font-semibold px-3 mb-0.5 pb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className={
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary rounded-r-lg rounded-l-none ml-0 relative"
                            : "text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-muted/30 transition-all duration-200 rounded-lg ml-0.5"
                        }
                      >
                        <Link href={item.url} data-testid={`link-${item.url.replace("/", "") || "dashboard"}`}>
                          <item.icon className={`w-4 h-4 ${isActive ? "drop-shadow-[0_0_6px_hsl(217,91%,55%,0.6)]" : ""}`} />
                          <span className="text-[13px]">{item.title}</span>
                          {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/40" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 mx-3 mb-3 glass-inset">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xs font-bold text-white">FL</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-sidebar glow-dot text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-foreground/90">Felipe Lacerda</p>
            <p className="text-[10px] text-muted-foreground/60 dark:text-muted-foreground/50">Administrador</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
