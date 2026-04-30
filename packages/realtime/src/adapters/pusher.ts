import Pusher from 'pusher';
import type { RealtimeAdapter, PresenceData } from '../adapter';

let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  return pusherInstance;
}

export class PusherRealtimeAdapter implements RealtimeAdapter {
  async trigger(channel: string, event: string, data: any) {
    await getPusher().trigger(channel, event, data);
  }

  authenticateUser(socketId: string, channel: string, userData: PresenceData) {
    return getPusher().authorizeChannel(socketId, channel, {
      user_id: userData.userId,
      user_info: userData.userInfo,
    });
  }
}
