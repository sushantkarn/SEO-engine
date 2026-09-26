export interface SeoChangeAudit {
  changeId?: string;
  actor?: string;
  source?: "mcp" | "ui" | "cli" | "system";
  reason?: string;
  createdAt?: string;
  rollbackOf?: string;
  rollback?: {
    restoresChangeId: string;
    snapshot?: unknown;
  };
}

type SeoChangePayload =
  | { type: "UPDATE_PAGE_METADATA"; route: string; changes: { title?: string; description?: string; canonicalUrl?: string; robotsIndex?: boolean; robotsFollow?: boolean; noarchive?: boolean; nosnippet?: boolean; noimageindex?: boolean; maxSnippet?: number; maxImagePreview?: "none" | "standard" | "large"; maxVideoPreview?: number } }
  | { type: "UPDATE_SOCIAL_METADATA"; route: string; changes: { ogTitle?: string; ogDescription?: string; ogUrl?: string; ogImage?: string; ogImageAlt?: string; twitterTitle?: string; twitterDescription?: string; twitterImage?: string; twitterCard?: "summary" | "summary_large_image" } }
  | { type: "ADD_JSON_LD"; route: string; schema: Record<string, unknown> | Array<Record<string, unknown>> }
  | { type: "CREATE_REDIRECT"; from: string; to: string; statusCode?: 301 | 302 | 307 | 308 }
  | { type: "ADD_INTERNAL_LINK"; source: string; target: string; anchor: string }
  | { type: "UPDATE_ROBOTS_POLICY"; path: string; directive: "index" | "noindex" | "follow" | "nofollow" };

export type SeoChange = SeoChangePayload & { audit?: SeoChangeAudit };

export type SeoChangeValidation =
  | { valid: true; normalized: SeoChange; warnings: string[] }
  | { valid: false; errors: string[]; warnings: string[] };

function validateAudit(audit: SeoChangeAudit | undefined, warnings: string[]) {
  if (!audit) return null;
  if (audit.changeId !== undefined && !audit.changeId.trim()) return "audit.changeId cannot be empty";
  if (audit.actor !== undefined && !audit.actor.trim()) return "audit.actor cannot be empty";
  if (audit.reason !== undefined && !audit.reason.trim()) return "audit.reason cannot be empty";
  if (audit.createdAt !== undefined && Number.isNaN(Date.parse(audit.createdAt))) {
    return "audit.createdAt must be a valid ISO date";
  }
  if (audit.rollback && !audit.rollback.restoresChangeId.trim()) {
    return "audit.rollback.restoresChangeId is required";
  }
  if (audit.rollbackOf && audit.rollbackOf === audit.changeId) {
    warnings.push("A change should not roll itself back");
  }
  return null;
}

function route(value: string, field: string) {
  if (!value.trim()) return `${field} is required`;
  if (!value.startsWith("/")) return `${field} must be an internal path`;
  return null;
}

/** Validates GPT/MCP proposals before an adapter or CMS can execute them. */
export function validateSeoChange(change: SeoChange): SeoChangeValidation {
  const warnings: string[] = [];
  const auditError = validateAudit(change.audit, warnings);
  if (auditError) return { valid: false, errors: [auditError], warnings };
  if (change.type === "UPDATE_PAGE_METADATA") {
    const error = route(change.route, "route");
    if (error) return { valid: false, errors: [error], warnings };
    if (Object.keys(change.changes).length === 0) {
      return { valid: false, errors: ["At least one metadata field is required"], warnings };
    }
    if (change.changes.canonicalUrl && !/^https?:\/\//i.test(change.changes.canonicalUrl)) {
      return { valid: false, errors: ["canonicalUrl must be an absolute HTTP(S) URL"], warnings };
    }
    if (change.changes.title && change.changes.title.length > 160) warnings.push("Title is longer than common search-result limits");
    if (change.changes.description && change.changes.description.length > 320) warnings.push("Description is longer than common search-result limits");
    return { valid: true, normalized: change, warnings };
  }
  if (change.type === "UPDATE_SOCIAL_METADATA") {
    const error = route(change.route, "route");
    if (error) return { valid: false, errors: [error], warnings };
    if (Object.keys(change.changes).length === 0) {
      return { valid: false, errors: ["At least one social field is required"], warnings };
    }
    for (const field of ["ogUrl", "ogImage", "twitterImage"] as const) {
      const value = change.changes[field];
      if (value && !/^https?:\/\//i.test(value) && !value.startsWith("/")) {
        return { valid: false, errors: [`${field} must be an absolute URL or internal path`], warnings };
      }
    }
    return { valid: true, normalized: change, warnings };
  }
  if (change.type === "ADD_JSON_LD") {
    const error = route(change.route, "route");
    if (error) return { valid: false, errors: [error], warnings };
    const schemas = Array.isArray(change.schema) ? change.schema : [change.schema];
    if (schemas.some((schema) => !schema["@type"])) warnings.push("JSON-LD does not include an @type");
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
