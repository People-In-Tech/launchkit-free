"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WelcomeStepProps {
  projectDescription: string;
  onSave: (description: string) => Promise<void>;
}

export function WelcomeStep({ projectDescription, onSave }: WelcomeStepProps) {
  const [description, setDescription] = useState(projectDescription);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(description);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Welcome to LaunchKit!</h3>
        <p className="text-muted-foreground">
          Let&apos;s get your project set up. Start by telling us about what you&apos;re building
          so we can provide personalized recommendations.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">
          Describe your project in a few sentences
        </Label>
        <textarea
          id="project-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I'm building a B2B SaaS platform for project management with team collaboration features, subscription billing, and integrations with Slack and GitHub..."
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={5}
        />
      </div>

      <Button onClick={handleSave} disabled={saving || !description.trim()}>
        {saving ? "Saving..." : "Save & Continue"}
      </Button>
    </div>
  );
}
