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

export type SchemaValidationIssue = {
  level: "error" | "warning";
  message: string;
  path?: string;
};

export type SchemaValidationResult = {
  valid: boolean;
  issues: SchemaValidationIssue[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function getAuthorName(author: unknown): string | null {
  if (hasNonEmptyString(author)) return String(author);
  const record = asRecord(author);
  if (record && hasNonEmptyString(record.name)) return String(record.name);
  if (Array.isArray(author)) {
    for (const item of author) {
      const name = getAuthorName(item);
      if (name) return name;
    }
  }
  return null;
}

function validateSchemaNode(
  node: Record<string, unknown>,
  path: string,
): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  const type = typeof node["@type"] === "string" ? node["@type"] : "";

  if (!hasNonEmptyString(node["@context"])) {
    issues.push({
      level: "warning",
      message: "Missing @context (recommended: https://schema.org)",
      path,
    });
  } else if (!String(node["@context"]).toLowerCase().includes("schema.org")) {
    issues.push({
      level: "warning",
      message: "@context should usually be https://schema.org",
      path,
    });
  }

  if (!type) {
    issues.push({
      level: "error",
      message: "Missing required @type",
      path,
    });
    return issues;
  }

  const articleTypes = new Set(["Article", "BlogPosting", "NewsArticle"]);
  if (articleTypes.has(type)) {
    if (!hasNonEmptyString(node.headline) && !hasNonEmptyString(node.name)) {
      issues.push({
        level: "error",
        message: `${type} requires headline (or name)`,
        path: `${path}.headline`,
      });
    }
    if (!getAuthorName(node.author)) {
      issues.push({
        level: "error",
        message: `${type} requires author.name`,
        path: `${path}.author`,
      });
    }
    if (!hasNonEmptyString(node.datePublished)) {
      issues.push({
        level: "error",
        message: `${type} requires datePublished`,
        path: `${path}.datePublished`,
      });
    }
    if (!hasNonEmptyString(node.dateModified)) {
      issues.push({
        level: "warning",
        message: `${type} should include dateModified`,
        path: `${path}.dateModified`,
      });
    }
    if (!node.image) {
      issues.push({
        level: "warning",
        message: `${type} should include an image`,
        path: `${path}.image`,
      });
    }
  }

  if (type === "Product" || type === "Service") {
    if (!hasNonEmptyString(node.name)) {
      issues.push({
        level: "error",
        message: `${type} requires name`,
        path: `${path}.name`,
      });
    }
  }

  if (type === "Product") {
    const offers = asRecord(node.offers);
    if (!offers) {
      issues.push({
        level: "warning",
        message: "Product should include offers",
        path: `${path}.offers`,
      });
    } else if (
      !hasNonEmptyString(offers.price) &&
      typeof offers.price !== "number"
    ) {
      issues.push({
        level: "warning",
        message: "Product offers should include price",
        path: `${path}.offers.price`,
      });
    }
  }

  if (
    type === "LocalBusiness" ||
    type === "Organization" ||
    type === "Person"
  ) {
    if (!hasNonEmptyString(node.name)) {
      issues.push({
        level: "error",
        message: `${type} requires name`,
        path: `${path}.name`,
      });
    }
  }

  if (type === "FAQPage") {
    const entities = Array.isArray(node.mainEntity) ? node.mainEntity : [];
    if (entities.length === 0) {
      issues.push({
        level: "error",
        message: "FAQPage requires at least one Question in mainEntity",
        path: `${path}.mainEntity`,
      });
    } else {
      entities.forEach((entity, index) => {
        const question = asRecord(entity);
        if (!question || question["@type"] !== "Question") {
          issues.push({
            level: "error",
            message: `mainEntity[${index}] must be a Question`,
            path: `${path}.mainEntity[${index}]`,
          });
          return;
        }
        if (!hasNonEmptyString(question.name)) {
          issues.push({
            level: "error",
            message: `Question[${index}] requires name`,
            path: `${path}.mainEntity[${index}].name`,
          });
        }
        const answer = asRecord(question.acceptedAnswer);
        if (!answer || !hasNonEmptyString(answer.text)) {
          issues.push({
            level: "error",
            message: `Question[${index}] requires acceptedAnswer.text`,
            path: `${path}.mainEntity[${index}].acceptedAnswer`,
          });
        }
      });
    }
  }

  if (type === "HowTo") {
    if (!hasNonEmptyString(node.name)) {
      issues.push({
        level: "error",
        message: "HowTo requires name",
        path: `${path}.name`,
      });
    }
    const steps = Array.isArray(node.step) ? node.step : [];
    if (steps.length === 0) {
      issues.push({
        level: "error",
        message: "HowTo requires at least one step",
        path: `${path}.step`,
      });
    }
  }

  if (type === "Review") {
    const item = asRecord(node.itemReviewed);
    if (!item || !hasNonEmptyString(item.name)) {
      issues.push({
        level: "error",
        message: "Review requires itemReviewed.name",
        path: `${path}.itemReviewed`,
      });
    }
    const rating = asRecord(node.reviewRating);
    if (
      !rating ||
      (!hasNonEmptyString(rating.ratingValue) &&
        typeof rating.ratingValue !== "number")
    ) {
      issues.push({
        level: "error",
        message: "Review requires reviewRating.ratingValue",
        path: `${path}.reviewRating`,
      });
    }
    if (!getAuthorName(node.author)) {
      issues.push({
        level: "warning",
        message: "Review should include author.name",
        path: `${path}.author`,
      });
    }
  }

  if (type === "WebPage") {
    if (!hasNonEmptyString(node.name) && !hasNonEmptyString(node.headline)) {
      issues.push({
        level: "error",
        message: "WebPage requires name",
        path: `${path}.name`,
      });
    }
  }

  if (type === "VideoObject") {
    if (!hasNonEmptyString(node.name)) {
      issues.push({
        level: "error",
        message: "VideoObject requires name",
        path: `${path}.name`,
      });
    }
    if (!hasNonEmptyString(node.description)) {
      issues.push({
        level: "error",
        message: "VideoObject requires description",
        path: `${path}.description`,
      });
    }
    if (!node.thumbnailUrl && !node.image) {
      issues.push({
        level: "error",
        message: "VideoObject requires thumbnailUrl or image",
        path: `${path}.thumbnailUrl`,
      });
    }
    if (!hasNonEmptyString(node.uploadDate)) {
      issues.push({
        level: "error",
        message: "VideoObject requires uploadDate",
        path: `${path}.uploadDate`,
      });
    }
  }

  return issues;
}

/** Validate JSON-LD object/array for required Schema.org fields. */
export function validateJsonLdSchema(schema: unknown): SchemaValidationResult {
  const normalized = normalizeSeoSchemaValue(schema);
  if (normalized.error) {
    return {
      valid: false,
      issues: [{ level: "error", message: normalized.error }],
    };
  }
  if (!normalized.value) {
    return { valid: true, issues: [] };
  }

  const nodes = Array.isArray(normalized.value)
    ? normalized.value
    : [normalized.value];

  if (nodes.length === 0) {
    return {
      valid: false,
      issues: [{ level: "error", message: "Schema graph is empty." }],
    };
  }

  const issues: SchemaValidationIssue[] = [];
  nodes.forEach((node, index) => {
    const record = asRecord(node);
    const path = Array.isArray(normalized.value) ? `graph[${index}]` : "schema";
    if (!record) {
      issues.push({
        level: "error",
        message: "Each schema node must be an object",
        path,
      });
      return;
    }
    issues.push(...validateSchemaNode(record, path));
  });

  return {
    valid: !issues.some((issue) => issue.level === "error"),
    issues,
  };
}
