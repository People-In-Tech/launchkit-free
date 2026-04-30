import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const resend = { emails: { send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args) } };

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return getResend().emails.send({
    from: process.env.EMAIL_FROM || "LaunchKit <hello@launchkit.dev>",
    to,
    subject,
    react,
  });
}

export * from "./templates/welcome";
export * from "./templates/team-invite";
export * from "./templates/purchase-confirmation";
export * from "./templates/lead-magnet";
export * from "./templates/lead-nurture-day2";
export * from "./templates/lead-nurture-day5";
export * from "./templates/lead-nurture-day9";
export * from "./templates/abandoned-checkout";
export * from "./templates/payment-failed";
export * from "./templates/github-invite-reminder";
