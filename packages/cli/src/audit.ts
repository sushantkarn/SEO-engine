import { normalizeJsonLd } from "@seo-engine/core";

export type AuditRule =
  | "title"
  | "description"
  | "canonical"
  | "schema"
  | "robots"
  | "robots-ai"
  | "llms";

export interface AuditFinding {
  rule: AuditRule;
  status: "pass" | "fail" | "warning";
  message: string;
}

export interface AuditReport {
  url: string;
  findings: AuditFinding[];
  passed: boolean;
}

export interface AuditOptions {
  url: string;
  rules?: AuditRule[];
  fetchHtml?: (url: string) => Promise<string>;
}

function extractTag(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) blocks.push(match[1].trim());
  }
  return blocks;
}

export async function auditUrl(options: AuditOptions): Promise<AuditReport> {
  const rules = options.rules ?? [
    "title",
    "description",
    "canonical",
    "schema",
    "robots",
  ];

  const fetchHtml =
    options.fetchHtml ??
    (async (url: string) => {
      const response = await fetch(url, {
        headers: { "User-Agent": "seo-engine-cli/0.1.0" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      return response.text();
    });

  const html = await fetchHtml(options.url);
  const findings: AuditFinding[] = [];

  if (rules.includes("title")) {
    const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
    findings.push({
      rule: "title",
      status: title ? "pass" : "fail",
      message: title ? `Title: ${title}` : "Missing <title> tag",
    });
  }

  if (rules.includes("description")) {
    const description = extractTag(
      html,
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    );
    findings.push({
      rule: "description",
      status: description ? "pass" : "fail",
      message: description
        ? "Meta description present"
        : "Missing meta description",
    });
  }

  if (rules.includes("canonical")) {
    const canonical = extractTag(
      html,
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i,
    );
    findings.push({
      rule: "canonical",
      status: canonical ? "pass" : "warning",
      message: canonical
        ? `Canonical: ${canonical}`
        : "No canonical link found",
    });
  }

  if (rules.includes("schema")) {
    const blocks = extractJsonLdBlocks(html);
    const validBlocks = blocks.filter(
      (block) => !normalizeJsonLd(block).error,
    );
    findings.push({
      rule: "schema",
      status: validBlocks.length > 0 ? "pass" : "warning",
      message:
        validBlocks.length > 0
          ? `${validBlocks.length} valid JSON-LD block(s)`
          : "No valid JSON-LD found",
    });
  }

  if (rules.includes("robots")) {
    const robots = extractTag(
      html,
      /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    );
    findings.push({
      rule: "robots",
      status: robots ? "pass" : "warning",
      message: robots ? `Robots: ${robots}` : "No robots meta tag",
    });
  }

  if (rules.includes("robots-ai")) {
    findings.push({
      rule: "robots-ai",
      status: "warning",
      message:
        "AI crawler policy audit requires fetching /robots.txt (use audit --rules robots-ai with extended fetch in CI)",
    });
  }

  if (rules.includes("llms")) {
    findings.push({
      rule: "llms",
      status: "warning",
      message:
        "llms.txt audit requires fetching /llms.txt (configure in CI pipeline)",
    });
  }

  const passed = findings.every(
    (finding) => finding.status === "pass" || finding.status === "warning",
  );

  return {
    url: options.url,
    findings,
    passed,
  };
}

export function formatAuditReport(report: AuditReport): string {
  const lines = [`Audit: ${report.url}`, ""];
  for (const finding of report.findings) {
    const icon =
      finding.status === "pass"
        ? "✓"
        : finding.status === "warning"
          ? "!"
          : "✗";
    lines.push(`${icon} [${finding.rule}] ${finding.message}`);
  }
  lines.push("", report.passed ? "PASSED" : "FAILED");
  return lines.join("\n");
}

export function parseRulesArg(value: string | undefined): AuditRule[] | undefined {
  if (!value) return undefined;
  return value.split(",").map((rule) => rule.trim()) as AuditRule[];
}
