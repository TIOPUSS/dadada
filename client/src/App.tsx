import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Apps from "@/pages/apps";
import Clients from "@/pages/clients";
import Contracts from "@/pages/contracts";
import Payments from "@/pages/payments";
import Financial from "@/pages/financial";
import KanbanPage from "@/pages/kanban";
import Developers from "@/pages/developers";
import Leads from "@/pages/leads";
import Proposals from "@/pages/proposals";
import Control from "@/pages/control";
import Health from "@/pages/health";
import SettingsPage from "@/pages/settings";
import DevTeam from "@/pages/dev-team";
import AppDetail from "@/pages/app-detail";
import VpsPage from "@/pages/vps";
import PermissionsPage from "@/pages/permissions";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle" className="rounded-lg w-8 h-8 text-muted-foreground/60 hover:text-foreground transition-colors duration-200">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/apps" component={Apps} />
      <Route path="/apps/:id" component={AppDetail} />
      <Route path="/clients" component={Clients} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/payments" component={Payments} />
      <Route path="/financial" component={Financial} />
      <Route path="/kanban" component={KanbanPage} />
      <Route path="/developers" component={Developers} />
      <Route path="/leads" component={Leads} />
      <Route path="/proposals" component={Proposals} />
      <Route path="/control" component={Control} />
      <Route path="/health" component={Health} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/dev-team" component={DevTeam} />
      <Route path="/vps" component={VpsPage} />
      <Route path="/permissions" component={PermissionsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function AppLayout() {
  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 h-12 shrink-0 border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground/50 hover:text-foreground" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppLayout />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
