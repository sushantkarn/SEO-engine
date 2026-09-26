export type SeoMcpToolKind = "read" | "preview" | "apply" | "verify";

export interface SeoMcpToolDefinition {
  name: string;
  title: string;
  kind: SeoMcpToolKind;
  description: string;
  readOnly: boolean;
  destructive: boolean;
  requiresApproval: boolean;
  inputSchema: Record<string, unknown>;
}

/** Host-neutral MCP discovery contract. The host supplies transport, auth, and handlers. */
export const SEO_MCP_TOOL_DEFINITIONS: readonly SeoMcpToolDefinition[] = [
  { name: "seo.get_capabilities", title: "Get SEO capabilities", kind: "read", description: "Discover stable, beta, and planned SEO engine capabilities for this host.", readOnly: true, destructive: false, requiresApproval: false, inputSchema: { type: "object", properties: {} } },
  { name: "seo.inspect_site", title: "Inspect site SEO", kind: "read", description: "Return provenance-aware metadata, schema, links, audit, and provider evidence.", readOnly: true, destructive: false, requiresApproval: false, inputSchema: { type: "object", properties: { url: { type: "string" } } } },
  { name: "seo.propose_change", title: "Propose SEO change", kind: "preview", description: "Validate and preview a structured SEO change without mutating the host.", readOnly: true, destructive: false, requiresApproval: false, inputSchema: { type: "object", required: ["change"], properties: { change: { type: "object" } } } },
  { name: "seo.approve_change", title: "Approve SEO change", kind: "apply", description: "Record explicit approval for a validated proposal.", readOnly: false, destructive: false, requiresApproval: true, inputSchema: { type: "object", required: ["changeId"], properties: { changeId: { type: "string" } } } },
  { name: "seo.apply_change", title: "Apply SEO change", kind: "apply", description: "Apply an approved change through a host adapter with idempotency and verification.", readOnly: false, destructive: true, requiresApproval: true, inputSchema: { type: "object", required: ["changeId", "idempotencyKey"], properties: { changeId: { type: "string" }, idempotencyKey: { type: "string" } } } },
  { name: "seo.verify_change", title: "Verify SEO change", kind: "verify", description: "Re-read the host and return before/after evidence for an applied change.", readOnly: true, destructive: false, requiresApproval: false, inputSchema: { type: "object", required: ["changeId"], properties: { changeId: { type: "string" } } } },
  { name: "seo.rollback_change", title: "Rollback SEO change", kind: "apply", description: "Create a guarded rollback proposal from recorded change history.", readOnly: false, destructive: true, requiresApproval: true, inputSchema: { type: "object", required: ["changeId"], properties: { changeId: { type: "string" } } } },
] as const;

export function getSeoMcpTool(name: string): SeoMcpToolDefinition | null {
  return SEO_MCP_TOOL_DEFINITIONS.find((tool) => tool.name === name) ?? null;
}
