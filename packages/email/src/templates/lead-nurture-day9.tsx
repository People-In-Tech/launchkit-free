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

interface LeadNurtureDay9Props {
  discountCode?: string;
}

export function LeadNurtureDay9({ discountCode = "LAUNCH10" }: LeadNurtureDay9Props) {
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/pricing?coupon=${discountCode}`;

  return (
    <Html>
      <Head />
      <Preview>Last email — your 10% code expires soon</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px", color: "#111827" }}>
            Last email — your 10% code expires in 48 hours
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            This is the last email I'll send you about LaunchKit.
          </Text>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            Your discount code <strong>{discountCode}</strong> expires in 48 hours.
            After that, it's $149 and I won't have another one for you.
          </Text>

          <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#374151" }}>
            If now isn't the right time, no worries — I get it. But if you're still on the fence,
            here's the honest summary:
          </Text>

          {[
            { label: "What you get", value: "Complete Next.js 15 SaaS stack — auth, billing, teams, AI, admin, SEO" },
            { label: "Time to deploy", value: "Under 5 minutes from first command to running app" },
            { label: "Price with code", value: `$134 one-time — lifetime updates, no subscription` },
            { label: "Policy", value: "All sales are final" },
            { label: "vs. competitors", value: "MakerKit is $299–$499+ per year. ShipFast is $199 but missing teams + AI" },
          ].map(({ label, value }) => (
            <Text key={label} style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151", marginBottom: "4px" }}>
              <strong>{label}:</strong> {value}
            </Text>
          ))}

          <Section style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px 20px", marginTop: "24px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#991b1b", margin: "0 0 8px", fontWeight: "600" }}>
              Code expires in 48 hours
            </Text>
            <Text style={{ fontSize: "26px", fontWeight: "bold", color: "#111827", margin: "0 0 4px" }}>
              {discountCode}
            </Text>
            <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              10% off → $149 becomes $134
            </Text>
          </Section>

          <Section style={{ marginBottom: "28px" }}>
            <Button
              href={pricingUrl}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Claim discount — use {discountCode}
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
            If this just isn't the right fit, no hard feelings — just click unsubscribe below.
            But if you're building a SaaS and you want to skip the setup grind,
            this is the best deal I'll offer.
            <br /><br />
            — Caleb King, People In Tech LLC
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

          <Text style={{ fontSize: "11px", color: "#9ca3af" }}>
            Final email in this sequence. You signed up at getlaunchkit.app.{" "}
            <a href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/api/unsubscribe?email={{email}}`} style={{ color: "#6b7280" }}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
