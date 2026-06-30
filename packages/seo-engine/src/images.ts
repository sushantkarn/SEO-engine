import type { ImageSeoSettings } from "./types.js";

export function processContentImages(
  content: string,
  title: string,
  settings: ImageSeoSettings,
): string {
  if (!settings.addMissingAlt && !settings.addMissingTitle) {
    return content;
  }

  let imgCount = 0;
  const altTemplate = settings.altTemplate || "%title% %count%";
  const titleTemplate = settings.titleTemplate || "%title%";

  return content.replace(/<img\s+([^>]+)>/gi, (_match, attributes: string) => {
    imgCount++;

    let newAttributes = attributes;
    const hasAlt = /alt=['"]|alt=/i.test(attributes);
    const hasTitle = /title=['"]|title=/i.test(attributes);

    const srcMatch = /src=['"]([^'"]+)['"]/i.exec(attributes);
    const src = srcMatch ? srcMatch[1] : "";
    const filename =
      src.split("/").pop()?.split("?")[0].split(".")[0] || "image";

    const replaceVars = (template: string) =>
      template
        .replace(/%title%/g, title)
        .replace(/%count%/g, imgCount.toString())
        .replace(/%filename%/g, filename);

    if (settings.addMissingAlt && !hasAlt) {
      const altText = replaceVars(altTemplate);
      newAttributes += ` alt="${altText}"`;
    }

    if (settings.addMissingTitle && !hasTitle) {
      const titleText = replaceVars(titleTemplate);
      newAttributes += ` title="${titleText}"`;
    }

    return `<img ${newAttributes}>`;
  });
}
