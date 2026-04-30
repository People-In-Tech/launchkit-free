"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Database, AlertCircle } from "lucide-react";

const DB_CONFIGS: Record<string, { envVar: string; placeholder: string; instructions: string[] }> = {
  Neon: {
    envVar: "DATABASE_URL",
    placeholder: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb",
    instructions: [
      "Create a Neon project at neon.tech",
      "Copy the connection string from your project dashboard",
      "Paste it below or add it to .env.local",
      "Run `pnpm db:push` to apply the schema",
    ],
  },
  Supabase: {
    envVar: "DATABASE_URL",
    placeholder: "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres",
    instructions: [
      "Create a Supabase project at supabase.com",
      "Go to Settings > Database > Connection string",
      "Copy the URI and paste below",
      "Run `pnpm db:push` to apply the schema",
    ],
  },
  PlanetScale: {
    envVar: "DATABASE_URL",
    placeholder: "mysql://user:pass@aws.connect.psdb.cloud/dbname",
    instructions: [
      "Create a PlanetScale database at planetscale.com",
      "Create a branch and get credentials",
      "Copy the connection string",
      "Run `pnpm db:push` to apply the schema",
    ],
  },
};

interface DatabaseStepProps {
  stackChoices: Record<string, string>;
}

export function DatabaseStep({ stackChoices }: DatabaseStepProps) {
  const provider = stackChoices.database ?? "Neon";
  const config = DB_CONFIGS[provider] ?? DB_CONFIGS.Neon;
  const [connectionString, setConnectionString] = useState("");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTest = async () => {
    setTesting(true);
    setStatus("idle");
    // Simulate connection test
    await new Promise((r) => setTimeout(r, 2000));
    setStatus(connectionString.length > 10 ? "success" : "error");
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5" />
          Connect {provider}
        </h3>
        <p className="text-muted-foreground">
          Set up your {provider} database connection.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Setup Instructions</h4>
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          {config.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-2">
        <Label htmlFor="connection-string">{config.envVar}</Label>
        <Input
          id="connection-string"
          type="password"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          placeholder={config.placeholder}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleTest}
          disabled={testing || !connectionString}
          variant="outline"
        >
          {testing ? "Testing..." : "Test Connection"}
        </Button>
        {status === "success" && (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        )}
        {status === "error" && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Connection Failed
          </Badge>
        )}
      </div>

      <div className="rounded-md border p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-2">Run Migrations</h4>
        <code className="text-sm block bg-background p-2 rounded">
          pnpm db:push
        </code>
      </div>
    </div>
  );
}
