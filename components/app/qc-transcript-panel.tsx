'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext, useTranscriptions } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

/**
 * Live conversation transcript — fixed bottom strip showing the last few
 * exchanges between George and Q. Auto-scrolls to newest. Only renders when
 * a session is active.
 */
export function QCTranscriptPanel() {
  const { isConnected } = useSessionContext();
  const segments = useTranscriptions();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [segments]);

  if (!isConnected) return null;

  // Show only the last 8 segments to keep the panel compact
  const recent = segments.slice(-8);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-20 -translate-x-1/2',
        'w-[min(90vw,720px)] rounded-2xl border border-[#7a4df8]/30 bg-black/55 backdrop-blur-md',
        'shadow-[0_0_40px_rgba(122,77,248,0.18)]'
      )}
    >
      {/* HUD chrome — tiny header */}
      <div className="flex items-center justify-between border-b border-[#7a4df8]/15 px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#7a4df8]/80 uppercase">
          Live transcript
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] text-white/40 uppercase">
          Q ⟷ George
        </span>
      </div>

      <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-4 py-3">
        {recent.length === 0 ? (
          <div className="font-mono text-xs text-white/30">Awaiting your first word...</div>
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-1.5 last:mb-0"
                >
                  <span
                    className={cn(
                      'font-mono text-[9px] tracking-[0.18em] uppercase',
                      isAgent ? 'text-[#7a4df8]' : 'text-cyan-400'
                    )}
                  >
                    {isAgent ? 'Q' : 'You'}
                  </span>
                  <span className="ml-2 text-sm text-white/85">{text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
