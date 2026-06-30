export function normalizeSeoUrlPath(input: string): string {
  const raw = (input || "").trim();
  if (!raw) return "/";

  let path = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      path = new URL(raw).pathname || "/";
    } catch {
      path = raw;
    }
  }

  path = path.split("?")[0]?.split("#")[0] || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

export function getSeoUrlVariants(input: string): string[] {
  const normalized = normalizeSeoUrlPath(input);
  const variants = new Set<string>([normalized]);
  if (normalized !== "/") {
    variants.add(`${normalized}/`);
  }
  return Array.from(variants);
}
