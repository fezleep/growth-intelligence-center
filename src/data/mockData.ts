import type { Campaign, EventRecord, Incident, Lead, Metric, QualityIssue } from "../types";

export const metrics: Metric[] = [
  { label: "Investimento", value: "$84,920", subtitle: "dinheiro usado nas campanhas.", change: "+12.4% vs periodo anterior", tone: "neutral" },
  { label: "Impressoes", value: "3.42M", subtitle: "vezes que os anuncios apareceram.", change: "+18.1%", tone: "good" },
  { label: "Clicks", value: "128,430", subtitle: "pessoas que clicaram nos anuncios.", change: "+9.8%", tone: "good" },
  { label: "Leads", value: "7,284", subtitle: "pessoas que demonstraram interesse.", change: "+30 sem explicacao", tone: "bad" },
  { label: "Vendas", value: "428", subtitle: "leads que viraram clientes.", change: "+6.7%", tone: "good" },
  { label: "Receita", value: "$612,400", subtitle: "valor gerado pelas vendas.", change: "+15.2%", tone: "good" },
  { label: "ROAS", value: "7.21x", subtitle: "retorno para cada real investido.", change: "+0.4x", tone: "good" },
  { label: "Conversao", value: "5.67%", subtitle: "percentual que avancou no funil.", change: "-0.3pp", tone: "bad" },
];

export const campaigns: Campaign[] = [
  { id: "cmp_001", name: "MBA Growth Sprint - Lookalike 2%", channel: "Meta Ads", status: "active", investment: 18420, impressions: 680000, clicks: 28640, leads: 1810, sales: 112, revenue: 168000, ctr: 4.21, cpc: 0.64, cpl: 10.17, conversion: 6.32, roas: 9.12, owner: "Marina Costa", quality: "warning" },
  { id: "cmp_002", name: "Analytics Bootcamp - Search BR", channel: "Google Ads", status: "active", investment: 22100, impressions: 420000, clicks: 19880, leads: 1224, sales: 96, revenue: 144200, ctr: 4.73, cpc: 1.11, cpl: 18.05, conversion: 6.16, roas: 6.52, owner: "Rafael Nunes", quality: "healthy" },
  { id: "cmp_003", name: "Revenue Ops Webinar - Retargeting", channel: "Meta Ads", status: "learning", investment: 9700, impressions: 390000, clicks: 17310, leads: 1432, sales: 54, revenue: 68400, ctr: 4.44, cpc: 0.56, cpl: 6.77, conversion: 8.27, roas: 7.05, owner: "Bianca Lima", quality: "critical" },
  { id: "cmp_004", name: "Data Careers - Performance Max", channel: "Google Ads", status: "limited", investment: 14600, impressions: 880000, clicks: 22420, leads: 972, sales: 61, revenue: 90100, ctr: 2.55, cpc: 0.65, cpl: 15.02, conversion: 4.34, roas: 6.17, owner: "Caio Mendes", quality: "warning" },
  { id: "cmp_005", name: "CRM Automation Course - Broad", channel: "Meta Ads", status: "active", investment: 20100, impressions: 1050000, clicks: 40180, leads: 1846, sales: 105, revenue: 141700, ctr: 3.83, cpc: 0.50, cpl: 10.89, conversion: 4.59, roas: 7.05, owner: "Marina Costa", quality: "healthy" },
];

export const funnel = [
  { stage: "Impressoes", value: 3420000, loss: 0 },
  { stage: "Clicks", value: 128430, loss: 96.2 },
  { stage: "Visitantes", value: 105880, loss: 17.6 },
  { stage: "Inicio de formulario", value: 24320, loss: 77.0 },
  { stage: "Envios de lead", value: 7284, loss: 70.0 },
  { stage: "CRM recebido", value: 7148, loss: 1.9 },
  { stage: "Conversao registrada", value: 7054, loss: 1.3 },
  { stage: "Vendas", value: 428, loss: 93.9 },
];

export const performanceSeries = [
  { day: "Jun 1", investment: 2400, leads: 188, revenue: 14200 },
  { day: "Jun 5", investment: 3100, leads: 244, revenue: 22800 },
  { day: "Jun 9", investment: 3600, leads: 311, revenue: 28500 },
  { day: "Jun 13", investment: 4200, leads: 346, revenue: 37100 },
  { day: "Jun 17", investment: 3900, leads: 302, revenue: 33400 },
  { day: "Jun 21", investment: 4700, leads: 388, revenue: 46200 },
];

