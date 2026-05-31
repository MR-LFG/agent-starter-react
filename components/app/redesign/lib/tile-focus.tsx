'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useVoiceAssistant } from '@livekit/components-react';

interface TileFocusValue {
  focusedTileId: string | null;
}

const TileFocusContext = createContext<TileFocusValue>({ focusedTileId: null });

const TILE_IDS = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08'];

/**
 * Owns "which tile is Q currently talking about" state.
 *
 * Q's API doesn't yet emit per-utterance tile-focus events, so for v1 we
 * cycle through tiles randomly while Q is speaking. When the agent integration
 * is built (separate work), we swap this internal cycler for real signals
 * and the rest of the UI keeps reading the same context.
 */
export function TileFocusProvider({ children }: { children: ReactNode }) {
  const [focusedTileId, setFocusedTileId] = useState<string | null>(null);
  const { state } = useVoiceAssistant();

  useEffect(() => {
    if (state !== 'speaking') {
      setFocusedTileId(null);
      return;
    }

    // Pick the first tile immediately, then rotate every 3-5s
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const pickNext = () => {
      if (cancelled) return;
      const random = TILE_IDS[Math.floor(Math.random() * TILE_IDS.length)];
      setFocusedTileId(random);
      const next = 3_000 + Math.random() * 2_000;
      timer = setTimeout(pickNext, next);
    };

    pickNext();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [state]);

  return (
    <TileFocusContext.Provider value={{ focusedTileId }}>{children}</TileFocusContext.Provider>
  );
}

export function useTileFocus() {
  return useContext(TileFocusContext);
}
