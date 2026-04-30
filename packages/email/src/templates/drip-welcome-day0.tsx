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

interface DripWelcomeDay0Props {
  userName?: string;
  actionUrl?: string;
}

export function DripWelcomeDay0({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/dashboard",
}: DripWelcomeDay0Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to LaunchKit — here's how to get started</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            Welcome to LaunchKit!
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, welcome aboard! We're thrilled to have you.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            LaunchKit gives you everything you need to ship your SaaS fast — auth, billing, emails, AI, and more. Here's how to get started:
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            1. <strong>Explore your dashboard</strong> — See what's ready out of the box{"\n"}
            2. <strong>Set up your team</strong> — Invite collaborators to your workspace{"\n"}
            3. <strong>Connect your domain</strong> — Go live with your custom domain
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              Go to Dashboard
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", marginTop: "32px", marginBottom: "16px" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
            You're receiving this because you signed up for LaunchKit. If you'd like to stop receiving these emails, you can <a href="{{{unsubscribeUrl}}}" style={{ color: "#9ca3af" }}>unsubscribe here</a>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
