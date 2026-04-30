export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  trackReferralClick,
  trackReferralSignup,
  trackReferralConversion,
} from '@/lib/referral-tracking';

export async function POST(request: Request) {
  const body = await request.json();
  const { code, type, userId, email, amount } = body;

  if (!type) {
    return NextResponse.json({ error: 'type is required' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'click':
        if (!code) {
          return NextResponse.json({ error: 'code is required for click tracking' }, { status: 400 });
        }
        await trackReferralClick(code);
        break;
      case 'signup':
        if (!code || !userId) {
          return NextResponse.json({ error: 'code and userId are required for signup tracking' }, { status: 400 });
        }
        await trackReferralSignup(code, userId, email);
        break;
      case 'conversion':
        if (!userId || amount === undefined) {
          return NextResponse.json({ error: 'userId and amount are required for conversion tracking' }, { status: 400 });
        }
        await trackReferralConversion(userId, amount);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type. Must be click, signup, or conversion' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track referral event' }, { status: 500 });
  }
}
