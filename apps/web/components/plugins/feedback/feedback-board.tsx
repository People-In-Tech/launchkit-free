"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, ArrowUpDown, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: number;
  userId: string;
  orgId: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes: number;
  createdAt: string;
}

type SortOption = "votes" | "newest";

const categoryColors: Record<string, string> = {
  feature: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  bug: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  improvement:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

export function FeedbackBoard() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("votes");
  const [voting, setVoting] = useState<Set<number>>(new Set());

  async function handleUpvote(id: number) {
    if (voting.has(id)) return;
    setVoting((prev) => new Set(prev).add(id));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
    try {
      const res = await fetch(`/api/feedback/${id}/upvote`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to upvote");
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, upvotes: item.upvotes - 1 } : item
        )
      );
      toast.error("Failed to upvote. Please try again.");
    } finally {
      setVoting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  useEffect(() => {
    fetchFeedback();
  }, [sort]);

  async function fetchFeedback() {
    setLoading(true);
    try {
      const params = sort === "newest" ? "?sort=newest" : "";
      const res = await fetch(`/api/feedback${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          variant={sort === "votes" ? "default" : "outline"}
          size="sm"
          onClick={() => setSort("votes")}
          className="gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Most Votes
        </Button>
        <Button
          variant={sort === "newest" ? "default" : "outline"}
          size="sm"
          onClick={() => setSort("newest")}
          className="gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Newest
        </Button>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading feedback...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No feedback yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          categoryColors[item.category] ??
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpvote(item.id)}
                    disabled={voting.has(item.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0 rounded-md border px-2 py-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{item.upvotes}</span>
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
