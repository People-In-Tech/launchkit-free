"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
}

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/help/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.articles ?? []);
          setOpen(true);
        }
      } catch {
        // silently ignore search errors
      }
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search help articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            // delay closing so link clicks register
            setTimeout(() => setOpen(false), 200);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          className="pl-9"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1">
            {results.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/help/${article.slug}`}
                  className="block px-4 py-2 text-sm hover:bg-muted"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <p className="px-4 py-2 text-sm text-muted-foreground">
            No results found.
          </p>
        </div>
      )}
    </div>
  );
}
