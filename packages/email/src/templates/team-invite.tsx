import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TeamInviteEmailProps {
  inviterName?: string;
  organizationName?: string;
  inviteUrl?: string;
}

export function TeamInviteEmail({
  inviterName = "Someone",
  organizationName = "a team",
  inviteUrl = "#",
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to join {organizationName}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>
          <Heading style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
            You&apos;re invited!
          </Heading>
          <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
            {inviterName} has invited you to join <strong>{organizationName}</strong> on LaunchKit.
          </Text>
          <Button
            href={inviteUrl}
            style={{ backgroundColor: "#000000", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", marginTop: "16px", textDecoration: "none" }}
          >
            Accept Invitation
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
