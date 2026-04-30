import type { RealtimeAdapter, RealtimeClientAdapter, PresenceCallbacks } from '../adapter';

/**
 * No-op server adapter when realtime is disabled.
 */
export class NoOpRealtimeAdapter implements RealtimeAdapter {
  async trigger(_channel: string, _event: string, _data: any) {
    // No-op
  }

  authenticateUser(_socketId: string, _channel: string, _userData: any) {
    return {};
  }
}

/**
 * No-op client adapter when realtime is disabled.
 */
export class NoOpRealtimeClientAdapter implements RealtimeClientAdapter {
  subscribe(_channel: string, _event: string, _callback: (data: any) => void): () => void {
    return () => {};
  }

  subscribePresence(_channel: string, _callbacks: PresenceCallbacks): () => void {
    return () => {};
  }
}
