'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRealtime } from '@/hooks/use-realtime';

interface NotificationToastProps {
  channel: string;
  event?: string;
}

interface ToastPayload {
  title: string;
  body?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  href?: string;
}

/**
 * Listens for realtime events and shows toast notifications.
 * Mount once in the layout to receive toasts globally.
 */
export function NotificationToast({ channel, event = 'toast' }: NotificationToastProps) {
  const { data } = useRealtime<ToastPayload>(channel, event);

  useEffect(() => {
    if (!data) return;

    const toastFn =
      data.type === 'error'
        ? toast.error
        : data.type === 'success'
          ? toast.success
          : data.type === 'warning'
            ? toast.warning
            : toast.info;

    toastFn(data.title, {
      description: data.body,
      action: data.href
        ? {
            label: 'View',
            onClick: () => {
              window.location.href = data.href!;
            },
          }
        : undefined,
    });
  }, [data]);

  return null;
}
