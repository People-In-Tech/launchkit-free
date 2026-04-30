export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] ?? match);
}

export function extractVariables(template: string): string[] {
  const matches = template.match(/\{(\w+)\}/g);
  if (!matches) return [];
  const unique = new Set(matches.map((m) => m.slice(1, -1)));
  return Array.from(unique);
}

export function generateSlug(
  pattern: string,
  variables: Record<string, string>
): string {
  return renderTemplate(pattern, variables)
    .toLowerCase()
    .replace(/[^a-z0-9-/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/^\//, "");
}

export function generateStructuredData(page: {
  title: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `/s/${page.slug}`,
  };
}
