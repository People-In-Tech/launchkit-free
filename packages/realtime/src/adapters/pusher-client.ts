'use client';
import PusherClient from 'pusher-js';
import type { RealtimeClientAdapter, PresenceCallbacks, PresenceData } from '../adapter';

let pusherInstance: PusherClient | null = null;

function getPusher(): PusherClient {
  if (!pusherInstance && typeof window !== 'undefined') {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      authEndpoint: '/api/pusher/auth',
    });
  }
  return pusherInstance!;
}

export class PusherClientAdapter implements RealtimeClientAdapter {
  subscribe(channel: string, event: string, callback: (data: any) => void): () => void {
    const ch = getPusher().subscribe(channel);
    ch.bind(event, callback);
    return () => {
      ch.unbind(event, callback);
      getPusher().unsubscribe(channel);
    };
  }

  subscribePresence(channel: string, callbacks: PresenceCallbacks): () => void {
    const ch = getPusher().subscribe(`presence-${channel}`);

    if (callbacks.onJoin) {
      ch.bind('pusher:member_added', (member: { id: string; info: PresenceData['userInfo'] }) => {
        callbacks.onJoin!({ userId: member.id, userInfo: member.info });
      });
    }

    if (callbacks.onLeave) {
      ch.bind('pusher:member_removed', (member: { id: string; info: PresenceData['userInfo'] }) => {
        callbacks.onLeave!({ userId: member.id, userInfo: member.info });
      });
    }

    if (callbacks.onUpdate) {
      ch.bind('pusher:subscription_succeeded', (members: any) => {
        const memberList: PresenceData[] = [];
        members.each((member: { id: string; info: PresenceData['userInfo'] }) => {
          memberList.push({ userId: member.id, userInfo: member.info });
        });
        callbacks.onUpdate!(memberList);
      });
    }

    return () => {
      getPusher().unsubscribe(`presence-${channel}`);
    };
  }
}
