'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTabVisible } from './lib/use-visibility';

const AMBIENT_EVENTS = [
  { tag: 'STRIPE', message: 'Charge cleared · $250 · Pro Trader renewal' },
  { tag: 'STRIPE', message: 'MRR · +$80 net overnight' },
  { tag: 'INBOX', message: '2 new emails since 0712' },
  { tag: 'INBOX', message: '14 unread · marketing@' },
  { tag: 'CALENDAR', message: 'Brendan moved 1500 → 1530' },
  { tag: 'CALENDAR', message: 'Tomorrow · 4 sessions confirmed' },
  { tag: 'GHL', message: 'Sarah Mitchell viewed pricing page' },
  { tag: 'GHL', message: 'New lead · Pro Trader pipeline' },
  { tag: 'CIRCLE', message: 'QT community · 2 new posts' },
  { tag: 'CIRCLE', message: 'Longevity space · new comment' },
  { tag: 'FIREFLIES', message: 'Transcript ready · Ben Theobald' },
  { tag: 'INSTANTLY', message: 'Interested reply · 2 leads' },
  { tag: 'AIRTABLE', message: 'Proposal stage → won' },
  { tag: 'SYSTEMS', message: 'All workflows nominal' },
  { tag: 'STRIPE', message: 'Subscription started · 90-day Accelerator' },
  { tag: 'QC26', message: 'Bali retreat · 11 of 15 spots filled' },
];

interface AmbientUpdate {
  id: number;
  tag: string;
  message: string;
}

/**
 * Proactive ambient updates — Enhancement A.
 *
 * Every 45-90s (jittered), a small callout flies in from the right
 * showing background business activity. Stacks in a column at
 * lower-right above the build-status. Fades after 4s.
 *
 * The "thinking on its own accord" fix — Q demonstrably has eyes on the
 * business even when no one's spoken to it.
 */
function QCAmbientUpdatesInner() {
  const [updates, setUpdates] = useState<AmbientUpdate[]>([]);
  const idRef = useRef(0);
  const visible = useTabVisible();

  useEffect(() => {
    if (!visible) return; // pause when tab is hidden
    let cancelled = false;
    let nextTimer: ReturnType<typeof setTimeout> | undefined;

    const push = () => {
      if (cancelled) return;
      idRef.current += 1;
      const ev = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
      const update: AmbientUpdate = { id: idRef.current, ...ev };

      setUpdates((prev) => [update, ...prev].slice(0, 3));

      // Schedule removal after 4s
      setTimeout(() => {
        if (cancelled) return;
        setUpdates((prev) => prev.filter((u) => u.id !== update.id));
      }, 4_000);

      // Next push: 45-90s jittered
      const next = 45_000 + Math.random() * 45_000;
      nextTimer = setTimeout(push, next);
    };

    // First push after 8s — feels less like a metronome
    const initial = setTimeout(push, 8_000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, [visible]);

  return (
    <div
      className="pointer-events-none absolute right-4 bottom-24 z-[6] flex w-72 flex-col-reverse gap-2 md:right-10"
      aria-live="polite"
    >
      <AnimatePresence>
        {updates.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-sm border border-[#7a4df8]/40 bg-[#0a0512]/85 px-3 py-2 backdrop-blur-md"
            style={{ boxShadow: '0 0 24px rgba(122,77,248,0.25)' }}
          >
            <div className="font-mono text-[8px] tracking-[0.3em] text-[#b89dff] uppercase">
              {u.tag}
            </div>
            <div className="mt-1 font-mono text-[11px] leading-snug text-white/90">{u.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const QCAmbientUpdates = memo(QCAmbientUpdatesInner);
