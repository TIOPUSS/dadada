--
-- PostgreSQL database dump
--

\restrict CnYY7HKDoKxty8yFABf33nBQF6w4xpNexRBVEegr6O6Kc5iCIad3YiFldLUorNR

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_permission_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.repo_files DROP CONSTRAINT IF EXISTS repo_files_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.proposals DROP CONSTRAINT IF EXISTS proposals_lead_id_leads_id_fk;
ALTER TABLE IF EXISTS ONLY public.proposals DROP CONSTRAINT IF EXISTS proposals_client_id_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_contract_id_contracts_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_client_id_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_client_id_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.kanban_tasks DROP CONSTRAINT IF EXISTS kanban_tasks_dev_id_developers_id_fk;
ALTER TABLE IF EXISTS ONLY public.kanban_tasks DROP CONSTRAINT IF EXISTS kanban_tasks_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.financial_entries DROP CONSTRAINT IF EXISTS financial_entries_dev_id_developers_id_fk;
ALTER TABLE IF EXISTS ONLY public.financial_entries DROP CONSTRAINT IF EXISTS financial_entries_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_client_id_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.apps DROP CONSTRAINT IF EXISTS apps_client_id_clients_id_fk;
ALTER TABLE IF EXISTS ONLY public.app_notes DROP CONSTRAINT IF EXISTS app_notes_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.app_documents DROP CONSTRAINT IF EXISTS app_documents_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.app_checklists DROP CONSTRAINT IF EXISTS app_checklists_app_id_apps_id_fk;
ALTER TABLE IF EXISTS ONLY public.vps_servers DROP CONSTRAINT IF EXISTS vps_servers_pkey;
ALTER TABLE IF EXISTS ONLY public.vps_metrics DROP CONSTRAINT IF EXISTS vps_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.vps_db_app_links DROP CONSTRAINT IF EXISTS vps_db_app_links_pkey;
ALTER TABLE IF EXISTS ONLY public.vps_databases DROP CONSTRAINT IF EXISTS vps_databases_pkey;
ALTER TABLE IF EXISTS ONLY public.vps_command_logs DROP CONSTRAINT IF EXISTS vps_command_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.vps_app_links DROP CONSTRAINT IF EXISTS vps_app_links_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.tag_configs DROP CONSTRAINT IF EXISTS tag_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.tag_configs DROP CONSTRAINT IF EXISTS tag_configs_name_unique;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.repo_files DROP CONSTRAINT IF EXISTS repo_files_pkey;
ALTER TABLE IF EXISTS ONLY public.proposals DROP CONSTRAINT IF EXISTS proposals_pkey;
ALTER TABLE IF EXISTS ONLY public.permission_roles DROP CONSTRAINT IF EXISTS permission_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.origins DROP CONSTRAINT IF EXISTS origins_pkey;
ALTER TABLE IF EXISTS ONLY public.origins DROP CONSTRAINT IF EXISTS origins_key_unique;
ALTER TABLE IF EXISTS ONLY public.monitoring_config DROP CONSTRAINT IF EXISTS monitoring_config_pkey;
ALTER TABLE IF EXISTS ONLY public.monitoring_config DROP CONSTRAINT IF EXISTS monitoring_config_key_unique;
ALTER TABLE IF EXISTS ONLY public.leads DROP CONSTRAINT IF EXISTS leads_pkey;
ALTER TABLE IF EXISTS ONLY public.kanban_tasks DROP CONSTRAINT IF EXISTS kanban_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.financial_entries DROP CONSTRAINT IF EXISTS financial_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.developers DROP CONSTRAINT IF EXISTS developers_pkey;
ALTER TABLE IF EXISTS ONLY public.db_metrics DROP CONSTRAINT IF EXISTS db_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.contracts DROP CONSTRAINT IF EXISTS contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.client_types DROP CONSTRAINT IF EXISTS client_types_pkey;
ALTER TABLE IF EXISTS ONLY public.client_types DROP CONSTRAINT IF EXISTS client_types_key_unique;
ALTER TABLE IF EXISTS ONLY public.apps DROP CONSTRAINT IF EXISTS apps_pkey;
ALTER TABLE IF EXISTS ONLY public.app_notes DROP CONSTRAINT IF EXISTS app_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.app_monitors DROP CONSTRAINT IF EXISTS app_monitors_pkey;
ALTER TABLE IF EXISTS ONLY public.app_metrics DROP CONSTRAINT IF EXISTS app_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.app_documents DROP CONSTRAINT IF EXISTS app_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.app_clients DROP CONSTRAINT IF EXISTS app_clients_pkey;
ALTER TABLE IF EXISTS ONLY public.app_checklists DROP CONSTRAINT IF EXISTS app_checklists_pkey;
ALTER TABLE IF EXISTS ONLY public.alert_rules DROP CONSTRAINT IF EXISTS alert_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.alert_history DROP CONSTRAINT IF EXISTS alert_history_pkey;
ALTER TABLE IF EXISTS ONLY public.alert_destinations DROP CONSTRAINT IF EXISTS alert_destinations_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_configs DROP CONSTRAINT IF EXISTS ai_configs_pkey;
DROP TABLE IF EXISTS public.vps_servers;
DROP TABLE IF EXISTS public.vps_metrics;
DROP TABLE IF EXISTS public.vps_db_app_links;
DROP TABLE IF EXISTS public.vps_databases;
DROP TABLE IF EXISTS public.vps_command_logs;
DROP TABLE IF EXISTS public.vps_app_links;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tag_configs;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.repo_files;
DROP TABLE IF EXISTS public.proposals;
DROP TABLE IF EXISTS public.permission_roles;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.origins;
DROP TABLE IF EXISTS public.monitoring_config;
DROP TABLE IF EXISTS public.leads;
DROP TABLE IF EXISTS public.kanban_tasks;
DROP TABLE IF EXISTS public.integrations;
DROP TABLE IF EXISTS public.financial_entries;
DROP TABLE IF EXISTS public.developers;
DROP TABLE IF EXISTS public.db_metrics;
DROP TABLE IF EXISTS public.contracts;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.client_types;
DROP TABLE IF EXISTS public.apps;
DROP TABLE IF EXISTS public.app_notes;
DROP TABLE IF EXISTS public.app_monitors;
DROP TABLE IF EXISTS public.app_metrics;
DROP TABLE IF EXISTS public.app_documents;
DROP TABLE IF EXISTS public.app_clients;
DROP TABLE IF EXISTS public.app_checklists;
DROP TABLE IF EXISTS public.alert_rules;
DROP TABLE IF EXISTS public.alert_history;
DROP TABLE IF EXISTS public.alert_destinations;
DROP TABLE IF EXISTS public.ai_configs;
DROP TYPE IF EXISTS public.vps_status;
DROP TYPE IF EXISTS public.vps_auth_type;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.proposal_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.monitor_type;
DROP TYPE IF EXISTS public.monitor_status;
DROP TYPE IF EXISTS public.lead_status;
DROP TYPE IF EXISTS public.kanban_status;
DROP TYPE IF EXISTS public.kanban_priority;
DROP TYPE IF EXISTS public.financial_type;
DROP TYPE IF EXISTS public.doc_category;
DROP TYPE IF EXISTS public.dev_status;
DROP TYPE IF EXISTS public.dev_level;
DROP TYPE IF EXISTS public.db_type;
DROP TYPE IF EXISTS public.contract_type;
DROP TYPE IF EXISTS public.contract_status;
DROP TYPE IF EXISTS public.app_type;
DROP TYPE IF EXISTS public.app_status;
DROP TYPE IF EXISTS public.app_origin;
DROP TYPE IF EXISTS public.alert_target_type;
DROP TYPE IF EXISTS public.alert_status;
DROP TYPE IF EXISTS public.alert_severity;
DROP TYPE IF EXISTS public.alert_dest_type;
DROP TYPE IF EXISTS public.ai_provider;
--
-- Name: ai_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ai_provider AS ENUM (
    'openai',
    'anthropic',
    'google'
);


--
-- Name: alert_dest_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_dest_type AS ENUM (
    'hub',
    'webhook',
    'email'
);


--
-- Name: alert_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_severity AS ENUM (
    'warning',
    'critical'
);


--
-- Name: alert_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_status AS ENUM (
    'firing',
    'resolved'
);


--
-- Name: alert_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_target_type AS ENUM (
    'vps',
    'app',
    'db'
);


--
-- Name: app_origin; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_origin AS ENUM (
    'acelera',
    'opus',
    'both',
    'thecorp',
    'vittaverde'
);


--
-- Name: app_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_status AS ENUM (
    'waiting',
    'backlog',
    'in_dev',
    'validation_1',
    'validation_2',
    'validation_3',
    'testing',
    'deploying',
    'staging',
    'active',
    'paused',
    'disabled',
    'archived'
);


--
-- Name: app_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_type AS ENUM (
    'saas',
    'internal',
    'custom',
    'automation',
    'ai_agent'
);


--
-- Name: contract_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_status AS ENUM (
    'active',
    'renewing',
    'expired',
    'cancelled',
    'suspended'
);


--
-- Name: contract_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_type AS ENUM (
    'monthly',
    'per_seat',
    'revenue_share',
    'milestone',
    'setup_monthly',
    'free'
);


--
-- Name: db_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.db_type AS ENUM (
    'postgresql',
    'mysql',
    'mongodb',
    'redis',
    'sqlite',
    'mariadb',
    'mssql'
);


--
-- Name: dev_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.dev_level AS ENUM (
    'junior',
    'mid',
    'senior',
    'lead'
);


--
-- Name: dev_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.dev_status AS ENUM (
    'active',
    'inactive'
);


--
-- Name: doc_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.doc_category AS ENUM (
    'documentation',
    'pricing',
    'presentation',
    'contract',
    'proposal',
    'report',
    'other'
);


--
-- Name: financial_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.financial_type AS ENUM (
    'income',
    'expense'
);


--
-- Name: kanban_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.kanban_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


--
-- Name: kanban_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.kanban_status AS ENUM (
    'backlog',
    'in_dev',
    'validation_1',
    'validation_2',
    'validation_3',
    'testing',
    'deploying',
    'review',
    'staging',
    'done',
    'paused'
);


--
-- Name: lead_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lead_status AS ENUM (
    'new',
    'contacted',
    'proposal',
    'negotiating',
    'won',
    'lost'
);


--
-- Name: monitor_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.monitor_status AS ENUM (
    'up',
    'down',
    'degraded'
);


--
-- Name: monitor_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.monitor_type AS ENUM (
    'http',
    'pm2',
    'docker'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'overdue',
    'negotiating'
);


--
-- Name: proposal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.proposal_status AS ENUM (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'manager',
    'viewer'
);


--
-- Name: vps_auth_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vps_auth_type AS ENUM (
    'password',
    'key'
);


--
-- Name: vps_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vps_status AS ENUM (
    'online',
    'offline',
    'maintenance',
    'unknown'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_configs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    provider public.ai_provider DEFAULT 'openai'::public.ai_provider NOT NULL,
    name text NOT NULL,
    api_key text NOT NULL,
    model text DEFAULT 'gpt-4o'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    priority integer DEFAULT 0 NOT NULL
);


--
-- Name: alert_destinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_destinations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type public.alert_dest_type NOT NULL,
    config text DEFAULT '{}'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: alert_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    alert_rule_id character varying,
    target_type public.alert_target_type NOT NULL,
    target_id character varying,
    metric text NOT NULL,
    value numeric,
    threshold numeric,
    severity public.alert_severity DEFAULT 'warning'::public.alert_severity NOT NULL,
    status public.alert_status DEFAULT 'firing'::public.alert_status NOT NULL,
    message text,
    sent_to text,
    fired_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone
);


--
-- Name: alert_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_rules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    target_type public.alert_target_type NOT NULL,
    target_id character varying,
    metric text NOT NULL,
    operator text DEFAULT 'gt'::text NOT NULL,
    threshold numeric NOT NULL,
    duration integer DEFAULT 1 NOT NULL,
    severity public.alert_severity DEFAULT 'warning'::public.alert_severity NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_checklists (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    text text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_clients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    client_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    name text NOT NULL,
    original_name text NOT NULL,
    category public.doc_category DEFAULT 'other'::public.doc_category NOT NULL,
    mime_type text,
    size integer,
    path text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_metrics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_monitor_id character varying NOT NULL,
    status public.monitor_status NOT NULL,
    response_time_ms integer,
    status_code integer,
    error_message text,
    collected_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_monitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_monitors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    vps_id character varying,
    monitor_type public.monitor_type DEFAULT 'http'::public.monitor_type NOT NULL,
    endpoint text,
    expected_status integer DEFAULT 200,
    check_interval_minutes integer DEFAULT 5 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: app_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apps (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    version text,
    type public.app_type DEFAULT 'saas'::public.app_type NOT NULL,
    status public.app_status DEFAULT 'active'::public.app_status NOT NULL,
    origin public.app_origin DEFAULT 'acelera'::public.app_origin NOT NULL,
    client_id character varying,
    tech_stack text[],
    git_repo text,
    dev_responsible_id character varying,
    control_url text,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: client_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    cnpj text,
    email text,
    phone text,
    address text,
    type text DEFAULT 'acelera'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying,
    client_id character varying,
    type public.contract_type DEFAULT 'monthly'::public.contract_type NOT NULL,
    status public.contract_status DEFAULT 'active'::public.contract_status NOT NULL,
    value numeric(10,2),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    auto_renew boolean DEFAULT true,
    payment_day integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: db_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_metrics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    database_id character varying NOT NULL,
    status public.monitor_status NOT NULL,
    connections_active integer,
    size_bytes text,
    response_time_ms integer,
    collected_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: developers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.developers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    role text,
    level public.dev_level DEFAULT 'mid'::public.dev_level NOT NULL,
    status public.dev_status DEFAULT 'active'::public.dev_status NOT NULL,
    monthly_rate numeric(10,2),
    contract_type text,
    skills text[],
    github_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    linkedin_url text,
    portfolio_url text,
    bio text,
    languages text[],
    certifications text[],
    education text,
    experience_years integer,
    availability text,
    specializations text[]
);


--
-- Name: financial_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type public.financial_type NOT NULL,
    category text,
    app_id character varying,
    dev_id character varying,
    amount numeric(10,2),
    date timestamp without time zone DEFAULT now() NOT NULL,
    description text,
    recurring boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integrations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'disconnected'::text NOT NULL,
    config text,
    last_sync timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: kanban_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kanban_tasks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying,
    dev_id character varying,
    title text NOT NULL,
    description text,
    status public.kanban_status DEFAULT 'backlog'::public.kanban_status NOT NULL,
    priority public.kanban_priority DEFAULT 'medium'::public.kanban_priority NOT NULL,
    estimated_hours integer,
    actual_hours integer,
    due_date timestamp without time zone,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    company text,
    email text,
    phone text,
    status public.lead_status DEFAULT 'new'::public.lead_status NOT NULL,
    source text,
    service_type text[],
    estimated_value numeric(10,2),
    monthly_fee numeric(10,2),
    implantation_fee numeric(10,2),
    pricing_model text,
    price_per_user numeric(10,2),
    estimated_users integer,
    installments integer,
    team_size integer,
    tags text[],
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    client_id character varying,
    project_type text DEFAULT 'new_app'::text,
    existing_app_id integer
);


--
-- Name: monitoring_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monitoring_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL
);


--
-- Name: origins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.origins (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    contract_id character varying,
    client_id character varying,
    amount numeric(10,2),
    due_date timestamp without time zone,
    paid_date timestamp without time zone,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_method text,
    notes text
);


--
-- Name: permission_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permission_roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1'::text NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    parent_role_id character varying,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    lead_id character varying,
    client_id character varying,
    title text NOT NULL,
    status public.proposal_status DEFAULT 'draft'::public.proposal_status NOT NULL,
    service_type text,
    value numeric(10,2),
    installments integer,
    monthly_fee numeric(10,2),
    implantation_fee numeric(10,2),
    pricing_model text,
    price_per_user numeric(10,2),
    estimated_users integer,
    team_size integer,
    cost_items text,
    valid_until timestamp without time zone,
    description text,
    items text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: repo_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repo_files (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    name text NOT NULL,
    original_name text NOT NULL,
    folder_path text DEFAULT '/'::text NOT NULL,
    mime_type text,
    size integer,
    path text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role_id character varying NOT NULL,
    module_key text NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tag_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_configs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    email text,
    role public.user_role DEFAULT 'viewer'::public.user_role NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    role_id character varying
);