export const leads: Lead[] = [
  { id: "lead_10291", name: "Ana Beatriz Rocha", email: "ana.rocha@finclass.com", campaign: "MBA Growth Sprint - Lookalike 2%", channel: "Meta Ads", utmSource: "facebook", utmMedium: "paid_social", utmCampaign: "mba_growth_sprint_lal2", firstTouch: "2026-06-21 09:14", lastTouch: "2026-06-21 09:22", crmStatus: "Qualified", conversionStatus: "Registered", revenue: 1800, session: "ses_9k2a" },
  { id: "lead_10292", name: "Lucas Andrade", email: "lucas.andrade@gmail.com", campaign: "Revenue Ops Webinar - Retargeting", channel: "Meta Ads", utmSource: "instagram", utmMedium: "paid_social", utmCampaign: "revops_webinar_rt", firstTouch: "2026-06-21 10:02", lastTouch: "2026-06-21 10:08", crmStatus: "Created", conversionStatus: "Failed", revenue: 0, session: "ses_j71d" },
  { id: "lead_10293", name: "Camila Torres", email: "camila.torres@startup.io", campaign: "Analytics Bootcamp - Search BR", channel: "Google Ads", utmSource: "google", utmMedium: "cpc", utmCampaign: "analytics_bootcamp_search", firstTouch: "2026-06-21 11:36", lastTouch: "2026-06-21 12:04", crmStatus: "Won", conversionStatus: "Registered", revenue: 2400, session: "ses_4f8m" },
  { id: "lead_10294", name: "Henrique Viana", email: "henrique.viana@edtechlab.com", campaign: "Data Careers - Performance Max", channel: "Google Ads", utmSource: "google", utmMedium: "cpc", utmCampaign: "data_careers_pmax", firstTouch: "2026-06-21 13:11", lastTouch: "2026-06-21 13:13", crmStatus: "Rejected", conversionStatus: "Missing", revenue: 0, session: "ses_d0p1" },
  { id: "lead_10295", name: "Juliana Prado", email: "juliana.prado@opsnow.com", campaign: "CRM Automation Course - Broad", channel: "Meta Ads", utmSource: "facebook", utmMedium: "paid_social", utmCampaign: "crm_automation_broad", firstTouch: "2026-06-22 08:47", lastTouch: "2026-06-22 08:59", crmStatus: "Duplicated", conversionStatus: "Deduped", revenue: 0, session: "ses_v44z" },
];

export const events: EventRecord[] = [
  { id: "evt_90124", name: "LeadSubmitted", timestamp: "2026-06-21 10:08:44", leadId: "lead_10292", leadName: "Lucas Andrade", session: "ses_j71d", status: "failed", destination: "Meta CAPI", payload: { event_name: "Lead", event_id: "lead_10292_form_submit", email_hash: "a91c...e12", fbp: "fb.1.178203", campaign_id: "238612900", value: 0 }, response: { status: 400, message: "event_id already received with different external_id" }, error: "Meta rejected event because deduplication keys do not match browser pixel." },
  { id: "evt_90125", name: "CRMContactCreated", timestamp: "2026-06-21 10:08:49", leadId: "lead_10292", leadName: "Lucas Andrade", session: "ses_j71d", status: "delivered", destination: "CRM", payload: { email: "lucas.andrade@gmail.com", lifecycle_stage: "lead", owner: "sdr_pool", source: "instagram" }, response: { status: 201, crm_id: "crm_77120" } },
  { id: "evt_90131", name: "LeadSubmitted", timestamp: "2026-06-21 13:13:11", leadId: "lead_10294", leadName: "Henrique Viana", session: "ses_d0p1", status: "pending", destination: "Analytics DB", payload: { lead_id: "lead_10294", utm_campaign: "data_careers_pmax", gclid: null, form_variant: "short" }, response: { status: 202, queue: "analytics-ingest" } },
  { id: "evt_90136", name: "Purchase", timestamp: "2026-06-22 09:42:06", leadId: "lead_10293", leadName: "Camila Torres", session: "ses_4f8m", status: "delivered", destination: "Meta CAPI", payload: { event_name: "Purchase", value: 2400, currency: "USD", event_source_url: "/checkout/success" }, response: { status: 200, events_received: 1 } },
  { id: "evt_90142", name: "LeadSubmitted", timestamp: "2026-06-22 08:59:18", leadId: "lead_10295", leadName: "Juliana Prado", session: "ses_v44z", status: "deduped", destination: "CRM", payload: { email: "juliana.prado@opsnow.com", duplicate_key: "email+phone", source: "facebook" }, response: { status: 200, action: "merged", master_contact: "crm_66201" } },
];

