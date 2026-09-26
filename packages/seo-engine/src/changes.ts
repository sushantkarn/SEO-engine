export type SeoChange =
  | { type: "UPDATE_PAGE_METADATA"; route: string; changes: { title?: string; description?: string; canonicalUrl?: string; robotsIndex?: boolean; robotsFollow?: boolean } }
  | { type: "ADD_JSON_LD"; route: string; schema: Record<string, unknown> }
  | { type: "CREATE_REDIRECT"; from: string; to: string; statusCode?: 301 | 302 | 307 | 308 }
  | { type: "ADD_INTERNAL_LINK"; source: string; target: string; anchor: string }
  | { type: "UPDATE_ROBOTS_POLICY"; path: string; directive: "index" | "noindex" | "follow" | "nofollow" };

export type SeoChangeValidation =
  | { valid: true; normalized: SeoChange; warnings: string[] }
  | { valid: false; errors: string[]; warnings: string[] };

function route(value: string, field: string) {
  if (!value.trim()) return `${field} is required`;
  if (!value.startsWith("/")) return `${field} must be an internal path`;
  return null;
}

/** Validates GPT/MCP proposals before an adapter or CMS can execute them. */
export function validateSeoChange(change: SeoChange): SeoChangeValidation {
  const warnings: string[] = [];
  if (change.type === "UPDATE_PAGE_METADATA") {
    const error = route(change.route, "route");
    if (error) return { valid: false, errors: [error], warnings };
    if (!change.changes.title && !change.changes.description && !change.changes.canonicalUrl && change.changes.robotsIndex === undefined && change.changes.robotsFollow === undefined) {
      return { valid: false, errors: ["At least one metadata field is required"], warnings };
    }
    if (change.changes.title && change.changes.title.length > 160) warnings.push("Title is longer than common search-result limits");
    if (change.changes.description && change.changes.description.length > 320) warnings.push("Description is longer than common search-result limits");
    return { valid: true, normalized: change, warnings };
  }
  if (change.type === "ADD_JSON_LD") {
    const error = route(change.route, "route");
    if (error) return { valid: false, errors: [error], warnings };
    if (!change.schema["@type"]) warnings.push("JSON-LD does not include an @type");
    return { valid: true, normalized: change, warnings };
  }
  if (change.type === "CREATE_REDIRECT") {
    const fromError = route(change.from, "from");
    const toError = route(change.to, "to");
    if (fromError || toError) return { valid: false, errors: [fromError, toError].filter(Boolean) as string[], warnings };
    if (change.from === change.to) return { valid: false, errors: ["Redirect source and target cannot be identical"], warnings };
    return { valid: true, normalized: { ...change, statusCode: change.statusCode ?? 301 }, warnings };
  }
  if (change.type === "ADD_INTERNAL_LINK") {
    const sourceError = route(change.source, "source");
    const targetError = route(change.target, "target");
    if (sourceError || targetError) return { valid: false, errors: [sourceError, targetError].filter(Boolean) as string[], warnings };
    if (!change.anchor.trim()) return { valid: false, errors: ["anchor is required"], warnings };
    if (change.source === change.target) return { valid: false, errors: ["Internal link source and target cannot be identical"], warnings };
    return { valid: true, normalized: { ...change, anchor: change.anchor.trim() }, warnings };
  }
  const error = route(change.path, "path");
  if (error) return { valid: false, errors: [error], warnings };
  return { valid: true, normalized: change, warnings };
}
