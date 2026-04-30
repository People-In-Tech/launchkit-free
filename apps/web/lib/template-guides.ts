export type PromptTool =
  | "terminal"
  | "claude-code"
  | "higgfields"
  | "cursor"
  | "perplexity";

export interface PromptBlock {
  label: string;
  tool: PromptTool;
  prompt: string;
}

export interface Milestone {
  number: number;
  title: string;
  description: string;
  prompts: PromptBlock[];
}

export interface TemplateGuide {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  categories: string[];
  overview: string;
  milestones: Milestone[];
}

export const TOOL_META: Record<
  PromptTool,
  { label: string; badgeClass: string; dotClass: string }
> = {
  terminal: {
    label: "Terminal",
    badgeClass:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dotClass: "bg-emerald-400",
  },
  "claude-code": {
    label: "Claude Code",
    badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    dotClass: "bg-orange-400",
  },
  higgfields: {
    label: "higgfields.ai",
    badgeClass: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    dotClass: "bg-pink-400",
  },
  cursor: {
    label: "Cursor",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dotClass: "bg-blue-400",
  },
  perplexity: {
    label: "Perplexity",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    dotClass: "bg-cyan-400",
  },
};

export const TEMPLATE_GUIDES: TemplateGuide[] = [
  // ─── HAVENO ──────────────────────────────────────────────────────────────
  {
    slug: "haveno",
    name: "Haveno",
    tagline: "Real estate agent website with listings, lead capture, and automated follow-up.",
    image: "/templates/haveno.jpg",
    categories: ["Real Estate", "Portfolio", "Agency"],
    overview:
      "Haveno is a conversion-focused website built for real estate agents who want to stand out online. Clone LaunchKit, swap in your branding and property photos, and you'll have a full site — listings grid, lead capture form, and a 3-email drip sequence — live in under a day.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Get the free LaunchKit template running locally and configure it for the Haveno real estate brand — name, colors, and metadata.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git haveno
cd haveno
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Brand configuration",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for a real estate agent website called Haveno. 
- Primary brand color: warm gold (#B8935A)
- Site tagline: "More Listings. More Clients. More Closings."
- Update metadata in apps/web/app/layout.tsx (title, description, og:image)
- Update any global constants or config files with the new brand name
- Replace any placeholder logo text with "Haveno"`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Use higgfields.ai to generate the hero background, agent headshot, and property photos. Save them to apps/web/public/images/.",
        prompts: [
          {
            label: "Hero background — luxury home",
            tool: "higgfields",
            prompt: `Luxury modern home exterior with infinity pool and landscaped garden, warm golden hour lighting, photorealistic architectural photography, wide angle composition, clear blue sky, no people, no text overlays, 16:9 ratio`,
          },
          {
            label: "Agent professional headshot",
            tool: "higgfields",
            prompt: `Professional real estate agent headshot, business casual attire, warm confident smile, clean neutral off-white background, soft natural studio lighting, sharp focus, high resolution portrait, 1:1 square ratio`,
          },
          {
            label: "Property listing card photo",
            tool: "higgfields",
            prompt: `Beautiful modern suburban home exterior, manicured front lawn, clear sky, bright midday lighting, straight-on perspective, real estate listing photo style, no text, no watermarks, 4:3 ratio`,
          },
        ],
      },
      {
        number: 3,
        title: "Build the Hero & Stats Section",
        description:
          "Create the homepage hero with your headline, CTA buttons, hero image, and social proof stats that establish authority.",
        prompts: [
          {
            label: "Hero section with stats bar",
            tool: "claude-code",
            prompt: `Build the Haveno homepage hero in apps/web/app/page.tsx:

Hero section:
- Full-width background image (use /images/hero.jpg)
- Headline: "More Listings. More Clients. More Closings."
- Subtext: "The all-in-one website solution designed for real estate agents who want to stand out and grow their business."
- Two CTAs: "View Listings" (primary dark button) and "Book a Consultation" (outline)

Below the hero, add a stats row with 4 metrics:
- $126M+ — Total Sales Volume
- 200+ — Homes Sold
- 5-Star — Client Rating
- 10+ — Years Experience

Add a floating "Just Sold" toast card positioned bottom-right of the hero image. It should show a small house thumbnail, "Just Sold", "123 Oceanview Dr", and "$2,450,000". Animate it sliding in from the right after 1 second.`,
          },
        ],
      },
      {
        number: 4,
        title: "Property Listings Page",
        description:
          "Build the /listings page with a database-connected grid of property cards, search bar, and status filters.",
        prompts: [
          {
            label: "Database schema for listings",
            tool: "claude-code",
            prompt: `Add a 'listings' table to the Drizzle schema in packages/db/src/schema.ts:

Fields: id (uuid), title (text), address (text), city (text), price (integer), bedrooms (integer), bathrooms (integer), sqft (integer), status ('for_sale' | 'sold' | 'pending'), imageUrl (text), description (text), featured (boolean, default false), createdAt (timestamp)

Generate and run the migration with: npx drizzle-kit push`,
          },
          {
            label: "Build the /listings page",
            tool: "claude-code",
            prompt: `Create apps/web/app/listings/page.tsx — a property listings page:

- Search bar at the top with placeholder "Search by address or city"
- Filter tabs: All | For Sale | Sold | Pending
- Responsive grid (1 col mobile, 2 tablet, 3 desktop) of property cards
- Each card: property photo, price in large bold, address, status badge, bed/bath/sqft row with icons
- Empty state when no listings match
- Fetch listings server-side from Neon using Drizzle
- Add a "Book a Consultation" CTA banner at the bottom

Style matches the existing dark site theme.`,
          },
        ],
      },
      {
        number: 5,
        title: "Lead Capture + Email Drip",
        description:
          "Add the homepage contact form and wire up a 3-email welcome sequence that fires automatically when someone submits.",
        prompts: [
          {
            label: "Lead capture form + API route",
            tool: "claude-code",
            prompt: `Add a lead capture section to the Haveno homepage:

Form fields: Full Name, Email, Phone (optional), "What are you looking for?" dropdown (Buying a Home / Selling My Home / Both)

On submit:
1. POST to /api/leads
2. Save lead to a 'leads' table (name, email, phone, intent, source, createdAt)
3. Send an immediate confirmation email via Resend
4. Return success/error JSON

Build the API route at apps/web/app/api/leads/route.ts. Use the existing email package in packages/email/.`,
          },
          {
            label: "3-email welcome sequence",
            tool: "claude-code",
            prompt: `Create three React Email templates in packages/email/src/templates/ for Haveno real estate leads:

Email 1 (send immediately): Subject: "Thanks [name] — here's what happens next"
- Warm welcome from the agent
- What to expect (quick response, personalized help)
- Link to view listings

Email 2 (send day 3): Subject: "The market is moving fast — here's what you need to know"
- Short market insight paragraph
- 2-3 current listings as previews
- CTA: "Schedule a free 15-min call"

Email 3 (send day 7): Subject: "Still thinking it over? Let's talk."
- Low-pressure final follow-up
- Direct calendar booking link (Calendly placeholder)
- Unsubscribe link at bottom

Use React Email components and match the warm gold (#B8935A) brand color.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Push to GitHub, add environment variables in Vercel, and deploy. Your site goes live in minutes.",
        prompts: [
          {
            label: "Final commit and deploy",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: Haveno real estate template — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Vercel env vars checklist",
            tool: "perplexity",
            prompt: `What environment variables does a Next.js 14 app with Clerk auth, Stripe payments, Neon Postgres, and Resend email need in Vercel? List all required NEXT_PUBLIC_ variables and server-side secrets I need to add to Vercel project settings before deployment.`,
          },
        ],
      },
    ],
  },

  // ─── SOCIALHUB ───────────────────────────────────────────────────────────
  {
    slug: "socialhub",
    name: "Socialhub",
    tagline: "Social media management platform for real estate agents with post scheduling and analytics.",
    image: "/templates/socialhub.jpg",
    categories: ["Social Media", "Automation", "Growth"],
    overview:
      "Socialhub gives real estate agents one place to schedule posts, track engagement, and turn followers into leads. It's a SaaS product built on LaunchKit — auth, billing, and email all pre-wired. Clone it, add your integrations, and sell it as a subscription.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Set up the LaunchKit Pro template locally and configure it for the Socialhub brand — purple theme, SaaS-focused metadata.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git socialhub
cd socialhub
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Brand configuration",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for a social media management SaaS called Socialhub.
- Primary color: vibrant purple (#7C3AED)
- Tagline: "More Engagement. More Leads. More Closings."
- Target audience: real estate agents managing social media
- Update metadata in apps/web/app/layout.tsx
- Update Stripe product names in any config to reflect Socialhub pricing tiers (Starter $49/mo, Pro $99/mo)`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Generate the marketing site visuals and UI mockup screenshots with higgfields.ai. Include social platform icons and engagement graphics.",
        prompts: [
          {
            label: "Hero marketing image",
            tool: "higgfields",
            prompt: `Modern SaaS dashboard mockup for social media management, clean UI with post scheduler calendar, engagement analytics charts, purple and white color scheme, laptop screen angled perspective, professional software product screenshot style, no real logos, 16:9`,
          },
          {
            label: "Social media engagement graphic",
            tool: "higgfields",
            prompt: `Abstract digital illustration of social media engagement — floating notification bubbles, heart icons, follower count numbers, modern gradient purple to indigo background, clean flat design, no text, suitable for hero background, 16:9`,
          },
          {
            label: "Real estate agent social post mockup",
            tool: "higgfields",
            prompt: `Instagram post mockup for a real estate listing, clean modern design with luxury home photo, "Just Listed" badge, agent contact info placeholder, professional typography, white card frame on neutral background, 1:1 square`,
          },
        ],
      },
      {
        number: 3,
        title: "Marketing Landing Page",
        description:
          "Build the public marketing site that converts visitors into subscribers — hero, features, pricing, and social proof.",
        prompts: [
          {
            label: "Hero + features section",
            tool: "claude-code",
            prompt: `Build the Socialhub marketing homepage in apps/web/app/page.tsx:

Hero:
- Headline: "More Engagement. More Leads. More Closings."
- Subtext: "The all-in-one social solution designed for real estate agents who want to grow their brand and convert followers into clients."
- CTA buttons: "Get Started" (primary) and "See How It Works" (ghost)
- Stats row: 12.6K Followers avg, 5.4% Engagement Rate, 243 Leads Generated, 89.2K Reach

Features section (3-column grid):
- Post Scheduler: "Plan and schedule posts across Instagram, Facebook, TikTok, and LinkedIn"
- Lead Analytics: "Track which posts generate the most leads and optimize your content"  
- Auto Follow-Up: "SMS and email sequences fire when someone engages with your posts"`,
          },
          {
            label: "Pricing section with Stripe",
            tool: "claude-code",
            prompt: `Add a pricing section to the Socialhub marketing page with two tiers:

Starter ($49/mo): 3 social accounts, 30 scheduled posts/mo, basic analytics, email support
Pro ($99/mo): Unlimited accounts, unlimited posts, advanced analytics, SMS automation, priority support, AI caption generator

Each tier has a Stripe Checkout button. The Pro tier should have a "Most Popular" badge. Use the existing Stripe integration in the LaunchKit codebase. Both plans should use monthly subscriptions.`,
          },
        ],
      },
      {
        number: 4,
        title: "Post Scheduler Dashboard",
        description:
          "Build the core product — the authenticated dashboard where users schedule posts, view their calendar, and manage accounts.",
        prompts: [
          {
            label: "Dashboard layout + post scheduler",
            tool: "claude-code",
            prompt: `Build the authenticated Socialhub dashboard at apps/web/app/dashboard/page.tsx:

Sidebar nav: Dashboard, Content, Inbox, Analytics, Leads, Agents, Settings

Main area: Post Scheduler
- Month calendar view showing scheduled posts
- "New Post" button opens a slide-out panel with: platform selector (IG/FB/TikTok/LI), caption textarea with character count, image upload, date/time picker, "Schedule" button
- Below calendar: "Recent Posts" table with post preview, platform icon, scheduled time, status (scheduled/published/failed), engagement stats

Database schema: posts table (id, userId, content, imageUrl, platforms[], scheduledAt, publishedAt, status, engagementData jsonb)`,
          },
          {
            label: "Analytics dashboard tab",
            tool: "claude-code",
            prompt: `Build the Analytics tab for Socialhub at apps/web/app/dashboard/analytics/page.tsx:

Metric cards at top: Total Followers (+8.3%), Engagement Rate (5.4%, +1.1%), Leads Generated (243, +23%), Post Reach (89.2K, +15.6%)

Charts (use recharts or chart.js):
- Line chart: Engagement over last 30 days
- Bar chart: Leads by platform (IG, FB, TikTok, LI)
- Top performing posts table: thumbnail, caption snippet, platform, reach, engagement %`,
          },
        ],
      },
      {
        number: 5,
        title: "Lead Capture + SMS Automation",
        description:
          "Connect lead capture to the post scheduler so every post can drive leads, with automatic SMS and email follow-up.",
        prompts: [
          {
            label: "Lead capture form embed",
            tool: "claude-code",
            prompt: `Build a lead capture form component that Socialhub users can embed on their own sites or use as a landing page. 

The form collects: Name, Email, Phone, "How did you find me?" (dropdown: Instagram / Facebook / TikTok / LinkedIn / Other)

On submit:
1. Save lead to database (linked to the agent's userId)
2. Send immediate SMS via Twilio placeholder: "Hi [name], thanks for reaching out! I'll be in touch shortly. - [Agent Name]"
3. Send welcome email via Resend
4. Show lead in the agent's Leads dashboard tab

Create the embed route at /l/[agentSlug] so each agent has their own lead page.`,
          },
          {
            label: "SMS drip sequence",
            tool: "claude-code",
            prompt: `Create a 3-step SMS follow-up sequence for Socialhub that fires after a lead submits the capture form:

Message 1 (immediately): "Hey [name]! It's [agent] — thanks for connecting. I help real estate agents grow their social presence. Are you currently looking to buy or sell?"

Message 2 (day 2): "Hi [name], just following up! I have some new listings I think you'd love. Want me to send you a few options? Just reply YES."

Message 3 (day 5): "Hi [name] — last check-in from me. If you're ready to chat, here's my calendar link: [link]. No pressure at all!"

Use a scheduled job (cron) to fire messages at the right times. Store sequence state in the leads table.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Deploy to Vercel and go live. Your social media SaaS is ready to take its first subscribers.",
        prompts: [
          {
            label: "Deploy to production",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: Socialhub social media management SaaS — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Post-launch checklist",
            tool: "perplexity",
            prompt: `What's a production launch checklist for a Next.js SaaS with Clerk auth, Stripe subscriptions, and Neon Postgres? Include: environment variable verification, Stripe webhook setup, Clerk webhook setup, database migration confirmation, and first-purchase test steps.`,
          },
        ],
      },
    ],
  },

  // ─── HAVENO SOCIAL ───────────────────────────────────────────────────────
  {
    slug: "haveno-social",
    name: "Haveno Social",
    tagline: "Full social media management dashboard for real estate agents — posts, agents, and leads in one place.",
    image: "/templates/haveno-social.jpg",
    categories: ["Social Media", "Agents", "Dashboard"],
    overview:
      "Haveno Social is an internal dashboard product — a more complete, multi-agent version of Socialhub. It's built for real estate teams that want to manage multiple agents, all posting from one place. Clone LaunchKit Pro, wire up the multi-tenant Clerk setup, and you have a team-ready social command center.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Set up LaunchKit Pro with multi-tenant Clerk Organizations enabled so each real estate team gets their own workspace.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git haveno-social
cd haveno-social
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Enable Clerk Organizations",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for Haveno Social — a multi-agent real estate social dashboard.

- Enable Clerk Organizations in the Clerk dashboard (allows multiple agents per team)
- Update middleware.ts to protect all /dashboard routes
- Primary color: purple-to-indigo gradient (#7C3AED → #4F46E5)  
- App name: "Haveno Social"
- Update metadata and any config constants
- The signup flow should create a new Clerk Organization for each new team`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Create the dashboard UI graphics, agent avatars, and marketing visuals with higgfields.ai.",
        prompts: [
          {
            label: "Dashboard hero screenshot",
            tool: "higgfields",
            prompt: `Modern real estate social media dashboard UI, dark sidebar with navigation icons, main content area showing social media analytics charts and scheduled posts calendar, purple accent colors, clean professional SaaS design, browser window mockup, 16:9`,
          },
          {
            label: "Agent profile avatar set",
            tool: "higgfields",
            prompt: `Four professional headshot avatars for real estate agents, diverse team (two women, two men), business casual attire, consistent soft background color, circular crop format, clean and professional, suitable for UI profile pictures, arranged in 2x2 grid`,
          },
          {
            label: "SMS feature callout graphic",
            tool: "higgfields",
            prompt: `Clean UI mockup showing SMS drip campaign interface — conversation bubbles on the left, automation flow on the right with arrows connecting "Welcome" to "Follow Up" to "Close" nodes, purple accent color, white card design, minimal flat illustration style, 4:3 ratio`,
          },
        ],
      },
      {
        number: 3,
        title: "Dashboard Layout & Navigation",
        description:
          "Build the core dashboard shell — sidebar, header, and page layout that all dashboard sections live inside.",
        prompts: [
          {
            label: "Dashboard shell with sidebar",
            tool: "claude-code",
            prompt: `Build the Haveno Social dashboard layout at apps/web/app/dashboard/layout.tsx:

Left sidebar (fixed, 240px wide):
- Logo at top: "Haveno Social" with small house icon
- Navigation items with icons: Dashboard, Content, Inbox (with unread count badge), Analytics, Leads, Agents, Settings
- Current user avatar + name + role at the bottom
- Collapse to icon-only on mobile

Top header bar:
- Page title (dynamic)
- "New Post" button
- Notification bell
- Org switcher (uses Clerk Organizations)

Use shadcn/ui Sheet for mobile sidebar drawer. Match the existing dark theme.`,
          },
          {
            label: "Dashboard overview page",
            tool: "claude-code",
            prompt: `Build the dashboard home at apps/web/app/dashboard/page.tsx with an overview of the team's social performance:

Metric cards (4 in a row): Total Followers (24.6K, +18%), Engagement Rate (6.3%, +2.1%), Leads Generated (182, +29%), Post Reach (56.8K, +12%)

Below metrics:
- Recent Posts table: thumbnail, caption preview, platforms, scheduled/posted time, reach, engagement
- Recent Leads list: name, source platform, time, status badge (New / Contacted / Converted)
- Your Agents mini-list: avatar, name, role, post count this week

All data server-fetched from Neon. Show loading skeletons while fetching.`,
          },
        ],
      },
      {
        number: 4,
        title: "Agent Management System",
        description:
          "Build the Agents tab where team leads can invite agents, assign roles, and see individual performance.",
        prompts: [
          {
            label: "Agents management page",
            tool: "claude-code",
            prompt: `Build the Agents tab at apps/web/app/dashboard/agents/page.tsx:

- "Invite Agent" button at top right — opens a modal with email input + role selector (Admin / Agent / Viewer)
- Sends Clerk Organization invitation via the Clerk API
- Agents table: avatar, name, email, role badge, posts this week, leads this week, joined date, actions (Edit Role, Remove)
- Each agent row is clickable → opens agent detail slide-over showing their recent posts and lead stats

Use Clerk's Organization Members API to fetch and manage team members. Mirror membership data to the Neon database for analytics.`,
          },
        ],
      },
      {
        number: 5,
        title: "Email + SMS Sequences",
        description:
          "Build the automated follow-up system — email sequences and SMS campaigns triggered by lead activity.",
        prompts: [
          {
            label: "Email sequence builder",
            tool: "claude-code",
            prompt: `Create an email sequence builder at apps/web/app/dashboard/sequences/page.tsx:

List view of saved sequences with: name, trigger (Lead Captured / Post Engagement / Manual), email count, active/paused toggle, last triggered date

"New Sequence" button opens a builder UI:
- Sequence name input
- Trigger dropdown
- Add Email buttons: each email step shows delay (immediately / 1 day / 3 days / 7 days), subject, preview text, and edit button
- Drag to reorder steps

Save sequences to the database. When a trigger fires (e.g., new lead), execute the sequence via the existing Resend email setup.`,
          },
          {
            label: "SMS campaign system",
            tool: "claude-code",
            prompt: `Create an SMS follow-up system for Haveno Social:

Database table: sms_sequences (id, name, steps jsonb, trigger, active)
Each step: { delay_days: number, message: string }

Pre-built sequence for new leads:
- Day 0: "Hi [name]! It's [agent] with Haveno. Thanks for connecting — I'll follow up shortly!"
- Day 2: "Hey [name] — quick check in. Are you looking to buy, sell, or just exploring?"
- Day 5: "Hi [name], last message from me. Here's my calendar if you'd like to chat: [link]"

Build a simple SMS sequences page in the dashboard showing active sequences and a log of sent messages. Use a Twilio API placeholder with environment variable TWILIO_ACCOUNT_SID.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Deploy Haveno Social to Vercel. Set up your Clerk Organization webhook and Stripe billing.",
        prompts: [
          {
            label: "Deploy to production",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: Haveno Social dashboard — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Clerk Organizations setup",
            tool: "perplexity",
            prompt: `How do I enable and configure Clerk Organizations for a Next.js SaaS app? I need: organization creation on signup, member invitation emails, role-based access (Admin vs Member), and an org switcher in the dashboard header. List the exact Clerk dashboard settings and code changes needed.`,
          },
        ],
      },
    ],
  },

  // ─── AGENIX ──────────────────────────────────────────────────────────────
  {
    slug: "agenix",
    name: "Agenix",
    tagline: "AI automation agency website — showcase your agents, close more clients, follow up automatically.",
    image: "/templates/agenix.jpg",
    categories: ["AI Agency", "Automation", "SaaS"],
    overview:
      "Agenix is a dark, high-converting marketing site built for AI automation agencies. It showcases your AI agents and services, captures leads via a contact form, and fires off SMS + email follow-up automatically. Clone LaunchKit, drop in your real services and agent descriptions, and go live.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Set up LaunchKit with a dark AI-agency aesthetic — deep navy background, purple accents, and tech-forward metadata.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git agenix
cd agenix
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Dark agency brand setup",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for an AI automation agency called Agenix.

- Background: deep navy (#0A0A1A), not pure black
- Primary accent: electric purple (#7C3AED)
- Secondary accent: bright cyan (#06B6D4) for highlights
- Tagline: "Smarter Systems. AI-Powered Growth. Real Results."
- Description: "We build custom AI agents and automation systems that save time, scale operations, and drive measurable business growth."
- Update apps/web/app/layout.tsx metadata
- Set globals.css --background to #0A0A1A and --primary to #7C3AED`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Generate the hero visual, AI robot mascot, and background graphics with higgfields.ai. The dark theme calls for dramatic, high-contrast images.",
        prompts: [
          {
            label: "Hero AI robot / agent visual",
            tool: "higgfields",
            prompt: `Futuristic AI robot brain interface, glowing neural network connections, deep navy and purple color scheme, holographic blue energy particles, dramatic cinematic lighting, photorealistic 3D render, no text, suitable as a dark website hero background, 16:9 ratio`,
          },
          {
            label: "AI agents showcase grid",
            tool: "higgfields",
            prompt: `Four floating UI card mockups showing different AI agent types: "Lead Qualifier", "Follow-Up Agent", "AI Chat Agent", "Data Enrichment" — each card has an icon, name, and status indicator, dark card design with purple glow, arranged in a 2x2 grid with subtle connecting lines, tech aesthetic, 4:3 ratio`,
          },
          {
            label: "New inquiry notification",
            tool: "higgfields",
            prompt: `Minimal UI notification mockup showing "New Inquiry — AI Consultation via Website — Now" with a purple lightning bolt icon, dark card with subtle glow, green online status dot, clean modern design, transparent background`,
          },
        ],
      },
      {
        number: 3,
        title: "Hero + Services Section",
        description:
          "Build the homepage hero with your agency headline, stats, and a services section showcasing what you offer.",
        prompts: [
          {
            label: "Hero with animated stats",
            tool: "claude-code",
            prompt: `Build the Agenix homepage hero in apps/web/app/page.tsx:

Full-width dark section with particle/gradient background effect:
- Headline: "Smarter Systems." on line 1, "AI-Powered Growth." in purple on line 2, "Real Results." on line 3
- Subtext: "We build custom AI agents and automation systems that save time, scale operations, and drive measurable business growth."
- CTAs: "Book a Strategy Call" (purple gradient button) and "Explore Agents" (ghost)
- Stats row: 250+ Automations Built, 98% Client Satisfaction, $24M+ Revenue Generated, 50+ Industries Served

Add a floating notification card: "New Inquiry — AI Consultation via Website — Now" with a green live indicator. Animate it pulsing subtly.`,
          },
          {
            label: "Services section",
            tool: "claude-code",
            prompt: `Add a Services section to the Agenix homepage with a 3-column grid of service cards:

1. AI Lead Generation: "Automated systems that find, qualify, and follow up with prospects 24/7 so your team focuses on closing."
2. Workflow Automation: "Eliminate manual tasks across your CRM, email, and ops stack with intelligent automation workflows."
3. Custom AI Agents: "Purpose-built AI agents trained on your business data to handle customer queries, bookings, and support."
4. Data Enrichment: "Automatically enrich your leads with company data, tech stack, and buying signals from 50+ sources."
5. SMS + Email Outreach: "Multi-channel outreach sequences with AI-personalized copy that adapts to each prospect."
6. Analytics & Reporting: "Real-time dashboards showing exactly how your automations are performing and what to optimize."

Dark cards with purple icon accents, hover with subtle glow border effect.`,
          },
        ],
      },
      {
        number: 4,
        title: "AI Agents Showcase",
        description:
          "Build the /agents page that showcases each AI agent your agency has built — the visual centrepiece of the site.",
        prompts: [
          {
            label: "AI agents showcase page",
            tool: "claude-code",
            prompt: `Create apps/web/app/agents/page.tsx — a page showcasing the agency's AI agents:

Hero: "Meet Your AI Team" — "Custom-built agents working 24/7 to grow your business."

Agent cards grid (2 cols desktop, 1 mobile). Each card:
- Animated icon or illustration
- Agent name (e.g., "LeadBot", "FollowUp Pro", "DataEnrich")
- One-line description
- Capability chips (e.g., "Qualifies Leads", "Sends SMS", "CRM Sync")
- "Learn More" button

At bottom: "Want an agent like this?" lead capture form — Name, Email, Company, "Describe your automation need" textarea. POST to /api/leads.

Dark theme, purple glows on hover, matches the main brand.`,
          },
        ],
      },
      {
        number: 5,
        title: "Lead Capture + SMS Follow-Up",
        description:
          "Wire up the contact form to fire an immediate SMS and a 4-email sequence positioning your agency as the expert.",
        prompts: [
          {
            label: "Lead form with instant SMS",
            tool: "claude-code",
            prompt: `Build the Agenix lead capture system:

Contact form fields: Name, Email, Phone, Company, "What's your biggest operational bottleneck?" (textarea)

On submit at /api/leads:
1. Save to 'leads' table with source: 'agency_site'
2. Immediately send SMS via Twilio (use TWILIO_ACCOUNT_SID env var): "Hi [name]! This is the Agenix team — we got your message and we're reviewing your bottleneck now. Expect a call within 24 hours."
3. Send confirmation email via Resend
4. Notify internal team via email: "New agency lead: [name] from [company]"`,
          },
          {
            label: "4-email nurture sequence",
            tool: "claude-code",
            prompt: `Create a 4-email AI agency nurture sequence in packages/email/src/templates/:

Email 1 (immediate): "Your automation audit starts now"
- Welcome + what to expect
- Link to a free "Automation ROI Calculator" (placeholder /tools/roi-calculator)

Email 2 (day 2): "How [Company] could save 40 hours/week"
- Generic case study style
- 3 quick automation wins (lead routing, follow-up, data entry)
- CTA: "Book a 30-min strategy call"

Email 3 (day 5): "The AI agents doing the work right now"
- Showcase 2-3 specific agents with mini descriptions
- Social proof: "clients generated $24M+ in revenue"
- CTA: "See the full agent library"

Email 4 (day 10): "Last thing — a free audit for you"
- Offer a free 30-min automation audit
- Calendly link placeholder
- Unsubscribe link

Dark-themed emails matching the #0A0A1A + purple brand.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Deploy Agenix to Vercel. Your AI agency site is ready to start converting visitors.",
        prompts: [
          {
            label: "Deploy to production",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: Agenix AI agency template — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Performance check",
            tool: "perplexity",
            prompt: `What are the most important Next.js 14 performance optimizations for a dark marketing site? Include: image optimization with next/image, font loading, animation performance, Core Web Vitals tips, and Vercel Edge Config usage for feature flags.`,
          },
        ],
      },
    ],
  },

  // ─── LEXORA ──────────────────────────────────────────────────────────────
  {
    slug: "lexora",
    name: "Lexora",
    tagline: "Professional law firm website with consultation booking, SMS follow-up, and lead capture.",
    image: "/templates/lexora.jpg",
    categories: ["Law Firm", "Legal Services", "Professional"],
    overview:
      "Lexora is a trust-first website built for law firms and solo attorneys. It presents practice areas and attorney profiles with a premium feel, captures consultation requests, and follows up automatically via SMS and email. Clone LaunchKit, customize the practice areas, and go live with a site that books consultations on autopilot.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Set up LaunchKit with Lexora's warm, authoritative brand — gold accents, clean serif aesthetic, and trust-forward metadata.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git lexora
cd lexora
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Law firm brand configuration",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for a law firm website called Lexora.

- Primary color: rich gold/brown (#8B6914)
- Accent: deep navy (#1A2744)
- Background: warm off-white (#FAFAF8) for light sections
- Font feel: professional, serif-adjacent (use system fonts with fallback to Georgia)
- Tagline: "Trusted Legal Representation. Proven Results."
- Description: "Dedicated to protecting your rights and delivering strategic legal solutions that make a difference."
- Update layout.tsx metadata
- Set a professional, trust-building tone in all copy`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Generate the hero image, attorney headshot, and courtroom photography with higgfields.ai. Lexora's aesthetic is premium and trust-building.",
        prompts: [
          {
            label: "Courthouse / law office hero",
            tool: "higgfields",
            prompt: `Grand law library interior with floor-to-ceiling mahogany bookshelves filled with legal volumes, warm golden light through tall windows, elegant dark wood desk in foreground, prestigious and authoritative atmosphere, photorealistic architectural photography, no people, 16:9`,
          },
          {
            label: "Attorney professional headshot",
            tool: "higgfields",
            prompt: `Senior attorney professional headshot, dark navy suit, confident authoritative expression, warm smile, professional office bookshelf background slightly blurred, high quality studio lighting, trustworthy and experienced appearance, 1:1 square`,
          },
          {
            label: "Case Won notification card",
            tool: "higgfields",
            prompt: `Clean UI notification card mockup: "Case Won — Personal Injury Settlement — $1,250,000" with a gold scales of justice icon, white card with subtle shadow, dark navy text, gold accent line, professional and celebratory tone, transparent background`,
          },
        ],
      },
      {
        number: 3,
        title: "Practice Areas + Attorney Profiles",
        description:
          "Build the core content pages — practice areas grid and attorney bios that establish expertise and trust.",
        prompts: [
          {
            label: "Homepage hero + stats",
            tool: "claude-code",
            prompt: `Build the Lexora homepage in apps/web/app/page.tsx:

Hero section (full-width background image):
- Headline: "Trusted Legal Representation." on line 1, "Proven Results." in gold on line 2
- Subtext: "Dedicated to protecting your rights and delivering strategic legal solutions that make a difference."
- CTAs: "Our Practice Areas" (gold button) and "Schedule a Consultation" (outline)

Stats row below hero:
- $250M+ — Recovered for Clients
- 20+ — Years of Experience
- 98% — Client Satisfaction
- 10K+ — Cases Resolved

Floating badge: "Case Won — Personal Injury Settlement — $1,250,000" sliding in from right.`,
          },
          {
            label: "Practice areas grid",
            tool: "claude-code",
            prompt: `Add a Practice Areas section to the Lexora homepage and create /practice-areas/[slug] pages:

Practice areas (6 cards in a 3-col grid):
- Personal Injury: "Car accidents, slip and fall, medical malpractice — we fight for maximum compensation."
- Criminal Defense: "DUI, assault, drug charges — aggressive defense protecting your rights and freedom."
- Family Law: "Divorce, custody, adoption — compassionate guidance through life's hardest moments."
- Business Law: "Contracts, disputes, formation — strategic counsel for businesses of every size."
- Estate Planning: "Wills, trusts, probate — protect your family and legacy for generations."
- Real Estate Law: "Transactions, disputes, closings — expert guidance on every property matter."

Each card: icon, area name, description, "Learn More" link. Hover reveals gold border.`,
          },
        ],
      },
      {
        number: 4,
        title: "Consultation Booking Form",
        description:
          "Build the primary lead capture — a consultation request form that books initial calls and stores leads in the database.",
        prompts: [
          {
            label: "Consultation request form",
            tool: "claude-code",
            prompt: `Build a consultation request form for Lexora — both as a section on the homepage and at /consultation:

Form fields:
- Full Name (required)
- Email (required)
- Phone (required)
- Practice Area dropdown (Personal Injury / Criminal Defense / Family Law / Business Law / Estate Planning / Real Estate / Other)
- "Brief description of your situation" textarea (required)
- Preferred contact method: Email / Phone / Either

On submit → POST to /api/consultation:
1. Save to 'consultations' table in Neon
2. Send immediate confirmation email to the prospect
3. Send internal alert email to the firm: "New consultation request from [name] — [practice area]"
4. Show confirmation message: "Thank you. A member of our team will contact you within 24 hours."`,
          },
        ],
      },
      {
        number: 5,
        title: "SMS + Email Follow-Up",
        description:
          "Automate the follow-up so no consultation request falls through the cracks — SMS within minutes, emails over the first week.",
        prompts: [
          {
            label: "Instant SMS follow-up",
            tool: "claude-code",
            prompt: `Add instant SMS follow-up to the Lexora consultation form submission:

Immediately after form submission, send SMS via Twilio:
"Hi [name], this is Lexora Law. We received your consultation request and a member of our team will reach out within 24 hours. For urgent matters, call us directly at [phone placeholder]."

If no response to the initial email within 48 hours, send a follow-up SMS:
"Hi [name], just following up on your Lexora consultation request. Would you like to schedule a free 15-minute call? Reply YES and we'll send you a link."

Store SMS status in the consultations table.`,
          },
          {
            label: "3-email consultation sequence",
            tool: "claude-code",
            prompt: `Create three email templates in packages/email/src/templates/ for Lexora consultation leads:

Email 1 (immediate): Subject: "Your consultation request — we're on it"
- Confirm receipt, set expectation of 24-hour response
- Brief intro to the firm's track record
- What to prepare for the consultation

Email 2 (24 hours if no call booked): Subject: "Ready when you are — book your free consultation"
- Gentle follow-up
- Calendar booking link (Calendly placeholder)
- 2-3 brief case result highlights relevant to their practice area

Email 3 (day 5 if still no response): Subject: "One last follow-up from Lexora"
- Low-pressure final touch
- Emphasize free, no-obligation consultation
- Direct phone number

Gold-accented email design matching the Lexora brand.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Deploy Lexora to Vercel. Your law firm site is ready to book consultations.",
        prompts: [
          {
            label: "Deploy to production",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: Lexora law firm template — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Local SEO for law firms",
            tool: "perplexity",
            prompt: `What are the most important local SEO optimizations for a law firm website in Next.js? Include: structured data (LocalBusiness schema), meta tags for practice areas, Google Business Profile setup, page speed requirements, and attorney schema markup.`,
          },
        ],
      },
    ],
  },

  // ─── PT PRO ──────────────────────────────────────────────────────────────
  {
    slug: "pt-pro",
    name: "PT Pro",
    tagline: "High-converting personal trainer website with programs, booking, and email follow-up.",
    image: "/templates/pt-pro.jpg",
    categories: ["Personal Training", "Fitness", "Coaching"],
    overview:
      "PT Pro is a clean, energetic website for personal trainers who want to attract clients online without a complex tech setup. It showcases your programs and results, captures leads from session booking requests, and fires off a welcome email sequence automatically. Clone LaunchKit, drop in your programs and testimonials, and you're live.",
    milestones: [
      {
        number: 1,
        title: "Clone & Configure LaunchKit",
        description:
          "Set up LaunchKit with PT Pro's athletic brand — deep navy, clean whites, and energetic typography.",
        prompts: [
          {
            label: "Clone and install",
            tool: "terminal",
            prompt: `git clone https://github.com/CalebKing3/launchkit.git pt-pro
cd pt-pro
npm install
cp apps/web/.env.example apps/web/.env.local`,
          },
          {
            label: "Fitness brand configuration",
            tool: "claude-code",
            prompt: `Configure this LaunchKit project for a personal trainer website called PT Pro.

- Primary color: deep navy (#1E3A5F)
- Accent: clean white with yellow star ratings
- Tagline: "Stronger You. Better Results. Real Confidence."
- Description: "Personal training programs designed to help you build strength, improve health, and become the best version of yourself."
- Target keywords: personal trainer, fitness coaching, workout programs
- Update apps/web/app/layout.tsx metadata
- Tone: motivational, results-focused, approachable`,
          },
        ],
      },
      {
        number: 2,
        title: "Generate Brand Assets",
        description:
          "Generate the hero gym photo, trainer headshot, and transformation/results visuals with higgfields.ai.",
        prompts: [
          {
            label: "Hero gym training photo",
            tool: "higgfields",
            prompt: `Personal trainer coaching a client in a modern gym, woman performing barbell squat with trainer spotting, bright clean gym environment with natural light, motivational and energetic atmosphere, professional fitness photography style, no text, 16:9 ratio`,
          },
          {
            label: "Trainer professional headshot",
            tool: "higgfields",
            prompt: `Personal trainer professional photo, athletic build, navy polo shirt, warm confident smile, clean gym background slightly blurred, natural lighting, approachable and motivating expression, high quality portrait, 1:1 ratio`,
          },
          {
            label: "Client testimonial card",
            tool: "higgfields",
            prompt: `Clean UI testimonial card mockup: female client "Emily R." with 5 gold stars, quote "Lost 25 lbs and gained confidence!", small circular avatar photo, white card with subtle shadow, navy accent, clean modern design, transparent background, 3:2 ratio`,
          },
        ],
      },
      {
        number: 3,
        title: "Hero + Programs Section",
        description:
          "Build the homepage hero with your headline and CTA, then the programs/offerings grid that showcases what you offer.",
        prompts: [
          {
            label: "Hero with social proof stats",
            tool: "claude-code",
            prompt: `Build the PT Pro homepage hero in apps/web/app/page.tsx:

Full-width hero with background image (use /images/hero.jpg) and dark overlay:
- Headline: "Stronger You." line 1, "Better Results." line 2, "Real Confidence." line 3
- Subtext: "Personal training programs designed to help you build strength, improve health, and become the best version of yourself."
- CTAs: "Book a Free Consultation" (primary navy button) and "View Programs" (outline)

Stats row below hero:
- 10+ — Years Experience
- 500+ — Clients Trained
- 95% — Success Rate  
- 1000+ — Sessions Completed

Floating testimonial badge: "Emily R. — ⭐⭐⭐⭐⭐ — Lost 25 lbs and gained confidence!" Slide in from bottom-right after 1.5s.`,
          },
          {
            label: "Programs / pricing section",
            tool: "claude-code",
            prompt: `Add a Programs section to the PT Pro homepage — a 3-card pricing grid:

Starter ($149/mo):
- 2x/week sessions
- Custom workout plan
- Nutrition guidelines
- Email support

Transform ($249/mo) — "Most Popular":
- 4x/week sessions
- Custom workout + meal plan
- Weekly check-ins
- SMS + WhatsApp support
- Progress tracking app

Elite ($399/mo):
- Daily sessions
- Full nutrition coaching
- Daily accountability check-ins
- Body composition analysis monthly
- Priority scheduling

Each card has a "Book This Program" button that opens the consultation form. The "Most Popular" card has a highlighted border.`,
          },
        ],
      },
      {
        number: 4,
        title: "Testimonials + Results",
        description:
          "Build the social proof section — before/after results, video testimonials, and 5-star reviews that convert visitors into clients.",
        prompts: [
          {
            label: "Testimonials section",
            tool: "claude-code",
            prompt: `Add a Testimonials section to the PT Pro homepage — a 3-column grid of review cards:

Card structure:
- 5-star rating (gold stars)
- Quote text (2-3 sentences of results)
- Client name + avatar + "Member since [year]"
- Program tag (e.g., "Transform Program")

Sample testimonials to use:
1. "I lost 30 lbs in 4 months and feel better than I did at 25. The personalized plan made all the difference." — Marcus T., Transform Program
2. "As a busy mom of 3, I thought I'd never have time to get fit. PT Pro proved me wrong — 15 lbs down in 3 months." — Sarah K., Starter Program
3. "The Elite program is worth every penny. Daily check-ins kept me accountable and I hit my goal weight for the first time in 5 years." — James R., Elite Program

Add a "Read 200+ Reviews" link below the cards (placeholder).`,
          },
        ],
      },
      {
        number: 5,
        title: "Session Booking + Email Welcome",
        description:
          "Build the free consultation booking form and wire up an email sequence that converts leads into paying clients.",
        prompts: [
          {
            label: "Consultation booking form",
            tool: "claude-code",
            prompt: `Build a free consultation booking form for PT Pro — as a homepage section and at /book:

Form fields:
- Full Name
- Email
- Phone
- "What's your main fitness goal?" (dropdown: Lose Weight / Build Muscle / Improve Endurance / General Fitness / Sport-Specific Training)
- "How many days per week can you train?" (1-2 / 3-4 / 5+ days)
- "Any injuries or limitations?" (textarea, optional)

On submit → POST to /api/book:
1. Save to 'leads' table
2. Send immediate confirmation email via Resend
3. Send internal notification: "New PT Pro booking request from [name]"
4. Redirect to /book/confirmed with "We'll be in touch within 24 hours" message`,
          },
          {
            label: "3-email welcome sequence",
            tool: "claude-code",
            prompt: `Create three React Email templates in packages/email/src/templates/ for PT Pro leads:

Email 1 (immediate): Subject: "Your free consultation is confirmed ✓"
- Warm welcome, confirm they'll hear back within 24 hours
- What to expect at the consultation (15-min call, discuss goals, create plan)
- Link to a "Before Your Consultation" prep guide (placeholder)

Email 2 (day 1 if no call booked): Subject: "Let's pick a time that works for you"
- 3 suggested time slots (placeholder links)
- Calendly booking link placeholder
- Short success story snippet: "Last month, Sarah lost 15 lbs after just 3 months..."

Email 3 (day 3): Subject: "A quick question about your goal"
- Ask their #1 fitness concern
- Reply-to the trainer's email to encourage conversation
- Low-pressure: "No commitment — just a conversation"

Use the PT Pro navy brand color (#1E3A5F) with gold accents for star ratings.`,
          },
        ],
      },
      {
        number: 6,
        title: "Deploy & Go Live",
        description:
          "Deploy PT Pro to Vercel. Your personal trainer website is ready to book its first clients.",
        prompts: [
          {
            label: "Deploy to production",
            tool: "terminal",
            prompt: `git add -A
git commit -m "feat: PT Pro personal trainer template — complete"
git push origin main
npx vercel deploy --prod`,
          },
          {
            label: "Instagram + Google traffic setup",
            tool: "perplexity",
            prompt: `What's the fastest way to drive Instagram and Google traffic to a new personal trainer website? Include: Instagram bio link strategy, Google Business Profile for local trainers, blog post ideas for SEO, and what to put in the first 3 Instagram posts to promote the new site.`,
          },
        ],
      },
    ],
  },
];

export function getTemplateGuide(slug: string): TemplateGuide | undefined {
  return TEMPLATE_GUIDES.find((g) => g.slug === slug);
}
