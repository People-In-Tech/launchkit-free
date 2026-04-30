'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getRealtimeClient } from '@launchkit/realtime';

/**
 * Subscribe to a realtime channel event. Returns the latest data received.
 *
 * @param channel - The channel name to subscribe to
 * @param event - The event name to listen for
 * @param onEvent - Optional callback when an event is received
 */
export function useRealtime<T = any>(
  channel: string,
  event: string,
  onEvent?: (data: T) => void,
) {
  const [data, setData] = useState<T | null>(null);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!channel || !event) return;

    const client = getRealtimeClient();
    const unsubscribe = client.subscribe(channel, event, (eventData: T) => {
      setData(eventData);
      callbackRef.current?.(eventData);
    });

    return unsubscribe;
  }, [channel, event]);

  const clear = useCallback(() => setData(null), []);

  return { data, clear };
}
