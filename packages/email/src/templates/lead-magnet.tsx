import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface LeadMagnetEmailProps {
  discountCode?: string;
  discountPercent?: number;
}

export function LeadMagnetEmail({
  discountCode = "LAUNCH10",
  discountPercent = 10,
}: LeadMagnetEmailProps) {
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/pricing`;

  return (
    <Html>
      <Head />
      <Preview>{`Your ${discountPercent}% discount code + what's inside LaunchKit`}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "40px", borderRadius: "8px", maxWidth: "560px" }}>

          <Heading style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px", color: "#111827" }}>
            Here's your {discountPercent}% off code
          </Heading>

          <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#374151", marginBottom: "24px" }}>
            You showed interest in LaunchKit — so I wanted to make it easy for you to try it.
          </Text>

          {/* Discount code box */}
          <Section style={{ backgroundColor: "#f0fdf4", border: "2px dashed #22c55e", borderRadius: "8px", padding: "20px", textAlign: "center", marginBottom: "28px" }}>
            <Text style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" as const }}>
              Your discount code
            </Text>
            <Text style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", letterSpacing: "0.05em", margin: "0" }}>
              {discountCode}
            </Text>
            <Text style={{ fontSize: "13px", color: "#4b5563", marginTop: "8px", margin: "8px 0 0" }}>
              {discountPercent}% off — applies at checkout
            </Text>
          </Section>

          {/* What's inside */}
          <Heading style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
            What you get with LaunchKit ($149 → ${Math.round(149 * (1 - discountPercent / 100))} with code):
          </Heading>

          {[
            "✅ Complete Next.js 15 SaaS boilerplate — auth, billing, teams, AI, admin",
            "✅ Stripe checkout with Apple Pay, Google Pay, and Link built-in",
            "✅ Multi-tenant organizations with roles (Owner / Admin / Member)",
            "✅ AI streaming chat — GPT-4o, Claude, Gemini — plug and play",
            "✅ Admin dashboard — users, revenue, feature flags, analytics, SEO",
            "✅ Plugin system — Feedback, Roadmap, Waitlist, Testimonials, File Uploads",
            "✅ 200+ pages of docs + GitHub Codespaces ready (zero local setup)",
            "✅ Lifetime updates — get every future release for free",
          ].map((item) => (
            <Text key={item} style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151", marginBottom: "4px" }}>
              {item}
            </Text>
          ))}

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

          {/* vs. competitors */}
          <Heading style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
            How it compares:
          </Heading>

          <Text style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7" }}>
            <strong>MakerKit</strong> — $299–$499+ (subscription), no AI tools built in<br />
            <strong>ShipFast</strong> — $199, no multi-tenancy, no admin<br />
            <strong>LaunchKit</strong> — <strong>${Math.round(149 * (1 - discountPercent / 100))} with your code</strong>, one-time, everything included
          </Text>

          <Section style={{ marginTop: "28px" }}>
            <Button
              href={`${pricingUrl}?coupon=${discountCode}`}
              style={{ backgroundColor: "#000000", color: "#ffffff", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              Get LaunchKit — use {discountCode} at checkout
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#6b7280", marginTop: "28px", lineHeight: "1.6" }}>
            All sales are final. Since this is a digital product providing immediate repository access, we do not offer refunds.<br /><br />
            — Caleb King, People In Tech LLC
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

          <Text style={{ fontSize: "11px", color: "#9ca3af" }}>
            You're receiving this because you signed up at getlaunchkit.app. Not interested?{" "}
            <a href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app"}/api/unsubscribe?email={{email}}`} style={{ color: "#6b7280" }}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
