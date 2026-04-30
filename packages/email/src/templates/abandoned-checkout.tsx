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

interface AbandonedCheckoutEmailProps {
  firstName?: string;
  discountCode?: string;
  checkoutUrl?: string;
}

export function AbandonedCheckoutEmail({
  firstName = "there",
  discountCode = "LAUNCH10",
  checkoutUrl = "https://getlaunchkit.app/pricing",
}: AbandonedCheckoutEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app";

  return (
    <Html>
      <Head />
      <Preview>You left something behind...</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: "0", padding: "0" }}>

        {/* Dark header */}
        <Section style={{ backgroundColor: "#0f172a", padding: "20px 40px" }}>
          <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0", letterSpacing: "-0.02em" }}>
            LaunchKit
          </Text>
        </Section>

        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "40px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#111827", lineHeight: "1.3" }}>
            Hey {firstName}, you left something behind
          </Heading>

          <Text style={{ fontSize: "16px", lineHeight: "1.7", color: "#374151", marginBottom: "24px" }}>
            You were just about to get LaunchKit — but it looks like you didn't finish checking out. No pressure, just wanted to make sure you didn't miss it.
          </Text>

          {/* What they'd get */}
          <Heading style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
            Here's what was in your cart:
          </Heading>

          {[
            "Complete Next.js 15 SaaS boilerplate — auth, billing, teams, AI, admin",
            "Stripe checkout with Apple Pay, Google Pay, and Link built in",
            "AI streaming chat — GPT-4o, Claude, Gemini — one config line",
            "Lifetime updates — pay once, get every future release free",
          ].map((item) => (
            <Text key={item} style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 6px", paddingLeft: "4px" }}>
              ✓ {item}
            </Text>
          ))}

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151", marginTop: "16px", marginBottom: "24px" }}>
            And here's a discount code to make it a little easier:
          </Text>

          {/* Discount code */}
          <Section style={{ backgroundColor: "#f0fdf4", border: "2px dashed #22c55e", borderRadius: "8px", padding: "20px", textAlign: "center", marginBottom: "28px" }}>
            <Text style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Your discount code
            </Text>
            <Text style={{ fontSize: "30px", fontWeight: "bold", color: "#111827", letterSpacing: "0.05em", margin: "0 0 4px" }}>
              {discountCode}
            </Text>
            <Text style={{ fontSize: "13px", color: "#4b5563", margin: "0" }}>
              10% off — apply at checkout
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: "32px" }}>
            <Button
              href={checkoutUrl}
              style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Complete your purchase →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px" }} />

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.7", margin: "0" }}>
            Questions before buying? Email us at{" "}
            <a href="mailto:hello@peopleintech.io" style={{ color: "#0f172a" }}>
              hello@peopleintech.io
            </a>{" "}
            — we're happy to help.
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
