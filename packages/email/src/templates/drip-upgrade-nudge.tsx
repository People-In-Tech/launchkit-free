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

interface DripUpgradeNudgeProps {
  userName?: string;
  actionUrl?: string;
}

export function DripUpgradeNudge({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/settings/billing",
}: DripUpgradeNudgeProps) {
  return (
    <Html>
      <Head />
      <Preview>Unlock premium features for your SaaS</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            Unlock Premium Features
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, we noticed you haven't been around in a while. We wanted to let you know about some powerful features available on our paid plans:
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            ⚡ <strong>AI-Powered Features</strong> — Built-in chat and document intelligence{"\n"}
            👥 <strong>Team Collaboration</strong> — Role-based access for your whole team{"\n"}
            🌐 <strong>Custom Domains</strong> — Use your own domain for a professional look{"\n"}
            📊 <strong>Advanced Analytics</strong> — Deep insights into user behavior{"\n"}
            🔒 <strong>SSO & Enterprise</strong> — SAML SSO and audit logs
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Upgrading takes less than a minute and unlocks everything instantly.
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              See Plans & Pricing
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", marginTop: "32px", marginBottom: "16px" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
            You're receiving this because you have a LaunchKit account. <a href="{{{unsubscribeUrl}}}" style={{ color: "#9ca3af" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
