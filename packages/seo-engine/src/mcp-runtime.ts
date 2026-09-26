import { SEO_ENGINE_CAPABILITIES } from "./capabilities.js";
import { validateSeoChange, type SeoChange } from "./changes.js";
import { createInMemoryChangeHistoryStore } from "./history.js";
import { SEO_MCP_TOOL_DEFINITIONS } from "./mcp-contracts.js";
import type { SeoStorageAdapters } from "./storage/interfaces.js";
import type { SeoChangeRecord } from "./storage/interfaces.js";

export interface SeoMcpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: "tools/list" | "tools/call";
  params?: { name?: string; arguments?: Record<string, unknown> };
}

export interface SeoMcpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface SeoMcpHost {
  inspectSite?: (url: string) => Promise<unknown>;
  applyChange?: (change: SeoChange, context: { idempotencyKey: string }) => Promise<unknown>;
  verifyChange?: (change: SeoChange) => Promise<unknown>;
  createRollback?: (record: SeoChangeRecord) => Promise<SeoChange>;
  storage?: SeoStorageAdapters;
}

let sequence = 0;
function nextId() {
  sequence += 1;
  return `seo-change-${Date.now()}-${sequence}`;
}

/** Executes the safe, transport-neutral part of the MCP contract. */
export function createSeoMcpHandler(host: SeoMcpHost = {}) {
  const changes = host.storage?.changes ?? createInMemoryChangeHistoryStore();
  const appliedByIdempotencyKey = new Map<string, unknown>();
  return async (request: SeoMcpRequest): Promise<SeoMcpResponse> => {
    try {
      if (request.method === "tools/list") return { jsonrpc: "2.0", id: request.id, result: { tools: SEO_MCP_TOOL_DEFINITIONS } };
      const name = request.params?.name;
      const args = request.params?.arguments ?? {};
      if (!name) return { jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "Tool name is required" } };
      if (name === "seo.get_capabilities") return { jsonrpc: "2.0", id: request.id, result: { capabilities: SEO_ENGINE_CAPABILITIES } };
      if (name === "seo.inspect_site") {
        if (!host.inspectSite) throw new Error("This host does not provide inspectSite");
        return { jsonrpc: "2.0", id: request.id, result: await host.inspectSite(String(args.url ?? "")) };
      }
      if (name === "seo.propose_change") {
        const validation = validateSeoChange(args.change as SeoChange);
        if (!validation.valid) return { jsonrpc: "2.0", id: request.id, result: validation };
        const id = validation.normalized.audit?.changeId ?? nextId();
        const change = { ...validation.normalized, audit: { ...validation.normalized.audit, changeId: id, source: "mcp" as const, createdAt: new Date().toISOString() } };
        await changes.append({ id, change, audit: change.audit!, status: "proposed", createdAt: change.audit!.createdAt! });
        return { jsonrpc: "2.0", id: request.id, result: { ...validation, normalized: change, changeId: id } };
      }
      if (name === "seo.approve_change") {
        const changeId = String(args.changeId ?? "");
        const record = await changes.get(changeId);
        if (!record) throw new Error("Change proposal was not found");
        await changes.append({ ...record, status: "approved" });
        return { jsonrpc: "2.0", id: request.id, result: { changeId, status: "approved" } };
      }
      if (name === "seo.apply_change") {
        const changeId = String(args.changeId ?? "");
        const idempotencyKey = String(args.idempotencyKey ?? "");
        if (!idempotencyKey) throw new Error("idempotencyKey is required");
        if (appliedByIdempotencyKey.has(idempotencyKey)) {
          return { jsonrpc: "2.0", id: request.id, result: { changeId, status: "applied", result: appliedByIdempotencyKey.get(idempotencyKey), replayed: true } };
        }
        const record = await changes.get(changeId);
        if (!record || record.status !== "approved") throw new Error("Only approved changes can be applied");
        if (!host.applyChange) throw new Error("This host does not provide applyChange");
        const result = await host.applyChange(record.change, { idempotencyKey });
        appliedByIdempotencyKey.set(idempotencyKey, result);
        await changes.append({ ...record, status: "applied", appliedAt: new Date().toISOString() });
        return { jsonrpc: "2.0", id: request.id, result: { changeId, status: "applied", result } };
      }
      if (name === "seo.verify_change") {
        const record = await changes.get(String(args.changeId ?? ""));
        if (!record) throw new Error("Change record was not found");
        if (!host.verifyChange) throw new Error("This host does not provide verifyChange");
        return { jsonrpc: "2.0", id: request.id, result: await host.verifyChange(record.change) };
      }
      if (name === "seo.rollback_change") {
        const record = await changes.get(String(args.changeId ?? ""));
        if (!record) throw new Error("Change record was not found");
        if (!host.createRollback) throw new Error("This host does not provide createRollback");
        const rollback = await host.createRollback(record);
        const validation = validateSeoChange(rollback);
        if (!validation.valid) return { jsonrpc: "2.0", id: request.id, result: validation };
        const id = nextId();
        const change = { ...validation.normalized, audit: { ...validation.normalized.audit, changeId: id, source: "mcp" as const, rollbackOf: record.id, createdAt: new Date().toISOString() } };
        await changes.append({ id, change, audit: change.audit!, status: "proposed", createdAt: change.audit!.createdAt! });
        return { jsonrpc: "2.0", id: request.id, result: { ...validation, normalized: change, changeId: id, rollbackOf: record.id } };
      }
      throw new Error(`Unsupported MCP tool: ${name}`);
    } catch (error) {
      return { jsonrpc: "2.0", id: request.id, error: { code: -32000, message: error instanceof Error ? error.message : "MCP tool failed" } };
    }
  };
}
