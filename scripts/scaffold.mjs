#!/usr/bin/env node
/**
 * LaunchKit Scaffold CLI
 * ─────────────────────
 * Usage:  node scripts/scaffold.mjs <module-name>
 * Example: node scripts/scaffold.mjs products
 *
 * Generates a full CRUD module:
 *   packages/database/src/schema/<name>.ts
 *   apps/web/app/api/<name>/route.ts
 *   apps/web/app/dashboard/<name>/page.tsx
 *   apps/web/components/<name>/<Name>Table.tsx
 *   apps/web/components/<name>/<Name>Form.tsx
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ── Helpers ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

function pascal(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function ensure(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  const abs = join(ROOT, filePath);
  ensure(dirname(abs));
  if (existsSync(abs)) {
    console.log(`  ⚠  skip  ${filePath}  (already exists)`);
    return;
  }
  writeFileSync(abs, content, "utf-8");
  console.log(`  ✔  created  ${filePath}`);
}

// ── ASCII Banner ──────────────────────────────────────────────────────────────

function banner() {
  const lines = [
    "",
    "  ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗██╗  ██╗██╗████████╗",
    "  ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██║ ██╔╝██║╚══██╔══╝",
    "  ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╔╝ ██║   ██║   ",
    "  ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔═██╗ ██║   ██║   ",
    "  ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║██║  ██╗██║   ██║   ",
    "  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝  ",
    "",
    "  Scaffold CLI  ·  v1.2  ·  getlaunchkit.app",
    "",
  ];
  // ANSI gradient: indigo → cyan
  const colors = ["\x1b[38;5;99m", "\x1b[38;5;105m", "\x1b[38;5;111m", "\x1b[38;5;117m", "\x1b[38;5;123m"];
  lines.forEach((line, i) => {
    const color = colors[Math.min(i, colors.length - 1)];
    process.stdout.write(`${color}${line}\x1b[0m\n`);
  });
}

// ── Templates ─────────────────────────────────────────────────────────────────

function schemaTemplate(name, Name) {
  return `// @ts-nocheck
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const ${name} = pgTable("${name}", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ${Name} = typeof ${name}.$inferSelect;
export type New${Name} = typeof ${name}.$inferInsert;
`;
}

function apiRouteTemplate(name, Name) {
  return `// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { ${name} } from "@launchkit/database/schema/${name}";
import { eq } from "drizzle-orm";

// GET /api/${name} — list all records for the current user's org
export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(${name});
  return NextResponse.json({ data: rows });
}

// POST /api/${name} — create a new record
export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name: itemName, description } = body;

  if (!itemName) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [row] = await db
    .insert(${name})
    .values({ name: itemName, description })
    .returning();

  return NextResponse.json({ data: row }, { status: 201 });
}

// DELETE /api/${name}?id=<id>
export async function DELETE(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(${name}).where(eq(${name}.id, id));
  return NextResponse.json({ success: true });
}
`;
}

function tableComponentTemplate(name, Name) {
  return `"use client";
// @ts-nocheck

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface ${Name}Item {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

interface ${Name}TableProps {
  data: ${Name}Item[];
  onDeleted?: () => void;
}

export function ${Name}Table({ data, onDeleted }: ${Name}TableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(\`/api/${name}?id=\${id}\`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      onDeleted?.();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border border-dashed text-muted-foreground text-sm">
        No ${name} yet — create the first one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.description ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
`;
}

function formComponentTemplate(name, Name) {
  return `"use client";
// @ts-nocheck

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ${Name}FormProps {
  onCreated?: () => void;
}

export function ${Name}Form({ onCreated }: ${Name}FormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/${name}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("${Name} created");
      setName("");
      setDescription("");
      onCreated?.();
    } catch {
      toast.error("Failed to create ${name}");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="${Name} name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading || !name.trim()} className="w-full">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create ${Name}
      </Button>
    </form>
  );
}
`;
}

function pageTemplate(name, Name) {
  return `// @ts-nocheck
import type { Metadata } from "next";
import { Suspense } from "react";
import { ${Name}PageClient } from "@/components/${name}/${Name}PageClient";

export const metadata: Metadata = {
  title: "${Name}",
};

export default function ${Name}Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">${Name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your ${name}.
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <${Name}PageClient />
      </Suspense>
    </div>
  );
}
`;
}

function pageClientTemplate(name, Name) {
  return `"use client";
// @ts-nocheck

import { useState, useEffect, useCallback } from "react";
import { ${Name}Table } from "./${Name}Table";
import { ${Name}Form } from "./${Name}Form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ${Name}PageClient() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/${name}");
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Create ${Name}</CardTitle>
        </CardHeader>
        <CardContent>
          <${Name}Form onCreated={fetchData} />
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        ) : (
          <${Name}Table data={data} onDeleted={fetchData} />
        )}
      </div>
    </div>
  );
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const name = process.argv[2];

if (!name) {
  console.error("\n  Usage: node scripts/scaffold.mjs <module-name>\n");
  console.error("  Example: node scripts/scaffold.mjs products\n");
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error(`\n  ✕ Invalid module name "${name}". Use lowercase letters, digits, and hyphens.\n`);
  process.exit(1);
}

const Name = pascal(name);

banner();
console.log(`\x1b[36m  Scaffolding module: \x1b[1m${name}\x1b[0m\n`);

write(`packages/database/src/schema/${name}.ts`, schemaTemplate(name, Name));
write(`apps/web/app/api/${name}/route.ts`, apiRouteTemplate(name, Name));
write(`apps/web/app/dashboard/${name}/page.tsx`, pageTemplate(name, Name));
write(`apps/web/components/${name}/${Name}Table.tsx`, tableComponentTemplate(name, Name));
write(`apps/web/components/${name}/${Name}Form.tsx`, formComponentTemplate(name, Name));
write(`apps/web/components/${name}/${Name}PageClient.tsx`, pageClientTemplate(name, Name));

console.log(`
\x1b[32m  ✔ Module "${name}" scaffolded!\x1b[0m

  \x1b[90mNext steps:\x1b[0m
  1. Run \x1b[1mpnpm db:push\x1b[0m to apply the schema migration
  2. Add \x1b[1m{ label: "${Name}", href: "/dashboard/${name}", icon: Layers }\x1b[0m to your sidebar nav
  3. Import the schema in \x1b[1mpackages/database/src/schema/index.ts\x1b[0m

  Happy shipping! 🚀
`);
