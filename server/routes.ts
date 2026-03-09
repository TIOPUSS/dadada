import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertAppSchema, 
  insertDeveloperSchema, 
  insertContractSchema, 
  insertPaymentSchema, 
  insertKanbanTaskSchema, 
  insertFinancialEntrySchema, 
  insertLeadSchema, 
  insertProposalSchema,
  insertUserSchema,
  insertIntegrationSchema,
  insertTagConfigSchema,
  insertVpsServerSchema,
  insertVpsAppLinkSchema,
  insertAiConfigSchema,
  insertAppChecklistSchema,
  insertAppNoteSchema,
  insertVpsDatabaseSchema,
  insertVpsDbAppLinkSchema,
  insertPermissionRoleSchema,
  SYSTEM_MODULES
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { encrypt, decrypt } from "./crypto";
import { testConnection, executeCommand, getServerInfo, getConnection, sftpListDir, sftpReadFile, sftpWriteFile, sftpDeleteFile, sftpMkdir, sftpRmdir, sftpStat } from "./ssh";
import { WebSocketServer, WebSocket } from "ws";
import { initMonitoring, runMonitoringCycle, restartMonitoring } from "./monitoring";
import { chat, analyzeVpsOutput, suggestVpsCommand, testAiConnection, encryptApiKey, type AiChatMessage } from "./ai";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Clients
  app.get("/api/clients", async (_req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.post("/api/clients", async (req, res) => {
    const result = insertClientSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const client = await storage.createClient(result.data);
    res.status(201).json(client);
  });

  app.put("/api/clients/:id", async (req, res) => {
    const client = await storage.updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const success = await storage.deleteClient(req.params.id);
    if (!success) return res.status(404).json({ error: "Client not found" });
    res.status(204).end();
  });

  // Apps
  app.get("/api/apps", async (_req, res) => {
    const apps = await storage.getApps();
    res.json(apps);
  });

  app.get("/api/apps/:id", async (req, res) => {
    const app = await storage.getApp(req.params.id);
    if (!app) return res.status(404).json({ error: "App not found" });
    res.json(app);
  });

  app.post("/api/apps", async (req, res) => {
    const result = insertAppSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const app = await storage.createApp(result.data);
    res.status(201).json(app);
  });

  app.put("/api/apps/:id", async (req, res) => {
    const app = await storage.updateApp(req.params.id, req.body);
    if (!app) return res.status(404).json({ error: "App not found" });
    res.json(app);
  });

  app.delete("/api/apps/:id", async (req, res) => {
    const docs = await storage.getAppDocuments(req.params.id);
    for (const doc of docs) {
      const filePath = path.join(uploadsDir, doc.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const success = await storage.deleteApp(req.params.id);
    if (!success) return res.status(404).json({ error: "App not found" });
    res.status(204).end();
  });

  app.post("/api/apps/:id/toggle", async (req, res) => {
    const app = await storage.toggleAppStatus(req.params.id);
    if (!app) return res.status(404).json({ error: "App not found" });
    res.json(app);
  });

  app.patch("/api/apps/:id/status", async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["waiting", "backlog", "in_dev", "validation_1", "validation_2", "validation_3", "testing", "deploying", "staging", "active", "paused", "disabled", "archived"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }
    const app = await storage.updateApp(req.params.id, { status });
    if (!app) return res.status(404).json({ error: "App not found" });
    res.json(app);
  });

  // App Checklists
  app.get("/api/apps/:appId/checklists", async (req, res) => {
    const items = await storage.getAppChecklists(req.params.appId);
    res.json(items);
  });
  app.post("/api/apps/:appId/checklists", async (req, res) => {
    const parsed = insertAppChecklistSchema.omit({ appId: true }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const item = await storage.createAppChecklist({ ...parsed.data, appId: req.params.appId });
    res.json(item);
  });
  app.put("/api/checklists/:id", async (req, res) => {
    const parsed = insertAppChecklistSchema.omit({ appId: true }).partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const item = await storage.updateAppChecklist(req.params.id, parsed.data);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });
  app.delete("/api/checklists/:id", async (req, res) => {
    const ok = await storage.deleteAppChecklist(req.params.id);
    if (!ok) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  });

  // App Notes
  app.get("/api/apps/:appId/notes", async (req, res) => {
    const notes = await storage.getAppNotes(req.params.appId);
    res.json(notes);
  });
  app.post("/api/apps/:appId/notes", async (req, res) => {
    const parsed = insertAppNoteSchema.omit({ appId: true }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const note = await storage.createAppNote({ ...parsed.data, appId: req.params.appId });
    res.json(note);
  });
  app.delete("/api/notes/:id", async (req, res) => {
    const ok = await storage.deleteAppNote(req.params.id);
    if (!ok) return res.status(404).json({ error: "Note not found" });
    res.json({ success: true });
  });

  // Developers
  app.get("/api/developers", async (_req, res) => {
    const devs = await storage.getDevelopers();
    res.json(devs);
  });

  app.post("/api/developers", async (req, res) => {
    const result = insertDeveloperSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const dev = await storage.createDeveloper(result.data);
    res.status(201).json(dev);
  });

  app.put("/api/developers/:id", async (req, res) => {
    const dev = await storage.updateDeveloper(req.params.id, req.body);
    if (!dev) return res.status(404).json({ error: "Developer not found" });
    res.json(dev);
  });

  app.delete("/api/developers/:id", async (req, res) => {
    const success = await storage.deleteDeveloper(req.params.id);
    if (!success) return res.status(404).json({ error: "Developer not found" });
    res.status(204).end();
  });

  // Contracts
  app.get("/api/contracts", async (_req, res) => {
    const contracts = await storage.getContracts();
    res.json(contracts);
  });

  app.post("/api/contracts", async (req, res) => {
    const result = insertContractSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const contract = await storage.createContract(result.data);
    res.status(201).json(contract);
  });

  app.put("/api/contracts/:id", async (req, res) => {
    const contract = await storage.updateContract(req.params.id, req.body);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    const success = await storage.deleteContract(req.params.id);
    if (!success) return res.status(404).json({ error: "Contract not found" });
    res.status(204).end();
  });

  // Payments
  app.get("/api/payments", async (_req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
    const result = insertPaymentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const payment = await storage.createPayment(result.data);
    res.status(201).json(payment);
  });

  app.put("/api/payments/:id", async (req, res) => {
    const payment = await storage.updatePayment(req.params.id, req.body);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  });

  app.delete("/api/payments/:id", async (req, res) => {
    const success = await storage.deletePayment(req.params.id);
    if (!success) return res.status(404).json({ error: "Payment not found" });
    res.status(204).end();
  });

  // Kanban Tasks
  app.get("/api/kanban-tasks", async (_req, res) => {
    const tasks = await storage.getKanbanTasks();
    res.json(tasks);
  });

  app.post("/api/kanban-tasks", async (req, res) => {
    const result = insertKanbanTaskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const task = await storage.createKanbanTask(result.data);
    res.status(201).json(task);
  });

  app.put("/api/kanban-tasks/:id", async (req, res) => {
    const task = await storage.updateKanbanTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.delete("/api/kanban-tasks/:id", async (req, res) => {
    const success = await storage.deleteKanbanTask(req.params.id);
    if (!success) return res.status(404).json({ error: "Task not found" });
    res.status(204).end();
  });

  app.patch("/api/kanban-tasks/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    const task = await storage.updateKanbanTaskStatus(req.params.id, status);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  // Financial Entries
  app.get("/api/financial-entries", async (_req, res) => {
    const entries = await storage.getFinancialEntries();
    res.json(entries);
  });

  app.post("/api/financial-entries", async (req, res) => {
    const result = insertFinancialEntrySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const entry = await storage.createFinancialEntry(result.data);
    res.status(201).json(entry);
  });

  app.put("/api/financial-entries/:id", async (req, res) => {
    const entry = await storage.updateFinancialEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  });

  app.delete("/api/financial-entries/:id", async (req, res) => {
    const success = await storage.deleteFinancialEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Entry not found" });
    res.status(204).end();
  });

  // Leads
  app.get("/api/leads", async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.post("/api/leads", async (req, res) => {
    const result = insertLeadSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const lead = await storage.createLead(result.data);
    res.status(201).json(lead);
  });

  app.put("/api/leads/:id", async (req, res) => {
    const existingLead = await storage.getLead(req.params.id);
    if (!existingLead) return res.status(404).json({ error: "Lead not found" });

    if (req.body.status === "won" && existingLead.status !== "won") {
      let clientId = req.body.clientId || existingLead.clientId;
      if (!clientId) {
        const newClient = await storage.createClient({
          name: existingLead.company || existingLead.name,
          email: existingLead.email || "",
          phone: existingLead.phone || "",
          cnpj: "",
          address: "",
          type: "acelera",
          status: "active",
          notes: `Convertido do lead: ${existingLead.name}`,
        });
        clientId = newClient.id;
        req.body.clientId = clientId;
      }

      const projectType = req.body.projectType || existingLead.projectType || "new_app";
      const existingAppId = req.body.existingAppId || existingLead.existingAppId;

      if (projectType === "existing_app" && existingAppId) {
        const existingApp = await storage.getApp(existingAppId);
        if (existingApp && clientId) {
          await storage.createAppClient({ appId: existingAppId, clientId });
        }
      } else {
        const appName = existingLead.company || existingLead.name;
        const serviceTypes = existingLead.serviceType || [];
        const serviceDesc = serviceTypes.length > 0
          ? `Tipo: ${serviceTypes.join(", ")}`
          : "";
        const valueDesc = existingLead.estimatedValue
          ? `Valor: R$ ${parseFloat(existingLead.estimatedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          : "";
        const descParts = [`Convertido do lead: ${existingLead.name}`, serviceDesc, valueDesc].filter(Boolean);

        await storage.createApp({
          name: appName,
          type: serviceTypes.includes("bpo") ? "custom" : "saas",
          status: "backlog",
          origin: "acelera",
          clientId,
          description: descParts.join(" | "),
        });
      }
    }

    const lead = await storage.updateLead(req.params.id, req.body);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  });

  app.delete("/api/leads/:id", async (req, res) => {
    const success = await storage.deleteLead(req.params.id);
    if (!success) return res.status(404).json({ error: "Lead not found" });
    res.status(204).end();
  });

  // Proposals
  app.get("/api/proposals", async (_req, res) => {
    const proposals = await storage.getProposals();
    res.json(proposals);
  });

  app.post("/api/proposals", async (req, res) => {
    const result = insertProposalSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const proposal = await storage.createProposal(result.data);
    res.status(201).json(proposal);
  });

  app.put("/api/proposals/:id", async (req, res) => {
    const proposal = await storage.updateProposal(req.params.id, req.body);
    if (!proposal) return res.status(404).json({ error: "Proposal not found" });
    res.json(proposal);
  });

  app.delete("/api/proposals/:id", async (req, res) => {
    const success = await storage.deleteProposal(req.params.id);
    if (!success) return res.status(404).json({ error: "Proposal not found" });
    res.status(204).end();
  });

  // Users
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const data = { ...result.data };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await storage.createUser(data);
    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
  });

  const updateUserSchema = insertUserSchema.partial();
  app.put("/api/users/:id", async (req, res) => {
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const data = { ...result.data };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await storage.updateUser(req.params.id, data);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.delete("/api/users/:id", async (req, res) => {
    const success = await storage.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: "User not found" });
    res.status(204).end();
  });

  // Integrations
  app.get("/api/integrations", async (_req, res) => {
    const integrations = await storage.getIntegrations();
    res.json(integrations);
  });

  app.post("/api/integrations", async (req, res) => {
    const result = insertIntegrationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const integration = await storage.createIntegration(result.data);
    res.status(201).json(integration);
  });

  const updateIntegrationSchema = insertIntegrationSchema.partial();
  app.put("/api/integrations/:id", async (req, res) => {
    const result = updateIntegrationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const integration = await storage.updateIntegration(req.params.id, result.data);
    if (!integration) return res.status(404).json({ error: "Integration not found" });
    res.json(integration);
  });

  app.delete("/api/integrations/:id", async (req, res) => {
    const success = await storage.deleteIntegration(req.params.id);
    if (!success) return res.status(404).json({ error: "Integration not found" });
    res.status(204).end();
  });

  // App Documents
  app.get("/api/apps/:appId/documents", async (req, res) => {
    const docs = await storage.getAppDocuments(req.params.appId);
    res.json(docs);
  });

  app.post("/api/apps/:appId/documents", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const app = await storage.getApp(req.params.appId);
    if (!app) {
      fs.unlinkSync(path.join(uploadsDir, file.filename));
      return res.status(404).json({ error: "App not found" });
    }

    const validCategories = ["documentation", "pricing", "presentation", "contract", "proposal", "report", "other"];
    const category = validCategories.includes(req.body.category) ? req.body.category : "other";
    const name = req.body.name || file.originalname;

    const doc = await storage.createAppDocument({
      appId: req.params.appId,
      name,
      originalName: file.originalname,
      category,
      mimeType: file.mimetype,
      size: file.size,
      path: file.filename,
    });
    res.status(201).json(doc);
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    const doc = await storage.getAppDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadsDir, doc.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on disk" });

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.sendFile(filePath);
  });

  app.get("/api/documents/:id/preview", async (req, res) => {
    const doc = await storage.getAppDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadsDir, doc.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on disk" });

    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    res.sendFile(filePath);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    const doc = await storage.getAppDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadsDir, doc.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const success = await storage.deleteAppDocument(req.params.id);
    if (!success) return res.status(404).json({ error: "Document not found" });
    res.status(204).end();
  });

  // Repository Files
  app.get("/api/apps/:appId/repo", async (req, res) => {
    const files = await storage.getRepoFiles(req.params.appId);
    res.json(files);
  });

  app.post("/api/apps/:appId/repo", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const appRecord = await storage.getApp(req.params.appId);
    if (!appRecord) {
      fs.unlinkSync(path.join(uploadsDir, file.filename));
      return res.status(404).json({ error: "App not found" });
    }

    const folderPath = req.body.folderPath || "/";
    const name = req.body.name || file.originalname;

    const repoFile = await storage.createRepoFile({
      appId: req.params.appId,
      name,
      originalName: file.originalname,
      folderPath,
      mimeType: file.mimetype,
      size: file.size,
      path: file.filename,
    });
    res.status(201).json(repoFile);
  });

  app.get("/api/repo/:id/download", async (req, res) => {
    const file = await storage.getRepoFile(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(uploadsDir, file.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on disk" });

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.sendFile(filePath);
  });

  app.patch("/api/repo/:id", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const file = await storage.renameRepoFile(req.params.id, name);
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
  });

  app.delete("/api/repo/:id", async (req, res) => {
    const file = await storage.getRepoFile(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(uploadsDir, file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const success = await storage.deleteRepoFile(req.params.id);
    if (!success) return res.status(404).json({ error: "File not found" });
    res.status(204).end();
  });

  // Tag Configs
  app.get("/api/tag-configs", async (_req, res) => {
    const configs = await storage.getTagConfigs();
    res.json(configs);
  });
  app.post("/api/tag-configs", async (req, res) => {
    const parsed = insertTagConfigSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const config = await storage.createTagConfig(parsed.data);
    res.status(201).json(config);
  });
  app.patch("/api/tag-configs/:id", async (req, res) => {
    const updated = await storage.updateTagConfig(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Tag not found" });
    res.json(updated);
  });
  app.delete("/api/tag-configs/:id", async (req, res) => {
    const success = await storage.deleteTagConfig(req.params.id);
    if (!success) return res.status(404).json({ error: "Tag not found" });
    res.status(204).end();
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // VPS Servers
  app.get("/api/vps", async (_req, res) => {
    const servers = await storage.getVpsServers();
    const safe = servers.map(({ encryptedPassword, encryptedPrivateKey, ...rest }) => ({
      ...rest,
      hasPassword: !!encryptedPassword,
      hasKey: !!encryptedPrivateKey,
    }));
    res.json(safe);
  });

  app.get("/api/vps/:id", async (req, res) => {
    const server = await storage.getVpsServer(req.params.id);
    if (!server) return res.status(404).json({ error: "Server not found" });
    const { encryptedPassword, encryptedPrivateKey, ...safe } = server;
    res.json({ ...safe, hasPassword: !!encryptedPassword, hasKey: !!encryptedPrivateKey });
  });

  const vpsCreateSchema = z.object({
    name: z.string().min(1),
    ip: z.string().min(1),
    hostname: z.string().optional().nullable(),
    port: z.coerce.number().min(1).max(65535).default(22),
    username: z.string().min(1).default("root"),
    authType: z.enum(["password", "key"]).default("password"),
    password: z.string().optional(),
    privateKey: z.string().optional(),
    notes: z.string().optional().nullable(),
  });

  app.post("/api/vps", async (req, res) => {
    const parsed = vpsCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const { password, privateKey, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (password) data.encryptedPassword = encrypt(password);
    if (privateKey) data.encryptedPrivateKey = encrypt(privateKey);
    const server = await storage.createVpsServer(data);
    const { encryptedPassword, encryptedPrivateKey, ...safe } = server;
    res.status(201).json({ ...safe, hasPassword: !!encryptedPassword, hasKey: !!encryptedPrivateKey });
  });

  app.put("/api/vps/:id", async (req, res) => {
    const parsed = vpsCreateSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const { password, privateKey, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (password && password.length > 0) data.encryptedPassword = encrypt(password);
    if (privateKey && privateKey.length > 0) data.encryptedPrivateKey = encrypt(privateKey);
    const server = await storage.updateVpsServer(req.params.id, data);
    if (!server) return res.status(404).json({ error: "Server not found" });
    const { encryptedPassword, encryptedPrivateKey, ...safe } = server;
    res.json({ ...safe, hasPassword: !!encryptedPassword, hasKey: !!encryptedPrivateKey });
  });

  app.delete("/api/vps/:id", async (req, res) => {
    const success = await storage.deleteVpsServer(req.params.id);
    if (!success) return res.status(404).json({ error: "Server not found" });
    res.status(204).end();
  });

  app.post("/api/vps/:id/test", async (req, res) => {
    const server = await storage.getVpsServer(req.params.id);
    if (!server) return res.status(404).json({ error: "Server not found" });
    try {
      if (server.encryptedPassword || server.encryptedPrivateKey) {
        try {
          if (server.encryptedPassword) decrypt(server.encryptedPassword);
          if (server.encryptedPrivateKey) decrypt(server.encryptedPrivateKey);
        } catch {
          await storage.updateVpsServer(req.params.id, { status: "offline" });
          return res.json({ connected: false, error: "Credencial inválida: a senha foi cadastrada em outro ambiente. Edite o servidor e re-insira a senha." });
        }
      }
      const ok = await testConnection(server);
      if (ok) {
        await storage.updateVpsServer(req.params.id, { status: "online" });
      } else {
        await storage.updateVpsServer(req.params.id, { status: "offline" });
      }
      res.json({ connected: ok });
    } catch (err: any) {
      await storage.updateVpsServer(req.params.id, { status: "offline" });
      res.json({ connected: false, error: err.message });
    }
  });

  app.post("/api/vps/:id/execute", async (req, res) => {
    const server = await storage.getVpsServer(req.params.id);
    if (!server) return res.status(404).json({ error: "Server not found" });
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "Command required" });
    try {
      if (server.encryptedPassword || server.encryptedPrivateKey) {
        try {
          if (server.encryptedPassword) decrypt(server.encryptedPassword);
          if (server.encryptedPrivateKey) decrypt(server.encryptedPrivateKey);
        } catch {
          return res.status(400).json({ error: "Credencial inválida: a senha foi cadastrada em outro ambiente. Edite o servidor e re-insira a senha." });
        }
      }
      const result = await executeCommand(server, command);
      await storage.createVpsCommandLog({
        vpsId: server.id,
        command,
        output: result.output,
        exitCode: result.exitCode,
      });
      res.json(result);
    } catch (err: any) {
      await storage.createVpsCommandLog({
        vpsId: server.id,
        command,
        output: `ERROR: ${err.message}`,
        exitCode: -1,
      });
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/vps/:id/info", async (req, res) => {
    const server = await storage.getVpsServer(req.params.id);
    if (!server) return res.status(404).json({ error: "Server not found" });
    try {
      if (server.encryptedPassword || server.encryptedPrivateKey) {
        try {
          if (server.encryptedPassword) decrypt(server.encryptedPassword);
          if (server.encryptedPrivateKey) decrypt(server.encryptedPrivateKey);
        } catch {
          await storage.updateVpsServer(req.params.id, { status: "offline" });
          return res.status(400).json({ error: "Credencial inválida: a senha foi cadastrada em outro ambiente. Edite o servidor e re-insira a senha." });
        }
      }
      const info = await getServerInfo(server);
      await storage.updateVpsServer(req.params.id, { status: "online", os: info.os });
      res.json(info);
    } catch (err: any) {
      await storage.updateVpsServer(req.params.id, { status: "offline" });
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/vps/:id/logs", async (req, res) => {
    const logs = await storage.getVpsCommandLogs(req.params.id);
    res.json(logs);
  });

  app.get("/api/vps/:id/apps", async (req, res) => {
    const links = await storage.getVpsAppLinks(req.params.id);
    res.json(links);
  });

  app.post("/api/vps/:id/apps", async (req, res) => {
    const { appId } = req.body;
    if (!appId) return res.status(400).json({ error: "appId required" });
    const link = await storage.createVpsAppLink({ vpsId: req.params.id, appId });
    res.status(201).json(link);
  });

  app.delete("/api/vps/:vpsId/apps/:linkId", async (req, res) => {
    const success = await storage.deleteVpsAppLink(req.params.linkId);
    if (!success) return res.status(404).json({ error: "Link not found" });
    res.status(204).end();
  });

  // AI Configs
  app.get("/api/ai-configs", async (_req, res) => {
    const configs = await storage.getAiConfigs();
    const safe = configs.map(({ apiKey, ...rest }) => ({
      ...rest,
      apiKeyMasked: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "",
    }));
    res.json(safe);
  });

  app.post("/api/ai-configs", async (req, res) => {
    const { apiKey, ...rest } = req.body;
    if (!apiKey) return res.status(400).json({ error: "API Key obrigatória" });
    const encKey = encryptApiKey(apiKey);
    const data = { ...rest, apiKey: encKey };
    const parsed = insertAiConfigSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const config = await storage.createAiConfig(parsed.data);
    const { apiKey: _, ...safe } = config;
    res.status(201).json(safe);
  });

  const updateAiConfigSchema = z.object({
    name: z.string().min(1).optional(),
    provider: z.enum(["openai", "anthropic", "google"]).optional(),
    model: z.string().min(1).optional(),
    apiKey: z.string().optional(),
    active: z.boolean().optional(),
    priority: z.number().int().optional(),
  });

  app.put("/api/ai-configs/:id", async (req, res) => {
    const parsed = updateAiConfigSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const { apiKey, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (apiKey && apiKey.length > 0) {
      data.apiKey = encryptApiKey(apiKey);
    }
    const config = await storage.updateAiConfig(req.params.id, data);
    if (!config) return res.status(404).json({ error: "Config not found" });
    const { apiKey: _, ...safe } = config;
    res.json(safe);
  });

  app.delete("/api/ai-configs/:id", async (req, res) => {
    const success = await storage.deleteAiConfig(req.params.id);
    if (!success) return res.status(404).json({ error: "Config not found" });
    res.status(204).end();
  });

  app.post("/api/ai-configs/:id/test", async (req, res) => {
    const config = await storage.getAiConfig(req.params.id);
    if (!config) return res.status(404).json({ error: "Config not found" });
    try {
      let key: string;
      try {
        key = decrypt(config.apiKey);
      } catch {
        return res.json({ success: false, error: "API Key inválida: foi cadastrada em outro ambiente. Edite o provedor e re-insira a API Key." });
      }
      const result = await testAiConnection(key, config.model, config.provider);
      res.json(result);
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  // AI Chat
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messages required" });
    try {
      const response = await chat(messages as AiChatMessage[], context);
      res.json({ response });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/analyze-vps", async (req, res) => {
    const { serverName, command, output } = req.body;
    if (!serverName || !command || !output) return res.status(400).json({ error: "serverName, command, output required" });
    try {
      const analysis = await analyzeVpsOutput(serverName, command, output);
      res.json({ analysis });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/suggest-command", async (req, res) => {
    const { description, serverInfo } = req.body;
    if (!description) return res.status(400).json({ error: "description required" });
    try {
      const suggestion = await suggestVpsCommand(description, serverInfo);
      res.json({ suggestion });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/vps/:id/databases", async (req, res) => {
    const dbs = await storage.getVpsDatabases(req.params.id);
    res.json(dbs);
  });

  app.post("/api/vps/:id/databases", async (req, res) => {
    const data = { ...req.body, vpsId: req.params.id };
    const parsed = insertVpsDatabaseSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const row = await storage.createVpsDatabase(parsed.data);
    res.status(201).json(row);
  });

  app.patch("/api/vps-databases/:id", async (req, res) => {
    const row = await storage.updateVpsDatabase(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Banco não encontrado" });
    res.json(row);
  });

  app.delete("/api/vps-databases/:id", async (req, res) => {
    const ok = await storage.deleteVpsDatabase(req.params.id);
    if (!ok) return res.status(404).json({ error: "Banco não encontrado" });
    res.json({ success: true });
  });

  app.get("/api/vps-databases/:id/apps", async (req, res) => {
    const links = await storage.getVpsDbAppLinks(req.params.id);
    res.json(links);
  });

  app.post("/api/vps-databases/:id/apps", async (req, res) => {
    const data = { ...req.body, databaseId: req.params.id };
    const parsed = insertVpsDbAppLinkSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const row = await storage.createVpsDbAppLink(parsed.data);
    res.status(201).json(row);
  });

  app.delete("/api/vps-db-app-links/:id", async (req, res) => {
    const ok = await storage.deleteVpsDbAppLink(req.params.id);
    if (!ok) return res.status(404).json({ error: "Link não encontrado" });
    res.json({ success: true });
  });

  app.get("/api/vps/:id/sftp/list", async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const dirPath = (req.query.path as string) || "/";
      const entries = await sftpListDir(server as any, dirPath);
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao listar diretório" });
    }
  });

  app.get("/api/vps/:id/sftp/download", async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const filePath = req.query.path as string;
      if (!filePath) return res.status(400).json({ error: "Caminho do arquivo não informado" });
      const { data, size } = await sftpReadFile(server as any, filePath);
      const fileName = filePath.split("/").pop() || "file";
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        txt: "text/plain", log: "text/plain", conf: "text/plain", cfg: "text/plain", ini: "text/plain",
        sh: "text/x-shellscript", bash: "text/x-shellscript", py: "text/x-python", js: "text/javascript",
        ts: "text/typescript", json: "application/json", xml: "application/xml", yaml: "text/yaml", yml: "text/yaml",
        html: "text/html", css: "text/css", md: "text/markdown",
        pdf: "application/pdf",
        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
        mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", wav: "audio/wav",
        zip: "application/zip", gz: "application/gzip", tar: "application/x-tar",
      };
      const mime = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);
      res.setHeader("Content-Length", size);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.send(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao baixar arquivo" });
    }
  });

  app.get("/api/vps/:id/sftp/preview", async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const filePath = req.query.path as string;
      if (!filePath) return res.status(400).json({ error: "Caminho do arquivo não informado" });
      const { data, size } = await sftpReadFile(server as any, filePath);
      const fileName = filePath.split("/").pop() || "file";
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        txt: "text/plain", log: "text/plain", conf: "text/plain", cfg: "text/plain", ini: "text/plain",
        sh: "text/x-shellscript", bash: "text/x-shellscript", py: "text/x-python", js: "text/javascript",
        ts: "text/typescript", json: "application/json", xml: "application/xml", yaml: "text/yaml", yml: "text/yaml",
        html: "text/html", css: "text/css", md: "text/markdown",
        pdf: "application/pdf",
        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
        mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", wav: "audio/wav",
      };
      const mime = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
      res.send(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao visualizar arquivo" });
    }
  });

  const sftpUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
  app.post("/api/vps/:id/sftp/upload", sftpUpload.single("file"), async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const destPath = req.body.path;
      if (!destPath) return res.status(400).json({ error: "Caminho de destino não informado" });
      if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
      await sftpWriteFile(server as any, destPath, req.file.buffer);
      res.json({ success: true, path: destPath, size: req.file.size });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao fazer upload" });
    }
  });

  app.delete("/api/vps/:id/sftp/file", async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const filePath = req.query.path as string;
      if (!filePath) return res.status(400).json({ error: "Caminho não informado" });
      await sftpDeleteFile(server as any, filePath);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao excluir arquivo" });
    }
  });

  app.post("/api/vps/:id/sftp/mkdir", async (req, res) => {
    try {
      const server = await storage.getVpsServer(req.params.id);
      if (!server) return res.status(404).json({ error: "Servidor não encontrado" });
      const dirPath = req.body.path;
      if (!dirPath) return res.status(400).json({ error: "Caminho não informado" });
      await sftpMkdir(server as any, dirPath);
      res.json({ success: true, path: dirPath });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao criar pasta" });
    }
  });

  // Origins
  app.get("/api/origins", async (_req, res) => {
    const rows = await storage.getOrigins();
    res.json(rows);
  });

  app.post("/api/origins", async (req, res) => {
    const { insertOriginSchema } = await import("@shared/schema");
    const parsed = insertOriginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const row = await storage.createOrigin(parsed.data);
    res.status(201).json(row);
  });

  app.put("/api/origins/:id", async (req, res) => {
    const row = await storage.updateOrigin(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Origem não encontrada" });
    res.json(row);
  });

  app.delete("/api/origins/:id", async (req, res) => {
    const ok = await storage.deleteOrigin(req.params.id);
    if (!ok) return res.status(404).json({ error: "Origem não encontrada" });
    res.status(204).end();
  });

  app.get("/api/client-types", async (_req, res) => {
    const rows = await storage.getClientTypes();
    res.json(rows);
  });

  app.post("/api/client-types", async (req, res) => {
    const { insertClientTypeSchema } = await import("@shared/schema");
    const parsed = insertClientTypeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const row = await storage.createClientType(parsed.data);
    res.status(201).json(row);
  });

  app.put("/api/client-types/:id", async (req, res) => {
    const row = await storage.updateClientType(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Tipo não encontrado" });
    res.json(row);
  });

  app.delete("/api/client-types/:id", async (req, res) => {
    const ok = await storage.deleteClientType(req.params.id);
    if (!ok) return res.status(404).json({ error: "Tipo não encontrado" });
    res.status(204).end();
  });

  app.get("/api/app-clients/:appId", async (req, res) => {
    const rows = await storage.getAppClients(req.params.appId);
    res.json(rows);
  });

  app.post("/api/app-clients", async (req, res) => {
    const { insertAppClientSchema } = await import("@shared/schema");
    const parsed = insertAppClientSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const row = await storage.createAppClient(parsed.data);
    res.status(201).json(row);
  });

  app.delete("/api/app-clients/:id", async (req, res) => {
    const ok = await storage.deleteAppClient(req.params.id);
    if (!ok) return res.status(404).json({ error: "Link não encontrado" });
    res.status(204).end();
  });

  app.get("/api/health-map", async (_req, res) => {
    const [vpsServers, allApps, allLinks, allDevelopers, allTasks, allDatabases, allDbAppLinks, allClients, allAppClients, allAlertHistory, allAppMonitors] = await Promise.all([
      storage.getVpsServers(),
      storage.getApps(),
      storage.getAllVpsAppLinks(),
      storage.getDevelopers(),
      storage.getKanbanTasks(),
      storage.getAllVpsDatabases(),
      storage.getAllVpsDbAppLinks(),
      storage.getClients(),
      storage.getAllAppClients(),
      storage.getAlertHistory(),
      storage.getAppMonitors(),
    ]);

    const vpsMetricsMap: Record<string, any> = {};
    for (const vps of vpsServers) {
      const latest = await storage.getLatestVpsMetric(vps.id);
      if (latest) vpsMetricsMap[vps.id] = latest;
    }

    const appMetricsMap: Record<string, any> = {};
    for (const mon of allAppMonitors) {
      const latest = await storage.getLatestAppMetric(mon.id);
      if (latest) appMetricsMap[mon.appId] = { ...latest, monitorType: mon.monitorType };
    }

    const activeAlerts = allAlertHistory.filter((a: any) => a.status === "firing");

    res.json({
      vpsServers, apps: allApps, links: allLinks, developers: allDevelopers,
      tasks: allTasks, databases: allDatabases, dbAppLinks: allDbAppLinks,
      clients: allClients, appClients: allAppClients,
      vpsMetrics: vpsMetricsMap, appMetrics: appMetricsMap, activeAlerts,
    });
  });

  app.post("/api/vps/monitor-all", async (_req, res) => {
    runMonitoringCycle();
    res.json({ message: "Monitoramento iniciado" });
  });

  app.get("/api/monitoring/overview", async (_req, res) => {
    const [servers, monitors, allDbs, unresolvedAlerts] = await Promise.all([
      storage.getVpsServers(),
      storage.getAppMonitors(),
      storage.getAllVpsDatabases(),
      storage.getUnresolvedAlerts(),
    ]);

    const vpsWithMetrics = await Promise.all(
      servers.map(async (s) => {
        const latest = await storage.getLatestVpsMetric(s.id);
        return { ...s, latestMetric: latest || null };
      })
    );

    const monitorsWithMetrics = await Promise.all(
      monitors.map(async (m) => {
        const latest = await storage.getLatestAppMetric(m.id);
        return { ...m, latestMetric: latest || null };
      })
    );

    const dbsWithMetrics = await Promise.all(
      allDbs.map(async (d) => {
        const latest = await storage.getLatestDbMetric(d.id);
        return { ...d, latestMetric: latest || null };
      })
    );

    res.json({
      vps: vpsWithMetrics,
      appMonitors: monitorsWithMetrics,
      databases: dbsWithMetrics,
      alerts: unresolvedAlerts,
      summary: {
        vpsOnline: servers.filter(s => s.status === "online").length,
        vpsTotal: servers.length,
        appsUp: monitorsWithMetrics.filter(m => m.latestMetric?.status === "up").length,
        appsTotal: monitors.length,
        dbsUp: dbsWithMetrics.filter(d => d.latestMetric?.status === "up").length,
        dbsTotal: allDbs.length,
        activeAlerts: unresolvedAlerts.length,
      },
    });
  });

  app.get("/api/monitoring/vps/:id/metrics", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);
    const to = new Date();
    const metrics = await storage.getVpsMetrics(req.params.id, from, to);
    res.json(metrics);
  });

  app.get("/api/monitoring/apps/:id/metrics", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);
    const to = new Date();
    const metrics = await storage.getAppMetrics(req.params.id, from, to);
    res.json(metrics);
  });

  app.get("/api/monitoring/dbs/:id/metrics", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);
    const to = new Date();
    const metrics = await storage.getDbMetrics(req.params.id, from, to);
    res.json(metrics);
  });

  app.get("/api/monitoring/app-monitors", async (_req, res) => {
    res.json(await storage.getAppMonitors());
  });
  app.post("/api/monitoring/app-monitors", async (req, res) => {
    const monitor = await storage.createAppMonitor(req.body);
    res.json(monitor);
  });
  app.put("/api/monitoring/app-monitors/:id", async (req, res) => {
    const updated = await storage.updateAppMonitor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Monitor não encontrado" });
    res.json(updated);
  });
  app.delete("/api/monitoring/app-monitors/:id", async (req, res) => {
    await storage.deleteAppMonitor(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/monitoring/alert-rules", async (_req, res) => {
    res.json(await storage.getAlertRules());
  });
  app.post("/api/monitoring/alert-rules", async (req, res) => {
    const rule = await storage.createAlertRule(req.body);
    res.json(rule);
  });
  app.put("/api/monitoring/alert-rules/:id", async (req, res) => {
    const updated = await storage.updateAlertRule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Regra não encontrada" });
    res.json(updated);
  });
  app.delete("/api/monitoring/alert-rules/:id", async (req, res) => {
    await storage.deleteAlertRule(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/monitoring/alert-destinations", async (_req, res) => {
    res.json(await storage.getAlertDestinations());
  });
  app.post("/api/monitoring/alert-destinations", async (req, res) => {
    const dest = await storage.createAlertDestination(req.body);
    res.json(dest);
  });
  app.put("/api/monitoring/alert-destinations/:id", async (req, res) => {
    const updated = await storage.updateAlertDestination(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Destino não encontrado" });
    res.json(updated);
  });
  app.delete("/api/monitoring/alert-destinations/:id", async (req, res) => {
    await storage.deleteAlertDestination(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/monitoring/alerts", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    res.json(await storage.getAlertHistory(limit));
  });
  app.get("/api/monitoring/alerts/unresolved", async (_req, res) => {
    res.json(await storage.getUnresolvedAlerts());
  });
  app.post("/api/monitoring/alerts/:id/resolve", async (req, res) => {
    const resolved = await storage.resolveAlert(req.params.id);
    if (!resolved) return res.status(404).json({ error: "Alerta não encontrado" });
    res.json(resolved);
  });

  app.get("/api/monitoring/config", async (_req, res) => {
    res.json(await storage.getMonitoringConfig());
  });
  app.put("/api/monitoring/config", async (req, res) => {
    const entries = req.body as Array<{ key: string; value: string }>;
    const results = [];
    for (const entry of entries) {
      const result = await storage.setMonitoringConfig(entry.key, entry.value);
      results.push(result);
    }
    if (entries.some(e => e.key === "collection_interval")) {
      restartMonitoring();
    }
    res.json(results);
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/ws/ssh" });

  wss.on("connection", (ws: WebSocket) => {
    let sshConn: any = null;
    let sshStream: any = null;
    function sendCtrl(msg: any) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("c" + JSON.stringify(msg));
      }
    }

    function sendOutput(data: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("o" + data);
      }
    }

    function cleanupSsh() {
      if (sshStream) {
        try { sshStream.end(); } catch {}
        sshStream = null;
      }
      if (sshConn) {
        try { sshConn.end(); } catch {}
        sshConn = null;
      }
    }

    ws.on("message", async (raw: Buffer | string) => {
      try {
        const str = raw.toString();

        if (str.length > 0 && str[0] === "i") {
          if (sshStream) sshStream.write(str.substring(1));
          return;
        }

        const msg = JSON.parse(str);

        if (msg.type === "connect") {
          cleanupSsh();
          const server = await storage.getVpsServer(msg.serverId);
          if (!server) {
            sendCtrl({ type: "error", data: "Servidor não encontrado" });
            return;
          }
          try {
            const connOpts: any = {
              host: server.ip,
              port: server.port || 22,
              username: server.username,
              readyTimeout: 15000,
              keepaliveInterval: 10000,
              keepaliveCountMax: 5,
            };
            if (server.authType === "key" && server.encryptedPrivateKey) {
              const { decrypt } = await import("./crypto");
              connOpts.privateKey = decrypt(server.encryptedPrivateKey);
            } else if (server.encryptedPassword) {
              const { decrypt } = await import("./crypto");
              connOpts.password = decrypt(server.encryptedPassword);
            }
            const { Client: SSHClient } = await import("ssh2");
            const conn = new SSHClient();
            await new Promise<void>((resolve, reject) => {
              conn.on("ready", () => resolve());
              conn.on("error", (err: Error) => reject(err));
              conn.connect(connOpts);
            });
            sshConn = conn;
          } catch (err: any) {
            sendCtrl({ type: "error", data: `Falha na conexão SSH: ${err.message}` });
            return;
          }

          const cols = msg.cols || 120;
          const rows = msg.rows || 30;

          sshConn.on("error", (err: any) => {
            sendCtrl({ type: "error", data: `SSH error: ${err.message}` });
            cleanupSsh();
          });

          sshConn.on("end", () => {
            sendCtrl({ type: "disconnected" });
            sshConn = null;
            sshStream = null;
          });

          sshConn.shell({ term: "xterm-256color", cols, rows }, (err: any, stream: any) => {
            if (err) {
              sendCtrl({ type: "error", data: `Falha ao abrir shell: ${err.message}` });
              cleanupSsh();
              return;
            }
            sshStream = stream;
            sendCtrl({ type: "connected" });

            stream.on("data", (data: Buffer) => {
              sendOutput(data.toString("utf-8"));
            });

            stream.stderr?.on("data", (data: Buffer) => {
              sendOutput(data.toString("utf-8"));
            });

            stream.on("close", () => {
              sendCtrl({ type: "disconnected" });
              cleanupSsh();
            });
          });
        } else if (msg.type === "input" && sshStream) {
          sshStream.write(msg.data);
        } else if (msg.type === "resize" && sshStream) {
          sshStream.setWindow(msg.rows, msg.cols, 0, 0);
        }
      } catch (e: any) {
        console.error("[WS SSH] Error:", e.message);
      }
    });

    ws.on("close", () => { cleanupSsh(); });
    ws.on("error", () => { cleanupSsh(); });
  });

  (async () => {
    const existingRoles = await storage.getPermissionRoles();
    if (existingRoles.length === 0) {
      const admin = await storage.createPermissionRole({ name: "Administrador", description: "Acesso total ao sistema", color: "#ef4444", level: 0, isSystem: true });
      const manager = await storage.createPermissionRole({ name: "Gerente", description: "Gerencia operações e equipe", color: "#f59e0b", level: 1, parentRoleId: admin.id, isSystem: true });
      const dev = await storage.createPermissionRole({ name: "Desenvolvedor", description: "Acesso a módulos de desenvolvimento", color: "#3b82f6", level: 2, parentRoleId: manager.id, isSystem: true });
      await storage.createPermissionRole({ name: "Visualizador", description: "Apenas visualização", color: "#6b7280", level: 3, parentRoleId: manager.id, isSystem: true });
      for (const mod of SYSTEM_MODULES) {
        const allTrue: Record<string, boolean> = {};
        mod.actions.forEach((a: string) => { allTrue[a] = true; });
        await storage.setRolePermissions(admin.id, mod.key, allTrue);
      }
      for (const mod of SYSTEM_MODULES) {
        const perms: Record<string, boolean> = {};
        mod.actions.forEach((a: string) => {
          if (["ssh", "execute", "manage_roles", "assign_users", "configure"].includes(a)) {
            perms[a] = false;
          } else {
            perms[a] = true;
          }
        });
        await storage.setRolePermissions(manager.id, mod.key, perms);
      }
      for (const mod of SYSTEM_MODULES) {
        if (["settings", "settings.users", "settings.integrations", "settings.ai", "settings.monitoring", "permissions", "financial", "payments"].includes(mod.key)) continue;
        const perms: Record<string, boolean> = {};
        mod.actions.forEach((a: string) => {
          if (["view", "create", "edit", "move"].includes(a)) perms[a] = true;
          else perms[a] = false;
        });
        await storage.setRolePermissions(dev.id, mod.key, perms);
      }
      console.log("[Permissions] Seed: 4 roles + permissions criados");
    }
  })();

  app.get("/api/permissions/modules", (_req, res) => {
    res.json(SYSTEM_MODULES);
  });

  app.get("/api/permissions/roles", async (_req, res) => {
    const roles = await storage.getPermissionRoles();
    const rolesWithCounts = await Promise.all(
      roles.map(async (r) => ({
        ...r,
        usersCount: await storage.getUsersCountByRole(r.id),
      }))
    );
    res.json(rolesWithCounts);
  });

  app.post("/api/permissions/roles", async (req, res) => {
    const parsed = insertPermissionRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const role = await storage.createPermissionRole(parsed.data);
    res.status(201).json(role);
  });

  app.patch("/api/permissions/roles/:id", async (req, res) => {
    const role = await storage.getPermissionRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    const allowed = insertPermissionRoleSchema.partial().safeParse(req.body);
    if (!allowed.success) return res.status(400).json({ error: allowed.error });
    const updated = await storage.updatePermissionRole(req.params.id, allowed.data);
    res.json(updated);
  });

  app.delete("/api/permissions/roles/:id", async (req, res) => {
    const role = await storage.getPermissionRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    await storage.deletePermissionRole(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/permissions/roles/:id/permissions", async (req, res) => {
    const perms = await storage.getRolePermissions(req.params.id);
    res.json(perms);
  });

  const permissionEntrySchema = z.object({
    moduleKey: z.string().min(1),
    permissions: z.record(z.string(), z.boolean()),
  });

  app.put("/api/permissions/roles/:id/permissions", async (req, res) => {
    const role = await storage.getPermissionRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    const parsed = z.object({ entries: z.array(permissionEntrySchema) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const validModuleKeys = new Set(SYSTEM_MODULES.map(m => m.key));
    const validEntries = parsed.data.entries.filter(e => validModuleKeys.has(e.moduleKey));
    const results = await storage.bulkSetRolePermissions(req.params.id, validEntries);
    res.json(results);
  });

  app.get("/api/permissions/map", async (_req, res) => {
    const roles = await storage.getPermissionRoles();
    const rolesWithData = await Promise.all(
      roles.map(async (r) => ({
        ...r,
        usersCount: await storage.getUsersCountByRole(r.id),
        permissions: await storage.getRolePermissions(r.id),
      }))
    );
    const allUsers = await storage.getUsers();
    res.json({
      roles: rolesWithData,
      modules: SYSTEM_MODULES,
      users: allUsers.map((u) => ({ id: u.id, name: u.name, username: u.username, roleId: u.roleId, active: u.active })),
    });
  });

  app.patch("/api/users/:id/role", async (req, res) => {
    const parsed = z.object({ roleId: z.string().nullable() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const { roleId } = parsed.data;
    if (roleId) {
      const role = await storage.getPermissionRole(roleId);
      if (!role) return res.status(400).json({ error: "Role not found" });
    }
    const updated = await storage.updateUserRole(req.params.id, roleId);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  });

  initMonitoring();

  return httpServer;
}