--
-- Name: vps_app_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_app_links (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vps_id character varying NOT NULL,
    app_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vps_command_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_command_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vps_id character varying NOT NULL,
    user_id text,
    command text NOT NULL,
    output text,
    exit_code integer,
    executed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vps_databases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_databases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vps_id character varying NOT NULL,
    name text NOT NULL,
    type public.db_type DEFAULT 'postgresql'::public.db_type NOT NULL,
    host text DEFAULT 'localhost'::text NOT NULL,
    port integer DEFAULT 5432 NOT NULL,
    database_name text NOT NULL,
    status public.vps_status DEFAULT 'unknown'::public.vps_status NOT NULL,
    size_bytes text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vps_db_app_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_db_app_links (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    database_id character varying NOT NULL,
    app_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vps_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_metrics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vps_id character varying NOT NULL,
    cpu_percent numeric,
    memory_percent numeric,
    disk_percent numeric,
    load_avg_1 numeric,
    load_avg_5 numeric,
    load_avg_15 numeric,
    network_in text,
    network_out text,
    process_count integer,
    uptime_seconds integer,
    collected_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vps_servers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vps_servers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    hostname text,
    ip text NOT NULL,
    port integer DEFAULT 22 NOT NULL,
    username text DEFAULT 'root'::text NOT NULL,
    encrypted_password text,
    encrypted_private_key text,
    auth_type public.vps_auth_type DEFAULT 'password'::public.vps_auth_type NOT NULL,
    status public.vps_status DEFAULT 'unknown'::public.vps_status NOT NULL,
    os text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: ai_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_configs (id, provider, name, api_key, model, active, created_at, priority) FROM stdin;
c685d425-b831-476a-b1ea-378a932b7368	anthropic	CLAUDE	N06rLK7NgGMsH6qMS5g76yLqVAT7i8r4u9pA0haAYyXBgvH2lYd9Up35mn+vZFZpkKCPGRWo1CVbA6N7oz68QN2Xszq/zQbFEHIMM/IR2zPnMp+xYqG0Rwv25keyZxdIOY2SgbQ8gVb3MoK2lhkMBODOoIbJ7xYS2wxLp/MEi0tXPfYlAfDgeTB+704=	claude-sonnet-4-20250514	t	2026-03-08 01:44:59.306923	2
ac81294a-67ee-476f-bcb6-a467b4215037	openai	GPT	f19CgrrzIaFvJ44zkxfc9dH3o3a3RKR3Jy/qjLCDMtV6HX5SjfDTAu3TirYkqT4s8Ut96dvhdvFClNsXZzdzhi5d4qq/mI4Zc/yZyA6rMZ5yg7bzxQBxzD5G2XMuMvFyJdGg5ObfIzG6IjFbNOgMTJCAwBtX/cyklBABCngzVvScpb5uGSYEmvbdMt8nBjXpQb/yOpxAEC1I17JQx+h+LQVCpUkAQjD7/40R4P/8sGnfCjzGuDWMpQoIyaZ+Bz/uWHm+cA==	gpt-4o	t	2026-03-08 01:37:44.489597	0
\.


--
-- Data for Name: alert_destinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alert_destinations (id, name, type, config, enabled, created_at) FROM stdin;
\.


--
-- Data for Name: alert_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alert_history (id, alert_rule_id, target_type, target_id, metric, value, threshold, severity, status, message, sent_to, fired_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: alert_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alert_rules (id, name, target_type, target_id, metric, operator, threshold, duration, severity, enabled, created_at) FROM stdin;
\.


--
-- Data for Name: app_checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_checklists (id, app_id, text, completed, sort_order, created_at) FROM stdin;
edd155c1-6e59-468f-9add-f93f64b0f5f6	32528bbd-45e8-47df-9b76-daf119b0a677	Criar dashboard	f	1	2026-03-08 01:31:40.870563
fe58b4b9-394f-453c-97ab-d2cd0a04415e	32528bbd-45e8-47df-9b76-daf119b0a677	Implementar login	t	0	2026-03-08 01:31:31.700301
\.


--
-- Data for Name: app_clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_clients (id, app_id, client_id, created_at) FROM stdin;
54b1b47d-b692-4660-b88f-08803b5d1b8f	08f7b81d-7417-4074-b087-af460de533fb	4be4617f-27f7-400d-b9e2-9c818402f9f6	2026-03-08 02:55:21.104231
ad665a40-6645-45f6-b696-42e5a6ad4c78	08f7b81d-7417-4074-b087-af460de533fb	81d5dd05-13fd-44b4-aee4-0f5918c15d2d	2026-03-08 02:55:21.104231
\.


--
-- Data for Name: app_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_documents (id, app_id, name, original_name, category, mime_type, size, path, uploaded_at) FROM stdin;
\.


--
-- Data for Name: app_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_metrics (id, app_monitor_id, status, response_time_ms, status_code, error_message, collected_at) FROM stdin;
\.


--
-- Data for Name: app_monitors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_monitors (id, app_id, vps_id, monitor_type, endpoint, expected_status, check_interval_minutes, enabled, created_at) FROM stdin;
\.


--
-- Data for Name: app_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_notes (id, app_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: apps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.apps (id, name, version, type, status, origin, client_id, tech_stack, git_repo, dev_responsible_id, control_url, description, created_at) FROM stdin;
668988c0-cad6-4c14-803a-67651a14b557	Workspace	\N	saas	staging	opus	\N	\N	\N	95fd7546-f8f5-4c71-b764-46366f8b15d5	\N	\N	2026-03-07 12:30:10.023009
5ed04cda-b0dc-4dac-80d7-149d4b26af13	VittaVerde	\N	saas	staging	vittaverde	\N	\N	\N	95fd7546-f8f5-4c71-b764-46366f8b15d5	\N	\N	2026-03-07 12:30:10.023009
32528bbd-45e8-47df-9b76-daf119b0a677	Faturamento Telos	\N	saas	in_dev	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	\N	2026-03-07 12:30:10.023009
ad9db14a-e8f7-48c2-b9e9-3ed33e8bf0cc	Dashboard Senior	\N	saas	in_dev	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	Aguardando WebServices	2026-03-07 12:30:10.023009
d0fa7155-dbd6-49d9-a032-224d9a4f0e59	Intera	\N	saas	staging	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	API Intera x iFood - Início 02/03	2026-03-07 12:30:10.023009
c43f020d-bbd3-4501-8ad9-0553592e5862	Inventário	\N	saas	in_dev	opus	\N	\N	\N	bd5bb39a-6318-4bb6-82e2-9a0ee3f6bf81	\N	\N	2026-03-07 12:30:10.023009
70d881fa-502c-4f53-8fcb-72ad7a6cc8f6	Gestão Porto	\N	saas	in_dev	thecorp	\N	\N	\N	73bd64e1-c05a-419d-a2bc-e90a1dbb155a	\N	\N	2026-03-07 12:30:10.023009
8a8c6379-7fa4-43ec-ae1b-2b21e9777d99	Clube Motos	\N	saas	in_dev	thecorp	\N	\N	\N	73bd64e1-c05a-419d-a2bc-e90a1dbb155a	\N	\N	2026-03-07 12:30:10.023009
0683752d-9806-4c8f-ac98-0be18f5cd5eb	RNC	\N	saas	archived	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	\N	2026-03-07 12:30:10.023009
0e6136d2-d921-42bc-8ea8-b53b4f5b4a98	Compliance	\N	saas	archived	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	\N	2026-03-07 12:30:10.023009
215a4a20-132f-4659-98a5-868b534498c7	Acelera Hub		saas	in_dev	acelera	\N	{}		95fd7546-f8f5-4c71-b764-46366f8b15d5		Teste de edição via popup	2026-03-07 12:30:10.023009
fcdf6e1b-836d-4567-a70f-120299e30f79	DHO	\N	saas	waiting	opus	\N	\N	\N	5f2b3412-7d41-4808-89f7-771e40ca283d	\N	Aguardando 02/03	2026-03-07 12:30:10.023009
1f564a90-25bd-4b20-9d5d-30fe75985fb3	Opus Você	\N	saas	waiting	opus	\N	\N	\N	95fd7546-f8f5-4c71-b764-46366f8b15d5	\N	Sem data	2026-03-07 12:30:10.023009
5b1f69ca-8b69-4291-8609-98cd5305a813	Qualidade Completo	\N	saas	waiting	opus	\N	\N	\N	5f2b3412-7d41-4808-89f7-771e40ca283d	\N	Aguardando 02/03	2026-03-07 12:30:10.023009
ef74cd1e-a738-4a50-9e02-beb190c7266f	AllStrategy	\N	saas	waiting	opus	\N	\N	\N	cb470d49-e27e-485f-8ec3-c690936aa2d5	\N	Dashboard Controladoria + Resultados e Cenários	2026-03-07 12:30:10.023009
cf0986c2-c801-4b59-96d8-f2b6c4019155	Robo Tráfego Pago		saas	backlog	acelera	\N	{}		95fd7546-f8f5-4c71-b764-46366f8b15d5			2026-03-07 12:30:10.023009
08f7b81d-7417-4074-b087-af460de533fb	CRM Acelera	\N	saas	in_dev	acelera	\N	\N	\N	ea0f9133-f57b-4964-b16e-876b493793b6	\N	G Farma + Agente Telos (mesmo app)	2026-03-07 12:30:10.023009
c2e435d5-9caa-4cc6-b038-881816344f59	Vagas		saas	staging	acelera	\N	{}		95fd7546-f8f5-4c71-b764-46366f8b15d5			2026-03-07 12:30:10.023009
162fbcb6-e3c2-4236-88fa-071144c89e79	Comercial		saas	in_dev	acelera	\N	{}		3b0a5194-9181-4429-a0cf-fde357b28a07			2026-03-07 12:30:10.023009
b04f669a-bd11-4071-96b4-6b53e5571614	Atlas		saas	in_dev	acelera	\N	{}		5f2b3412-7d41-4808-89f7-771e40ca283d			2026-03-07 12:30:10.023009
030453d1-975f-44b6-9e8c-ce5fc1221468	Full Facilities		saas	staging	acelera	\N	{}		5f2b3412-7d41-4808-89f7-771e40ca283d		Mobile	2026-03-07 12:30:10.023009
2dc994f2-185d-4c7c-8485-03daaa37a623	Ticketflow		saas	archived	acelera	\N	{}		95fd7546-f8f5-4c71-b764-46366f8b15d5			2026-03-07 12:30:10.023009
b9bb9344-1ed8-40bf-9f78-7d150ba792f9	Robô		saas	waiting	acelera	\N	{}		ea0f9133-f57b-4964-b16e-876b493793b6			2026-03-07 12:30:10.023009
4ffd0c89-5d91-4c8a-b450-49b41fb0f57d	Opus Rental Capital		saas	paused	opus	\N	{}		3b0a5194-9181-4429-a0cf-fde357b28a07			2026-03-07 12:30:10.023009
\.


--
-- Data for Name: client_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_types (id, key, label, color, active, created_at) FROM stdin;
c5108dd1-72d3-403a-bb0b-b38e05af7c14	acelera	Acelera	#3b82f6	t	2026-03-08 03:03:59.897823
2ccb5eac-68fe-479f-8e36-bf62c22f8901	opus	Opus	#8b5cf6	t	2026-03-08 03:04:03.98986
065c760c-2b90-4f34-9c4a-9939e8ed2778	thecorp	TheCorp	#f59e0b	t	2026-03-08 03:04:07.947941
5216a773-036b-467a-bef2-cdba891f87e2	partner	Partner	#22c55e	t	2026-03-08 03:04:11.982674
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, name, cnpj, email, phone, address, type, status, notes, created_at) FROM stdin;
704e693b-f779-4383-b3d6-51b202a5afab	OPUS					opus	active		2026-03-07 20:34:29.525234
81d5dd05-13fd-44b4-aee4-0f5918c15d2d	TELOS					opus	active		2026-03-08 02:53:17.305561
4be4617f-27f7-400d-b9e2-9c818402f9f6	G Farma					acelera	active		2026-03-08 02:54:51.883372
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, app_id, client_id, type, status, value, start_date, end_date, auto_renew, payment_day, notes, created_at) FROM stdin;
\.


--
-- Data for Name: db_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.db_metrics (id, database_id, status, connections_active, size_bytes, response_time_ms, collected_at) FROM stdin;
\.


--
-- Data for Name: developers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.developers (id, name, email, phone, role, level, status, monthly_rate, contract_type, skills, github_url, created_at, linkedin_url, portfolio_url, bio, languages, certifications, education, experience_years, availability, specializations) FROM stdin;
95fd7546-f8f5-4c71-b764-46366f8b15d5	Felipe Lacerda	felipe.lacerda@acelera.it	+55 11 97000-2000	CEO / Tech Lead	lead	active	15000.00	PJ	{React,Node.js,TypeScript,AWS,PostgreSQL,Next.js}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
cb470d49-e27e-485f-8ec3-c690936aa2d5	Lucas Marquisio	lucas.marquisio@acelera.it	+55 11 97111-2333	Fullstack Developer	senior	active	9000.00	PJ	{React,Node.js,APIs,SQL,TypeScript}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
3b0a5194-9181-4429-a0cf-fde357b28a07	Daniel Lacerda	daniel.lacerda@acelera.it	+55 11 97222-2666	Fullstack Developer	mid	active	7000.00	PJ	{React,Node.js,TypeScript,Tailwind}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
ea0f9133-f57b-4964-b16e-876b493793b6	Cristhian Sidoly	cristhian.sidoly@acelera.it	+55 11 97333-2999	Fullstack Developer	mid	active	7000.00	PJ	{React,Node.js,TypeScript,Mobile}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
5f2b3412-7d41-4808-89f7-771e40ca283d	Kauan	kauan@acelera.it	+55 11 97444-3332	Fullstack Developer	mid	active	7000.00	PJ	{React,Node.js,Mobile,TypeScript}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
bd5bb39a-6318-4bb6-82e2-9a0ee3f6bf81	Maico Fernandes	maico.fernandes@acelera.it	+55 11 97555-3665	Developer	mid	active	6000.00	PJ	{React,Node.js,TypeScript}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
73bd64e1-c05a-419d-a2bc-e90a1dbb155a	Cauã (TheCorp)	caua.thecorp@acelera.it	+55 11 97666-3998	Developer	junior	active	4000.00	PJ	{React,Node.js,TypeScript}	\N	2026-03-07 12:30:09.987115	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: financial_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_entries (id, type, category, app_id, dev_id, amount, date, description, recurring, created_at) FROM stdin;
\.


--
-- Data for Name: integrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integrations (id, name, type, status, config, last_sync, created_at) FROM stdin;
1dddb63c-712a-4215-a2bb-95779d82b6bb	Google Calendar	calendar	connected	\N	2026-03-07 10:30:10.36	2026-03-07 12:30:10.361882
e69d0894-53b9-4a89-b4c1-ee7a6773b525	Stripe	payment	disconnected	\N	\N	2026-03-07 12:30:10.361882
444ba465-1c47-425d-8485-aa46bee9f71a	Slack	messaging	disconnected	\N	\N	2026-03-07 12:30:10.361882
f69d8d7b-83e9-485d-991e-5e1ab4351025	GitHub	development	connected	\N	2026-03-07 12:00:10.36	2026-03-07 12:30:10.361882
650e0e6e-741f-4fa8-858b-c6ee97c3292f	Notion	productivity	disconnected	\N	\N	2026-03-07 12:30:10.361882
c19db32b-93be-48f0-9a0b-82a4f41a5e5a	WhatsApp Business	messaging	disconnected	\N	2026-03-07 11:30:10.36	2026-03-07 12:30:10.361882
\.


--
-- Data for Name: kanban_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kanban_tasks (id, app_id, dev_id, title, description, status, priority, estimated_hours, actual_hours, due_date, tags, created_at) FROM stdin;
bbd6bc00-a1e3-4963-95d2-dd6eca22bbc5	32528bbd-45e8-47df-9b76-daf119b0a677	cb470d49-e27e-485f-8ec3-c690936aa2d5	API Faturamento Telos	\N	in_dev	critical	24	20	2026-04-03 12:19:30.267	{backend,api}	2026-03-07 12:30:10.044523
34393318-58fb-455a-ae60-f6a2f38cd150	d0fa7155-dbd6-49d9-a032-224d9a4f0e59	cb470d49-e27e-485f-8ec3-c690936aa2d5	Integração iFood - Intera	\N	review	high	20	15	2026-03-29 16:05:18.513	{api,integration}	2026-03-07 12:30:10.044523
06baac86-f5c6-49da-b51b-632dc7e75ed9	08f7b81d-7417-4074-b087-af460de533fb	ea0f9133-f57b-4964-b16e-876b493793b6	Setup G Farma	\N	in_dev	high	40	10	2026-03-15 04:30:14.591	{setup,implantacao}	2026-03-07 12:30:10.044523
dd365252-18f5-4f17-a40a-7ffdb4cbee0d	030453d1-975f-44b6-9e8c-ce5fc1221468	5f2b3412-7d41-4808-89f7-771e40ca283d	Mobile Full Facilities	\N	staging	medium	30	28	2026-03-14 11:21:02.744	{mobile,react-native}	2026-03-07 12:30:10.044523
71432b46-8144-48d6-8ff4-872be4c654bf	b04f669a-bd11-4071-96b4-6b53e5571614	5f2b3412-7d41-4808-89f7-771e40ca283d	Atlas deploy final	\N	review	high	16	14	2026-03-10 21:37:35.915	{deploy,devops}	2026-03-07 12:30:10.044523
8f5e3831-782c-406e-bc3b-ea26eff6a14e	b9bb9344-1ed8-40bf-9f78-7d150ba792f9	ea0f9133-f57b-4964-b16e-876b493793b6	Robô automação	\N	paused	medium	20	12	2026-03-28 02:58:19.409	{automation,bot}	2026-03-07 12:30:10.044523
6e61599f-11a5-407b-96c2-4d08d8ca3ded	70d881fa-502c-4f53-8fcb-72ad7a6cc8f6	73bd64e1-c05a-419d-a2bc-e90a1dbb155a	Gestão Porto módulo inicial	\N	in_dev	medium	30	5	2026-03-31 15:56:06.598	{setup,thecorp}	2026-03-07 12:30:10.044523
b6b31f11-a3fe-4867-9889-c4a00b7f9039	8a8c6379-7fa4-43ec-ae1b-2b21e9777d99	73bd64e1-c05a-419d-a2bc-e90a1dbb155a	Clube Motos layout	\N	in_dev	medium	20	3	2026-03-21 05:37:31.978	{frontend,layout}	2026-03-07 12:30:10.044523
69a3dad4-9724-44ce-b4fb-d4616f873893	215a4a20-132f-4659-98a5-868b534498c7	95fd7546-f8f5-4c71-b764-46366f8b15d5	Acelera Hub - MVP	\N	in_dev	critical	60	3	2026-03-31 02:49:48.992	{platform,mvp}	2026-03-07 12:30:10.044523
e3a25e1f-4749-4773-9e54-41a90029cd49	c43f020d-bbd3-4501-8ad9-0553592e5862	bd5bb39a-6318-4bb6-82e2-9a0ee3f6bf81	Inventário setup	\N	in_dev	medium	24	4	2026-04-02 13:20:32.108	{setup}	2026-03-07 12:30:10.044523
fcf66612-c22b-4356-88e3-bd92b941ee29	162fbcb6-e3c2-4236-88fa-071144c89e79	3b0a5194-9181-4429-a0cf-fde357b28a07	Comercial frontend	\N	in_dev	high	32	8	2026-04-04 03:03:06.952	{frontend}	2026-03-07 12:30:10.044523
383b908b-5427-4036-b843-c75145a546bb	c2e435d5-9caa-4cc6-b038-881816344f59	95fd7546-f8f5-4c71-b764-46366f8b15d5	Melhorias UI Vagas	\N	review	high	16	8	2026-03-22 09:42:36.203	{frontend,ui}	2026-03-07 12:30:10.044523
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, name, company, email, phone, status, source, service_type, estimated_value, monthly_fee, implantation_fee, pricing_model, price_per_user, estimated_users, installments, team_size, tags, notes, created_at, client_id, project_type, existing_app_id) FROM stdin;
e7fb0dad-ea31-4fce-a454-27a845794b03	Ademicon	Ademicon	contato@ademicon.com.br	+55 11 99999-0000	new	Indicacao	{bpo}	0.00	0.00	\N	\N	\N	\N	\N	4	{ACELERA-IT}	\N	2026-03-07 12:30:10.055795	\N	new_app	\N
0f5d7bd2-c73d-4eb3-b884-f9d2e9d37aee	Vertex	Vertex	contato@vertex.com.br	+55 11 99999-0000	contacted	LinkedIn	{sistema}	36000.00	2500.00	0.00	fixed_plus_user	0.00	15	\N	\N	{SaaS,Recorrente}	\N	2026-03-07 12:30:10.055795	\N	new_app	\N
99185b2f-ac44-4cc1-a023-d31d1996140b	Miro	Loja de Carro	contato@lojadecarro.com.br	+55 11 99999-0000	contacted	Google Ads	{sistema}	0.00	900.00	1000.00	fixed	\N	\N	4	\N	{E-commerce}	\N	2026-03-07 12:30:10.055795	\N	new_app	\N
b6a6e0b7-61d7-4a59-b017-93ccb900e4eb	Ivan (Uniq)	Uniq	contato@uniq.com.br	+55 11 99999-0000	negotiating	Indicacao	{projeto}	0.00	\N	\N	\N	\N	\N	3	\N	{Prioritário,Enterprise}	\N	2026-03-07 12:30:10.055795	\N	new_app	\N
\.


--
-- Data for Name: monitoring_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.monitoring_config (id, key, value) FROM stdin;
dfff9517-23ac-41f7-b6df-5b487c04db1e	collection_interval	5
259b9fc4-58e0-46ab-844c-c8e9a1e900bb	retention_days	7
86fd6197-2974-439d-a065-7e86f01be84c	alerts_enabled	true
\.


--
-- Data for Name: origins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.origins (id, key, label, color, active, created_at) FROM stdin;
87012e6a-9dff-4487-853d-13acddf96228	thecorp	TheCorp	#f59e0b	t	2026-03-08 02:18:05.073468
3c56f34e-b3e3-48d1-be85-3abe534ea829	external_it	External	#d8f73b	t	2026-03-09 03:18:16.173526
cf45028f-d607-44de-8034-e14e968f0e12	opus	Opus	#0062ff	t	2026-03-08 02:18:05.073468
7bcfbc6e-eba2-4aff-b39e-1f3ab333d574	acelera	Acelera IT	#58adee	t	2026-03-08 02:18:05.073468
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, contract_id, client_id, amount, due_date, paid_date, status, payment_method, notes) FROM stdin;
\.


--
-- Data for Name: permission_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permission_roles (id, name, description, color, level, parent_role_id, is_system, created_at) FROM stdin;
40ac9b01-bb39-496c-a694-6ff5468d854b	Gerente	Gerencia operações e equipe	#f59e0b	1	584c9660-1805-4878-934b-11b1013a929a	t	2026-03-08 18:16:01.241327
d579ebc5-74ed-464e-b42c-e3ff660b2d64	Teste Role	Descrição de teste	#6366f1	0	\N	f	2026-03-08 18:17:29.370151
f3876b41-6d16-41bd-bdd6-89083c40ca98	DEV +	\N	#ef4444	2	40ac9b01-bb39-496c-a694-6ff5468d854b	f	2026-03-08 19:10:46.274853
a6beb199-d182-42fd-994c-143587fe8f55	Desenvolvedor	Acesso a módulos de desenvolvimento	#3b82f6	3	40ac9b01-bb39-496c-a694-6ff5468d854b	f	2026-03-08 18:16:01.258732
2dc2cfc7-b6cf-4213-8204-c8baa334137b	Visualizador	Apenas visualização	#6b7280	4	40ac9b01-bb39-496c-a694-6ff5468d854b	f	2026-03-08 18:16:01.263607
584c9660-1805-4878-934b-11b1013a929a	Administrador	Acesso total ao sistema	#ef4444	5	\N	f	2026-03-08 18:16:01.171431
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proposals (id, lead_id, client_id, title, status, service_type, value, installments, monthly_fee, implantation_fee, pricing_model, price_per_user, estimated_users, team_size, cost_items, valid_until, description, items, created_at) FROM stdin;
55847d67-5e79-4110-88e1-0cdfc2a8b9b0	b6a6e0b7-61d7-4a59-b017-93ccb900e4eb	\N	Proposta - Projeto Ivan (Uniq)	accepted	projeto	45000.00	3	\N	\N	\N	\N	\N	\N	\N	2026-04-06 12:30:10.059	Proposta comercial detalhada	Desenvolvimento + Implantação + Suporte 12 meses	2026-03-07 12:30:10.061662
2ae22bde-019b-4fdf-b63d-631e31c694b9	0f5d7bd2-c73d-4eb3-b884-f9d2e9d37aee	\N	Proposta - Sistema Vertex	sent	sistema	36000.00	\N	2500.00	5000.00	fixed_plus_user	89.90	15	\N	\N	2026-04-06 12:30:10.059	Proposta comercial detalhada	Desenvolvimento + Implantação + Suporte 12 meses	2026-03-07 12:30:10.061662
77d2c95f-ef7b-46be-9497-741d7d74b638	99185b2f-ac44-4cc1-a023-d31d1996140b	\N	Proposta - App Miro Loja de Carro	draft	projeto	24000.00	4	\N	\N	\N	\N	\N	\N	\N	2026-04-06 12:30:10.059	Proposta comercial detalhada	Desenvolvimento + Implantação + Suporte 12 meses	2026-03-07 12:30:10.061662
\.


