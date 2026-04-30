"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TestimonialCard } from "@/components/plugins/testimonials/testimonial-card";
import { cn } from "@/lib/utils";

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

interface TestimonialWallProps {
  featuredOnly?: boolean;
  className?: string;
}

export function TestimonialWall({
  featuredOnly = false,
  className,
}: TestimonialWallProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const url = featuredOnly
          ? "/api/testimonials?featured=true"
          : "/api/testimonials";
        const res = await fetch(url);
        const data = await res.json();
        setTestimonials(data.testimonials ?? []);
      } catch {
        // Silently fail for public display
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, [featuredOnly]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12", className)}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Wall of Love</h2>
        <p className="text-muted-foreground mt-2">
          See what our customers have to say.
        </p>
      </div>

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="mb-6">
            <TestimonialCard
              name={testimonial.name}
              role={testimonial.role}
              company={testimonial.company}
              content={testimonial.content}
              avatarUrl={testimonial.avatarUrl}
              rating={testimonial.rating}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
