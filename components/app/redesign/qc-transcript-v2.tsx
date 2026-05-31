'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext, useTranscriptions } from '@livekit/components-react';

/**
 * Live transcript panel — redesigned Jarvis HUD treatment.
 * Renders only when a session is active. Fixed bottom-center.
 */
export function QCTranscriptV2() {
  const { isConnected } = useSessionContext();
  const segments = useTranscriptions();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [segments]);

  if (!isConnected) return null;

  const recent = segments.slice(-8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pointer-events-none fixed bottom-6 left-1/2 z-20 w-[min(90vw,720px)] -translate-x-1/2"
    >
      <div
        className="relative overflow-hidden rounded-sm border border-[#7a4df8]/40 backdrop-blur-md"
        style={{
          background: 'rgba(10, 5, 22, 0.85)',
          boxShadow: '0 0 40px rgba(122,77,248,0.25)',
        }}
      >
        {/* Top edge shimmer */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #b89dff 50%, transparent 100%)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* HUD chrome — tiny header */}
        <div className="flex items-center justify-between border-b border-[#7a4df8]/20 px-4 py-2">
          <span className="font-mono text-[9px] tracking-[0.3em] text-[#b89dff] uppercase">
            Live Transcript
          </span>
          <span className="font-mono text-[9px] tracking-[0.25em] text-white/40 uppercase">
            Q · George
          </span>
        </div>

        <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-4 py-3">
          {recent.length === 0 ? (
            <div className="font-mono text-[11px] text-white/30">Awaiting input...</div>
          ) : (
            <AnimatePresence initial={false}>
              {recent.map((seg) => {
                const segAny = seg as unknown as {
                  role?: string;
                  id?: string;
                  firstReceivedTime?: number;
                  text?: string;
                };
                const isAgent = (segAny.role ?? '').toLowerCase() === 'assistant';
                const text = segAny.text || '';
                if (!text.trim()) return null;
                return (
                  <motion.div
                    key={segAny.id || `${segAny.firstReceivedTime}-${text.slice(0, 20)}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mb-1.5 flex items-start gap-3 last:mb-0"
                  >
                    <span
                      className="mt-0.5 shrink-0 font-mono text-[9px] tracking-[0.25em] uppercase"
                      style={{
                        color: isAgent ? '#b89dff' : '#ffffff99',
                        textShadow: isAgent ? '0 0 6px rgba(184,157,255,0.5)' : undefined,
                      }}
                    >
                      {isAgent ? 'Q' : 'You'}
                    </span>
                    <span className="font-mono text-[12px] leading-relaxed text-white/90">
                      {text}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