--
-- Data for Name: repo_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.repo_files (id, app_id, name, original_name, folder_path, mime_type, size, path, uploaded_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, role_id, module_key, permissions, created_at) FROM stdin;
0ae88711-bf7e-4607-a6b9-53daeede53d7	584c9660-1805-4878-934b-11b1013a929a	dashboard	{"view": true}	2026-03-08 18:16:01.362785
b8c43d64-c096-4a15-8644-a7a17074d536	584c9660-1805-4878-934b-11b1013a929a	leads	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.371435
74e57908-7717-446b-907e-9017ed86696b	584c9660-1805-4878-934b-11b1013a929a	proposals	{"edit": true, "send": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.37834
3624f6a5-abf8-4c7a-bebf-13391773183d	584c9660-1805-4878-934b-11b1013a929a	apps	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.384557
11effbd2-1772-4e9a-aa17-87ff071809d8	584c9660-1805-4878-934b-11b1013a929a	apps.documents	{"view": true, "delete": true, "upload": true, "download": true}	2026-03-08 18:16:01.390816
7a5cc735-9f17-485f-ba09-21f558d16a8f	584c9660-1805-4878-934b-11b1013a929a	apps.ssh	{"view": true, "execute": true}	2026-03-08 18:16:01.397189
e6db154e-88b2-400c-92a3-f23d59424bf5	584c9660-1805-4878-934b-11b1013a929a	clients	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.403303
8436bd53-189c-44ef-a6f6-37902fd60575	584c9660-1805-4878-934b-11b1013a929a	contracts	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.409833
7ee0b084-7c89-46e5-ba8c-2738110d3814	584c9660-1805-4878-934b-11b1013a929a	payments	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.435242
f70ff757-3a65-40ef-89a4-5da7bcccfab6	584c9660-1805-4878-934b-11b1013a929a	financial	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.44423
35fc9644-25c0-450f-bb60-e11205515e6a	584c9660-1805-4878-934b-11b1013a929a	kanban	{"edit": true, "move": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.450743
cfa0319c-49da-4d80-a3dc-64d970a75697	584c9660-1805-4878-934b-11b1013a929a	developers	{"view": true}	2026-03-08 18:16:01.457721
7b925bfc-da56-439c-a982-e860faa67c7f	584c9660-1805-4878-934b-11b1013a929a	dev-team	{"edit": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.464466
c63bc539-88ac-422e-b9c7-fbf112f96c90	584c9660-1805-4878-934b-11b1013a929a	vps	{"ssh": true, "edit": true, "view": true, "create": true, "delete": true, "manage_databases": true}	2026-03-08 18:16:01.470212
2520f1de-e941-4b11-b22f-5a4a22ef43ea	584c9660-1805-4878-934b-11b1013a929a	health	{"view": true, "configure": true}	2026-03-08 18:16:01.477765
477c7af1-4f36-458c-8111-6334965c6f67	584c9660-1805-4878-934b-11b1013a929a	control	{"view": true, "configure": true, "manage_alerts": true}	2026-03-08 18:16:01.48464
1d837565-668c-409f-a8e2-67d9dc184071	584c9660-1805-4878-934b-11b1013a929a	permissions	{"view": true, "assign_users": true, "manage_roles": true}	2026-03-08 18:16:01.491351
43405d62-edf4-48ab-a67a-a2db86edcf75	584c9660-1805-4878-934b-11b1013a929a	settings	{"edit": true, "view": true}	2026-03-08 18:16:01.495997
0da9d8c1-6539-4b63-a540-a1ee0439c261	584c9660-1805-4878-934b-11b1013a929a	settings.users	{"edit": true, "view": true, "create": true, "delete": true, "assign_role": true}	2026-03-08 18:16:01.50191
32c72325-2556-4a05-ae5c-7ad1e41c803a	584c9660-1805-4878-934b-11b1013a929a	settings.integrations	{"view": true, "configure": true}	2026-03-08 18:16:01.507482
a8b4fd77-9b08-4212-9f47-1b42db4b5ac4	584c9660-1805-4878-934b-11b1013a929a	settings.ai	{"view": true, "configure": true}	2026-03-08 18:16:01.513791
453bfb01-1196-46ee-a21d-f369aa80b2a3	584c9660-1805-4878-934b-11b1013a929a	settings.origins	{"edit": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.518714
494febcb-3c08-486b-aed1-429e76bf6b44	584c9660-1805-4878-934b-11b1013a929a	settings.monitoring	{"view": true, "configure": true}	2026-03-08 18:16:01.525115
3ea711f4-8d0a-401b-975a-3ceb530c81ca	40ac9b01-bb39-496c-a694-6ff5468d854b	apps	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.552823
5eca388e-90ad-4e57-bcaf-a2f8bfbb6d85	40ac9b01-bb39-496c-a694-6ff5468d854b	apps.documents	{"view": true, "delete": true, "upload": true, "download": true}	2026-03-08 18:16:01.558732
a1237270-1e8a-4c47-9006-a1e92c77a5ac	40ac9b01-bb39-496c-a694-6ff5468d854b	apps.ssh	{"view": true, "execute": false}	2026-03-08 18:16:01.565241
eb5c50c7-d979-400d-8240-07c798240271	40ac9b01-bb39-496c-a694-6ff5468d854b	clients	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.571922
1f8d258e-f0b0-4e8c-b6d3-832c72edef2d	40ac9b01-bb39-496c-a694-6ff5468d854b	contracts	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.578964
faee125a-66b6-4f35-a9b7-976c19b58e7f	40ac9b01-bb39-496c-a694-6ff5468d854b	payments	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.588968
1ed33f00-746f-4f2c-aebf-59fb59cac466	40ac9b01-bb39-496c-a694-6ff5468d854b	financial	{"edit": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.596788
92ce57bb-99fb-4779-a446-da6fbbc3507f	40ac9b01-bb39-496c-a694-6ff5468d854b	kanban	{"edit": true, "move": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.603229
3b11e743-0655-45fc-9167-e6f3bb8809c3	40ac9b01-bb39-496c-a694-6ff5468d854b	developers	{"view": true}	2026-03-08 18:16:01.610388
30b0c40c-2695-4130-8564-34a7830f64a5	40ac9b01-bb39-496c-a694-6ff5468d854b	dev-team	{"edit": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.616264
fe9abe5f-9d77-480b-84ac-fea55a178a03	40ac9b01-bb39-496c-a694-6ff5468d854b	health	{"view": true, "configure": false}	2026-03-08 18:16:01.628229
f4a32190-3db3-4a4d-8264-7f45a5fa897e	40ac9b01-bb39-496c-a694-6ff5468d854b	control	{"view": true, "configure": false, "manage_alerts": true}	2026-03-08 18:16:01.633007
86cf83ed-c4d6-45d5-b8d7-7f4dabf58a95	40ac9b01-bb39-496c-a694-6ff5468d854b	permissions	{"view": true, "assign_users": false, "manage_roles": false}	2026-03-08 18:16:01.638624
279bddd9-52eb-4234-bc46-052b59d1f60a	40ac9b01-bb39-496c-a694-6ff5468d854b	settings	{"edit": true, "view": true}	2026-03-08 18:16:01.644991
50fe73de-d181-4776-91e6-142d85c78962	40ac9b01-bb39-496c-a694-6ff5468d854b	settings.users	{"edit": true, "view": true, "create": true, "delete": true, "assign_role": true}	2026-03-08 18:16:01.651039
a4ef21b9-c45f-467e-9dac-f6d1181f9b86	40ac9b01-bb39-496c-a694-6ff5468d854b	settings.integrations	{"view": true, "configure": false}	2026-03-08 18:16:01.656541
a478947e-f946-4458-b85d-09a7a9324eb6	40ac9b01-bb39-496c-a694-6ff5468d854b	settings.ai	{"view": true, "configure": false}	2026-03-08 18:16:01.662379
fae59b23-d2c0-4f00-a2e5-dfcc6a843607	40ac9b01-bb39-496c-a694-6ff5468d854b	settings.origins	{"edit": true, "view": true, "create": true, "delete": true}	2026-03-08 18:16:01.66934
817185f5-77a8-40d0-8c68-2fc8960afcab	40ac9b01-bb39-496c-a694-6ff5468d854b	leads	{"edit": false, "view": false, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.538567
56cd8893-4c4a-4f54-9364-e4a2da0c11da	40ac9b01-bb39-496c-a694-6ff5468d854b	proposals	{"edit": true, "send": true, "view": true, "create": true, "delete": true, "export": true}	2026-03-08 18:16:01.544825
8280d311-f54a-465d-a699-4340f75e0831	a6beb199-d182-42fd-994c-143587fe8f55	dashboard	{"view": true}	2026-03-08 18:16:01.757501
d7f559fd-290b-4f0e-b5c1-d1cad005825a	a6beb199-d182-42fd-994c-143587fe8f55	leads	{"edit": true, "view": true, "create": true, "delete": false, "export": false}	2026-03-08 18:16:02.002651
ff5fe385-7c1e-4390-a666-8714852e1d81	a6beb199-d182-42fd-994c-143587fe8f55	proposals	{"edit": true, "send": false, "view": true, "create": true, "delete": false, "export": false}	2026-03-08 18:16:02.008066
2e46c5c1-fff5-487d-a957-9fd2ec7a1713	a6beb199-d182-42fd-994c-143587fe8f55	apps	{"edit": true, "view": true, "create": true, "delete": false, "export": false}	2026-03-08 18:16:02.016768
6f65f99f-9957-4e8b-952e-144d09aa5c55	a6beb199-d182-42fd-994c-143587fe8f55	apps.documents	{"view": true, "delete": false, "upload": false, "download": false}	2026-03-08 18:16:02.023355
478514b0-dbf3-445f-b1ef-1c18172f5e26	a6beb199-d182-42fd-994c-143587fe8f55	apps.ssh	{"view": true, "execute": false}	2026-03-08 18:16:02.029154
f38a17ab-cb90-4b3d-8466-efe77b6bffe2	a6beb199-d182-42fd-994c-143587fe8f55	clients	{"edit": true, "view": true, "create": true, "delete": false, "export": false}	2026-03-08 18:16:02.034953
478d185a-c394-4ea8-9e59-7b523ab77c78	a6beb199-d182-42fd-994c-143587fe8f55	contracts	{"edit": true, "view": true, "create": true, "delete": false, "export": false}	2026-03-08 18:16:02.040595
8f23da2a-d8de-47eb-aa0a-36946eb2c22d	a6beb199-d182-42fd-994c-143587fe8f55	kanban	{"edit": true, "move": true, "view": true, "create": true, "delete": false}	2026-03-08 18:16:02.046551
81ed82fd-8e48-49cd-bd2f-ba6d47f3f0bb	a6beb199-d182-42fd-994c-143587fe8f55	developers	{"view": true}	2026-03-08 18:16:02.052429
4bc3d3fd-0631-43b7-b6eb-29b77214c1c5	a6beb199-d182-42fd-994c-143587fe8f55	dev-team	{"edit": true, "view": true, "create": true, "delete": false}	2026-03-08 18:16:02.057911
5ba56d89-6936-439f-b0fa-b601555ee5e8	a6beb199-d182-42fd-994c-143587fe8f55	vps	{"ssh": false, "edit": true, "view": true, "create": true, "delete": false, "manage_databases": false}	2026-03-08 18:16:02.063328
bb77d14e-9c52-4d0a-a3d7-0268abc72a7a	a6beb199-d182-42fd-994c-143587fe8f55	health	{"view": true, "configure": false}	2026-03-08 18:16:02.068794
e7c28a86-98c0-4274-ac38-f73050bc3236	a6beb199-d182-42fd-994c-143587fe8f55	control	{"view": true, "configure": false, "manage_alerts": false}	2026-03-08 18:16:02.074748
907d59ae-a3cd-4f69-b68c-a8302fa55097	a6beb199-d182-42fd-994c-143587fe8f55	settings.origins	{"edit": true, "view": true, "create": true, "delete": false}	2026-03-08 18:16:02.08094
50cbecf7-0d1a-46d3-ad5a-477dce108488	2dc2cfc7-b6cf-4213-8204-c8baa334137b	settings.monitoring	{"configure": false}	2026-03-08 19:10:58.781244
363231b3-7421-4c4c-85a2-2aba54272666	40ac9b01-bb39-496c-a694-6ff5468d854b	dashboard	{"view": false}	2026-03-08 18:16:01.531831
51ef89ae-8f02-4454-af30-9b21b4a4009e	40ac9b01-bb39-496c-a694-6ff5468d854b	vps	{"ssh": false, "edit": true, "view": true, "create": true, "delete": true, "manage_databases": true}	2026-03-08 18:16:01.621816
f1c9a93d-7cbb-4e4e-b287-84a4180b9924	40ac9b01-bb39-496c-a694-6ff5468d854b	settings.monitoring	{"view": true, "configure": false}	2026-03-08 18:16:01.745366
\.


--
-- Data for Name: tag_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tag_configs (id, name, color, created_at) FROM stdin;
54f3d258-b304-48d8-9990-3d8cf70f6026	Prioritário	#ef4444	2026-03-07 20:24:16.581374
6accd4b1-e819-41c9-a27a-227b3083cbb1	Urgente	#f97316	2026-03-07 20:24:16.581374
b2229e9c-ddbb-4052-9b7c-a5e4c08f4675	Enterprise	#8b5cf6	2026-03-07 20:24:16.581374
b93af702-0f36-4da5-8aac-5bcad0dc2f46	Startup	#06b6d4	2026-03-07 20:24:16.581374
cdfaceea-e2d2-46f3-bd69-d7c03905ea0b	SaaS	#3b82f6	2026-03-07 20:24:16.581374
9cb83841-1365-4ec9-b1f0-3ae047b0babc	Recorrente	#22c55e	2026-03-07 20:24:16.581374
9f938652-769c-417a-8427-6a3d827e5c66	E-commerce	#ec4899	2026-03-07 20:24:16.581374
38149e51-1b43-48ab-87a6-5ff8921c2a2a	Automação	#f59e0b	2026-03-07 20:24:16.581374
ccd2e4fe-e481-4a6e-8eef-60998888a84e	BPO	#14b8a6	2026-03-07 20:24:16.581374
c38c59cd-b0d4-4c38-84e2-4b33da4fab00	Consultoria	#6366f1	2026-03-07 20:24:16.581374
7942123e-8ab6-41ec-aceb-4bf9b4ef9a3f	Mobile	#a855f7	2026-03-07 20:24:16.581374
23e3202f-3038-4d20-9133-f950b89b40fd	Web	#0ea5e9	2026-03-07 20:24:16.581374
131ada87-e5a6-4e9b-a0d4-b42fd9589728	API	#10b981	2026-03-07 20:24:16.581374
71e7ef5d-7985-42c7-873c-5c9f6db78397	Integração	#f43f5e	2026-03-07 20:24:16.581374
f2eb92d3-8448-4c71-9e20-081cf22b646b	Implantação	#84cc16	2026-03-07 20:24:16.581374
bd8b5906-015d-4e52-9cec-ef6db5cfb2ba	Suporte	#64748b	2026-03-07 20:24:16.581374
1fab4c29-8b91-4522-8af2-db43de41908e	Fechado	#059669	2026-03-07 20:24:16.581374
937a9e9d-32b5-4637-aafe-1580d1d7ef22	Quente	#dc2626	2026-03-07 20:24:16.581374
0381ae15-41fc-43b7-b86d-e88fe60d01ad	Frio	#0284c7	2026-03-07 20:24:16.581374
ed0e4bcd-6f56-45eb-b842-01a07aaadaaa	MeuTeste	#ef4444	2026-03-07 20:29:27.192152
531e03c5-1d57-4223-8d09-3966b025b428	opus	#3b82f6	2026-03-07 20:51:04.873807
b77c88ad-7bd2-4c2b-9598-fe21fc195ecd	ACELERA-IT	#3b82f6	2026-03-07 20:51:24.747365
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, name, email, role, active, created_at, role_id) FROM stdin;
668059c0-1b32-4170-8afb-5108cc1a602a	lucas	$2b$10$MFdLR/CuVhvEqK4xZctcZ.9y/grnecfr.0.0QRPFhvV1AqlAgsnne	Lucas Marquisio	lucas.marquisio@acelera.it	manager	t	2026-03-07 12:30:10.357008	\N
d7f004f4-ccd3-4f26-83b6-2c6a178e89b7	daniel	$2b$10$/nxRcIu.Aw5mM4Tz42pBJeWKqG0rshnJFsOI6NlOiieI6QuVOYf96	Daniel Lacerda	daniel.lacerda@acelera.it	viewer	t	2026-03-07 12:30:10.357008	\N
deb3357f-f128-4e35-b3bb-dad03c51d019	felipe	$2b$10$jCzHD4LFRnmvZTCe3uYdz.PeFxh.5cHhPDlKYJZiaVwijO3TIitae	Felipe Lacerda	felipe.lacerda@acelera.it	admin	t	2026-03-07 12:30:10.357008	584c9660-1805-4878-934b-11b1013a929a
\.


--
-- Data for Name: vps_app_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_app_links (id, vps_id, app_id, created_at) FROM stdin;
04d7a378-c58e-4f98-b5b1-00603685a1eb	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2dc994f2-185d-4c7c-8485-03daaa37a623	2026-03-07 22:28:56.001603
a91705d7-988e-400d-992f-6cd517bf2d43	f3a36a15-7bdb-481e-9472-1a40156dff94	030453d1-975f-44b6-9e8c-ce5fc1221468	2026-03-08 01:40:53.98077
aff9f560-8846-401b-9526-e9c9e8aa6dba	b58f88d3-da10-4386-902f-201b857a31b9	5ed04cda-b0dc-4dac-80d7-149d4b26af13	2026-03-08 02:39:23.046959
16bcf945-7d68-4d8d-8bab-43f907a200e5	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	08f7b81d-7417-4074-b087-af460de533fb	2026-03-08 02:39:45.079394
d08cabb4-9ca9-4296-83e8-478a667ca655	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	c2e435d5-9caa-4cc6-b038-881816344f59	2026-03-08 02:45:26.575259
b0c9209b-cfb7-43ed-b4a7-9b7bd27ab9e9	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0683752d-9806-4c8f-ac98-0be18f5cd5eb	2026-03-08 02:45:30.03255
\.


--
-- Data for Name: vps_command_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_command_logs (id, vps_id, user_id, command, output, exit_code, executed_at) FROM stdin;
d2c822ae-0f45-4e9c-b517-05b663e6e0d6	3cfb027c-6805-444c-b21f-03cebcb6f5ab	\N	pm2 list	┌────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐\n│ id │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │\n├────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤\n│ 2  │ manutencao       │ default     │ N/A     │ fork    │ N/A      │ 0      │ 0    │ stopped   │ 0%       │ 0b       │ root     │ disabled │\n│ 1  │ opusticket       │ default     │ 1.0.0   │ fork    │ 441527   │ 4D     │ 2    │ online    │ 0%       │ 204.8mb  │ root     │ disabled │\n└────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘\nModule\n┌────┬──────────────────────────────┬───────────────┬──────────┬──────────┬──────┬──────────┬──────────┬──────────┐\n│ id │ module                       │ version       │ pid      │ status   │ ↺    │ cpu      │ mem      │ user     │\n├────┼──────────────────────────────┼───────────────┼──────────┼──────────┼──────┼──────────┼──────────┼──────────┤\n│ 0  │ pm2-logrotate                │ 3.0.0         │ 395469   │ online   │ 0    │ 0%       │ 79.7mb   │ root     │\n└────┴──────────────────────────────┴───────────────┴──────────┴──────────┴──────┴──────────┴──────────┴──────────┘\n	0	2026-03-07 22:16:16.107503
5a99adf2-bbc7-4465-9494-b9529d668aea	3cfb027c-6805-444c-b21f-03cebcb6f5ab	\N	uptime	 19:28:19 up 36 days, 14:01,  1 user,  load average: 0.14, 0.03, 0.01\n	0	2026-03-07 22:28:19.565471
e613c12b-b307-465f-8e94-5e6da4004020	3cfb027c-6805-444c-b21f-03cebcb6f5ab	\N	journalctl -n 50 --no-pager	Mar 07 19:28:13 ticketflow sshd[513422]: Accepted password for root from 35.185.19.161 port 51954 ssh2\nMar 07 19:28:13 ticketflow sshd[513422]: pam_unix(sshd:session): session opened for user root(uid=0) by root(uid=0)\nMar 07 19:28:13 ticketflow systemd-logind[748]: New session 6328 of user root.\nMar 07 19:28:13 ticketflow systemd[1]: Created slice user-0.slice - User Slice of UID 0.\nMar 07 19:28:13 ticketflow systemd[1]: Starting user-runtime-dir@0.service - User Runtime Directory /run/user/0...\nMar 07 19:28:13 ticketflow systemd[1]: Finished user-runtime-dir@0.service - User Runtime Directory /run/user/0.\nMar 07 19:28:13 ticketflow systemd[1]: Starting user@0.service - User Manager for UID 0...\nMar 07 19:28:13 ticketflow (systemd)[513426]: pam_unix(systemd-user:session): session opened for user root(uid=0) by root(uid=0)\nMar 07 19:28:13 ticketflow systemd[513426]: Queued start job for default target default.target.\nMar 07 19:28:13 ticketflow systemd[513426]: Created slice app.slice - User Application Slice.\nMar 07 19:28:13 ticketflow systemd[513426]: Started launchpadlib-cache-clean.timer - Clean up old files in the Launchpadlib cache.\nMar 07 19:28:13 ticketflow systemd[513426]: Reached target paths.target - Paths.\nMar 07 19:28:13 ticketflow systemd[513426]: Reached target timers.target - Timers.\nMar 07 19:28:13 ticketflow systemd[513426]: Starting dbus.socket - D-Bus User Message Bus Socket...\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on dirmngr.socket - GnuPG network certificate management daemon.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on gpg-agent-browser.socket - GnuPG cryptographic agent and passphrase cache (access for web browsers).\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on gpg-agent-extra.socket - GnuPG cryptographic agent and passphrase cache (restricted).\nMar 07 19:28:13 ticketflow systemd[513426]: Starting gpg-agent-ssh.socket - GnuPG cryptographic agent (ssh-agent emulation)...\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on gpg-agent.socket - GnuPG cryptographic agent and passphrase cache.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on keyboxd.socket - GnuPG public key management service.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on pk-debconf-helper.socket - debconf communication socket.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on snapd.session-agent.socket - REST API socket for snapd user session agent.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on dbus.socket - D-Bus User Message Bus Socket.\nMar 07 19:28:13 ticketflow systemd[513426]: Listening on gpg-agent-ssh.socket - GnuPG cryptographic agent (ssh-agent emulation).\nMar 07 19:28:13 ticketflow systemd[513426]: Reached target sockets.target - Sockets.\nMar 07 19:28:13 ticketflow systemd[513426]: Reached target basic.target - Basic System.\nMar 07 19:28:13 ticketflow systemd[513426]: Reached target default.target - Main User Target.\nMar 07 19:28:13 ticketflow systemd[513426]: Startup finished in 176ms.\nMar 07 19:28:13 ticketflow systemd[1]: Started user@0.service - User Manager for UID 0.\nMar 07 19:28:13 ticketflow systemd[1]: Started session-6328.scope - Session 6328 of User root.\nMar 07 19:28:15 ticketflow sshd[513422]: Received disconnect from 35.185.19.161 port 51954:11:\nMar 07 19:28:15 ticketflow sshd[513422]: Disconnected from user root 35.185.19.161 port 51954\nMar 07 19:28:15 ticketflow sshd[513422]: pam_unix(sshd:session): session closed for user root\nMar 07 19:28:15 ticketflow systemd[1]: session-6328.scope: Deactivated successfully.\nMar 07 19:28:15 ticketflow systemd-logind[748]: Session 6328 logged out. Waiting for processes to exit.\nMar 07 19:28:15 ticketflow systemd-logind[748]: Removed session 6328.\nMar 07 19:28:19 ticketflow sshd[513505]: Accepted password for root from 35.185.19.161 port 43858 ssh2\nMar 07 19:28:19 ticketflow sshd[513505]: pam_unix(sshd:session): session opened for user root(uid=0) by root(uid=0)\nMar 07 19:28:19 ticketflow systemd-logind[748]: New session 6330 of user root.\nMar 07 19:28:19 ticketflow systemd[1]: Started session-6330.scope - Session 6330 of User root.\nMar 07 19:28:19 ticketflow sshd[513505]: Received disconnect from 35.185.19.161 port 43858:11:\nMar 07 19:28:19 ticketflow sshd[513505]: Disconnected from user root 35.185.19.161 port 43858\nMar 07 19:28:19 ticketflow sshd[513505]: pam_unix(sshd:session): session closed for user root\nMar 07 19:28:19 ticketflow systemd[1]: session-6330.scope: Deactivated successfully.\nMar 07 19:28:19 ticketflow systemd-logind[748]: Session 6330 logged out. Waiting for processes to exit.\nMar 07 19:28:19 ticketflow systemd-logind[748]: Removed session 6330.\nMar 07 19:28:24 ticketflow sshd[513556]: Accepted password for root from 35.185.19.161 port 43870 ssh2\nMar 07 19:28:24 ticketflow sshd[513556]: pam_unix(sshd:session): session opened for user root(uid=0) by root(uid=0)\nMar 07 19:28:24 ticketflow systemd-logind[748]: New session 6331 of user root.\nMar 07 19:28:24 ticketflow systemd[1]: Started session-6331.scope - Session 6331 of User root.\n	0	2026-03-07 22:28:25.43006
8c009059-f82a-492b-ae28-480fa5d5170c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	\N	ss -tulpn	Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess                                                                                                                                   \nudp   UNCONN 0      0         127.0.0.54:53         0.0.0.0:*    users:(("systemd-resolve",pid=65857,fd=16))                                                                                              \nudp   UNCONN 0      0      127.0.0.53%lo:53         0.0.0.0:*    users:(("systemd-resolve",pid=65857,fd=14))                                                                                              \nudp   UNCONN 0      0                  *:44246            *:*    users:(("cloudflared",pid=1490,fd=9))                                                                                                    \nudp   UNCONN 0      0                  *:32781            *:*    users:(("cloudflared",pid=1490,fd=17))                                                                                                   \nudp   UNCONN 0      0                  *:41799            *:*    users:(("cloudflared",pid=1490,fd=6))                                                                                                    \nudp   UNCONN 0      0                  *:33956            *:*    users:(("cloudflared",pid=1490,fd=16))                                                                                                   \ntcp   LISTEN 0      4096      127.0.0.54:53         0.0.0.0:*    users:(("systemd-resolve",pid=65857,fd=17))                                                                                              \ntcp   LISTEN 0      511          0.0.0.0:80         0.0.0.0:*    users:(("nginx",pid=206712,fd=5),("nginx",pid=206711,fd=5),("nginx",pid=206710,fd=5),("nginx",pid=206709,fd=5),("nginx",pid=206707,fd=5))\ntcp   LISTEN 0      4096         0.0.0.0:22         0.0.0.0:*    users:(("sshd",pid=65810,fd=3),("systemd",pid=1,fd=95))                                                                                  \ntcp   LISTEN 0      4096       127.0.0.1:20241      0.0.0.0:*    users:(("cloudflared",pid=1490,fd=3))                                                                                                    \ntcp   LISTEN 0      200        127.0.0.1:5432       0.0.0.0:*    users:(("postgres",pid=483015,fd=7))                                                                                                     \ntcp   LISTEN 0      511          0.0.0.0:5000       0.0.0.0:*    users:(("node /root/TICK",pid=441527,fd=22))                                                                                             \ntcp   LISTEN 0      4096   127.0.0.53%lo:53         0.0.0.0:*    users:(("systemd-resolve",pid=65857,fd=15))                                                                                              \ntcp   LISTEN 0      511        127.0.0.1:6379       0.0.0.0:*    users:(("redis-server",pid=395413,fd=6))                                                                                                 \ntcp   LISTEN 0      200            [::1]:5432          [::]:*    users:(("postgres",pid=483015,fd=6))                                                                                                     \ntcp   LISTEN 0      511             [::]:80            [::]:*    users:(("nginx",pid=206712,fd=6),("nginx",pid=206711,fd=6),("nginx",pid=206710,fd=6),("nginx",pid=206709,fd=6),("nginx",pid=206707,fd=6))\ntcp   LISTEN 0      4096            [::]:22            [::]:*    users:(("sshd",pid=65810,fd=4),("systemd",pid=1,fd=96))                                                                                  \ntcp   LISTEN 0      511            [::1]:6379          [::]:*    users:(("redis-server",pid=395413,fd=7))                                                                                                 \n	0	2026-03-07 22:28:33.764753
1c990b66-2742-4b4c-9d3f-71f50c3236be	3cfb027c-6805-444c-b21f-03cebcb6f5ab	\N	pm2 list	┌────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐\n│ id │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │\n├────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤\n│ 2  │ manutencao       │ default     │ N/A     │ fork    │ N/A      │ 0      │ 0    │ stopped   │ 0%       │ 0b       │ root     │ disabled │\n│ 1  │ opusticket       │ default     │ 1.0.0   │ fork    │ 441527   │ 4D     │ 2    │ online    │ 0%       │ 204.8mb  │ root     │ disabled │\n└────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘\nModule\n┌────┬──────────────────────────────┬───────────────┬──────────┬──────────┬──────┬──────────┬──────────┬──────────┐\n│ id │ module                       │ version       │ pid      │ status   │ ↺    │ cpu      │ mem      │ user     │\n├────┼──────────────────────────────┼───────────────┼──────────┼──────────┼──────┼──────────┼──────────┼──────────┤\n│ 0  │ pm2-logrotate                │ 3.0.0         │ 395469   │ online   │ 0    │ 0%       │ 79.7mb   │ root     │\n└────┴──────────────────────────────┴───────────────┴──────────┴──────────┴──────┴──────────┴──────────┴──────────┘\n	0	2026-03-07 22:34:37.868815
6c439cf7-4cd4-4b76-a961-e3ba4514da44	b58f88d3-da10-4386-902f-201b857a31b9	\N	pm2 list	┌────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐\n│ id │ name          │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │\n├────┼───────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤\n│ 0  │ vittaverde    │ default     │ 1.0.0   │ fork    │ 467759   │ 9D     │ 1    │ online    │ 0%       │ 149.6mb  │ root     │ disabled │\n└────┴───────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘\n	0	2026-03-08 01:50:25.968538
800b13f9-7d2f-41f1-9853-1297dc65ae45	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	\N	df -h	Filesystem      Size  Used Avail Use% Mounted on\ntmpfs           1.6G  1.1M  1.6G   1% /run\n/dev/sda1       193G   25G  169G  13% /\ntmpfs           7.9G  1.1M  7.9G   1% /dev/shm\ntmpfs           5.0M     0  5.0M   0% /run/lock\n/dev/sda16      881M  119M  701M  15% /boot\n/dev/sda15      105M  6.2M   99M   6% /boot/efi\ntmpfs           1.6G   12K  1.6G   1% /run/user/0\n	0	2026-03-08 02:43:21.169056
e8f9c698-006b-4763-966e-e5a450000d82	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	\N	pm2 list	┌────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐\n│ id │ name               │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │\n├────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤\n│ 0  │ gfarma-backend     │ default     │ 1.0.0   │ fork    │ 2097259  │ 46h    │ 5    │ online    │ 0%       │ 146.5mb  │ root     │ disabled │\n│ 1  │ gfarma-frontend    │ default     │ 0.1.0   │ fork    │ 2093832  │ 2D     │ 0    │ online    │ 0%       │ 174.8mb  │ root     │ disabled │\n└────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘\n	0	2026-03-08 17:33:51.256985
6a4680ad-7ead-4c88-9ebf-84ab7acd2b55	f3a36a15-7bdb-481e-9472-1a40156dff94	\N	pm2 list	┌────┬───────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐\n│ id │ name                  │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │\n├────┼───────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤\n│ 0  │ acelera-facilities    │ default     │ 1.0.0   │ fork    │ 28179    │ 33D    │ 0    │ online    │ 0%       │ 182.6mb  │ root     │ disabled │\n└────┴───────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘\n	0	2026-03-08 18:28:06.762138
\.


--
-- Data for Name: vps_databases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_databases (id, vps_id, name, type, host, port, database_name, status, size_bytes, notes, created_at) FROM stdin;
\.


--
-- Data for Name: vps_db_app_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_db_app_links (id, database_id, app_id, created_at) FROM stdin;
\.


--
-- Data for Name: vps_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_metrics (id, vps_id, cpu_percent, memory_percent, disk_percent, load_avg_1, load_avg_5, load_avg_15, network_in, network_out, process_count, uptime_seconds, collected_at) FROM stdin;
506ef19c-a825-4f16-a81a-4aa0e2146594	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.0	6.0	9.0	0.04	0.02	0.00	4253226526	2513551873	142	229680	2026-03-08 17:38:12.184
9feb5267-7cb6-4287-9674-bfd7544f082d	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7687172835	7268819470	132	206400	2026-03-08 17:38:17.877
a59bd490-474a-44d1-8227-57fc1ad584de	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.04	0.00	1090612237460	1864165474959	143	205860	2026-03-08 17:38:23.83
b47ead74-a21c-4afd-b078-9473367fc865	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144090856753	201277656426	136	477660	2026-03-08 17:38:29.564
c4466a2e-8cc7-43f4-b5de-0b4e71409a07	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.00	0.00	5835447542	5176000548	116	293820	2026-03-08 17:38:35.235
ffd175c3-acb8-4d86-b5cd-e5c2b69869dd	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.02	0.01	4253873504	2514224999	143	229860	2026-03-08 17:41:07.473
7497cc93-979d-44ec-a58d-d1ff64d9f745	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7687312657	7269012575	134	206580	2026-03-08 17:41:13.146
dd31db7a-9a8b-4901-99a8-cfbc20dc246a	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.03	0.00	1090612323733	1864165586364	140	206040	2026-03-08 17:41:19.059
856bed49-c43c-4f8d-8a8d-18562ce4cc95	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144091098898	201278030679	138	477840	2026-03-08 17:41:24.768
956bd355-4a84-4961-a80d-49a4fbec44fa	b58f88d3-da10-4386-902f-201b857a31b9	7.0	9.0	11.0	0.14	0.04	0.01	5835548778	5176100556	116	294000	2026-03-08 17:41:30.435
6fa265b7-b842-489c-992f-ffd884da5670	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.04	0.01	4254997304	2515395789	143	230160	2026-03-08 17:46:06.484
9fa42fbb-ce2c-4113-97a0-1836b0c67478	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.00	0.00	7687546191	7269332954	134	206880	2026-03-08 17:46:12.197
ecdb3e3a-a769-403c-a95b-9e0a5081aee0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1090612467596	1864165770572	143	206340	2026-03-08 17:46:18.086
c63cea7d-f9ca-43f6-9f92-b784c43da0d0	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144091521754	201278680170	136	478140	2026-03-08 17:46:23.746
198e4b6c-4a1a-4fd6-be06-53db05c6c844	b58f88d3-da10-4386-902f-201b857a31b9	5.0	9.0	11.0	0.10	0.04	0.01	5835700721	5176290709	115	294300	2026-03-08 17:46:29.435
b6a08262-e0a8-4ebd-8ed1-66272362fedb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.5	6.0	9.0	0.06	0.03	0.00	4255633106	2516060672	143	230340	2026-03-08 17:48:55.936
b1288581-602c-4961-bfdc-8e1b63c7fee6	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7687670985	7269510775	132	207000	2026-03-08 17:49:01.601
fec910a2-6aed-4634-92e3-7745acf54447	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1090612549927	1864165876528	144	206520	2026-03-08 17:49:07.524
c72daea9-a682-4dd1-9f14-b80f160797aa	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.00	0.00	144091764801	201279052949	136	478320	2026-03-08 17:49:13.212
32854845-7739-4eeb-b0e3-f1c6c6854259	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.02	0.00	5835792290	5176405514	116	294420	2026-03-08 17:49:18.908
07fa924a-b3b2-4a8b-af5e-ecd2366d4dff	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4256104843	2516554463	145	230460	2026-03-08 17:51:00.88
c67433a9-1225-4ce3-aa02-ee93ccc7d32e	f3a36a15-7bdb-481e-9472-1a40156dff94	0.8	5.0	9.0	0.03	0.01	0.00	7687767616	7269647482	133	207120	2026-03-08 17:51:06.576
2720d93b-e8d8-4b5b-8b3a-ae671d169a53	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1090612615488	1864165960660	143	206640	2026-03-08 17:51:12.512
387377f9-83c0-4bdc-a20a-528d8e8b5784	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144091942366	201279326503	137	478440	2026-03-08 17:51:18.259
92f73c66-55e9-4ed9-a29d-5de523439a90	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.01	0.00	5835860267	5176491731	118	294540	2026-03-08 17:51:23.989
47347d23-2650-4882-9323-9947d23ce769	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4256309016	2516768564	145	230520	2026-03-08 17:51:51.934
486d309a-bc49-4536-bdb0-465c793a82f0	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7687809987	7269707945	133	207180	2026-03-08 17:51:57.39
0f29846c-cc89-4a5b-a452-f1b0fe1af469	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1090612645637	1864165998942	143	206700	2026-03-08 17:52:02.932
4f55a8b7-34f6-4f5d-92ee-84f2321b69cb	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144092024370	201279450010	139	478500	2026-03-08 17:52:08.382
ac082fc0-1246-4db0-89fa-402baf6c5496	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5835893515	5176534787	118	294600	2026-03-08 17:52:13.842
482f368a-d2db-4806-86ff-5d3549c63174	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4257423416	2517899079	142	230820	2026-03-08 17:56:50.119
3c3fb366-c30b-45c2-a359-d0196fbf18ef	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7688022551	7269978535	132	207480	2026-03-08 17:56:55.824
f4a9b07b-7f7c-42a7-9d15-0aa1f30db3b1	3cfb027c-6805-444c-b21f-03cebcb6f5ab	9.5	7.0	12.0	0.38	0.10	0.03	1090621922465	1864166401854	147	207000	2026-03-08 17:57:02.208
644499e4-92b1-4401-9240-b21a3916a707	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.04	0.01	144092441016	201280085137	136	478800	2026-03-08 17:57:07.915
b82303e5-0326-4e0d-bd49-23f0ed8ac3b2	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836040046	5176710741	116	294900	2026-03-08 17:57:13.596
0a93b044-40b7-4564-8f43-5ec931420920	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4257761655	2518254848	144	230880	2026-03-08 17:58:23.012
2ad08122-6b29-436b-a483-bd1aab186faa	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7688091123	7270077620	132	207600	2026-03-08 17:58:28.704
7463d266-7192-4812-853f-c9abdc1987cd	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.3	7.0	12.0	0.17	0.12	0.04	1090621971155	1864166462798	143	207120	2026-03-08 17:58:34.609
5e790246-2b9f-444e-96c9-5a37079c498b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.02	0.00	144092573321	201280287403	137	478920	2026-03-08 17:58:40.282
b8c2659d-3994-46eb-8d37-0870b9784cc9	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5836093312	5176775841	118	295020	2026-03-08 17:58:45.959
fb86fd88-2365-4a29-b4a3-1aaa2f45172e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4257935069	2518437444	141	230940	2026-03-08 17:59:09.993
80cd2b55-1b76-446f-8709-152e81d80ecc	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7688129803	7270131902	133	207660	2026-03-08 17:59:15.46
491780ab-9a2e-4791-9815-4fc88e32fbf0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.11	0.04	1090621999751	1864166499903	145	207120	2026-03-08 17:59:21.01
3b4cfde8-a112-4bae-82e6-6b4afd05138a	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144092643679	201280394911	137	478920	2026-03-08 17:59:26.527
9eb4de1f-7dbc-4c24-9aa3-d8bb691c3033	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836120861	5176810655	117	295080	2026-03-08 17:59:32.043
cd0df521-483a-427c-8932-779f97430f90	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4258119745	2518638252	144	231000	2026-03-08 17:59:55.048
26cbb331-774f-4b7d-8cb5-0e4ea1bac333	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7688169869	7270192199	132	207660	2026-03-08 18:00:00.762
4c7fe98f-5ec9-45ec-9443-947a7d9d67ef	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5838181681	5180101601	117	296580	2026-03-08 18:25:09.328
17b5e782-fe01-4362-aa5b-5bedb9d775ad	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.8	6.0	12.0	0.11	0.10	0.04	1090622030006	1864166537917	147	207180	2026-03-08 18:00:07.487
cc2250aa-12b4-4b58-89ff-585601788c63	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144092716536	201280505962	138	478980	2026-03-08 18:00:13.366
34a9a9e2-1219-4acf-a1a7-afa0bae842e7	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836153292	5176851138	118	295080	2026-03-08 18:00:19.117
661fa7ca-efdc-48c4-a71e-5832f52d43b3	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4259070665	2519628746	146	231240	2026-03-08 18:04:14.639
546e90ae-bb27-4723-ab92-76511a4c88d9	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7688364178	7270460692	133	207960	2026-03-08 18:04:20.324
5ba8330e-a127-43de-b49b-48e440f835b7	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.06	0.02	1090622150348	1864166683976	144	207420	2026-03-08 18:04:26.215
bd10a77d-7ac3-4ebe-adc7-9d86ba9550db	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144093074093	201281055728	138	479220	2026-03-08 18:04:31.94
c3dd5620-d798-46e3-83da-48f45fa8f09e	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836858331	5178078918	117	295380	2026-03-08 18:04:37.709
9742678b-6477-43bc-921e-a0deb181dd3b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4259375009	2519950386	142	231300	2026-03-08 18:05:37.597
6dd3de74-2415-496e-8b2d-f3a3a02dc004	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7688450021	7270557499	136	208020	2026-03-08 18:05:43.296
721b0b59-af54-4907-9f34-f412050dc009	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.04	0.02	1090622192482	1864166739082	141	207540	2026-03-08 18:05:49.222
e4255e23-4819-40a9-9e4a-4dedd4957b21	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144093191386	201281241518	138	479340	2026-03-08 18:05:54.938
dacf2896-780c-4bbf-8a7e-c8853aab8106	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836912225	5178146770	117	295440	2026-03-08 18:06:00.636
cc1424b2-01f5-4672-a8d7-20b5a7d9cbee	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4259628594	2520218283	143	231360	2026-03-08 18:06:45.068
82dacfa1-b3e7-4e4d-bd23-d1be4935af75	f3a36a15-7bdb-481e-9472-1a40156dff94	0.8	5.0	9.0	0.03	0.01	0.00	7688504294	7270633558	136	208080	2026-03-08 18:06:50.762
86f80c95-4556-403f-9b7c-57ea4f528324	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	7.0	12.0	0.00	0.03	0.01	1090622227862	1864166785354	144	207600	2026-03-08 18:06:56.655
b32bb1b8-3aa1-4a44-b361-883757c721f6	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144093291941	201281398525	140	479400	2026-03-08 18:07:02.373
0bc00205-16b4-4728-b08e-f11d7708bdd1	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5836951461	5178195443	120	295500	2026-03-08 18:07:08.129
3cd8511d-1c1c-4956-9ce0-3905d4664322	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.03	0.00	4260733668	2521361477	143	231660	2026-03-08 18:11:43.394
fea88170-e826-4b93-aa35-a3bf90a81e91	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7688721604	7270949425	132	208380	2026-03-08 18:11:49.085
5b60d246-0f3c-4d0b-b101-98d9a5fc9f7c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1090622371140	1864166969785	141	207900	2026-03-08 18:11:54.971
8140ac1a-70a2-4aeb-917c-6930a227136e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144093701749	201282045111	137	479700	2026-03-08 18:12:00.679
acfbd1ca-cade-4b22-80f2-a95ae83e15f1	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5837116235	5178365768	117	295800	2026-03-08 18:12:06.516
81d4cdf2-563c-4f62-8f7d-15781ab216ce	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.5	6.0	9.0	0.06	0.02	0.00	4261701052	2522377027	141	231960	2026-03-08 18:16:10.795
5c0119a3-c771-41bf-8ad4-e0df8df8a600	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7688911051	7271227818	133	208680	2026-03-08 18:16:16.553
aeda86d2-a1f5-4912-a5da-ef59d302484d	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1090622502233	1864167139472	141	208140	2026-03-08 18:16:22.503
23f85ff2-fe58-40da-a986-36c61bc6b7fd	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144094064305	201282621562	135	479940	2026-03-08 18:16:28.249
47ee9e49-4228-4e8e-8a44-e3f7b4cdee10	b58f88d3-da10-4386-902f-201b857a31b9	2.0	9.0	11.0	0.04	0.02	0.00	5837916775	5179782337	117	296100	2026-03-08 18:16:33.939
0449230c-0e7a-4e6b-a042-f6d1a2808739	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.01	0.00	4261878025	2522565634	143	232020	2026-03-08 18:16:56.993
0e10f8b6-8068-4a0d-9027-ec71ce34976e	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.01	0.00	7688952727	7271285973	132	208680	2026-03-08 18:17:02.506
e2535ab8-da9e-4e63-9c69-79e441cde79e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.0	6.0	12.0	0.04	0.01	0.00	1090622529852	1864167175358	139	208200	2026-03-08 18:17:08.011
872c771d-5c94-480a-8274-8e2e9a03447e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144094133549	201282730798	137	480000	2026-03-08 18:17:13.495
dd664db8-8da1-4e9b-bb99-d7d81249d1fa	b58f88d3-da10-4386-902f-201b857a31b9	1.0	9.0	11.0	0.02	0.02	0.00	5837945007	5179818646	117	296100	2026-03-08 18:17:18.974
6ee8a76e-b59e-4605-a2e7-44e37a2cda98	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4262172765	2522876195	145	232080	2026-03-08 18:18:16.729
6ff9fdbc-c8f6-4626-8e18-d0534cff4e26	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.00	0.00	7689008371	7271366903	132	208800	2026-03-08 18:18:22.395
d3453197-e2fe-4ece-bab9-806b17b7d0cb	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.03	0.00	1090622575874	1864167235423	143	208260	2026-03-08 18:18:28.256
3da4ea8d-179a-4ae5-b655-acf3b3813f27	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144094247452	201282910724	137	480060	2026-03-08 18:18:33.928
a4935331-e4b0-48fc-8c72-a442dc9020fc	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.01	0.00	5837989508	5179871707	117	296220	2026-03-08 18:18:39.617
ffe64f6d-ef26-46db-b098-cea3139c01a8	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4262509900	2523231172	145	232140	2026-03-08 18:19:48.382
9e0955a2-5968-4459-9202-3ea7b886405d	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7689079558	7271467200	133	208860	2026-03-08 18:19:54.109
0373d7c0-a360-4244-9012-9d60d6b0822c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.02	0.00	1090622625540	1864167299562	143	208380	2026-03-08 18:20:00.02
aff66512-2ff2-4689-8c9d-a07e2074f0c7	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144094375246	201283113374	139	480180	2026-03-08 18:20:06.099
584e9399-87da-401c-a971-29692e0a4d11	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5838038413	5179930922	117	296280	2026-03-08 18:20:11.822
c84088a5-a678-4fc5-89ee-78f9cc76702c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4263586937	2524361461	144	232440	2026-03-08 18:24:46.069
3a0fda87-52f6-4204-947a-75d7af675237	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7689283047	7271757628	134	209160	2026-03-08 18:24:51.807
3906efda-4535-4070-978b-43b372dfb735	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1090622769870	1864167482795	143	208680	2026-03-08 18:24:57.793
13e542bd-7938-4484-bfd7-a89ca487167b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144094777777	201283747587	139	480480	2026-03-08 18:25:03.581
0ac2a9ce-ee27-4dc0-81a6-5b62bb01218b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4264678255	2525530525	142	232740	2026-03-08 18:29:46.002
0a2a8b18-8d1c-4efe-8352-916c26708cc5	f3a36a15-7bdb-481e-9472-1a40156dff94	3.5	5.0	9.0	0.14	0.03	0.01	7689480154	7272046122	131	209460	2026-03-08 18:29:51.65
257781a1-0ff1-43c0-bf32-b7060e9c9d23	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1090622916060	1864167667261	142	208980	2026-03-08 18:29:57.589
c6d82f24-4f98-4d65-9382-499e8e7d5610	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144095189529	201284395325	137	480780	2026-03-08 18:30:03.488
3e51a50f-d5c8-461d-bc06-4abc3dec0593	b58f88d3-da10-4386-902f-201b857a31b9	2.5	9.0	11.0	0.05	0.02	0.00	5838340267	5180296262	118	296880	2026-03-08 18:30:09.261
b384c235-cee2-4d78-80ce-0f95a981ec06	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4265764320	2526665797	143	233040	2026-03-08 18:34:46.093
fe9377fa-00b7-467c-848e-fed573847e33	f3a36a15-7bdb-481e-9472-1a40156dff94	3.0	5.0	9.0	0.12	0.04	0.01	7689708986	7272373847	133	209760	2026-03-08 18:34:51.779
f51c99e1-1407-45fb-81e0-1fa4c2bd43b9	3cfb027c-6805-444c-b21f-03cebcb6f5ab	14.0	6.0	12.0	0.56	0.12	0.04	1090623066057	1864167855428	142	209280	2026-03-08 18:34:57.738
f6af5a77-a0dc-476d-a5b5-9600e2996f0e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144095606335	201285046767	138	481080	2026-03-08 18:35:03.423
be95baec-cf94-44fa-bac8-c027e9d10df7	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.02	0.00	5838497577	5180492360	119	297180	2026-03-08 18:35:09.151
ed77ffe6-7b87-4519-b616-2144e9cc07c4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4266859124	2527808384	141	233340	2026-03-08 18:39:45.989
5b4f18e5-2267-49a6-ae60-927ea8362710	f3a36a15-7bdb-481e-9472-1a40156dff94	3.8	5.0	9.0	0.15	0.04	0.01	7689933597	7272695245	131	210060	2026-03-08 18:39:51.642
b910c73a-9090-4fa0-8c52-220052205c7f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.0	7.0	12.0	0.16	0.08	0.03	1090687397486	1864258596467	141	209580	2026-03-08 18:39:57.513
a7944cdd-ff7a-4210-811a-538c55ebf0e4	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.5	7.0	13.0	0.06	0.02	0.00	144096021510	201285700607	141	481380	2026-03-08 18:40:03.198
790adc61-5d5a-4374-85f4-ce91aee38981	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5838641410	5180696050	120	297480	2026-03-08 18:40:08.933
e29f8537-f569-4515-becc-901f67e64e93	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4267947840	2528944064	143	233640	2026-03-08 18:44:46.154
feebb788-1452-4cb1-b073-d0395b9dc790	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4268032401	2529035206	143	233700	2026-03-08 18:45:07.155
68740da8-5aa1-4873-adc7-88c442e52839	f3a36a15-7bdb-481e-9472-1a40156dff94	1.5	5.0	9.0	0.06	0.03	0.00	7690172244	7273030900	131	210420	2026-03-08 18:45:12.636
756bf01a-f4b7-4634-9c13-fbe2969efd89	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.03	0.00	1090752387591	1864354087766	142	209880	2026-03-08 18:45:18.578
aebbdfc9-48a6-442b-80cd-71184797439f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4268136786	2529145954	141	233700	2026-03-08 18:45:32.85
5a28d7e0-8cb1-4b9f-86f6-40736f529627	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.03	0.00	7690196435	7273064674	132	210420	2026-03-08 18:45:38.332
baa73165-5d21-42ee-9ea0-e3b95b9129ef	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1090752407839	1864354115044	141	209940	2026-03-08 18:45:43.773
c98fd589-543b-4b59-ad7d-a8193bf69fea	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144096500886	201286458509	137	481740	2026-03-08 18:45:49.271
e6233e0a-e354-4d1d-8b8c-1802ca613166	b58f88d3-da10-4386-902f-201b857a31b9	4.5	10.0	11.0	0.09	0.04	0.01	5838815135	5180940085	118	297840	2026-03-08 18:45:55.015
41856a0e-d1be-47f0-971e-75e16e1818d1	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4268303862	2529322901	142	233760	2026-03-08 18:46:18.028
327588d8-58b9-401f-a1e9-aef4d679430c	f3a36a15-7bdb-481e-9472-1a40156dff94	3.5	5.0	9.0	0.14	0.07	0.01	7690237048	7273125153	132	210480	2026-03-08 18:46:23.728
e282233c-369a-41da-8890-1e4a9ce2d14b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4268382771	2529407365	143	233760	2026-03-08 18:46:36.545
b39a2be3-effe-4634-8671-0600488d0ad6	f3a36a15-7bdb-481e-9472-1a40156dff94	2.5	5.0	9.0	0.10	0.06	0.01	7690256404	7273152153	133	210480	2026-03-08 18:46:42.05
ac43777c-8d68-4e77-9da3-60e5e332feac	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1090752449474	1864354170146	143	210000	2026-03-08 18:46:47.515
cbd0f61b-925d-41a1-a6e0-d36a985361f5	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.3	7.0	13.0	0.09	0.04	0.01	144096595660	201286608343	138	481800	2026-03-08 18:46:53.237
b9aa7161-f1d8-4f24-87e7-b919452d0986	b58f88d3-da10-4386-902f-201b857a31b9	1.5	9.0	11.0	0.03	0.03	0.00	5838852314	5180992087	117	297900	2026-03-08 18:46:58.998
1e40d471-4434-4b7c-9a18-6b9abae8384b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.02	0.01	4268698379	2529738272	144	233880	2026-03-08 18:47:59.171
0198fd08-415c-4922-87b8-c01a0531a865	f3a36a15-7bdb-481e-9472-1a40156dff94	1.8	5.0	9.0	0.07	0.06	0.01	7690321741	7273243577	133	210540	2026-03-08 18:48:05.028
422c6fd3-138f-4a2c-ada0-a127a8755e4f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.04	0.00	1090752494910	1864354229458	143	210060	2026-03-08 18:48:10.934
58dd4409-a4d8-431b-a585-d55a31a9de54	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.03	0.00	144096717998	201286803973	138	481860	2026-03-08 18:48:16.664
b75f12c5-23ce-45ae-854e-dae0fed1f81b	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5838898223	5181056613	117	297960	2026-03-08 18:48:22.397
f5ad6915-c1d0-4487-b135-09e79d7b871c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4269769993	2530854521	143	234180	2026-03-08 18:52:56.685
7b10c812-24ea-48d6-b797-e6e015fe3160	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.02	0.00	7690543688	7273550148	132	210840	2026-03-08 18:53:02.37
4e5e1b0e-1a77-46e2-86d4-b101f42e830e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.02	0.00	1090752658959	1864354414943	140	210360	2026-03-08 18:53:08.3
4c43d730-724b-4772-a208-f410a4ba3a25	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144097124138	201287452275	138	482160	2026-03-08 18:53:13.998
cf91d624-2db4-44e2-9aff-f445856fc511	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.02	0.00	5839024207	5181232452	117	298260	2026-03-08 18:53:19.677
8900a6ab-f645-4b25-8888-650cfa32de8a	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4270869610	2531999065	141	234480	2026-03-08 18:57:56.702
0f30cdd9-9663-4728-a7b1-4dcdfb3e6da3	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7690765319	7273858945	128	211140	2026-03-08 18:58:02.368
f318ce92-af8a-4b32-88d1-881426f4f0e8	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1090752801144	1864354598888	143	210660	2026-03-08 18:58:08.371
1cb97b9d-57a9-4311-9601-0a3e1a86c30d	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	5.5	7.0	13.0	0.22	0.09	0.02	144097563647	201288115151	136	482460	2026-03-08 18:58:14.09
1314fb3e-3eab-4a42-8ed8-5a61de007d18	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.01	0.00	5839159607	5181423125	117	298560	2026-03-08 18:58:19.796
ded8a2ff-6f16-46c2-8739-16d7523f4c1f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4271964351	2533135883	142	234780	2026-03-08 19:02:56.736
6b3ad79f-3098-4b6d-9c98-994df9da93f0	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7690979149	7274156698	133	211440	2026-03-08 19:03:02.417
f8bd92ec-cde8-4a27-9b9a-9c31c1e50cae	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	7.0	12.0	0.02	0.02	0.00	1090872010314	1864523907396	142	210960	2026-03-08 19:03:08.353
a736e91c-5fc6-4599-b0e6-068b11ba65f2	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.02	0.00	144097963813	201288766018	137	482760	2026-03-08 19:03:14.027
4573f42f-7f07-474d-ba62-eb6a915655b1	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5839280263	5181590415	119	298860	2026-03-08 19:03:19.708
3abc63a4-f745-4149-bf22-046a7675ecf6	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4273052680	2534261162	142	235080	2026-03-08 19:07:56.874
ff40a0db-e7c8-4994-b82f-24be739c960a	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691194361	7274454522	134	211740	2026-03-08 19:08:02.784
7287f180-101d-4891-a118-a8a7c50a0767	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	7.0	12.0	0.06	0.07	0.01	1091019356417	1864742432529	145	211260	2026-03-08 19:08:08.724
0f03cebb-633b-4e1f-85df-0e74ba87c0e5	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.8	7.0	13.0	0.07	0.02	0.00	144098340568	201289391713	135	483060	2026-03-08 19:08:14.388
1128f59f-73ac-4965-bc18-65f40915f955	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5839396421	5181749634	117	299160	2026-03-08 19:08:20.043
32de001a-c8b1-4362-8475-a09721af7450	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.0	6.0	9.0	0.04	0.01	0.00	4274082215	2535322669	143	235320	2026-03-08 19:12:40.483
ca32d2e6-5a7e-4d85-8a6d-1b332594b833	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7691375274	7274709671	134	212040	2026-03-08 19:12:46.187
151da6bb-30c6-4084-aa49-655faa384561	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.3	6.0	12.0	0.05	0.05	0.00	1091099795737	1864860756138	145	211560	2026-03-08 19:12:52.13
7ccd3e3a-532a-4c55-a241-f2d5f44f8e73	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	3.3	6.0	9.0	0.13	0.04	0.01	4274187226	2535433267	143	235380	2026-03-08 19:13:07.321
bd5db73e-de33-435f-bd3d-b5af4ec2c4e3	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7691400260	7274744084	132	212100	2026-03-08 19:13:12.832
d295840c-47ef-4a63-867c-d9a03a008435	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.8	6.0	12.0	0.03	0.05	0.00	1091099814525	1864860780622	145	211560	2026-03-08 19:13:18.318
452d51d5-bc1c-4ff4-ad5b-f92957fc26be	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.5	7.0	13.0	0.10	0.04	0.01	144098754026	201290038963	138	483360	2026-03-08 19:13:23.821
f26cb08b-7612-4577-a9f5-2c1efcc14d96	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5839510754	5181909713	116	299520	2026-03-08 19:13:29.62
21de13e4-0b6d-4d9e-b78d-8af576b57a70	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4274749751	2536014648	142	235500	2026-03-08 19:15:40.645
824c1b94-b87f-4b86-b09c-321a6fa8dd94	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691506904	7274894464	133	212220	2026-03-08 19:15:46.327
4e79b675-c1a0-42b2-8e04-07e90c551e60	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1091099887911	1864860871052	143	211740	2026-03-08 19:15:52.218
6c606f2b-5e88-4992-9b8a-75a4c52ddb6c	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.02	0.00	144098949808	201290362805	135	483540	2026-03-08 19:15:57.93
dba29f7f-b5a6-4e3a-a2b7-12ae3cf7eafb	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5839571736	5181996001	116	299640	2026-03-08 19:16:03.76
f855e888-77f8-4776-b059-7c791e063a4a	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.02	0.00	4274948074	2536201077	145	235560	2026-03-08 19:16:26.751
650f32e7-0cd9-46fc-98a1-05139ff5de5c	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691545279	7274950710	133	212280	2026-03-08 19:16:32.209
a28f9be5-40fd-4462-b937-b6acba7bb9c8	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4275025329	2536283620	146	235560	2026-03-08 19:16:45.336
5cfc05f1-335e-40d0-9e3a-cfe8b3341775	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691563281	7274975758	133	212280	2026-03-08 19:16:51.042
75b675aa-899a-4900-a358-d717e523f860	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.03	0.00	1091099930568	1864860926510	143	211800	2026-03-08 19:16:56.98
1d34c195-2aaa-4dd9-b5c4-4308e280c5db	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144099042291	201290510701	137	483600	2026-03-08 19:17:02.691
e29d2373-0d23-4186-9442-326c05b46448	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5839605391	5182042553	118	299700	2026-03-08 19:17:08.44
d7f663f9-ba01-4656-9640-0ec11e03a8be	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4275263579	2536530955	145	235620	2026-03-08 19:17:49
bf222630-4514-4f7f-87eb-999f5b3113be	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691610856	7275043136	133	212340	2026-03-08 19:17:54.701
b5bff889-8498-4e5d-95e6-d9a4348630e0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.3	6.0	12.0	0.09	0.04	0.00	1091099965790	1864860971241	144	211860	2026-03-08 19:18:00.683
b35d4322-6fef-4823-97c1-ceea2dd7dbc5	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4275367754	2536640646	145	235680	2026-03-08 19:18:16.849
9b0cb6b6-75f1-4a4c-8ed9-8664bc02664a	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691645006	7275093673	134	212400	2026-03-08 19:18:22.358
c4e4f9bd-c0ed-4ba6-bc9d-3ee36f15a86d	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.04	0.00	1091099993838	1864861008048	144	211860	2026-03-08 19:18:27.935
38d70638-c539-41a3-942f-c425224ea499	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	3.0	7.0	13.0	0.12	0.05	0.01	144099169696	201290719160	138	483660	2026-03-08 19:18:33.515
4bac707d-f0e8-45f0-aae0-e81e2d19b84b	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5840008240	5182757321	119	299820	2026-03-08 19:18:39.041
4e7c2ee5-69c7-4095-86d5-4e9559d455c6	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4276044486	2537361229	147	235860	2026-03-08 19:21:13.893
e243660f-15db-4761-87db-98632c038941	f3a36a15-7bdb-481e-9472-1a40156dff94	1.3	5.0	9.0	0.05	0.01	0.00	7691774750	7275271559	132	212580	2026-03-08 19:21:19.395
8a6ab0b7-9c0a-4fab-a569-54f50264c332	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1091100085075	1864861119493	143	212040	2026-03-08 19:21:25.307
a47752f1-3a08-40b1-8f9e-b8c573bb4cc4	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.0	7.0	13.0	0.04	0.04	0.00	144099429456	201291126840	138	483840	2026-03-08 19:21:30.992
a5b90cef-07a9-4585-8aa4-7aeea31a092a	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5840735036	5184122988	119	300000	2026-03-08 19:21:36.721
bab8b949-f3e9-4e26-928e-f56ea197b55e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4276965961	2538307824	143	236100	2026-03-08 19:25:22.145
72bf7562-398a-423a-9b0f-c7220f82e3a7	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7691947322	7275497480	131	212820	2026-03-08 19:25:27.853
4abb64ac-b62d-4945-b044-55393a836c04	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091100204785	1864861260314	141	212340	2026-03-08 19:25:33.731
3c76ea7e-1436-4b0c-8587-c6112cb8782f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144099770570	201291638998	134	484140	2026-03-08 19:25:39.486
df69a71b-cde2-448b-8e88-4e69154710ec	b58f88d3-da10-4386-902f-201b857a31b9	3.0	10.0	11.0	0.06	0.04	0.01	5842182193	5186804739	117	300240	2026-03-08 19:25:45.227
d83389ca-4af5-406f-b10e-be5561a5f68d	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4277556597	2538918192	142	236280	2026-03-08 19:28:02.892
93dd367d-6af8-4208-930e-8b110b18d999	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7692072523	7275656228	131	212940	2026-03-08 19:28:08.615
fd537e83-f71e-4dff-bb7e-5218716af3a6	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091100284178	1864861354200	141	212460	2026-03-08 19:28:14.471
c660df07-5a57-49c9-ae1a-d7aee01e6208	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144099993916	201291976999	135	484260	2026-03-08 19:28:20.195
5ed5c5bc-6db0-478b-be0f-015d89a1e435	b58f88d3-da10-4386-902f-201b857a31b9	4.0	10.0	11.0	0.08	0.04	0.01	5842271577	5186879019	117	300360	2026-03-08 19:28:25.929
428b7974-edaf-4f4a-bcd3-d09fa6e621c3	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	5.0	6.0	9.0	0.20	0.06	0.02	4278052316	2539436458	143	236400	2026-03-08 19:30:16.139
36b54e64-0dc2-49db-a998-fb8d25b2624f	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7692163958	7275778950	132	213120	2026-03-08 19:30:21.837
604e2811-4624-4cd7-9777-7ada9a475ade	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091100353078	1864861435451	144	212580	2026-03-08 19:30:27.764
b0d62395-18f7-4e95-a03c-67fe7a7220ec	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144100182381	201292260407	138	484380	2026-03-08 19:30:33.614
077be0c1-1d16-4f53-bb8d-8bfe91a0cf45	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5842327814	5186940887	118	300540	2026-03-08 19:30:39.35
f0c005a5-ae99-4476-86f5-f3d6dbfc15cb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.03	0.01	4278551029	2539952302	142	236520	2026-03-08 19:32:31.616
b2faa986-7950-4a38-a825-e62e51569b64	f3a36a15-7bdb-481e-9472-1a40156dff94	2.3	5.0	9.0	0.09	0.02	0.01	7692261487	7275910512	132	213240	2026-03-08 19:32:37.284
de4a1b40-e831-4fde-9fdf-838448e8ff46	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091100418395	1864861511020	142	212760	2026-03-08 19:32:43.191
3d64661d-dd2b-460b-a24c-a14eba9fbddc	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.01	0.00	144100372918	201292546614	139	484560	2026-03-08 19:32:48.937
05698fbd-8439-40d4-953d-4f793fb6e170	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5842387187	5187011809	119	300660	2026-03-08 19:32:54.629
b6b36b41-087f-40e2-b3f0-9bc8ce380a60	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4279644683	2541086074	143	236820	2026-03-08 19:37:30.272
8b37a983-14f9-41ee-85d6-d6409c72649a	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.01	0.00	7692473761	7276185808	132	213540	2026-03-08 19:37:35.967
12dc8b86-baad-4875-a3da-2ab50c6e15e1	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091100578204	1864861668441	139	213060	2026-03-08 19:37:41.915
9c27e2d8-e840-4810-a36a-523dd311cbb5	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.5	7.0	13.0	0.10	0.03	0.01	144100776861	201293160413	138	484860	2026-03-08 19:37:47.595
76a4e0ba-e7f1-4aca-a010-79e31fd5301f	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5842505249	5187140826	118	300960	2026-03-08 19:37:53.329
722cbb2d-cf0a-45c8-aff8-e32de8c01d12	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4279785041	2541233521	142	236880	2026-03-08 19:38:07.419
9634aa73-9c08-41c9-9984-3d604680dc51	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7692511237	7276234845	133	213600	2026-03-08 19:38:12.881
041e5110-6677-46c0-a641-dc1680af091e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091100601991	1864861697613	141	213060	2026-03-08 19:38:18.383
f761b505-9934-4ea2-acae-0d9ed6b2c8ca	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.02	0.00	144100833036	201293245109	139	484860	2026-03-08 19:38:23.88
7bc74e15-f816-40a7-894a-565727ab9f0b	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5842525667	5187165960	117	301020	2026-03-08 19:38:29.356
587f3e30-a462-4b19-be49-161c10dfb562	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4280864392	2542346183	142	237180	2026-03-08 19:43:05.478
d158de5e-3bcb-4956-b23d-f8827bcf53de	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7692720793	7276513078	135	213900	2026-03-08 19:43:11.155
e609b41b-2a34-4ac9-bc0c-6f4b37eab64e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.02	0.00	1091100741180	1864861852905	142	213360	2026-03-08 19:43:17.084
62f72819-c577-4a3f-b136-c4aef5545d7e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.03	0.01	144101238906	201293862978	138	485160	2026-03-08 19:43:22.908
c748a7a1-1b70-4fb2-a0b0-96e4537c1de9	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5842642344	5187298072	116	301320	2026-03-08 19:43:28.596
914a2e91-d264-489c-a363-22a1c0e29100	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4281192629	2542687301	141	237240	2026-03-08 19:44:34.295
7222fde1-fff7-4d9d-9cd5-7b7807977323	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7692786400	7276605794	134	213960	2026-03-08 19:44:39.965
b218312c-3d7d-4791-afa0-d8b216498b23	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1091100787869	1864861907022	143	213480	2026-03-08 19:44:45.913
60360f49-5c48-4bb0-8871-dc260b3dad56	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.02	0.00	144101364218	201294054950	138	485280	2026-03-08 19:44:51.661
f83b2100-7e65-4a0e-aa15-dda54be15f90	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5842681890	5187345365	116	301380	2026-03-08 19:44:57.338
b47fe9d9-db28-4d92-aab3-e5024544465b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.8	6.0	9.0	0.03	0.03	0.00	4282276274	2543831100	141	237540	2026-03-08 19:49:31.883
e4113c16-041d-46b8-9177-ab331558c243	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7693006486	7276876385	132	214260	2026-03-08 19:49:37.692
72ddd6c6-a0f7-4d64-8f7b-7b2cf7856583	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.0	6.0	12.0	0.12	0.03	0.01	1091100926622	1864862061812	141	213780	2026-03-08 19:49:43.542
8b3254db-6b55-4013-a555-2e3743c1c3e2	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.0	7.0	13.0	0.04	0.01	0.00	144101773372	201294666445	135	485580	2026-03-08 19:49:49.258
93d8608c-091d-4657-aa2e-06b00c860dff	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5842800853	5187481796	116	301680	2026-03-08 19:49:54.989
09803be7-ad54-4b35-8306-1acd8f840e75	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.8	6.0	9.0	0.03	0.03	0.00	4283341092	2544912896	142	237840	2026-03-08 19:54:31.895
a9745643-e24a-4a06-bb96-f8ebcaaddd67	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7693198052	7277129900	131	214560	2026-03-08 19:54:37.669
ee6b6be9-e466-4ac7-af1d-4a84ff520adb	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091101067974	1864862218832	142	214080	2026-03-08 19:54:43.567
fda6c55a-3afa-4b3d-986c-b048f195e0ef	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144102184152	201295267962	138	485880	2026-03-08 19:54:49.307
082184b5-6f10-4634-a05f-25dc38457608	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5842920825	5187618084	116	301980	2026-03-08 19:54:55.012
14ad09ca-0ffd-42ab-94e8-a3c468a7c894	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.3	6.0	9.0	0.05	0.04	0.01	4284406195	2545994850	142	238140	2026-03-08 19:59:31.82
dfd7c391-410e-49e8-85fe-148d83110452	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7693399087	7277394820	131	214860	2026-03-08 19:59:37.563
393d3f62-3d33-49f8-9892-0b886fce08ae	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.8	6.0	12.0	0.11	0.04	0.01	1091101210054	1864862377968	143	214380	2026-03-08 19:59:43.439
c09a4479-de88-4a0b-aa31-fd341e7da100	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.5	7.0	13.0	0.06	0.02	0.00	144102594387	201295868416	137	486180	2026-03-08 19:59:49.21
f729d862-0bc1-432b-994b-0699286bff26	b58f88d3-da10-4386-902f-201b857a31b9	1.0	10.0	11.0	0.02	0.01	0.00	5843035324	5187754844	117	302280	2026-03-08 19:59:54.891
fbb4c218-8523-4d68-b915-09f22ceb8560	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.02	0.00	4285471394	2547077449	141	238440	2026-03-08 20:04:31.675
ed94db38-801d-4fd7-86c6-51fb41a4c7a7	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7693612792	7277677214	133	215160	2026-03-08 20:04:37.359
b409351e-571c-45d3-91c7-cbbcc7be4c43	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.04	0.01	1091101352295	1864862537699	141	214680	2026-03-08 20:04:43.258
b212e965-4fee-4ae9-ae0b-26a034e38108	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144103009790	201296475084	138	486480	2026-03-08 20:04:48.993
48dc2d31-faf5-4e8b-b9bd-ce79e1268b84	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5843147267	5187893200	118	302580	2026-03-08 20:04:54.728
32a25fd8-1191-4d46-a930-e711519459f5	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.02	0.00	4286538805	2548162913	140	238740	2026-03-08 20:09:31.721
9eef3c22-e8be-4fe7-ab92-cf73e1973740	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7693877783	7277993958	135	215460	2026-03-08 20:09:37.469
23e34fdf-570d-4f71-a48c-badbbf84b261	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091101495803	1864862699051	140	214980	2026-03-08 20:09:43.389
2ffd0ceb-0795-4b4d-9ef0-c60dc170a30b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144103425354	201297080614	137	486780	2026-03-08 20:09:49.1
9347ea3f-6782-4f00-b097-196f3ad7161c	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5843259812	5188031311	116	302880	2026-03-08 20:09:54.849
4f2cd4a7-685b-47c7-9381-f85b42ae63ab	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	4.8	6.0	9.0	0.19	0.12	0.04	4287572285	2549240276	144	239040	2026-03-08 20:14:11.365
8ae00c5b-9ebf-44c1-b619-804dabf0548b	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7694129608	7278313832	133	215760	2026-03-08 20:14:17.057
4f5c8ad6-43a7-4b83-9013-230205852878	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.0	6.0	12.0	0.04	0.01	0.00	1091101630311	1864862848639	142	215220	2026-03-08 20:14:23.027
d5036829-ecbc-4251-b70b-1e4f0da7f94d	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144103820043	201297648591	139	487020	2026-03-08 20:14:28.735
cc16957b-ae91-4c00-8d60-28893b6f01d9	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5843372100	5188169746	119	303180	2026-03-08 20:14:34.429
63c60a2c-8bb3-4d06-959b-f71d7994105f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.03	0.01	4288624785	2550309833	140	239340	2026-03-08 20:19:07.575
1c48b1f2-8078-42fd-9a2b-d1e18e20c35d	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7694370550	7278623084	131	216060	2026-03-08 20:19:13.407
8822d5e8-8272-4727-8dba-6e090921a45f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1091101796477	1864863009570	142	215520	2026-03-08 20:19:19.36
24fc0870-88c3-43de-870c-8031bbc52a69	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144104237152	201298248274	134	487320	2026-03-08 20:19:25.094
a78362de-728b-4640-a17b-79a729c77d6f	b58f88d3-da10-4386-902f-201b857a31b9	3.5	10.0	11.0	0.07	0.02	0.00	5843496056	5188326666	120	303480	2026-03-08 20:19:30.81
b5eb79f4-9412-416b-a768-134c7276e1a4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4289696017	2551399496	142	239640	2026-03-08 20:24:07.604
40a549f4-b786-4299-bba7-6cf5b8dd7a66	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7694585521	7278911725	132	216360	2026-03-08 20:24:13.277
0f5c9a57-9331-407a-8299-96b823a76c8b	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1091101939051	1864863172309	142	215820	2026-03-08 20:24:19.171
6ff9e79f-707f-4917-b241-0780e1a2d503	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144104653182	201298852509	137	487620	2026-03-08 20:24:24.859
317a4822-ff50-4fe4-b41c-4d7761045e94	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5843653938	5188497426	118	303780	2026-03-08 20:24:30.591
696645b6-91c8-4380-ad8f-784e2f3b2e63	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4290761273	2552480552	142	239940	2026-03-08 20:29:07.556
6a0e8e91-35b2-4504-8dc3-50737b631cbd	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7694794630	7279198117	131	216660	2026-03-08 20:29:13.26
37894ebc-82f2-4262-9569-6f759cac5407	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091102077441	1864863335043	141	216120	2026-03-08 20:29:19.179
2cb1858d-74ef-4cf7-939a-7bd7ca6e4d37	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144105063829	201299459440	134	487920	2026-03-08 20:29:24.922
be4f7aef-b49f-47d7-aa02-e94bebd12e25	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5843792126	5188727615	116	304080	2026-03-08 20:29:30.664
b2d4df94-93d0-44b6-83f3-a93e79da2855	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4291854231	2553568417	142	240240	2026-03-08 20:34:07.533
693dec8b-2174-48fc-846f-c4667e43c021	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7694994680	7279466291	133	216960	2026-03-08 20:34:13.265
a11886ac-9aca-4df0-b7bf-7ce6369ffccf	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.0	6.0	12.0	0.16	0.05	0.01	1091102208428	1864863501042	143	216420	2026-03-08 20:34:19.223
9cf9a8e1-38ac-4edb-8f5e-fe3132c17f75	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144105472080	201300064631	139	488220	2026-03-08 20:34:24.943
2883eb2f-39a2-41c2-9f6e-132e9fc6c647	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5843918999	5188891544	119	304380	2026-03-08 20:34:30.664
ad6bc8c7-4f28-4e8c-a0d7-96b35a4585af	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4292923265	2554651591	140	240540	2026-03-08 20:39:07.696
18d3d3d2-fa5b-4ec9-82c8-b7bee00b70d3	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7695190085	7279728872	132	217260	2026-03-08 20:39:13.375
d2c1a609-e0e7-4493-bf1c-317feb0d40c6	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1091102340640	1864863668762	143	216720	2026-03-08 20:39:19.519
dd33e775-099e-4ac8-b91f-ba0d35199c24	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144105880847	201300672657	136	488520	2026-03-08 20:39:25.209
84194edd-0f78-47eb-b1f9-45ecba437bb8	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5844051322	5189065818	115	304680	2026-03-08 20:39:30.887
508226a0-5518-4c99-aaf3-f708da2236dc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.8	6.0	9.0	0.07	0.02	0.00	4294002452	2555744118	144	240840	2026-03-08 20:44:07.54
212e381d-e4ba-4030-9c02-8d223606032e	f3a36a15-7bdb-481e-9472-1a40156dff94	2.8	5.0	9.0	0.11	0.03	0.01	7695397308	7280008010	133	217560	2026-03-08 20:44:13.233
5e198546-fbc4-42f0-b0e3-6e52133a8c59	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091102474257	1864863837506	143	217020	2026-03-08 20:44:19.246
6eef6af8-9e40-4d0b-97da-1932a9e52faf	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.01	0.00	144106286965	201301279139	137	488820	2026-03-08 20:44:24.91
1d87e30e-e48c-4b7f-b664-93ac95ad77ec	b58f88d3-da10-4386-902f-201b857a31b9	2.0	9.0	11.0	0.04	0.01	0.00	5844185769	5189243145	115	304980	2026-03-08 20:44:30.618
9fa4de13-44e2-4e21-ab04-bed7ea4d73f4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4295073101	2556828535	140	241140	2026-03-08 20:49:07.499
998307d9-4124-422b-830e-14bcff8b15b7	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7695603423	7280296252	131	217860	2026-03-08 20:49:13.183
d59492aa-61b5-4cf3-968d-f03d7fdfbf63	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091102596011	1864864005524	140	217320	2026-03-08 20:49:19.116
d0370db1-72e7-4a18-b829-e8376f029319	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144106682165	201301881818	135	489120	2026-03-08 20:49:24.776
ea6277bd-4a12-4c37-a1f3-f9afc86e21dc	b58f88d3-da10-4386-902f-201b857a31b9	2.0	10.0	11.0	0.04	0.01	0.00	5844316745	5189416943	117	305280	2026-03-08 20:49:30.504
c4ad9673-201e-4a72-b220-603cd88f2f28	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.02	0.00	4296154880	2557923192	141	241440	2026-03-08 20:54:07.636
35fd0543-1cd3-4ee8-b73a-ef7f3440d376	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7695809798	7280580177	132	218160	2026-03-08 20:54:13.313
c9c46016-8b2c-4750-9602-db947e2f63e5	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091102717945	1864864173954	142	217620	2026-03-08 20:54:19.22
7707214a-4101-4a00-b0b0-39a0f25752cf	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144107080670	201302486817	139	489420	2026-03-08 20:54:24.906
72dd8916-32f4-4719-9a74-3f46d67dd63b	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5844452233	5189597669	118	305580	2026-03-08 20:54:30.647
44f60fd5-0b0e-4352-8398-304da1fd66d9	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.03	0.00	4297228124	2559009447	142	241740	2026-03-08 20:59:07.486
1b6f8495-8836-417b-bd45-c9d9409f0f70	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7695996893	7280857072	131	218460	2026-03-08 20:59:13.182
0d62fe89-30d6-40b0-ae06-5375db39cfa7	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.8	6.0	12.0	0.11	0.03	0.01	1091102843065	1864864342604	142	217920	2026-03-08 20:59:19.054
4fafd510-1e52-435c-933c-c04cc3ac0858	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144107500297	201303092485	136	489720	2026-03-08 20:59:24.722
47be8f6b-bdda-463e-a88a-45a39c75c0a3	b58f88d3-da10-4386-902f-201b857a31b9	3.0	10.0	11.0	0.06	0.02	0.00	5844587468	5189777927	117	305880	2026-03-08 20:59:30.422
d2ef9f83-09fb-4b8e-9b4d-9da3f97ce60f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4298310584	2560106835	140	242040	2026-03-08 21:04:07.589
a79fd1dc-94a5-4197-8753-c4e0b0597f93	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7696183033	7281131111	133	218760	2026-03-08 21:04:13.253
299b4e13-ef2b-4091-a796-ea3594d72d6c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1091102969235	1864864513872	143	218220	2026-03-08 21:04:19.112
12de77ce-3734-4700-b62e-d1e7dfefbccb	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.02	0.00	144107893771	201303695475	135	490020	2026-03-08 21:04:24.831
1c510094-2b20-4c2b-beda-0767b4a4f18e	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5844725172	5189964744	116	306180	2026-03-08 21:04:30.55
af8897d3-0d61-45d7-ae0c-47c4f3d166d2	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.03	0.01	4299387760	2561199056	140	242340	2026-03-08 21:09:07.563
f271c1a5-02de-4576-82af-e03642136b30	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7696375068	7281414891	132	219060	2026-03-08 21:09:13.227
35ae229b-f8b8-4c04-93d8-6d7556036f33	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.3	6.0	12.0	0.13	0.05	0.01	1091103095617	1864864684289	142	218520	2026-03-08 21:09:19.153
92370c52-2fa5-4a00-9e16-9aa93472ad0f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144108285996	201304302843	134	490320	2026-03-08 21:09:24.869
2aec3f0f-e1ba-4fbc-b645-7164f7cbe2f4	b58f88d3-da10-4386-902f-201b857a31b9	1.5	10.0	11.0	0.03	0.02	0.00	5844863780	5190154166	117	306480	2026-03-08 21:09:30.635
ffe076ca-c62a-4b4a-a164-bbab59eb0a1d	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4299932182	2561764520	143	242460	2026-03-08 21:11:29.934
d6d44dff-bd4d-4133-ba88-6f62b10608d6	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.03	0.01	7696474639	7281560721	133	219180	2026-03-08 21:11:35.656
c5a3d0ed-8550-45bc-adb8-7c5bf5646561	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.04	0.00	1091103161890	1864864771882	143	218700	2026-03-08 21:11:41.584
31974f1d-1441-4329-88be-afacc8c7f2d5	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144108501181	201304601117	138	490500	2026-03-08 21:11:47.277
22400731-7be5-482d-bd9c-3004cae1e12e	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5844934412	5190251727	121	306600	2026-03-08 21:11:53.099
64bd945b-f1a8-47c3-9edf-a66994598038	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4300493431	2562345347	145	242640	2026-03-08 21:14:01.205
e4ee1743-bd93-40aa-ba1e-61a712de5c8b	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.03	0.00	7696579010	7281708936	133	219300	2026-03-08 21:14:06.923
f3a6e059-0699-4fea-99e7-72d0d38af333	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1091103230342	1864864862878	144	218820	2026-03-08 21:14:12.833
2e2c6140-8e92-46ca-a8f9-c28ff24e6349	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144108701877	201304909890	138	490620	2026-03-08 21:14:18.52
7aa1561f-5509-4c5b-803f-54fcbec89ef2	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.02	0.00	5845021124	5190368713	119	306720	2026-03-08 21:14:24.262
dc547344-47a2-4a44-8928-1dc2318983fc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.01	0.00	4301555262	2563422731	141	242940	2026-03-08 21:18:58.093
6af6b194-5631-450e-b348-19286036c059	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7696767718	7281986624	130	219600	2026-03-08 21:19:03.83
086a2ec1-d62e-4063-87c8-43d0286075b2	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1091103359780	1864865033613	144	219120	2026-03-08 21:19:09.759
227aab1c-a308-4f45-9ce7-ce1c6cb31d95	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.02	0.00	144109092117	201305507924	135	490920	2026-03-08 21:19:15.468
9377cf46-b3b1-4a2f-aaed-fbc51ac7c9b0	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.01	0.00	5845150930	5190530567	116	307020	2026-03-08 21:19:21.224
94cc2948-1074-4dcc-bff1-1bf79ab65338	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4302652466	2564517356	143	243240	2026-03-08 21:23:58.097
5c1a67c2-809c-40e9-972d-568dadad2501	f3a36a15-7bdb-481e-9472-1a40156dff94	3.5	5.0	9.0	0.14	0.03	0.01	7696948924	7282258870	134	219900	2026-03-08 21:24:03.881
4367c288-80a8-4064-b2b5-a263c37f1730	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1091103492560	1864865207455	145	219420	2026-03-08 21:24:09.764
8645a567-bf3c-45b4-9023-da1cb22cc68f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144109483011	201306110768	137	491220	2026-03-08 21:24:15.462
9225e60a-c112-4655-b513-be7c1be2ea02	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5845277275	5190687335	119	307320	2026-03-08 21:24:21.213
de90bd05-1492-49e3-b179-f3ff368b9fd9	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4303727902	2565610113	141	243540	2026-03-08 21:28:58.093
cc8ae26f-ef2c-4fb6-bb7f-38a74853bc00	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7697139490	7282534780	131	220200	2026-03-08 21:29:03.826
43cd1338-b934-4914-83a0-3af2a4388824	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.0	6.0	12.0	0.16	0.03	0.01	1091103623625	1864865375468	141	219720	2026-03-08 21:29:09.754
d61a2c2c-414e-49b7-9bc2-339324cfb9bd	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144109877670	201306717557	136	491520	2026-03-08 21:29:15.46
ce91fc49-2724-4e3c-8ca7-36332bceb624	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5845403486	5190844344	116	307620	2026-03-08 21:29:21.132
6ae73a2d-d24c-4b7c-8ccd-1987c3acbabb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4304806363	2566706101	142	243840	2026-03-08 21:33:58.087
499908bd-a807-4247-ae24-84eaaf49a4e2	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7697332624	7282819064	132	220500	2026-03-08 21:34:03.967
9c75068b-c3fb-475e-a3eb-dcfd82d803b4	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.5	7.0	12.0	0.18	0.05	0.01	1091220201893	1865042274741	143	220020	2026-03-08 21:34:09.93
d0c67143-b0c1-4ffd-9b6d-97946662b5c1	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144110272948	201307320910	136	491820	2026-03-08 21:34:15.642
e1a5fd1d-583c-4a5a-8d3f-0de33a6e7497	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5845558808	5191010782	117	307920	2026-03-08 21:34:21.407
fbb88ebc-5d08-4598-bd11-de1f14070c8d	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4305898153	2567829380	145	244140	2026-03-08 21:38:58.108
06471dee-67ab-432b-a5a3-a8fa56262cac	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7697518588	7283088041	131	220800	2026-03-08 21:39:03.874
4dbcbab5-eb8c-415f-9f9a-11a6d76f9db0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.3	6.0	12.0	0.09	0.06	0.01	1091364390715	1865254719859	140	220320	2026-03-08 21:39:09.833
d28f8c10-b8da-4626-86e4-121bae240f48	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144110670097	201307925763	138	492120	2026-03-08 21:39:15.543
da0635e2-ee46-423f-9458-8da24611e011	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5845691085	5191175403	118	308220	2026-03-08 21:39:21.264
fdad9965-ed4b-403a-ad5d-a190416a63a4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4306971325	2568925111	141	244440	2026-03-08 21:43:58.062
76b4c56e-52c4-4ae9-9ab5-e700926a4e1a	f3a36a15-7bdb-481e-9472-1a40156dff94	4.0	5.0	9.0	0.16	0.03	0.01	7697733679	7283370711	136	221100	2026-03-08 21:44:03.847
f5b00bec-4595-4bb4-98c4-5b222e157c17	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.8	6.0	12.0	0.07	0.10	0.03	1091525624369	1865490908052	142	220620	2026-03-08 21:44:09.79
7de10c5f-38ab-4bb4-bebc-cb4f50661415	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144111066923	201308530389	139	492420	2026-03-08 21:44:15.522
d1a3acd6-b457-47c1-9c9d-7cc8151a1328	b58f88d3-da10-4386-902f-201b857a31b9	2.0	10.0	11.0	0.04	0.01	0.00	5845834174	5191352952	116	308520	2026-03-08 21:44:21.215
bd67c4f7-67b8-4efa-9e5e-32a0b2af7c5e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4308039222	2570019054	140	244740	2026-03-08 21:48:58.063
53b55fd3-08bd-4d04-aea6-6156d1acf6b0	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7697928059	7283644605	129	221400	2026-03-08 21:49:03.815
7833a368-649d-45f5-9117-80cc433fb95c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	5.5	7.0	12.0	0.22	0.11	0.04	1091606330523	1865609216536	140	220920	2026-03-08 21:49:09.714
088ecc00-0fd8-4470-b3d6-a8ce55ae3d57	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144111453189	201309136226	136	492720	2026-03-08 21:49:15.393
7dca6c23-3ffd-48ec-afe2-a32f9228c296	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.01	0.00	5845975954	5191534558	115	308820	2026-03-08 21:49:21.078
584ea930-8f0c-4753-a44a-ec6af109609c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4309115207	2571120554	142	245040	2026-03-08 21:53:58.067
71bc0135-106e-46d8-bb6a-80cc18032632	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7698122173	7283922234	131	221700	2026-03-08 21:54:03.819
5b6cec73-35b7-4885-96b7-58cf7c5fea17	3cfb027c-6805-444c-b21f-03cebcb6f5ab	6.3	6.0	12.0	0.25	0.15	0.06	1091766881602	1865845579303	140	221220	2026-03-08 21:54:09.789
40c133e9-b2bc-48be-a45a-3273e2b9b944	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144111836663	201309741381	138	493020	2026-03-08 21:54:15.502
457460a0-8d0c-476d-8442-46a02d0598d7	b58f88d3-da10-4386-902f-201b857a31b9	2.5	10.0	11.0	0.05	0.01	0.00	5846104849	5191699793	117	309120	2026-03-08 21:54:21.167
11f58d84-bf6d-4508-b996-41bd07960b79	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4310178021	2572209210	142	245340	2026-03-08 21:58:58.057
c77222ff-fb14-48f6-a1f7-8e8d78756953	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7698316048	7284196214	132	222000	2026-03-08 21:59:03.797
7e36982b-40aa-4bd9-af52-07774c2e8d11	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.5	6.0	12.0	0.14	0.12	0.07	1091883819993	1866010462591	142	221520	2026-03-08 21:59:09.764
50adb2a6-5e45-485a-9f9d-50e4a9e3e6e8	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.5	7.0	13.0	0.06	0.03	0.00	144112220053	201310346498	137	493320	2026-03-08 21:59:15.434
34cb06fc-de04-4c77-8a8d-27d0b718ebdb	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5846229267	5191864920	117	309420	2026-03-08 21:59:21.096
9f0c19fe-d380-4d50-8786-dd3ce6a0caf9	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4311275034	2573342933	147	245640	2026-03-08 22:03:57.835
cd9e0fe2-6c0a-4418-9169-db308a329da8	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7698517101	7284475032	129	222300	2026-03-08 22:04:03.557
a5439534-6e84-4312-bc03-62325ff4918d	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	7.0	12.0	0.01	0.08	0.07	1092050527245	1866257628423	143	221820	2026-03-08 22:04:09.503
92b6bbaa-e856-4a39-9bca-827c79a41731	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144122100812	201326790324	138	493620	2026-03-08 22:04:15.202
bd7c66f7-4b33-4bef-b6be-d8b116f70d50	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5846352146	5192031313	119	309720	2026-03-08 22:04:20.901
33ed36d3-0a2b-43ef-9897-08797e8244ee	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4311592524	2573670151	143	245700	2026-03-08 22:05:24.196
158257bc-2121-4d8c-bcfe-3fd45c862d82	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7698585537	7284570652	131	222420	2026-03-08 22:05:29.911
bf76e317-2339-4c59-97f1-51e273bb34be	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	7.0	12.0	0.00	0.05	0.06	1092082689066	1866304888330	140	221940	2026-03-08 22:05:35.782
c68130a2-624e-4f23-9aa9-c7ee0fe44397	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144122213819	201326970263	137	493740	2026-03-08 22:05:41.529
719bd7f4-7655-4cb6-a1b9-51bbf759237d	b58f88d3-da10-4386-902f-201b857a31b9	1.0	10.0	11.0	0.02	0.01	0.00	5846391669	5192085998	115	309840	2026-03-08 22:05:47.196
0d01a5ee-a05f-411a-b153-707fd6d4a905	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.03	0.01	4312092644	2574194601	144	245820	2026-03-08 22:07:35.941
d2ee170c-5286-48e7-8b9f-f285c8f3f317	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7698682420	7284705027	132	222540	2026-03-08 22:07:41.696
bec1f210-1f3c-4110-a1f9-fb3a6315467f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.05	0.05	1092082755986	1866304972276	143	222060	2026-03-08 22:07:47.627
81e5c9fa-9622-4bd5-afac-5d065ac91ae7	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.04	0.01	144122383932	201327238567	137	493860	2026-03-08 22:07:53.325
c1fa90f0-e8bc-4b60-9d08-3add2e1e0afd	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5846451540	5192166810	115	309960	2026-03-08 22:07:58.985
97911a35-3d92-4d7a-8c85-8a98db17e9dd	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	3.0	6.0	9.0	0.12	0.03	0.01	4313154809	2575287080	141	246120	2026-03-08 22:12:34.369
73813d62-7c8d-40d3-b77e-5499484ca98e	f3a36a15-7bdb-481e-9472-1a40156dff94	1.5	5.0	9.0	0.06	0.01	0.00	7698881176	7284974656	132	222840	2026-03-08 22:12:40.073
765cfa4a-5935-49aa-a23a-b2b2f3b6140f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.8	7.0	12.0	0.03	0.08	0.07	1092227361603	1866517538304	144	222360	2026-03-08 22:12:46.095
365a3917-5ee4-4876-9254-58b9b91b5846	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144122761334	201327835300	135	494160	2026-03-08 22:12:51.793
c719787c-43f0-4899-be95-673cf0c695fa	b58f88d3-da10-4386-902f-201b857a31b9	4.0	10.0	11.0	0.08	0.02	0.01	5846572964	5192331044	116	310260	2026-03-08 22:12:57.564
83f40e74-f4a3-452b-a347-ae14ce2fbabb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.02	0.01	4314230997	2576392869	140	246420	2026-03-08 22:17:34.381
0a577bc4-727a-4f22-a6ee-3beca548b1f8	f3a36a15-7bdb-481e-9472-1a40156dff94	1.3	5.0	9.0	0.05	0.01	0.00	7699083681	7285254100	131	223140	2026-03-08 22:17:40.038
3e0e9a6c-9d53-4095-9037-eda465f32b65	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.04	0.06	1092371622312	1866729788706	144	222660	2026-03-08 22:17:45.92
fc1d5939-da8d-4c07-94e3-0b813bb1ba99	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144123162779	201328433669	137	494460	2026-03-08 22:17:51.628
17dd0951-0ed8-4b2b-88b2-74849bd4c1ca	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.01	0.00	5846694994	5192496688	117	310560	2026-03-08 22:17:57.335
ef58483e-cf2a-4596-bd5d-ed1426b85cf0	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4315327896	2577555864	144	246720	2026-03-08 22:22:34.435
cac3b41f-daba-4a0e-8f2f-d59833898a48	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7699283838	7285533399	131	223440	2026-03-08 22:22:40.21
1f30de7c-b67a-4521-8c95-e44855e65711	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.04	0.05	1092419776522	1866800678356	142	222960	2026-03-08 22:22:46.095
0e394986-dc0d-4992-9dae-259060806c80	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144123558339	201329044954	138	494760	2026-03-08 22:22:51.843
d9e313a5-21bd-41ea-bde5-7fad0b3deb16	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5846841289	5192675794	117	310860	2026-03-08 22:22:57.555
36d65dda-3db2-4e07-9a42-b3f44b0bbccd	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4316446487	2578676782	141	247020	2026-03-08 22:27:34.434
79e4a576-bba8-4dd5-86db-a88a3f248846	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7699470842	7285797090	130	223740	2026-03-08 22:27:40.105
2ae22740-d430-4b7b-8b3b-60c6980e8691	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.04	0.05	1092419912548	1866800853466	142	223260	2026-03-08 22:27:45.936
525931e0-0295-4abf-a811-903bed28ecf8	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144123955634	201329653019	135	495060	2026-03-08 22:27:51.649
72cf665f-919b-437d-b2ba-52ae7a2c6a10	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5846991333	5192851676	114	311160	2026-03-08 22:27:57.376
40bf9dcc-af05-4c6d-834c-037466b32bf3	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.01	0.00	4317526899	2579780947	140	247320	2026-03-08 22:32:34.394
ea4e1de5-2ac4-4997-abec-af850e1dafcd	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7699669554	7286073488	134	224040	2026-03-08 22:32:40.131
5679778b-8680-494d-9d22-04df0941e862	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.06	0.06	1092493204133	1866904437784	141	223560	2026-03-08 22:32:46.01
58535efd-6add-4564-9e8d-34f297b29a69	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144124353605	201330260860	138	495360	2026-03-08 22:32:51.69
329fd9e2-80f3-4fb9-9f92-ec2daa3f303c	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5847139563	5193021917	117	311460	2026-03-08 22:32:57.371
b7fd46d7-2281-4182-8716-c3b1583216eb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.02	0.01	4327679810	2590138556	140	250140	2026-03-08 23:19:42.808
fd338204-a888-41d6-9fbb-20324860fc70	f3a36a15-7bdb-481e-9472-1a40156dff94	2.3	5.0	9.0	0.09	0.04	0.01	7701538443	7288635926	131	226860	2026-03-08 23:19:48.478
2ba75d35-9261-4d1b-ae7a-495314379dfc	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092591784994	1867040952143	142	226380	2026-03-08 23:19:54.511
cbfc5313-055d-42d0-83dd-96135ab3c5fa	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.8	7.0	13.0	0.11	0.05	0.01	144128016009	201335822223	135	498180	2026-03-08 23:20:00.271
0add69cf-345f-4989-990c-72e538c2ba34	b58f88d3-da10-4386-902f-201b857a31b9	1.0	10.0	11.0	0.02	0.02	0.00	5852373920	5202552156	118	314280	2026-03-08 23:20:06.272
0d7c8ffa-531f-4458-8052-d2e016c6a559	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.5	6.0	9.0	0.06	0.02	0.00	4328764903	2591242994	143	250440	2026-03-08 23:24:42.036
bc6368c8-d11d-4030-9d78-bd917b9219f2	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.03	0.00	7701749535	7288923826	133	227160	2026-03-08 23:24:47.824
d9288bbb-7e95-4b77-b5f5-128c929ed665	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1092591910413	1867041103847	142	226680	2026-03-08 23:24:53.706
17c163ab-91d0-43bc-93a4-e412537dc6be	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.5	7.0	13.0	0.10	0.06	0.01	144128401073	201336409840	138	498480	2026-03-08 23:24:59.511
943cb715-e072-496a-94f7-cb3920829678	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5852494498	5202696804	114	314580	2026-03-08 23:25:05.55
c47027cb-7bb9-4b2b-90bc-b8012f8e5e55	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.0	6.0	9.0	0.08	0.03	0.01	4329835206	2592352159	142	250740	2026-03-08 23:29:42.089
dee21b7d-249c-44bd-b2ce-a734413236cb	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7701943712	7289204365	133	227460	2026-03-08 23:29:47.789
00b4bc78-8d15-4778-8897-93a209dc8fcf	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.0	6.0	12.0	0.12	0.06	0.01	1092592037857	1867041258687	142	226980	2026-03-08 23:29:53.658
685f4a37-8e50-4ec6-9582-9d689ceca593	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.03	0.00	144128785510	201336997303	136	498780	2026-03-08 23:29:59.327
442be16d-d0f2-4e58-b49d-3c6324d7b97d	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5852613695	5202841875	117	314880	2026-03-08 23:30:05.55
116a14c7-2e8c-480d-8c0f-16b59007a3dd	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4330897660	2593454225	142	251040	2026-03-08 23:34:42.11
3ee5040d-898d-42d7-876a-b10101ef059d	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.00	0.00	7702140243	7289484207	132	227760	2026-03-08 23:34:47.769
274d45c3-3341-458f-9e9c-067418854b73	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.8	6.0	12.0	0.03	0.07	0.02	1092617144713	1867073930090	141	227280	2026-03-08 23:34:53.683
e7871c9a-a2ed-4e60-8cf8-ec660a158065	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144129169214	201337587280	137	499080	2026-03-08 23:34:59.406
42f66726-a534-42f3-9c4e-d57c4df576e4	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5852740499	5202998107	116	315180	2026-03-08 23:35:05.262
b7d63e0b-1c29-4eb8-bcca-87d161f08edc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4331965903	2594562521	139	251340	2026-03-08 23:39:42.146
ae41a812-c486-47eb-bf22-05150ab92f05	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7702338942	7289764127	132	228060	2026-03-08 23:39:47.819
9a7d0bde-eb73-41df-bf0f-2e7a049ffed2	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.0	6.0	12.0	0.04	0.03	0.00	1092617286819	1867074102691	142	227580	2026-03-08 23:39:53.736
f516bebb-83c3-44c5-965b-082831deb9a3	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.02	0.00	144129556957	201338184739	136	499380	2026-03-08 23:39:59.474
468fd94c-94c4-4924-8a53-8a482dc26c46	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5852900461	5203193870	115	315480	2026-03-08 23:40:05.458
558494f6-2c5a-4cbd-9cbc-061a33255346	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.8	6.0	9.0	0.03	0.01	0.00	4333031099	2595665812	141	251640	2026-03-08 23:44:42.146
c18f9af4-a68e-4231-91e0-aa8501195950	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7702557574	7290044416	134	228360	2026-03-08 23:44:47.897
9b8c9a2a-5b43-4249-a7f8-5819304cfe8e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.03	0.00	1092617432680	1867074283944	141	227880	2026-03-08 23:44:53.815
29fa91d7-30e5-495a-8d9c-b348c9145914	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144129941308	201338774851	141	499680	2026-03-08 23:44:59.559
b0e81960-c542-498c-9536-83fcb7b79140	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5853044471	5203345428	117	315780	2026-03-08 23:45:05.442
30603716-1809-4d2c-87bd-3484ab6261bc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4334098724	2596769584	142	251940	2026-03-08 23:49:42.192
401c06c5-b787-4523-a080-28db4c99b9a4	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7702757203	7290322991	134	228660	2026-03-08 23:49:47.864
dff60c76-9f11-40eb-afc6-fb00489b5ad3	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1092617568625	1867074460420	141	228180	2026-03-08 23:49:53.777
80607318-a867-461c-9fff-1a6a6cc6658a	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144130336352	201339433534	135	499980	2026-03-08 23:49:59.484
92dd970a-1a86-424a-872c-9bb5dbca0bc7	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5853181724	5203489030	118	316080	2026-03-08 23:50:05.54
18dec88c-c414-4079-bff0-891c5d579e6c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.8	6.0	9.0	0.07	0.02	0.00	4335163912	2597871733	141	252240	2026-03-08 23:54:42.196
3b80fae4-0ae9-45db-98a0-938d60272dcd	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.02	0.00	7702948230	7290594978	131	228960	2026-03-08 23:54:47.885
252123b4-519e-48d1-b4a0-cc75570449e1	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092617704092	1867074640431	142	228480	2026-03-08 23:54:53.739
5b4308c3-a5c4-4427-8b1b-3a598708cbb2	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144130719527	201340033391	136	500280	2026-03-08 23:54:59.436
6028e653-abcf-4b88-b64b-21a0e8b5b54b	b58f88d3-da10-4386-902f-201b857a31b9	2.5	10.0	11.0	0.05	0.01	0.00	5853316412	5203631017	117	316380	2026-03-08 23:55:05.453
48125087-0ce0-41e3-844f-d0236733cc48	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4336230415	2598977340	142	252540	2026-03-08 23:59:42.169
4d7a2167-4036-4398-b517-ad64a220e06b	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7703158877	7290884113	130	229260	2026-03-08 23:59:47.896
101bd089-4e5b-46f4-8010-816d09ea870f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.01	0.00	1092617838843	1867074819958	141	228780	2026-03-08 23:59:53.757
c5a086d4-f4fa-423f-8639-8d3e6501da61	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144131102751	201340628426	136	500580	2026-03-08 23:59:59.464
215fc5c2-5ade-4ef0-9357-ad37b3e40d10	b58f88d3-da10-4386-902f-201b857a31b9	1.0	10.0	11.0	0.02	0.01	0.00	5853451961	5203781116	118	316680	2026-03-09 00:00:05.909
e306e16c-eb60-4163-9416-afe8f7979704	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.02	0.00	4337302973	2600085800	142	252840	2026-03-09 00:04:42.194
f69107db-0dca-458d-aabf-3e49beeaa012	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7703367150	7291164039	131	229560	2026-03-09 00:04:47.896
89b13c18-14c8-4c81-af2c-de286c7e0681	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092617982821	1867075010822	143	229080	2026-03-09 00:04:53.923
b80ba23b-bc09-40f4-8c1e-d546c12bd8be	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.01	0.00	144131535599	201341245447	138	500880	2026-03-09 00:04:59.618
a770c1c3-e6a2-46fa-850b-1f753df26907	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5853590717	5203937426	117	316980	2026-03-09 00:05:05.509
78cb64f6-eb52-4ba0-8d79-98be59a5f635	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.02	0.00	4338406268	2601204196	142	253140	2026-03-09 00:09:42.191
9fb69c24-7089-4cff-b1d1-5c2220746e17	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7703570320	7291441989	132	229860	2026-03-09 00:09:47.89
1e50c567-7284-4281-89ea-78582d7435fd	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092618123212	1867075197988	140	229380	2026-03-09 00:09:53.771
e0784c73-4b51-4594-93b2-d78eb1481017	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.01	0.00	144131925181	201341841748	136	501180	2026-03-09 00:09:59.434
daead5bd-b047-4493-8aff-745e576c0090	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5853732137	5204101996	117	317280	2026-03-09 00:10:05.626
9de574a8-9aaf-4c6e-bd8c-e9973e830f47	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4339471316	2602304352	141	253440	2026-03-09 00:14:42.269
e90a6da0-76ee-400a-812d-3b161e27c065	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7703771847	7291722982	132	230160	2026-03-09 00:14:47.953
4e22650a-dfa3-427d-9091-4264ba3b714a	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092618266244	1867075389209	140	229680	2026-03-09 00:14:53.867
36921032-d678-4490-868a-f181a154c799	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144132320914	201342445154	139	501480	2026-03-09 00:14:59.561
89765505-ded8-4341-b7d2-066ba9fa26eb	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5853872692	5204269247	117	317580	2026-03-09 00:15:05.602
ab01d24c-b4e2-4b0b-bfd6-dd5cee7dd916	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4340549223	2603417393	140	253740	2026-03-09 00:19:42.256
430e6359-5d48-4965-b345-06930eafce37	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7703969806	7292000963	134	230460	2026-03-09 00:19:47.951
6f02d03b-4fa4-4403-a751-cb88b42d747b	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092618398304	1867075583760	142	229980	2026-03-09 00:19:53.904
4000bdaf-5b41-455d-a9d0-d3c9f8cd0f9f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144132710760	201343043413	138	501780	2026-03-09 00:19:59.567
be4e5ab6-4df7-4cbb-a502-b9d5907e2dd7	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5854017237	5204446561	118	317880	2026-03-09 00:20:05.497
3977c847-9ff0-4065-b5ab-c66bb5e0d6b2	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4341620493	2604521573	142	254040	2026-03-09 00:24:42.204
6b8900dc-4694-4acc-980a-6048b72fb4cf	f3a36a15-7bdb-481e-9472-1a40156dff94	1.8	5.0	9.0	0.07	0.02	0.00	7704174339	7292280973	130	230760	2026-03-09 00:24:47.857
2430c5b5-6f1a-4b37-81ba-5afd6826fc8d	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1092618534737	1867075780646	144	230280	2026-03-09 00:24:53.919
add79462-b405-49b4-a785-90668a25d473	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.03	0.01	144133101500	201343646685	137	502080	2026-03-09 00:24:59.689
10cb5f30-401c-484f-b46e-ee7049d2d4bc	b58f88d3-da10-4386-902f-201b857a31b9	1.5	10.0	11.0	0.03	0.02	0.00	5854175652	5204642590	120	318180	2026-03-09 00:25:05.583
fb1861d0-8c1a-403a-829d-eae00e7d9adc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4342698784	2605631420	139	254340	2026-03-09 00:29:42.194
3996488f-afc3-4b97-a24d-183e62302eb1	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7704379341	7292570021	131	231060	2026-03-09 00:29:47.9
0fa34992-c6ba-48b4-ac96-c54673d163fe	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092618675389	1867075967578	141	230580	2026-03-09 00:29:53.805
07da211a-518b-4953-805e-7fd784d4864e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144133493117	201344250662	136	502380	2026-03-09 00:29:59.494
0b9af172-7d6f-4bdb-9a63-2891a651e27a	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5854337153	5204844004	116	318480	2026-03-09 00:30:05.549
7ec6c22b-1fa4-4922-975c-a722099dc83e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4343766484	2606731873	140	254640	2026-03-09 00:34:42.205
defd486f-0369-400e-b020-1b35144e3ae6	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7704593437	7292865449	131	231360	2026-03-09 00:34:47.86
e691d623-912d-4f0a-b138-b745142c3f83	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.8	6.0	12.0	0.03	0.02	0.00	1092618813120	1867076150663	144	230880	2026-03-09 00:34:53.893
a96c4abc-0e74-457b-bd08-77954ccbc963	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.01	0.00	144133880038	201344851068	137	502680	2026-03-09 00:34:59.56
9dc1171c-2d4a-44e0-962f-c893a9f14697	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5854481599	5205040915	118	318780	2026-03-09 00:35:05.515
ef6334bf-73ad-49f6-b55f-3d9f68bd1b3f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4344847072	2607842339	141	254940	2026-03-09 00:39:42.215
7dca0553-45a6-4041-b9e5-87db67e54c3f	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7704822085	7293148636	134	231660	2026-03-09 00:39:47.939
b287a3b4-a938-4198-8cba-d9699b4f0c0c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092618939182	1867076316459	141	231180	2026-03-09 00:39:53.875
88d1adaa-43b6-4cc7-89ac-a00e500efbdc	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.02	0.00	144143723138	201361336591	137	502980	2026-03-09 00:39:59.581
d82545c5-eca1-48af-9c8c-c6cc1bac66ab	b58f88d3-da10-4386-902f-201b857a31b9	4.5	10.0	11.0	0.09	0.02	0.01	5854619767	5205226577	116	319080	2026-03-09 00:40:05.661
df072495-ce45-422e-bf0f-b39952d267d4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4345924213	2608947694	143	255240	2026-03-09 00:44:42.189
0c484a2c-646d-488a-a35d-58e811e1ba93	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7705021325	7293418576	134	231960	2026-03-09 00:44:47.855
fe85339c-1ed4-4b75-90f4-1c6346fd8322	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.0	6.0	12.0	0.04	0.01	0.00	1092619062192	1867076476205	142	231480	2026-03-09 00:44:53.783
ccb1f1ea-ae00-4245-adfe-afa015f1f43c	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.5	7.0	13.0	0.02	0.04	0.00	144144115758	201361931812	137	503280	2026-03-09 00:44:59.483
669b7fae-9bff-40e4-a307-f24263e8e2ab	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5854760009	5205414805	117	319380	2026-03-09 00:45:05.61
15810d7d-42a7-4d5e-8b73-ee35b313deba	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4347006366	2610058806	141	255540	2026-03-09 00:49:42.223
1810617b-b218-4dbb-8fde-d7cb59eb57fd	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7705220088	7293684676	131	232260	2026-03-09 00:49:47.89
515281a5-af05-4a04-a0c6-1ffecfaebde8	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.5	6.0	12.0	0.02	0.01	0.00	1092619206622	1867076638772	141	231780	2026-03-09 00:49:53.851
63af809a-e622-42c8-bc01-8af08bcc594f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144144497940	201362520244	136	503580	2026-03-09 00:49:59.492
a186b17d-74ab-481e-a156-f84dbb720fa5	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5854900483	5205605215	118	319680	2026-03-09 00:50:05.517
f15e9f86-3f0d-40d9-8b32-41875b733cf8	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4348080578	2611161883	143	255840	2026-03-09 00:54:42.211
0975fcba-a205-42b8-be83-9e62f0f64220	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.01	0.00	7705427480	7293957936	133	232560	2026-03-09 00:54:47.946
d5221112-d9d8-4614-ba2c-c9d8b6a2d230	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092619333088	1867076802433	141	232080	2026-03-09 00:54:53.923
293700d4-1430-41cc-ad1b-793276a45db9	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.04	0.01	144144883911	201363113430	137	503880	2026-03-09 00:54:59.832
24f71509-c1c5-4fd0-b5eb-07ba3b0f8cc4	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5855052615	5205774837	119	319980	2026-03-09 00:55:05.889
079a7d24-e2f1-45cf-98cd-c2832babc9b0	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4349157706	2612273477	142	256140	2026-03-09 00:59:42.185
a8a802f4-3f4b-433a-9635-d1e57b9f1498	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7711248209	7294300950	140	232860	2026-03-09 00:59:47.985
5bebaf67-7cd5-4d7b-a008-47a1ef82c664	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092619461973	1867076964946	142	232380	2026-03-09 00:59:53.904
c810fe29-4e02-42ca-bf95-46c9eaefab2d	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144145269721	201363705547	137	504180	2026-03-09 00:59:59.594
8bb74f58-887e-42a2-b832-b1976701a009	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5855193308	5206019098	117	320280	2026-03-09 01:00:05.819
927715b2-65f5-40f9-a774-e479e81e343e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.8	6.0	9.0	0.03	0.01	0.00	4350229909	2613384116	141	256440	2026-03-09 01:04:42.315
e152ed08-f446-4c5f-830d-013243d09c02	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.02	0.00	7711460123	7294585546	134	233160	2026-03-09 01:04:47.985
3df3fdd9-b595-4646-9bef-d12ddef4a8a3	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092619591926	1867077127291	144	232680	2026-03-09 01:04:53.971
34cda185-a38c-4681-826e-e3477aeeb1d1	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144145649748	201364301623	139	504480	2026-03-09 01:04:59.675
1d79634c-8e58-45bf-9909-32d1c7061c35	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5855331531	5206197608	118	320580	2026-03-09 01:05:05.618
f4616105-32c9-4a16-86ef-3558b77bb7d4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.8	6.0	9.0	0.07	0.02	0.00	4351318456	2614515385	144	256740	2026-03-09 01:09:42.199
3edc2e17-2fc9-45d5-8f38-d8c577b61734	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7711663781	7294870702	131	233460	2026-03-09 01:09:47.935
12b69c26-de6c-4fe9-9507-ac83efcffc8a	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092619730455	1867077305825	141	232980	2026-03-09 01:09:53.895
6682e7cd-d6cd-4c1c-8ba6-6c9ed4dd9f26	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.8	7.0	13.0	0.03	0.01	0.00	144146028263	201364895631	136	504780	2026-03-09 01:09:59.664
846a3888-52cb-414c-8f0d-3b15242cd90b	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5855474978	5206378724	121	320880	2026-03-09 01:10:05.697
049b36a3-660c-4c3a-bd92-4701c140952c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4352399986	2615636372	140	257040	2026-03-09 01:14:42.189
81983340-0172-4ac3-aa0a-d2c695b46109	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7711884223	7295165963	131	233760	2026-03-09 01:14:48.006
f5b20c42-e8a4-4152-8204-24e8b5a451d0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.01	0.00	1092619875144	1867077490761	141	233280	2026-03-09 01:14:53.854
a61c15e0-bea5-4906-adb9-c0488ea3f42e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144146414416	201365496086	139	505080	2026-03-09 01:14:59.568
92f645e0-8da8-4bdf-b699-b151c64e93c6	b58f88d3-da10-4386-902f-201b857a31b9	7.0	9.0	11.0	0.14	0.21	0.10	5859484817	5547636984	119	321180	2026-03-09 01:15:05.068
90782443-23ea-4687-bd0b-151c4253f46a	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.00	0.00	4353489287	2616765368	144	257340	2026-03-09 01:19:42.189
a59df7cd-8c6c-498b-b238-63a6bfefeb19	f3a36a15-7bdb-481e-9472-1a40156dff94	4.5	5.0	9.0	0.18	0.08	0.02	7712100159	7295462276	130	234060	2026-03-09 01:19:47.943
c107a030-5103-410f-b49e-10235b9b12b8	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092620015102	1867077670571	140	233580	2026-03-09 01:19:53.848
a49c397f-efb1-448e-9b8b-ab2b7b2b18e9	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.02	0.00	144146794591	201366094436	137	505380	2026-03-09 01:19:59.55
5c9b9115-c8d1-498d-8f7f-1b3a22ad6958	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.07	0.06	5859626346	5547809853	119	321480	2026-03-09 01:20:05.653
f902b9c9-e162-42f2-b6c9-5a20b695d6eb	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4354573002	2617888776	143	257640	2026-03-09 01:24:42.22
703447d5-a7df-4725-8815-82dfdc684fab	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.04	0.01	7712325877	7295766739	133	234360	2026-03-09 01:24:47.947
da68d559-458a-43ed-ad7c-7cfd16d0d714	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092620160070	1867077855801	142	233880	2026-03-09 01:24:53.894
5fdaff5d-ec42-48ae-98d5-60608f32377d	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144147172486	201366689239	137	505680	2026-03-09 01:24:59.614
d53fb113-1497-4ef0-b188-6d1a3af48812	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.03	0.04	5859788495	5547983504	119	321780	2026-03-09 01:25:05.62
1cbc8074-2769-4049-8057-32a040b86fd3	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4355663910	2619024055	143	257940	2026-03-09 01:29:42.19
539be5ea-6e52-4699-b679-d518fabcc1d5	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7712564032	7296066878	132	234660	2026-03-09 01:29:47.848
9e49c414-0919-41ef-8680-59743e5910bb	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092620304660	1867078039989	141	234180	2026-03-09 01:29:53.83
8fd2fffb-fda4-4209-85d0-f8388f187ccc	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.00	0.00	144147556092	201367285415	137	505980	2026-03-09 01:29:59.527
22b213f0-5578-46be-b8bd-6ce20843bd04	b58f88d3-da10-4386-902f-201b857a31b9	4.0	10.0	11.0	0.08	0.02	0.02	5859974805	5548205830	118	322080	2026-03-09 01:30:05.574
73246c5a-83b0-4bb5-bbc7-d3c46850cc9e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4356733213	2620142628	142	258240	2026-03-09 01:34:42.188
76acf885-719a-4f2a-8795-2b0509c906af	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.02	0.00	7712786315	7296364708	134	234960	2026-03-09 01:34:47.839
a0322b2b-e38b-4d94-90df-5fff8ec94af5	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092620450389	1867078224873	142	234480	2026-03-09 01:34:53.714
fe7aad94-2ee2-4c18-b525-c5c8cd78d7d5	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144147945679	201367886348	138	506280	2026-03-09 01:34:59.467
fd1a6a5f-01f6-4c25-bc5b-39c7fba20bf9	b58f88d3-da10-4386-902f-201b857a31b9	4.0	10.0	11.0	0.08	0.02	0.01	5860252948	5548528753	120	322380	2026-03-09 01:35:05.398
345327de-7ca9-4dfe-bafb-3f4ef8f23dbd	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.8	6.0	9.0	0.03	0.01	0.00	4357804629	2621264908	141	258540	2026-03-09 01:39:42.202
5852d066-038a-46d5-a60b-7268ce00d57e	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7712998742	7296660638	135	235260	2026-03-09 01:39:47.868
3b97dd73-6d90-432f-85f8-a8c39e094be5	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.5	6.0	12.0	0.10	0.05	0.01	1092620598470	1867078413265	141	234780	2026-03-09 01:39:53.838
b04fe77f-e366-4ce9-9b19-c89366d7ac13	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144148352568	201368486435	137	506580	2026-03-09 01:39:59.513
d9747631-8d23-4a41-a8da-c39a4b7055aa	b58f88d3-da10-4386-902f-201b857a31b9	6.0	9.0	11.0	0.12	0.03	0.01	5860521716	5548836289	117	322680	2026-03-09 01:40:05.431
fb0e8011-18dc-4c69-8c09-bc59ca09cb0c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.5	6.0	9.0	0.06	0.03	0.00	4358878254	2622389452	141	258840	2026-03-09 01:44:42.238
51db2f35-1201-4d9f-9ebc-04078d6b0e15	f3a36a15-7bdb-481e-9472-1a40156dff94	2.5	5.0	9.0	0.10	0.03	0.01	7713208355	7296956031	130	235560	2026-03-09 01:44:47.948
efac014f-ad95-4e2e-b805-ee94f188208c	3cfb027c-6805-444c-b21f-03cebcb6f5ab	4.3	6.0	12.0	0.17	0.06	0.01	1092620753509	1867078603531	143	235080	2026-03-09 01:44:53.79
394cbe11-0178-4fde-8ef4-df4ac6146536	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144148733523	201369084758	137	506880	2026-03-09 01:44:59.452
527daa0f-d252-4164-9ae9-09e7a07eca5e	b58f88d3-da10-4386-902f-201b857a31b9	5.0	9.0	11.0	0.10	0.03	0.01	5860785424	5549142955	114	322980	2026-03-09 01:45:05.439
ddfc1ccf-5e50-4a47-b48e-57f154692d1b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	2.3	6.0	9.0	0.09	0.04	0.01	4359969843	2623521639	142	259140	2026-03-09 01:49:42.509
55ac01a9-787c-4247-9aa4-ee4e30b41a00	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.02	0.00	7713419014	7297251713	129	235860	2026-03-09 01:49:48.18
ac2c2a82-00aa-4879-9a06-016bc7771c60	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.3	6.0	12.0	0.01	0.03	0.00	1092620926460	1867078793383	142	235380	2026-03-09 01:49:54.125
7991c18b-63fd-4bac-b92e-d2e78be7ea9e	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144149118486	201369686213	136	507180	2026-03-09 01:49:59.791
52a5d406-be7e-4520-a4ad-40868d209433	b58f88d3-da10-4386-902f-201b857a31b9	1.0	9.0	11.0	0.02	0.02	0.00	5861052077	5549456392	118	323280	2026-03-09 01:50:05.84
26373271-4ec8-4fa6-b112-e06650d0dfdc	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.03	0.00	4360831851	2624410160	146	259380	2026-03-09 01:53:28.423
e8b8c4e6-2de6-4953-a24e-86568814b8e1	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7713588572	7297482528	130	236100	2026-03-09 01:53:34.121
fa53b46d-2158-4390-9b5b-21ab6c7569be	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1092621037811	1867078937496	144	235620	2026-03-09 01:53:40.071
2b4ac9cd-cd2e-42b3-bd63-8a935a7f8f06	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.8	7.0	13.0	0.03	0.01	0.00	144149419308	201370155400	139	507420	2026-03-09 01:53:45.563
78d25ce0-5521-4878-bed1-0e2e5a4c26b3	b58f88d3-da10-4386-902f-201b857a31b9	2.0	9.0	11.0	0.04	0.03	0.00	5861262986	5549694809	119	323520	2026-03-09 01:53:51.271
1b8506f5-6638-49bc-8db6-1f4382831fd3	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.02	0.00	4361893233	2625521483	141	259680	2026-03-09 01:58:26.014
14919af8-2b39-45a2-9408-7ec946fca5d7	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7713804080	7297779962	134	236400	2026-03-09 01:58:31.688
429607cb-2bab-4dd8-910a-af8262e5a9ba	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1092621181871	1867079122328	141	235920	2026-03-09 01:58:37.583
2d6784b8-9bb3-449f-8203-f7fb27d955c7	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.0	7.0	13.0	0.04	0.01	0.00	144149803991	201370751782	136	507720	2026-03-09 01:58:43.248
ce9d47f4-e953-44dc-90dd-a3ba07e7a3ea	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5861536533	5550021360	119	323820	2026-03-09 01:58:48.965
b16cdc4c-474d-4400-aff2-2378a4aeb072	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4363000454	2626657108	144	259980	2026-03-09 02:03:25.952
b140292d-758f-418a-bb00-dcc303273bc0	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7714027610	7298086007	134	236700	2026-03-09 02:03:31.701
5ef60fbe-01e3-44c7-8a61-e8a118a918c5	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.8	6.0	12.0	0.15	0.04	0.01	1092621332183	1867079311341	140	236220	2026-03-09 02:03:37.618
aee3d3ed-efe9-4b0d-b3fc-383fda17e424	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144150197847	201371354150	138	508020	2026-03-09 02:03:43.279
15bdc08d-5138-4f31-91ab-0ef067dd5763	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5861792139	5550325740	120	324120	2026-03-09 02:03:49.227
53554ff3-b087-49ba-9022-17ab0f21130b	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4364070774	2627775970	142	260280	2026-03-09 02:08:26.028
f6ad087d-46b3-4d14-908c-7b199e7827f3	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7714245811	7298385511	132	237000	2026-03-09 02:08:31.767
0ec3563f-8349-417b-b746-fd3ea2ed62ba	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.04	0.01	1092621478331	1867079495701	141	236520	2026-03-09 02:08:37.727
d4f0974f-05d8-437c-8f7a-9937d8a74e45	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144150590276	201371952901	134	508320	2026-03-09 02:08:43.429
34ebea82-af49-4897-890a-2c59f9845b3c	b58f88d3-da10-4386-902f-201b857a31b9	18.0	9.0	11.0	0.36	0.11	0.03	5862052687	5550637068	119	324420	2026-03-09 02:08:49.131
ed5c906d-7d5c-40fd-bd03-60123d44d34a	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4365153112	2628907077	143	260580	2026-03-09 02:13:26.017
bde43cb0-eb15-4e73-9117-db29d8560252	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7714465023	7298691555	134	237300	2026-03-09 02:13:31.833
dc1cbb0c-250c-46c1-8c2f-084601992fc5	3cfb027c-6805-444c-b21f-03cebcb6f5ab	3.8	6.0	12.0	0.15	0.04	0.01	1092621629986	1867079684065	142	236820	2026-03-09 02:13:37.763
6e3cf91b-cb8c-4351-b095-b220c22f5f6b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.8	7.0	13.0	0.03	0.03	0.00	144151006388	201372561916	138	508620	2026-03-09 02:13:43.419
26a7f81d-72dc-47f0-aca0-855c53bbf784	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.04	0.00	5862311595	5550943826	122	324720	2026-03-09 02:13:49.212
45f35b53-cc72-4632-9993-e2cf8345d760	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4366234012	2630035856	143	260880	2026-03-09 02:18:26.601
e257c37b-d070-4d79-b0cd-91109d94fb33	f3a36a15-7bdb-481e-9472-1a40156dff94	2.0	5.0	9.0	0.08	0.02	0.01	7714661101	7298958915	131	237600	2026-03-09 02:18:32.266
7582470e-338a-4b91-9c3d-d56e0aae1904	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1092621782071	1867079870940	142	237120	2026-03-09 02:18:38.132
9e5c3684-3846-4056-984b-7c6912026e13	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.0	7.0	13.0	0.04	0.02	0.00	144151406077	201373169873	135	508920	2026-03-09 02:18:43.841
82a48cf1-e04e-4780-9de3-43015c688dfe	b58f88d3-da10-4386-902f-201b857a31b9	1.0	10.0	11.0	0.02	0.02	0.00	5862576100	5551255459	120	325020	2026-03-09 02:18:49.601
f59820c2-63b7-462e-a007-68de0ab4481d	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.01	0.00	4367316588	2631166265	142	261180	2026-03-09 02:23:26.039
3e182653-fb67-4409-b6d6-720dc280e59e	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7714867600	7299236525	132	237900	2026-03-09 02:23:31.84
9d2c46d4-9482-4aa7-94af-d7527abccb13	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.02	0.01	1092621934139	1867080058527	144	237420	2026-03-09 02:23:37.8
bb1fbf63-c00b-41bc-b18c-69f12afa87d7	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144151793308	201373768037	138	509220	2026-03-09 02:23:43.518
2efa91f0-3096-4075-9551-3997dd9cb1a4	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5862827496	5551553013	118	325320	2026-03-09 02:23:49.218
d5082a0a-83d0-4a63-a4b7-0f75d7049e89	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.03	0.00	4368394976	2632293038	141	261480	2026-03-09 02:28:26.011
7385cbd2-ecdc-464a-9de2-99becd6dc1c5	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7715076433	7299515228	130	238200	2026-03-09 02:28:31.826
c91d19c4-5f3f-46d2-a587-d341746532c1	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092622091370	1867080249776	141	237720	2026-03-09 02:28:37.763
6bd123a9-eccf-402d-b1ac-e3ffb379265b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.02	0.00	144152182577	201374366626	135	509520	2026-03-09 02:28:43.463
f3d928a1-4040-4ba4-8aa3-fd9c034a5c9b	b58f88d3-da10-4386-902f-201b857a31b9	3.5	10.0	11.0	0.07	0.03	0.00	5863093134	5551868815	116	325620	2026-03-09 02:28:49.179
ca85ca43-3f53-4d2f-a7cc-b16150eb399d	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4369479374	2633418880	142	261780	2026-03-09 02:33:25.982
b0cfac89-e766-4cff-8be5-14b50c6f4b7b	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.01	0.00	7715294037	7299798622	130	238500	2026-03-09 02:33:31.771
b27cb050-7c82-4ebd-bd01-fe980e90c931	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1092622240678	1867080427592	141	238020	2026-03-09 02:33:37.67
c93f9f5c-7b06-452e-bdd2-85ee3988040d	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.03	0.00	144152575553	201374969058	135	509820	2026-03-09 02:33:43.347
61992843-836d-4c5e-a6f2-ef0ce58dd432	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5863410378	5552217113	118	325920	2026-03-09 02:33:49.053
e249e7b0-3d0f-4faa-9171-6f47523273b7	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4370325545	2634305400	145	262020	2026-03-09 02:37:18.542
ec6c4ae1-d2e9-453a-929f-d248d1473a47	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7715458229	7300022274	132	238740	2026-03-09 02:37:24.316
4c9c2789-bcf9-4410-9ee6-d3f79c56c48e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092622347626	1867080559626	140	238260	2026-03-09 02:37:30.237
14ac711e-ba1c-49bf-847a-ed4485434082	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144152874227	201375436004	134	510060	2026-03-09 02:37:35.993
c9dfc833-a2a5-4d44-91d5-edc883bd26e0	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5863620283	5552464066	118	326160	2026-03-09 02:37:41.774
fcbd74ae-3d27-4161-a11e-10a0d7b9e249	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.5	6.0	9.0	0.02	0.02	0.00	4371393831	2635413784	143	262320	2026-03-09 02:42:15.533
fe9700f1-668b-4de4-a0e1-8ace01a96d60	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7715664090	7300300391	133	239040	2026-03-09 02:42:21.256
6ecb51f5-e897-4db8-bd0c-379e8567b805	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092622479725	1867080727579	142	238500	2026-03-09 02:42:27.451
9b639a99-386c-4dc7-8bfa-a9e07d5061cd	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.8	7.0	13.0	0.03	0.02	0.00	144153264314	201376035029	139	510300	2026-03-09 02:42:33.19
85f68ca5-983a-4d11-ba3c-128883fd3130	b58f88d3-da10-4386-902f-201b857a31b9	8.5	10.0	11.0	0.17	0.05	0.01	5863879773	5552771105	120	326460	2026-03-09 02:42:38.957
6c159e77-8864-415b-bb0f-affc66e07e28	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4372463856	2636520776	141	262620	2026-03-09 02:47:15.445
9eba50d0-35e1-49d8-b7af-e9c2873b017d	f3a36a15-7bdb-481e-9472-1a40156dff94	1.3	5.0	9.0	0.05	0.03	0.01	7715892785	7300571252	138	239340	2026-03-09 02:47:21.307
9429ae86-1f7c-4702-8f85-1a65d9685db0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1092622637772	1867080897931	144	238800	2026-03-09 02:47:27.184
3a8fbdbf-d9d1-4e28-b540-219572614f6b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.02	0.01	144153651633	201376639236	139	510600	2026-03-09 02:47:32.887
576cf1b6-24ff-472b-a81f-824866aeee55	b58f88d3-da10-4386-902f-201b857a31b9	0.5	9.0	11.0	0.01	0.02	0.00	5864179123	5553097327	118	326760	2026-03-09 02:47:38.594
7a8f242f-f5b9-426e-a04f-8666eb63151c	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4373539512	2637634996	143	262920	2026-03-09 02:52:15.267
34f3c4af-17b6-49fa-9a07-00701585f692	f3a36a15-7bdb-481e-9472-1a40156dff94	0.5	5.0	9.0	0.02	0.02	0.00	7716107711	7300854530	130	239640	2026-03-09 02:52:20.95
72fbb5ca-ba69-40a6-8fab-86e20c9717f1	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092622774644	1867081069046	139	239100	2026-03-09 02:52:26.949
af1da38e-a62b-4dcd-bc62-ebfa4f6d9e1b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.00	0.00	144154038379	201377245680	139	510900	2026-03-09 02:52:32.667
88ddc304-be49-4625-81af-f0eeec8bcc61	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.01	0.00	5864439844	5553399880	120	327060	2026-03-09 02:52:38.419
a2d8ab0f-fb0f-423d-8890-9f3eef89cf07	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4374619124	2638756839	141	263220	2026-03-09 02:57:15.251
64559a35-e3c4-4d4a-b771-12c2f57b6220	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7716323704	7301127221	129	239940	2026-03-09 02:57:21.009
734df58a-7451-4e27-bdba-ee8fcf8e986f	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092622916137	1867081249210	143	239400	2026-03-09 02:57:26.907
44202dfe-0c76-4d3e-987a-de953b439665	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	3.5	7.0	13.0	0.14	0.04	0.01	144154436612	201377864583	137	511200	2026-03-09 02:57:32.601
fb884b3b-23fa-4fb0-9d48-9e2a63d29872	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5864695613	5553694971	117	327360	2026-03-09 02:57:38.317
0cade298-3bb0-4236-b3c7-ca9ca55a4433	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4375711854	2639889335	143	263520	2026-03-09 03:02:15.319
baab0b8b-88f7-4773-8874-5cb32da1d71f	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.02	0.00	7716523261	7301376792	130	240240	2026-03-09 03:02:21.199
47e3a60d-8a6b-4f55-b267-fc4febedcb5e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.0	6.0	12.0	0.08	0.05	0.01	1092623066711	1867081436214	142	239700	2026-03-09 03:02:27.091
7881a4df-74d9-4694-bdec-e04ecd6e7bb1	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.03	0.01	144154848239	201378488572	137	511500	2026-03-09 03:02:32.795
6400a780-bdb4-4aee-ad08-fedf0f9a5cf4	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.01	0.00	5864985527	5553994165	119	327660	2026-03-09 03:02:38.49
12d008cb-426d-498a-b6a5-35551e6a2357	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4376806342	2641019213	141	263820	2026-03-09 03:07:15.381
3acabcb7-bd36-4157-875c-8e494d9ea85c	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7716726048	7301639220	130	240540	2026-03-09 03:07:21.179
99ce55bd-ada3-4bac-be55-b20e8250e3d9	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.01	0.00	1092623219206	1867081618230	141	240000	2026-03-09 03:07:27.144
9859ccf8-1747-4f7e-8272-2e0f41d373f4	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	4.0	7.0	13.0	0.16	0.05	0.01	144155256769	201379101549	136	511800	2026-03-09 03:07:32.863
12da8ac6-8087-4190-9bdd-7872236df4fa	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5865268857	5554311813	117	327960	2026-03-09 03:07:38.574
e498b219-cb12-4578-bea9-41145c31d8b4	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4377899377	2642149747	142	264120	2026-03-09 03:12:15.191
30ae3d51-73b8-4071-a9af-1137aab71a37	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7716928882	7301913204	133	240840	2026-03-09 03:12:20.892
3f0b04b7-c8a8-4cdb-aa0a-233056650640	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092623371647	1867081804500	144	240300	2026-03-09 03:12:26.816
61a821d8-5773-4e5a-9dfc-ada98c4df5d1	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144155667617	201379724536	138	512100	2026-03-09 03:12:32.55
53443c36-1ecd-4d9c-9da8-1f0ee2ebbbdf	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5865531337	5554607667	119	328260	2026-03-09 03:12:38.203
5d0e30c1-bb69-4094-9f06-b7cb86663a10	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.00	0.00	4378986448	2643270308	142	264420	2026-03-09 03:17:15.546
69b33740-605e-405b-aa9c-c84c7971f9d3	f3a36a15-7bdb-481e-9472-1a40156dff94	1.3	5.0	9.0	0.05	0.03	0.00	7717149960	7302181583	131	241140	2026-03-09 03:17:21.218
a6c22635-9611-4435-8a89-8181772599c2	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092623523269	1867081985557	140	240600	2026-03-09 03:17:27.154
d3a526bf-2445-458e-a28b-a3611ab91d3b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144156076808	201380338122	135	512400	2026-03-09 03:17:32.828
01b5d31c-4a46-4b90-af24-231b375acd27	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.01	0.00	5865716447	5554809397	117	328560	2026-03-09 03:17:38.832
cc75b905-7bba-408d-89e9-398e5b46d165	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4379752868	2644072705	144	264600	2026-03-09 03:20:44.351
4f6b6c64-d1b1-4679-85e1-e3e94b6b238f	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.01	0.00	7717287260	7302361450	131	241320	2026-03-09 03:20:50.044
740d7145-5db0-4807-8708-6c7d6ff1a2fd	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.5	6.0	12.0	0.06	0.01	0.00	1092623628104	1867082107537	141	240840	2026-03-09 03:20:55.999
fc67d893-5522-4226-a940-39c0769812e1	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144156359931	201380763057	138	512640	2026-03-09 03:21:01.711
dd8f5508-0d3c-4802-ac23-8a62238b7679	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5865823427	5554925986	119	328740	2026-03-09 03:21:07.597
7ba3941f-0d49-4b98-8f4d-46c5b1cf51c8	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	4.5	6.0	9.0	0.18	0.05	0.01	4380840930	2645211261	146	264900	2026-03-09 03:25:41.798
8c475885-bad7-4a7d-88aa-d2d21ec0f7d8	f3a36a15-7bdb-481e-9472-1a40156dff94	1.0	5.0	9.0	0.04	0.01	0.00	7717472568	7302612204	130	241620	2026-03-09 03:25:47.509
69a3bb60-7ef6-4357-9b8a-f1d6f04747cd	3cfb027c-6805-444c-b21f-03cebcb6f5ab	2.8	6.0	12.0	0.11	0.04	0.01	1092623773875	1867082278475	142	241140	2026-03-09 03:25:53.653
e5ecce84-9e31-442a-b011-c8208d2d269b	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144156765181	201381374634	136	512940	2026-03-09 03:25:59.481
a3ffb65c-3236-487a-8e72-11429931e72c	b58f88d3-da10-4386-902f-201b857a31b9	0.0	9.0	11.0	0.00	0.00	0.00	5869686851	5562750257	116	329040	2026-03-09 03:26:05.452
9499dea0-15d3-4920-9e8b-78d22e7d6d47	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	1.5	6.0	9.0	0.06	0.03	0.01	4381057036	2645439431	145	264960	2026-03-09 03:26:40.844
7492c5eb-d1e6-4b1a-8bec-3d291623beca	f3a36a15-7bdb-481e-9472-1a40156dff94	0.3	5.0	9.0	0.01	0.01	0.00	7717519328	7302678241	131	241680	2026-03-09 03:26:48.793
b51cb9ea-3bd2-4f08-8a48-81aea4a434a0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	1.0	6.0	12.0	0.04	0.03	0.00	1092623810221	1867082323089	145	241200	2026-03-09 03:26:54.898
06949835-9de1-4cae-9f23-7b9cfc18bf6a	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.8	7.0	13.0	0.03	0.01	0.00	144156855797	201381509788	136	513000	2026-03-09 03:27:00.594
e6621b94-3314-42a6-901b-1d40269acbec	b58f88d3-da10-4386-902f-201b857a31b9	4.0	10.0	11.0	0.08	0.02	0.01	5869719225	5562789338	117	329100	2026-03-09 03:27:06.399
a9466ef5-209e-4358-932b-f14957ed4d4f	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4382129187	2646559837	144	265260	2026-03-09 03:31:40.834
6d4a1623-70c5-4036-9c7b-9d910e16e182	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7717699537	7302930522	132	241980	2026-03-09 03:31:46.524
83991a5d-f0d5-4c02-a315-15932afdb4ec	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1092623977795	1867082495227	143	241500	2026-03-09 03:31:52.483
dd66a69d-88fb-42ee-89d6-198775eddc5f	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.3	7.0	13.0	0.09	0.04	0.01	144157265320	201382123006	139	513300	2026-03-09 03:31:58.232
9c17734b-403d-4e04-8958-cdecc990caca	b58f88d3-da10-4386-902f-201b857a31b9	3.5	10.0	11.0	0.07	0.02	0.00	5869848604	5562938766	116	329400	2026-03-09 03:32:04.247
5e114761-7256-4c4a-b668-2d389f564a97	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.3	6.0	9.0	0.01	0.02	0.00	4383189978	2647668772	140	265560	2026-03-09 03:36:40.813
d28b183e-34a1-42cf-928f-165db0643555	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7717906165	7303198225	131	242280	2026-03-09 03:36:46.566
24649b9d-d0b4-47a9-a0c4-3ac539e77fdb	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092624119181	1867082666026	142	241800	2026-03-09 03:36:52.562
4794467f-48a7-48fb-8549-48a75d724df0	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	2.0	7.0	13.0	0.08	0.02	0.01	144157674095	201382738237	136	513600	2026-03-09 03:36:58.599
54e4b695-3475-4b0a-86d6-a5655ea29a85	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5869982009	5563091990	117	329700	2026-03-09 03:37:04.523
58af0ee8-e083-471f-8a60-910c441319d5	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4384315823	2648855255	144	265860	2026-03-09 03:41:49.007
f43f9620-531d-40a7-9969-c77dccab39fd	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7718113443	7303478828	133	242580	2026-03-09 03:41:54.793
0362879c-0e27-4e48-904a-279a433ddf2e	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092624259684	1867082841955	142	242100	2026-03-09 03:42:00.688
c06c15a1-a6a9-4cdc-98f8-09ae54b55a10	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.02	0.00	144158096160	201383373298	138	513900	2026-03-09 03:42:06.48
d206745a-08c2-41ee-bc74-d4c287470d68	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5870119396	5563250799	116	330000	2026-03-09 03:42:12.16
2c3061b6-91bc-44d1-ba29-6ee1caeaf396	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4385392069	2649987115	142	266160	2026-03-09 03:46:46.95
9eacbf4e-09f6-46b8-86d4-7257e35fd65c	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7718312607	7303762611	134	242880	2026-03-09 03:46:52.62
a387c844-0ba1-4c1c-bfbe-fefd060ac4d0	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092624402801	1867083053773	143	242400	2026-03-09 03:46:58.551
1c8f781d-0518-49d7-b75c-1b83049d2ae2	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.3	7.0	13.0	0.01	0.02	0.00	144158524775	201383988746	136	514200	2026-03-09 03:47:04.322
17500abb-0686-422c-87c7-178920c66b6b	b58f88d3-da10-4386-902f-201b857a31b9	0.5	10.0	11.0	0.01	0.01	0.00	5870252853	5563410025	116	330300	2026-03-09 03:47:10.013
5504e024-7b84-4991-89f1-08aad623af6e	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4385969425	2650589529	143	266340	2026-03-09 03:49:25.856
41b1eace-fc72-493b-b087-7f299379f0cf	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7718429937	7303919339	132	243060	2026-03-09 03:49:31.535
d994b077-c207-4c70-859b-0f956739b0c8	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.8	6.0	12.0	0.03	0.01	0.00	1092624482165	1867083152232	138	242580	2026-03-09 03:49:37.416
aab57b2e-8152-4808-bc32-2fddd9f1af85	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.00	0.00	144158745687	201384318149	137	514380	2026-03-09 03:49:43.098
46cca77b-3a0c-4460-b4b2-a9323495890d	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5870319020	5563499120	116	330480	2026-03-09 03:49:48.833
2b992feb-ac84-4dea-952a-c59ebf923f61	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.01	0.00	4387078593	2651745153	147	266640	2026-03-09 03:54:24.547
7cc11c28-05ee-4e5b-8cc5-8bd632bce82d	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7718634409	7304195211	132	243360	2026-03-09 03:54:30.395
9153f3a6-7e90-43de-b404-a67a34c6aa30	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.00	0.00	1092624621862	1867083320903	140	242880	2026-03-09 03:54:36.301
b8ee8311-9e31-4c8a-9fce-d16e2b022428	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	1.3	7.0	13.0	0.05	0.05	0.01	144159160557	201384933191	136	514680	2026-03-09 03:54:42.031
855f4837-7e7d-4b1a-9ecc-daab8c470f80	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5870431627	5563659511	117	330780	2026-03-09 03:54:47.763
00b37bfd-386b-4384-9e2b-e2e1fef8fa61	ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	0.0	6.0	9.0	0.00	0.00	0.00	4388158838	2652872418	142	266940	2026-03-09 03:59:24.607
fb420a70-0ee5-4eee-9835-7b620d7bd2b2	f3a36a15-7bdb-481e-9472-1a40156dff94	0.0	5.0	9.0	0.00	0.00	0.00	7718833968	7304462407	131	243660	2026-03-09 03:59:30.317
1d3481f9-90be-44d2-82bb-64601f0d8f45	3cfb027c-6805-444c-b21f-03cebcb6f5ab	0.0	6.0	12.0	0.00	0.02	0.00	1092624763801	1867083490418	139	243180	2026-03-09 03:59:36.186
370feaa3-250d-4ea8-933d-f62304c92f30	6bd62006-50f1-4b0c-8f42-8aa34b3f659a	0.0	7.0	13.0	0.00	0.01	0.00	144159583495	201385555676	137	514980	2026-03-09 03:59:41.847
0a2a184e-b43f-4b96-9107-e7ca58c3d209	b58f88d3-da10-4386-902f-201b857a31b9	0.0	10.0	11.0	0.00	0.00	0.00	5870541133	5563821675	117	331080	2026-03-09 03:59:47.495
\.


--
-- Data for Name: vps_servers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vps_servers (id, name, hostname, ip, port, username, encrypted_password, encrypted_private_key, auth_type, status, os, notes, created_at) FROM stdin;
ed1b6ccd-b73e-4fe3-8451-d53c85d5fc5b	ACELERA CRM	acelera crm	72.61.55.160	22	root	60IHkydKmzZEpU6ikBh7n4/b2KZ/tSo52o2G//yHsAdIlpSS/5Sn+wi2Jmc=	\N	password	online	Linux 6.8.0-100-generic		2026-03-08 01:49:25.159427
f3a36a15-7bdb-481e-9472-1a40156dff94	FACILITIES	FACILITIES	72.62.13.155	22	root	KoVmSXEYm9v18zn3iFhkrcydt7Ard3n4XjR2nnhL88deUbWY3GnokDYJoJQ=	\N	password	online	Linux 6.8.0-90-generic		2026-03-07 23:09:10.411181
3cfb027c-6805-444c-b21f-03cebcb6f5ab	TICKETFLOW	TICKETFLOW	72.60.139.138	22	root	p/qmqlcQAJmp1Czv0F2vaBxd8g9DX8KJcevx3t/K9w5Smr+KYqI0hMB6joU=	\N	password	online	Linux 6.8.0-90-generic		2026-03-07 22:15:34.360421
6bd62006-50f1-4b0c-8f42-8aa34b3f659a	VAGAS / RNC	VAGAS / RNC	72.60.244.148	22	root	Ll+35h9zYf++GHUZKdocbfWFGYV8KZZTByILT5zdJzczJwZa5CNaGUH+mlE=	\N	password	online	Linux 6.8.0-90-generic		2026-03-08 02:41:16.289963
b58f88d3-da10-4386-902f-201b857a31b9	VITTAVERDE	VITTAVERDE	69.62.94.90	22	root	ab0huTSN0Jo64193aWUh3odbY4LUK+w/gEhAkG140JP9c14ZHGIslX3W8Y8=	\N	password	online	Linux 6.8.0-90-generic		2026-03-08 01:50:04.320058
\.


--
-- Name: ai_configs ai_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_configs
    ADD CONSTRAINT ai_configs_pkey PRIMARY KEY (id);


--
-- Name: alert_destinations alert_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_destinations
    ADD CONSTRAINT alert_destinations_pkey PRIMARY KEY (id);


--
-- Name: alert_history alert_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_history
    ADD CONSTRAINT alert_history_pkey PRIMARY KEY (id);


--
-- Name: alert_rules alert_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_rules
    ADD CONSTRAINT alert_rules_pkey PRIMARY KEY (id);


--
-- Name: app_checklists app_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_checklists
    ADD CONSTRAINT app_checklists_pkey PRIMARY KEY (id);


--
-- Name: app_clients app_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_clients
    ADD CONSTRAINT app_clients_pkey PRIMARY KEY (id);


--
-- Name: app_documents app_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_documents
    ADD CONSTRAINT app_documents_pkey PRIMARY KEY (id);


--
-- Name: app_metrics app_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_metrics
    ADD CONSTRAINT app_metrics_pkey PRIMARY KEY (id);


--
-- Name: app_monitors app_monitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_monitors
    ADD CONSTRAINT app_monitors_pkey PRIMARY KEY (id);


--
-- Name: app_notes app_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_notes
    ADD CONSTRAINT app_notes_pkey PRIMARY KEY (id);


--
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- Name: client_types client_types_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_types
    ADD CONSTRAINT client_types_key_unique UNIQUE (key);


--
-- Name: client_types client_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_types
    ADD CONSTRAINT client_types_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: db_metrics db_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_metrics
    ADD CONSTRAINT db_metrics_pkey PRIMARY KEY (id);


--
-- Name: developers developers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT developers_pkey PRIMARY KEY (id);


--
-- Name: financial_entries financial_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: kanban_tasks kanban_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kanban_tasks
    ADD CONSTRAINT kanban_tasks_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: monitoring_config monitoring_config_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitoring_config
    ADD CONSTRAINT monitoring_config_key_unique UNIQUE (key);


--
-- Name: monitoring_config monitoring_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitoring_config
    ADD CONSTRAINT monitoring_config_pkey PRIMARY KEY (id);


--
-- Name: origins origins_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.origins
    ADD CONSTRAINT origins_key_unique UNIQUE (key);


--
-- Name: origins origins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.origins
    ADD CONSTRAINT origins_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permission_roles permission_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_roles
    ADD CONSTRAINT permission_roles_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: repo_files repo_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repo_files
    ADD CONSTRAINT repo_files_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: tag_configs tag_configs_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_configs
    ADD CONSTRAINT tag_configs_name_unique UNIQUE (name);


--
-- Name: tag_configs tag_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_configs
    ADD CONSTRAINT tag_configs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vps_app_links vps_app_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_app_links
    ADD CONSTRAINT vps_app_links_pkey PRIMARY KEY (id);


--
-- Name: vps_command_logs vps_command_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_command_logs
    ADD CONSTRAINT vps_command_logs_pkey PRIMARY KEY (id);


--
-- Name: vps_databases vps_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_databases
    ADD CONSTRAINT vps_databases_pkey PRIMARY KEY (id);


--
-- Name: vps_db_app_links vps_db_app_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_db_app_links
    ADD CONSTRAINT vps_db_app_links_pkey PRIMARY KEY (id);


--
-- Name: vps_metrics vps_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_metrics
    ADD CONSTRAINT vps_metrics_pkey PRIMARY KEY (id);


--
-- Name: vps_servers vps_servers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vps_servers
    ADD CONSTRAINT vps_servers_pkey PRIMARY KEY (id);


--
-- Name: app_checklists app_checklists_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_checklists
    ADD CONSTRAINT app_checklists_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_documents app_documents_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_documents
    ADD CONSTRAINT app_documents_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_notes app_notes_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_notes
    ADD CONSTRAINT app_notes_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: apps apps_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: contracts contracts_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id);


--
-- Name: contracts contracts_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: financial_entries financial_entries_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id);


--
-- Name: financial_entries financial_entries_dev_id_developers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_dev_id_developers_id_fk FOREIGN KEY (dev_id) REFERENCES public.developers(id);


--
-- Name: kanban_tasks kanban_tasks_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kanban_tasks
    ADD CONSTRAINT kanban_tasks_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id);


--
-- Name: kanban_tasks kanban_tasks_dev_id_developers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kanban_tasks
    ADD CONSTRAINT kanban_tasks_dev_id_developers_id_fk FOREIGN KEY (dev_id) REFERENCES public.developers(id);


--
-- Name: leads leads_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: payments payments_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: payments payments_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: proposals proposals_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: proposals proposals_lead_id_leads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_lead_id_leads_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: repo_files repo_files_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repo_files
    ADD CONSTRAINT repo_files_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_permission_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.permission_roles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CnYY7HKDoKxty8yFABf33nBQF6w4xpNexRBVEegr6O6Kc5iCIad3YiFldLUorNR

