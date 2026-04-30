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

interface DripWelcomeDay7Props {
  userName?: string;
  actionUrl?: string;
}

export function DripWelcomeDay7({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/dashboard",
}: DripWelcomeDay7Props) {
  return (
    <Html>
      <Head />
      <Preview>Your first week with LaunchKit — a recap</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            Your First Week Recap
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, congrats on your first week with LaunchKit! Here's a quick look at what's available to you:
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            ✅ Authentication & user management{"\n"}
            ✅ Billing & subscription management{"\n"}
            ✅ AI-powered features{"\n"}
            ✅ Team collaboration{"\n"}
            ✅ Email templates & drip campaigns{"\n"}
            ✅ Analytics & admin dashboard{"\n"}
            ✅ Feature flags & rollouts
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>What's next?</strong> If you haven't already, consider setting up billing with Stripe and customizing your landing page. These two steps get most users to launch day.
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              Continue Building
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
