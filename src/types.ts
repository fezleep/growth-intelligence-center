import type { LucideIcon } from "lucide-react";

export type Channel = "Meta Ads" | "Google Ads" | "Organic" | "Referral";
export type Health = "healthy" | "warning" | "critical";
export type EventStatus = "delivered" | "failed" | "pending" | "deduped";
export type Severity = "sev1" | "sev2" | "sev3";
export type IncidentType =
  | "duplicate lead"
  | "crm sync failure"
  | "missing utm"
  | "broken webhook"
  | "meta conversion api error"
  | "attribution mismatch";

export interface Metric {
  label: string;
  value: string;
  change: string;
  subtitle?: string;
  tone: "good" | "bad" | "neutral";
}

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: "active" | "learning" | "limited" | "paused";
  investment: number;
  impressions: number;
  clicks: number;
  leads: number;
  sales: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpl: number;
  conversion: number;
  roas: number;
  owner: string;
  quality: Health;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  campaign: string;
  channel: Channel;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  firstTouch: string;
  lastTouch: string;
  crmStatus: "Created" | "Qualified" | "Duplicated" | "Rejected" | "Won";
  conversionStatus: "Registered" | "Missing" | "Failed" | "Deduped";
  revenue: number;
  session: string;
}

export interface EventRecord {
  id: string;
  name: string;
  timestamp: string;
  leadId: string;
  leadName: string;
  session: string;
  status: EventStatus;
  destination: "CRM" | "Meta CAPI" | "Analytics DB" | "Webhook" | "Google Ads";
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
  error?: string;
}

export interface Incident {
  id: string;
  title: string;
  type?: IncidentType;
  severity: Severity;
  impact: string;
  status: "open" | "investigating" | "mitigated" | "resolved";
  owner: string;
  openedAt: string;
  resolution: string;
  affectedLeadId?: string;
  relatedEventIds?: string[];
  relatedQualityIssueId?: string;
  logs?: string[];
  evidence?: string[];
}

export interface QualityIssue {
  id: string;
  label: string;
  value: number;
  delta: string;
  health: Health;
  description: string;
  affected: string[];
}

export interface AlertRecord {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  incidentId: string;
  createdAt: string;
  status: "active" | "cleared";
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}
