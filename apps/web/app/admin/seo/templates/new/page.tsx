import { SeoTemplateForm } from "@/components/admin/seo-template-form";

export default function NewSeoTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create SEO Template</h1>
        <p className="text-muted-foreground">
          Define a template with variable placeholders for programmatic page generation.
        </p>
      </div>

      <SeoTemplateForm />
    </div>
  );
}
