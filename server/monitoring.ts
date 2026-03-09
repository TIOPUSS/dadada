import { storage } from "./storage";
import { testConnection, executeCommand, getServerInfo } from "./ssh";
import { decrypt } from "./crypto";
import type { VpsServer, AppMonitor, VpsDatabase } from "@shared/schema";

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

function canDecrypt(server: VpsServer): boolean {
  try {
    if (server.encryptedPassword) decrypt(server.encryptedPassword);
    if (server.encryptedPrivateKey) decrypt(server.encryptedPrivateKey);
    return true;
  } catch {
    return false;
  }
}

function parseUptimeToSeconds(uptimeStr: string): number {
  let seconds = 0;
  const dayMatch = uptimeStr.match(/(\d+)\s*day/);
  const hourMatch = uptimeStr.match(/(\d+)\s*hour/);
  const minMatch = uptimeStr.match(/(\d+)\s*min/);
  if (dayMatch) seconds += parseInt(dayMatch[1]) * 86400;
  if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;
  if (minMatch) seconds += parseInt(minMatch[1]) * 60;
  return seconds;
}

export async function collectVpsMetrics(server: VpsServer): Promise<void> {
  if (!canDecrypt(server)) {
    await storage.updateVpsServer(server.id, { status: "offline" });
    return;
  }

  try {
    const info = await getServerInfo(server);
    await storage.updateVpsServer(server.id, { status: "online", os: info.os });

    const cpuPercent = parseLoadAsPercent(info.loadAvg, info.cpu);
    const memPercent = parseFloat(info.memory.percent.replace("%", "")) || 0;
    const diskPercent = parseFloat(info.disk.percent.replace("%", "")) || 0;
    const loadParts = info.loadAvg.split(",").map(s => s.trim());

    let processCount: number | undefined;
    let networkIn: string | undefined;
    let networkOut: string | undefined;
    try {
      const extraCmd = "ps aux --no-heading 2>/dev/null | wc -l && cat /proc/net/dev 2>/dev/null | tail -n +3 | awk '{rx+=$2; tx+=$10} END {print rx, tx}'";
      const extraResult = await executeCommand(server, extraCmd);
      const extraLines = extraResult.output.trim().split("\n");
      if (extraLines[0]) processCount = parseInt(extraLines[0]) || undefined;
      if (extraLines[1]) {
        const netParts = extraLines[1].trim().split(/\s+/);
        if (netParts.length >= 2) {
          networkIn = netParts[0];
          networkOut = netParts[1];
        }
      }
    } catch {}

    await storage.createVpsMetric({
      vpsId: server.id,
      cpuPercent: cpuPercent.toFixed(1),
      memoryPercent: memPercent.toFixed(1),
      diskPercent: diskPercent.toFixed(1),
      loadAvg1: loadParts[0] || "0",
      loadAvg5: loadParts[1] || "0",
      loadAvg15: loadParts[2] || "0",
      networkIn: networkIn || null,
      networkOut: networkOut || null,
      processCount: processCount || null,
      uptimeSeconds: parseUptimeToSeconds(info.uptime),
      collectedAt: new Date(),
    });
  } catch {
    await storage.updateVpsServer(server.id, { status: "offline" });
  }
}

function parseLoadAsPercent(loadAvg: string, cpuStr: string): number {
  const load1 = parseFloat(loadAvg.split(",")[0]?.trim() || "0");
  const cores = parseInt(cpuStr.replace(/[^0-9]/g, "")) || 1;
  return Math.min((load1 / cores) * 100, 100);
}

