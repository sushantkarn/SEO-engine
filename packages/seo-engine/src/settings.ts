import type { SettingsRecord } from "./types.js";

export function mergeSettings(
  existing: SettingsRecord,
  patch: SettingsRecord,
): SettingsRecord {
  return {
    ...existing,
    ...patch,
  };
}

export function getSeparator(
  settings: SettingsRecord | null | undefined,
): string {
  if (!settings) return "|";

  const general = settings.general;
  if (
    general &&
    typeof general === "object" &&
    typeof (general as { separator?: unknown }).separator === "string"
  ) {
    return (general as { separator: string }).separator;
  }

  if (typeof settings.separator === "string" && settings.separator.length > 0) {
    return settings.separator;
  }

  return "|";
}

export function isSitemapEnabled(settings: SettingsRecord): boolean {
  return settings.enableSitemap !== false;
}

export function getSitemapMaxItems(settings: SettingsRecord): number {
  return typeof settings.itemsPerSitemap === "number" &&
    settings.itemsPerSitemap > 0
    ? settings.itemsPerSitemap
    : 1000;
}
