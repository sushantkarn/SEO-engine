# @seo-engine/adapters-next

Next.js App Router route factories for robots.txt, llms.txt, and sitemap.xml.

## Example

```typescript
// app/robots.txt/route.ts
import { createRobotsRoute } from "@seo-engine/adapters-next";

export const GET = createRobotsRoute({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
  getContent: async () => null,
});
```

## License

MIT
