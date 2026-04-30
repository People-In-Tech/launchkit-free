// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { edgeConfig } from "@/lib/edge-config";
import { getReadReplicaUrl } from "@launchkit/database/multi-region";

export default async function RegionsPage() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    redirect("/dashboard");
  }

  const regions = edgeConfig.regions.map((region) => {
    const replicaUrl = getReadReplicaUrl(region.id);
    return {
      ...region,
      hasReplica: !!replicaUrl,
      isDefault: region.id === edgeConfig.defaultRegion,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regions</h1>
        <p className="text-muted-foreground">
          Multi-region deployment configuration and read replica status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <Card key={region.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{region.name}</CardTitle>
                <div className="flex gap-1">
                  {region.isDefault && (
                    <Badge variant="default">Primary</Badge>
                  )}
                  <Badge variant={region.hasReplica ? "default" : "secondary"}>
                    {region.hasReplica ? "Connected" : "Not configured"}
                  </Badge>
                </div>
              </div>
              <CardDescription className="font-mono text-xs">
                {region.id} / {region.neonRegion}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Read Replica</span>
                  <span>
                    {region.hasReplica ? (
                      <span className="text-green-600 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not configured
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neon Region</span>
                  <span className="font-mono text-xs">
                    {region.neonRegion}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Set up read replicas to serve data from the nearest region.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium">1. Create Neon Read Replicas</p>
            <p className="text-muted-foreground">
              In your Neon dashboard, create read replicas in each region you
              want to support. Copy the connection string for each replica.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium">2. Set Environment Variables</p>
            <p className="text-muted-foreground">
              Add the replica connection strings as environment variables:
            </p>
            <pre className="rounded bg-muted p-3 text-xs font-mono overflow-x-auto">
{`NEON_READ_REPLICA_IAD1_URL=postgresql://...
NEON_READ_REPLICA_SFO1_URL=postgresql://...
NEON_READ_REPLICA_LHR1_URL=postgresql://...
NEON_READ_REPLICA_HND1_URL=postgresql://...
NEON_READ_REPLICA_SYD1_URL=postgresql://...`}
            </pre>
          </div>
          <div className="space-y-2">
            <p className="font-medium">3. Deploy to Multiple Regions</p>
            <p className="text-muted-foreground">
              Configure your Vercel project to deploy to multiple regions via{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                vercel.json
              </code>
              . See the deployment guide at{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                templates/deploy/multi-region.md
              </code>{" "}
              for complete instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
