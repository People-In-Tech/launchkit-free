import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function AdminLoading() {
  return (
    <div className="flex h-screen">
      {/* Admin sidebar skeleton */}
      <aside className="w-64 border-r bg-background p-4">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <Skeleton className="h-6 w-28" />
        </div>
        <nav className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Skeleton className="h-9 w-52" />

        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Table header */}
              <div className="flex gap-4 border-b bg-muted/50 px-3 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 border-b px-3 py-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
