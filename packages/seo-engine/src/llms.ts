import type { SettingsRecord } from "./types.js";

export function isLlmsTxtEnabled(settings: SettingsRecord): boolean {
  const modules =
    settings.modules && typeof settings.modules === "object"
      ? (settings.modules as Record<string, unknown>)
      : null;

  if (modules?.llms === false) {
    return false;
  }

  const llms =
    settings.llms && typeof settings.llms === "object"
      ? (settings.llms as Record<string, unknown>)
      : null;

  return llms?.enabled !== false;
}

export function generateLlmsTxt(
  settings: SettingsRecord,
  baseUrl: string,
  options?: { defaultSummary?: string },
): string | null {
  if (!isLlmsTxtEnabled(settings)) {
    return null;
  }

  const llms =
    settings.llms && typeof settings.llms === "object"
      ? (settings.llms as Record<string, unknown>)
      : null;

  const summary =
    typeof llms?.summary === "string" && llms.summary.trim().length > 0
      ? llms.summary.trim()
      : (options?.defaultSummary ??
        "This website provides tools and services for developers.");

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const lines = [
    `# ${normalizedBaseUrl.replace(/^https?:\/\//, "")}`,
    "",
    summary,
    "",
  ];

  const importantLinks = Array.isArray(llms?.importantLinks)
    ? llms.importantLinks
    : [];

  if (importantLinks.length > 0) {
    lines.push("## Important links");
    for (const link of importantLinks) {
      if (typeof link === "string" && link.trim()) {
        lines.push(`- ${link.trim()}`);
      } else if (link && typeof link === "object") {
        const record = link as { url?: string; label?: string };
        if (record.url) {
          lines.push(
            `- ${record.label ? `${record.label}: ` : ""}${record.url}`,
          );
        }
      }
    }
    lines.push("");
  }

  lines.push(`Sitemap: ${normalizedBaseUrl}/sitemap.xml`);
  return lines.join("\n");
}
