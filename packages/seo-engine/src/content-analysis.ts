import type { SeoAnalysisResult } from "./types.js";

export type ContentTestStatus = "pass" | "fail" | "warning";

export type ContentAnalysisTest = {
  id: string;
  title: string;
  status: ContentTestStatus;
  message: string;
  category: "basic" | "content" | "links" | "geo";
  critical: boolean;
};

export type ContentAnalysisReport = {
  score: number;
  tests: ContentAnalysisTest[];
  wordCount: number;
  keywordDensity: number;
  titleChars: number;
  descriptionChars: number;
};

/** SEO title: keep under 60 characters (prefer at least 30). */
export const SEO_TITLE_MIN_CHARS = 30;
export const SEO_TITLE_MAX_CHARS = 60;

/** Meta description: keep under 155 characters (prefer at least 70). */
export const SEO_DESC_MIN_CHARS = 70;
export const SEO_DESC_MAX_CHARS = 155;

/** Rank Math–style primary keyword density band (skills.md Appendix K). */
export const KD_MIN_PERCENT = 1.0;
export const KD_MAX_PERCENT = 1.5;

/** Soft warning band around the ideal density. */
export const KD_WARN_MIN_PERCENT = 0.5;
export const KD_WARN_MAX_PERCENT = 2.5;

export const PERMALINK_MAX_CHARS = 75;
export const PARAGRAPH_MAX_WORDS = 120;
export const MIN_CONTENT_WORDS = 600;
export const BLUF_MIN_WORDS = 40;
export const BLUF_MAX_WORDS = 80;

const DEFAULT_SITE_HOSTS = ["gmbranker.org", "localhost"];

const POSITIVE_WORDS = [
  "best",
  "easy",
  "fast",
  "free",
  "great",
  "amazing",
  "proven",
  "effective",
  "powerful",
  "simple",
  "ultimate",
  "trusted",
  "smart",
  "boost",
  "improve",
  "grow",
  "win",
  "success",
  "helpful",
  "reliable",
];

const POWER_WORDS = [
  "ultimate",
  "complete",
  "essential",
  "proven",
  "secret",
  "powerful",
  "instant",
  "guaranteed",
  "exclusive",
  "amazing",
  "incredible",
  "definitive",
  "expert",
  "advanced",
  "simple",
  "free",
  "new",
  "best",
  "top",
  "guide",
  "checklist",
  "blueprint",
  "playbook",
  "hacks",
  "tips",
  "strategies",
  "fast",
  "easy",
  "boost",
  "grow",
];

const QUESTION_STARTERS =
  /^(what|why|how|when|where|who|which|can|does|do|is|are|should|will|could|would)\b/i;

