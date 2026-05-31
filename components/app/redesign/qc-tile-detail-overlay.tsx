'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TileData } from '@/hooks/useTileData';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';

/**
 * Click-to-drill detail overlay — Enhancement E.
 * Replaces the original full-screen modal with a HUD panel that overlays
 * the centerpiece, keeping spatial continuity with the rest of the dashboard.
 *
 * Sits inside the dashboard frame (not fixed/full-viewport), so the tile
 * columns + telemetry streams stay visible behind it.
 */
export function QCTileDetailOverlay({
  tile,
  onClose,
}: {
  tile: TileData | null;
  onClose: () => void;
}) {
  // ESC key dismisses
  useEffect(() => {
    if (!tile) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tile, onClose]);

  return (
    <AnimatePresence>
      {tile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // Centered over the centerpiece, click background dismisses
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(92vw,520px)] overflow-hidden rounded-sm border p-6 backdrop-blur-md"
            style={{
              background: 'rgba(10, 5, 22, 0.92)',
              borderColor: `${PURPLE}66`,
              boxShadow: `0 0 80px ${PURPLE}55`,
            }}
          >
            {/* Corner brackets — same HUD treatment as tiles */}
            <Bracket position="top-left" />
            <Bracket position="top-right" />
            <Bracket position="bottom-left" />
            <Bracket position="bottom-right" />

            {/* Scan line animation at the top edge */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${PURPLE_BRIGHT} 50%, transparent 100%)`,
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Close — escape hint + X */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase transition-colors hover:text-white"
              aria-label="Close"
            >
              <span className="mr-2 text-white/25">esc</span>
              <span>close</span>
            </button>

            {/* Tile ID + label */}
            <div className="font-mono text-[9px] tracking-[0.3em] text-[#b89dff]/80 uppercase">
              {tile.label}
            </div>

            {/* Value */}
            <div className="mt-3 font-mono text-4xl font-bold text-white tabular-nums">
              {tile.value}
            </div>
            <div className="mt-1 font-mono text-[10px] text-white/50">{tile.subtitle}</div>

            {/* Divider */}
            <div
              className="mt-5 h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${PURPLE}80 50%, transparent 100%)`,
              }}
            />

            {/* Detail content */}
            <div className="mt-5 max-h-[40vh] overflow-y-auto pr-1">
              {tile.detail ? (
                <DetailContent detail={tile.detail} />
              ) : (
                <div className="font-mono text-[10px] text-white/35">
                  No detail telemetry available.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Bracket({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const corner = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position];

  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');

  return (
    <div className={`pointer-events-none absolute size-4 ${corner}`}>
      <div
        className="absolute"
        style={{
          [isTop ? 'top' : 'bottom']: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: '16px',
          height: '1px',
          background: PURPLE_BRIGHT,
        }}
      />
      <div
        className="absolute"
        style={{
          [isTop ? 'top' : 'bottom']: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: '1px',
          height: '16px',
          background: PURPLE_BRIGHT,
        }}
      />
    </div>
  );
}

function DetailContent({ detail }: { detail: Record<string, unknown> }) {
  return (
    <dl className="space-y-3">
      {Object.entries(detail).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="font-mono text-[9px] tracking-[0.25em] text-white/40 uppercase">
            {key.replace(/_/g, ' ')}
          </dt>
          <dd className="font-mono text-sm text-white/90">{renderValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(v: unknown): React.ReactNode {
  if (v == null) return <span className="text-white/30">—</span>;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return v.toLocaleString();
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-white/30">(none)</span>;
    return (
      <ul className="list-none space-y-0.5">
        {v.map((item, i) => (
          <li key={i} className="before:mr-2 before:text-[#b89dff] before:content-['›']">
            {renderValue(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof v === 'object') {
    return (
      <div className="ml-2 space-y-0.5">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k} className="text-xs">
            <span className="font-mono text-white/40">{k}:</span> <span>{renderValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }
  return String(v);
}
