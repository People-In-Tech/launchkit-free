// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@launchkit/database';
import { dripEnrollments } from '@launchkit/database';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('id');

  if (!enrollmentId) {
    return new NextResponse(unsubscribePage('Missing enrollment ID.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const [enrollment] = await db
      .select()
      .from(dripEnrollments)
      .where(eq(dripEnrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) {
      return new NextResponse(unsubscribePage('Enrollment not found.', false), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (enrollment.status === 'cancelled') {
      return new NextResponse(unsubscribePage('You have already unsubscribed from this email series.', true), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    await db
      .update(dripEnrollments)
      .set({ status: 'cancelled' })
      .where(eq(dripEnrollments.id, enrollmentId));

    return new NextResponse(unsubscribePage('You have been successfully unsubscribed.', true), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch {
    return new NextResponse(unsubscribePage('An error occurred. Please try again.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function unsubscribePage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head><title>Unsubscribe</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f6f9fc;">
  <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; max-width: 400px;">
    <h1 style="font-size: 24px; margin-bottom: 16px;">${success ? 'Unsubscribed' : 'Error'}</h1>
    <p style="color: #374151; font-size: 16px;">${message}</p>
  </div>
</body>
</html>`;
}
