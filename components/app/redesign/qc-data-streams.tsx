'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';
import { type TelemetryEvent, randomEvent, timestamp } from './lib/mock-telemetry';
import { useTabVisible } from './lib/use-visibility';

interface StreamLine extends TelemetryEvent {
  id: string;
  ts: string;
}

interface DataStreamProps {
  side: 'left' | 'right';
  /** Visible row cap — older rows fall off after this */
  maxLines?: number;
  /** Min ms between new lines (jittered with maxIntervalMs) */
  minIntervalMs?: number;
  maxIntervalMs?: number;
}

/**
 * One column of scrolling telemetry. Mounts a self-driven stream that
 * pushes a new mock event every 2-5s (jittered) and ages older lines out.
 *
 * Per plans/q-dashboard-jarvis-visual-language.md Pillar 1 — ambient motion
 * that never stops. These streams sit at low opacity on the dashboard edges
 * and sell the "Q is processing 47 things in the background" effect.
 */
function DataStream({
  side,
  maxLines = 14,
  minIntervalMs = 2_000,
  maxIntervalMs = 5_000,
}: DataStreamProps) {
  const [lines, setLines] = useState<StreamLine[]>([]);
  const idCounterRef = useRef(0);
  const { state } = useVoiceAssistant();
  const visible = useTabVisible();

  // State-driven speed coordination — thinking accelerates, listening calms
  const speedMul = state === 'thinking' ? 0.35 : state === 'listening' ? 1.5 : 1;

  useEffect(() => {
    if (!visible) return; // pause stream when tab is hidden
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const push = () => {
      if (cancelled) return;
      const ev = randomEvent();
      idCounterRef.current += 1;
      const next: StreamLine = {
        ...ev,
        id: `${idCounterRef.current}-${ev.channel}`,
        ts: timestamp(),
      };
      setLines((prev) => [next, ...prev].slice(0, maxLines));
      const interval = (minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs)) * speedMul;
      timer = setTimeout(push, interval);
    };

    const initialDelay = side === 'left' ? 200 : 1_200;
    timer = setTimeout(push, initialDelay);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [side, maxLines, minIntervalMs, maxIntervalMs, speedMul, visible]);

  const align = side === 'left' ? 'text-left' : 'text-right';
  const position = side === 'left' ? 'left-4 md:left-6' : 'right-4 md:right-6';

  return (
    <div
      className={`pointer-events-none absolute top-24 ${position} z-[2] hidden w-44 md:block`}
      aria-hidden
    >
      <div
        className={`mb-2 font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase ${align}`}
      >
        {side === 'left' ? 'Telemetry · IN' : 'Telemetry · OUT'}
      </div>
      <div className={`flex flex-col gap-1 ${align}`}>
        <AnimatePresence initial={false}>
          {lines.map((line, idx) => {
            // Fade lines toward the bottom of the stack
            const ageOpacity = Math.max(0.15, 1 - idx * 0.08);
            return (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
                animate={{ opacity: ageOpacity * 0.6, x: 0 }}
                exit={{ opacity: 0, x: side === 'left' ? -10 : 10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="font-mono text-[9px] leading-snug text-white/70"
                style={{ opacity: ageOpacity * 0.6 }}
              >
                <span className="text-white/35">{line.ts}</span>{' '}
                <span className="text-[#b89dff]/70">{line.channel}</span>{' '}
                <span className="text-white/55">{line.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QCDataStreamsInner() {
  return (
    <>
      <DataStream side="left" />
      <DataStream side="right" />
    </>
  );
}

// Memoized — prop-less, internal state only. No reason to re-render with parent.
export const QCDataStreams = memo(QCDataStreamsInner);
