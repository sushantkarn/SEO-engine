export function extractJsonLdPayload(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const scriptMatch = trimmed.match(/^<script\b[^>]*>([\s\S]*?)<\/script>$/i);
  if (scriptMatch?.[1]) {
    return scriptMatch[1].trim();
  }

  return trimmed;
}

export function normalizeJsonLd(input: string | null | undefined): {
  value: string | null;
  error?: string;
} {
  const payload = extractJsonLdPayload(input);
  if (!payload) {
    return { value: null };
  }

  try {
    const parsed = JSON.parse(payload) as unknown;
    if (
      parsed === null ||
      (typeof parsed !== "object" && !Array.isArray(parsed))
    ) {
      return { value: null, error: "Schema must be a JSON object or array." };
    }

    return { value: JSON.stringify(parsed) };
  } catch {
    return { value: null, error: "Invalid JSON-LD. Please enter valid JSON." };
  }
}

export function normalizeSeoSchemaValue(schema: unknown): {
  value: Record<string, unknown> | unknown[] | null;
  error?: string;
} {
  if (schema === null || schema === undefined || schema === "") {
    return { value: null };
  }

  if (typeof schema === "string") {
    const normalized = normalizeJsonLd(schema);
    if (normalized.error) {
      return { value: null, error: normalized.error };
    }
    if (!normalized.value) {
      return { value: null };
    }
    try {
      const parsed = JSON.parse(normalized.value) as unknown;
      if (Array.isArray(parsed) || (parsed && typeof parsed === "object")) {
        return { value: parsed as Record<string, unknown> | unknown[] };
      }
      return { value: null, error: "Schema must be a JSON object or array." };
    } catch {
      return {
        value: null,
        error: "Invalid JSON-LD. Please enter valid JSON.",
      };
    }
  }

  if (Array.isArray(schema) || (schema && typeof schema === "object")) {
    return { value: schema as Record<string, unknown> | unknown[] };
  }

  return { value: null, error: "Schema must be a JSON object or array." };
}

export function parseSchemaFromSeoJson(
  seoJson: string | null | undefined,
): Record<string, unknown> | unknown[] | null {
  if (!seoJson) return null;
  try {
    const parsed = JSON.parse(seoJson) as Record<string, unknown>;
    const normalized = normalizeSeoSchemaValue(parsed?.schema);
    return normalized.value;
  } catch {
    return null;
  }
}

export function serializeJsonLd(
  graph: Record<string, unknown> | unknown[],
): string {
  return JSON.stringify(graph);
}
