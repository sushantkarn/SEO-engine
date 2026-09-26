import type { RedirectMatch, RedirectRule } from "./types.js";

export function normalizeRedirectPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "/";

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).pathname || "/";
    }
  } catch {
    // Fall through to path normalization.
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function matchRedirect(
  pathname: string,
  rules: RedirectRule[],
): RedirectMatch | null {
  const normalizedPath = normalizeRedirectPath(pathname);
  const activeRules = rules.filter((rule) => rule.isActive !== false);

  for (const rule of activeRules) {
    const source = rule.sourceUrl;
    const matchType = rule.matchType || "EXACT";

    let isMatch = false;

    if (matchType === "EXACT") {
      isMatch = normalizeRedirectPath(source) === normalizedPath;
    } else if (matchType === "START") {
      isMatch = normalizedPath.startsWith(normalizeRedirectPath(source));
    } else if (matchType === "END") {
      isMatch = normalizedPath.endsWith(source);
    } else if (matchType === "CONTAIN") {
      isMatch = normalizedPath.includes(source);
    } else if (matchType === "REGEX") {
      try {
        const regex = new RegExp(source, "i");
        isMatch = regex.test(pathname);
      } catch {
        isMatch = false;
      }
    }

    if (isMatch) {
      let code = 301;
      if (typeof rule.type === "number") {
        code = rule.type;
      } else if (typeof rule.type === "string") {
        if (rule.type === "TEMPORARY") code = 302;
        else if (rule.type === "TEMPORARY_307") code = 307;
        else if (rule.type === "GONE") code = 410;
        else if (rule.type === "LEGAL") code = 451;
      }

      return {
        targetUrl: rule.targetUrl,
        type: code,
      };
    }
  }

  return null;
}

export interface RedirectGraphIssue {
  path: string[];
  type: "loop" | "chain";
}

/** Finds redirect cycles and chains before rules are activated. */
export function inspectRedirectGraph(
  rules: RedirectRule[],
  options: { maxChainLength?: number } = {},
): RedirectGraphIssue[] {
  const activeRules = rules.filter((rule) => rule.isActive !== false);
  const next = new Map<string, string>();
  for (const rule of activeRules) {
    const source = normalizeRedirectPath(rule.sourceUrl);
    const target = normalizeRedirectPath(rule.targetUrl);
    if (source !== target && !next.has(source)) next.set(source, target);
  }

  const issues: RedirectGraphIssue[] = [];
  const maxChainLength = Math.max(2, options.maxChainLength ?? 3);
  for (const start of next.keys()) {
    const path: string[] = [];
    const seen = new Map<string, number>();
    let current: string | undefined = start;
    while (current && next.has(current) && path.length <= maxChainLength + 1) {
      const previousIndex = seen.get(current);
      if (previousIndex !== undefined) {
        issues.push({ path: path.slice(previousIndex).concat(current), type: "loop" });
        break;
      }
      seen.set(current, path.length);
      path.push(current);
      current = next.get(current);
    }
    if (current && !seen.has(current) && path.length > maxChainLength) {
      issues.push({ path: path.concat(current), type: "chain" });
    }
  }

  return issues;
}
