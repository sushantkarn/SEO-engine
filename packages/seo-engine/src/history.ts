import type { ChangeHistoryStore, SeoChangeRecord } from "./storage/interfaces.js";

/** Small dependency-free store for tests, serverless handlers, and development hosts. */
export function createInMemoryChangeHistoryStore(initial: SeoChangeRecord[] = []): ChangeHistoryStore {
  const records = new Map(initial.map((record) => [record.id, { ...record }]));
  return {
    async append(record) {
      records.set(record.id, { ...record });
    },
    async get(id) {
      const record = records.get(id);
      return record ? { ...record } : null;
    },
    async list(options = {}) {
      let result = [...records.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      if (options.route) {
        result = result.filter(({ change }) => {
          const candidate = "route" in change ? change.route : "from" in change ? change.from : "path" in change ? change.path : "source" in change ? change.source : "";
          return candidate === options.route;
        });
      }
      return result.slice(0, options.limit ?? 100).map((record) => ({ ...record }));
    },
  };
}
