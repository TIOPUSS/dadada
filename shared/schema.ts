import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appTypeEnum = pgEnum("app_type", ["saas", "internal", "custom", "automation", "ai_agent"]);
export const appStatusEnum = pgEnum("app_status", ["waiting", "backlog", "in_dev", "validation_1", "validation_2", "validation_3", "testing", "deploying", "staging", "active", "paused", "disabled", "archived"]);
export const appOriginEnum = pgEnum("app_origin", ["acelera", "opus", "both", "thecorp", "vittaverde"]);

export const origins = pgTable("origins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const devLevelEnum = pgEnum("dev_level", ["junior", "mid", "senior", "lead"]);
export const devStatusEnum = pgEnum("dev_status", ["active", "inactive"]);
export const contractTypeEnum = pgEnum("contract_type", ["monthly", "per_seat", "revenue_share", "milestone", "setup_monthly", "free"]);
export const contractStatusEnum = pgEnum("contract_status", ["active", "renewing", "expired", "cancelled", "suspended"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "overdue", "negotiating"]);
export const kanbanStatusEnum = pgEnum("kanban_status", ["backlog", "in_dev", "validation_1", "validation_2", "validation_3", "testing", "deploying", "review", "staging", "done", "paused"]);
export const kanbanPriorityEnum = pgEnum("kanban_priority", ["low", "medium", "high", "critical"]);
export const financialTypeEnum = pgEnum("financial_type", ["income", "expense"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "proposal", "negotiating", "won", "lost"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "sent", "accepted", "rejected", "expired"]);
export const vpsStatusEnum = pgEnum("vps_status", ["online", "offline", "maintenance", "unknown"]);
export const dbTypeEnum = pgEnum("db_type", ["postgresql", "mysql", "mongodb", "redis", "sqlite", "mariadb", "mssql"]);
export const vpsAuthTypeEnum = pgEnum("vps_auth_type", ["password", "key"]);

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cnpj: text("cnpj"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  type: text("type").notNull().default("acelera"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version"),
  type: appTypeEnum("type").notNull().default("saas"),
  status: appStatusEnum("status").notNull().default("active"),
  origin: appOriginEnum("origin").notNull().default("acelera"),
  clientId: varchar("client_id").references(() => clients.id),
  techStack: text("tech_stack").array(),
  gitRepo: text("git_repo"),
  devResponsibleId: varchar("dev_responsible_id"),
  controlUrl: text("control_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const developers = pgTable("developers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role"),
  level: devLevelEnum("level").notNull().default("mid"),
  status: devStatusEnum("status").notNull().default("active"),
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }),
  contractType: text("contract_type"),
  skills: text("skills").array(),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  bio: text("bio"),
  languages: text("languages").array(),
  certifications: text("certifications").array(),
  education: text("education"),
  experienceYears: integer("experience_years"),
  availability: text("availability"),
  specializations: text("specializations").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id),
  clientId: varchar("client_id").references(() => clients.id),
  type: contractTypeEnum("type").notNull().default("monthly"),
  status: contractStatusEnum("status").notNull().default("active"),
  value: decimal("value", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  paymentDay: integer("payment_day"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id),
  clientId: varchar("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
});

export const kanbanTasks = pgTable("kanban_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id),
  devId: varchar("dev_id").references(() => developers.id),
  title: text("title").notNull(),
  description: text("description"),
  status: kanbanStatusEnum("status").notNull().default("backlog"),
  priority: kanbanPriorityEnum("priority").notNull().default("medium"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  dueDate: timestamp("due_date"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const financialEntries = pgTable("financial_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: financialTypeEnum("type").notNull(),
  category: text("category"),
  appId: varchar("app_id").references(() => apps.id),
  devId: varchar("dev_id").references(() => developers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description"),
  recurring: boolean("recurring").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  status: leadStatusEnum("status").notNull().default("new"),
  source: text("source"),
  serviceType: text("service_type").array(),
  projectType: text("project_type").default("new_app"),
  existingAppId: integer("existing_app_id"),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  implantationFee: decimal("implantation_fee", { precision: 10, scale: 2 }),
  pricingModel: text("pricing_model"),
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }),
  estimatedUsers: integer("estimated_users"),
  installments: integer("installments"),
  teamSize: integer("team_size"),
  tags: text("tags").array(),
  notes: text("notes"),
  clientId: varchar("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  clientId: varchar("client_id").references(() => clients.id),
  title: text("title").notNull(),
  status: proposalStatusEnum("status").notNull().default("draft"),
  serviceType: text("service_type"),
  value: decimal("value", { precision: 10, scale: 2 }),
  installments: integer("installments"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  implantationFee: decimal("implantation_fee", { precision: 10, scale: 2 }),
  pricingModel: text("pricing_model"),
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }),
  estimatedUsers: integer("estimated_users"),
  teamSize: integer("team_size"),
  costItems: text("cost_items"),
  validUntil: timestamp("valid_until"),
  description: text("description"),
  items: text("items"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const docCategoryEnum = pgEnum("doc_category", ["documentation", "pricing", "presentation", "contract", "proposal", "report", "other"]);

export const appDocuments = pgTable("app_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  category: docCategoryEnum("category").notNull().default("other"),
  mimeType: text("mime_type"),
  size: integer("size"),
  path: text("path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertAppDocumentSchema = createInsertSchema(appDocuments).omit({ id: true, uploadedAt: true });

export type AppDocument = typeof appDocuments.$inferSelect;
export type InsertAppDocument = z.infer<typeof insertAppDocumentSchema>;

export const repoFiles = pgTable("repo_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  folderPath: text("folder_path").notNull().default("/"),
  mimeType: text("mime_type"),
  size: integer("size"),
  path: text("path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertRepoFileSchema = createInsertSchema(repoFiles).omit({ id: true, uploadedAt: true });
export type RepoFile = typeof repoFiles.$inferSelect;
export type InsertRepoFile = z.infer<typeof insertRepoFileSchema>;

export const appChecklists = pgTable("app_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppChecklistSchema = createInsertSchema(appChecklists).omit({ id: true, createdAt: true });
export type AppChecklist = typeof appChecklists.$inferSelect;
export type InsertAppChecklist = z.infer<typeof insertAppChecklistSchema>;

export const appNotes = pgTable("app_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppNoteSchema = createInsertSchema(appNotes).omit({ id: true, createdAt: true });
export type AppNote = typeof appNotes.$inferSelect;
export type InsertAppNote = z.infer<typeof insertAppNoteSchema>;

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertAppSchema = createInsertSchema(apps).omit({ id: true, createdAt: true });
export const insertDeveloperSchema = createInsertSchema(developers).omit({ id: true, createdAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertKanbanTaskSchema = createInsertSchema(kanbanTasks).omit({ id: true, createdAt: true });
export const insertFinancialEntrySchema = createInsertSchema(financialEntries).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, createdAt: true });

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type KanbanTask = typeof kanbanTasks.$inferSelect;
export type InsertKanbanTask = z.infer<typeof insertKanbanTaskSchema>;
export type FinancialEntry = typeof financialEntries.$inferSelect;
export type InsertFinancialEntry = z.infer<typeof insertFinancialEntrySchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "viewer"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default(""),
  email: text("email"),
  role: userRoleEnum("role").notNull().default("viewer"),
  roleId: varchar("role_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("disconnected"),
  config: text("config"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true });
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export const tagConfigs = pgTable("tag_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3b82f6"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTagConfigSchema = createInsertSchema(tagConfigs).omit({ id: true, createdAt: true });
export type TagConfig = typeof tagConfigs.$inferSelect;
export type InsertTagConfig = z.infer<typeof insertTagConfigSchema>;

export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic", "google"]);

export const aiConfigs = pgTable("ai_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: aiProviderEnum("provider").notNull().default("openai"),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  model: text("model").notNull().default("gpt-4o"),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiConfigSchema = createInsertSchema(aiConfigs).omit({ id: true, createdAt: true });
export type AiConfig = typeof aiConfigs.$inferSelect;
export type InsertAiConfig = z.infer<typeof insertAiConfigSchema>;

export const vpsServers = pgTable("vps_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  hostname: text("hostname"),
  ip: text("ip").notNull(),
  port: integer("port").notNull().default(22),
  username: text("username").notNull().default("root"),
  encryptedPassword: text("encrypted_password"),
  encryptedPrivateKey: text("encrypted_private_key"),
  authType: vpsAuthTypeEnum("auth_type").notNull().default("password"),
  status: vpsStatusEnum("status").notNull().default("unknown"),
  os: text("os"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVpsServerSchema = createInsertSchema(vpsServers).omit({ id: true, createdAt: true });
export type VpsServer = typeof vpsServers.$inferSelect;
export type InsertVpsServer = z.infer<typeof insertVpsServerSchema>;

export const vpsAppLinks = pgTable("vps_app_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpsId: varchar("vps_id").notNull(),
  appId: varchar("app_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVpsAppLinkSchema = createInsertSchema(vpsAppLinks).omit({ id: true, createdAt: true });
export type VpsAppLink = typeof vpsAppLinks.$inferSelect;
export type InsertVpsAppLink = z.infer<typeof insertVpsAppLinkSchema>;

export const vpsCommandLogs = pgTable("vps_command_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpsId: varchar("vps_id").notNull(),
  userId: text("user_id"),
  command: text("command").notNull(),
  output: text("output"),
  exitCode: integer("exit_code"),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const insertVpsCommandLogSchema = createInsertSchema(vpsCommandLogs).omit({ id: true, executedAt: true });
export type VpsCommandLog = typeof vpsCommandLogs.$inferSelect;
export type InsertVpsCommandLog = z.infer<typeof insertVpsCommandLogSchema>;

export const vpsDatabases = pgTable("vps_databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpsId: varchar("vps_id").notNull(),
  name: text("name").notNull(),
  type: dbTypeEnum("type").notNull().default("postgresql"),
  host: text("host").notNull().default("localhost"),
  port: integer("port").notNull().default(5432),
  databaseName: text("database_name").notNull(),
  status: vpsStatusEnum("status").notNull().default("unknown"),
  sizeBytes: text("size_bytes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVpsDatabaseSchema = createInsertSchema(vpsDatabases).omit({ id: true, createdAt: true });
export type VpsDatabase = typeof vpsDatabases.$inferSelect;
export type InsertVpsDatabase = z.infer<typeof insertVpsDatabaseSchema>;

export const vpsDbAppLinks = pgTable("vps_db_app_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  databaseId: varchar("database_id").notNull(),
  appId: varchar("app_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVpsDbAppLinkSchema = createInsertSchema(vpsDbAppLinks).omit({ id: true, createdAt: true });
export type VpsDbAppLink = typeof vpsDbAppLinks.$inferSelect;
export type InsertVpsDbAppLink = z.infer<typeof insertVpsDbAppLinkSchema>;

export const insertOriginSchema = createInsertSchema(origins).omit({ id: true, createdAt: true });
export type Origin = typeof origins.$inferSelect;
export type InsertOrigin = z.infer<typeof insertOriginSchema>;

export const appClients = pgTable("app_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  clientId: varchar("client_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppClientSchema = createInsertSchema(appClients).omit({ id: true, createdAt: true });
export type AppClient = typeof appClients.$inferSelect;
export type InsertAppClient = z.infer<typeof insertAppClientSchema>;

export const clientTypes = pgTable("client_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientTypeSchema = createInsertSchema(clientTypes).omit({ id: true, createdAt: true });
export type ClientType = typeof clientTypes.$inferSelect;
export type InsertClientType = z.infer<typeof insertClientTypeSchema>;

export const monitorTypeEnum = pgEnum("monitor_type", ["http", "pm2", "docker"]);
export const monitorStatusEnum = pgEnum("monitor_status", ["up", "down", "degraded"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["warning", "critical"]);
export const alertStatusEnum = pgEnum("alert_status", ["firing", "resolved"]);
export const alertTargetTypeEnum = pgEnum("alert_target_type", ["vps", "app", "db"]);
export const alertDestTypeEnum = pgEnum("alert_dest_type", ["hub", "webhook", "email"]);

export const vpsMetrics = pgTable("vps_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpsId: varchar("vps_id").notNull(),
  cpuPercent: decimal("cpu_percent"),
  memoryPercent: decimal("memory_percent"),
  diskPercent: decimal("disk_percent"),
  loadAvg1: decimal("load_avg_1"),
  loadAvg5: decimal("load_avg_5"),
  loadAvg15: decimal("load_avg_15"),
  networkIn: text("network_in"),
  networkOut: text("network_out"),
  processCount: integer("process_count"),
  uptimeSeconds: integer("uptime_seconds"),
  collectedAt: timestamp("collected_at").notNull().defaultNow(),
});

export const insertVpsMetricSchema = createInsertSchema(vpsMetrics).omit({ id: true });
export type VpsMetric = typeof vpsMetrics.$inferSelect;
export type InsertVpsMetric = z.infer<typeof insertVpsMetricSchema>;

export const appMonitors = pgTable("app_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  vpsId: varchar("vps_id"),
  monitorType: monitorTypeEnum("monitor_type").notNull().default("http"),
  endpoint: text("endpoint"),
  expectedStatus: integer("expected_status").default(200),
  checkIntervalMinutes: integer("check_interval_minutes").notNull().default(5),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppMonitorSchema = createInsertSchema(appMonitors).omit({ id: true, createdAt: true });
export type AppMonitor = typeof appMonitors.$inferSelect;
export type InsertAppMonitor = z.infer<typeof insertAppMonitorSchema>;

export const appMetrics = pgTable("app_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appMonitorId: varchar("app_monitor_id").notNull(),
  status: monitorStatusEnum("status").notNull(),
  responseTimeMs: integer("response_time_ms"),
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  collectedAt: timestamp("collected_at").notNull().defaultNow(),
});

export const insertAppMetricSchema = createInsertSchema(appMetrics).omit({ id: true });
export type AppMetric = typeof appMetrics.$inferSelect;
export type InsertAppMetric = z.infer<typeof insertAppMetricSchema>;

export const dbMetrics = pgTable("db_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  databaseId: varchar("database_id").notNull(),
  status: monitorStatusEnum("status").notNull(),
  connectionsActive: integer("connections_active"),
  sizeBytes: text("size_bytes"),
  responseTimeMs: integer("response_time_ms"),
  collectedAt: timestamp("collected_at").notNull().defaultNow(),
});

export const insertDbMetricSchema = createInsertSchema(dbMetrics).omit({ id: true });
export type DbMetric = typeof dbMetrics.$inferSelect;
export type InsertDbMetric = z.infer<typeof insertDbMetricSchema>;

export const alertRules = pgTable("alert_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  targetType: alertTargetTypeEnum("target_type").notNull(),
  targetId: varchar("target_id"),
  metric: text("metric").notNull(),
  operator: text("operator").notNull().default("gt"),
  threshold: decimal("threshold").notNull(),
  duration: integer("duration").notNull().default(1),
  severity: alertSeverityEnum("severity").notNull().default("warning"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({ id: true, createdAt: true });
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;

export const alertDestinations = pgTable("alert_destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: alertDestTypeEnum("type").notNull(),
  config: text("config").notNull().default("{}"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertDestinationSchema = createInsertSchema(alertDestinations).omit({ id: true, createdAt: true });
export type AlertDestination = typeof alertDestinations.$inferSelect;
export type InsertAlertDestination = z.infer<typeof insertAlertDestinationSchema>;

export const alertHistory = pgTable("alert_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertRuleId: varchar("alert_rule_id"),
  targetType: alertTargetTypeEnum("target_type").notNull(),
  targetId: varchar("target_id"),
  metric: text("metric").notNull(),
  value: decimal("value"),
  threshold: decimal("threshold"),
  severity: alertSeverityEnum("severity").notNull().default("warning"),
  status: alertStatusEnum("status").notNull().default("firing"),
  message: text("message"),
  sentTo: text("sent_to"),
  firedAt: timestamp("fired_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertHistorySchema = createInsertSchema(alertHistory).omit({ id: true });
export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = z.infer<typeof insertAlertHistorySchema>;

export const monitoringConfig = pgTable("monitoring_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertMonitoringConfigSchema = createInsertSchema(monitoringConfig).omit({ id: true });
export type MonitoringConfig = typeof monitoringConfig.$inferSelect;
export type InsertMonitoringConfig = z.infer<typeof insertMonitoringConfigSchema>;

export const permissionRoles = pgTable("permission_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#6366f1"),
  level: integer("level").notNull().default(0),
  parentRoleId: varchar("parent_role_id"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPermissionRoleSchema = createInsertSchema(permissionRoles).omit({ id: true, createdAt: true });
export type PermissionRole = typeof permissionRoles.$inferSelect;
export type InsertPermissionRole = z.infer<typeof insertPermissionRoleSchema>;

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").references(() => permissionRoles.id, { onDelete: "cascade" }).notNull(),
  moduleKey: text("module_key").notNull(),
  permissions: jsonb("permissions").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true });
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export const SYSTEM_MODULES = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", category: "Principal", actions: ["view"] },
  { key: "leads", label: "Leads", icon: "Target", category: "Comercial", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "proposals", label: "Propostas", icon: "FileCheck", category: "Comercial", actions: ["view", "create", "edit", "delete", "export", "send"] },
  { key: "apps", label: "Apps", icon: "AppWindow", category: "Operações", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "apps.documents", label: "Documentos (Apps)", icon: "FileText", category: "Operações", actions: ["view", "upload", "download", "delete"] },
  { key: "apps.ssh", label: "Terminal SSH", icon: "Terminal", category: "Operações", actions: ["view", "execute"] },
  { key: "clients", label: "Clientes", icon: "Users", category: "Operações", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "contracts", label: "Contratos", icon: "FileText", category: "Operações", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "payments", label: "Pagamentos", icon: "CreditCard", category: "Operações", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "financial", label: "Financeiro", icon: "BarChart3", category: "Operações", actions: ["view", "create", "edit", "delete", "export"] },
  { key: "kanban", label: "Kanban", icon: "Kanban", category: "Desenvolvimento", actions: ["view", "create", "edit", "delete", "move"] },
  { key: "developers", label: "Esteira Dev", icon: "Code2", category: "Desenvolvimento", actions: ["view"] },
  { key: "dev-team", label: "Desenvolvedores", icon: "UserCog", category: "Desenvolvimento", actions: ["view", "create", "edit", "delete"] },
  { key: "vps", label: "Servidores VPS", icon: "Server", category: "Sistema", actions: ["view", "create", "edit", "delete", "ssh", "manage_databases"] },
  { key: "health", label: "Health Monitor", icon: "Activity", category: "Sistema", actions: ["view", "configure"] },
  { key: "control", label: "Monitoramento", icon: "Monitor", category: "Sistema", actions: ["view", "configure", "manage_alerts"] },
  { key: "permissions", label: "Permissões", icon: "Shield", category: "Sistema", actions: ["view", "manage_roles", "assign_users"] },
  { key: "settings", label: "Configurações", icon: "Settings", category: "Sistema", actions: ["view", "edit"] },
  { key: "settings.users", label: "Gestão de Usuários", icon: "Users", category: "Sistema", actions: ["view", "create", "edit", "delete", "assign_role"] },
  { key: "settings.integrations", label: "Integrações", icon: "Plug", category: "Sistema", actions: ["view", "configure"] },
  { key: "settings.ai", label: "Configurações IA", icon: "Sparkles", category: "Sistema", actions: ["view", "configure"] },
  { key: "settings.origins", label: "Origens e Tipos", icon: "Tag", category: "Sistema", actions: ["view", "create", "edit", "delete"] },
  { key: "settings.monitoring", label: "Config. Monitoramento", icon: "Bell", category: "Sistema", actions: ["view", "configure"] },
] as const;

export type SystemModule = typeof SYSTEM_MODULES[number];
export type ModuleKey = SystemModule["key"];
export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "execute" | "send" | "upload" | "download" | "move" | "ssh" | "manage_databases" | "configure" | "manage_alerts" | "manage_roles" | "assign_users" | "assign_role";
export type PermissionMap = Partial<Record<PermissionAction, boolean>>;
