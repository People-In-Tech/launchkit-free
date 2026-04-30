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

interface DripTrialExpiringProps {
  userName?: string;
  actionUrl?: string;
  daysLeft?: number;
}

export function DripTrialExpiring({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/settings/billing",
  daysLeft = 3,
}: DripTrialExpiringProps) {
  return (
    <Html>
      <Head />
      <Preview>Your trial expires in {daysLeft} days</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            Your Trial Expires in {daysLeft} Days
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, just a heads up — your LaunchKit trial ends in {daysLeft} days.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            To keep access to all the features you've been using, upgrade to a paid plan. You won't lose any of your data or configurations.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>What you'll keep with a paid plan:</strong>
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            • Unlimited team members{"\n"}
            • AI-powered features{"\n"}
            • Priority support{"\n"}
            • Custom domain support{"\n"}
            • Advanced analytics
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              Upgrade Now
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", marginTop: "32px", marginBottom: "16px" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
            You're receiving this because you're on a LaunchKit trial. <a href="{{{unsubscribeUrl}}}" style={{ color: "#9ca3af" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
