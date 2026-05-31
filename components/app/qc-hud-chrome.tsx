'use client';

import { useVoiceAssistant } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

const PURPLE = '#7a4df8';

/**
 * Iron Man HUD chrome: 4 corner brackets, sweeping scan line, edge tick marks,
 * subtle CRT-style scanlines overlay. Sits above starfield, below content.
 *
 * Reactive: corner brackets glow brighter when Q is speaking; scan line speeds
 * up. Pointer-events disabled so it doesn't block clicks.
 */
export function QCHudChrome() {
  const { state } = useVoiceAssistant();
  const isSpeaking = state === 'speaking';
  const isActive = state === 'speaking' || state === 'thinking' || state === 'listening';

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* 4 corner brackets */}
      <CornerBracket position="tl" active={isActive} />
      <CornerBracket position="tr" active={isActive} />
      <CornerBracket position="bl" active={isActive} />
      <CornerBracket position="br" active={isActive} />

      {/* Sweeping horizontal scan line */}
      <div
        className="absolute right-0 left-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${PURPLE}80 20%, ${PURPLE} 50%, ${PURPLE}80 80%, transparent 100%)`,
          boxShadow: `0 0 20px ${PURPLE}, 0 0 40px ${PURPLE}80`,
          animation: `qc-scan ${isSpeaking ? '4s' : '8s'} linear infinite`,
          opacity: isActive ? 0.6 : 0.25,
        }}
      />

      {/* Edge tick marks — left side */}
      <div className="absolute top-1/2 left-1 flex -translate-y-1/2 flex-col gap-3 opacity-40">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-px transition-all duration-500',
              i === 4 ? 'w-4' : i === 2 || i === 6 ? 'w-3' : 'w-2'
            )}
            style={{ background: PURPLE }}
          />
        ))}
      </div>

      {/* Edge tick marks — right side */}
      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col gap-3 opacity-40">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-px self-end transition-all duration-500',
              i === 4 ? 'w-4' : i === 2 || i === 6 ? 'w-3' : 'w-2'
            )}
            style={{ background: PURPLE }}
          />
        ))}
      </div>

      {/* Faint CRT scanlines */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Vignette — corners darken slightly */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}

interface CornerBracketProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  active: boolean;
}

function CornerBracket({ position, active }: CornerBracketProps) {
  const positionClasses = {
    tl: 'top-3 left-3',
    tr: 'top-3 right-3 rotate-90',
    bl: 'bottom-3 left-3 -rotate-90',
    br: 'bottom-3 right-3 rotate-180',
  }[position];

  return (
    <div
      className={cn('absolute h-12 w-12 transition-all duration-500', positionClasses)}
      style={{
        opacity: active ? 0.9 : 0.5,
        filter: active ? `drop-shadow(0 0 8px ${PURPLE})` : 'none',
      }}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
        {/* L-shaped corner */}
        <path d="M 4 18 L 4 4 L 18 4" stroke={PURPLE} strokeWidth="1.5" strokeLinecap="round" />
        {/* Inner accent line */}
        <path
          d="M 8 14 L 8 8 L 14 8"
          stroke={PURPLE}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Corner dot */}
        <circle cx="4" cy="4" r="1.5" fill={PURPLE} />
        {/* Decorative tick */}
        <line x1="22" y1="4" x2="26" y2="4" stroke={PURPLE} strokeWidth="1" opacity="0.5" />
        <line x1="4" y1="22" x2="4" y2="26" stroke={PURPLE} strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
