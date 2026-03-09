import { Client as SSHClient } from "ssh2";
import type { SFTPWrapper } from "ssh2";
import { decrypt } from "./crypto";
import type { VpsServer } from "@shared/schema";
import { Readable, Writable } from "stream";

interface CommandResult {
  output: string;
  exitCode: number;
}

export interface SftpFileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
  permissions: string;
  owner: number;
  group: number;
}

interface ServerInfo {
  hostname: string;
  os: string;
  uptime: string;
  cpu: string;
  memory: { total: string; used: string; free: string; percent: string };
  disk: { total: string; used: string; free: string; percent: string };
  loadAvg: string;
}

export function getConnection(server: VpsServer): Promise<SSHClient> {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    const config: any = {
      host: server.ip,
      port: server.port || 22,
      username: server.username,
      readyTimeout: 10000,
    };

    if (server.authType === "key" && server.encryptedPrivateKey) {
      config.privateKey = decrypt(server.encryptedPrivateKey);
    } else if (server.encryptedPassword) {
      config.password = decrypt(server.encryptedPassword);
    }

    conn.on("ready", () => resolve(conn));
    conn.on("error", (err: Error) => reject(err));
    conn.connect(config);
  });
}

export async function testConnection(server: VpsServer): Promise<boolean> {
  try {
    const conn = await getConnection(server);
    conn.end();
    return true;
  } catch {
    return false;
  }
}

export async function executeCommand(server: VpsServer, command: string): Promise<CommandResult> {
  const conn = await getConnection(server);
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        conn.end();
        reject(err);
        return;
      }

      let stdout = "";
      let stderr = "";
      let code = 0;

      stream.on("data", (data: Buffer) => {
        stdout += data.toString();
      });
      stream.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });
      stream.on("close", (exitCode: number) => {
        code = exitCode;
        conn.end();
        resolve({
          output: stdout + (stderr ? `\n[STDERR]\n${stderr}` : ""),
          exitCode: code,
        });
      });
    });
  });
}

export async function getServerInfo(server: VpsServer): Promise<ServerInfo> {
  const commands = [
    "hostname",
    "uname -sr",
    "uptime -p 2>/dev/null || uptime",
    "cat /proc/loadavg 2>/dev/null || echo 'N/A'",
    "free -h 2>/dev/null || echo 'N/A'",
    "df -h / 2>/dev/null || echo 'N/A'",
    "nproc 2>/dev/null || echo '?'",
  ];

  const result = await executeCommand(server, commands.join(" && echo '---SEPARATOR---' && "));
  const parts = result.output.split("---SEPARATOR---").map((s) => s.trim());

  const hostnameStr = parts[0] || "desconhecido";
  const osStr = parts[1] || "desconhecido";
  const uptimeStr = parts[2] || "desconhecido";
  const loadStr = parts[3] || "N/A";
  const freeStr = parts[4] || "";
  const dfStr = parts[5] || "";
  const cpuStr = parts[6] || "?";

  function parseMemValue(val: string): number {
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return 0;
    const lower = val.toLowerCase();
    if (lower.includes("ti") || lower.includes("tb")) return num * 1024 * 1024;
    if (lower.includes("gi") || lower.includes("gb") || lower.includes("g")) return num * 1024;
    if (lower.includes("mi") || lower.includes("mb") || lower.includes("m")) return num;
    if (lower.includes("ki") || lower.includes("kb") || lower.includes("k")) return num / 1024;
    return num;
  }

  let memory = { total: "N/A", used: "N/A", free: "N/A", percent: "N/A" };
  const memLines = freeStr.split("\n");
  if (memLines.length >= 2) {
    const memParts = memLines[1].split(/\s+/);
    if (memParts.length >= 4) {
      const totalMb = parseMemValue(memParts[1]);
      const usedMb = parseMemValue(memParts[2]);
      memory = {
        total: memParts[1],
        used: memParts[2],
        free: memParts[3],
        percent: totalMb > 0 ? `${Math.round((usedMb / totalMb) * 100)}%` : "N/A",
      };
    }
  }

  let disk = { total: "N/A", used: "N/A", free: "N/A", percent: "N/A" };
  const dfLines = dfStr.split("\n");
  if (dfLines.length >= 2) {
    const dfParts = dfLines[1].split(/\s+/);
    if (dfParts.length >= 5) {
      disk = {
        total: dfParts[1],
        used: dfParts[2],
        free: dfParts[3],
        percent: dfParts[4],
      };
    }
  }

  return {
    hostname: hostnameStr,
    os: osStr,
    uptime: uptimeStr,
    cpu: `${cpuStr} core(s)`,
    memory,
    disk,
    loadAvg: loadStr.split(" ").slice(0, 3).join(", "),
  };
}

