'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranscriptions } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

/**
 * Action log — right-edge sidebar showing every write action Q has performed
 * this session. Detected by scanning Q's transcribed responses for action
 * confirmation patterns ("Email sent to X", "Posted to Circle", "Created GHL
 * contact", etc.).
 *
 * Imperfect — relies on the tool return strings matching these patterns —
 * but functional and zero-extra-infrastructure.
 */

interface Action {
  id: string;
  kind: 'email' | 'circle' | 'calendar' | 'ghl' | 'drive' | 'slack' | 'memory' | 'unknown';
  text: string;
  time: number;
}

// Patterns that map Q's confirmation strings → action kind
const PATTERNS: Array<{ kind: Action['kind']; re: RegExp }> = [
  { kind: 'email', re: /email sent to (.+?)\./i },
  { kind: 'email', re: /draft saved in gmail to (.+?)\./i },
  { kind: 'email', re: /reply (sent|saved as draft)/i },
  { kind: 'circle', re: /posted to circle space ([\d]+)/i },
  { kind: 'calendar', re: /calendar blocked: (.+?) at /i },
  { kind: 'ghl', re: /created ghl contact (.+?) \(/i },
  { kind: 'ghl', re: /updated ghl contact ([a-z0-9_-]+)/i },
  { kind: 'ghl', re: /ghl (get|post|put|delete) (.+?) succeeded/i },
  { kind: 'drive', re: /created google doc '(.+?)'/i },
  { kind: 'drive', re: /shared file ([a-z0-9_-]+) with (.+?) as/i },
  { kind: 'slack', re: /slack dm sent to (.+?)\s/i },
  { kind: 'slack', re: /posted to slack channel/i },
  { kind: 'memory', re: /saved memory: (.+)/i },
  { kind: 'memory', re: /forgot memory: (.+)/i },
];

function detectAction(text: string): Action['kind'] | null {
  for (const { kind, re } of PATTERNS) {
    if (re.test(text)) return kind;
  }
  return null;
}

const ICONS: Record<Action['kind'], string> = {
  email: '✉',
  circle: '○',
  calendar: '◐',
  ghl: '◆',
  drive: '⬢',
  slack: '#',
  memory: '✦',
  unknown: '•',
};

export function QCActionLog() {
  const segments = useTranscriptions();
  const [actions, setActions] = useState<Action[]>([]);

  // Scan new transcript segments for action-confirmation patterns
  useEffect(() => {
    setActions((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const next = [...prev];
      for (const seg of segments) {
        const segAny = seg as unknown as {
          role?: string;
          id?: string;
          firstReceivedTime?: number;
          text?: string;
        };
        if ((segAny.role ?? '').toLowerCase() !== 'assistant') continue;
        const text = segAny.text || '';
        if (!text.trim()) continue;
        // Pattern-match against Q's tool-return strings
        const kind = detectAction(text);
        if (!kind) continue;
        const id = segAny.id || `${segAny.firstReceivedTime}-${text.slice(0, 30)}`;
        if (seen.has(id)) continue;
        next.push({
          id,
          kind,
          text: text.length > 60 ? text.slice(0, 60) + '…' : text,
          time: Date.now(),
        });
      }
      return next.slice(-15);
    });
  }, [segments]);

  if (actions.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-6 z-20',
        'max-h-[calc(100vh-120px)] w-[260px] overflow-hidden rounded-2xl',
        'border border-[#7a4df8]/30 bg-black/55 backdrop-blur-md',
        'shadow-[0_0_30px_rgba(122,77,248,0.15)]'
      )}
    >
      <div className="flex items-center justify-between border-b border-[#7a4df8]/15 px-3 py-2">
        <span className="font-mono text-[9px] tracking-[0.2em] text-[#7a4df8]/80 uppercase">
          Action log
        </span>
        <span className="font-mono text-[9px] text-white/40">{actions.length}</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto px-3 py-2">
        <AnimatePresence initial={false}>
          {actions
            .slice()
            .reverse()
            .map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-2 flex gap-2 text-[11px] text-white/80 last:mb-0"
              >
                <span className="mt-0.5 font-mono text-[#7a4df8]" style={{ minWidth: '12px' }}>
                  {ICONS[a.kind]}
                </span>
                <span className="leading-tight">{a.text}</span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
