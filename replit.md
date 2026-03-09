# Acelera-Hub CRM

Sistema CRM completo para a Acelera IT. Restaurado a partir do zip original do projeto.

## Preferências do Usuário

- **Idioma**: Sempre responder e interagir em português (PT-BR). Toda comunicação com o usuário deve ser em português. Código, variáveis e nomes técnicos podem ficar em inglês, mas qualquer texto exibido na UI e toda comunicação no chat devem ser em português.

## Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Banco de Dados**: PostgreSQL via Drizzle ORM + @neondatabase/serverless
- **UI**: Shadcn/UI + Tailwind CSS + Recharts
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **Estado**: TanStack Query
- **Validação**: Zod + React Hook Form
- **Roteamento**: Wouter
- **Autenticação**: bcryptjs para hash de senhas
- **Mapa de Infraestrutura**: ReactFlow
- **Terminal SSH**: xterm.js + xterm-zerolag-input + WebSocket (ws) para sessões interativas ao vivo com eco local instantâneo

## Estrutura do Projeto

```
client/src/
  pages/
    dashboard.tsx    - Dashboard com KPIs e gráficos
    kanban.tsx       - Board Kanban com drag-and-drop (9 colunas, @dnd-kit)
    developers.tsx   - Esteira de Desenvolvimento (projetos por dev)
    dev-team.tsx     - Desenvolvedores (perfis CRUD com skills, certificações, etc.)
    leads.tsx        - Pipeline de leads com tipo de projeto (App Novo/App Existente)
    clients.tsx      - Gestão de clientes
    contracts.tsx    - Gestão de contratos
    proposals.tsx    - Gestão de propostas
    payments.tsx     - Histórico de pagamentos
    financial.tsx    - Dashboard financeiro
    apps.tsx         - Lista de apps (tabela com filtros, busca)
    app-detail.tsx   - Página dedicada de detalhe do app (abas: Visão Geral, Documentos, Repositório)
    health.tsx       - Monitor de Saúde / Mapa de Infraestrutura (ReactFlow)
    permissions.tsx  - Mapa de Permissões drag-and-drop (ReactFlow)
    control.tsx      - Dashboard de Monitoramento de Infraestrutura (KPIs, gráficos, alertas)
    settings.tsx     - Configurações (Origins, IA, Monitoramento/Alertas, etc.)
  components/
    app-sidebar.tsx      - Sidebar de navegação principal
    theme-provider.tsx   - Provedor de tema light/dark
server/
  db.ts        - Conexão PostgreSQL via Drizzle ORM
  routes.ts    - Todas as rotas REST da API
  storage.ts   - DatabaseStorage com PostgreSQL + seed data
  index.ts     - Entry point do servidor
  crypto.ts       - Criptografia AES-256-GCM para credenciais
  ssh.ts          - Serviço SSH + SFTP (listDir, readFile, writeFile, deleteFile, mkdir)
  ai.ts           - Serviço de IA via openai
  monitoring.ts   - Serviço de coleta de métricas VPS/App/DB + alertas
shared/
  schema.ts    - Schemas Drizzle/Zod para todas as entidades
```

## Sidebar - Desenvolvimento (3 áreas)

1. **Kanban** (`/kanban`) - Board com 10 colunas: Backlog, Em Dev, Melhoria, Validação 1/2/3, Em Teste, Em Implantação, Concluído, Pausado. Usa dados da tabela `apps`. Drag-and-drop com @dnd-kit atualiza status via `PATCH /api/apps/:id/status`.
2. **Esteira Dev** (`/developers`) - Visão de projetos agrupados por desenvolvedor. Sincronizada com o Kanban — ambas usam `/api/apps`.
3. **Desenvolvedores** (`/dev-team`) - Cadastro completo de devs com skills, certificações, idiomas, bio, links GitHub/LinkedIn/Portfolio, experiência, disponibilidade. CRUD completo com busca/filtro.

## Banco de Dados (PostgreSQL)

