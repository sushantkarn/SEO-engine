export type SeoAuditSeverity = "info" | "warning" | "error";

export interface SeoAuditFinding {
  id: string;
  rule: string;
  severity: SeoAuditSeverity;
  url: string;
  message: string;
  evidence?: Record<string, unknown>;
  recommendation?: string;
}

export interface SeoAuditSummary {
  total: number;
  info: number;
  warning: number;
  error: number;
}

export interface SeoAuditReport {
  id: string;
  url: string;
  generatedAt: string;
  pagesScanned: number;
  findings: SeoAuditFinding[];
  summary: SeoAuditSummary;
}

/** Creates a stable, serializable audit report from adapter-produced findings. */
export function createSeoAuditReport(input: {
  id: string;
  url: string;
  generatedAt?: string;
  pagesScanned?: number;
  findings?: SeoAuditFinding[];
}): SeoAuditReport {
  const findings = [...(input.findings ?? [])].sort((a, b) => a.severity.localeCompare(b.severity) || a.id.localeCompare(b.id));
  const summary = findings.reduce<SeoAuditSummary>((result, finding) => {
    result.total += 1;
    result[finding.severity] += 1;
    return result;
  }, { total: 0, info: 0, warning: 0, error: 0 });
  return {
    id: input.id,
    url: input.url,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    pagesScanned: input.pagesScanned ?? 0,
    findings,
    summary,
  };
}
