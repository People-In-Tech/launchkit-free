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

interface PurchaseConfirmationEmailProps {
  firstName?: string;
  planName?: string;
  amountFormatted?: string;
  portalUrl?: string;
}

export function PurchaseConfirmationEmail({
  firstName = "there",
  planName = "Solo",
  amountFormatted = "$149",
  portalUrl = "https://getlaunchkit.app/portal",
}: PurchaseConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your LaunchKit purchase is confirmed — here's what to do next</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: "0", padding: "0" }}>

        {/* Dark header */}
        <Section style={{ backgroundColor: "#0f172a", padding: "20px 40px" }}>
          <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0", letterSpacing: "-0.02em" }}>
            LaunchKit
          </Text>
        </Section>

        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "40px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "8px", color: "#111827", lineHeight: "1.3" }}>
            You're in — welcome to LaunchKit! 🎉
          </Heading>

          <Text style={{ fontSize: "16px", lineHeight: "1.7", color: "#374151", marginBottom: "28px" }}>
            Hey {firstName}, your purchase went through and your access is being set up. Here's everything you need to know.
          </Text>

          {/* Order Summary */}
          <Section style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginBottom: "32px" }}>
            <Text style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
              Order Summary
            </Text>
            <Text style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              LaunchKit {planName}
            </Text>
            <Text style={{ fontSize: "15px", color: "#4b5563", margin: "0" }}>
              {amountFormatted} — one-time payment, lifetime updates
            </Text>
          </Section>

          {/* What happens next */}
          <Heading style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
            What happens next
          </Heading>

          {/* Step 1 */}
          <Section style={{ display: "flex", marginBottom: "20px" }}>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0" }}>
              <strong style={{ color: "#111827" }}>1. Go to your portal and submit your GitHub username</strong>
              <br />
              Visit the portal link below and enter the GitHub username you want invited to the private repository. It takes about 30 seconds.
            </Text>
          </Section>

          {/* Step 2 */}
          <Section style={{ marginBottom: "20px" }}>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0" }}>
              <strong style={{ color: "#111827" }}>2. Accept your GitHub repo invitation (within minutes)</strong>
              <br />
              You'll receive an email from GitHub inviting you to the <code style={{ backgroundColor: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", fontSize: "13px" }}>launchkit</code> private repository. Accept it and you're in.
            </Text>
          </Section>

          {/* Step 3 */}
          <Section style={{ marginBottom: "32px" }}>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0" }}>
              <strong style={{ color: "#111827" }}>3. Clone and configure</strong>
              <br />
              Run <code style={{ backgroundColor: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", fontSize: "13px" }}>git clone</code> to pull the repo, then run <code style={{ backgroundColor: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", fontSize: "13px" }}>npx create-launchkit@latest</code> to set up your environment variables and get your project configured in minutes.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: "32px" }}>
            <Button
              href={portalUrl}
              style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Go to Portal → Submit GitHub Username
            </Button>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px" }} />

          <Text style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", margin: "0" }}>
            Questions? Email us at{" "}
            <a href="mailto:hello@peopleintech.io" style={{ color: "#0f172a" }}>
              hello@peopleintech.io
            </a>{" "}
            and we'll get back to you quickly.
          </Text>

        </Container>

        {/* Footer */}
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 40px" }}>
          <Text style={{ fontSize: "11px", color: "#9ca3af", margin: "0", textAlign: "center" }}>
            People In Tech LLC | LaunchKit
            <br />
            <a href="https://getlaunchkit.app" style={{ color: "#9ca3af" }}>getlaunchkit.app</a>
          </Text>
        </Container>

      </Body>
    </Html>
  );
}
