---
name: Setup Help
about: Stuck on getting LaunchKit running locally or deployed
title: "[Setup] "
labels: ["setup", "question"]
assignees: ''
---

## Where are you stuck?
<!-- Describe exactly what step you're on and what isn't working -->

## What you've tried
<!-- Paste the commands you ran and their output -->
```bash
paste commands and output here
```

## Your setup
- LaunchKit version: <!-- e.g., v1.1.0 -->
- Node.js version: <!-- node --version -->
- pnpm version: <!-- pnpm --version -->
- Deployment target: <!-- Local / Vercel / Other -->
- OS: <!-- macOS / Windows / Linux -->

## Error messages
```
paste full error output here
```

## Have you checked these?
- [ ] Run `pnpm install` from the root
- [ ] Copied `.env.example` to `.env.local` and filled all required variables
- [ ] Run `pnpm db:push` to apply the database schema
- [ ] Clerk publishable key starts with `pk_test_` or `pk_live_`
- [ ] Stripe secret key starts with `sk_test_` or `sk_live_`

> 💡 **Quick tip**: Open this repo in GitHub Codespaces for a zero-setup environment — it works out of the box.
