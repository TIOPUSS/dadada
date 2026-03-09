import bcrypt from "bcryptjs";
import { 
  type Client, type InsertClient,
  type App, type InsertApp,
  type Developer, type InsertDeveloper,
  type Contract, type InsertContract,
  type Payment, type InsertPayment,
  type KanbanTask, type InsertKanbanTask,
  type FinancialEntry, type InsertFinancialEntry,
  type Lead, type InsertLead,
  type Proposal, type InsertProposal,
  type User, type InsertUser,
  type Integration, type InsertIntegration,
  type AppDocument, type InsertAppDocument,
  type RepoFile, type InsertRepoFile,
  type TagConfig, type InsertTagConfig,
  type VpsServer, type InsertVpsServer,
  type VpsAppLink, type InsertVpsAppLink,
  type VpsCommandLog, type InsertVpsCommandLog,
  type AiConfig, type InsertAiConfig,
  type AppChecklist, type InsertAppChecklist,
  type AppNote, type InsertAppNote,
  type VpsDatabase, type InsertVpsDatabase,
  type VpsDbAppLink, type InsertVpsDbAppLink,
  type Origin, type InsertOrigin,
  type AppClient, type InsertAppClient,
  type ClientType, type InsertClientType,
  type VpsMetric, type InsertVpsMetric,
  type AppMonitor, type InsertAppMonitor,
  type AppMetric, type InsertAppMetric,
  type DbMetric, type InsertDbMetric,
  type AlertRule, type InsertAlertRule,
  type AlertDestination, type InsertAlertDestination,
  type AlertHistory, type InsertAlertHistory,
  type MonitoringConfig, type InsertMonitoringConfig,
  type PermissionRole, type InsertPermissionRole,
  type RolePermission, type InsertRolePermission,
  type PermissionMap,
  clients, apps, developers, contracts, payments,
  kanbanTasks, financialEntries, leads, proposals, users, integrations,
  appDocuments, repoFiles, tagConfigs,
  vpsServers, vpsAppLinks, vpsCommandLogs, aiConfigs,
  appChecklists, appNotes, vpsDatabases, vpsDbAppLinks, origins,
  appClients, clientTypes,
  vpsMetrics, appMonitors, appMetrics, dbMetrics,
  alertRules, alertDestinations, alertHistory, monitoringConfig,
  permissionRoles, rolePermissions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, isNull } from "drizzle-orm";

