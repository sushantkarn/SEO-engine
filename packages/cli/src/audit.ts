import { normalizeJsonLd } from "@gmbranker/seo-engine-core";

export type AuditRule =
  | "title"
  | "description"
  | "canonical"
  | "schema"
  | "robots"
  | "robots-ai"
  | "llms"
  | "social"
  | "hreflang"
  | "viewport";

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
  fetchText?: (url: string) => Promise<string>;
}

function extractTag(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function extractAttribute(
  html: string,
  tagName: string,
  attributes: Record<string, string>,
): string | null {
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  for (const tag of html.matchAll(tagPattern)) {
    const source = tag[0];
    const matches = Object.entries(attributes).every(([name, value]) =>
      new RegExp(`${name}\\s*=\\s*["']${value}["']`, "i").test(source),
    );
    if (matches) {
      const content = source.match(/content\s*=\s*["']([^"']*)["']/i);
      const href = source.match(/href\s*=\s*["']([^"']*)["']/i);
      return (content?.[1] ?? href?.[1] ?? "").trim() || null;
    }
  }
  return null;
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
  const fetchText =
    options.fetchText ??
    (async (url: string) => {
      const response = await fetch(url, {
        headers: { "User-Agent": "seo-engine-cli/0.2.5" },
      });
      if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
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
    const description = extractAttribute(html, "meta", { name: "description" });
    findings.push({
      rule: "description",
      status: description ? "pass" : "fail",
      message: description
        ? "Meta description present"
        : "Missing meta description",
    });
  }

  if (rules.includes("canonical")) {
    const canonical = extractAttribute(html, "link", { rel: "canonical" });
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
    const robots = extractAttribute(html, "meta", { name: "robots" });
    findings.push({
      rule: "robots",
      status: robots ? "pass" : "warning",
      message: robots ? `Robots: ${robots}` : "No robots meta tag",
    });
  }

  if (rules.includes("robots-ai")) {
    const robotsUrl = new URL("/robots.txt", options.url).toString();
    let robotsText = "";
    try {
      robotsText = await fetchText(robotsUrl);
    } catch {
      // A missing robots.txt is reported as a warning, not a CLI crash.
    }
    const hasAiPolicy = /User-agent:\s*(GPTBot|OAI-SearchBot|ClaudeBot|PerplexityBot)/i.test(robotsText);
    findings.push({
      rule: "robots-ai",
      status: hasAiPolicy ? "pass" : "warning",
      message: hasAiPolicy
        ? "AI crawler policy found in robots.txt"
        : "No explicit AI crawler policy found in robots.txt",
    });
  }

  if (rules.includes("llms")) {
    const llmsUrl = new URL("/llms.txt", options.url).toString();
    let llmsText = "";
    try {
      llmsText = await fetchText(llmsUrl);
    } catch {
      // A missing llms.txt is reported as a warning, not a CLI crash.
    }
    findings.push({
      rule: "llms",
      status: llmsText.trim() ? "pass" : "warning",
      message: llmsText.trim() ? "llms.txt is available" : "llms.txt is empty",
    });
  }

  if (rules.includes("social")) {
    const ogTitle = extractAttribute(html, "meta", { property: "og:title" });
    const twitterCard = extractAttribute(html, "meta", { name: "twitter:card" });
    findings.push({
      rule: "social",
      status: ogTitle && twitterCard ? "pass" : "warning",
      message: ogTitle && twitterCard
        ? "Open Graph and Twitter metadata present"
        : "Open Graph title or Twitter card metadata is missing",
    });
  }

  if (rules.includes("hreflang")) {
    const links = [...html.matchAll(/<link\\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi)];
    findings.push({
      rule: "hreflang",
      status: links.length > 0 ? "pass" : "warning",
      message: links.length > 0 ? `${links.length} hreflang link(s) found` : "No hreflang links found",
    });
  }

  if (rules.includes("viewport")) {
    const viewport = extractAttribute(html, "meta", { name: "viewport" });
    findings.push({
      rule: "viewport",
      status: viewport ? "pass" : "warning",
      message: viewport ? "Viewport metadata present" : "Viewport metadata is missing",
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
