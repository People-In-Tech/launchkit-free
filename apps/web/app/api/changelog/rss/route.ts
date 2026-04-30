// @ts-nocheck
import { db } from "@launchkit/database";
import { changelogEntries } from "@launchkit/database";
import { desc, isNotNull } from "drizzle-orm";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(changelogEntries)
      .where(isNotNull(changelogEntries.publishedAt))
      .orderBy(desc(changelogEntries.publishedAt));

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";

    const items = entries
      .map((entry) => {
        const pubDate = entry.publishedAt
          ? new Date(entry.publishedAt).toUTCString()
          : "";
        return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${siteUrl}/changelog/${entry.slug}</link>
      <description>${escapeXml(entry.content)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${siteUrl}/changelog/${entry.slug}</guid>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>LaunchKit Changelog</title>
    <link>${siteUrl}/changelog</link>
    <description>All the latest updates and improvements to LaunchKit.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Failed to generate changelog RSS feed:", error);
    return new Response("<error>Failed to generate RSS feed</error>", {
      status: 500,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