export async function collectAppMetrics(monitor: AppMonitor): Promise<void> {
  if (!monitor.enabled) return;

  if (monitor.monitorType === "http" && monitor.endpoint) {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(monitor.endpoint, { signal: controller.signal });
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      const isOk = response.status === (monitor.expectedStatus || 200);

      await storage.createAppMetric({
        appMonitorId: monitor.id,
        status: isOk ? "up" : "degraded",
        responseTimeMs: responseTime,
        statusCode: response.status,
        errorMessage: isOk ? null : `Status ${response.status}`,
        collectedAt: new Date(),
      });
    } catch (err: any) {
      await storage.createAppMetric({
        appMonitorId: monitor.id,
        status: "down",
        responseTimeMs: Date.now() - startTime,
        statusCode: null,
        errorMessage: err.message || "Falha na conexão",
        collectedAt: new Date(),
      });
    }
  } else if ((monitor.monitorType === "pm2" || monitor.monitorType === "docker") && monitor.vpsId) {
    try {
      const server = await storage.getVpsServer(monitor.vpsId);
      if (!server || !canDecrypt(server)) {
        await storage.createAppMetric({
          appMonitorId: monitor.id,
          status: "down",
          responseTimeMs: null,
          statusCode: null,
          errorMessage: "Servidor VPS inacessível",
          collectedAt: new Date(),
        });
        return;
      }

      const startTime = Date.now();
      const cmd = monitor.monitorType === "pm2"
        ? `pm2 jlist 2>/dev/null || echo '[]'`
        : `docker ps --format '{{.Names}}|{{.Status}}' 2>/dev/null || echo ''`;

      const result = await executeCommand(server, cmd);
      const responseTime = Date.now() - startTime;
      const serviceName = monitor.endpoint || "";

      if (monitor.monitorType === "pm2") {
        try {
          const processes = JSON.parse(result.output.trim());
          const proc = Array.isArray(processes)
            ? processes.find((p: any) => p.name === serviceName || p.pm_id?.toString() === serviceName)
            : null;

          await storage.createAppMetric({
            appMonitorId: monitor.id,
            status: proc && proc.pm2_env?.status === "online" ? "up" : proc ? "degraded" : "down",
            responseTimeMs: responseTime,
            statusCode: null,
            errorMessage: proc ? null : `Processo "${serviceName}" não encontrado`,
            collectedAt: new Date(),
          });
        } catch {
          await storage.createAppMetric({
            appMonitorId: monitor.id,
            status: "down",
            responseTimeMs: responseTime,
            statusCode: null,
            errorMessage: "Erro ao parsear PM2",
            collectedAt: new Date(),
          });
        }
      } else {
        const lines = result.output.trim().split("\n").filter(Boolean);
        const container = lines.find(l => l.toLowerCase().includes(serviceName.toLowerCase()));

        await storage.createAppMetric({
          appMonitorId: monitor.id,
          status: container && container.toLowerCase().includes("up") ? "up" : "down",
          responseTimeMs: responseTime,
          statusCode: null,
          errorMessage: container ? null : `Container "${serviceName}" não encontrado`,
          collectedAt: new Date(),
        });
      }
    } catch (err: any) {
      await storage.createAppMetric({
        appMonitorId: monitor.id,
        status: "down",
        responseTimeMs: null,
        statusCode: null,
        errorMessage: err.message || "Erro SSH",
        collectedAt: new Date(),
      });
    }
  }
}

export async function collectDbMetrics(database: VpsDatabase): Promise<void> {
  try {
    const server = await storage.getVpsServer(database.vpsId);
    if (!server || !canDecrypt(server)) {
      await storage.createDbMetric({
        databaseId: database.id,
        status: "down",
        connectionsActive: null,
        sizeBytes: null,
        responseTimeMs: null,
        collectedAt: new Date(),
      });
      return;
    }

    const startTime = Date.now();
    let cmd = "";
    const dbName = database.databaseName;
    const host = database.host || "localhost";
    const port = database.port || 5432;

    switch (database.type) {
      case "postgresql":
        cmd = `psql -h ${host} -p ${port} -d ${dbName} -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='${dbName}'" 2>/dev/null && psql -h ${host} -p ${port} -d ${dbName} -t -c "SELECT pg_database_size('${dbName}')" 2>/dev/null`;
        break;
      case "mysql":
      case "mariadb":
        cmd = `mysql -h ${host} -P ${port} ${dbName} -e "SELECT count(*) FROM information_schema.processlist WHERE db='${dbName}'; SELECT data_length + index_length FROM information_schema.tables WHERE table_schema='${dbName}'" -N 2>/dev/null`;
        break;
      case "mongodb":
        cmd = `mongosh --host ${host} --port ${port} --eval "db.serverStatus().connections.current" --quiet 2>/dev/null`;
        break;
      case "redis":
        cmd = `redis-cli -h ${host} -p ${port} info clients 2>/dev/null | grep connected_clients | cut -d: -f2`;
        break;
      default:
        cmd = `echo "1"`;
    }

    try {
      const result = await executeCommand(server, cmd);
      const responseTime = Date.now() - startTime;
      const lines = result.output.trim().split("\n").filter(Boolean);
      const connections = parseInt(lines[0]?.trim() || "0") || 0;
      const size = lines[1]?.trim() || null;

      await storage.createDbMetric({
        databaseId: database.id,
        status: "up",
        connectionsActive: connections,
        sizeBytes: size,
        responseTimeMs: responseTime,
        collectedAt: new Date(),
      });
    } catch {
      await storage.createDbMetric({
        databaseId: database.id,
        status: "down",
        connectionsActive: null,
        sizeBytes: null,
        responseTimeMs: Date.now() - startTime,
        collectedAt: new Date(),
      });
    }
  } catch {
    await storage.createDbMetric({
      databaseId: database.id,
      status: "down",
      connectionsActive: null,
      sizeBytes: null,
      responseTimeMs: null,
      collectedAt: new Date(),
    });
  }
}