Tabelas principais com enums PostgreSQL:
- **developers** - Equipe com campos expandidos (bio, languages, certifications, education, experienceYears, availability, specializations, linkedinUrl, portfolioUrl)
- **apps** - Projetos/sistemas da empresa
- **clients** - Clientes (Opus, TheCorp, G Farma, Telos, etc.)
- **app_clients** - Tabela de ligação muitos-para-muitos entre apps e clientes (um app pode ter vários clientes, ex: CRM Acelera atende G Farma e Telos)
- **contracts** - Contratos com tipos (monthly, per_seat, milestone, etc.)
- **payments** - Pagamentos com status
- **kanban_tasks** - Tarefas. kanban_status enum: backlog, in_dev, validation_1, validation_2, validation_3, testing, deploying, review, staging, done, paused
- **financial_entries** - Entradas financeiras
- **leads** - Leads comerciais (clientId FK opcional; projectType: "new_app"|"existing_app" + existingAppId; ao mudar status para "won" cria novo app ou vincula cliente ao app existente)
- **proposals** - Propostas comerciais
- **users** - Usuários do sistema (felipe/admin123, lucas/dev123, daniel/dev123)
- **integrations** - Integrações (WhatsApp, GitHub, etc.)
- **ai_configs** - Provedores de IA (OpenAI, Anthropic, Google) com API Key criptografada AES-256-GCM
- **vps_servers** - Servidores VPS com credenciais criptografadas (AES-256-GCM)
- **vps_app_links** - Vinculação de apps a servidores VPS
- **vps_command_logs** - Histórico de comandos SSH executados
- **vps_databases** - Bancos de dados nos servidores VPS
- **vps_db_app_links** - Vinculação de bancos a apps nos VPS
- **app_checklists** - Checklist de tarefas por app
- **app_notes** - Notas de acompanhamento por app
- **origins** - Origens cadastráveis (ex: acelera, opus, thecorp, vittaverde)
- **client_types** - Tipos de cliente cadastráveis (chave, label, cor, ativo). Seed automático com 4 padrões: Acelera, Opus, TheCorp, Partner. Gerenciável em Configuracoes > Tipos de Cliente.
- **tag_configs** - Tags configuráveis para leads
- **vps_metrics** - Métricas históricas de VPS (CPU, RAM, disco, load, rede, processos, uptime)
- **app_monitors** - Monitores de aplicativos (HTTP/PM2/Docker)
- **app_metrics** - Métricas de monitoramento de apps (status, response time)
- **db_metrics** - Métricas de bancos de dados (status, conexões, tamanho)
- **alert_rules** - Regras de alerta configuráveis (threshold, severidade, target)
- **alert_destinations** - Destinos de alerta (Hub interno, Webhook)
- **alert_history** - Histórico de alertas disparados/resolvidos
- **monitoring_config** - Configurações globais de monitoramento (intervalo, retenção, alertas)
- **permission_roles** - Roles hierárquicos (name, color, level, parentRoleId, isSystem). Seed automático com 4 roles padrão
- **role_permissions** - Permissões por módulo (roleId, moduleKey, permissions jsonb)

Schema usa IDs varchar com gen_random_uuid(). Seed automático no boot (verifica se banco está vazio).

## Rotas da API

- GET/POST/PUT/DELETE /api/clients
- GET/POST/PUT/DELETE /api/apps
- GET /api/apps/:id (detalhe de um app)
- PATCH /api/apps/:id/status (atualiza status com validação)
- GET /api/apps/:appId/documents, POST (upload multipart via multer)
- GET /api/documents/:id/download, DELETE /api/documents/:id
- GET/POST/PUT/DELETE /api/developers
- GET/POST/PUT/DELETE /api/contracts
- GET/POST/PUT/DELETE /api/payments
- GET/POST/PUT/DELETE /api/kanban-tasks
- PATCH /api/kanban-tasks/:id/status
- GET/POST/PUT/DELETE /api/financial-entries
- GET/POST/PUT/DELETE /api/leads
- GET/POST/PUT/DELETE /api/proposals
- GET/POST/PUT/DELETE /api/users
- GET/POST/PUT/DELETE /api/integrations
- GET /api/dashboard/stats
- GET/POST/PUT/DELETE /api/vps (servidores VPS - credenciais nunca retornadas)
- POST /api/vps/:id/test (testar conexão SSH)
- POST /api/vps/:id/execute (executar comando remoto via SSH)
- GET /api/vps/:id/info (info do sistema via SSH: CPU, RAM, disco)
- GET /api/vps/:id/logs (histórico de comandos)
- GET/POST/DELETE /api/vps/:id/apps (vincular/desvincular apps)
- GET/POST/PUT/DELETE /api/apps/:appId/checklists, PUT/DELETE /api/checklists/:id
- GET/POST /api/apps/:appId/notes, DELETE /api/notes/:id
- GET/POST/PUT/DELETE /api/ai-configs (provedores de IA - apiKey nunca retornada em texto)
- POST /api/ai-configs/:id/test (testar conexão com provedor de IA)
- POST /api/ai/chat (chat genérico com IA)
- POST /api/ai/analyze-vps (análise de saída de comando VPS)
- POST /api/ai/suggest-command (sugestão de comando Linux via IA)
- GET /api/app-clients/:appId (clientes vinculados a um app)
- POST /api/app-clients (vincular cliente a app)
- DELETE /api/app-clients/:id (desvincular cliente de app)
- GET /api/health-map (dados completos do mapa de infraestrutura)
- POST /api/vps/monitor-all (disparar monitoramento de todas as VPS)
- GET/POST/PUT/DELETE /api/origins (origens cadastráveis)
- GET/POST/PUT/DELETE /api/client-types (tipos de cliente cadastráveis)
- GET/POST/PUT/DELETE /api/tag-configs (tags configuráveis para leads)
- GET /api/monitoring/overview (resumo geral de monitoramento)
- GET /api/monitoring/vps/:id/metrics?hours=24 (métricas VPS por período)
- GET /api/monitoring/apps/:id/metrics?hours=24 (métricas de app por período)
- GET /api/monitoring/dbs/:id/metrics?hours=24 (métricas de DB por período)
- GET/POST/PUT/DELETE /api/monitoring/app-monitors (monitores de apps)
- GET/POST/PUT/DELETE /api/monitoring/alert-rules (regras de alerta)
- GET/POST/PUT/DELETE /api/monitoring/alert-destinations (destinos de alerta)
- GET /api/monitoring/alerts + POST resolve (histórico de alertas)
- GET/PUT /api/monitoring/config (configurações globais de monitoramento)

