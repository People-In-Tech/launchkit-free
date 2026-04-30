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

interface GitHubInviteReminderEmailProps {
  firstName?: string;
  portalUrl?: string;
  planName?: string;
}

export function GitHubInviteReminderEmail({
  firstName = "there",
  portalUrl = "https://getlaunchkit.app/portal",
  planName = "Solo",
}: GitHubInviteReminderEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app";

  return (
    <Html>
      <Head />
      <Preview>Don't forget — claim your LaunchKit repo access</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: "0", padding: "0" }}>

        {/* Dark header */}
        <Section style={{ backgroundColor: "#0f172a", padding: "20px 40px" }}>
          <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0", letterSpacing: "-0.02em" }}>
            LaunchKit
          </Text>
        </Section>

        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "40px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#111827", lineHeight: "1.3" }}>
            Hey {firstName}, your repo access is waiting
          </Heading>

          <Text style={{ fontSize: "16px", lineHeight: "1.7", color: "#374151", marginBottom: "24px" }}>
            You purchased LaunchKit {planName} but haven't claimed your private repository access yet. It only takes 30 seconds — here's how:
          </Text>

          {/* Steps */}
          <Section style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginBottom: "28px" }}>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 10px" }}>
              <strong style={{ color: "#111827" }}>1. Visit your portal</strong>
              <br />
              Go to <a href={portalUrl} style={{ color: "#0f172a" }}>getlaunchkit.app/portal</a> and sign in.
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0 0 10px" }}>
              <strong style={{ color: "#111827" }}>2. Enter your GitHub username</strong>
              <br />
              Submit the GitHub account you want invited to the private repo.
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151", margin: "0" }}>
              <strong style={{ color: "#111827" }}>3. Accept your invitation</strong>
              <br />
              You'll get a GitHub email invite within minutes — accept it and you're in.
            </Text>
          </Section>

          {/* Urgency note */}
          <Section style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "14px 18px", marginBottom: "28px" }}>
            <Text style={{ fontSize: "14px", color: "#92400e", margin: "0", fontWeight: "500" }}>
              Your access is ready and waiting — it takes 30 seconds to claim.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ marginBottom: "32px" }}>
            <Button
              href={portalUrl}
              style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Claim My Access →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px" }} />

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.7", margin: "0" }}>
            Need help? Email us at{" "}
            <a href="mailto:hello@peopleintech.io" style={{ color: "#0f172a" }}>
              hello@peopleintech.io
            </a>{" "}
            and we'll get you sorted.
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
