#!/usr/bin/env node
import { auditUrl, formatAuditReport, parseRulesArg } from "./audit.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`seo-engine — SEO audit CLI

Usage:
  seo-engine audit --url <url> [--rules title,description,canonical,schema,robots,social,hreflang,viewport,robots-ai,llms]

Examples:
  npx seo-engine audit --url https://example.com
  npx seo-engine audit --url https://example.com --rules schema,canonical
`);
    process.exit(0);
  }

  if (command !== "audit") {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }

  const urlIndex = args.indexOf("--url");
  const rulesIndex = args.indexOf("--rules");
  const url = urlIndex >= 0 ? args[urlIndex + 1] : undefined;

  if (!url) {
    console.error("Missing required --url argument");
    process.exit(1);
  }

  const rules = parseRulesArg(
    rulesIndex >= 0 ? args[rulesIndex + 1] : undefined,
  );

  try {
    const report = await auditUrl({ url, rules });
    console.log(formatAuditReport(report));
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