function getSftp(conn: SSHClient): Promise<SFTPWrapper> {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });
}

function permString(mode: number): string {
  const types = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
  const owner = (mode >> 6) & 7;
  const group = (mode >> 3) & 7;
  const other = mode & 7;
  return types[owner] + types[group] + types[other];
}

export async function sftpListDir(server: VpsServer, dirPath: string): Promise<SftpFileEntry[]> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    const list = await new Promise<any[]>((resolve, reject) => {
      sftp.readdir(dirPath, (err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });

    const entries: SftpFileEntry[] = list
      .filter((item) => item.filename !== "." && item.filename !== "..")
      .map((item) => {
        const isDir = (item.attrs.mode & 0o40000) !== 0;
        return {
          name: item.filename,
          path: dirPath === "/" ? `/${item.filename}` : `${dirPath}/${item.filename}`,
          isDirectory: isDir,
          size: item.attrs.size || 0,
          modifiedAt: new Date((item.attrs.mtime || 0) * 1000).toISOString(),
          permissions: permString(item.attrs.mode),
          owner: item.attrs.uid || 0,
          group: item.attrs.gid || 0,
        };
      })
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return entries;
  } finally {
    conn.end();
  }
}

export async function sftpReadFile(server: VpsServer, filePath: string): Promise<{ data: Buffer; size: number }> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    const stat = await new Promise<any>((resolve, reject) => {
      sftp.stat(filePath, (err, stats) => {
        if (err) reject(err);
        else resolve(stats);
      });
    });

    const MAX_SIZE = 50 * 1024 * 1024;
    if (stat.size > MAX_SIZE) {
      throw new Error(`Arquivo muito grande (${Math.round(stat.size / 1024 / 1024)}MB). Máximo: 50MB`);
    }

    const chunks: Buffer[] = [];
    const readStream = sftp.createReadStream(filePath);
    await new Promise<void>((resolve, reject) => {
      readStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      readStream.on("end", () => resolve());
      readStream.on("error", (err: Error) => reject(err));
    });

    return { data: Buffer.concat(chunks), size: stat.size };
  } finally {
    conn.end();
  }
}

export async function sftpWriteFile(server: VpsServer, filePath: string, data: Buffer): Promise<void> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    const writeStream = sftp.createWriteStream(filePath);
    await new Promise<void>((resolve, reject) => {
      writeStream.on("close", () => resolve());
      writeStream.on("error", (err: Error) => reject(err));
      writeStream.end(data);
    });
  } finally {
    conn.end();
  }
}

export async function sftpDeleteFile(server: VpsServer, filePath: string): Promise<void> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    await new Promise<void>((resolve, reject) => {
      sftp.unlink(filePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } finally {
    conn.end();
  }
}

export async function sftpMkdir(server: VpsServer, dirPath: string): Promise<void> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    await new Promise<void>((resolve, reject) => {
      sftp.mkdir(dirPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } finally {
    conn.end();
  }
}

export async function sftpRmdir(server: VpsServer, dirPath: string): Promise<void> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    await new Promise<void>((resolve, reject) => {
      sftp.rmdir(dirPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } finally {
    conn.end();
  }
}

export async function sftpStat(server: VpsServer, filePath: string): Promise<{ size: number; isDirectory: boolean; mtime: number }> {
  const conn = await getConnection(server);
  try {
    const sftp = await getSftp(conn);
    const stats = await new Promise<any>((resolve, reject) => {
      sftp.stat(filePath, (err, s) => {
        if (err) reject(err);
        else resolve(s);
      });
    });
    return {
      size: stats.size || 0,
      isDirectory: (stats.mode & 0o40000) !== 0,
      mtime: stats.mtime || 0,
    };
  } finally {
    conn.end();
  }
}
