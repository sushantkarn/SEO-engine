# @gmbranker/seo-engine-adapters-next

Next.js App Router route factories for metadata, robots.txt, llms.txt, and sitemap.xml.

`createNextMetadata` maps the core contract to Next.js metadata, including
robots directives, canonical URLs, Open Graph, Twitter/X cards, and alternate
language URLs.

## Example

```typescript
// app/robots.txt/route.ts
import { createRobotsRoute } from "@gmbranker/seo-engine-adapters-next";

export const GET = createRobotsRoute({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
  getContent: async () => null,
});
```

## License

MIT
