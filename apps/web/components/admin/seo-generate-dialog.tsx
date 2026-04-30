"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/seo";
import { Plus, Sparkles } from "lucide-react";

interface Template {
  id: string;
  name: string;
  variables: string[];
  slugPattern: string;
}

interface SeoGenerateDialogProps {
  templates: Template[];
}

export function SeoGenerateDialog({ templates }: SeoGenerateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [dataInput, setDataInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ generated: number; errors: number } | null>(null);

  const template = templates.find((t) => t.id === selectedTemplate);

  const parsedSets = useMemo(() => {
    if (!dataInput.trim() || !template) return [];

    try {
      // Try JSON first
      const parsed = JSON.parse(dataInput);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      // Fall back to CSV-style: one line per set, comma-separated values matching variable order
      const lines = dataInput.trim().split("\n").filter(Boolean);
      return lines.map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        template.variables.forEach((v, i) => {
          obj[v] = values[i] ?? "";
        });
        return obj;
      });
    }
  }, [dataInput, template]);

  const previewSlugs = useMemo(() => {
    if (!template) return [];
    return parsedSets.map((vars) => generateSlug(template.slugPattern, vars));
  }, [parsedSets, template]);

  const handleGenerate = async () => {
    if (!selectedTemplate || parsedSets.length === 0) return;
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          variableSets: parsedSets,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({ generated: data.generated, errors: data.errors });
        router.refresh();
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Generate Pages
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate SEO Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Template</Label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setDataInput("");
                setResult(null);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Choose a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.variables.map((v) => `{${v}}`).join(", ")}
                </option>
              ))}
            </select>
          </div>

          {template && (
            <>
              <div className="space-y-2">
                <Label>
                  Variable Data (CSV or JSON)
                </Label>
                <p className="text-xs text-muted-foreground">
                  CSV: one line per page, values in order: {template.variables.join(", ")}
                  <br />
                  JSON: array of objects with keys: {template.variables.map((v) => `"${v}"`).join(", ")}
                </p>
                <textarea
                  value={dataInput}
                  onChange={(e) => {
                    setDataInput(e.target.value);
                    setResult(null);
                  }}
                  placeholder={
                    template.variables.length === 2
                      ? `e.g., fintech, 2025\nhealthcare, 2025\ne-commerce, 2025`
                      : `e.g., value1\nvalue2\nvalue3`
                  }
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={6}
                />
              </div>

              {previewSlugs.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview ({previewSlugs.length} pages)</Label>
                  <div className="flex flex-wrap gap-1">
                    {previewSlugs.map((slug) => (
                      <Badge key={slug} variant="outline" className="font-mono text-xs">
                        /s/{slug}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result && (
                <div className="rounded-md border p-3 bg-muted/50">
                  <p className="text-sm">
                    Generated {result.generated} pages.
                    {result.errors > 0 && ` ${result.errors} errors.`}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedTemplate || parsedSets.length === 0}
            >
              {generating ? "Generating..." : `Generate ${parsedSets.length} Pages`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
