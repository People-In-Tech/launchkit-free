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

interface PaymentFailedEmailProps {
  firstName?: string;
  checkoutUrl?: string;
}

export function PaymentFailedEmail({
  firstName = "there",
  checkoutUrl = "https://getlaunchkit.app/pricing",
}: PaymentFailedEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app";

  return (
    <Html>
      <Head />
      <Preview>Your payment didn't go through — here's how to fix it</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: "0", padding: "0" }}>

        {/* Dark header */}
        <Section style={{ backgroundColor: "#0f172a", padding: "20px 40px" }}>
          <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0", letterSpacing: "-0.02em" }}>
            LaunchKit
          </Text>
        </Section>

        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "40px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#111827", lineHeight: "1.3" }}>
            Hey {firstName}, your payment didn't go through
          </Heading>

          <Text style={{ fontSize: "16px", lineHeight: "1.7", color: "#374151", marginBottom: "24px" }}>
            No worries — this happens to everyone. Your card wasn't charged. Here are a few common reasons and how to fix it:
          </Text>

          {/* Common reasons */}
          <Section style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "20px", marginBottom: "28px" }}>
            {[
              { title: "Card declined", detail: "Your bank may have flagged an unfamiliar charge. Try calling them or using a different card." },
              { title: "Expired card", detail: "Check that your card's expiration date is current." },
              { title: "Billing address mismatch", detail: "Make sure the billing address you entered matches what's on file with your bank." },
              { title: "Insufficient funds", detail: "LaunchKit is a one-time payment of $149 — make sure your card has the balance available." },
            ].map(({ title, detail }) => (
              <Text key={title} style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 10px" }}>
                <strong style={{ color: "#111827" }}>{title}:</strong> {detail}
              </Text>
            ))}
          </Section>

          {/* Try again CTA */}
          <Section style={{ marginBottom: "16px" }}>
            <Button
              href={checkoutUrl}
              style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Try again →
            </Button>
          </Section>

          <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.6" }}>
            You can also use a different card, Apple Pay, Google Pay, or PayPal at checkout.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px" }} />

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.7", margin: "0" }}>
            Still having trouble? Email us at{" "}
            <a href="mailto:hello@peopleintech.io" style={{ color: "#0f172a" }}>
              hello@peopleintech.io
            </a>{" "}
            and we'll sort it out.
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
