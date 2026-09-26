export interface LinkPage {
  url: string;
  title?: string;
  text?: string;
  keywords?: string[];
}

export interface InternalLinkSuggestion {
  sourceUrl: string;
  targetUrl: string;
  anchor: string;
  score: number;
  reasons: string[];
}

export interface BrokenLinkRecord {
  url: string;
  status?: number;
  error?: string;
  sourceUrls?: string[];
}

export interface BrokenLinkRecommendation {
  url: string;
  classification: "not-found" | "server-error" | "blocked" | "invalid" | "unknown";
  action: "replace" | "redirect" | "remove" | "retry";
  reason: string;
}

function normalizeUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function tokens(value: string): Set<string> {
  return new Set(
    value.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 2),
  );
}

/** Creates deterministic, reviewable internal-link proposals from page evidence. */
export function suggestInternalLinks(
  pages: LinkPage[],
  options: { maxPerSource?: number; minScore?: number } = {},
): InternalLinkSuggestion[] {
  const maxPerSource = Math.max(1, options.maxPerSource ?? 3);
  const minScore = options.minScore ?? 2;
  const normalized = pages
    .map((page) => ({ ...page, parsed: normalizeUrl(page.url) }))
    .filter((page) => page.parsed);
  const suggestions: InternalLinkSuggestion[] = [];

  for (const source of normalized) {
    const sourceTokens = tokens([source.title, source.text, ...(source.keywords ?? [])].filter(Boolean).join(" "));
    const ranked = normalized
      .filter((target) => target !== source && target.parsed!.origin === source.parsed!.origin)
      .map((target) => {
        const targetTokens = tokens([target.title, ...(target.keywords ?? [])].filter(Boolean).join(" "));
        const overlap = [...targetTokens].filter((token) => sourceTokens.has(token));
        const score = overlap.length + (target.keywords?.length ? 1 : 0);
        return { target, overlap, score };
      })
      .filter((candidate) => candidate.score >= minScore)
      .sort((a, b) => b.score - a.score || a.target.url.localeCompare(b.target.url))
      .slice(0, maxPerSource);

    for (const candidate of ranked) {
      const anchor = candidate.target.title?.trim() || candidate.overlap.join(" ");
      if (!anchor) continue;
      suggestions.push({
        sourceUrl: source.parsed!.toString(),
        targetUrl: candidate.target.parsed!.toString(),
        anchor,
        score: candidate.score,
        reasons: [`${candidate.overlap.length} topical term overlap`, ...(candidate.target.keywords?.length ? ["target has focus keywords"] : [])],
      });
    }
  }
  return suggestions;
}

/** Turns an HTTP/crawl result into a safe, explainable recovery recommendation. */
export function classifyBrokenLink(record: BrokenLinkRecord): BrokenLinkRecommendation {
  const url = normalizeUrl(record.url);
  if (!url) return { url: record.url, classification: "invalid", action: "remove", reason: "The URL is not a valid absolute URL." };
  const status = record.status ?? 0;
  if (status === 404 || status === 410) return { url: url.toString(), classification: "not-found", action: "replace", reason: "The target is permanently unavailable; find a relevant replacement before redirecting." };
  if (status >= 500 && status <= 599) return { url: url.toString(), classification: "server-error", action: "retry", reason: "The target server failed; retry before changing site links." };
  if (status === 401 || status === 403 || status === 429) return { url: url.toString(), classification: "blocked", action: "retry", reason: "The target blocked the request or requires access; do not remove it automatically." };
  if (status > 0 && status < 400) return { url: url.toString(), classification: "unknown", action: "retry", reason: "The response is not broken; refresh the crawl result." };
  return { url: url.toString(), classification: "unknown", action: "retry", reason: record.error || "No reliable HTTP result is available." };
}
