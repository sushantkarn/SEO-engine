# @gmbranker/seo-engine-cli

CI-friendly HTML SEO audit CLI.

## Install and usage

Run without installing globally:

```bash
npx @gmbranker/seo-engine-cli audit --url https://example.com
```

If the package is installed as a dev dependency:

```bash
npm install --save-dev @gmbranker/seo-engine-cli
npx seo-engine-cli audit --url https://example.com
```

Select rules explicitly when a project needs a narrower gate:

```bash
npx @gmbranker/seo-engine-cli audit \
  --url https://example.com \
  --rules title,description,canonical,schema,robots,social,hreflang,viewport
```

Available rules are `title`, `description`, `canonical`, `schema`, `robots`,
`robots-ai`, `llms`, `social`, `hreflang`, and `viewport`.

The command fetches public HTML and reports each finding as `pass`, `warning`,
or `fail`. Warnings do not fail the audit; failed required checks make the
report fail. A missing `robots.txt` or `llms.txt` is reported as a warning
rather than crashing the command.

## CI example

```yaml
- name: Audit preview
  run: npx @gmbranker/seo-engine-cli audit --url "$PREVIEW_URL" --rules title,description,canonical,schema,robots
```

Run the audit against a deployed preview or production URL so server-side
metadata is included in the check.

## Programmatic API

The package also exports `auditUrl`, `formatAuditReport`, and `parseRulesArg`
for custom CI runners. `auditUrl` accepts optional `fetchHtml` and `fetchText`
functions when a test or controlled network client is required.

## License

MIT
