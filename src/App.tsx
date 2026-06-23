import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  Bug,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Command,
  DatabaseZap,
  FileCode2,
  Filter,
  GitBranch,
  GitCompareArrows,
  Github,
  Home,
  Linkedin,
  ListFilter,
  Moon,
  Network,
  PanelsTopLeft,
  PlayCircle,
  Route,
  ScanSearch,
  Search,
  ShieldAlert,
  Sparkles,
  Tags,
  TimerReset,
  Workflow,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  campaigns as baseCampaigns,
  discrepancyRows,
  events as baseEvents,
  funnel as baseFunnel,
  incidents as baseIncidents,
  leads as baseLeads,
  metrics as baseMetrics,
  performanceSeries as basePerformanceSeries,
  qualityIssues as baseQualityIssues,
  workflowLogs as baseWorkflowLogs,
} from "./data/mockData";
import type { AlertRecord, Campaign, EventRecord, Incident, IncidentType, Lead, Metric, NavItem, QualityIssue } from "./types";

const navItems: NavItem[] = [
  { id: "overview", label: "Workspace analitico", icon: Home },
  { id: "campaigns", label: "Campanhas", icon: BarChart3 },
  { id: "funnel", label: "Funil", icon: Route },
  { id: "attribution", label: "Atribuicao", icon: GitBranch },
  { id: "root-cause", label: "Investigacao raiz", icon: ScanSearch },
  { id: "gtm-preview", label: "Simulador GTM", icon: Tags },
  { id: "tracking-plan", label: "Plano de rastreamento", icon: FileCode2 },
  { id: "sql-explorer", label: "Explorador SQL", icon: DatabaseZap },
  { id: "discrepancies", label: "Discrepancias", icon: GitCompareArrows },
  { id: "events", label: "Eventos", icon: Bug },
  { id: "lead-journey", label: "Jornada do lead", icon: TimerReset },
  { id: "data-quality", label: "Qualidade dos dados", icon: ShieldAlert },
  { id: "workflow", label: "Workflow", icon: Workflow },
  { id: "incidents", label: "Incidentes", icon: AlertTriangle },
  { id: "technical", label: "Visao tecnica", icon: FileCode2 },
];

const workflowNodes: Node[] = [
  { id: "webhook", type: "input", position: { x: 0, y: 80 }, data: { label: "Webhook" } },
  { id: "validation", position: { x: 180, y: 20 }, data: { label: "Validation" } },
  { id: "normalization", position: { x: 180, y: 140 }, data: { label: "Normalization" } },
  { id: "duplicate", position: { x: 390, y: 80 }, data: { label: "Duplicate check" } },
  { id: "crm", position: { x: 620, y: 0 }, data: { label: "CRM" } },
  { id: "capi", position: { x: 620, y: 105 }, data: { label: "Conversion API" } },
  { id: "analytics", position: { x: 620, y: 210 }, data: { label: "Analytics DB" } },
  { id: "workspace", type: "output", position: { x: 870, y: 105 }, data: { label: "Workspace analitico" } },
];

const workflowEdges: Edge[] = [
  { id: "e1", source: "webhook", target: "validation", animated: true },
  { id: "e2", source: "webhook", target: "normalization", animated: true },
  { id: "e3", source: "validation", target: "duplicate" },
  { id: "e4", source: "normalization", target: "duplicate" },
  { id: "e5", source: "duplicate", target: "crm" },
  { id: "e6", source: "duplicate", target: "capi", animated: true },
  { id: "e7", source: "duplicate", target: "analytics" },
  { id: "e8", source: "crm", target: "workspace" },
  { id: "e9", source: "capi", target: "workspace" },
  { id: "e10", source: "analytics", target: "workspace" },
];

type DrawerState =
  | { kind: "lead"; item: Lead }
  | { kind: "event"; item: EventRecord }
  | { kind: "quality"; item: QualityIssue }
  | { kind: "incident"; item: Incident }
  | { kind: "campaign"; item: Campaign }
  | { kind: "trackingPlan"; item: TrackingPlanEvent }
  | { kind: "rootCause"; item: RootCause }
  | { kind: "gtmPreview"; item: GtmPreviewEvent }
  | { kind: "workflow"; item: string }
  | null;

type OperationsState = {
  metrics: Metric[];
  campaigns: Campaign[];
  funnel: typeof baseFunnel;
  performanceSeries: typeof basePerformanceSeries;
  leads: Lead[];
  events: EventRecord[];
  qualityIssues: QualityIssue[];
  incidents: Incident[];
  alerts: AlertRecord[];
  workflowLogs: string[];
};

const incidentTypes: IncidentType[] = [
  "duplicate lead",
  "crm sync failure",
  "missing utm",
  "broken webhook",
  "meta conversion api error",
  "attribution mismatch",
];

const storageKey = "growth-intelligence-center.operations.v1";

const initialOperationsState: OperationsState = {
  metrics: baseMetrics,
  campaigns: baseCampaigns,
  funnel: baseFunnel,
  performanceSeries: basePerformanceSeries,
  leads: baseLeads,
  events: baseEvents,
  qualityIssues: baseQualityIssues,
  incidents: baseIncidents,
  alerts: [
    {
      id: "alert_inc_1048",
      title: "Discrepancia de leads detectada",
      message: "Meta Ads registra 100 leads; o workspace analitico registra 130. Variancia: +30%.",
      severity: "sev2",
      incidentId: "inc_1048",
      createdAt: "2026-06-22 09:20",
      status: "active",
    },
  ],
  workflowLogs: baseWorkflowLogs,
};

type RootCause = {
  id: string;
  label: string;
  value: number;
  color: string;
  severity: "critical" | "warning" | "pending";
  evidence: string[];
  impact: string;
  root: string;
  resolution: string;
};

type GtmPreviewEvent = {
  id: string;
  name: string;
  timestamp: string;
  eventId: string;
  status: "success" | "warning" | "failed";
  trigger: string;
  tagsFired: string[];
  tagsNotFired: string[];
  destination: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  sessionId: string;
  anonymousId: string;
  leadId: string;
  parameters: Record<string, string | number | boolean>;
  variables: Record<string, string | number | boolean | null>;
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
  error: string | null;
  warnings?: string[];
};

type TrackingPlanEvent = {
  eventName: string;
  trigger: string;
  description: string;
  parameters: string[];
  destination: string[];
  owner: string;
  status: "active" | "draft" | "deprecated" | "needs review";
  objective: string;
  expectedPayload: Record<string, unknown>;
  requiredFields: string[];
  examples: string[];
  validationRules: string[];
};

type SqlQueryCategory = "campaign performance" | "lead attribution" | "data quality" | "event tracking" | "incident investigation";

type SqlExplorerQuery = {
  id: string;
  title: string;
  category: SqlQueryCategory;
  description: string;
  objective: string;
  expectedResult: string;
  tables: string[];
  owner: string;
  updatedAt: string;
  sql: string;
};

const sqlExplorerQueries: SqlExplorerQuery[] = [
  {
    id: "top-campaigns",
    title: "Top campaigns",
    category: "campaign performance",
    description: "Ranks paid campaigns by revenue, ROAS and qualified lead volume for the selected reporting window.",
    objective: "Identify campaigns that are producing efficient revenue and deserve budget review.",
    expectedResult: "One row per campaign with spend, leads, sales, revenue, CPL, conversion rate and ROAS.",
    tables: ["mart_campaign_performance", "dim_campaign", "fact_revenue"],
    owner: "Growth Analytics",
    updatedAt: "2026-06-23",
    sql: `with campaign_revenue as (
  select
    campaign_id,
    sum(revenue_usd) as revenue_usd,
    count(distinct sale_id) as sales
  from fact_revenue
  where closed_at >= date '2026-06-01'
    and closed_at < date '2026-06-24'
  group by 1
),
campaign_leads as (
  select
    campaign_id,
    count(distinct lead_id) as leads,
    count(distinct case when lifecycle_stage = 'qualified' then lead_id end) as qualified_leads
  from mart_lead_attribution
  where first_touch_at >= date '2026-06-01'
    and first_touch_at < date '2026-06-24'
  group by 1
)
select
  c.campaign_name,
  c.channel,
  p.spend_usd,
  l.leads,
  l.qualified_leads,
  coalesce(r.sales, 0) as sales,
  coalesce(r.revenue_usd, 0) as revenue_usd,
  round(p.spend_usd / nullif(l.leads, 0), 2) as cpl,
  round(l.qualified_leads::numeric / nullif(l.leads, 0), 4) as qualified_rate,
  round(coalesce(r.revenue_usd, 0) / nullif(p.spend_usd, 0), 2) as roas
from mart_campaign_performance p
join dim_campaign c using (campaign_id)
left join campaign_leads l using (campaign_id)
left join campaign_revenue r using (campaign_id)
order by roas desc, revenue_usd desc
limit 20;`,
  },
  {
    id: "duplicate-leads",
    title: "Duplicate leads",
    category: "data quality",
    description: "Finds lead records that share normalized email, phone or event_id before CRM merge resolution.",
    objective: "Quantify duplicate pressure and isolate records that can inflate analytical workspaces.",
    expectedResult: "Duplicate clusters with canonical lead, duplicate count, campaigns and first/last seen timestamps.",
    tables: ["fact_leads", "fact_events", "dim_campaign"],
    owner: "Analytics Engineering",
    updatedAt: "2026-06-22",
    sql: `with lead_keys as (
  select
    l.lead_id,
    lower(trim(l.email_sha256)) as email_key,
    nullif(l.phone_sha256, '') as phone_key,
    e.event_id,
    l.campaign_id,
    l.created_at
  from fact_leads l
  left join fact_events e
    on e.lead_id = l.lead_id
   and e.event_name = 'lead_submit'
  where l.created_at >= current_date - interval '14 days'
),
clusters as (
  select
    coalesce(email_key, phone_key, event_id) as duplicate_key,
    count(distinct lead_id) as duplicate_count,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at,
    min(lead_id) as canonical_lead_id
  from lead_keys
  group by 1
  having count(distinct lead_id) > 1
)
select
  c.duplicate_key,
  c.canonical_lead_id,
  c.duplicate_count,
  string_agg(distinct d.campaign_name, ', ') as campaigns,
  c.first_seen_at,
  c.last_seen_at
from clusters c
join lead_keys lk
  on coalesce(lk.email_key, lk.phone_key, lk.event_id) = c.duplicate_key
left join dim_campaign d using (campaign_id)
group by 1, 2, 3, 5, 6
order by duplicate_count desc, last_seen_at desc;`,
  },
  {
    id: "missing-utms",
    title: "Missing UTMs",
    category: "data quality",
    description: "Audits landing sessions and leads without required UTM or click identifiers.",
    objective: "Detect attribution gaps caused by missing source, medium, campaign, fbclid or gclid values.",
    expectedResult: "Daily missing UTM counts by landing page, channel inference and affected campaign.",
    tables: ["fact_sessions", "fact_leads", "dim_landing_page"],
    owner: "Growth Analytics",
    updatedAt: "2026-06-21",
    sql: `select
  date_trunc('day', s.started_at) as session_date,
  lp.page_path,
  coalesce(s.utm_source, 'unknown') as utm_source,
  coalesce(s.utm_medium, 'unknown') as utm_medium,
  count(distinct s.session_id) as sessions,
  count(distinct l.lead_id) as leads,
  count(distinct case
    when s.utm_campaign is null
      and s.gclid is null
      and s.fbclid is null
    then s.session_id
  end) as missing_attribution_sessions
from fact_sessions s
left join fact_leads l using (session_id)
left join dim_landing_page lp using (landing_page_id)
where s.started_at >= date '2026-06-01'
  and s.started_at < date '2026-06-24'
group by 1, 2, 3, 4
having count(distinct case
  when s.utm_campaign is null
    and s.gclid is null
    and s.fbclid is null
  then s.session_id
end) > 0
order by missing_attribution_sessions desc;`,
  },
  {
    id: "failed-conversion-api-events",
    title: "Failed conversion API events",
    category: "event tracking",
    description: "Lists server-side conversion events rejected by Meta or Google with payload diagnostics.",
    objective: "Support conversion API reliability monitoring and replay decisions.",
    expectedResult: "Failed event records with destination, error code, retry count, campaign and lead context.",
    tables: ["fact_events", "fact_leads", "dim_campaign", "event_delivery_attempts"],
    owner: "Marketing Engineering",
    updatedAt: "2026-06-23",
    sql: `select
  e.event_id,
  e.event_name,
  e.lead_id,
  c.campaign_name,
  a.destination,
  a.response_code,
  a.error_code,
  a.error_message,
  a.retry_count,
  a.last_attempt_at
from fact_events e
join event_delivery_attempts a
  on a.event_id = e.event_id
left join fact_leads l
  on l.lead_id = e.lead_id
left join dim_campaign c
  on c.campaign_id = l.campaign_id
where e.event_name in ('meta_conversion_sent', 'meta_conversion_failed')
  and a.delivery_status = 'failed'
  and a.last_attempt_at >= current_timestamp - interval '48 hours'
order by a.last_attempt_at desc;`,
  },
  {
    id: "crm-mismatches",
    title: "CRM mismatches",
    category: "incident investigation",
    description: "Compares CRM lifecycle state against analytics lead state to identify reconciliation issues.",
    objective: "Find records where CRM accepted or updated a contact but analytics models disagree.",
    expectedResult: "Lead-level mismatches with CRM status, analytics status, owner pool and last sync time.",
    tables: ["fact_leads", "crm_contacts", "mart_lead_lifecycle"],
    owner: "RevOps",
    updatedAt: "2026-06-20",
    sql: `select
  l.lead_id,
  crm.crm_id,
  crm.lifecycle_stage as crm_lifecycle_stage,
  m.lifecycle_stage as analytics_lifecycle_stage,
  crm.owner_pool,
  crm.updated_at as crm_updated_at,
  m.model_updated_at,
  case
    when crm.lifecycle_stage <> m.lifecycle_stage then 'stage_mismatch'
    when crm.crm_id is null then 'missing_crm_contact'
    when m.lead_id is null then 'missing_analytics_record'
  end as mismatch_reason
from fact_leads l
left join crm_contacts crm
  on crm.email_sha256 = l.email_sha256
left join mart_lead_lifecycle m
  on m.lead_id = l.lead_id
where l.created_at >= current_date - interval '30 days'
  and (
    crm.crm_id is null
    or m.lead_id is null
    or crm.lifecycle_stage <> m.lifecycle_stage
  )
order by coalesce(crm.updated_at, m.model_updated_at) desc;`,
  },
  {
    id: "conversion-funnel",
    title: "Conversion funnel",
    category: "lead attribution",
    description: "Builds the acquisition funnel from impressions through sales using governed stage definitions.",
    objective: "Measure stage conversion and identify where acquisition quality or instrumentation breaks down.",
    expectedResult: "Ordered funnel stages with users, stage-to-stage conversion and cumulative conversion.",
    tables: ["fact_ad_delivery", "fact_sessions", "fact_events", "fact_leads", "fact_revenue"],
    owner: "Analytics Engineering",
    updatedAt: "2026-06-23",
    sql: `with funnel as (
  select '01_impressions' as stage, count(*) as records from fact_ad_delivery
  where served_at >= date '2026-06-01'
  union all
  select '02_clicks', count(*) from fact_ad_delivery
  where clicked_at >= date '2026-06-01'
  union all
  select '03_visitors', count(distinct session_id) from fact_sessions
  where started_at >= date '2026-06-01'
  union all
  select '04_form_starts', count(distinct session_id) from fact_events
  where event_name = 'form_start'
    and occurred_at >= date '2026-06-01'
  union all
  select '05_lead_submits', count(distinct lead_id) from fact_leads
  where created_at >= date '2026-06-01'
  union all
  select '06_sales', count(distinct sale_id) from fact_revenue
  where closed_at >= date '2026-06-01'
),
ranked as (
  select
    stage,
    records,
    lag(records) over (order by stage) as previous_records,
    first_value(records) over (order by stage) as entry_records
  from funnel
)
select
  stage,
  records,
  round(records::numeric / nullif(previous_records, 0), 4) as stage_conversion_rate,
  round(records::numeric / nullif(entry_records, 0), 4) as cumulative_conversion_rate
from ranked
order by stage;`,
  },
];

