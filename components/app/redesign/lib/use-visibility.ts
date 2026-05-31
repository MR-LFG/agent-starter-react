'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks whether the tab is currently visible to the user.
 * Used to pause expensive animations + timers when the dashboard is in the background.
 *
 * Returns `true` during SSR (assume visible — the page will hydrate to the real value).
 */
export function useTabVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(document.visibilityState === 'visible');
    const handler = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return visible;
}
