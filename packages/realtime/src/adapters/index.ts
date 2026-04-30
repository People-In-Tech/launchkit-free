import type { RealtimeAdapter, RealtimeClientAdapter } from '../adapter';
import { NoOpRealtimeAdapter, NoOpRealtimeClientAdapter } from './noop';

export type RealtimeProvider = 'pusher' | 'noop';

let serverInstance: RealtimeAdapter | null = null;
let clientInstance: RealtimeClientAdapter | null = null;

function detectProvider(): RealtimeProvider {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
    return 'pusher';
  }
  return 'noop';
}

/**
 * Creates a server-side realtime adapter.
 */
export function createRealtimeAdapter(provider?: RealtimeProvider): RealtimeAdapter {
  const p = provider ?? detectProvider();

  switch (p) {
    case 'pusher': {
      const { PusherRealtimeAdapter } = require('./pusher');
      return new PusherRealtimeAdapter();
    }
    case 'noop':
    default:
      return new NoOpRealtimeAdapter();
  }
}

/**
 * Creates a client-side realtime adapter.
 */
export function createRealtimeClientAdapter(provider?: RealtimeProvider): RealtimeClientAdapter {
  const p = provider ?? detectProvider();

  switch (p) {
    case 'pusher': {
      const { PusherClientAdapter } = require('./pusher-client');
      return new PusherClientAdapter();
    }
    case 'noop':
    default:
      return new NoOpRealtimeClientAdapter();
  }
}

/**
 * Returns a singleton server-side realtime adapter.
 */
export function getRealtime(): RealtimeAdapter {
  if (!serverInstance) {
    serverInstance = createRealtimeAdapter();
  }
  return serverInstance;
}

/**
 * Returns a singleton client-side realtime adapter.
 */
export function getRealtimeClient(): RealtimeClientAdapter {
  if (!clientInstance) {
    clientInstance = createRealtimeClientAdapter();
  }
  return clientInstance;
}

export { PusherRealtimeAdapter } from './pusher';
export { PusherClientAdapter } from './pusher-client';
export { NoOpRealtimeAdapter, NoOpRealtimeClientAdapter } from './noop';