export async function checkAlertRules(): Promise<void> {
  const alertsEnabled = await storage.getMonitoringConfigValue("alerts_enabled");
  if (alertsEnabled !== "true") return;

  const rules = await storage.getEnabledAlertRules();
  const destinations = await storage.getEnabledAlertDestinations();

  for (const rule of rules) {
    try {
      let currentValue: number | null = null;

      if (rule.targetType === "vps" && rule.targetId) {
        const metric = await storage.getLatestVpsMetric(rule.targetId);
        if (!metric) continue;
        switch (rule.metric) {
          case "cpu": currentValue = parseFloat(metric.cpuPercent || "0"); break;
          case "memory": currentValue = parseFloat(metric.memoryPercent || "0"); break;
          case "disk": currentValue = parseFloat(metric.diskPercent || "0"); break;
          case "load": currentValue = parseFloat(metric.loadAvg1 || "0"); break;
        }
      } else if (rule.targetType === "app" && rule.targetId) {
        const metric = await storage.getLatestAppMetric(rule.targetId);
        if (!metric) continue;
        switch (rule.metric) {
          case "status": currentValue = metric.status === "down" ? 1 : 0; break;
          case "responseTime": currentValue = metric.responseTimeMs || 0; break;
        }
      } else if (rule.targetType === "db" && rule.targetId) {
        const metric = await storage.getLatestDbMetric(rule.targetId);
        if (!metric) continue;
        switch (rule.metric) {
          case "status": currentValue = metric.status === "down" ? 1 : 0; break;
          case "connections": currentValue = metric.connectionsActive || 0; break;
        }
      }

      if (currentValue === null) continue;

      const threshold = parseFloat(rule.threshold || "0");
      let triggered = false;
      switch (rule.operator) {
        case "gt": triggered = currentValue > threshold; break;
        case "lt": triggered = currentValue < threshold; break;
        case "eq": triggered = currentValue === threshold; break;
      }

      if (triggered) {
        const existing = await storage.getUnresolvedAlerts();
        const alreadyFiring = existing.find(a => a.alertRuleId === rule.id);
        if (!alreadyFiring) {
          const servers = await storage.getVpsServers();
          const apps = await storage.getApps();
          const targetName = rule.targetType === "vps"
            ? servers.find(s => s.id === rule.targetId)?.name
            : apps.find(a => a.id === rule.targetId)?.name || rule.targetId;

          const message = `[${rule.severity.toUpperCase()}] ${rule.name}: ${rule.metric} = ${currentValue.toFixed(1)} (limite: ${rule.operator} ${threshold}) em ${targetName}`;

          await storage.createAlertHistory({
            alertRuleId: rule.id,
            targetType: rule.targetType,
            targetId: rule.targetId,
            metric: rule.metric,
            value: currentValue.toFixed(1),
            threshold: rule.threshold,
            severity: rule.severity,
            status: "firing",
            message,
            sentTo: JSON.stringify(destinations.map(d => d.name)),
            firedAt: new Date(),
            resolvedAt: null,
          });

          for (const dest of destinations) {
            await sendToDestination(dest, message);
          }
        }
      } else {
        const existing = await storage.getUnresolvedAlerts();
        const firing = existing.find(a => a.alertRuleId === rule.id);
        if (firing) {
          await storage.resolveAlert(firing.id);
        }
      }
    } catch (err) {
      console.error(`[Monitor] Erro ao verificar regra ${rule.name}:`, err);
    }
  }
}

async function sendToDestination(dest: { type: string; config: string; name: string }, message: string): Promise<void> {
  if (dest.type === "webhook") {
    try {
      const config = JSON.parse(dest.config);
      const url = config.url;
      if (url) {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message, content: message, message }),
        });
      }
    } catch (err) {
      console.error(`[Monitor] Erro ao enviar webhook para ${dest.name}:`, err);
    }
  }
}

export async function cleanOldMetrics(): Promise<void> {
  const retentionStr = await storage.getMonitoringConfigValue("retention_days");
  const retentionDays = parseInt(retentionStr || "7");
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const deleted = await storage.deleteVpsMetricsOlderThan(cutoff);
  if (deleted > 0) {
    console.log(`[Monitor] Limpou ${deleted} métricas antigas`);
  }
}

export async function runMonitoringCycle(): Promise<void> {
  console.log(`[Monitor] Iniciando ciclo de coleta...`);
  try {
    const servers = await storage.getVpsServers();
    for (const server of servers) {
      await collectVpsMetrics(server);
    }

    const monitors = await storage.getAppMonitors();
    for (const monitor of monitors) {
      if (monitor.enabled) {
        await collectAppMetrics(monitor);
      }
    }

    const allDbs = await storage.getAllVpsDatabases();
    for (const database of allDbs) {
      await collectDbMetrics(database);
    }

    await checkAlertRules();
    await cleanOldMetrics();

    console.log(`[Monitor] Ciclo completo: ${servers.length} VPS, ${monitors.length} apps, ${allDbs.length} bancos`);
  } catch (err) {
    console.error("[Monitor] Erro no ciclo:", err);
  }
}

export async function initMonitoring(): Promise<void> {
  try {
    const servers = await storage.getVpsServers();
    for (const server of servers) {
      await storage.updateVpsServer(server.id, { status: "unknown" });
    }
    console.log(`[Monitor] Reset ${servers.length} VPS status(es) para unknown`);
  } catch (err) {
    console.error("[Monitor] Falha ao resetar statuses:", err);
  }

  runMonitoringCycle();

  const intervalStr = await storage.getMonitoringConfigValue("collection_interval");
  const intervalMinutes = parseInt(intervalStr || "5");
  monitoringInterval = setInterval(runMonitoringCycle, intervalMinutes * 60 * 1000);
  console.log(`[Monitor] Agendado a cada ${intervalMinutes} minutos`);
}

export function restartMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  initMonitoring();
}