const AUTHORITY_HOST_PATTERN =
  /(^|\.)(wikipedia\.org|gov|edu|schema\.org|w3\.org|developers\.google\.com|support\.google\.com|moz\.com|ahrefs\.com|searchengineland\.com|semrush\.com)$/i;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripHtmlToText(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function parseFocusKeywords(focusKeyword: string): string[] {
  return focusKeyword
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

export function countKeywordOccurrences(
  plainText: string,
  keyword: string,
): number {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return 0;
  const haystack = plainText.toLowerCase();
  const matches = haystack.match(new RegExp(escapeRegExp(needle), "g"));
  return matches?.length ?? 0;
}

/** Rank Math density: (phrase occurrences / total words) * 100 */
export function keywordDensityPercent(
  plainText: string,
  keyword: string,
  wordCount = countWords(plainText),
): number {
  if (wordCount <= 0) return 0;
  const occurrences = countKeywordOccurrences(plainText, keyword);
  return (occurrences * 100) / wordCount;
}

export function slugContainsKeyword(slug: string, keyword: string): boolean {
  const lowerSlug = (slug || "").toLowerCase().replace(/^\/+|\/+$/g, "");
  const spaced = keyword.trim().toLowerCase();
  if (!spaced || !lowerSlug) return false;

  const hyphenated = spaced.replace(/\s+/g, "-");
  const underscored = spaced.replace(/\s+/g, "_");
  const compacted = spaced.replace(/\s+/g, "");

  if (
    lowerSlug.includes(spaced) ||
    lowerSlug.includes(hyphenated) ||
    lowerSlug.includes(underscored) ||
    lowerSlug.includes(compacted)
  ) {
    return true;
  }

  const tokens = spaced.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return false;
  const segmentPattern = tokens.map(escapeRegExp).join("[-_/]+");
  return new RegExp(`(?:^|[-_/])${segmentPattern}(?:$|[-_/])`).test(lowerSlug);
}

export function titleStartsWithKeyword(
  title: string,
  keyword: string,
): boolean {
  const lowerTitle = (title || "").trim().toLowerCase();
  const primary = keyword.trim().toLowerCase();
  if (!lowerTitle || !primary) return false;
  return lowerTitle.startsWith(primary);
}

/** skills.md keywordIn10Percent */
export function keywordInFirstPercent(
  plainText: string,
  keyword: string,
  percent = 0.1,
): boolean {
  const words = plainText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const limit = Math.max(1, Math.floor(words.length * percent));
  return words
    .slice(0, limit)
    .join(" ")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase());
}

export function extractHeadingTexts(
  html: string,
  levels: Array<1 | 2 | 3 | 4> = [2, 3, 4],
): string[] {
  const texts: string[] = [];
  for (const level of levels) {
    const re = new RegExp(
      `<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`,
      "gi",
    );
    let match: RegExpExecArray | null;
    while ((match = re.exec(html || "")) !== null) {
      const text = stripHtmlToText(match[1]);
      if (text) texts.push(text);
    }
  }
  return texts;
}

export function keywordInSubheadings(html: string, keyword: string): boolean {
  const primary = keyword.trim().toLowerCase();
  if (!primary) return false;
  return extractHeadingTexts(html, [2, 3, 4]).some((heading) =>
    heading.toLowerCase().includes(primary),
  );
}

export function countHtmlHeadings(
  html: string,
  level: 1 | 2 | 3 | 4 = 1,
): number {
  const matches = (html || "").match(new RegExp(`<h${level}\\b[^>]*>`, "gi"));
  return matches?.length ?? 0;
}

export function extractParagraphTexts(html: string): string[] {
  const texts: string[] = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html || "")) !== null) {
    const text = stripHtmlToText(match[1]);
    if (text) texts.push(text);
  }
  return texts;
}

export function contentHasShortParagraphs(
  html: string,
  maxWords = PARAGRAPH_MAX_WORDS,
): boolean {
  const paragraphs = extractParagraphTexts(html);
  if (paragraphs.length === 0) return false;
  return paragraphs.every((p) => countWords(p) <= maxWords);
}

/** Inline/manual TOC markers in HTML (editor embeds, shortcodes, classes). */
export function contentHasInlineToc(html: string): boolean {
  const source = html || "";
  if (
    /id=["'][^"']*toc[^"']*["']/i.test(source) ||
    /class=["'][^"']*\b(toc|table-of-contents|rank-math-toc|ez-toc|lwptoc)\b[^"']*["']/i.test(
      source,
    ) ||
    /\[toc\]/i.test(source)
  ) {
    return true;
  }
  return extractHeadingTexts(source, [2, 3]).some((heading) =>
    /table of contents|^contents$|^toc$/i.test(heading),
  );
}

/**
 * TOC present either inline in HTML, or auto-generated at publish time
 * from H2/H3 headings (see `processContent` in lib/blog-utils.ts).
 */
export function contentHasToc(html: string): boolean {
  if (contentHasInlineToc(html)) return true;
  // Blog pages auto-render <TableOfContents> whenever H2/H3 exist.
  return extractHeadingTexts(html || "", [2, 3]).length > 0;
}

function normalizeHost(host: string): string {
  return host.replace(/^www\./i, "").toLowerCase();
}

function collectHrefValues(html: string): string[] {
  const hrefs: string[] = [];
  const re = /<a\b[^>]*href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html || "")) !== null) {
    hrefs.push(match[1].trim());
  }
  return hrefs;
}

function classifyLink(
  href: string,
  siteHosts: string[],
): "internal" | "external" | "skip" {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return "skip";
  }
  if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
    return "internal";
  }
  try {
    const url = new URL(href, "https://gmbranker.org");
    if (!/^https?:$/i.test(url.protocol)) return "skip";
    const host = normalizeHost(url.hostname);
    if (siteHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return "internal";
    }
    return "external";
  } catch {
    return "skip";
  }
}

