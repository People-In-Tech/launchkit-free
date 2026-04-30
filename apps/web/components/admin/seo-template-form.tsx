"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { extractVariables, renderTemplate } from "@/lib/seo";

export function SeoTemplateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slugPattern: "",
    titleTemplate: "",
    descriptionTemplate: "",
    bodyTemplate: "",
  });

  const variables = useMemo(() => {
    const allText = `${form.slugPattern} ${form.titleTemplate} ${form.descriptionTemplate} ${form.bodyTemplate}`;
    return extractVariables(allText);
  }, [form]);

  const previewVars = useMemo(() => {
    const preview: Record<string, string> = {};
    variables.forEach((v) => {
      preview[v] = `[${v}]`;
    });
    return preview;
  }, [variables]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/seo/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, variables }),
      });

      if (res.ok) {
        router.push("/admin/seo/templates");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Tools for Industry"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slugPattern">Slug Pattern</Label>
          <Input
            id="slugPattern"
            value={form.slugPattern}
            onChange={(e) => handleChange("slugPattern", e.target.value)}
            placeholder="e.g., tools-for-{industry}"
          />
          <p className="text-xs text-muted-foreground">
            Use {"{variable}"} placeholders. Generated pages will live at /s/slug.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleTemplate">Title Template</Label>
          <Input
            id="titleTemplate"
            value={form.titleTemplate}
            onChange={(e) => handleChange("titleTemplate", e.target.value)}
            placeholder="e.g., Best {industry} Tools in {year}"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionTemplate">Description Template</Label>
          <textarea
            id="descriptionTemplate"
            value={form.descriptionTemplate}
            onChange={(e) => handleChange("descriptionTemplate", e.target.value)}
            placeholder="Meta description with {variable} placeholders..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyTemplate">Body Template (HTML)</Label>
          <textarea
            id="bodyTemplate"
            value={form.bodyTemplate}
            onChange={(e) => handleChange("bodyTemplate", e.target.value)}
            placeholder="<div>Page content with {variable} placeholders...</div>"
            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={10}
          />
        </div>

        {variables.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Variables:</span>
            {variables.map((v) => (
              <Badge key={v} variant="secondary">
                {`{${v}}`}
              </Badge>
            ))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            saving ||
            !form.name ||
            !form.slugPattern ||
            !form.titleTemplate ||
            !form.descriptionTemplate ||
            !form.bodyTemplate
          }
        >
          {saving ? "Creating..." : "Create Template"}
        </Button>
      </div>

      {/* Preview panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Slug</p>
            <p className="text-sm font-mono">
              /s/{form.slugPattern ? renderTemplate(form.slugPattern, previewVars) : "..."}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Title</p>
            <p className="text-lg font-bold">
              {form.titleTemplate
                ? renderTemplate(form.titleTemplate, previewVars)
                : "Page title..."}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Description
            </p>
            <p className="text-sm text-muted-foreground">
              {form.descriptionTemplate
                ? renderTemplate(form.descriptionTemplate, previewVars)
                : "Meta description..."}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Body</p>
            <div
              className="prose prose-sm dark:prose-invert max-w-none mt-2"
              dangerouslySetInnerHTML={{
                __html: form.bodyTemplate
                  ? renderTemplate(form.bodyTemplate, previewVars)
                  : "<p>Page content preview...</p>",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