const trackingPlanEvents: TrackingPlanEvent[] = [
  {
    eventName: "page_view",
    trigger: "Every route change after consent is resolved",
    description: "Base navigation event used for session stitching and page-level diagnostics.",
    parameters: ["page_location", "page_title", "referrer", "anonymous_id", "consent_state"],
    destination: ["GA4", "Analytics DB"],
    owner: "Analytics Engineering",
    status: "active",
    objective: "Establish a reliable page timeline before campaign, form and conversion events are attached.",
    expectedPayload: { event: "page_view", page_location: "/webinar-growth", page_title: "Growth Webinar", anonymous_id: "anon_44f891", consent_state: "granted" },
    requiredFields: ["event", "page_location", "anonymous_id", "consent_state"],
    examples: ["User lands on /webinar-growth from a paid social ad.", "User navigates from pricing to checkout in the same session."],
    validationRules: ["page_location must start with / or https://.", "anonymous_id must exist before dispatch.", "Do not send when analytics consent is denied."],
  },
  {
    eventName: "landing_page_view",
    trigger: "First marketing landing page render per session",
    description: "Captures acquisition context, landing variant and campaign identifiers.",
    parameters: ["landing_variant", "utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid", "session_id"],
    destination: ["Analytics DB", "Attribution model"],
    owner: "Growth Analytics",
    status: "active",
    objective: "Preserve the original acquisition context used by attribution and campaign quality reports.",
    expectedPayload: { event: "landing_page_view", landing_variant: "v2-pricing-proof", utm_source: "meta", utm_medium: "paid_social", utm_campaign: "jun_webinar_scale", session_id: "sess_8c2a9d" },
    requiredFields: ["event", "landing_variant", "session_id"],
    examples: ["Paid visitor opens a course landing page.", "Organic visitor opens a lead magnet page with no click id."],
    validationRules: ["Keep raw UTM values unchanged.", "At least one of utm_source, referrer, fbclid or gclid must be present.", "landing_variant must match the experiment registry."],
  },
  {
    eventName: "form_start",
    trigger: "First focus or input in a lead capture form",
    description: "Measures intent before submission and supports form abandonment analysis.",
    parameters: ["form_id", "field_count", "landing_variant", "session_id", "anonymous_id"],
    destination: ["GA4", "Analytics DB"],
    owner: "Growth Product",
    status: "active",
    objective: "Understand where qualified traffic starts a lead flow but does not submit.",
    expectedPayload: { event: "form_start", form_id: "lead_capture_primary", field_count: 5, session_id: "sess_8c2a9d", anonymous_id: "anon_44f891" },
    requiredFields: ["event", "form_id", "session_id", "anonymous_id"],
    examples: ["Visitor clicks into the email field.", "Visitor selects a course option in a multi-step form."],
    validationRules: ["Fire once per form_id per session.", "field_count must be a positive number.", "form_id must be listed in the tracking registry."],
  },
  {
    eventName: "lead_submit",
    trigger: "Lead form successfully validates client-side and posts to webhook",
    description: "Canonical lead creation intent event with identifiers for dedupe and downstream sync.",
    parameters: ["lead_id", "form_id", "email_sha256", "phone_sha256", "event_id", "utm_campaign"],
    destination: ["Webhook", "Analytics DB", "Meta CAPI"],
    owner: "Marketing Engineering",
    status: "active",
    objective: "Create the auditable bridge between frontend submission, CRM contact and conversion APIs.",
    expectedPayload: { event: "lead_submit", lead_id: "lead_10293", form_id: "lead_capture_primary", event_id: "evt_ls_57b2da", email_sha256: "9f86d081884c" },
    requiredFields: ["event", "lead_id", "form_id", "event_id", "email_sha256"],
    examples: ["A webinar lead submits the primary form.", "A checkout assistant lead submits a high-intent consultation request."],
    validationRules: ["event_id must be stable across browser and server destinations.", "PII must be hashed before dispatch.", "Reject payload when lead_id is missing."],
  },
  {
    eventName: "crm_sync_success",
    trigger: "CRM accepts create or update request",
    description: "Confirms that a lead is represented in the sales system with lifecycle metadata.",
    parameters: ["lead_id", "crm_id", "lifecycle_stage", "owner_pool", "sync_latency_ms"],
    destination: ["Analytics DB", "Workflow logs"],
    owner: "RevOps",
    status: "active",
    objective: "Make CRM acknowledgement measurable and reconcile lead counts with pipeline reporting.",
    expectedPayload: { event: "crm_sync_success", lead_id: "lead_10293", crm_id: "crm_55218", lifecycle_stage: "lead", sync_latency_ms: 842 },
    requiredFields: ["event", "lead_id", "crm_id", "lifecycle_stage"],
    examples: ["New lead creates contact crm_55218.", "Duplicate email updates an existing CRM contact."],
    validationRules: ["crm_id must be returned by CRM.", "sync_latency_ms must be captured for SLA reporting.", "lifecycle_stage must be one of lead, qualified, opportunity, customer."],
  },
  {
    eventName: "crm_sync_failed",
    trigger: "CRM request fails or exceeds retry budget",
    description: "Failure event for operational incident response and queue replay.",
    parameters: ["lead_id", "error_code", "retry_count", "queue_name", "last_attempt_at"],
    destination: ["Analytics DB", "Incident center", "Workflow logs"],
    owner: "RevOps",
    status: "active",
    objective: "Expose CRM sync failures before they silently damage follow-up and analytical counts.",
    expectedPayload: { event: "crm_sync_failed", lead_id: "lead_48321", error_code: "crm_timeout", retry_count: 3, queue_name: "crm-write" },
    requiredFields: ["event", "lead_id", "error_code", "retry_count"],
    examples: ["CRM API returns 500 after three retries.", "Required lifecycle field is rejected by CRM validation."],
    validationRules: ["retry_count must be numeric.", "Open an incident when retry_count >= 3.", "error_code must map to the incident taxonomy."],
  },
  {
    eventName: "meta_conversion_sent",
    trigger: "Server conversion request receives 2xx response from Meta",
    description: "Confirms successful dispatch of normalized conversion payload to Meta CAPI.",
    parameters: ["lead_id", "event_id", "event_name", "action_source", "match_keys", "response_code"],
    destination: ["Meta CAPI", "Analytics DB"],
    owner: "Marketing Engineering",
    status: "active",
    objective: "Measure platform conversion delivery and debug match quality.",
    expectedPayload: { event: "meta_conversion_sent", lead_id: "lead_10293", event_id: "evt_ls_57b2da", event_name: "Lead", action_source: "website", response_code: 200 },
    requiredFields: ["event", "lead_id", "event_id", "event_name", "action_source"],
    examples: ["Lead event accepted by Meta CAPI.", "Purchase event accepted after checkout success."],
    validationRules: ["event_id must match lead_submit for dedupe.", "action_source must be website for web leads.", "At least one hashed match key must be present."],
  },
  {
    eventName: "meta_conversion_failed",
    trigger: "Meta CAPI returns non-2xx or validation error",
    description: "Captures rejected server-side conversions for investigation and replay.",
    parameters: ["lead_id", "event_id", "error_code", "error_message", "retry_count"],
    destination: ["Analytics DB", "Incident center"],
    owner: "Marketing Engineering",
    status: "active",
    objective: "Prevent conversion loss by tracking rejected Meta server events with root-cause context.",
    expectedPayload: { event: "meta_conversion_failed", lead_id: "lead_10292", event_id: "lead_10292_form_submit", error_code: "2061006", retry_count: 1 },
    requiredFields: ["event", "lead_id", "event_id", "error_code"],
    examples: ["Meta rejects event because event_id conflicts with browser pixel.", "Meta rejects payload with missing hashed identifiers."],
    validationRules: ["Do not retry permanent validation errors more than once.", "Attach response body to workflow logs.", "Open a quality issue when failures exceed threshold."],
  },
  {
    eventName: "analytics_saved",
    trigger: "Normalized event is committed to warehouse fact table",
    description: "Warehouse acknowledgement used to validate ingestion completeness.",
    parameters: ["lead_id", "event_count", "table", "partition", "model_version"],
    destination: ["Analytics DB", "Workspace analitico"],
    owner: "Analytics Engineering",
    status: "active",
    objective: "Prove the event landed in the analytics model that powers reporting.",
    expectedPayload: { event: "analytics_saved", lead_id: "lead_10293", table: "fact_lead_events", partition: "2026-06-23", model_version: "lead_fact_v3" },
    requiredFields: ["event", "table", "partition", "model_version"],
    examples: ["Lead event written to fact_lead_events.", "CRM acknowledgement joined into lead lifecycle mart."],
    validationRules: ["partition must be ISO date.", "table must be approved for analytical consumption.", "model_version must be included for backfill audits."],
  },
  {
    eventName: "conversion_registered",
    trigger: "Lead becomes a qualified conversion in reporting model",
    description: "Business conversion event used for campaign optimization and revenue attribution.",
    parameters: ["lead_id", "conversion_type", "campaign_id", "attribution_model", "registered_at"],
    destination: ["Workspace analitico", "Attribution model", "Ads platforms"],
    owner: "Growth Analytics",
    status: "needs review",
    objective: "Define the governed moment when a lead counts as a conversion for business reporting.",
    expectedPayload: { event: "conversion_registered", lead_id: "lead_10293", conversion_type: "qualified_lead", campaign_id: "cmp_002", attribution_model: "last_paid_touch" },
    requiredFields: ["event", "lead_id", "conversion_type", "campaign_id", "attribution_model"],
    examples: ["Lead reaches qualified lifecycle stage.", "Purchase joins back to original acquisition campaign."],
    validationRules: ["conversion_type must be approved by RevOps.", "Do not register duplicate conversions for the same lead and type.", "Attribution model must match the active reporting contract."],
  },
];

