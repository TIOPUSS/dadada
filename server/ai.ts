import OpenAI from "openai";
import { db } from "./db";
import { aiConfigs } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import { encrypt, decrypt } from "./crypto";

const PROVIDER_BASE_URLS: Record<string, string | undefined> = {
  openai: undefined,
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta/openai",
};

async function getActiveConfigs() {
  const configs = await db.select().from(aiConfigs).where(eq(aiConfigs.active, true)).orderBy(asc(aiConfigs.priority));
  return configs;
}

function createClient(apiKey: string, provider: string = "openai") {
  const baseURL = PROVIDER_BASE_URLS[provider];
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

const SYSTEM_PROMPT = `Você é o assistente de IA do Acelera Hub, um CRM completo da Acelera IT.
Você ajuda com:
- **Análise de VPS**: interpretar métricas de CPU, RAM, disco, processos, logs do servidor
- **Comandos VPS**: sugerir e gerar comandos Linux seguros para administração de servidores
- **Deploy**: auxiliar em processos de deploy, configuração de ambientes, Docker, PM2, Nginx
- **Banco de dados**: consultas SQL, análise de dados, otimização de queries
- **Análise de negócio**: interpretar dados de leads, contratos, financeiro
- **Troubleshooting**: diagnosticar problemas em servidores e aplicações

Regras:
- Sempre responda em português PT-BR
- Seja direto e técnico quando necessário
- Para comandos perigosos (rm -rf, DROP, etc), sempre avise o risco antes
- Formate respostas com markdown quando apropriado
- Se não souber algo específico do contexto do usuário, peça mais informações`;

export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chat(messages: AiChatMessage[], context?: string): Promise<string> {
  const configs = await getActiveConfigs();
  if (configs.length === 0) throw new Error("Nenhum provedor de IA configurado. Vá em Configurações > IA para adicionar.");

  const systemMessages: AiChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (context) {
    systemMessages.push({ role: "system", content: `Contexto atual:\n${context}` });
  }

  const errors: string[] = [];

  for (const config of configs) {
    try {
      let decryptedKey: string;
      try {
        decryptedKey = decrypt(config.apiKey);
      } catch {
        errors.push(`${config.name} (${config.provider}/${config.model}): API Key inválida — foi cadastrada em outro ambiente. Edite o provedor e re-insira a API Key.`);
        continue;
      }
      const client = createClient(decryptedKey, config.provider);

      const response = await client.chat.completions.create({
        model: config.model,
        messages: [...systemMessages, ...messages],
        temperature: 0.7,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || "Sem resposta da IA.";
    } catch (err: any) {
      errors.push(`${config.name} (${config.provider}/${config.model}): ${err.message}`);
      continue;
    }
  }

  throw new Error(`Todos os provedores falharam:\n${errors.join("\n")}`);
}

export async function analyzeVpsOutput(serverName: string, command: string, output: string): Promise<string> {
  const messages: AiChatMessage[] = [
    {
      role: "user",
      content: `Analise a saída do comando "${command}" executado no servidor "${serverName}":\n\n\`\`\`\n${output}\n\`\`\`\n\nDê um resumo claro do estado atual e aponte qualquer problema ou recomendação.`,
    },
  ];
  return chat(messages);
}

export async function suggestVpsCommand(description: string, serverInfo?: string): Promise<string> {
  const context = serverInfo ? `Informações do servidor:\n${serverInfo}` : undefined;
  const messages: AiChatMessage[] = [
    {
      role: "user",
      content: `Preciso de um comando Linux para: ${description}\n\nRetorne apenas o comando (ou comandos) necessário(s), com uma breve explicação do que cada um faz.`,
    },
  ];
  return chat(messages, context);
}

export async function testAiConnection(apiKey: string, model: string, provider: string = "openai"): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createClient(apiKey, provider);
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Responda apenas: OK" }],
      max_tokens: 10,
    });
    if (response.choices[0]?.message?.content) {
      return { success: true };
    }
    return { success: false, error: "Sem resposta do modelo" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function encryptApiKey(key: string): string {
  return encrypt(key);
}
