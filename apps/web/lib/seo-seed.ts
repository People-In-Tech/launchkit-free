export const seedTemplates = [
  {
    name: "Tools for Industry",
    slugPattern: "tools-for-{industry}",
    titleTemplate: "Best {industry} Tools in {year}",
    descriptionTemplate:
      "Discover the top tools for {industry} professionals. Compare features, pricing, and integrations to find the best solution for your {industry} business in {year}.",
    bodyTemplate: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold mb-4">Why {industry} Teams Need Better Tools</h2>
    <p class="text-muted-foreground leading-relaxed">
      The {industry} landscape is evolving rapidly. Teams need modern, integrated tools that streamline workflows,
      reduce manual processes, and help them focus on what matters most — delivering value to their customers.
    </p>
  </section>

  <section>
    <h2 class="text-2xl font-bold mb-4">Key Features to Look For</h2>
    <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
      <li>Seamless integration with your existing {industry} workflow</li>
      <li>Real-time collaboration and team management</li>
      <li>Advanced analytics and reporting dashboards</li>
      <li>Enterprise-grade security and compliance</li>
      <li>Flexible API for custom integrations</li>
    </ul>
  </section>

  <section>
    <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
    <p class="text-muted-foreground leading-relaxed">
      LaunchKit provides everything you need to build a powerful {industry} SaaS platform.
      Start with our boilerplate and customize it for your specific {industry} use case.
    </p>
  </section>
</div>`,
    variables: ["industry", "year"],
  },
  {
    name: "Feature Alternative",
    slugPattern: "{feature}-alternative",
    titleTemplate: "Best {feature} Alternative in {year}",
    descriptionTemplate:
      "Looking for a {feature} alternative? Compare top alternatives with features, pricing, and user reviews. Find the perfect replacement for {feature} in {year}.",
    bodyTemplate: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold mb-4">Why Look for a {feature} Alternative?</h2>
    <p class="text-muted-foreground leading-relaxed">
      While {feature} is a popular choice, many teams are looking for alternatives that better fit their needs.
      Whether it's pricing, features, or flexibility, there are compelling options available in {year}.
    </p>
  </section>

  <section>
    <h2 class="text-2xl font-bold mb-4">What to Consider When Switching</h2>
    <ul class="list-disc pl-6 space-y-2 text-muted-foreground">
      <li>Migration path and data portability</li>
      <li>Feature parity with {feature}</li>
      <li>Pricing comparison and total cost of ownership</li>
      <li>Community support and documentation</li>
      <li>Long-term roadmap and company stability</li>
    </ul>
  </section>

  <section>
    <h2 class="text-2xl font-bold mb-4">Build Your Own with LaunchKit</h2>
    <p class="text-muted-foreground leading-relaxed">
      Instead of depending on third-party tools, build your own solution with LaunchKit.
      Our Next.js boilerplate gives you complete control over your {feature} replacement.
    </p>
  </section>
</div>`,
    variables: ["feature", "year"],
  },
];

export const seedPages = [
  // Tools for Industry pages
  {
    templateIndex: 0,
    variables: { industry: "fintech", year: "2025" },
    published: true,
  },
  {
    templateIndex: 0,
    variables: { industry: "healthcare", year: "2025" },
    published: true,
  },
  {
    templateIndex: 0,
    variables: { industry: "e-commerce", year: "2025" },
    published: true,
  },
  {
    templateIndex: 0,
    variables: { industry: "edtech", year: "2025" },
    published: false,
  },
  {
    templateIndex: 0,
    variables: { industry: "real-estate", year: "2025" },
    published: true,
  },
  {
    templateIndex: 0,
    variables: { industry: "logistics", year: "2025" },
    published: false,
  },
  // Feature Alternative pages
  {
    templateIndex: 1,
    variables: { feature: "Stripe", year: "2025" },
    published: true,
  },
  {
    templateIndex: 1,
    variables: { feature: "Auth0", year: "2025" },
    published: true,
  },
  {
    templateIndex: 1,
    variables: { feature: "Firebase", year: "2025" },
    published: true,
  },
  {
    templateIndex: 1,
    variables: { feature: "Supabase", year: "2025" },
    published: false,
  },
  {
    templateIndex: 1,
    variables: { feature: "Vercel", year: "2025" },
    published: true,
  },
];
