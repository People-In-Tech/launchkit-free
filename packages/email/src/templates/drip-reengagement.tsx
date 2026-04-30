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

interface DripReengagementProps {
  userName?: string;
  actionUrl?: string;
}

export function DripReengagement({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/dashboard",
}: DripReengagementProps) {
  return (
    <Html>
      <Head />
      <Preview>We miss you — here's what's new at LaunchKit</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            We Miss You!
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, we noticed you've been away from LaunchKit. A lot has changed since your last visit, and we think you'll love the improvements.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>Here's what's new:</strong>
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            🚀 Performance improvements across the board{"\n"}
            🤖 Enhanced AI capabilities{"\n"}
            📧 Email drip campaigns (like this one!){"\n"}
            🔗 Referral program with rewards{"\n"}
            🌍 Multi-region deployment support{"\n"}
            🔌 Plugin ecosystem for extensibility
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Your workspace is exactly how you left it. Come back and take a look!
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              See What's New
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
