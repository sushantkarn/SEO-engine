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

  const match = activeRules.find((rule) => {
    const source = normalizeRedirectPath(rule.sourceUrl);
    return source === normalizedPath;
  });

  if (!match) {
    return null;
  }

  return {
    targetUrl: match.targetUrl,
    type: match.type ?? 301,
  };
}