function useOperationsState() {
  const [state, setState] = useState<OperationsState>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return initialOperationsState;
      return { ...initialOperationsState, ...JSON.parse(saved) } as OperationsState;
    } catch {
      return initialOperationsState;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}

function formatDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function createIncidentPackage(type: IncidentType, state: OperationsState): Pick<OperationsState, "leads" | "events" | "qualityIssues" | "incidents" | "alerts" | "workflowLogs" | "metrics" | "funnel" | "performanceSeries" | "campaigns"> {
  const now = new Date();
  const stamp = now.getTime().toString(36);
  const campaign = state.campaigns[Math.floor(Math.random() * state.campaigns.length)] ?? state.campaigns[0];
  const leadNumber = 20000 + Math.floor(Math.random() * 70000);
  const leadId = `lead_${leadNumber}`;
  const session = `ses_${stamp.slice(-5)}`;
  const incidentId = `inc_${stamp}`;
  const eventId = `evt_${stamp}`;
  const issueId = `q_${stamp}`;
  const openedAt = formatDateTime(now);

  const scenario = scenarioByType(type, campaign, leadId, session);
  const lead: Lead = {
    id: leadId,
    name: scenario.leadName,
    email: scenario.email,
    campaign: campaign.name,
    channel: campaign.channel,
    utmSource: scenario.utmSource,
    utmMedium: scenario.utmMedium,
    utmCampaign: scenario.utmCampaign,
    firstTouch: openedAt,
    lastTouch: openedAt,
    crmStatus: scenario.crmStatus,
    conversionStatus: scenario.conversionStatus,
    revenue: 0,
    session,
  };

  const event: EventRecord = {
    id: eventId,
    name: scenario.eventName,
    timestamp: openedAt,
    leadId,
    leadName: lead.name,
    session,
    status: "failed",
    destination: scenario.destination,
    payload: scenario.payload,
    response: scenario.response,
    error: scenario.error,
  };

  const qualityIssue: QualityIssue = {
    id: issueId,
    label: scenario.qualityLabel,
    value: scenario.issueValue,
    delta: `+${scenario.issueValue} generated by simulator`,
    health: scenario.severity === "sev1" ? "critical" : "warning",
    description: scenario.qualityDescription,
    affected: [campaign.name, lead.id],
  };

  const incident: Incident = {
    id: incidentId,
    type,
    title: scenario.title,
    severity: scenario.severity,
    impact: scenario.impact,
    status: "open",
    owner: scenario.owner,
    openedAt,
    resolution: scenario.resolution,
    affectedLeadId: leadId,
    relatedEventIds: [eventId],
    relatedQualityIssueId: issueId,
    logs: scenario.logs.map((log) => `${openedAt} ${log}`),
    evidence: scenario.evidence,
  };

  const alert: AlertRecord = {
    id: `alert_${incidentId}`,
    title: scenario.alertTitle,
    message: scenario.alertMessage,
    severity: scenario.severity,
    incidentId,
    createdAt: openedAt,
    status: "active",
  };

  const severityWeight = scenario.severity === "sev1" ? 18 : scenario.severity === "sev2" ? 10 : 5;

  return {
    leads: [lead, ...state.leads],
    events: [event, ...state.events],
    qualityIssues: [qualityIssue, ...state.qualityIssues],
    incidents: [incident, ...state.incidents],
    alerts: [alert, ...state.alerts],
    workflowLogs: [...incident.logs!, ...state.workflowLogs],
    metrics: state.metrics.map((metric) => {
      if (metric.label === "Leads") {
        const currentLeads = Number(metric.value.replace(/,/g, ""));
        return { ...metric, value: (currentLeads + severityWeight).toLocaleString("en-US"), change: `+${30 + severityWeight} sem explicação`, tone: "bad" };
      }
      if (metric.label === "Conversao") return { ...metric, value: `${Math.max(4.8, 5.67 - (state.incidents.length + 1) * 0.08).toFixed(2)}%`, change: `-${(0.3 + severityWeight / 100).toFixed(2)}pp`, tone: "bad" };
      return metric;
    }),
    funnel: state.funnel.map((step) => step.stage === "Envios de lead" ? { ...step, value: step.value + severityWeight } : step.stage === "CRM recebido" || step.stage === "Conversao registrada" ? { ...step, value: Math.max(0, step.value - severityWeight) } : step),
    performanceSeries: state.performanceSeries.map((point, index, rows) => index === rows.length - 1 ? { ...point, leads: point.leads + severityWeight, revenue: Math.max(0, point.revenue - severityWeight * 120) } : point),
    campaigns: state.campaigns.map((item) => item.id === campaign.id ? { ...item, quality: scenario.severity === "sev1" ? "critical" : "warning" } : item),
  };
}

function scenarioByType(type: IncidentType, campaign: Campaign, leadId: string, session: string) {
  const seed = Math.floor(Math.random() * 9000) + 1000;
  const base = {
    leadName: ["Mariana Alves", "Pedro Martins", "Nina Duarte", "Andre Ribeiro", "Sofia Mendes"][seed % 5],
    email: `lead.${seed}@example.com`,
    utmSource: campaign.channel === "Google Ads" ? "google" : "facebook",
    utmMedium: campaign.channel === "Google Ads" ? "cpc" : "paid_social",
    utmCampaign: campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    owner: type.includes("crm") ? "RevOps" : type.includes("webhook") ? "Marketing Engineering" : "Growth Ops",
  };

  const cases: Record<IncidentType, ReturnType<typeof scenarioDetails>> = {
    "duplicate lead": scenarioDetails("Duplicate lead created before CRM merge", "Duplicate leads", "LeadSubmitted", "CRM", "deduplication_conflict", "sev2"),
    "crm sync failure": scenarioDetails("CRM sync failure blocked lead creation", "CRM sync failures", "CRMContactCreated", "CRM", "crm_timeout", "sev1"),
    "missing utm": scenarioDetails("Lead submitted without required UTM parameters", "Missing UTMs", "LeadSubmitted", "Analytics DB", "utm_campaign_missing", "sev3"),
    "broken webhook": scenarioDetails("Webhook endpoint returned 500 during intake", "Broken webhooks", "WebhookDelivered", "Webhook", "endpoint_500", "sev1"),
    "meta conversion api error": scenarioDetails("Meta Conversion API rejected server event", "Conversion API errors", "MetaConversionSent", "Meta CAPI", "meta_capi_rejected", "sev2"),
    "attribution mismatch": scenarioDetails("Attribution model assigned lead to conflicting campaign", "Attribution mismatches", "AttributionResolved", "Analytics DB", "campaign_mapping_mismatch", "sev2"),
  };

  const detail = cases[type];
  return {
    ...base,
    ...detail,
    crmStatus: type === "crm sync failure" || type === "broken webhook" ? "Rejected" as const : type === "duplicate lead" ? "Duplicated" as const : "Created" as const,
    conversionStatus: type === "meta conversion api error" ? "Failed" as const : type === "duplicate lead" ? "Deduped" as const : "Missing" as const,
    payload: {
      lead_id: leadId,
      session_id: session,
      campaign_id: campaign.id,
      incident_type: type,
      utm_source: type === "missing utm" ? null : base.utmSource,
      utm_campaign: type === "missing utm" ? null : base.utmCampaign,
    },
    response: { status: detail.severity === "sev1" ? 500 : 400, code: detail.errorCode, retryable: detail.severity !== "sev3" },
  };
}

function scenarioDetails(title: string, qualityLabel: string, eventName: string, destination: EventRecord["destination"], errorCode: string, severity: "sev1" | "sev2" | "sev3") {
  const issueValue = severity === "sev1" ? 12 : severity === "sev2" ? 7 : 4;
  return {
    title,
    qualityLabel,
    eventName,
    destination,
    errorCode,
    severity,
    issueValue,
    alertTitle: title,
    alertMessage: `${qualityLabel} increased by ${issueValue} records and opened a linked incident.`,
    impact: `${issueValue} lead records require investigation before workspace reconciliation can be trusted.`,
    error: `${errorCode}: generated incident simulator failure`,
    qualityDescription: `${qualityLabel} detected by the incident simulator and linked to an operational incident.`,
    resolution: "Investigate related event payloads, correct the source system, replay the failed record and resolve the incident after validation.",
    evidence: [
      `${eventName} returned ${errorCode}.`,
      "Workspace indicators were recalculated after the generated anomaly.",
      "A linked lead, event failure, quality issue, alert and workflow log were created together.",
    ],
    logs: [
      `incident simulator generated ${errorCode}`,
      `${eventName} failed and attached to investigation record`,
      `quality issue opened for ${qualityLabel}`,
      "workspace indicators recalculated",
    ],
  };
}

const problemItems = ["leads duplicados", "desvio de atribuicao", "utms ausentes", "inconsistencias no crm", "anomalias na conversion api"];

const solutionModules = [
  ["Marketing analytics", "Mostra se o investimento está gerando retorno."],
  ["Centro de atribuição", "Explica de onde cada lead veio."],
  ["Debugger de eventos", "Mostra se um evento foi enviado, duplicado ou falhou."],
  ["Centro de incidentes", "Organiza o que aconteceu, o impacto e a correção."],
  ["Qualidade dos dados", "Encontra inconsistências antes que virem decisões erradas."],
  ["Workflow de integrações", "Mostra como anúncios, CRM e analytics se conectam."],
];

const architectureSteps = ["ads", "landing page", "formulario", "webhook", "crm", "conversion api", "analytics", "workspace"];

const technicalSkills = [
  "marketing analytics",
  "attribution",
  "rastreamento",
  "data quality",
  "crm integrations",
  "sql",
  "automação",
  "observabilidade",
  "gtm",
  "meta ads",
  "google ads",
];

