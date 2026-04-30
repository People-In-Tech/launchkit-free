"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";

interface ReferralShareProps {
  referralLink: string;
  code: string;
}

export function ReferralShare({ referralLink, code }: ReferralShareProps) {
  const shareText = `Check out LaunchKit — the fastest way to ship your SaaS. Use my referral link to get started:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedLink = encodeURIComponent(referralLink);

  const shareLinks = [
    {
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`,
      color: "hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950 dark:hover:text-sky-400",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      color: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400",
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("Try LaunchKit")}&body=${encodedText}%20${encodedLink}`,
      color: "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400",
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}%20${encodedLink}`,
      color: "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Link</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className={`w-full justify-start gap-2 ${link.color}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </a>
          ))}
        </div>

        {/* Simple QR-like code display */}
        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-lg border bg-white p-4 text-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="mx-auto mb-2"
            >
              {/* Simple referral code visual */}
              <rect width="120" height="120" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" rx="2" />
              <rect x="80" y="10" width="30" height="30" fill="black" rx="2" />
              <rect x="10" y="80" width="30" height="30" fill="black" rx="2" />
              <rect x="15" y="15" width="20" height="20" fill="white" rx="1" />
              <rect x="85" y="15" width="20" height="20" fill="white" rx="1" />
              <rect x="15" y="85" width="20" height="20" fill="white" rx="1" />
              <rect x="20" y="20" width="10" height="10" fill="black" />
              <rect x="90" y="20" width="10" height="10" fill="black" />
              <rect x="20" y="90" width="10" height="10" fill="black" />
              <rect x="50" y="10" width="6" height="6" fill="black" />
              <rect x="50" y="22" width="6" height="6" fill="black" />
              <rect x="50" y="50" width="20" height="20" fill="black" rx="2" />
              <rect x="55" y="55" width="10" height="10" fill="white" rx="1" />
              <rect x="10" y="50" width="6" height="6" fill="black" />
              <rect x="22" y="50" width="6" height="6" fill="black" />
              <rect x="80" y="50" width="6" height="6" fill="black" />
              <rect x="92" y="50" width="6" height="6" fill="black" />
              <rect x="104" y="50" width="6" height="6" fill="black" />
              <rect x="80" y="80" width="6" height="6" fill="black" />
              <rect x="92" y="80" width="6" height="6" fill="black" />
              <rect x="104" y="92" width="6" height="6" fill="black" />
              <rect x="80" y="104" width="6" height="6" fill="black" />
              <rect x="92" y="104" width="6" height="6" fill="black" />
            </svg>
            <p className="text-xs text-gray-500 font-mono">{code}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
