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

interface DripWelcomeDay3Props {
  userName?: string;
  actionUrl?: string;
}

export function DripWelcomeDay3({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/dashboard",
}: DripWelcomeDay3Props) {
  return (
    <Html>
      <Head />
      <Preview>3 things most LaunchKit users miss</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            3 Things Most Users Miss
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, you've been using LaunchKit for a few days now. Here are three powerful features that many users don't discover right away:
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>1. AI-Powered Features</strong>{"\n"}
            LaunchKit comes with built-in AI chat and document intelligence. Enable it from your dashboard to give your users a ChatGPT-like experience.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>2. Team Collaboration</strong>{"\n"}
            Invite your team with role-based access. Admins, members, and viewers — all managed out of the box.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>3. Analytics Dashboard</strong>{"\n"}
            Track user signups, revenue, and feature usage from a single admin panel.
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              Explore Features
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", marginTop: "32px", marginBottom: "16px" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
            You're receiving this because you signed up for LaunchKit. <a href="{{{unsubscribeUrl}}}" style={{ color: "#9ca3af" }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
