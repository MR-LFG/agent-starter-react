'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * HUD callouts that fly in on a tile when its value changes.
 * Per plans/q-dashboard-jarvis-visual-language.md Pillar 5 — Jarvis tags things
 * in Tony's field of view. Q's dashboard tags things in George's.
 *
 * Watches a value via `value` prop; when it changes, emits a 4-second
 * callout with a synthesized tag (LIVE / +X / NEW / UPDATED).
 */
export function QCTileCallout({
  value,
  format = 'auto',
}: {
  value: string | number | null | undefined;
  format?: 'auto' | 'live' | 'updated' | 'new';
}) {
  const [callout, setCallout] = useState<string | null>(null);
  const prevValueRef = useRef(value);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    // Skip the first render — don't fire on initial mount
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      prevValueRef.current = value;
      return;
    }

    if (value === prevValueRef.current) return;

    const tag = synthTag(prevValueRef.current, value, format);
    prevValueRef.current = value;

    if (!tag) return;

    setCallout(tag);
    const timer = setTimeout(() => setCallout(null), 4_000);
    return () => clearTimeout(timer);
  }, [value, format]);

  return (
    <AnimatePresence>
      {callout && (
        <motion.div
          initial={{ opacity: 0, x: -8, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="pointer-events-none absolute top-1/2 -right-2 z-10 -translate-y-1/2"
        >
          <div className="flex items-center gap-1">
            {/* Tiny leader-line connector to the tile edge */}
            <span
              className="block h-px w-3"
              style={{ background: 'linear-gradient(90deg, #b89dff 0%, transparent 100%)' }}
            />
            <div
              className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-[0.2em] text-white uppercase"
              style={{
                background: 'rgba(122,77,248,0.95)',
                boxShadow: '0 0 12px rgba(184,157,255,0.6)',
              }}
            >
              {callout}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function synthTag(
  prev: string | number | null | undefined,
  next: string | number | null | undefined,
  format: 'auto' | 'live' | 'updated' | 'new'
): string | null {
  if (next === null || next === undefined || next === '—') return null;

  if (format === 'live') return 'LIVE';
  if (format === 'updated') return 'UPDATED';
  if (format === 'new') return 'NEW';

  // Auto: try to extract numeric delta
  const prevNum = parseNum(prev);
  const nextNum = parseNum(next);
  if (prevNum !== null && nextNum !== null && prevNum !== nextNum) {
    const delta = nextNum - prevNum;
    const sign = delta > 0 ? '+' : '';
    if (Math.abs(delta) >= 1) return `${sign}${delta}`;
  }

  return 'UPDATED';
}

function parseNum(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  // Strip $ , % and other non-numeric prefixes, keep digits + .
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