export function countContentLinks(
  html: string,
  siteHosts: string[] = DEFAULT_SITE_HOSTS,
): { internal: number; external: number; total: number } {
  const hosts = siteHosts.map(normalizeHost);
  let internal = 0;
  let external = 0;
  for (const href of collectHrefValues(html)) {
    const kind = classifyLink(href, hosts);
    if (kind === "internal") internal += 1;
    if (kind === "external") external += 1;
  }
  return { internal, external, total: internal + external };
}

export function contentHasImage(html: string): boolean {
  return /<img\b/i.test(html || "");
}

export function imageHasAltWithKeyword(html: string, keyword: string): boolean {
  const primary = keyword.trim().toLowerCase();
  if (!primary) return false;
  const imgTags = (html || "").match(/<img\b[^>]*>/gi) || [];
  return imgTags.some((tag) => {
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] || "";
    return alt.toLowerCase().includes(primary);
  });
}

export function titleHasSentimentWord(title: string): boolean {
  const lower = (title || "").toLowerCase();
  return POSITIVE_WORDS.some((word) =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(lower),
  );
}

export function titleHasPowerWord(title: string): boolean {
  const lower = (title || "").toLowerCase();
  return POWER_WORDS.some((word) =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(lower),
  );
}

export function titleHasNumber(title: string): boolean {
  return /\d/.test(title || "");
}

export function hasBlufIntro(html: string): boolean {
  const first = extractParagraphTexts(html)[0] || "";
  const words = countWords(first);
  return words >= BLUF_MIN_WORDS && words <= BLUF_MAX_WORDS;
}

export function hasQuestionHeadings(html: string): boolean {
  return extractHeadingTexts(html, [2, 3]).some(
    (heading) => heading.endsWith("?") || QUESTION_STARTERS.test(heading),
  );
}

export function hasStatistics(plainText: string): boolean {
  return /\d+%|\d+\s*(percent|million|billion|thousand|k\b)/i.test(
    plainText || "",
  );
}

export function hasAuthorityOutboundLink(
  html: string,
  siteHosts: string[] = DEFAULT_SITE_HOSTS,
): boolean {
  const hosts = siteHosts.map(normalizeHost);
  for (const href of collectHrefValues(html)) {
    if (classifyLink(href, hosts) !== "external") continue;
    try {
      const url = new URL(href);
      const host = normalizeHost(url.hostname);
      if (
        AUTHORITY_HOST_PATTERN.test(host) ||
        host.endsWith(".gov") ||
        host.endsWith(".edu")
      ) {
        return true;
      }
    } catch {
      // ignore invalid URLs
    }
  }
  return false;
}

function countSyllablesInWord(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;
  const silentE = cleaned.endsWith("e") ? 1 : 0;
  const vowels = cleaned.match(/[aeiouy]+/g);
  const count = (vowels ? vowels.length : 0) - silentE;
  return count <= 0 ? 1 : count;
}

export function countSyllables(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  let count = 0;
  for (const word of words) {
    count += countSyllablesInWord(word);
  }
  return count;
}

export function countSentences(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  return matches ? matches.length : 1;
}

export function calculateFleschKincaid(text: string): number {
  const words = countWords(text);
  if (words === 0) return 100;
  const sentences = countSentences(text);
  const syllables = countSyllables(text);
  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, score));
}

export function checkAltTagCoverage(html: string): {
  total: number;
  withAlt: number;
  missingAltCount: number;
} {
  const imgTags = (html || "").match(/<img\b[^>]*>/gi) || [];
  let withAlt = 0;
  for (const tag of imgTags) {
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    if (altMatch && altMatch[1].trim().length > 0) {
      withAlt += 1;
    }
  }
  return {
    total: imgTags.length,
    withAlt,
    missingAltCount: imgTags.length - withAlt,
  };
}

function densityStatus(density: number): ContentTestStatus {
  if (density >= KD_MIN_PERCENT && density <= KD_MAX_PERCENT) return "pass";
  if (density >= KD_WARN_MIN_PERCENT && density <= KD_WARN_MAX_PERCENT) {
    return "warning";
  }
  return "fail";
}

