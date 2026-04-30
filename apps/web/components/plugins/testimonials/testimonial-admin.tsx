"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  avatarUrl: string | null;
  rating: number;
  featured: boolean;
  createdAt: string;
}

interface TestimonialForm {
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl: string;
  rating: number;
  featured: boolean;
}

const emptyForm: TestimonialForm = {
  name: "",
  role: "",
  company: "",
  content: "",
  avatarUrl: "",
  rating: 5,
  featured: false,
};

export function TestimonialAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to fetch testimonials.");
        return;
      }

      setTestimonials(data.testimonials ?? []);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(testimonial: Testimonial) {
    setForm({
      name: testimonial.name,
      role: testimonial.role ?? "",
      company: testimonial.company ?? "",
      content: testimonial.content,
      avatarUrl: testimonial.avatarUrl ?? "",
      rating: testimonial.rating,
      featured: testimonial.featured,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Name and content are required.");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/testimonials?id=${editingId}`
        : "/api/testimonials";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role || undefined,
          company: form.company || undefined,
          content: form.content,
          avatarUrl: form.avatarUrl || undefined,
          rating: form.rating,
          featured: form.featured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save testimonial");
      }

      toast.success(
        editingId ? "Testimonial updated!" : "Testimonial created!"
      );
      closeForm();
      fetchTestimonials();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save testimonial"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete testimonial");
      }

      toast.success("Testimonial deleted.");
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete testimonial"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Testimonials</h2>
          <p className="text-muted-foreground">
            Manage customer testimonials displayed on your site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTestimonials}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={openNewForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? "Edit Testimonial" : "New Testimonial"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="t-name" className="text-sm font-medium">
                    Name *
                  </label>
                  <Input
                    id="t-name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="t-role" className="text-sm font-medium">
                    Role
                  </label>
                  <Input
                    id="t-role"
                    placeholder="CEO"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="t-company" className="text-sm font-medium">
                    Company
                  </label>
                  <Input
                    id="t-company"
                    placeholder="Acme Inc."
                    value={form.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="t-avatar" className="text-sm font-medium">
                    Avatar URL
                  </label>
                  <Input
                    id="t-avatar"
                    placeholder="https://..."
                    value={form.avatarUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, avatarUrl: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="t-content" className="text-sm font-medium">
                  Testimonial *
                </label>
                <textarea
                  id="t-content"
                  rows={4}
                  placeholder="What did the customer say?"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="space-y-2">
                  <label htmlFor="t-rating" className="text-sm font-medium">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, rating: i + 1 }))
                        }
                        className="p-0.5"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            i < form.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="t-featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="t-featured" className="text-sm font-medium">
                    Featured
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>
            {testimonials.length} testimonial
            {testimonials.length !== 1 ? "s" : ""} total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No testimonials yet. Click &ldquo;Add Testimonial&rdquo; to get
              started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Content
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Rating
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Featured
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{t.name}</div>
                        {(t.role || t.company) && (
                          <div className="text-xs text-muted-foreground">
                            {[t.role, t.company].filter(Boolean).join(" at ")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 max-w-xs truncate">
                        {t.content}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < t.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.featured
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.featured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(t)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
