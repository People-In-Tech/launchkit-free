// @ts-nocheck
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

interface LeadNurtureDay5Props {
  discountCode?: string;
}

export function LeadNurtureDay5({ discountCode = "LAUNCH10" }: LeadNurtureDay5Props) {
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/pricing?coupon=${discountCode}`;

  return (
    <Html>
      <Head />
      <Preview>What a real LaunchKit build looks like in 4 days</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px", color: "#111827" }}>
            Here's what 4 days with LaunchKit actually looks like
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Let me be specific about what's possible when you're not fighting setup.
          </Text>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Say you want to build an AI writing assistant with team workspaces and a subscription model. Here's a realistic timeline:
          </Text>

          {/* Day-by-day breakdown */}
          <Section style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
            {[
              { day: "Day 1 — morning", what: "Clone repo, run create-launchkit, deploy to Vercel. Auth (Clerk), DB (Neon), Stripe checkout — all live." },
              { day: "Day 1 — afternoon", what: "Wire up your AI chat interface. GPT-4o streaming is already scaffolded — swap in your system prompt and go." },
              { day: "Day 2", what: "Build your core feature. Multi-tenant teams, roles, and per-org billing are already handled — you write zero infra code." },
              { day: "Day 3–4", what: "Polish the UI, set up your custom domain, configure your admin dashboard, and start your waitlist." },
            ].map(({ day, what }) => (
              <Text key={day} style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 12px" }}>
                <strong style={{ color: "#111827" }}>{day}:</strong> {what}
              </Text>
            ))}
          </Section>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            That's a production SaaS — with auth, billing, AI, teams, and an admin panel — in under a week. Without LaunchKit, that's typically 3–6 weeks of setup before you write a single line of your actual product.
          </Text>

          {/* Comparison table */}
          <Heading style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            How LaunchKit compares:
          </Heading>

          <Section style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "0 0 8px" }}>
              <strong>MakerKit</strong> — $299–$499+/yr subscription, no AI tools built in, steeper learning curve
            </Text>
            <Text style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "0 0 8px" }}>
              <strong>ShipFast</strong> — $199 one-time, no multi-tenancy, no admin panel, no AI streaming
            </Text>
            <Text style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "0" }}>
              <strong>LaunchKit</strong> — <strong>$149 one-time</strong>, auth + billing + teams + AI + admin + plugins + lifetime updates
            </Text>
          </Section>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Your discount code is still active:
          </Text>

          <Section style={{ backgroundColor: "#f0fdf4", border: "2px dashed #22c55e", borderRadius: "8px", padding: "16px", textAlign: "center", marginTop: "20px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: "0 0 4px" }}>
              {discountCode}
            </Text>
            <Text style={{ fontSize: "13px", color: "#4b5563", margin: "0" }}>
              10% off — apply at checkout
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
            Questions? Just reply to this email — I read every one.
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