const rootCauses: RootCause[] = [
  {
    id: "duplicate-events",
    label: "Eventos duplicados",
    value: 18,
    color: "#fb7185",
    severity: "critical",
    evidence: [
      "18 leads aparecem mais de uma vez.",
      "O mesmo event_id foi enviado pelo pixel e pelo webhook.",
      "O CRM juntou contatos duplicados depois da entrada no analytics.",
    ],
    impact: "+18 leads inflados. CPL, conversão e qualidade da campanha ficam melhores do que realmente são.",
    root: "O workspace contou eventos brutos antes de aplicar a deduplicação do CRM.",
    resolution: "Deduplicar por event_id e email hash antes da contagem final.",
  },
  {
    id: "organic-attribution",
    label: "Leads orgânicos atribuídos ao Meta",
    value: 7,
    color: "#f59e0b",
    severity: "warning",
    evidence: [
      "7 leads vieram como orgânicos.",
      "Eles herdaram uma campanha paga antiga.",
      "Esses leads não tinham click id do Meta.",
    ],
    impact: "+7 leads aparecem no Meta sem existir no relatório da plataforma.",
    root: "A regra de atribuição priorizou uma campanha paga antiga.",
    resolution: "Resetar a atribuição paga quando uma nova sessão orgânica não tiver click id.",
  },
  {
    id: "attribution-delay",
    label: "Atraso na atribuição",
    value: 5,
    color: "#8b5cf6",
    severity: "pending",
    evidence: [
      "5 leads entraram antes do Meta terminar a conferência.",
      "O matching da plataforma atrasou algumas horas.",
      "Esses registros não eram duplicados.",
    ],
    impact: "+5 leads ficam temporariamente sem explicação.",
    root: "O workspace atualiza rápido, mas o Meta pode demorar até 6 horas.",
    resolution: "Criar uma fila de pendentes e só fechar a variação depois da janela de matching.",
  },
];

const rootCauseTimeline = [
  { time: "09:12", signal: "Variância detectada", expected: 100, reported: 130 },
  { time: "09:21", signal: "Cluster duplicado isolado", expected: 100, reported: 112 },
  { time: "09:34", signal: "Atribuição orgânica isolada", expected: 100, reported: 105 },
  { time: "09:46", signal: "Bucket de atraso separado", expected: 100, reported: 100 },
];

const gtmPreviewEvents: GtmPreviewEvent[] = [
  {
    id: "gtm-1",
    name: "page_view",
    timestamp: "10:42:01.118",
    eventId: "evt_pv_9f3a21",
    status: "success",
    trigger: "History change / initial page load",
    tagsFired: ["GA4 - page_view", "Analytics DB - raw page event"],
    tagsNotFired: ["Meta CAPI - Lead", "CRM webhook"],
    destination: "Google Analytics 4",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "pending",
    parameters: { page_location: "/webinar-growth", page_title: "Growth Webinar", debug_mode: true },
    variables: { page_path: "/webinar-growth", consent_state: "granted", debug_mode: true, event_source: "browser" },
    payload: { event: "page_view", page: { path: "/webinar-growth", referrer: "https://facebook.com/" }, consent: { analytics_storage: "granted" } },
    response: { status: 204, message: "Collected" },
    error: null,
  },
  {
    id: "gtm-2",
    name: "landing_page_view",
    timestamp: "10:42:02.406",
    eventId: "evt_lpv_42ce19",
    status: "success",
    trigger: "Landing page initialized",
    tagsFired: ["Analytics DB - landing_page_view", "Attribution - capture first touch"],
    tagsNotFired: ["CRM webhook", "Meta CAPI - Lead"],
    destination: "Analytics DB",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "pending",
    parameters: { landing_variant: "v2-pricing-proof", viewport: "desktop", scroll_depth: 0 },
    variables: { campaign_id: "cmp_003", fbclid: "fbclid_238612900", gclid: null, landing_variant: "v2-pricing-proof" },
    payload: { event: "landing_page_view", campaign_id: "cmp_9812", adset_id: "as_2231", placement: "feed" },
    response: { status: 200, row_id: "raw_772019", warehouse: "accepted" },
    error: null,
  },
  {
    id: "gtm-3",
    name: "form_start",
    timestamp: "10:42:17.884",
    eventId: "evt_fs_a113f0",
    status: "warning",
    trigger: "First input on lead_capture_primary",
    tagsFired: ["GA4 - form_start", "Analytics DB - form_start"],
    tagsNotFired: ["Google Ads enhanced conversion", "Meta CAPI - Lead"],
    destination: "Google Ads",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "pending",
    parameters: { form_id: "lead_capture_primary", field_count: 5, enhanced_conversions_ready: false },
    variables: { form_id: "lead_capture_primary", email_sha256: null, phone_sha256: null, enhanced_conversions_ready: false },
    payload: { event: "form_start", form: { id: "lead_capture_primary", step: 1 }, identifiers: { email_sha256: null } },
    response: { status: 202, message: "Accepted without enhanced conversion identifiers" },
    error: "Missing hashed email until lead_submit.",
  },
  {
    id: "gtm-4",
    name: "lead_submit",
    timestamp: "10:43:04.551",
    eventId: "evt_ls_57b2da",
    status: "success",
    trigger: "Form submit success",
    tagsFired: ["Webhook - lead_submit", "Analytics DB - lead_submit", "Meta Pixel - Lead"],
    tagsNotFired: ["CRM sync success", "Meta CAPI - server lead"],
    destination: "Webhook",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "lead_10293",
    parameters: { form_id: "lead_capture_primary", email_sha256: "9f86d081884c", phone_sha256: "1f40fc92da24", value: 0 },
    variables: { form_id: "lead_capture_primary", event_id: "evt_ls_57b2da", email_sha256: "9f86d081884c", session_id: "sess_8c2a9d" },
    payload: { event: "lead_submit", lead_id: "lead_10293", form_id: "lead_capture_primary", event_id: "evt_ls_57b2da" },
    response: { status: 201, contact_id: "crm_55218", dedupe_key: "email_phone" },
    error: null,
  },
  {
    id: "gtm-4b",
    name: "lead_submit",
    timestamp: "10:43:05.210",
    eventId: "evt_ls_57b2da",
    status: "warning",
    trigger: "Thank-you page reload replayed dataLayer event",
    tagsFired: ["Analytics DB - lead_submit"],
    tagsNotFired: ["Webhook - lead_submit", "Meta Pixel - Lead", "Meta CAPI - server lead"],
    destination: "Analytics DB",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "lead_10293",
    parameters: { form_id: "lead_capture_primary", email_sha256: "9f86d081884c", phone_sha256: "1f40fc92da24", value: 0, duplicate_candidate: true },
    variables: { form_id: "lead_capture_primary", event_id: "evt_ls_57b2da", email_sha256: "9f86d081884c", session_id: "sess_8c2a9d", page_refreshed: true },
    payload: { event: "lead_submit", lead_id: "lead_10293", form_id: "lead_capture_primary", event_id: "evt_ls_57b2da", duplicate_candidate: true },
    response: { status: 202, warehouse: "accepted", duplicate_guard: "not_applied", note: "Raw analytics accepted duplicate lead_submit before model dedupe." },
    error: null,
    warnings: ["Duplicate lead_submit detected with the same event_id, email hash and session_id.", "Likely caused by a thank-you page reload replaying the dataLayer event."],
  },
  {
    id: "gtm-5",
    name: "crm_sync_success",
    timestamp: "10:43:06.019",
    eventId: "evt_crm_883d1c",
    status: "success",
    trigger: "Webhook acknowledged by CRM",
    tagsFired: ["CRM - contact created", "Analytics DB - crm_sync_success"],
    tagsNotFired: ["Incident center - crm_sync_failed"],
    destination: "CRM",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "lead_10293",
    parameters: { contact_id: "crm_55218", lifecycle_stage: "lead", owner_pool: "sdr-br" },
    variables: { contact_id: "crm_55218", lifecycle_stage: "lead", owner_pool: "sdr-br", sync_latency_ms: 842 },
    payload: { event: "crm_sync_success", lead_id: "lead_10293", contact_id: "crm_55218", source: "webhook" },
    response: { status: 200, message: "Contact created", latency_ms: 842 },
    error: null,
  },
  {
    id: "gtm-6",
    name: "meta_conversion_sent",
    timestamp: "10:43:07.337",
    eventId: "evt_meta_0042fd",
    status: "failed",
    trigger: "Server-side lead conversion dispatch",
    tagsFired: ["Analytics DB - conversion failure log"],
    tagsNotFired: ["Meta CAPI - Lead accepted", "Workspace - conversion_registered"],
    destination: "Meta CAPI",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "lead_10293",
    parameters: { event_name: "Lead", action_source: "website", dedupe_source: "server", retry_count: 1 },
    variables: { event_id: "evt_ls_57b2da", email_sha256: "9f86d081884c", action_source: "website", retry_count: 1 },
    payload: { event_name: "Lead", event_id: "evt_ls_57b2da", user_data: { em: "9f86d081884c", ph: "1f40fc92da24" } },
    response: { status: 400, code: 2061006, message: "Duplicate event_id received outside expected source map" },
    error: "Meta rejected the server event because the browser event_id was mapped to a different container.",
  },
  {
    id: "gtm-7",
    name: "analytics_saved",
    timestamp: "10:43:08.906",
    eventId: "evt_an_91b7ac",
    status: "success",
    trigger: "Warehouse write completed",
    tagsFired: ["Analytics DB - fact_lead_events", "Workspace - refresh lead count"],
    tagsNotFired: ["Dedupe model - exclude duplicate raw event"],
    destination: "Analytics DB",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "jun_webinar_scale",
    sessionId: "sess_8c2a9d",
    anonymousId: "anon_44f891",
    leadId: "lead_10293",
    parameters: { table: "fact_lead_events", partition: "2026-06-23", attribution_model: "last_paid_touch" },
    variables: { table: "fact_lead_events", partition: "2026-06-23", raw_event_count: 8, dedupe_applied: false },
    payload: { event: "analytics_saved", lead_id: "lead_10293", session_id: "sess_8c2a9d", event_count: 7 },
    response: { status: 200, inserted_rows: 1, model_version: "lead_fact_v3" },
    error: null,
  },
];

export function App() {
  const [route, setRoute] = useState(() => (window.location.pathname.includes("workspace") ? "workspace" : "landing"));

  const openWorkspace = () => {
    window.history.pushState({}, "", "/workspace");
    setRoute("workspace");
    window.scrollTo({ top: 0 });
  };

  if (route === "workspace") {
    return <WorkspaceApp />;
  }

  return <LandingPage openWorkspace={openWorkspace} />;
}