export const qualityIssues: QualityIssue[] = [
  { id: "q1", label: "Leads duplicados", value: 18, delta: "+18 no caso atual", health: "warning", description: "Mesmo email ou telefone capturado por múltiplos formulários antes do merge no CRM.", affected: ["Revenue Ops Webinar - Retargeting"] },
  { id: "q2", label: "UTMs ausentes", value: 117, delta: "+3.8%", health: "warning", description: "Sessões de landing page sem utm_campaign ou chaves gclid/fbclid para atribuição.", affected: ["Data Careers - Performance Max"] },
  { id: "q3", label: "Emails inválidos", value: 23, delta: "-6 vs ontem", health: "healthy", description: "Falhas de sintaxe, domínios descartáveis ou aliases corporativos bloqueados.", affected: ["MBA Growth Sprint - Lookalike 2%"] },
  { id: "q4", label: "Divergências no CRM", value: 31, delta: "+9", health: "critical", description: "O CRM aceitou o contato, mas o lifecycle stage difere do modelo analítico.", affected: ["Revenue Ops Webinar - Retargeting"] },
  { id: "q5", label: "Falhas de conversão", value: 6, delta: "6 rejeitados", health: "critical", description: "Meta ou Google rejeitaram eventos server-side por chaves ausentes ou conflitos de dedupe.", affected: ["Revenue Ops Webinar - Retargeting"] },
  { id: "q6", label: "Divergências de campanha", value: 42, delta: "+2.1%", health: "warning", description: "O campaign id da plataforma de mídia aponta para outro nome normalizado de campanha.", affected: ["MBA Growth Sprint - Lookalike 2%", "Data Careers - Performance Max"] },
];

export const incidents: Incident[] = [
  { id: "inc_1048", title: "Discrepancia de leads entre Meta Ads e analytics", severity: "sev2", impact: "30 leads adicionais no workspace analitico em comparacao ao relatorio do Meta Ads para campanhas de retargeting.", status: "investigating", owner: "Growth Ops", openedAt: "2026-06-22 09:20", resolution: "Validate event_id generation after form retry and compare against pixel fire history." },
  { id: "inc_1047", title: "Sync de lifecycle stage do CRM atrasado", severity: "sev3", impact: "Status Qualified atrasado para 31 leads, afetando leitura de velocidade do pipeline.", status: "mitigated", owner: "RevOps", openedAt: "2026-06-21 16:42", resolution: "Backfilled CRM webhook queue and added retry visibility to workflow node." },
  { id: "inc_1046", title: "gclid ausente em landing page mobile", severity: "sev2", impact: "Confiança de atribuição de Performance Max reduzida para 117 leads.", status: "open", owner: "Marketing Engineering", openedAt: "2026-06-20 11:04", resolution: "Patch mobile router preserving query string during locale redirect." },
];

export const discrepancyRows = [
  { source: "Meta Ads", leads: 100, accepted: 94, rejected: 6, note: "Eventos rejeitados contêm pares event_id e external_id inconsistentes." },
  { source: "Workspace", leads: 130, accepted: 130, rejected: 0, note: "Analytics DB conta todos os eventos LeadSubmitted antes da deduplicação da plataforma." },
  { source: "CRM", leads: 112, accepted: 112, rejected: 0, note: "Dezoito contatos foram mesclados como duplicados após entrega do webhook." },
];

export const workflowLogs = [
  "10:08:44 webhook received LeadSubmitted lead_10292",
  "10:08:45 validation passed with warning: phone missing",
  "10:08:46 normalization mapped instagram / paid_social",
  "10:08:47 duplicate check found no CRM contact",
  "10:08:49 crm contact created crm_77120",
  "10:08:51 conversion api failed: event_id conflict",
  "10:09:03 analytics db write completed",
];
