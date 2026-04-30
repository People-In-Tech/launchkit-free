import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { Toaster } from "@/components/ui/toaster";
import { DemoBanner } from "@/components/demo-banner";
import { FeedbackWidget } from "@/components/plugins/feedback/feedback-widget";
import { DevToolbar } from "@/components/dev-toolbar";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "LaunchKit — Ship Your SaaS This Weekend",
    template: "%s | LaunchKit",
  },
  description: "Production-ready Next.js SaaS template with AI, auth, payments, and everything you need to launch.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/icon-light-64.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-light-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "LaunchKit",
    title: "LaunchKit — Ship Your AI SaaS 10x Faster",
    description: "Production-ready Next.js template with AI features, authentication, payments, and everything you need to launch.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1280,
        height: 640,
        alt: "LaunchKit — Launch your AI SaaS 10x faster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LaunchKit — Ship Your AI SaaS 10x Faster",
    description: "Production-ready Next.js template with AI features, authentication, payments, and everything you need to launch.",
    images: ["/og-image.jpg"],
  },
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // Allow build and dev to run without Clerk keys configured
    return <>{children}</>;
  }
  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/portal"
      signUpFallbackRedirectUrl="/portal"
    >
      {children}
    </ClerkProvider>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <AuthProvider>
      <html lang={locale} suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <DemoBanner />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              <Suspense fallback={null}>
                <AnalyticsProvider>{children}</AnalyticsProvider>
              </Suspense>
              <Toaster />
              <FeedbackWidget />
              <DevToolbar />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