function LandingPage({ openWorkspace }: { openWorkspace: () => void }) {
  return (
    <main className="landingPage">
      <header className="landingNav">
        <a className="landingBrand" href="#top" aria-label="Growth Intelligence Center">
          <span />
          <strong>Growth Intelligence Center</strong>
        </a>
        <nav>
          <a href="#problem">Contexto</a>
          <a href="#solution">Sistema</a>
          <a href="#architecture">Arquitetura</a>
          <a href="#technical-overview">Competencias</a>
        </nav>
        <button onClick={openWorkspace}>Abrir workspace <ArrowRight size={15} /></button>
      </header>

      <section className="landingHero" id="top">
        <div className="heroCopy">
          <p className="landingEyebrow">Analytics, atribuição e qualidade de dados</p>
          <h1>descubra por que os números não batem.</h1>
          <p className="heroSubheadline">O Growth Intelligence Center mostra onde leads, anúncios, CRM e eventos discordam para evitar decisões baseadas em dados errados.</p>
          <div className="heroActions">
            <button className="primaryCta" onClick={openWorkspace}>Abrir workspace <ArrowRight size={16} /></button>
            <a className="secondaryCta" href="#technical-overview">Visao tecnica <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="heroProduct" aria-label="Product preview">
          <div className="productChrome">
            <span />
            <span />
            <span />
          </div>
          <div className="productPanel productPanelMain">
            <div>
              <p>Discrepancia de leads</p>
              <strong>+30%</strong>
            </div>
            <span>Meta Ads 100 leads</span>
            <span>Workspace 130 leads</span>
            <span>Janela de merge do CRM aberta</span>
          </div>
          <div className="productGrid">
            {["Dedupe CAPI", "Saude UTM", "Sync CRM", "Attribution"].map((item, index) => (
              <div key={item}>
                <Check size={15} />
                <span>{item}</span>
                <strong>{index === 0 ? "6 anomalias" : index === 1 ? "91%" : index === 2 ? "842ms" : "mapeado"}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landingSection problemSection" id="problem">
        <div className="sectionIntro">
          <p className="landingEyebrow">O problema</p>
          <h2>Meta Ads diz 100 leads. O workspace mostra 130.</h2>
          <p>Quando os números não batem, alguém precisa descobrir se houve lead duplicado, evento perdido, falha no CRM ou erro de atribuição.</p>
        </div>
        <div className="problemGrid">
          {problemItems.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>{index < 2 ? "Muda a leitura de performance e investimento." : "Pode virar decisão errada se ninguém investigar."}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection" id="solution">
        <div className="sectionIntro compact">
          <p className="landingEyebrow">Como o produto ajuda</p>
          <h2>Mostra o problema, a causa, o impacto e o próximo passo.</h2>
        </div>
        <div className="solutionGrid">
          {solutionModules.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection architectureSection" id="architecture">
        <div className="sectionIntro">
          <p className="landingEyebrow">O caminho dos dados</p>
          <h2>Do clique no anúncio até a decisão de negócio.</h2>
        </div>
        <div className="architectureMap">
          {architectureSteps.map((step, index) => (
            <div className="architectureNode" key={step}>
              <span>{step}</span>
              {index < architectureSteps.length - 1 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
      </section>

      <section className="landingSection skillsSection" id="technical-overview">
        <div className="sectionIntro">
          <p className="landingEyebrow">Competencias aplicadas</p>
          <h2>Analytics, engenharia de integrações e qualidade de dados no mesmo produto.</h2>
        </div>
        <div className="skillCloud">
          {technicalSkills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </section>

      <footer className="landingFooter">
        <div className="footerSignature">
          <strong>desenvolvido por felipe virginio</strong>
          <span>software engineer • analytics • automação</span>
        </div>
        <div>
          <a href="https://github.com/fezleep" target="_blank" rel="noreferrer"><Github size={16} />github</a>
          <a href="https://www.linkedin.com/in/fezleep/" target="_blank" rel="noreferrer"><Linkedin size={16} />linkedin</a>
          <a href="https://portfolio-dev-alpha-eight.vercel.app/" target="_blank" rel="noreferrer"><FileCode2 size={16} />portfólio</a>
        </div>
      </footer>
    </main>
  );
}

function WorkspaceApp() {
  const [active, setActive] = useState("overview");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [operations, setOperations] = useOperationsState();

  const generateIncident = (type: IncidentType) => {
    setOperations((current) => {
      const generated = createIncidentPackage(type, current);
      return { ...current, ...generated };
    });
    setActive("incidents");
    setSimulatorOpen(false);
  };

  const updateIncidentStatus = (incidentId: string, status: Incident["status"]) => {
    setOperations((current) => {
      const target = current.incidents.find((incident) => incident.id === incidentId);
      return {
        ...current,
        incidents: current.incidents.map((incident) => incident.id === incidentId ? { ...incident, status } : incident),
        alerts: status === "resolved" ? current.alerts.map((alert) => alert.incidentId === incidentId ? { ...alert, status: "cleared" } : alert) : current.alerts,
        events: status === "resolved"
          ? current.events.map((event) => target?.relatedEventIds?.includes(event.id) ? { ...event, status: "delivered", error: undefined, response: { ...event.response, resolved: true } } : event)
          : current.events,
        workflowLogs: [`${formatDateTime(new Date())} incident ${incidentId} moved to ${status}`, ...current.workflowLogs],
      };
    });
    setDrawer((current) => current?.kind === "incident" && current.item.id === incidentId ? { kind: "incident", item: { ...current.item, status } } : current);
  };

  const filteredNav = useMemo(
    () => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const pageTitle = navItems.find((item) => item.id === active)?.label ?? "Overview";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark"><Sparkles size={18} /></div>
          <div>
            <strong>Growth Intelligence</strong>
            <span>analytics, atribuição e qualidade de dados</span>
          </div>
        </div>
        <div className="authorSignature">
          <strong>felipe virginio</strong>
          <span>software engineer • analytics • automação</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} className={active === item.id ? "navItem active" : "navItem"} onClick={() => setActive(item.id)}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">analytics, atribuição e qualidade de dados.</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="toolbar">
            <button className="searchBox" onClick={() => setCommandOpen(true)}>
              <Search size={16} />
              <span>Buscar campanhas, leads e eventos</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button className="generateIncidentButton" onClick={() => setSimulatorOpen(true)}>
              <AlertTriangle size={16} />
              <span>Gerar incidente</span>
            </button>
            <button className="iconButton" aria-label="Filters"><Filter size={17} /></button>
            <button className="iconButton" aria-label="Dark mode"><Moon size={17} /></button>
          </div>
        </header>

        <section className="filters">
          <span>1 jun - 22 jun, 2026</span>
          <span>Todos os canais</span>
          <span>Todas as campanhas</span>
          <span>Mercado Brasil</span>
        </section>

        {active === "overview" && <Overview operations={operations} setActive={setActive} setDrawer={setDrawer} />}
        {active === "campaigns" && <Campaigns campaigns={operations.campaigns} setDrawer={setDrawer} />}
        {active === "funnel" && <Funnel funnel={operations.funnel} />}
        {active === "attribution" && <Attribution leads={operations.leads} setDrawer={setDrawer} />}
        {active === "root-cause" && <RootCauseAnalysis setDrawer={setDrawer} />}
        {active === "gtm-preview" && <GtmPreviewSimulator setDrawer={setDrawer} setActive={setActive} />}
        {active === "tracking-plan" && <TrackingPlan setDrawer={setDrawer} />}
        {active === "sql-explorer" && <AnalyticsSqlExplorer />}
        {active === "discrepancies" && <Discrepancies setActive={setActive} />}
        {active === "events" && <Events events={operations.events} setDrawer={setDrawer} />}
        {active === "lead-journey" && <LeadJourney />}
        {active === "data-quality" && <DataQuality qualityIssues={operations.qualityIssues} setDrawer={setDrawer} />}
        {active === "workflow" && <WorkflowPage workflowLogs={operations.workflowLogs} setDrawer={setDrawer} />}
        {active === "incidents" && <Incidents incidents={operations.incidents} setDrawer={setDrawer} updateIncidentStatus={updateIncidentStatus} />}
        {active === "technical" && <Technical />}
        <footer className="appFooter">
          <div>
            <strong>desenvolvido por felipe virginio</strong>
            <span>software engineer • analytics • automação</span>
          </div>
          <nav aria-label="Links profissionais">
            <a href="https://github.com/fezleep" target="_blank" rel="noreferrer"><Github size={15} />github</a>
            <a href="https://www.linkedin.com/in/fezleep/" target="_blank" rel="noreferrer"><Linkedin size={15} />linkedin</a>
            <a href="https://portfolio-dev-alpha-eight.vercel.app/" target="_blank" rel="noreferrer"><ArrowUpRight size={15} />portfólio</a>
          </nav>
        </footer>
      </main>

      {commandOpen && (
        <div className="commandOverlay" onClick={() => setCommandOpen(false)}>
          <div className="commandPalette" onClick={(event) => event.stopPropagation()}>
            <div className="commandInput">
              <Command size={18} />
              <input autoFocus placeholder="Ir para modulo, lead, incidente ou evento..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="commandList">
              {filteredNav.map((item) => (
                <button key={item.id} onClick={() => { setActive(item.id); setCommandOpen(false); }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {simulatorOpen && <IncidentSimulatorModal close={() => setSimulatorOpen(false)} generateIncident={generateIncident} />}
      <Drawer drawer={drawer} close={() => setDrawer(null)} workflowLogs={operations.workflowLogs} updateIncidentStatus={updateIncidentStatus} />
    </div>
  );
}

function Overview({ operations, setActive, setDrawer }: { operations: OperationsState; setActive: (id: string) => void; setDrawer: (drawer: DrawerState) => void }) {
  const activeAlert = operations.alerts.find((alert) => alert.status === "active");
  return (
    <div className="pageStack">
      <div className="alertBanner">
        <AlertTriangle size={20} />
        <div>
          <strong>{activeAlert?.title ?? "Nenhum incidente ativo"}</strong>
          <span>{activeAlert?.message ?? "Todos os incidentes gerados foram resolvidos."}</span>
        </div>
        <button onClick={() => setActive(activeAlert ? "incidents" : "root-cause")}>Investigar <ArrowRight size={15} /></button>
      </div>
      <section className="identityGrid">
        <article className="investigationCard">
          <p className="eyebrow">Por trás da investigação</p>
          <h2>Por que este workspace existe.</h2>
          <p>O Growth Intelligence Center foi criado para demonstrar como equipes podem investigar inconsistências de dados, validar atribuições, monitorar integrações e tomar decisões com mais confiança.</p>
        </article>
        <article className="capabilityCard">
          <p className="eyebrow">Competencias no produto</p>
          <div>
            {["marketing analytics", "attribution", "rastreamento", "data quality", "crm integrations", "sql", "automação", "observabilidade"].map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </article>
      </section>
      <section className="metricGrid">
        {operations.metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>
      <section className="grid two">
        <Panel title="Performance de campanhas" action="Ao vivo">
          <ChartFrame>
            <AreaChart data={operations.performanceSeries}>
              <defs>
                <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5eead4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#22252d" vertical={false} />
              <XAxis dataKey="day" stroke="#7c8495" />
              <YAxis stroke="#7c8495" />
              <Tooltip contentStyle={{ background: "#11131a", border: "1px solid #2a2f3b", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#5eead4" fill="url(#revenue)" />
              <Line type="monotone" dataKey="leads" stroke="#8b5cf6" />
            </AreaChart>
          </ChartFrame>
        </Panel>
        <Panel title="Resumo do funil" action="1.9% perda no CRM">
          <div className="miniFunnel">
            {operations.funnel.slice(1).map((step) => (
              <div key={step.stage}>
                <span>{step.stage}</span>
                <div><i style={{ width: `${Math.max(8, 100 - step.loss)}%` }} /></div>
                <b>{step.value.toLocaleString()}</b>
              </div>
            ))}
          </div>
        </Panel>
      </section>
      <section className="grid three">
        <Panel title="Campanhas em destaque">
          <CompactRows rows={operations.campaigns.slice(0, 4).map((c) => [c.name, `$${c.revenue.toLocaleString()}`, `${c.roas}x`])} />
        </Panel>
        <Panel title="Incidentes recentes">
          <CompactRows rows={operations.incidents.slice(0, 5).map((i) => [i.title, i.severity.toUpperCase(), i.status])} />
        </Panel>
        <Panel title="Resumo de qualidade">
          <div className="qualityList">
            {operations.qualityIssues.slice(0, 4).map((issue) => (
              <button key={issue.id} onClick={() => setDrawer({ kind: "quality", item: issue })}>
                <span className={`dot ${issue.health}`} />
                <span>{issue.label}</span>
                <b>{issue.value}</b>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Campaigns({ campaigns, setDrawer }: { campaigns: Campaign[]; setDrawer: (drawer: DrawerState) => void }) {
  return (
    <div className="pageStack">
      <section className="grid two">
        <Panel title="Tendencia de CTR e conversao" action="Por campanha">
          <ChartFrame>
            <LineChart data={campaigns}>
              <CartesianGrid stroke="#22252d" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#7c8495" />
              <Tooltip contentStyle={{ background: "#11131a", border: "1px solid #2a2f3b", borderRadius: 8 }} />
              <Line dataKey="ctr" stroke="#5eead4" strokeWidth={2} />
              <Line dataKey="conversion" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ChartFrame>
        </Panel>
        <Panel title="Eficiencia de custo">
          <ChartFrame>
            <BarChart data={campaigns}>
              <CartesianGrid stroke="#22252d" vertical={false} />
              <XAxis dataKey="id" stroke="#7c8495" />
              <YAxis stroke="#7c8495" />
              <Tooltip contentStyle={{ background: "#11131a", border: "1px solid #2a2f3b", borderRadius: 8 }} />
              <Bar dataKey="cpl" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </Panel>
      </section>
      <TablePanel title="Analytics de campanhas" icon={<ListFilter size={16} />}>
        <table>
          <thead><tr><th>Campanha</th><th>Status</th><th>Canal</th><th>CTR</th><th>CPC</th><th>CPL</th><th>Conversao</th><th>ROAS</th><th>Qualidade</th></tr></thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} onClick={() => setDrawer({ kind: "campaign", item: campaign })}>
                <td><strong>{campaign.name}</strong><small>{campaign.owner}</small></td>
                <td><Badge label={campaign.status} /></td>
                <td>{campaign.channel}</td>
                <td>{campaign.ctr}%</td>
                <td>${campaign.cpc}</td>
                <td>${campaign.cpl}</td>
                <td>{campaign.conversion}%</td>
                <td>{campaign.roas}x</td>
                <td><span className={`pill ${campaign.quality}`}>{campaign.quality}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function Funnel({ funnel }: { funnel: OperationsState["funnel"] }) {
  const max = funnel[0].value;
  return (
    <Panel title="Funil de conversao" action="Perda por etapa">
      <div className="funnel">
        {funnel.map((step) => (
          <div key={step.stage} className="funnelStep" style={{ width: `${Math.max(18, (step.value / max) * 100)}%` }}>
            <span>{step.stage}</span>
            <strong>{step.value.toLocaleString()}</strong>
            <em>{step.loss ? `${step.loss}% perda` : "entrada"}</em>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Attribution({ leads, setDrawer }: { leads: Lead[]; setDrawer: (drawer: DrawerState) => void }) {
  return (
    <div className="pageStack">
      <section className="simpleBrief">
        <strong>De onde veio cada lead?</strong>
        <span>Esta tela conecta pessoa, campanha, canal, CRM e receita para explicar a origem do resultado.</span>
      </section>
      <TablePanel title="Centro de atribuição" icon={<Network size={16} />}>
        <table>
          <thead><tr><th>Lead</th><th>Campanha</th><th>Canal</th><th>UTM source</th><th>UTM medium</th><th>Primeiro toque</th><th>CRM</th><th>Conversao</th><th>Receita</th></tr></thead>
          <tbody>{leads.map((lead) => (
            <tr key={lead.id} onClick={() => setDrawer({ kind: "lead", item: lead })}>
              <td><strong>{lead.name}</strong><small>{lead.email}</small></td><td>{lead.campaign}</td><td>{lead.channel}</td><td>{lead.utmSource}</td><td>{lead.utmMedium}</td><td>{lead.firstTouch}</td><td>{lead.crmStatus}</td><td>{lead.conversionStatus}</td><td>${lead.revenue.toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function RootCauseAnalysis({ setDrawer }: { setDrawer: (drawer: DrawerState) => void }) {
  const expectedLeads = 100;
  const reportedLeads = 130;
  const difference = reportedLeads - expectedLeads;
  const totalDiscrepancy = rootCauses.reduce((sum, cause) => sum + cause.value, 0);

  return (
    <div className="pageStack rootCausePage">
      <section className="forensicHero">
        <div className="caseHeader">
          <div>
            <p className="eyebrow">Investigação de causa</p>
            <h2>30 leads estão sem explicação.</h2>
          </div>
          <div className="caseBadge">
            <CheckCircle2 size={16} />
            <span>Nivel de confianca</span>
            <strong>95%</strong>
          </div>
        </div>
        <div className="leadComparison">
          <article>
            <span>Leads esperados</span>
            <strong>{expectedLeads}</strong>
            <small>Conversoes reportadas pelo Meta Ads</small>
          </article>
          <ArrowRight size={24} />
          <article className="reported">
            <span>Leads registrados</span>
            <strong>{reportedLeads}</strong>
            <small>Leads agregados no workspace</small>
          </article>
          <article className="difference">
            <span>Diferenca</span>
            <strong>+{difference}</strong>
            <small>Variancia de leads nao reconciliada</small>
          </article>
        </div>
      </section>

      <section className="storyGrid">
        <article><span>O que aconteceu?</span><strong>Meta Ads registrou 100 leads. O workspace registrou 130.</strong></article>
        <article><span>Qual o impacto?</span><strong>Campanhas podem parecer melhores do que são.</strong></article>
        <article><span>Por que aconteceu?</span><strong>Eventos duplicados, atribuição antiga e atraso da plataforma.</strong></article>
        <article><span>O que fazer?</span><strong>Deduplicar, corrigir regras e esperar a janela de matching.</strong></article>
      </section>

      <section className="investigationGrid">
        <Panel title="Distribuicao da discrepancia" action="Abrir causa">
          <div className="causeBreakdown">
            {rootCauses.map((cause) => (
              <button key={cause.id} onClick={() => setDrawer({ kind: "rootCause", item: cause })}>
                <div>
                  <span>{cause.label}</span>
                  <b>{cause.value}</b>
                </div>
                <i style={{ width: `${(cause.value / totalDiscrepancy) * 100}%`, background: cause.color }} />
              </button>
            ))}
            <div className="totalDiscrepancy">
              <span>Discrepancia total</span>
              <strong>{totalDiscrepancy}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Reconstrucao da variancia" action="130 para 100">
          <ChartFrame>
            <BarChart data={[{ name: "registrado", leads: 130 }, { name: "duplicados", leads: 112 }, { name: "orgânico", leads: 105 }, { name: "atraso", leads: 100 }]}>
              <CartesianGrid stroke="#22252d" vertical={false} />
              <XAxis dataKey="name" stroke="#7c8495" />
              <YAxis stroke="#7c8495" domain={[80, 140]} />
              <Tooltip contentStyle={{ background: "#11131a", border: "1px solid #2a2f3b", borderRadius: 8 }} />
              <Bar dataKey="leads" radius={[6, 6, 0, 0]}>
                {["#5eead4", "#fb7185", "#f59e0b", "#8b5cf6"].map((color) => <Cell key={color} fill={color} />)}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Panel>
      </section>

      <section className="grid two">
        <Panel title="Linha do tempo de evidencias" action="Trilha analitica">
          <div className="evidenceTimeline">
            {rootCauseTimeline.map((item) => (
              <div key={item.time}>
                <time>{item.time}</time>
                <strong>{item.signal}</strong>
                <span>{item.reported} registrados / {item.expected} esperados</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Indicadores da investigacao" action="Reconciliacao ativa">
          <div className="indicatorGrid">
            <div><span>Dedupe hit rate</span><strong>13.8%</strong><small className="bad">above normal</small></div>
            <div><span>Drift de atribuicao</span><strong>5.4%</strong><small className="bad">requer correcao</small></div>
            <div><span>Matching delay</span><strong>5</strong><small className="neutral">pending records</small></div>
            <div><span>Explained variance</span><strong>100%</strong><small className="good">30 of 30 mapped</small></div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function GtmPreviewSimulator({ setDrawer, setActive }: { setDrawer: (drawer: DrawerState) => void; setActive: (id: string) => void }) {
  const [filter, setFilter] = useState<"all" | GtmPreviewEvent["status"]>("all");
  const filteredEvents = filter === "all" ? gtmPreviewEvents : gtmPreviewEvents.filter((event) => event.status === filter);
  const counts = {
    success: gtmPreviewEvents.filter((event) => event.status === "success").length,
    warning: gtmPreviewEvents.filter((event) => event.status === "warning").length,
    failed: gtmPreviewEvents.filter((event) => event.status === "failed").length,
  };
  const statusLabel = (status: GtmPreviewEvent["status"]) => status === "success" ? "evento enviado" : status === "warning" ? "evento duplicado" : "evento falhou";

  return (
    <div className="gtmPreviewShell">
      <section className="gtmSessionPanel">
        <div className="gtmPreviewHeader">
          <div>
            <p className="eyebrow">Prévia do GTM</p>
            <h2>o caminho de um lead, evento por evento.</h2>
            <span>Veja o que foi enviado, o que duplicou e o que falhou.</span>
          </div>
          <div className="previewLive">
            <PlayCircle size={17} />
            <strong>Prévia conectada</strong>
          </div>
        </div>

        <div className="gtmSessionMeta">
          <div><span>Preview session id</span><strong>debug_sess_8c2a9d</strong></div>
          <div><span>Domain</span><strong>edugrowth.academy</strong></div>
          <div><span>Container id</span><strong>GTM-K8L2QF</strong></div>
          <div><span>Modo debug</span><strong>Ativo</strong></div>
          <div><span>Status da sessão</span><strong>Conectada</strong></div>
        </div>

        <div className="gtmFilters" role="group" aria-label="Filter preview events">
          {(["all", "success", "warning", "failed"] as const).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="gtmTimeline">
          {filteredEvents.map((event, index) => (
            <button key={event.id} className={`gtmEventCard ${event.status}`} onClick={() => setDrawer({ kind: "gtmPreview", item: event })}>
              <span className="gtmEventIndex">{String(index + 1).padStart(2, "0")}</span>
              <div className="gtmEventMain">
                <div>
                  <strong>{event.id === "gtm-4b" ? "lead_submit duplicated" : event.name}</strong>
                  <small>{event.timestamp} · {event.eventId}</small>
                </div>
                <span className={`pill ${event.status}`}>{statusLabel(event.status)}</span>
              </div>
              <div className="gtmEventMeta">
                <span>{event.destination}</span>
                <span>{event.leadId}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="gtmDiagnosis">
          <div>
            <AlertTriangle size={18} />
            <strong>O que encontramos</strong>
          </div>
          <p>Encontramos um lead_submit duplicado. A página de obrigado recarregou e enviou o mesmo evento de novo.</p>
          <p>Impacto: o workspace supercontou leads antes da deduplicacao, contribuindo para a discrepancia Meta Ads 100 leads vs workspace 130 leads.</p>
          <p>Correcao: deduplicar por event_id, email_hash e session_id antes da agregacao analitica.</p>
        </div>
      </section>

      <aside className="gtmInspectorPanel">
        <div className="inspectorChrome">
          <span />
          <span />
          <span />
        </div>
        <div className="tagHealth">
          <div>
            <span>Total events</span>
            <strong>{gtmPreviewEvents.length}</strong>
          </div>
          <div>
            <span>Enviados</span>
            <strong>{counts.success}</strong>
          </div>
          <div>
            <span>Duplicados</span>
            <strong>{counts.warning}</strong>
          </div>
          <div>
            <span>Falharam</span>
            <strong>{counts.failed}</strong>
          </div>
        </div>
        <div className="previewDebugger">
          <h3>Fluxo de eventos</h3>
          {gtmPreviewEvents.map((event) => (
            <div key={event.id}>
              <span className={`debugDot ${event.status}`} />
              <code>{event.id === "gtm-4b" ? "lead_submit duplicated" : event.name}</code>
              <small>{event.destination}</small>
            </div>
          ))}
        </div>
        <div className="gtmDataLayer">
          <h3>Data layer state</h3>
          <code>utm_source: meta</code>
          <code>utm_medium: paid_social</code>
          <code>utm_campaign: jun_webinar_scale</code>
          <code>session_id: sess_8c2a9d</code>
          <code>anonymous_id: anon_44f891</code>
          <code>lead_id: lead_10293</code>
        </div>
        <div className="gtmInvestigationLinks">
          <h3>Investigation links</h3>
          {[
            ["root-cause", "Root cause analysis"],
            ["discrepancies", "Discrepancies"],
            ["events", "Events"],
            ["data-quality", "Data quality"],
            ["incidents", "Incidents"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActive(id)}>{label}<ChevronRight size={14} /></button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function TrackingPlan({ setDrawer }: { setDrawer: (drawer: DrawerState) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TrackingPlanEvent["status"]>("all");
  const [destination, setDestination] = useState("all");
  const [sortKey, setSortKey] = useState<"eventName" | "owner" | "status">("eventName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const destinations = useMemo(
    () => Array.from(new Set(trackingPlanEvents.flatMap((event) => event.destination))).sort(),
    [],
  );

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return trackingPlanEvents
      .filter((event) => status === "all" || event.status === status)
      .filter((event) => destination === "all" || event.destination.includes(destination))
      .filter((event) => {
        if (!term) return true;
        return [
          event.eventName,
          event.trigger,
          event.description,
          event.owner,
          event.status,
          event.parameters.join(" "),
          event.destination.join(" "),
        ].join(" ").toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const left = a[sortKey];
        const right = b[sortKey];
        return sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      });
  }, [destination, search, sortDirection, sortKey, status]);

  const changeSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <div className="pageStack trackingPlanPage">
      <section className="trackingHero">
        <div>
          <p className="eyebrow">Governança de analytics engineering</p>
          <h2>Plano de rastreamento</h2>
          <span>Documentação viva para eventos de aquisição, CRM, Conversion API e warehouse.</span>
        </div>
        <div className="trackingStats">
          <div><span>Eventos</span><strong>{trackingPlanEvents.length}</strong></div>
          <div><span>Ativos</span><strong>{trackingPlanEvents.filter((event) => event.status === "active").length}</strong></div>
          <div><span>Donos</span><strong>{new Set(trackingPlanEvents.map((event) => event.owner)).size}</strong></div>
        </div>
      </section>

      <section className="trackingControls" aria-label="Controles do plano de rastreamento">
        <label>
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar evento, parâmetro, dono ou destino" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="needs review">Requer revisão</option>
          <option value="draft">Rascunho</option>
          <option value="deprecated">Depreciado</option>
        </select>
        <select value={destination} onChange={(event) => setDestination(event.target.value)}>
          <option value="all">Todos os destinos</option>
          {destinations.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </section>

      <TablePanel title="Contratos de evento" icon={<FileCode2 size={16} />}>
        <table className="trackingTable">
          <thead>
            <tr>
              <th><button onClick={() => changeSort("eventName")}>Nome do evento {sortKey === "eventName" ? sortDirection : ""}</button></th>
              <th>Gatilho</th>
              <th>Descrição</th>
              <th>Parâmetros</th>
              <th>Destino</th>
              <th><button onClick={() => changeSort("owner")}>Dono {sortKey === "owner" ? sortDirection : ""}</button></th>
              <th><button onClick={() => changeSort("status")}>Status {sortKey === "status" ? sortDirection : ""}</button></th>
            </tr>
          </thead>
          <tbody>{filteredEvents.map((event) => (
            <tr key={event.eventName} onClick={() => setDrawer({ kind: "trackingPlan", item: event })}>
              <td><strong><code>{event.eventName}</code></strong><small>{event.objective}</small></td>
              <td>{event.trigger}</td>
              <td>{event.description}</td>
              <td><div className="parameterChips">{event.parameters.slice(0, 4).map((parameter) => <span key={parameter}>{parameter}</span>)}{event.parameters.length > 4 && <span>+{event.parameters.length - 4}</span>}</div></td>
              <td><div className="destinationStack">{event.destination.map((item) => <span key={item}>{item}</span>)}</div></td>
              <td>{event.owner}</td>
              <td><span className={`pill ${event.status.replace(" ", "-")}`}>{event.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function AnalyticsSqlExplorer() {
  const categories: Array<"all" | SqlQueryCategory> = ["all", "campaign performance", "lead attribution", "data quality", "event tracking", "incident investigation"];
  const [selectedCategory, setSelectedCategory] = useState<"all" | SqlQueryCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedQueryId, setSelectedQueryId] = useState(sqlExplorerQueries[0].id);

  const filteredQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sqlExplorerQueries.filter((query) => {
      const matchesCategory = selectedCategory === "all" || query.category === selectedCategory;
      const matchesSearch = !term || [
        query.title,
        query.category,
        query.description,
        query.objective,
        query.expectedResult,
        query.tables.join(" "),
        query.sql,
      ].join(" ").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const selectedQuery = sqlExplorerQueries.find((query) => query.id === selectedQueryId) ?? filteredQueries[0] ?? sqlExplorerQueries[0];

  useEffect(() => {
    if (!filteredQueries.some((query) => query.id === selectedQueryId)) {
      setSelectedQueryId(filteredQueries[0]?.id ?? sqlExplorerQueries[0].id);
    }
  }, [filteredQueries, selectedQueryId]);

  return (
    <div className="sqlExplorerShell">
      <section className="sqlExplorerHeader">
        <div>
          <p className="eyebrow">Workspace analítico</p>
          <h2>Explorador SQL de analytics</h2>
          <span>Biblioteca read-only para performance de campanhas, atribuição, qualidade de dados e investigação de incidentes.</span>
        </div>
        <div className="sqlEnvironment">
          <span>warehouse</span>
          <strong>prod_analytics</strong>
          <small>read-only sandbox</small>
        </div>
      </section>

      <section className="sqlExplorerControls">
        <label>
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar query, tabela, métrica ou SQL" />
        </label>
        <div className="sqlCategoryTabs">
          {categories.map((category) => (
            <button key={category} className={selectedCategory === category ? "active" : ""} onClick={() => setSelectedCategory(category)}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="sqlExplorerGrid">
        <aside className="queryCatalog">
          <div className="queryCatalogHeader">
            <span>Biblioteca SQL</span>
            <strong>{filteredQueries.length}</strong>
          </div>
          <div className="queryList">
            {filteredQueries.map((query) => (
              <button key={query.id} className={selectedQuery.id === query.id ? "active" : ""} onClick={() => setSelectedQueryId(query.id)}>
                <span>{query.category}</span>
                <strong>{query.title}</strong>
                <small>{query.tables.slice(0, 2).join(" / ")}</small>
              </button>
            ))}
          </div>
        </aside>

        <main className="sqlEditorPanel">
          <div className="sqlEditorToolbar">
            <div>
              <span>{selectedQuery.category}</span>
              <strong>{selectedQuery.title}</strong>
            </div>
            <div className="sqlReadOnlyBadge">
              <DatabaseZap size={15} />
              <span>Read-only</span>
            </div>
          </div>
          <pre className="sqlEditor" aria-label={`${selectedQuery.title} SQL query`}><code>{selectedQuery.sql}</code></pre>
          <div className="sqlNoRunNotice">
            <AlertTriangle size={16} />
            <span>As queries não são executadas aqui. Esta área simula um ambiente governado de analytics.</span>
          </div>
        </main>

        <aside className="sqlMetadataPanel">
          <section>
            <h3>Descrição</h3>
            <p>{selectedQuery.description}</p>
          </section>
          <section>
            <h3>Objetivo</h3>
            <p>{selectedQuery.objective}</p>
          </section>
          <section>
            <h3>Resultado esperado</h3>
            <p>{selectedQuery.expectedResult}</p>
          </section>
          <section>
            <h3>Tabelas usadas</h3>
            <div className="sqlTableChips">{selectedQuery.tables.map((table) => <span key={table}>{table}</span>)}</div>
          </section>
          <section>
            <h3>Governança</h3>
            <Details entries={[["Dono", selectedQuery.owner], ["Atualizado", selectedQuery.updatedAt], ["Modo", "Read-only"], ["Execução", "Desabilitada"]]} />
          </section>
        </aside>
      </section>
    </div>
  );
}

function Discrepancies({ setActive }: { setActive: (id: string) => void }) {
  return (
    <div className="pageStack">
      <section className="discrepancyHero">
        {discrepancyRows.map((row) => (
          <div key={row.source}>
            <span>{row.source}</span>
            <strong>{row.leads}</strong>
            <small>{row.note}</small>
          </div>
        ))}
      </section>
      <section className="grid two">
        <Panel title="Causas provaveis" action="Rankeadas por evidencia">
          <div className="causeList">
            <button onClick={() => setActive("events")}><AlertTriangle size={17} /><span>Meta CAPI rejected 6 events with dedupe conflicts</span><b>High</b></button>
            <button onClick={() => setActive("events")}><DatabaseZap size={17} /><span>Analytics DB counts submitted leads before CRM merge</span><b>High</b></button>
            <button onClick={() => setActive("data-quality")}><GitCompareArrows size={17} /><span>Inconsistencia de normalizacao do campaign id em dois ad sets</span><b>Media</b></button>
          </div>
        </Panel>
        <Panel title="Caminho de investigacao">
          <ol className="steps">
            <li>Open rejected LeadSubmitted events for campaign revops_webinar_rt.</li>
            <li>Compare browser pixel event_id against server event_id.</li>
            <li>Inspecionar merges duplicados no CRM antes da agregacao analitica.</li>
            <li>Backfill normalized attribution key and re-run quality checks.</li>
          </ol>
        </Panel>
      </section>
    </div>
  );
}

function Events({ events, setDrawer }: { events: EventRecord[]; setDrawer: (drawer: DrawerState) => void }) {
  return (
    <TablePanel title="Debugger de eventos" icon={<PanelsTopLeft size={16} />}>
      <table>
        <thead><tr><th>Evento</th><th>Timestamp</th><th>Lead</th><th>Sessao</th><th>Status</th><th>Destino</th><th>Anomalia</th></tr></thead>
        <tbody>{events.map((event) => (
          <tr key={event.id} onClick={() => setDrawer({ kind: "event", item: event })}>
            <td><strong>{event.name}</strong><small>{event.id}</small></td><td>{event.timestamp}</td><td>{event.leadName}</td><td>{event.session}</td><td><span className={`pill ${event.status}`}>{event.status}</span></td><td>{event.destination}</td><td>{event.error ?? "Sem anomalia"}</td>
          </tr>
        ))}</tbody>
      </table>
    </TablePanel>
  );
}

function LeadJourney() {
  const journey = ["Ad click", "Landing page", "Form start", "Submit", "CRM sync", "Conversion API", "Analytics database", "Sale"];
  return (
    <Panel title="Lead journey" action="Camila Torres · lead_10293">
      <div className="timeline">
        {journey.map((item, index) => (
          <div key={item} className="timelineItem">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{item}</strong><p>{index < 6 ? "Completed with consistent identifiers and preserved attribution keys." : "Revenue joined to first-touch and last-touch models."}</p></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DataQuality({ qualityIssues, setDrawer }: { qualityIssues: QualityIssue[]; setDrawer: (drawer: DrawerState) => void }) {
  return (
    <div className="pageStack">
      <section className="simpleBrief">
        <strong>Quais dados podem gerar decisão errada?</strong>
        <span>Os cards mostram inconsistências que precisam de revisão antes de confiar nos números.</span>
      </section>
      <section className="qualityGrid">
        {qualityIssues.map((issue) => (
          <button key={issue.id} className="qualityCard" onClick={() => setDrawer({ kind: "quality", item: issue })}>
            <span className={`dot ${issue.health}`} />
            <strong>{issue.label}</strong>
            <b>{issue.value}</b>
            <small>{issue.delta}</small>
            <p>{issue.description}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function WorkflowPage({ workflowLogs, setDrawer }: { workflowLogs: string[]; setDrawer: (drawer: DrawerState) => void }) {
  return (
    <div className="workflowShell">
      <ReactFlow nodes={workflowNodes} edges={workflowEdges} fitView onNodeClick={(_, node) => setDrawer({ kind: "workflow", item: String(node.data.label) })}>
        <Background color="#2a2f3b" />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function Incidents({ incidents, setDrawer, updateIncidentStatus }: { incidents: Incident[]; setDrawer: (drawer: DrawerState) => void; updateIncidentStatus: (incidentId: string, status: Incident["status"]) => void }) {
  return (
    <div className="pageStack">
      <section className="simpleBrief">
        <strong>O que precisa de atenção agora?</strong>
        <span>Incidentes mostram o problema, o impacto nos números e o próximo passo para correção.</span>
      </section>
      <TablePanel title="Centro de incidentes" icon={<Activity size={16} />}>
        <table>
          <thead><tr><th>Incidente</th><th>Severidade</th><th>Impacto</th><th>Status</th><th>Dono</th><th>Abertura</th><th>Ação</th></tr></thead>
          <tbody>{incidents.map((incident) => (
            <tr key={incident.id} onClick={() => setDrawer({ kind: "incident", item: incident })}>
              <td><strong>{incident.title}</strong><small>{incident.id}</small></td><td>{incident.severity.toUpperCase()}</td><td>{incident.impact}</td><td><Badge label={incident.status} /></td><td>{incident.owner}</td><td>{incident.openedAt}</td>
              <td><div className="rowActions"><button onClick={(event) => { event.stopPropagation(); updateIncidentStatus(incident.id, "investigating"); }}>Investigar</button><button onClick={(event) => { event.stopPropagation(); updateIncidentStatus(incident.id, "resolved"); }}>Resolver</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function IncidentSimulatorModal({ close, generateIncident }: { close: () => void; generateIncident: (type: IncidentType) => void }) {
  const [selected, setSelected] = useState<IncidentType>("crm sync failure");
  const selectedLabel = selected.replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="modalOverlay" onClick={close}>
      <section className="incidentModal" onClick={(event) => event.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="eyebrow">Simulador de incidentes</p>
            <h2>Gerar incidente</h2>
          </div>
          <button onClick={close} aria-label="Close simulator"><X size={18} /></button>
        </div>
        <div className="incidentTypeGrid">
          {incidentTypes.map((type) => (
            <button key={type} className={selected === type ? "active" : ""} onClick={() => setSelected(type)}>
              <AlertTriangle size={17} />
              <span>{type}</span>
            </button>
          ))}
        </div>
        <div className="simulatorPreview">
          <div>
            <strong>{selectedLabel}</strong>
            <span>Creates a linked operational record set, not a static mock.</span>
          </div>
          <ul>
            <li>Alerta roteado para o workspace</li>
            <li>Anomalia de evento no debugger</li>
            <li>Inconsistencia de qualidade com lead afetado</li>
            <li>Caso no centro de incidentes com evidencias e logs</li>
          </ul>
        </div>
        <div className="modalActions">
          <button onClick={close}>Cancel</button>
          <button className="primaryAction" onClick={() => generateIncident(selected)}>Gerar incidente</button>
        </div>
      </section>
    </div>
  );
}

function Technical() {
  const docs = [
    ["Arquitetura", "Pipeline server-side com webhook, validação, enriquecimento, sync de CRM, Conversion APIs, warehouse de analytics e UI operacional."],
    ["Plano de rastreamento", "LeadSubmitted, FormStarted, CRMContactCreated, ConversionRegistered, Purchase e transições de lifecycle com event_id estável."],
    ["Modelo de eventos", "Cada evento carrega lead_id, session_id, anonymous_id, campaign_id, objeto UTM, status de destino e metadados de retry."],
    ["Estratégia de deduplicação", "Pixel browser e eventos server-side compartilham event_id; merges do CRM usam email+phone como chave secundária."],
    ["Qualidade dos dados", "Regras automatizadas detectam UTMs ausentes, emails inválidos, divergências no CRM, drift de campanhas e falhas de Conversion API."],
    ["Fluxo de CRM", "Webhook cria ou atualiza contatos, atribui owner pools, acompanha lifecycle stage e emite confirmações de sync."],
    ["Fluxo de Conversion API", "Eventos Meta e Google são normalizados, hasheados, retentados, logados e reconciliados com diagnósticos da plataforma."],
    ["Modelo analítico", "Fact tables separam eventos brutos, leads normalizados, relatórios de plataforma, toques de atribuição e receita."],
  ];
  return <section className="docGrid">{docs.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</section>;
}

function MetricCard(metric: { label: string; value: string; change: string; tone: string; subtitle?: string }) {
  return (
    <article className="metricCard">
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {metric.subtitle && <p>{metric.subtitle}</p>}
      <small className={metric.tone}>{metric.change}</small>
    </article>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return <section className="panel"><div className="panelHeader"><h2>{title}</h2>{action && <span>{action}</span>}</div>{children}</section>;
}

function TablePanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="panel tablePanel"><div className="panelHeader"><h2>{icon}{title}</h2><div className="tableTools"><button>Ordenar</button><button>Exportar</button></div></div><div className="tableWrap">{children}</div></section>;
}

function ChartFrame({ children }: { children: React.ReactElement }) {
  return <div className="chart"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;
}

function CompactRows({ rows }: { rows: string[][] }) {
  return <div className="compactRows">{rows.map((row) => <div key={row.join("|")}>{row.map((cell, index) => <span key={cell} className={index === 0 ? "wide" : ""}>{cell}</span>)}</div>)}</div>;
}

function Badge({ label }: { label: string }) {
  return <span className="badge">{label}</span>;
}

function Drawer({ drawer, close, workflowLogs, updateIncidentStatus }: { drawer: DrawerState; close: () => void; workflowLogs: string[]; updateIncidentStatus: (incidentId: string, status: Incident["status"]) => void }) {
  if (!drawer) return null;
  const title = drawer.kind === "lead" ? drawer.item.name : drawer.kind === "event" ? drawer.item.name : drawer.kind === "quality" ? drawer.item.label : drawer.kind === "incident" ? drawer.item.title : drawer.kind === "campaign" ? drawer.item.name : drawer.kind === "trackingPlan" ? drawer.item.eventName : drawer.kind === "rootCause" ? drawer.item.label : drawer.kind === "gtmPreview" ? drawer.item.name : drawer.item;
  const json = drawer.kind === "event" ? JSON.stringify({ payload: drawer.item.payload, response: drawer.item.response, error: drawer.item.error }, null, 2) : null;
  return (
    <aside className="drawer">
      <div className="drawerHeader"><div><span>{drawer.kind}</span><h2>{title}</h2></div><button onClick={close}><X size={18} /></button></div>
      {drawer.kind === "event" && <pre>{json}</pre>}
      {drawer.kind === "lead" && <Details entries={[["Email", drawer.item.email], ["Campaign", drawer.item.campaign], ["Channel", drawer.item.channel], ["UTM campaign", drawer.item.utmCampaign], ["CRM status", drawer.item.crmStatus], ["Conversion", drawer.item.conversionStatus], ["Revenue", `$${drawer.item.revenue.toLocaleString()}`]]} />}
      {drawer.kind === "campaign" && <Details entries={[["Investment", `$${drawer.item.investment.toLocaleString()}`], ["Leads", drawer.item.leads.toLocaleString()], ["Sales", drawer.item.sales.toLocaleString()], ["Revenue", `$${drawer.item.revenue.toLocaleString()}`], ["ROAS", `${drawer.item.roas}x`], ["Quality", drawer.item.quality]]} />}
      {drawer.kind === "trackingPlan" && (
        <div className="trackingDrawer">
          <div className="trackingContractStatus">
            <span>{drawer.item.status}</span>
            <strong>{drawer.item.owner}</strong>
            <small>{drawer.item.destination.join(" / ")}</small>
          </div>
          <section>
            <h3>Event objective</h3>
            <p>{drawer.item.objective}</p>
          </section>
          <section>
            <h3>Expected payload</h3>
            <pre>{JSON.stringify(drawer.item.expectedPayload, null, 2)}</pre>
          </section>
          <section>
            <h3>Required fields</h3>
            <div className="parameterChips">{drawer.item.requiredFields.map((field) => <span key={field}>{field}</span>)}</div>
          </section>
          <section>
            <h3>Destinations</h3>
            <div className="destinationStack">{drawer.item.destination.map((destination) => <span key={destination}>{destination}</span>)}</div>
          </section>
          <section>
            <h3>Examples</h3>
            <ul>{drawer.item.examples.map((example) => <li key={example}>{example}</li>)}</ul>
          </section>
          <section>
            <h3>Validation rules</h3>
            <ul>{drawer.item.validationRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          </section>
        </div>
      )}
      {drawer.kind === "incident" && (
        <div className="incidentDrawer">
          <div className={`incidentStatus ${drawer.item.status}`}>
            <span>{drawer.item.severity.toUpperCase()}</span>
            <strong>{drawer.item.status}</strong>
            <small>{drawer.item.openedAt} - {drawer.item.owner}</small>
          </div>
          <Details entries={[
            ["Type", drawer.item.type ?? "existing incident"],
            ["Impact", drawer.item.impact],
            ["Lead", drawer.item.affectedLeadId ?? "Not linked"],
            ["Event", drawer.item.relatedEventIds?.join(", ") ?? "Not linked"],
            ["Quality issue", drawer.item.relatedQualityIssueId ?? "Not linked"],
          ]} />
          <section>
            <h3>Evidence</h3>
            <ul>{(drawer.item.evidence ?? [drawer.item.resolution]).map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
          </section>
          <section>
            <h3>Operational logs</h3>
            <div className="logs">{(drawer.item.logs ?? workflowLogs.slice(0, 4)).map((log) => <code key={log}>{log}</code>)}</div>
          </section>
          <section>
            <h3>Resolution runbook</h3>
            <p>{drawer.item.resolution}</p>
          </section>
          <div className="drawerActions">
            <button onClick={() => updateIncidentStatus(drawer.item.id, "investigating")}>Investigate</button>
            <button className="primaryAction" onClick={() => updateIncidentStatus(drawer.item.id, "resolved")}>Resolve incident</button>
          </div>
        </div>
      )}
      {drawer.kind === "rootCause" && (
        <div className="rootCauseDrawer">
          <div className="confidencePanel">
            <span>Confidence level</span>
            <strong>95%</strong>
            <i><b style={{ width: "95%", background: drawer.item.color }} /></i>
          </div>
          <section>
            <h3>Evidences</h3>
            <ul>{drawer.item.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
          </section>
          <section>
            <h3>Impact</h3>
            <p>{drawer.item.impact}</p>
          </section>
          <section>
            <h3>Root cause</h3>
            <p>{drawer.item.root}</p>
          </section>
          <section>
            <h3>Recommended resolution</h3>
            <p>{drawer.item.resolution}</p>
          </section>
        </div>
      )}
      {drawer.kind === "gtmPreview" && (
        <div className="gtmDrawer">
          <div className={`gtmDrawerStatus ${drawer.item.status}`}>
            <span>{drawer.item.status}</span>
            <strong>{drawer.item.destination}</strong>
            <small>{drawer.item.timestamp} · {drawer.item.eventId}</small>
          </div>
          <Details entries={[
            ["Event name", drawer.item.name],
            ["Event id", drawer.item.eventId],
            ["Timestamp", drawer.item.timestamp],
            ["Trigger", drawer.item.trigger],
            ["Status", drawer.item.status],
            ["Destination", drawer.item.destination],
          ]} />
          <section>
            <h3>Tags fired</h3>
            <div className="tagList">{drawer.item.tagsFired.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </section>
          <section>
            <h3>Tags not fired</h3>
            <div className="tagList muted">{drawer.item.tagsNotFired.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </section>
          <section>
            <h3>Variables</h3>
            <pre>{JSON.stringify(drawer.item.variables, null, 2)}</pre>
          </section>
          <section>
            <h3>Payload json</h3>
            <pre>{JSON.stringify(drawer.item.payload, null, 2)}</pre>
          </section>
          <section>
            <h3>Event parameters</h3>
            <Details entries={[
              ["utm_source", drawer.item.utmSource],
              ["utm_medium", drawer.item.utmMedium],
              ["utm_campaign", drawer.item.utmCampaign],
              ["session_id", drawer.item.sessionId],
              ["anonymous_id", drawer.item.anonymousId],
              ["lead_id", drawer.item.leadId],
              ...Object.entries(drawer.item.parameters).map(([key, value]) => [key, String(value)] as [string, string]),
            ]} />
          </section>
          <section>
            <h3>Response</h3>
            <pre>{JSON.stringify(drawer.item.response, null, 2)}</pre>
          </section>
          <section>
            <h3>Anomalias / alertas</h3>
            <p>{drawer.item.error ?? "Sem anomalia bloqueante."}</p>
            {drawer.item.warnings?.length ? <ul>{drawer.item.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p>Sem alertas.</p>}
          </section>
        </div>
      )}
      {drawer.kind === "quality" && <><p className="drawerText">{drawer.item.description}</p><Details entries={drawer.item.affected.map((value, index) => [`Affected ${index + 1}`, value])} /></>}
      {drawer.kind === "workflow" && <><Details entries={[["Input", "LeadSubmitted webhook payload"], ["Output", `${drawer.item} acknowledgement`], ["Status", drawer.item === "Conversion API" ? "Failed retry scheduled" : "Delivered"], ["Latency", "842ms p95"]]} /><div className="logs">{workflowLogs.map((log) => <code key={log}>{log}</code>)}</div></>}
    </aside>
  );
}

function Details({ entries }: { entries: Array<[string, string]> }) {
  return <dl className="details">{entries.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>;
}
