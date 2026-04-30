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

interface DripWelcomeDay1Props {
  userName?: string;
  actionUrl?: string;
}

export function DripWelcomeDay1({
  userName = "there",
  actionUrl = "https://app.launchkit.dev/dashboard",
}: DripWelcomeDay1Props) {
  return (
    <Html>
      <Head />
      <Preview>Quick tip: Set up your first feature</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            Quick Tip for Day 1
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Hey {userName}, it's day one of your LaunchKit journey!
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            Most successful users start by setting up their first feature. Whether it's AI chat, team invites, or billing — getting one feature live makes everything click.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            <strong>Here's what we suggest:</strong>
          </Text>
          <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
            • Configure your environment variables{"\n"}
            • Enable your first feature flag{"\n"}
            • Test the user signup flow end-to-end
          </Text>
          <Section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <Button
              href={actionUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}
            >
              Set Up a Feature
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
