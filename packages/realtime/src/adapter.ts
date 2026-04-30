export interface RealtimeAdapter {
  /** Server-side: trigger an event on a channel */
  trigger(channel: string, event: string, data: any): Promise<void>;

  /** Server-side: authenticate a user for a presence channel */
  authenticateUser?(socketId: string, channel: string, userData: PresenceData): any;
}

export interface RealtimeClientAdapter {
  /** Client-side: subscribe to an event on a channel. Returns an unsubscribe function. */
  subscribe(channel: string, event: string, callback: (data: any) => void): () => void;

  /** Client-side: subscribe to presence events. Returns an unsubscribe function. */
  subscribePresence(channel: string, callbacks: PresenceCallbacks): () => void;
}

export interface PresenceData {
  userId: string;
  userInfo: {
    name: string;
    avatar?: string;
  };
}

export interface PresenceCallbacks {
  onJoin?: (member: PresenceData) => void;
  onLeave?: (member: PresenceData) => void;
  onUpdate?: (members: PresenceData[]) => void;
}
