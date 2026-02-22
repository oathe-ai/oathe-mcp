// Response types for Oathe API endpoints.
// Adapted from oathe-website/src/lib/types.ts — standalone copy to avoid import.meta.env coupling.

export interface SubmitResponse {
  audit_id: string;
  queue_position?: number;
  notification_email?: string;
  deduplicated?: boolean;
}

export interface AuditStatusResponse {
  audit_id: string;
  skill_url?: string;
  status: string;
  stage_label?: string;
  error_message?: string;
  report?: {
    trust_score: number;
    verdict: string;
    summary?: string;
    recommendation?: string;
    category_scores?: Record<string, { score: number; weight: number; findings: string[] }>;
    findings?: Finding[];
  };
}

export interface Finding {
  pattern_id: string;
  dimension: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  evidence_snippet: string;
  score_impact: number;
  sources: Array<'code' | 'model'>;
  agreement: 'both' | 'code_only' | 'model_only';
}

export interface SkillReport {
  audit_id: string;
  skill_url: string;
  skill_slug: string;
  timestamp: string;
  trust_score: number;
  verdict: string;
  summary: string;
  recommendation: string;
  category_scores: Record<string, { score: number; weight: number; findings: string[] }>;
  findings: Finding[];
}

export interface SkillSummaryResponse {
  skill_slug: string;
  score: number | null;
  verdict: string | null;
  recommendation: string | null;
  findings_count: number;
  critical_findings: number;
  high_findings: number;
  methodology_version: string | null;
  audited_at: string | null;
  report_url: string;
}

export interface SearchResult {
  audit_id: string;
  skill_url: string;
  skill_slug: string;
  trust_score: number;
  verdict: string;
  status: string;
  completed_at: string | null;
  stale: number;
}

/**
 * Current search response is a flat array. Phase 2D may wrap this in
 * `{ data: SearchResult[], pagination: { cursor, has_more } }`.
 */
export type SearchResponse = SearchResult[];
