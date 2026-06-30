export const DEFAULT_ROBOTS_TEMPLATE = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/

Sitemap: {{sitemap}}
`;

export interface RobotsConfig {
  content?: string | null;
  sitemapUrl: string;
}

export function generateRobots(config: RobotsConfig): string {
  const template = config.content?.trim() || DEFAULT_ROBOTS_TEMPLATE;
  return template.replace(/\{\{sitemap\}\}/g, config.sitemapUrl);
}

export const AI_CRAWLER_PRESETS = {
  "ai-visible": [
    { agent: "OAI-SearchBot", allow: ["/"] },
    { agent: "Claude-SearchBot", allow: ["/"] },
    { agent: "PerplexityBot", allow: ["/"] },
    { agent: "GPTBot", disallow: ["/"] },
    { agent: "CCBot", disallow: ["/"] },
  ],
  "ai-blocked": [
    { agent: "GPTBot", disallow: ["/"] },
    { agent: "CCBot", disallow: ["/"] },
    { agent: "Google-Extended", disallow: ["/"] },
    { agent: "ClaudeBot", disallow: ["/"] },
  ],
} as const;

export type AiCrawlerPreset = keyof typeof AI_CRAWLER_PRESETS;

export function appendAiCrawlerPreset(
  robotsContent: string,
  preset: AiCrawlerPreset,
): string {
  const rules = AI_CRAWLER_PRESETS[preset];
  const lines = rules.flatMap((rule) => {
    const output = [`User-agent: ${rule.agent}`];
    if ("allow" in rule && rule.allow) {
      for (const path of rule.allow) {
        output.push(`Allow: ${path}`);
      }
    }
    if ("disallow" in rule && rule.disallow) {
      for (const path of rule.disallow) {
        output.push(`Disallow: ${path}`);
      }
    }
    return [...output, ""];
  });

  return `${robotsContent.trim()}\n\n${lines.join("\n")}`.trim();
}
