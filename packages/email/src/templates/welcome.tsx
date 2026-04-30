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

interface WelcomeEmailProps {
  firstName?: string;
}

export function WelcomeEmail({ firstName = "there" }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app";

  return (
    <Html>
      <Head />
      <Preview>Welcome to LaunchKit — here's what to explore</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: "0", padding: "0" }}>

        {/* Dark header */}
        <Section style={{ backgroundColor: "#0f172a", padding: "20px 40px" }}>
          <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0", letterSpacing: "-0.02em" }}>
            LaunchKit
          </Text>
        </Section>

        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "40px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#111827", lineHeight: "1.3" }}>
            Welcome to LaunchKit, {firstName}
          </Heading>

          <Text style={{ fontSize: "16px", lineHeight: "1.7", color: "#374151", marginBottom: "28px" }}>
            Glad you're here. LaunchKit is a production-ready Next.js SaaS starter built for founders who want to ship fast — not spend weeks on boilerplate.
          </Text>

          {/* What's possible */}
          <Heading style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
            What you can build with LaunchKit:
          </Heading>

          {[
            "AI-powered SaaS apps with GPT-4o, Claude, or Gemini — one config line",
            "Multi-tenant platforms with teams, roles, and per-org billing",
            "Subscription or one-time payment products — Stripe built in",
            "Full admin dashboard: users, revenue, feature flags, SEO tools",
          ].map((item) => (
            <Text key={item} style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 6px", paddingLeft: "4px" }}>
              ✓ {item}
            </Text>
          ))}

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151", marginTop: "20px", marginBottom: "28px" }}>
            Start by browsing the free <strong>Prompt Library</strong> — a curated set of AI prompts for building SaaS features faster with Claude Code, Cursor, and Copilot.
          </Text>

          {/* Primary CTA */}
          <Section style={{ marginBottom: "16px" }}>
            <Button
              href={`${appUrl}/prompts`}
              style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Browse the Prompt Library →
            </Button>
          </Section>

          {/* Secondary CTA */}
          <Section style={{ marginBottom: "32px" }}>
            <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
              Ready to unlock the full kit?{" "}
              <a href={`${appUrl}/pricing`} style={{ color: "#0f172a", fontWeight: "600" }}>
                See pricing →
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px" }} />

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", margin: "0" }}>
            Questions? Reply to this email or reach us at{" "}
            <a href="mailto:hello@peopleintech.io" style={{ color: "#0f172a" }}>
              hello@peopleintech.io
            </a>
          </Text>

        </Container>

        {/* Footer */}
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 40px" }}>
          <Text style={{ fontSize: "11px", color: "#9ca3af", margin: "0", textAlign: "center" }}>
            People In Tech LLC | hello@peopleintech.io
            <br />
            <a href={`${appUrl}/api/unsubscribe?email={{email}}`} style={{ color: "#9ca3af" }}>
              Unsubscribe
            </a>
          </Text>
        </Container>

      </Body>
    </Html>
  );
}