export function calculateSeoScore(
  tests: Array<{ status: ContentTestStatus }>,
): number {
  if (tests.length === 0) return 0;
  let score = 0;
  for (const test of tests) {
    if (test.status === "pass") score += 1;
    else if (test.status === "warning") score += 0.5;
  }
  return Math.round((score / tests.length) * 100);
}

export type AnalyzeContentInput = {
  content: string;
  title: string;
  description: string;
  urlOrSlug: string;
  keyword: string;
  siteHosts?: string[];
};

function slugFromUrlOrSlug(urlOrSlug: string): string {
  const value = (urlOrSlug || "").trim();
  if (!value) return "";
  try {
    if (/^https?:\/\//i.test(value)) {
      const pathname = new URL(value).pathname;
      return (
        pathname
          .replace(/^\/+|\/+$/g, "")
          .split("/")
          .pop() || pathname
      );
    }
  } catch {
    // fall through
  }
  return value.replace(/^\/+|\/+$/g, "");
}

export function analyzeContentDetailed(
  input: AnalyzeContentInput,
): ContentAnalysisReport {
  const keywords = parseFocusKeywords(input.keyword);
  if (keywords.length === 0) {
    return {
      score: 0,
      wordCount: 0,
      keywordDensity: 0,
      titleChars: 0,
      descriptionChars: 0,
      tests: [
        {
          id: "no-keyword",
          title: "Focus Keyword",
          status: "fail",
          message: "No focus keyword set.",
          category: "basic",
          critical: true,
        },
      ],
    };
  }

  const primaryKeyword = keywords[0];
  const title = (input.title || "").trim();
  const description = (input.description || "").trim();
  const html = input.content || "";
  const plainContent = stripHtmlToText(html);
  const plainLower = plainContent.toLowerCase();
  const wordCount = countWords(plainContent);
  const titleChars = title.length;
  const descriptionChars = description.length;
  const slug = slugFromUrlOrSlug(input.urlOrSlug);
  const density = keywordDensityPercent(
    plainContent,
    primaryKeyword,
    wordCount,
  );
  const siteHosts = (input.siteHosts || DEFAULT_SITE_HOSTS).map(normalizeHost);
  const links = countContentLinks(html, siteHosts);
  const h1Count = countHtmlHeadings(html, 1);
  const h2Count = countHtmlHeadings(html, 2);
  const missingKeywords = keywords.filter((k) => !plainLower.includes(k));
  const kdStatus = densityStatus(density);

  const titleLengthStatus: ContentTestStatus =
    titleChars >= SEO_TITLE_MIN_CHARS && titleChars <= SEO_TITLE_MAX_CHARS
      ? "pass"
      : titleChars === 0 || titleChars > SEO_TITLE_MAX_CHARS
        ? "fail"
        : "warning";

  const descLengthStatus: ContentTestStatus =
    descriptionChars >= SEO_DESC_MIN_CHARS &&
    descriptionChars <= SEO_DESC_MAX_CHARS
      ? "pass"
      : descriptionChars === 0 || descriptionChars > SEO_DESC_MAX_CHARS
        ? "fail"
        : "warning";

  const tests: ContentAnalysisTest[] = [
    {
      id: "keywordInTitle",
      title: "Keyword in Title",
      status: title.toLowerCase().includes(primaryKeyword) ? "pass" : "fail",
      message: title.toLowerCase().includes(primaryKeyword)
        ? "Focus Keyword used in the SEO Title"
        : "Add the Focus Keyword to the SEO Title",
      category: "basic",
      critical: true,
    },
    {
      id: "titleStartWithKeyword",
      title: "Title Starts with Keyword",
      status: titleStartsWithKeyword(title, primaryKeyword)
        ? "pass"
        : "warning",
      message: titleStartsWithKeyword(title, primaryKeyword)
        ? "Focus Keyword used at the beginning of SEO title"
        : "Use the Focus Keyword at the beginning of the SEO title",
      category: "basic",
      critical: false,
    },
    {
      id: "keywordInMetaDescription",
      title: "Keyword in Meta Description",
      status: description.toLowerCase().includes(primaryKeyword)
        ? "pass"
        : "fail",
      message: description.toLowerCase().includes(primaryKeyword)
        ? "Focus Keyword used inside SEO Meta Description"
        : "Add the Focus Keyword to the Meta Description",
      category: "basic",
      critical: true,
    },
    {
      id: "keywordInPermalink",
      title: "Keyword in URL",
      status: slugContainsKeyword(slug, primaryKeyword) ? "pass" : "fail",
      message: slugContainsKeyword(slug, primaryKeyword)
        ? "Focus Keyword used in the URL"
        : "Include the Focus Keyword in the URL slug",
      category: "basic",
      critical: true,
    },
    {
      id: "lengthPermalink",
      title: "Permalink Length",
      status:
        slug.length > 0 && slug.length <= PERMALINK_MAX_CHARS
          ? "pass"
          : slug.length === 0
            ? "fail"
            : "fail",
      message:
        slug.length === 0
          ? "URL slug is empty"
          : slug.length <= PERMALINK_MAX_CHARS
            ? `URL slug is ${slug.length} characters (≤ ${PERMALINK_MAX_CHARS})`
            : `URL slug is ${slug.length} characters (keep ≤ ${PERMALINK_MAX_CHARS})`,
      category: "basic",
      critical: false,
    },
    {
      id: "titleLength",
      title: "SEO Title Length",
      status: titleLengthStatus,
      message:
        titleLengthStatus === "pass"
          ? `SEO Title is ${titleChars} characters (≤ ${SEO_TITLE_MAX_CHARS})`
          : titleChars === 0
            ? `SEO Title is empty (aim ${SEO_TITLE_MIN_CHARS}–${SEO_TITLE_MAX_CHARS} chars)`
            : titleChars > SEO_TITLE_MAX_CHARS
              ? `SEO Title is ${titleChars} characters (keep under ${SEO_TITLE_MAX_CHARS})`
              : `SEO Title is ${titleChars} characters (aim ${SEO_TITLE_MIN_CHARS}–${SEO_TITLE_MAX_CHARS})`,
      category: "basic",
      critical: true,
    },
    {
      id: "descriptionLength",
      title: "Meta Description Length",
      status: descLengthStatus,
      message:
        descLengthStatus === "pass"
          ? `Meta Description is ${descriptionChars} characters (≤ ${SEO_DESC_MAX_CHARS})`
          : descriptionChars === 0
            ? `Meta Description is empty (aim ${SEO_DESC_MIN_CHARS}–${SEO_DESC_MAX_CHARS} chars)`
            : descriptionChars > SEO_DESC_MAX_CHARS
              ? `Meta Description is ${descriptionChars} characters (keep under ${SEO_DESC_MAX_CHARS})`
              : `Meta Description is ${descriptionChars} characters (aim ${SEO_DESC_MIN_CHARS}–${SEO_DESC_MAX_CHARS})`,
      category: "basic",
      critical: true,
    },
    {
      id: "titleSentiment",
      title: "Title Sentiment",
      status: titleHasSentimentWord(title) ? "pass" : "warning",
      message: titleHasSentimentWord(title)
        ? "SEO Title has a positive sentiment word"
        : "Consider a positive sentiment word in the SEO Title",
      category: "basic",
      critical: false,
    },
    {
      id: "titleHasPowerWords",
      title: "Title Power Words",
      status: titleHasPowerWord(title) ? "pass" : "warning",
      message: titleHasPowerWord(title)
        ? "SEO Title includes a power word"
        : "Consider adding a power word to the SEO Title",
      category: "basic",
      critical: false,
    },
    {
      id: "titleHasNumber",
      title: "Title Number",
      status: titleHasNumber(title) ? "pass" : "warning",
      message: titleHasNumber(title)
        ? "SEO Title includes a number"
        : "Consider adding a number to the SEO Title",
      category: "basic",
      critical: false,
    },
    {
      id: "keywordInContent",
      title: "Keyword in Content",
      status: missingKeywords.length === 0 ? "pass" : "fail",
      message:
        missingKeywords.length === 0
          ? keywords.length > 1
            ? "All Focus Keywords found in the content"
            : "Focus Keyword found in the content"
          : `Missing keywords in content: ${missingKeywords.join(", ")}`,
      category: "content",
      critical: true,
    },
    {
      id: "keywordIn10Percent",
      title: "Keyword in Introduction",
      status: keywordInFirstPercent(plainContent, primaryKeyword)
        ? "pass"
        : "fail",
      message: keywordInFirstPercent(plainContent, primaryKeyword)
        ? "Focus Keyword appears in the first 10% of content"
        : "Add the Focus Keyword in the first 10% of content",
      category: "content",
      critical: false,
    },
    {
      id: "keywordInSubheadings",
      title: "Keyword in Subheadings",
      status: keywordInSubheadings(html, primaryKeyword) ? "pass" : "warning",
      message: keywordInSubheadings(html, primaryKeyword)
        ? "Focus Keyword found in at least one H2–H4 subheading"
        : "Add the Focus Keyword to an H2, H3, or H4 subheading",
      category: "content",
      critical: false,
    },
    {
      id: "keywordDensity",
      title: "Keyword Density",
      status: kdStatus,
      message:
        kdStatus === "pass"
          ? `Keyword density is ${density.toFixed(2)}% (ideal ${KD_MIN_PERCENT}–${KD_MAX_PERCENT}%)`
          : `Keyword density is ${density.toFixed(2)}% (aim ${KD_MIN_PERCENT}–${KD_MAX_PERCENT}%)`,
      category: "content",
      critical: false,
    },
    {
      id: "lengthContent",
      title: "Content Length",
      status:
        wordCount >= MIN_CONTENT_WORDS
          ? "pass"
          : wordCount >= 300
            ? "warning"
            : "fail",
      message: `Content is ${wordCount} words long (Recommended: ${MIN_CONTENT_WORDS}+)`,
      category: "content",
      critical: false,
    },
    {
      id: "readabilityScore",
      title: "Content Readability",
      status: (() => {
        const score = calculateFleschKincaid(plainContent);
        if (score >= 60) return "pass";
        if (score >= 45) return "warning";
        return "fail";
      })(),
      message: (() => {
        const score = calculateFleschKincaid(plainContent);
        if (score >= 60)
          return `Readability score is ${score.toFixed(1)}/100 (easy to read)`;
        if (score >= 45)
          return `Readability score is ${score.toFixed(1)}/100 (moderately difficult)`;
        return `Readability score is ${score.toFixed(1)}/100 (difficult to read, aim ≥ 60)`;
      })(),
      category: "content",
      critical: false,
    },
    {
      id: "contentHasShortParagraphs",
      title: "Short Paragraphs",
      status: contentHasShortParagraphs(html) ? "pass" : "warning",
      message: contentHasShortParagraphs(html)
        ? `All paragraphs are ≤ ${PARAGRAPH_MAX_WORDS} words`
        : `Keep paragraphs under ${PARAGRAPH_MAX_WORDS} words`,
      category: "content",
      critical: false,
    },
    {
      id: "contentHasTOC",
      title: "Table of Contents",
      status: contentHasToc(html) ? "pass" : "warning",
      message: contentHasInlineToc(html)
        ? "Content includes a table of contents"
        : contentHasToc(html)
          ? "Table of contents will be auto-generated from H2/H3 headings"
          : "Add H2/H3 headings so a table of contents can be generated",
      category: "content",
      critical: false,
    },
    {
      id: "hasH1",
      title: "H1 Heading",
      status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warning",
      message:
        h1Count === 1
          ? "Content has exactly one H1 heading"
          : h1Count === 0
            ? "Content is missing an H1 heading"
            : `Content has ${h1Count} H1 headings (use exactly one)`,
      category: "content",
      critical: false,
    },
    {
      id: "hasH2",
      title: "H2 Subheadings",
      status: h2Count > 0 ? "pass" : "warning",
      message:
        h2Count > 0
          ? `Content uses ${h2Count} H2 subheading${h2Count === 1 ? "" : "s"}`
          : "Add at least one H2 subheading",
      category: "content",
      critical: false,
    },
    {
      id: "contentHasAssets",
      title: "Content Media",
      status: contentHasImage(html) ? "pass" : "warning",
      message: contentHasImage(html)
        ? "Content includes at least one image"
        : "Add at least one image to the content",
      category: "content",
      critical: false,
    },
    {
      id: "keywordInImageAlt",
      title: "Keyword in Image Alt",
      status: imageHasAltWithKeyword(html, primaryKeyword) ? "pass" : "warning",
      message: imageHasAltWithKeyword(html, primaryKeyword)
        ? "An image alt text includes the Focus Keyword"
        : "Add the Focus Keyword to an image alt text",
      category: "content",
      critical: false,
    },
    {
      id: "imageAltCoverage",
      title: "Image Alt Attributes",
      status: (() => {
        const coverage = checkAltTagCoverage(html);
        if (coverage.total === 0) return "pass";
        if (coverage.missingAltCount === 0) return "pass";
        if (coverage.withAlt > 0) return "warning";
        return "fail";
      })(),
      message: (() => {
        const coverage = checkAltTagCoverage(html);
        if (coverage.total === 0) return "No images found in content";
        if (coverage.missingAltCount === 0) {
          return `All ${coverage.total} images have alt attributes`;
        }
        return `${coverage.missingAltCount} out of ${coverage.total} images are missing alt attributes`;
      })(),
      category: "content",
      critical: false,
    },
    {
      id: "linksHasInternal",
      title: "Internal Links",
      status: links.internal >= 1 ? "pass" : "fail",
      message:
        links.internal >= 1
          ? "Content includes an internal link"
          : "Add at least one internal link",
      category: "links",
      critical: false,
    },
    {
      id: "linksHasExternals",
      title: "External Links",
      status: links.external >= 1 ? "pass" : "warning",
      message:
        links.external >= 1
          ? "Content includes an external link"
          : "Add at least one external link",
      category: "links",
      critical: false,
    },
    {
      id: "linksNotAllExternals",
      title: "Link Mix",
      status:
        links.total === 0
          ? "fail"
          : links.external > 0 && links.internal === 0
            ? "fail"
            : "pass",
      message:
        links.total === 0
          ? "Add internal and external links"
          : links.external > 0 && links.internal === 0
            ? "Do not rely only on external links — add an internal link"
            : "Content is not outbound-only",
      category: "links",
      critical: false,
    },
    {
      id: "hasBLUF",
      title: "BLUF Introduction",
      status: hasBlufIntro(html) ? "pass" : "warning",
      message: hasBlufIntro(html)
        ? `First paragraph is ${BLUF_MIN_WORDS}–${BLUF_MAX_WORDS} words (BLUF)`
        : `Write a bottom-line-up-front intro (${BLUF_MIN_WORDS}–${BLUF_MAX_WORDS} words)`,
      category: "geo",
      critical: false,
    },
    {
      id: "hasQuestionHeadings",
      title: "Question Headings",
      status: hasQuestionHeadings(html) ? "pass" : "warning",
      message: hasQuestionHeadings(html)
        ? "At least one H2/H3 is phrased as a question"
        : "Add a question-style H2 or H3 for AI/search snippets",
      category: "geo",
      critical: false,
    },
    {
      id: "hasStatistics",
      title: "Statistics",
      status: hasStatistics(plainContent) ? "pass" : "warning",
      message: hasStatistics(plainContent)
        ? "Content includes a statistic or numeric proof point"
        : "Add a statistic or numeric proof point",
      category: "geo",
      critical: false,
    },
    {
      id: "hasOutboundCitations",
      title: "Authority Citations",
      status: hasAuthorityOutboundLink(html, siteHosts) ? "pass" : "warning",
      message: hasAuthorityOutboundLink(html, siteHosts)
        ? "Content cites an authoritative external source"
        : "Cite at least one authoritative source (.gov, .edu, Wikipedia, etc.)",
      category: "geo",
      critical: false,
    },
  ];

  return {
    score: calculateSeoScore(tests),
    tests,
    wordCount,
    keywordDensity: density,
    titleChars,
    descriptionChars,
  };
}

/** Backward-compatible API used across the monorepo. */
export function analyzeContent(
  content: string,
  title: string,
  description: string,
  url: string,
  keyword: string,
): SeoAnalysisResult {
  const report = analyzeContentDetailed({
    content,
    title,
    description,
    urlOrSlug: url,
    keyword,
  });

  return {
    score: report.score,
    tests: report.tests.map((test) => ({
      id: test.id,
      title: test.title,
      status: test.status,
      message: test.message,
    })),
  };
}