export interface IStorage {
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getApps(): Promise<App[]>;
  getApp(id: string): Promise<App | undefined>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: string, app: Partial<InsertApp>): Promise<App | undefined>;
  deleteApp(id: string): Promise<boolean>;
  toggleAppStatus(id: string): Promise<App | undefined>;

  getDevelopers(): Promise<Developer[]>;
  getDeveloper(id: string): Promise<Developer | undefined>;
  createDeveloper(dev: InsertDeveloper): Promise<Developer>;
  updateDeveloper(id: string, dev: Partial<InsertDeveloper>): Promise<Developer | undefined>;
  deleteDeveloper(id: string): Promise<boolean>;

  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;

  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  getKanbanTasks(): Promise<KanbanTask[]>;
  getKanbanTask(id: string): Promise<KanbanTask | undefined>;
  createKanbanTask(task: InsertKanbanTask): Promise<KanbanTask>;
  updateKanbanTask(id: string, task: Partial<InsertKanbanTask>): Promise<KanbanTask | undefined>;
  deleteKanbanTask(id: string): Promise<boolean>;
  updateKanbanTaskStatus(id: string, status: string): Promise<KanbanTask | undefined>;

  getFinancialEntries(): Promise<FinancialEntry[]>;
  getFinancialEntry(id: string): Promise<FinancialEntry | undefined>;
  createFinancialEntry(entry: InsertFinancialEntry): Promise<FinancialEntry>;
  updateFinancialEntry(id: string, entry: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined>;
  deleteFinancialEntry(id: string): Promise<boolean>;

  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<boolean>;

  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  getAppDocuments(appId: string): Promise<AppDocument[]>;
  createAppDocument(doc: InsertAppDocument): Promise<AppDocument>;
  deleteAppDocument(id: string): Promise<boolean>;
  getAppDocument(id: string): Promise<AppDocument | undefined>;

  getRepoFiles(appId: string): Promise<RepoFile[]>;
  createRepoFile(file: InsertRepoFile): Promise<RepoFile>;
  deleteRepoFile(id: string): Promise<boolean>;
  getRepoFile(id: string): Promise<RepoFile | undefined>;
  renameRepoFile(id: string, name: string): Promise<RepoFile | undefined>;

  getTagConfigs(): Promise<TagConfig[]>;
  createTagConfig(config: InsertTagConfig): Promise<TagConfig>;
  updateTagConfig(id: string, config: Partial<InsertTagConfig>): Promise<TagConfig | undefined>;
  deleteTagConfig(id: string): Promise<boolean>;

  getDashboardStats(): Promise<any>;

  getVpsServers(): Promise<VpsServer[]>;
  getVpsServer(id: string): Promise<VpsServer | undefined>;
  createVpsServer(server: InsertVpsServer): Promise<VpsServer>;
  updateVpsServer(id: string, server: Partial<InsertVpsServer>): Promise<VpsServer | undefined>;
  deleteVpsServer(id: string): Promise<boolean>;

  getVpsAppLinks(vpsId: string): Promise<VpsAppLink[]>;
  getAllVpsAppLinks(): Promise<VpsAppLink[]>;
  createVpsAppLink(link: InsertVpsAppLink): Promise<VpsAppLink>;
  deleteVpsAppLink(id: string): Promise<boolean>;

  getVpsCommandLogs(vpsId: string): Promise<VpsCommandLog[]>;
  createVpsCommandLog(log: InsertVpsCommandLog): Promise<VpsCommandLog>;

  getAiConfigs(): Promise<AiConfig[]>;
  getAiConfig(id: string): Promise<AiConfig | undefined>;
  createAiConfig(config: InsertAiConfig): Promise<AiConfig>;
  updateAiConfig(id: string, config: Partial<InsertAiConfig>): Promise<AiConfig | undefined>;
  deleteAiConfig(id: string): Promise<boolean>;

  getAppChecklists(appId: string): Promise<AppChecklist[]>;
  createAppChecklist(item: InsertAppChecklist): Promise<AppChecklist>;
  updateAppChecklist(id: string, data: Partial<InsertAppChecklist>): Promise<AppChecklist | undefined>;
  deleteAppChecklist(id: string): Promise<boolean>;

  getAppNotes(appId: string): Promise<AppNote[]>;
  createAppNote(note: InsertAppNote): Promise<AppNote>;
  deleteAppNote(id: string): Promise<boolean>;

  getVpsDatabases(vpsId: string): Promise<VpsDatabase[]>;
  getAllVpsDatabases(): Promise<VpsDatabase[]>;
  createVpsDatabase(data: InsertVpsDatabase): Promise<VpsDatabase>;
  updateVpsDatabase(id: string, data: Partial<InsertVpsDatabase>): Promise<VpsDatabase | undefined>;
  deleteVpsDatabase(id: string): Promise<boolean>;

  getVpsDbAppLinks(databaseId: string): Promise<VpsDbAppLink[]>;
  getAllVpsDbAppLinks(): Promise<VpsDbAppLink[]>;
  createVpsDbAppLink(data: InsertVpsDbAppLink): Promise<VpsDbAppLink>;

  deleteVpsDbAppLink(id: string): Promise<boolean>;

  getOrigins(): Promise<Origin[]>;
  getOrigin(id: string): Promise<Origin | undefined>;
  createOrigin(origin: InsertOrigin): Promise<Origin>;
  updateOrigin(id: string, origin: Partial<InsertOrigin>): Promise<Origin | undefined>;
  deleteOrigin(id: string): Promise<boolean>;

  getAppClients(appId: string): Promise<AppClient[]>;
  getAllAppClients(): Promise<AppClient[]>;
  createAppClient(data: InsertAppClient): Promise<AppClient>;
  deleteAppClient(id: string): Promise<boolean>;

  getClientTypes(): Promise<ClientType[]>;
  getClientType(id: string): Promise<ClientType | undefined>;
  createClientType(data: InsertClientType): Promise<ClientType>;
  updateClientType(id: string, data: Partial<InsertClientType>): Promise<ClientType | undefined>;
  deleteClientType(id: string): Promise<boolean>;

  createVpsMetric(data: InsertVpsMetric): Promise<VpsMetric>;
  getVpsMetrics(vpsId: string, from: Date, to: Date): Promise<VpsMetric[]>;
  getLatestVpsMetric(vpsId: string): Promise<VpsMetric | undefined>;
  deleteVpsMetricsOlderThan(date: Date): Promise<number>;

  getAppMonitors(): Promise<AppMonitor[]>;
  getAppMonitor(id: string): Promise<AppMonitor | undefined>;
  createAppMonitor(data: InsertAppMonitor): Promise<AppMonitor>;
  updateAppMonitor(id: string, data: Partial<InsertAppMonitor>): Promise<AppMonitor | undefined>;
  deleteAppMonitor(id: string): Promise<boolean>;

  createAppMetric(data: InsertAppMetric): Promise<AppMetric>;
  getAppMetrics(monitorId: string, from: Date, to: Date): Promise<AppMetric[]>;
  getLatestAppMetric(monitorId: string): Promise<AppMetric | undefined>;

  createDbMetric(data: InsertDbMetric): Promise<DbMetric>;
  getDbMetrics(databaseId: string, from: Date, to: Date): Promise<DbMetric[]>;
  getLatestDbMetric(databaseId: string): Promise<DbMetric | undefined>;

  getAlertRules(): Promise<AlertRule[]>;
  getEnabledAlertRules(): Promise<AlertRule[]>;
  getAlertRule(id: string): Promise<AlertRule | undefined>;
  createAlertRule(data: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: string, data: Partial<InsertAlertRule>): Promise<AlertRule | undefined>;
  deleteAlertRule(id: string): Promise<boolean>;

  getAlertDestinations(): Promise<AlertDestination[]>;
  getEnabledAlertDestinations(): Promise<AlertDestination[]>;
  createAlertDestination(data: InsertAlertDestination): Promise<AlertDestination>;
  updateAlertDestination(id: string, data: Partial<InsertAlertDestination>): Promise<AlertDestination | undefined>;
  deleteAlertDestination(id: string): Promise<boolean>;

  getAlertHistory(limit?: number): Promise<AlertHistory[]>;
  getUnresolvedAlerts(): Promise<AlertHistory[]>;
  createAlertHistory(data: InsertAlertHistory): Promise<AlertHistory>;
  resolveAlert(id: string): Promise<AlertHistory | undefined>;

  getMonitoringConfig(): Promise<MonitoringConfig[]>;
  getMonitoringConfigValue(key: string): Promise<string | undefined>;
  setMonitoringConfig(key: string, value: string): Promise<MonitoringConfig>;

  getPermissionRoles(): Promise<PermissionRole[]>;
  getPermissionRole(id: string): Promise<PermissionRole | undefined>;
  createPermissionRole(data: InsertPermissionRole): Promise<PermissionRole>;
  updatePermissionRole(id: string, data: Partial<InsertPermissionRole>): Promise<PermissionRole | undefined>;
  deletePermissionRole(id: string): Promise<boolean>;
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  setRolePermissions(roleId: string, moduleKey: string, perms: PermissionMap): Promise<RolePermission>;
  bulkSetRolePermissions(roleId: string, entries: { moduleKey: string; permissions: PermissionMap }[]): Promise<RolePermission[]>;
  deleteRolePermissions(roleId: string, moduleKey: string): Promise<boolean>;
  getUsersCountByRole(roleId: string): Promise<number>;
  updateUserRole(userId: string, roleId: string | null): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> { return db.select().from(clients); }
  async getClient(id: string): Promise<Client | undefined> {
    const [row] = await db.select().from(clients).where(eq(clients.id, id));
    return row;
  }
  async createClient(data: InsertClient): Promise<Client> {
    const [row] = await db.insert(clients).values(data).returning();
    return row;
  }
  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [row] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
    return row;
  }
  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  async getApps(): Promise<App[]> { return db.select().from(apps); }
  async getApp(id: string): Promise<App | undefined> {
    const [row] = await db.select().from(apps).where(eq(apps.id, id));
    return row;
  }
  async createApp(data: InsertApp): Promise<App> {
    const [row] = await db.insert(apps).values(data).returning();
    return row;
  }
  async updateApp(id: string, data: Partial<InsertApp>): Promise<App | undefined> {
    const [row] = await db.update(apps).set(data).where(eq(apps.id, id)).returning();
    return row;
  }
  async deleteApp(id: string): Promise<boolean> {
    const result = await db.delete(apps).where(eq(apps.id, id)).returning();
    return result.length > 0;
  }
  async toggleAppStatus(id: string): Promise<App | undefined> {
    const app = await this.getApp(id);
    if (!app) return undefined;
    const newStatus = app.status === "active" ? "disabled" : "active";
    return this.updateApp(id, { status: newStatus as any });
  }

  async getDevelopers(): Promise<Developer[]> { return db.select().from(developers); }
  async getDeveloper(id: string): Promise<Developer | undefined> {
    const [row] = await db.select().from(developers).where(eq(developers.id, id));
    return row;
  }
  async createDeveloper(data: InsertDeveloper): Promise<Developer> {
    const [row] = await db.insert(developers).values(data).returning();
    return row;
  }
  async updateDeveloper(id: string, data: Partial<InsertDeveloper>): Promise<Developer | undefined> {
    const [row] = await db.update(developers).set(data).where(eq(developers.id, id)).returning();
    return row;
  }
  async deleteDeveloper(id: string): Promise<boolean> {
    const result = await db.delete(developers).where(eq(developers.id, id)).returning();
    return result.length > 0;
  }

  async getContracts(): Promise<Contract[]> { return db.select().from(contracts); }
  async getContract(id: string): Promise<Contract | undefined> {
    const [row] = await db.select().from(contracts).where(eq(contracts.id, id));
    return row;
  }
  async createContract(data: InsertContract): Promise<Contract> {
    const [row] = await db.insert(contracts).values(data).returning();
    return row;
  }
  async updateContract(id: string, data: Partial<InsertContract>): Promise<Contract | undefined> {
    const [row] = await db.update(contracts).set(data).where(eq(contracts.id, id)).returning();
    return row;
  }
  async deleteContract(id: string): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id)).returning();
    return result.length > 0;
  }

  async getPayments(): Promise<Payment[]> { return db.select().from(payments); }
  async getPayment(id: string): Promise<Payment | undefined> {
    const [row] = await db.select().from(payments).where(eq(payments.id, id));
    return row;
  }
  async createPayment(data: InsertPayment): Promise<Payment> {
    const [row] = await db.insert(payments).values(data).returning();
    return row;
  }
  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [row] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return row;
  }
  async deletePayment(id: string): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }

  async getKanbanTasks(): Promise<KanbanTask[]> { return db.select().from(kanbanTasks); }
  async getKanbanTask(id: string): Promise<KanbanTask | undefined> {
    const [row] = await db.select().from(kanbanTasks).where(eq(kanbanTasks.id, id));
    return row;
  }
  async createKanbanTask(data: InsertKanbanTask): Promise<KanbanTask> {
    const [row] = await db.insert(kanbanTasks).values(data).returning();
    return row;
  }
  async updateKanbanTask(id: string, data: Partial<InsertKanbanTask>): Promise<KanbanTask | undefined> {
    const [row] = await db.update(kanbanTasks).set(data).where(eq(kanbanTasks.id, id)).returning();
    return row;
  }
  async deleteKanbanTask(id: string): Promise<boolean> {
    const result = await db.delete(kanbanTasks).where(eq(kanbanTasks.id, id)).returning();
    return result.length > 0;
  }
  async updateKanbanTaskStatus(id: string, status: string): Promise<KanbanTask | undefined> {
    return this.updateKanbanTask(id, { status: status as any });
  }

  async getFinancialEntries(): Promise<FinancialEntry[]> { return db.select().from(financialEntries); }
  async getFinancialEntry(id: string): Promise<FinancialEntry | undefined> {
    const [row] = await db.select().from(financialEntries).where(eq(financialEntries.id, id));
    return row;
  }
  async createFinancialEntry(data: InsertFinancialEntry): Promise<FinancialEntry> {
    const [row] = await db.insert(financialEntries).values(data).returning();
    return row;
  }
  async updateFinancialEntry(id: string, data: Partial<InsertFinancialEntry>): Promise<FinancialEntry | undefined> {
    const [row] = await db.update(financialEntries).set(data).where(eq(financialEntries.id, id)).returning();
    return row;
  }
  async deleteFinancialEntry(id: string): Promise<boolean> {
    const result = await db.delete(financialEntries).where(eq(financialEntries.id, id)).returning();
    return result.length > 0;
  }

  async getLeads(): Promise<Lead[]> { return db.select().from(leads); }
  async getLead(id: string): Promise<Lead | undefined> {
    const [row] = await db.select().from(leads).where(eq(leads.id, id));
    return row;
  }
  async createLead(data: InsertLead): Promise<Lead> {
    const [row] = await db.insert(leads).values(data).returning();
    return row;
  }
  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [row] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return row;
  }
  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  async getProposals(): Promise<Proposal[]> { return db.select().from(proposals); }
  async getProposal(id: string): Promise<Proposal | undefined> {
    const [row] = await db.select().from(proposals).where(eq(proposals.id, id));
    return row;
  }
  async createProposal(data: InsertProposal): Promise<Proposal> {
    const [row] = await db.insert(proposals).values(data).returning();
    return row;
  }
  async updateProposal(id: string, data: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const [row] = await db.update(proposals).set(data).where(eq(proposals.id, id)).returning();
    return row;
  }
  async deleteProposal(id: string): Promise<boolean> {
    const result = await db.delete(proposals).where(eq(proposals.id, id)).returning();
    return result.length > 0;
  }

  async getUsers(): Promise<User[]> { return db.select().from(users); }
  async getUser(id: string): Promise<User | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
  }
  async createUser(data: InsertUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  }
  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [row] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return row;
  }
  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getIntegrations(): Promise<Integration[]> { return db.select().from(integrations); }
  async getIntegration(id: string): Promise<Integration | undefined> {
    const [row] = await db.select().from(integrations).where(eq(integrations.id, id));
    return row;
  }
  async createIntegration(data: InsertIntegration): Promise<Integration> {
    const [row] = await db.insert(integrations).values(data).returning();
    return row;
  }
  async updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [row] = await db.update(integrations).set(data).where(eq(integrations.id, id)).returning();
    return row;
  }
  async deleteIntegration(id: string): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id)).returning();
    return result.length > 0;
  }

  async getAppDocuments(appId: string): Promise<AppDocument[]> {
    return db.select().from(appDocuments).where(eq(appDocuments.appId, appId));
  }
  async createAppDocument(data: InsertAppDocument): Promise<AppDocument> {
    const [row] = await db.insert(appDocuments).values(data).returning();
    return row;
  }
  async deleteAppDocument(id: string): Promise<boolean> {
    const result = await db.delete(appDocuments).where(eq(appDocuments.id, id)).returning();
    return result.length > 0;
  }
  async getAppDocument(id: string): Promise<AppDocument | undefined> {
    const [row] = await db.select().from(appDocuments).where(eq(appDocuments.id, id));
    return row;
  }

  async getRepoFiles(appId: string): Promise<RepoFile[]> {
    return db.select().from(repoFiles).where(eq(repoFiles.appId, appId));
  }
  async createRepoFile(data: InsertRepoFile): Promise<RepoFile> {
    const [row] = await db.insert(repoFiles).values(data).returning();
    return row;
  }
  async deleteRepoFile(id: string): Promise<boolean> {
    const result = await db.delete(repoFiles).where(eq(repoFiles.id, id)).returning();
    return result.length > 0;
  }
  async getRepoFile(id: string): Promise<RepoFile | undefined> {
    const [row] = await db.select().from(repoFiles).where(eq(repoFiles.id, id));
    return row;
  }
  async renameRepoFile(id: string, name: string): Promise<RepoFile | undefined> {
    const [row] = await db.update(repoFiles).set({ name, originalName: name }).where(eq(repoFiles.id, id)).returning();
    return row;
  }

  async getTagConfigs(): Promise<TagConfig[]> { return db.select().from(tagConfigs); }
  async createTagConfig(config: InsertTagConfig): Promise<TagConfig> {
    const [row] = await db.insert(tagConfigs).values(config).returning();
    return row;
  }
  async updateTagConfig(id: string, config: Partial<InsertTagConfig>): Promise<TagConfig | undefined> {
    const [row] = await db.update(tagConfigs).set(config).where(eq(tagConfigs.id, id)).returning();
    return row;
  }
  async deleteTagConfig(id: string): Promise<boolean> {
    const [row] = await db.delete(tagConfigs).where(eq(tagConfigs.id, id)).returning();
    return !!row;
  }

  async getDashboardStats(): Promise<any> {
    const allClients = await this.getClients();
    const allApps = await this.getApps();
    const allContracts = await this.getContracts();
    const allPayments = await this.getPayments();
    
    const activeApps = allApps.filter(a => a.status !== "archived" && a.status !== "disabled").length;
    const totalMRR = allContracts
      .filter(c => c.status === "active" && c.type === "monthly")
      .reduce((sum, c) => sum + Number(c.value || 0), 0);
    
    const overduePayments = allPayments.filter(p => p.status === "overdue").length;
    
    return {
      totalClients: allClients.length,
      activeApps,
      mrr: totalMRR,
      arr: totalMRR * 12,
      overduePayments
    };
  }

  async getVpsServers(): Promise<VpsServer[]> {
    return db.select().from(vpsServers).orderBy(vpsServers.name);
  }
  async getVpsServer(id: string): Promise<VpsServer | undefined> {
    const [row] = await db.select().from(vpsServers).where(eq(vpsServers.id, id));
    return row;
  }
  async createVpsServer(data: InsertVpsServer): Promise<VpsServer> {
    const [row] = await db.insert(vpsServers).values(data).returning();
    return row;
  }
  async updateVpsServer(id: string, data: Partial<InsertVpsServer>): Promise<VpsServer | undefined> {
    const [row] = await db.update(vpsServers).set(data).where(eq(vpsServers.id, id)).returning();
    return row;
  }
  async deleteVpsServer(id: string): Promise<boolean> {
    await db.delete(vpsAppLinks).where(eq(vpsAppLinks.vpsId, id));
    await db.delete(vpsCommandLogs).where(eq(vpsCommandLogs.vpsId, id));
    const result = await db.delete(vpsServers).where(eq(vpsServers.id, id)).returning();
    return result.length > 0;
  }

  async getVpsAppLinks(vpsId: string): Promise<VpsAppLink[]> {
    return db.select().from(vpsAppLinks).where(eq(vpsAppLinks.vpsId, vpsId));
  }
  async getAllVpsAppLinks(): Promise<VpsAppLink[]> {
    return db.select().from(vpsAppLinks);
  }
  async createVpsAppLink(data: InsertVpsAppLink): Promise<VpsAppLink> {
    const [row] = await db.insert(vpsAppLinks).values(data).returning();
    return row;
  }
  async deleteVpsAppLink(id: string): Promise<boolean> {
    const result = await db.delete(vpsAppLinks).where(eq(vpsAppLinks.id, id)).returning();
    return result.length > 0;
  }

  async getVpsCommandLogs(vpsId: string): Promise<VpsCommandLog[]> {
    return db.select().from(vpsCommandLogs).where(eq(vpsCommandLogs.vpsId, vpsId)).orderBy(desc(vpsCommandLogs.executedAt));
  }
  async createVpsCommandLog(data: InsertVpsCommandLog): Promise<VpsCommandLog> {
    const [row] = await db.insert(vpsCommandLogs).values(data).returning();
    return row;
  }

  async getAiConfigs(): Promise<AiConfig[]> { return db.select().from(aiConfigs); }
  async getAiConfig(id: string): Promise<AiConfig | undefined> {
    const [row] = await db.select().from(aiConfigs).where(eq(aiConfigs.id, id));
    return row;
  }
  async createAiConfig(data: InsertAiConfig): Promise<AiConfig> {
    const [row] = await db.insert(aiConfigs).values(data).returning();
    return row;
  }
  async updateAiConfig(id: string, data: Partial<InsertAiConfig>): Promise<AiConfig | undefined> {
    const [row] = await db.update(aiConfigs).set(data).where(eq(aiConfigs.id, id)).returning();
    return row;
  }
  async deleteAiConfig(id: string): Promise<boolean> {
    const result = await db.delete(aiConfigs).where(eq(aiConfigs.id, id)).returning();
    return result.length > 0;
  }

  async getAppChecklists(appId: string): Promise<AppChecklist[]> {
    return db.select().from(appChecklists).where(eq(appChecklists.appId, appId)).orderBy(appChecklists.sortOrder);
  }
  async createAppChecklist(data: InsertAppChecklist): Promise<AppChecklist> {
    const [row] = await db.insert(appChecklists).values(data).returning();
    return row;
  }
  async updateAppChecklist(id: string, data: Partial<InsertAppChecklist>): Promise<AppChecklist | undefined> {
    const [row] = await db.update(appChecklists).set(data).where(eq(appChecklists.id, id)).returning();
    return row;
  }
  async deleteAppChecklist(id: string): Promise<boolean> {
    const result = await db.delete(appChecklists).where(eq(appChecklists.id, id)).returning();
    return result.length > 0;
  }

  async getAppNotes(appId: string): Promise<AppNote[]> {
    return db.select().from(appNotes).where(eq(appNotes.appId, appId)).orderBy(desc(appNotes.createdAt));
  }
  async createAppNote(data: InsertAppNote): Promise<AppNote> {
    const [row] = await db.insert(appNotes).values(data).returning();
    return row;
  }
  async deleteAppNote(id: string): Promise<boolean> {
    const result = await db.delete(appNotes).where(eq(appNotes.id, id)).returning();
    return result.length > 0;
  }

  async getVpsDatabases(vpsId: string): Promise<VpsDatabase[]> {
    return db.select().from(vpsDatabases).where(eq(vpsDatabases.vpsId, vpsId));
  }
  async getAllVpsDatabases(): Promise<VpsDatabase[]> {
    return db.select().from(vpsDatabases);
  }
  async createVpsDatabase(data: InsertVpsDatabase): Promise<VpsDatabase> {
    const [row] = await db.insert(vpsDatabases).values(data).returning();
    return row;
  }
  async updateVpsDatabase(id: string, data: Partial<InsertVpsDatabase>): Promise<VpsDatabase | undefined> {
    const [row] = await db.update(vpsDatabases).set(data).where(eq(vpsDatabases.id, id)).returning();
    return row;
  }
  async deleteVpsDatabase(id: string): Promise<boolean> {
    await db.delete(vpsDbAppLinks).where(eq(vpsDbAppLinks.databaseId, id));
    const result = await db.delete(vpsDatabases).where(eq(vpsDatabases.id, id)).returning();
    return result.length > 0;
  }

  async getVpsDbAppLinks(databaseId: string): Promise<VpsDbAppLink[]> {
    return db.select().from(vpsDbAppLinks).where(eq(vpsDbAppLinks.databaseId, databaseId));
  }
  async getAllVpsDbAppLinks(): Promise<VpsDbAppLink[]> {
    return db.select().from(vpsDbAppLinks);
  }
  async createVpsDbAppLink(data: InsertVpsDbAppLink): Promise<VpsDbAppLink> {
    const [row] = await db.insert(vpsDbAppLinks).values(data).returning();
    return row;
  }
  async deleteVpsDbAppLink(id: string): Promise<boolean> {
    const result = await db.delete(vpsDbAppLinks).where(eq(vpsDbAppLinks.id, id)).returning();
    return result.length > 0;
  }

  async createVpsMetric(data: InsertVpsMetric): Promise<VpsMetric> {
    const [row] = await db.insert(vpsMetrics).values(data).returning();
    return row;
  }
  async getVpsMetrics(vpsId: string, from: Date, to: Date): Promise<VpsMetric[]> {
    return db.select().from(vpsMetrics)
      .where(and(eq(vpsMetrics.vpsId, vpsId), gte(vpsMetrics.collectedAt, from), lte(vpsMetrics.collectedAt, to)))
      .orderBy(vpsMetrics.collectedAt);
  }
  async getLatestVpsMetric(vpsId: string): Promise<VpsMetric | undefined> {
    const [row] = await db.select().from(vpsMetrics).where(eq(vpsMetrics.vpsId, vpsId)).orderBy(desc(vpsMetrics.collectedAt)).limit(1);
    return row;
  }
  async deleteVpsMetricsOlderThan(date: Date): Promise<number> {
    const result = await db.delete(vpsMetrics).where(lte(vpsMetrics.collectedAt, date)).returning();
    return result.length;
  }

  async getAppMonitors(): Promise<AppMonitor[]> { return db.select().from(appMonitors); }
  async getAppMonitor(id: string): Promise<AppMonitor | undefined> {
    const [row] = await db.select().from(appMonitors).where(eq(appMonitors.id, id));
    return row;
  }
  async createAppMonitor(data: InsertAppMonitor): Promise<AppMonitor> {
    const [row] = await db.insert(appMonitors).values(data).returning();
    return row;
  }
  async updateAppMonitor(id: string, data: Partial<InsertAppMonitor>): Promise<AppMonitor | undefined> {
    const [row] = await db.update(appMonitors).set(data).where(eq(appMonitors.id, id)).returning();
    return row;
  }
  async deleteAppMonitor(id: string): Promise<boolean> {
    const result = await db.delete(appMonitors).where(eq(appMonitors.id, id)).returning();
    return result.length > 0;
  }

  async createAppMetric(data: InsertAppMetric): Promise<AppMetric> {
    const [row] = await db.insert(appMetrics).values(data).returning();
    return row;
  }
  async getAppMetrics(monitorId: string, from: Date, to: Date): Promise<AppMetric[]> {
    return db.select().from(appMetrics)
      .where(and(eq(appMetrics.appMonitorId, monitorId), gte(appMetrics.collectedAt, from), lte(appMetrics.collectedAt, to)))
      .orderBy(appMetrics.collectedAt);
  }
  async getLatestAppMetric(monitorId: string): Promise<AppMetric | undefined> {
    const [row] = await db.select().from(appMetrics).where(eq(appMetrics.appMonitorId, monitorId)).orderBy(desc(appMetrics.collectedAt)).limit(1);
    return row;
  }

  async createDbMetric(data: InsertDbMetric): Promise<DbMetric> {
    const [row] = await db.insert(dbMetrics).values(data).returning();
    return row;
  }
  async getDbMetrics(databaseId: string, from: Date, to: Date): Promise<DbMetric[]> {
    return db.select().from(dbMetrics)
      .where(and(eq(dbMetrics.databaseId, databaseId), gte(dbMetrics.collectedAt, from), lte(dbMetrics.collectedAt, to)))
      .orderBy(dbMetrics.collectedAt);
  }
  async getLatestDbMetric(databaseId: string): Promise<DbMetric | undefined> {
    const [row] = await db.select().from(dbMetrics).where(eq(dbMetrics.databaseId, databaseId)).orderBy(desc(dbMetrics.collectedAt)).limit(1);
    return row;
  }

  async getAlertRules(): Promise<AlertRule[]> { return db.select().from(alertRules).orderBy(desc(alertRules.createdAt)); }
  async getEnabledAlertRules(): Promise<AlertRule[]> { return db.select().from(alertRules).where(eq(alertRules.enabled, true)); }
  async getAlertRule(id: string): Promise<AlertRule | undefined> {
    const [row] = await db.select().from(alertRules).where(eq(alertRules.id, id));
    return row;
  }
  async createAlertRule(data: InsertAlertRule): Promise<AlertRule> {
    const [row] = await db.insert(alertRules).values(data).returning();
    return row;
  }
  async updateAlertRule(id: string, data: Partial<InsertAlertRule>): Promise<AlertRule | undefined> {
    const [row] = await db.update(alertRules).set(data).where(eq(alertRules.id, id)).returning();
    return row;
  }
  async deleteAlertRule(id: string): Promise<boolean> {
    const result = await db.delete(alertRules).where(eq(alertRules.id, id)).returning();
    return result.length > 0;
  }

  async getAlertDestinations(): Promise<AlertDestination[]> { return db.select().from(alertDestinations); }
  async getEnabledAlertDestinations(): Promise<AlertDestination[]> { return db.select().from(alertDestinations).where(eq(alertDestinations.enabled, true)); }
  async createAlertDestination(data: InsertAlertDestination): Promise<AlertDestination> {
    const [row] = await db.insert(alertDestinations).values(data).returning();
    return row;
  }
  async updateAlertDestination(id: string, data: Partial<InsertAlertDestination>): Promise<AlertDestination | undefined> {
    const [row] = await db.update(alertDestinations).set(data).where(eq(alertDestinations.id, id)).returning();
    return row;
  }
  async deleteAlertDestination(id: string): Promise<boolean> {
    const result = await db.delete(alertDestinations).where(eq(alertDestinations.id, id)).returning();
    return result.length > 0;
  }

  async getAlertHistory(limit = 50): Promise<AlertHistory[]> {
    return db.select().from(alertHistory).orderBy(desc(alertHistory.firedAt)).limit(limit);
  }
  async getUnresolvedAlerts(): Promise<AlertHistory[]> {
    return db.select().from(alertHistory).where(eq(alertHistory.status, "firing")).orderBy(desc(alertHistory.firedAt));
  }
  async createAlertHistory(data: InsertAlertHistory): Promise<AlertHistory> {
    const [row] = await db.insert(alertHistory).values(data).returning();
    return row;
  }
  async resolveAlert(id: string): Promise<AlertHistory | undefined> {
    const [row] = await db.update(alertHistory).set({ status: "resolved", resolvedAt: new Date() }).where(eq(alertHistory.id, id)).returning();
    return row;
  }

  async getMonitoringConfig(): Promise<MonitoringConfig[]> { return db.select().from(monitoringConfig); }
  async getMonitoringConfigValue(key: string): Promise<string | undefined> {
    const [row] = await db.select().from(monitoringConfig).where(eq(monitoringConfig.key, key));
    return row?.value;
  }
  async setMonitoringConfig(key: string, value: string): Promise<MonitoringConfig> {
    const existing = await db.select().from(monitoringConfig).where(eq(monitoringConfig.key, key));
    if (existing.length > 0) {
      const [row] = await db.update(monitoringConfig).set({ value }).where(eq(monitoringConfig.key, key)).returning();
      return row;
    }
    const [row] = await db.insert(monitoringConfig).values({ key, value }).returning();
    return row;
  }
}

