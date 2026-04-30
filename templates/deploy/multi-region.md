# Multi-Region Deployment Guide

This guide covers setting up LaunchKit for multi-region deployment with Vercel Edge Functions and Neon read replicas.

## Overview

Multi-region deployment reduces latency by serving requests from the nearest geographic region. LaunchKit supports this through:

- **Vercel Edge Functions**: Deploy serverless functions to multiple regions
- **Neon Read Replicas**: Serve database reads from regional replicas
- **Geo-routing**: Automatically route users to the nearest region

## Supported Regions

| Region ID | Name                      | Neon Region             |
| --------- | ------------------------- | ----------------------- |
| `iad1`    | US East (Virginia)        | `aws-us-east-1`        |
| `sfo1`    | US West (San Francisco)   | `aws-us-west-2`        |
| `lhr1`    | Europe (London)           | `aws-eu-west-1`        |
| `hnd1`    | Asia (Tokyo)              | `aws-ap-northeast-1`   |
| `syd1`    | Australia (Sydney)        | `aws-ap-southeast-2`   |

## 1. Neon Read Replicas Setup

### Create Read Replicas

1. Go to your [Neon Dashboard](https://console.neon.tech/)
2. Select your project
3. Navigate to **Branches** → **Create Branch**
4. For each region you want to support:
   - Create a new branch (e.g., `replica-sfo1`)
   - Select the target region (e.g., `aws-us-west-2`)
   - Copy the connection string

### Connection Strings

Each replica has its own connection string. You'll need these for environment variables in the next step.

> **Note**: The primary database (typically `aws-us-east-1`) handles all writes. Read replicas are eventually consistent and should only be used for read-heavy queries.

## 2. Environment Variables

Set the following environment variables for each region. If a region's variable is not set, requests from that region will fall back to the primary `DATABASE_URL`.

```bash
# Primary database (required)
DATABASE_URL=postgresql://user:pass@primary-host.neon.tech/db?sslmode=require

# Regional read replicas (optional — set per region you want to support)
NEON_READ_REPLICA_IAD1_URL=postgresql://user:pass@iad1-host.neon.tech/db?sslmode=require
NEON_READ_REPLICA_SFO1_URL=postgresql://user:pass@sfo1-host.neon.tech/db?sslmode=require
NEON_READ_REPLICA_LHR1_URL=postgresql://user:pass@lhr1-host.neon.tech/db?sslmode=require
NEON_READ_REPLICA_HND1_URL=postgresql://user:pass@hnd1-host.neon.tech/db?sslmode=require
NEON_READ_REPLICA_SYD1_URL=postgresql://user:pass@syd1-host.neon.tech/db?sslmode=require
```

### Setting Variables in Vercel

```bash
# Using Vercel CLI
vercel env add NEON_READ_REPLICA_SFO1_URL production
vercel env add NEON_READ_REPLICA_LHR1_URL production
```

Or set them in the Vercel Dashboard under **Settings** → **Environment Variables**.

## 3. Vercel Edge Runtime Configuration

### vercel.json

The `apps/web/vercel.json` file configures which regions Vercel deploys to:

```json
{
  "regions": ["iad1", "sfo1", "lhr1"],
  "framework": "nextjs"
}
```

Add or remove region IDs to match your deployment targets. Only include regions where you have read replicas configured.

### Edge Runtime for API Routes

To run specific API routes at the edge (all regions), add the runtime export:

```typescript
// In any API route file
export const runtime = "edge";
```

> **Note**: Edge Runtime has limitations (no Node.js `fs`, `crypto` module differences). Only use it for routes that don't need Node.js-specific APIs.

## 4. DNS Configuration for Geo-Routing

### Using Vercel (Automatic)

If you're deploying on Vercel with a custom domain, Vercel handles geo-routing automatically when multiple regions are configured. No additional DNS setup is needed.

### Using Cloudflare (Manual)

For more control, use Cloudflare's geo-steering:

1. **Add your domain to Cloudflare**
2. **Create origin pools** for each region:
   - Pool: `us-east` → Origin: `iad1.your-app.vercel.app`
   - Pool: `us-west` → Origin: `sfo1.your-app.vercel.app`
   - Pool: `europe` → Origin: `lhr1.your-app.vercel.app`
3. **Create a Load Balancer** with geo-steering:
   - Region mapping: Americas → `us-east`, `us-west`
   - Region mapping: Europe → `europe`
   - Fallback pool: `us-east`

### Using AWS Route 53

1. Create a **latency-based routing policy**
2. Add records for each region pointing to the corresponding Vercel deployment
3. Route 53 automatically directs users to the lowest-latency region

## 5. Monitoring Latency Per Region

### Vercel Analytics

Enable Vercel Analytics to track performance by region:

1. Go to your Vercel project → **Analytics**
2. Enable **Web Vitals** and **Speed Insights**
3. Filter by region to compare latency

### Custom Monitoring

Add a health check endpoint that reports the current region:

```typescript
// app/api/health/route.ts
export const runtime = "edge";

export function GET() {
  return Response.json({
    status: "ok",
    region: process.env.VERCEL_REGION || "unknown",
    timestamp: new Date().toISOString(),
  });
}
```

Monitor this endpoint from multiple locations using:
- [Checkly](https://www.checklyhq.com/) — Global monitoring with Playwright
- [Better Uptime](https://betteruptime.com/) — Multi-region health checks
- [Datadog Synthetics](https://www.datadoghq.com/) — Synthetic monitoring

### Database Latency

Monitor read replica lag using Neon's built-in metrics:

1. Go to your Neon Dashboard → **Monitoring**
2. Check **Replication Lag** for each replica branch
3. Set alerts for lag exceeding your threshold (e.g., > 100ms)

## Architecture Diagram

```
                    ┌──────────────┐
                    │   Cloudflare  │
                    │  / Vercel DNS │
                    └──────┬───────┘
                           │ Geo-route
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  iad1    │ │  sfo1    │ │  lhr1    │
        │ (US East)│ │ (US West)│ │ (Europe) │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
        ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
        │  Neon    │ │  Neon    │ │  Neon    │
        │ Primary  │ │ Replica  │ │ Replica  │
        │ (writes) │ │ (reads)  │ │ (reads)  │
        └──────────┘ └──────────┘ └──────────┘
```

## Troubleshooting

### Read replica not connecting

1. Verify the environment variable is set: `echo $NEON_READ_REPLICA_SFO1_URL`
2. Check that the Neon branch exists and is in the correct region
3. Ensure the connection string includes `?sslmode=require`

### High replication lag

1. Check Neon dashboard for replica health
2. Reduce write frequency to the primary if possible
3. Consider upgrading your Neon plan for faster replication

### Requests not routing to nearest region

1. Verify `vercel.json` includes the target regions
2. Check DNS propagation with `dig your-domain.com`
3. Test from different regions using a VPN or monitoring service