## Criptografia VPS / IA

- Credenciais SSH (senha/chave privada) criptografadas com AES-256-GCM
- Chave derivada do SESSION_SECRET via scrypt
- Arquivo: `server/crypto.ts`
- Serviço SSH: `server/ssh.ts` (usa biblioteca `ssh2`)
- Serviço IA: `server/ai.ts` (usa biblioteca `openai`)
- API Keys de IA também criptografadas com AES-256-GCM via mesmo mecanismo
- Todas as rotas SSH (test/info/execute) validam credenciais antes de conectar e retornam erro claro se a senha foi criptografada em outro ambiente
- Se o SESSION_SECRET mudar, todas as credenciais precisam ser recadastradas

## Sistema de Monitoramento de Infraestrutura

- **Coleta de métricas**: Via SSH, coleta CPU, RAM, disco, load, rede, processos e uptime de cada VPS
- **Ciclo automático**: Roda a cada 5 minutos (configurável em Settings > Monitoramento)
- **Retenção de dados**: 7 dias por padrão (configurável)
- **Alertas**: Regras configuráveis com threshold, severidade (warning/critical), destinos (Hub/Webhook)
- **Dashboard** (`/control`): KPIs, gráficos Recharts de métricas VPS, timeline de alertas, filtro de período (1h/6h/24h/7d), auto-refresh 30s
- **Settings > Monitoramento**: Config global, CRUD regras de alerta, destinos de alerta, monitores de apps
- **Health Monitor**: Nós VPS mostram mini barras CPU/RAM/Disco; nós App mostram status up/down + response time; indicador de alerta nos nós com alertas ativos
- **Sino de notificações**: Badge na sidebar mostra contagem de alertas não resolvidos
- Ao iniciar o servidor, todos os status VPS são resetados para "unknown"
- Rota POST /api/vps/monitor-all dispara verificação manual

## Terminal SSH Interativo

- Terminal real via xterm.js + WebSocket (não mais request/response)
- WebSocket em `/ws/ssh` com protocolo JSON para connect/input/output/resize
- Shell PTY completo com suporte a cores, Ctrl+C, programas interativos (pm2 logs, top, vim, etc.)
- Quick commands (Uptime, Disco, Memória, Top 10, Docker, Logs, Rede, CPU, PM2) injetam comandos na sessão ao vivo
- Botão Conectar/Desconectar com indicador visual de status
- Redimensionamento automático do terminal via FitAddon

## Monitor de Saúde (Mapa de Infraestrutura)

- Nós visualmente diferenciados por tipo:
  - VPS: borda azul + header azul com label "SERVIDOR VPS"
  - Apps: borda violeta + header violeta com label "APLICATIVO"
  - Bancos: borda verde + header verde com label "BANCO DE DADOS"
- Apps com status "archived" aparecem como "Concluído" em cor esmeralda
- Clientes vinculados aparecem dentro do nó do app (via tabela app_clients, muitos-para-muitos)
- Posições dos nós salvas em localStorage (chave: acelera-health-map-positions-v2)
- Legenda e hierarquia nos painéis do ReactFlow

## Sistema de Permissões (Mapa Visual)

- **Página**: `/permissions` — Mapa visual drag-and-drop com ReactFlow
- **Tabelas**: `permission_roles` (hierárquicas), `role_permissions` (jsonb com permissões por módulo)
- **Users**: Campo `roleId` na tabela `users` vincula usuário a um role
- **Roles padrão (seed)**: Administrador (tudo), Gerente (sem SSH/config), Desenvolvedor (dev-only), Visualizador (só view)
- **23 módulos** organizados em 5 categorias (Principal, Comercial, Operações, Desenvolvimento, Sistema)
- **Ações granulares**: view, create, edit, delete, export, execute, send, upload, download, move, ssh, manage_databases, configure, manage_alerts, manage_roles, assign_users, assign_role
- **Hierarquia**: Roles têm parentRoleId para herança (pai→filho)
- **Posições**: Salvas em localStorage (chave: `acelera-permissions-positions`)
- **API**: GET/POST/PATCH/DELETE /api/permissions/roles, GET/PUT /api/permissions/roles/:id/permissions, GET /api/permissions/map, PATCH /api/users/:id/role

## Pipeline de Leads

- Campo projectType: "new_app" (App Novo) ou "existing_app" (App Existente)
- Se "existing_app", campo existingAppId vincula a um app já existente
- Ao ganhar (status "won"): cria novo app OU vincula cliente ao app existente
- Cards mostram badge "App Existente" quando aplicável
- Prioridade do provedor de IA resolvida por sort antes de find

## Rodando o Projeto

```bash
npm run dev
```

Servidor em `http://localhost:5000`
