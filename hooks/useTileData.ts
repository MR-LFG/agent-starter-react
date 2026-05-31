'use client';

import { useEffect, useState } from 'react';

export interface TileData {
  label: string;
  value: string;
  subtitle: string;
  status: 'ok' | 'warn' | 'error' | 'loading';
  detail?: Record<string, unknown>;
  sparkline?: number[];
}

export interface TilesResponse {
  revenue: TileData;
  leads: TileData;
  calls: TileData;
  inbox: TileData;
  circle: TileData;
  systems: TileData;
  priorities: TileData;
  qc26: TileData;
  ts: string;
}

const TILE_API_URL =
  process.env.NEXT_PUBLIC_TILE_API_URL || 'http://127.0.0.1:8000';

/**
 * Fetches all 6 tile data points from the FastAPI sidecar and refreshes on a
 * timer. Returns `null` until the first successful fetch — tiles show their
 * loading state until then.
 */
export function useTileData(refreshMs = 60_000) {
  const [data, setData] = useState<TilesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTiles = async () => {
      try {
        const res = await fetch(`${TILE_API_URL}/tiles/all`, {
          headers: { Accept: 'application/json' },
          // Prevent client-side caching so refreshes hit the API
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: TilesResponse = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
        // Leave previous data in place — better than wiping the UI on a blip
      }
    };

    fetchTiles();
    const id = setInterval(fetchTiles, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refreshMs]);

  return { data, error };
}
