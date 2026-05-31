'use client';

import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSessionContext } from '@livekit/components-react';

interface WakePulseValue {
  /** ms since epoch when the latest wake fired, or null if none yet. */
  wakeAt: number | null;
}

const WakePulseContext = createContext<WakePulseValue>({ wakeAt: null });

/**
 * Wake-pulse choreography — Enhancement B.
 *
 * Detects the rising edge of session connection (disconnected → connected)
 * and emits a single pulse timestamp. Tiles + other components consume this
 * and play their flash animation in sequence (top-to-bottom stagger).
 *
 * The 800ms sequence per plans/q-dashboard-jarvis-visual-language.md §B:
 *    0ms  — wakeAt fired (centerpiece elements freeze briefly)
 *  200ms  — implode point on the globe
 *  400ms  — pulse expands outward through tiles (top row first, ~80ms stagger)
 *  800ms  — system normalizes
 */
export function WakePulseProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useSessionContext();
  const [wakeAt, setWakeAt] = useState<number | null>(null);
  const prevConnectedRef = useRef(isConnected);

  useEffect(() => {
    if (!prevConnectedRef.current && isConnected) {
      setWakeAt(Date.now());
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  return <WakePulseContext.Provider value={{ wakeAt }}>{children}</WakePulseContext.Provider>;
}

export function useWakePulse() {
  return useContext(WakePulseContext);
}

/**
 * Hook that returns true when the wake pulse should be active on this element,
 * given a stagger delay in ms (0 = first row, 80 = next, etc).
 *
 * Hits true for ~250ms starting at wakeAt + 400 + staggerMs, then back to false.
 */
export function useWakePulseActive(staggerMs = 0): boolean {
  const { wakeAt } = useWakePulse();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!wakeAt) return;
    const startDelay = 400 + staggerMs;
    const startTimer = setTimeout(() => setActive(true), startDelay);
    const endTimer = setTimeout(() => setActive(false), startDelay + 250);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [wakeAt, staggerMs]);

  return active;
}
