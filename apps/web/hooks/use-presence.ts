'use client';

import { useEffect, useState, useRef } from 'react';
import { getRealtimeClient } from '@launchkit/realtime';
import type { PresenceData } from '@launchkit/realtime';

/**
 * Subscribe to presence events on a channel.
 * Returns the current list of online members and join/leave handlers.
 */
export function usePresence(channel: string) {
  const [members, setMembers] = useState<PresenceData[]>([]);
  const membersRef = useRef<Map<string, PresenceData>>(new Map());

  useEffect(() => {
    if (!channel) return;

    const client = getRealtimeClient();

    const unsubscribe = client.subscribePresence(channel, {
      onJoin: (member) => {
        membersRef.current.set(member.userId, member);
        setMembers(Array.from(membersRef.current.values()));
      },
      onLeave: (member) => {
        membersRef.current.delete(member.userId);
        setMembers(Array.from(membersRef.current.values()));
      },
      onUpdate: (updatedMembers) => {
        membersRef.current.clear();
        for (const m of updatedMembers) {
          membersRef.current.set(m.userId, m);
        }
        setMembers(updatedMembers);
      },
    });

    return () => {
      unsubscribe();
      membersRef.current.clear();
      setMembers([]);
    };
  }, [channel]);

  return {
    members,
    count: members.length,
    isOnline: (userId: string) => membersRef.current.has(userId),
  };
}
