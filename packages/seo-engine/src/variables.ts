import type { PageContext } from "./types.js";

export function replaceVariables(
  template: string,
  context: PageContext,
  siteName: string,
  separator: string,
): string {
  const date = new Date();
  const currentMonth = date.toLocaleString("default", { month: "long" });
  const currentYear = date.getFullYear().toString();

  return template
    .replace(/%title%/g, context.title)
    .replace(/%sitename%/g, siteName)
    .replace(/%sep%/g, separator)
    .replace(/%excerpt%/g, context.description || "")
    .replace(/%current_month%/g, currentMonth)
    .replace(/%current_year%/g, currentYear);
}
