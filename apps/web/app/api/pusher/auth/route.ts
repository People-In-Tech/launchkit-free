import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createRealtimeAdapter } from '@launchkit/realtime';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.formData();
  const socketId = body.get('socket_id') as string;
  const channelName = body.get('channel_name') as string;

  if (!socketId || !channelName) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
  }

  const realtime = createRealtimeAdapter();

  if (!realtime.authenticateUser) {
    return NextResponse.json({ error: 'Realtime auth not supported' }, { status: 400 });
  }

  const authResponse = realtime.authenticateUser(socketId, channelName, {
    userId,
    userInfo: {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous',
      avatar: user.imageUrl,
    },
  });

  return NextResponse.json(authResponse);
}
