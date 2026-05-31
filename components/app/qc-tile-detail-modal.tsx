'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { TileData } from '@/hooks/useTileData';
import { cn } from '@/lib/shadcn/utils';

interface QCTileDetailModalProps {
  tile: TileData | null;
  onClose: () => void;
}

/**
 * Click-to-open detail modal for a tile. Shows the raw `detail` payload from
 * the FastAPI sidecar in a structured, readable way (key → value pairs,
 * names lists rendered as bullets, etc.).
 *
 * For the Revenue tile this is where MRR is exposed — kept private from the
 * always-visible tile face, available on explicit drill.
 */
export function QCTileDetailModal({ tile, onClose }: QCTileDetailModalProps) {
  return (
    <AnimatePresence>
      {tile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-[min(92vw,520px)] rounded-2xl border p-6',
              'bg-[#0c0716] backdrop-blur-xl',
              'border-[#7a4df8]/40',
              'shadow-[0_0_80px_rgba(122,77,248,0.4)]'
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 transition-colors hover:text-white"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5 L15 15 M15 5 L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="font-mono text-[10px] tracking-[0.18em] text-[#7a4df8] uppercase">
              {tile.label}
            </div>
            <div className="mt-2 text-4xl font-semibold text-white">{tile.value}</div>
            <div className="mt-1 text-xs text-white/50">{tile.subtitle}</div>

            <div className="mt-5 border-t border-[#7a4df8]/15 pt-5">
              {tile.detail ? (
                <DetailContent detail={tile.detail} />
              ) : (
                <div className="text-xs text-white/40">No detail available.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailContent({ detail }: { detail: Record<string, unknown> }) {
  return (
    <dl className="space-y-2">
      {Object.entries(detail).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="font-mono text-[9px] tracking-[0.16em] text-white/40 uppercase">
            {key.replace(/_/g, ' ')}
          </dt>
          <dd className="text-sm text-white/85">{renderValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(v: unknown): React.ReactNode {
  if (v == null) return <span className="text-white/30">—</span>;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') {
    // Render currency-ish numbers with commas, others raw
    return v.toLocaleString();
  }
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-white/30">(none)</span>;
    return (
      <ul className="list-none space-y-0.5">
        {v.map((item, i) => (
          <li key={i} className="before:mr-2 before:text-[#7a4df8] before:content-['•']">
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
