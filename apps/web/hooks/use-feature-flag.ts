'use client';

import { useState, useEffect } from 'react';

export function useFeatureFlag(key: string): { enabled: boolean; loading: boolean } {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`/api/feature-flags/${encodeURIComponent(key)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEnabled(data.enabled);
        }
      } catch {
        // Silently fail — flag defaults to disabled
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [key]);

  return { enabled, loading };
}
