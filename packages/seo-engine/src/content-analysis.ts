import type { SeoAnalysisResult } from "./types.js";

export function analyzeContent(
  content: string,
  title: string,
  description: string,
  url: string,
  keyword: string,
): SeoAnalysisResult {
  const tests: SeoAnalysisResult["tests"] = [];
  let score = 0;
  let maxScore = 0;

  const keywords = keyword
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  if (keywords.length === 0) {
    return {
      score: 0,
      tests: [
        {
          id: "no-keyword",
          title: "Focus Keyword",
          status: "fail",
          message: "No focus keyword set.",
        },
      ],
    };
  }

  const primaryKeyword = keywords[0];
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const urlLower = url.toLowerCase();

  maxScore += 10;
  if (titleLower.includes(primaryKeyword)) {
    score += 10;
    tests.push({
      id: "keyword-in-title",
      title: "Keyword in Title",
      status: "pass",
      message: "Primary focus keyword found in the SEO Title.",
    });
  } else {
    tests.push({
      id: "keyword-in-title",
      title: "Keyword in Title",
      status: "fail",
      message: "Primary focus keyword not found in the SEO Title.",
    });
  }

  maxScore += 10;
  if (descriptionLower.includes(primaryKeyword)) {
    score += 10;
    tests.push({
      id: "keyword-in-desc",
      title: "Keyword in Meta Description",
      status: "pass",
      message: "Primary focus keyword found in the Meta Description.",
    });
  } else {
    tests.push({
      id: "keyword-in-desc",
      title: "Keyword in Meta Description",
      status: "fail",
      message: "Primary focus keyword not found in the Meta Description.",
    });
  }

  maxScore += 10;
  if (urlLower.includes(primaryKeyword.replace(/ /g, "-"))) {
    score += 10;
    tests.push({
      id: "keyword-in-url",
      title: "Keyword in URL",
      status: "pass",
      message: "Primary focus keyword found in the URL.",
    });
  } else {
    tests.push({
      id: "keyword-in-url",
      title: "Keyword in URL",
      status: "warning",
      message: "Primary focus keyword not found in the URL.",
    });
  }

  maxScore += 10;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 600) {
    score += 10;
    tests.push({
      id: "content-length",
      title: "Content Length",
      status: "pass",
      message: `Content is ${wordCount} words long. Good job!`,
    });
  } else if (wordCount >= 300) {
    score += 5;
    tests.push({
      id: "content-length",
      title: "Content Length",
      status: "warning",
      message: `Content is ${wordCount} words long. Consider adding more content.`,
    });
  } else {
    tests.push({
      id: "content-length",
      title: "Content Length",
      status: "fail",
      message: `Content is only ${wordCount} words long. Recommended minimum is 600 words.`,
    });
  }

  maxScore += 10;
  const missingKeywords = keywords.filter((k) => !contentLower.includes(k));
  const matches = contentLower.match(
    new RegExp(primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
  );
  const count = matches ? matches.length : 0;
  const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

  if (missingKeywords.length === 0) {
    if (density >= 0.5 && density <= 2.5) {
      score += 10;
      tests.push({
        id: "keyword-density",
        title: "Keyword Density",
        status: "pass",
        message: `All keywords found. Primary density is ${density.toFixed(2)}%.`,
      });
    } else if (density > 2.5) {
      score += 5;
      tests.push({
        id: "keyword-density",
        title: "Keyword Density",
        status: "warning",
        message: `All keywords found, but primary density is ${density.toFixed(2)}% (aim for < 2.5%).`,
      });
    } else {
      tests.push({
        id: "keyword-density",
        title: "Keyword Density",
        status: "fail",
        message: `All keywords found, but primary density is ${density.toFixed(2)}% (aim for > 0.5%).`,
      });
    }
  } else {
    tests.push({
      id: "keyword-density",
      title: "Keyword Presence",
      status: "fail",
      message: `Missing keywords in content: ${missingKeywords.join(", ")}`,
    });
  }

  maxScore += 5;
  if (titleLower.startsWith(primaryKeyword)) {
    score += 5;
    tests.push({
      id: "title-start",
      title: "Title Start",
      status: "pass",
      message: "SEO Title starts with the primary focus keyword.",
    });
  } else {
    tests.push({
      id: "title-start",
      title: "Title Start",
      status: "warning",
      message: "SEO Title does not start with the primary focus keyword.",
    });
  }

  return {
    score: Math.round((score / maxScore) * 100),
    tests,
  };
}

export function calculateSeoScore(tests: SeoAnalysisResult["tests"]): number {
  if (tests.length === 0) return 0;

  let score = 0;
  for (const test of tests) {
    if (test.status === "pass") score += 1;
    else if (test.status === "warning") score += 0.5;
  }

  return Math.round((score / tests.length) * 100);
}