export async function seedDatabase() {
  const existingMonConfig = await db.select().from(monitoringConfig);
  if (existingMonConfig.length === 0) {
    await db.insert(monitoringConfig).values([
      { key: "collection_interval", value: "5" },
      { key: "retention_days", value: "7" },
      { key: "alerts_enabled", value: "true" },
    ]);
  }

  const existingClientTypes = await db.select().from(clientTypes);
  if (existingClientTypes.length === 0) {
    await db.insert(clientTypes).values([
      { key: "acelera", label: "Acelera", color: "#3b82f6", active: true },
      { key: "opus", label: "Opus", color: "#8b5cf6", active: true },
      { key: "thecorp", label: "TheCorp", color: "#f59e0b", active: true },
      { key: "partner", label: "Partner", color: "#22c55e", active: true },
    ]);
  }

  const existingDevs = await db.select().from(developers);
  const existingUsers = await db.select().from(users);
  if (existingDevs.length > 0 && existingUsers.length > 0) return;

  const devData = [
    { name: "Felipe Lacerda", email: "felipe.lacerda@acelera.it", phone: "+55 11 97000-2000", role: "CEO / Tech Lead", level: "lead" as const, monthlyRate: "15000.00", skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Next.js"] },
    { name: "Lucas Marquisio", email: "lucas.marquisio@acelera.it", phone: "+55 11 97111-2333", role: "Fullstack Developer", level: "senior" as const, monthlyRate: "9000.00", skills: ["React", "Node.js", "APIs", "SQL", "TypeScript"] },
    { name: "Daniel Lacerda", email: "daniel.lacerda@acelera.it", phone: "+55 11 97222-2666", role: "Fullstack Developer", level: "mid" as const, monthlyRate: "7000.00", skills: ["React", "Node.js", "TypeScript", "Tailwind"] },
    { name: "Cristhian Sidoly", email: "cristhian.sidoly@acelera.it", phone: "+55 11 97333-2999", role: "Fullstack Developer", level: "mid" as const, monthlyRate: "7000.00", skills: ["React", "Node.js", "TypeScript", "Mobile"] },
    { name: "Kauan", email: "kauan@acelera.it", phone: "+55 11 97444-3332", role: "Fullstack Developer", level: "mid" as const, monthlyRate: "7000.00", skills: ["React", "Node.js", "Mobile", "TypeScript"] },
    { name: "Maico Fernandes", email: "maico.fernandes@acelera.it", phone: "+55 11 97555-3665", role: "Developer", level: "mid" as const, monthlyRate: "6000.00", skills: ["React", "Node.js", "TypeScript"] },
    { name: "Cauã (TheCorp)", email: "caua.thecorp@acelera.it", phone: "+55 11 97666-3998", role: "Developer", level: "junior" as const, monthlyRate: "4000.00", skills: ["React", "Node.js", "TypeScript"] },
  ];

  const insertedDevs = await db.insert(developers).values(
    devData.map(d => ({ ...d, status: "active" as const, contractType: "PJ" }))
  ).returning();
  const devIds = insertedDevs.map(d => d.id);

  type OriginType = "acelera" | "opus" | "both" | "thecorp" | "vittaverde";
  type StatusType = "in_dev" | "staging" | "active" | "paused" | "disabled" | "archived";

  const projectsData: Array<{ name: string; dev: number; status: StatusType; origin: OriginType; info: string }> = [
    { name: "Vagas", dev: 0, status: "staging", origin: "both", info: "" },
    { name: "Workspace", dev: 0, status: "staging", origin: "opus", info: "" },
    { name: "VittaVerde", dev: 0, status: "staging", origin: "vittaverde", info: "" },
    { name: "Opus Você", dev: 0, status: "paused", origin: "opus", info: "Sem data" },
    { name: "Projeto Ivan (Uniq)", dev: 0, status: "paused", origin: "acelera", info: "Proposta aceita — Em fase de contrato" },
    { name: "Vertex", dev: 0, status: "paused", origin: "acelera", info: "Em fase de envio de proposta" },
    { name: "Automação Clara", dev: 0, status: "paused", origin: "opus", info: "Sem data" },
    { name: "Miro - Loja de Carro", dev: 0, status: "paused", origin: "acelera", info: "Em fase de envio de proposta" },
    { name: "Ademicon", dev: 0, status: "paused", origin: "acelera", info: "Fase de reunião inicial" },
    { name: "Acelera Hub", dev: 0, status: "in_dev", origin: "acelera", info: "Central de gestão da Acelera IT" },
    { name: "Faturamento Telos", dev: 1, status: "in_dev", origin: "opus", info: "" },
    { name: "Dashboard Senior", dev: 1, status: "in_dev", origin: "opus", info: "Aguardando WebServices" },
    { name: "Intera", dev: 1, status: "staging", origin: "opus", info: "API Intera x iFood - Início 02/03" },
    { name: "AllStrategy", dev: 1, status: "paused", origin: "opus", info: "Dashboard Controladoria + Resultados e Cenários" },
    { name: "Comercial", dev: 2, status: "in_dev", origin: "both", info: "" },
    { name: "Opus Rental Capital", dev: 2, status: "paused", origin: "both", info: "" },
    { name: "G Farma", dev: 3, status: "in_dev", origin: "acelera", info: "Implantação 03/03" },
    { name: "Agente Telos", dev: 3, status: "in_dev", origin: "opus", info: "Implantação 06/03" },
    { name: "Robô", dev: 3, status: "paused", origin: "both", info: "" },
    { name: "Robo Tráfego Pago", dev: 3, status: "paused", origin: "acelera", info: "" },
    { name: "Atlas", dev: 4, status: "in_dev", origin: "both", info: "" },
    { name: "Full Facilities", dev: 4, status: "staging", origin: "both", info: "Mobile" },
    { name: "DHO", dev: 4, status: "paused", origin: "opus", info: "Aguardando 02/03" },
    { name: "Qualidade Completo", dev: 4, status: "paused", origin: "opus", info: "Aguardando 02/03" },
    { name: "Inventário", dev: 5, status: "in_dev", origin: "opus", info: "" },
    { name: "Gestão Porto", dev: 6, status: "in_dev", origin: "thecorp", info: "" },
    { name: "Clube Motos", dev: 6, status: "in_dev", origin: "thecorp", info: "" },
    { name: "Ticketflow", dev: 0, status: "archived", origin: "both", info: "" },
    { name: "RNC", dev: 1, status: "archived", origin: "opus", info: "" },
    { name: "Facilities", dev: 4, status: "archived", origin: "both", info: "" },
    { name: "Compliance", dev: 1, status: "archived", origin: "opus", info: "" },
  ];

  const insertedApps = await db.insert(apps).values(
    projectsData.map(p => ({
      name: p.name,
      type: "saas" as const,
      status: p.status,
      origin: p.origin,
      devResponsibleId: devIds[p.dev],
      description: p.info || null,
    }))
  ).returning();
  const appIds = insertedApps.map(a => a.id);

  const clientData = [
    { name: "Opus Digital", cnpj: "23.456.789/0001-01", email: "admin@opusdigital.com.br", type: "opus" },
    { name: "TheCorp Ventures", cnpj: "45.678.901/0001-23", email: "tech@thecorp.io", type: "thecorp" },
    { name: "G Farma", cnpj: "12.345.678/0001-90", email: "contato@gfarma.com.br", type: "acelera" },
    { name: "VittaVerde", cnpj: "34.567.890/0001-12", email: "contato@vittaverde.com.br", type: "partner" },
    { name: "Ivan (Uniq)", cnpj: "56.789.012/0001-34", email: "ivan@uniq.com.br", type: "acelera" },
    { name: "Vertex", cnpj: "67.890.123/0001-45", email: "contato@vertex.com.br", type: "acelera" },
  ];
  const insertedClients = await db.insert(clients).values(
    clientData.map((c, i) => ({
      ...c,
      phone: `+55 11 9${(8000 + i * 111).toString()}-${(1000 + i * 222).toString()}`,
      status: "active",
    }))
  ).returning();
  const clientIds = insertedClients.map(c => c.id);

  const contractValues = ["4500.00", "3200.00", "6800.00", "2500.00", "3500.00"];
  const contractTypes: Array<"monthly" | "per_seat" | "revenue_share" | "milestone" | "setup_monthly"> = ["monthly", "per_seat", "monthly", "milestone", "monthly"];
  const contractStatuses: Array<"active" | "renewing"> = ["active", "renewing"];

  const insertedContracts = await db.insert(contracts).values(
    Array.from({ length: 5 }, (_, i) => {
      const startDate = new Date(Date.now() - (180 + i * 30) * 86400000);
      const endDays = i === 1 ? 15 : 365 - i * 30;
      return {
        appId: appIds[i],
        clientId: clientIds[i % clientIds.length],
        type: contractTypes[i],
        status: (i === 1 ? "renewing" : "active") as "active" | "renewing",
        value: contractValues[i],
        startDate,
        endDate: new Date(Date.now() + endDays * 86400000),
        autoRenew: i !== 3,
        paymentDay: 10 + i * 5,
      };
    })
  ).returning();
  const contractIds = insertedContracts.map(c => c.id);

  const paymentStatuses: Array<"paid" | "pending" | "overdue" | "negotiating"> = ["paid", "paid", "pending", "overdue", "paid", "overdue", "pending", "paid"];
  await db.insert(payments).values(
    Array.from({ length: 8 }, (_, i) => {
      const cIdx = i % 5;
      const dueDate = new Date(Date.now() + (i < 4 ? -30 + i * 10 : 5 + i * 7) * 86400000);
      return {
        contractId: contractIds[cIdx],
        clientId: clientIds[cIdx % clientIds.length],
        amount: contractValues[cIdx],
        dueDate,
        paidDate: paymentStatuses[i] === "paid" ? new Date(dueDate.getTime() + 86400000 * 2) : null,
        status: paymentStatuses[i],
        paymentMethod: paymentStatuses[i] === "paid" ? "PIX" : null,
      };
    })
  );

  const taskData = [
    { title: "Melhorias UI Vagas", app: 0, dev: 0, status: "in_dev" as const, priority: "high" as const, est: 16, act: 8, tags: ["frontend", "ui"] },
    { title: "API Faturamento Telos", app: 10, dev: 1, status: "in_dev" as const, priority: "critical" as const, est: 24, act: 20, tags: ["backend", "api"] },
    { title: "Integração iFood - Intera", app: 12, dev: 1, status: "review" as const, priority: "high" as const, est: 20, act: 15, tags: ["api", "integration"] },
    { title: "Setup G Farma", app: 16, dev: 3, status: "in_dev" as const, priority: "high" as const, est: 40, act: 10, tags: ["setup", "implantacao"] },
    { title: "Mobile Full Facilities", app: 21, dev: 4, status: "staging" as const, priority: "medium" as const, est: 30, act: 28, tags: ["mobile", "react-native"] },
    { title: "Atlas deploy final", app: 20, dev: 4, status: "review" as const, priority: "high" as const, est: 16, act: 14, tags: ["deploy", "devops"] },
    { title: "Robô automação", app: 18, dev: 3, status: "paused" as const, priority: "medium" as const, est: 20, act: 12, tags: ["automation", "bot"] },
    { title: "Gestão Porto módulo inicial", app: 25, dev: 6, status: "in_dev" as const, priority: "medium" as const, est: 30, act: 5, tags: ["setup", "thecorp"] },
    { title: "Clube Motos layout", app: 26, dev: 6, status: "in_dev" as const, priority: "medium" as const, est: 20, act: 3, tags: ["frontend", "layout"] },
    { title: "Acelera Hub - MVP", app: 9, dev: 0, status: "in_dev" as const, priority: "critical" as const, est: 60, act: 3, tags: ["platform", "mvp"] },
    { title: "Inventário setup", app: 24, dev: 5, status: "in_dev" as const, priority: "medium" as const, est: 24, act: 4, tags: ["setup"] },
    { title: "Comercial frontend", app: 14, dev: 2, status: "in_dev" as const, priority: "high" as const, est: 32, act: 8, tags: ["frontend"] },
  ];
  await db.insert(kanbanTasks).values(
    taskData.filter(t => appIds[t.app]).map(t => ({
      appId: appIds[t.app],
      devId: devIds[t.dev],
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimatedHours: t.est,
      actualHours: t.act,
      dueDate: new Date(Date.now() + Math.random() * 30 * 86400000),
      tags: t.tags,
    }))
  );

  const finData: Array<{ type: "income" | "expense"; cat: string; amount: string; desc: string }> = [
    { type: "income", cat: "Mensalidade", amount: "4500.00", desc: "Mensalidade G Farma - Março" },
    { type: "income", cat: "Mensalidade", amount: "3200.00", desc: "Projetos Opus - Março" },
    { type: "income", cat: "Mensalidade", amount: "6800.00", desc: "Mensalidade VittaVerde - Março" },
    { type: "income", cat: "Projeto", amount: "15000.00", desc: "Projeto Ivan (Uniq) - Marco 1" },
    { type: "income", cat: "Mensalidade", amount: "2800.00", desc: "Full Facilities - Março" },
    { type: "expense", cat: "Infraestrutura", amount: "1200.00", desc: "AWS + Servidores" },
    { type: "expense", cat: "Licenca", amount: "400.00", desc: "Licenças e APIs" },
    { type: "expense", cat: "Folha", amount: "55000.00", desc: "Folha de pagamento devs - Março" },
    { type: "expense", cat: "Operacional", amount: "2500.00", desc: "Ferramentas e licencas SaaS" },
  ];
  await db.insert(financialEntries).values(
    finData.map((f, i) => ({
      type: f.type,
      category: f.cat,
      amount: f.amount,
      date: new Date(Date.now() - (30 - i * 3) * 86400000),
      description: f.desc,
      recurring: f.type === "income" && f.cat === "Mensalidade",
    }))
  );

  const leadData = [
    { name: "Ivan (Uniq)", company: "Uniq", status: "negotiating" as const, source: "Indicacao", serviceType: "projeto", estimatedValue: "45000.00", installments: 3, tags: ["Prioritário", "Enterprise"] },
    { name: "Vertex", company: "Vertex", status: "proposal" as const, source: "LinkedIn", serviceType: "sistema", estimatedValue: "36000.00", monthlyFee: "2500.00", implantationFee: "5000.00", pricingModel: "fixed_plus_user", pricePerUser: "89.90", estimatedUsers: 15, tags: ["SaaS", "Recorrente"] },
    { name: "Miro", company: "Loja de Carro", status: "proposal" as const, source: "Google Ads", serviceType: "projeto", estimatedValue: "24000.00", installments: 4, tags: ["E-commerce"] },
    { name: "Ademicon", company: "Ademicon", status: "new" as const, source: "Indicacao", serviceType: "bpo", estimatedValue: "30000.00", monthlyFee: "30000.00", teamSize: 4, tags: ["BPO", "Enterprise", "Urgente"] },
    { name: "Automação Clara", company: "Clara Automação", status: "contacted" as const, source: "Site", serviceType: "sistema", estimatedValue: "6500.00", monthlyFee: "1200.00", implantationFee: "3500.00", pricingModel: "per_user", pricePerUser: "49.90", estimatedUsers: 8, tags: ["Automação"] },
    { name: "Diego Martins", company: "Restaurante Sabor", status: "won" as const, source: "Indicacao", serviceType: "projeto", estimatedValue: "4000.00", installments: 1, tags: ["Fechado"] },
  ];
  const insertedLeads = await db.insert(leads).values(
    leadData.map(l => ({
      ...l,
      email: `contato@${l.company.toLowerCase().replace(/ /g, "")}.com.br`,
      phone: "+55 11 99999-0000",
    }))
  ).returning();
  const leadIds = insertedLeads.map(l => l.id);

  const proposalData = [
    { title: "Proposta - Projeto Ivan (Uniq)", lead: 0, status: "accepted" as const, serviceType: "projeto", value: "45000.00", installments: 3 },
    { title: "Proposta - Sistema Vertex", lead: 1, status: "sent" as const, serviceType: "sistema", value: "36000.00", monthlyFee: "2500.00", implantationFee: "5000.00", pricingModel: "fixed_plus_user", pricePerUser: "89.90", estimatedUsers: 15 },
    { title: "Proposta - App Miro Loja de Carro", lead: 2, status: "draft" as const, serviceType: "projeto", value: "24000.00", installments: 4 },
    { title: "Proposta - BPO Ademicon", lead: 3, status: "draft" as const, serviceType: "bpo", value: "30000.00", monthlyFee: "30000.00", teamSize: 4, costItems: JSON.stringify([{desc:"Dev Senior",qty:1,unit:"8500.00"},{desc:"Dev Pleno",qty:2,unit:"5500.00"},{desc:"QA",qty:1,unit:"4000.00"},{desc:"Ferramentas",qty:1,unit:"1500.00"}]) },
  ];
  await db.insert(proposals).values(
    proposalData.map(p => {
      const { lead, ...rest } = p as any;
      return {
        ...rest,
        leadId: leadIds[p.lead],
        validUntil: new Date(Date.now() + 30 * 86400000),
        description: "Proposta comercial detalhada",
        items: "Desenvolvimento + Implantação + Suporte 12 meses",
      };
    })
  );

  const userData = [
    { username: "felipe", password: bcrypt.hashSync("admin123", 10), name: "Felipe Lacerda", email: "felipe.lacerda@acelera.it", role: "admin" as const },
    { username: "lucas", password: bcrypt.hashSync("dev123", 10), name: "Lucas Marquisio", email: "lucas.marquisio@acelera.it", role: "manager" as const },
    { username: "daniel", password: bcrypt.hashSync("dev123", 10), name: "Daniel Lacerda", email: "daniel.lacerda@acelera.it", role: "viewer" as const },
  ];
  await db.insert(users).values(userData);

  const integrationData = [
    { name: "WhatsApp Business", type: "messaging", status: "connected", lastSync: new Date(Date.now() - 3600000) },
    { name: "Google Calendar", type: "calendar", status: "connected", lastSync: new Date(Date.now() - 7200000) },
    { name: "Stripe", type: "payment", status: "disconnected" },
    { name: "Slack", type: "messaging", status: "disconnected" },
    { name: "GitHub", type: "development", status: "connected", lastSync: new Date(Date.now() - 1800000) },
    { name: "Notion", type: "productivity", status: "disconnected" },
  ];
  await db.insert(integrations).values(integrationData);

  const existingTags = await db.select().from(tagConfigs);
  if (existingTags.length === 0) {
    await db.insert(tagConfigs).values([
      { name: "Prioritário", color: "#ef4444" },
      { name: "Urgente", color: "#f97316" },
      { name: "Enterprise", color: "#8b5cf6" },
      { name: "Startup", color: "#06b6d4" },
      { name: "SaaS", color: "#3b82f6" },
      { name: "Recorrente", color: "#22c55e" },
      { name: "E-commerce", color: "#ec4899" },
      { name: "Automação", color: "#f59e0b" },
      { name: "BPO", color: "#14b8a6" },
      { name: "Consultoria", color: "#6366f1" },
      { name: "Mobile", color: "#a855f7" },
      { name: "Web", color: "#0ea5e9" },
      { name: "API", color: "#10b981" },
      { name: "Integração", color: "#f43f5e" },
      { name: "Implantação", color: "#84cc16" },
      { name: "Suporte", color: "#64748b" },
      { name: "Fechado", color: "#059669" },
      { name: "Quente", color: "#dc2626" },
      { name: "Frio", color: "#0284c7" },
    ]);
  }

  console.log("Database seeded successfully!");
}

export const storage = new DatabaseStorage();

// Append origins methods to DatabaseStorage prototype
Object.assign(DatabaseStorage.prototype, {
  async getOrigins(): Promise<Origin[]> {
    return db.select().from(origins).orderBy(origins.createdAt);
  },
  async getOrigin(id: string): Promise<Origin | undefined> {
    const [row] = await db.select().from(origins).where(eq(origins.id, id));
    return row;
  },
  async createOrigin(origin: InsertOrigin): Promise<Origin> {
    const [row] = await db.insert(origins).values(origin).returning();
    return row;
  },
  async updateOrigin(id: string, origin: Partial<InsertOrigin>): Promise<Origin | undefined> {
    const [row] = await db.update(origins).set(origin).where(eq(origins.id, id)).returning();
    return row;
  },
  async deleteOrigin(id: string): Promise<boolean> {
    const result = await db.delete(origins).where(eq(origins.id, id));
    return (result.rowCount ?? 0) > 0;
  },
  async getAppClients(appId: string): Promise<AppClient[]> {
    return db.select().from(appClients).where(eq(appClients.appId, appId));
  },
  async getAllAppClients(): Promise<AppClient[]> {
    return db.select().from(appClients);
  },
  async createAppClient(data: InsertAppClient): Promise<AppClient> {
    const [row] = await db.insert(appClients).values(data).returning();
    return row;
  },
  async deleteAppClient(id: string): Promise<boolean> {
    const result = await db.delete(appClients).where(eq(appClients.id, id));
    return (result.rowCount ?? 0) > 0;
  },
  async getClientTypes(): Promise<ClientType[]> {
    return db.select().from(clientTypes).orderBy(clientTypes.createdAt);
  },
  async getClientType(id: string): Promise<ClientType | undefined> {
    const [row] = await db.select().from(clientTypes).where(eq(clientTypes.id, id));
    return row;
  },
  async createClientType(data: InsertClientType): Promise<ClientType> {
    const [row] = await db.insert(clientTypes).values(data).returning();
    return row;
  },
  async updateClientType(id: string, data: Partial<InsertClientType>): Promise<ClientType | undefined> {
    const [row] = await db.update(clientTypes).set(data).where(eq(clientTypes.id, id)).returning();
    return row;
  },
  async deleteClientType(id: string): Promise<boolean> {
    const result = await db.delete(clientTypes).where(eq(clientTypes.id, id));
    return (result.rowCount ?? 0) > 0;
  },

  async getPermissionRoles(): Promise<PermissionRole[]> {
    return db.select().from(permissionRoles).orderBy(permissionRoles.level, permissionRoles.name);
  },
  async getPermissionRole(id: string): Promise<PermissionRole | undefined> {
    const [row] = await db.select().from(permissionRoles).where(eq(permissionRoles.id, id));
    return row;
  },
  async createPermissionRole(data: InsertPermissionRole): Promise<PermissionRole> {
    const [row] = await db.insert(permissionRoles).values(data).returning();
    return row;
  },
  async updatePermissionRole(id: string, data: Partial<InsertPermissionRole>): Promise<PermissionRole | undefined> {
    const [row] = await db.update(permissionRoles).set(data).where(eq(permissionRoles.id, id)).returning();
    return row;
  },
  async deletePermissionRole(id: string): Promise<boolean> {
    const result = await db.delete(permissionRoles).where(eq(permissionRoles.id, id));
    return (result.rowCount ?? 0) > 0;
  },
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  },
  async setRolePermissions(roleId: string, moduleKey: string, perms: PermissionMap): Promise<RolePermission> {
    const existing = await db.select().from(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.moduleKey, moduleKey)));
    if (existing.length > 0) {
      const [row] = await db.update(rolePermissions).set({ permissions: perms }).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.moduleKey, moduleKey))).returning();
      return row;
    }
    const [row] = await db.insert(rolePermissions).values({ roleId, moduleKey, permissions: perms }).returning();
    return row;
  },
  async bulkSetRolePermissions(roleId: string, entries: { moduleKey: string; permissions: PermissionMap }[]): Promise<RolePermission[]> {
    const results: RolePermission[] = [];
    for (const entry of entries) {
      const r = await this.setRolePermissions(roleId, entry.moduleKey, entry.permissions);
      results.push(r);
    }
    return results;
  },
  async deleteRolePermissions(roleId: string, moduleKey: string): Promise<boolean> {
    const result = await db.delete(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.moduleKey, moduleKey)));
    return (result.rowCount ?? 0) > 0;
  },
  async getUsersCountByRole(roleId: string): Promise<number> {
    const rows = await db.select().from(users).where(eq(users.roleId, roleId));
    return rows.length;
  },
  async updateUserRole(userId: string, roleId: string | null): Promise<User | undefined> {
    const [row] = await db.update(users).set({ roleId }).where(eq(users.id, userId)).returning();
    return row;
  },
});
