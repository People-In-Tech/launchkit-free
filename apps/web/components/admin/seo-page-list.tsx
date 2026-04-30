"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";

interface SeoPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean | null;
  templateId: string;
  variables: Record<string, string>;
  createdAt: Date;
}

interface SeoPageListProps {
  initialPages: SeoPage[];
}

export function SeoPageList({ initialPages }: SeoPageListProps) {
  const [pages, setPages] = useState(initialPages);

  const togglePublish = async (pageId: string, published: boolean) => {
    const res = await fetch(`/api/seo/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });

    if (res.ok) {
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, published } : p))
      );
    }
  };

  const deletePage = async (pageId: string) => {
    const res = await fetch(`/api/seo/pages/${pageId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    }
  };

  const publishAll = async () => {
    for (const page of pages.filter((p) => !p.published)) {
      await togglePublish(page.id, true);
    }
  };

  const deleteAll = async () => {
    for (const page of pages) {
      await deletePage(page.id);
    }
  };

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No pages generated yet. Use the &quot;Generate Pages&quot; button to create pages from a template.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={publishAll}>
          <Eye className="mr-2 h-3 w-3" />
          Publish All
        </Button>
        <Button variant="outline" size="sm" onClick={deleteAll}>
          <Trash2 className="mr-2 h-3 w-3" />
          Delete All
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">
          {pages.filter((p) => p.published).length} / {pages.length} published
        </span>
      </div>

      <div className="space-y-2">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{page.title}</span>
                  <Badge variant={page.published ? "default" : "secondary"}>
                    {page.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">/s/{page.slug}</p>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublish(page.id, !page.published)}
                  title={page.published ? "Unpublish" : "Publish"}
                >
                  {page.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {page.published && (
                  <a href={`/s/${page.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="View page">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePage(page.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
