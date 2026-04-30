export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { enrollUser } from '@/lib/drip';

export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, trigger } = body;

  if (!userId || !trigger) {
    return NextResponse.json({ error: 'userId and trigger are required' }, { status: 400 });
  }

  const enrollmentId = await enrollUser(userId, trigger);

  if (!enrollmentId) {
    return NextResponse.json(
      { error: 'No matching campaign found or user already enrolled' },
      { status: 404 }
    );
  }

  return NextResponse.json({ enrollmentId }, { status: 201 });
}
