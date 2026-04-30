import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface LeadNurtureDay2Props {
  discountCode?: string;
}

export function LeadNurtureDay2({ discountCode = "LAUNCH10" }: LeadNurtureDay2Props) {
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/pricing?coupon=${discountCode}`;

  return (
    <Html>
      <Head />
      <Preview>What could you ship by this Sunday?</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px", color: "#111827" }}>
            What could you ship by this Sunday?
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Let me walk through a real scenario.
          </Text>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Say you want to build an AI writing assistant. You need:
            user auth, a subscription plan, an AI chat interface, and an
            admin panel to monitor usage. Normally that's 2–4 weeks of setup.
          </Text>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            With LaunchKit, here's what Day 1 actually looks like:
          </Text>

          {[
            "Run one command → 248 files scaffolded, Neon DB wired, Clerk auth live",
            "Stripe checkout with Apple Pay + Google Pay — out of the box",
            "AI streaming chat with GPT-4o, Claude 3.5, or Gemini — one config line",
            "Admin dashboard with usage metrics, feature flags, user management",
            "CLAUDE.md + .cursorrules pre-written so your AI agent knows the codebase",
          ].map((item, i) => (
            <Text key={i} style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151", marginBottom: "4px" }}>
              {`${i + 1}. ${item}`}
            </Text>
          ))}

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151", marginTop: "16px" }}>
            That's a production-ready SaaS foundation before lunch on Day 1.
            The rest of Day 1 and all of Day 2 you're writing your actual product.
          </Text>

          <Section style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginTop: "24px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              Your discount code is still active
            </Text>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: "0 0 4px" }}>
              {discountCode}
            </Text>
            <Text style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>
              10% off — $149 → $134. One-time, lifetime updates.
            </Text>
          </Section>

          <Section style={{ marginBottom: "28px" }}>
            <Button
              href={pricingUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Get LaunchKit — use {discountCode}
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
            All sales are final. Once you gain access to the repository, we do not offer refunds.
            <br /><br />
            — Caleb King, People In Tech LLC
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

          <Text style={{ fontSize: "11px", color: "#9ca3af" }}>
            You signed up at getlaunchkit.app.{" "}
            <a href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/api/unsubscribe?email={{email}}`} style={{ color: "#6b7280" }}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
