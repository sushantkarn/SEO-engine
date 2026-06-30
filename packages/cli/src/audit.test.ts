import { describe, expect, it } from "vitest";
import { auditUrl, formatAuditReport, parseRulesArg } from "./audit.js";

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Example Page</title>
  <meta name="description" content="Example description" />
  <link rel="canonical" href="https://example.com/" />
  <script type="application/ld+json">{"@type":"Organization","name":"Example"}</script>
</head>
<body></body>
</html>`;

describe("auditUrl", () => {
  it("audits html metadata", async () => {
    const report = await auditUrl({
      url: "https://example.com",
      fetchHtml: async () => sampleHtml,
    });

    expect(report.passed).toBe(true);
    expect(report.findings.some((f) => f.rule === "title" && f.status === "pass")).toBe(
      true,
    );
  });

  it("fails when title is missing", async () => {
    const report = await auditUrl({
      url: "https://example.com",
      rules: ["title"],
      fetchHtml: async () => "<html><body></body></html>",
    });

    expect(report.passed).toBe(false);
  });
});

describe("formatAuditReport", () => {
  it("formats findings", () => {
    const output = formatAuditReport({
      url: "https://example.com",
      passed: true,
      findings: [
        { rule: "title", status: "pass", message: "Title: Example" },
      ],
    });

    expect(output).toContain("PASSED");
    expect(output).toContain("Title: Example");
  });
});

describe("parseRulesArg", () => {
  it("parses comma-separated rules", () => {
    expect(parseRulesArg("title,schema")).toEqual(["title", "schema"]);
  });
});
