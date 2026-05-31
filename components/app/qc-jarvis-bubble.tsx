'use client';

import { useVoiceAssistant } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

const PURPLE = '#7a4df8';

/**
 * JARVIS-style speech bubble — bottom-right HUD element.
 *
 * Three concentric rings rotating in different directions, arc segments,
 * orbiting glyphs, and centre core that pulses with Q's voice state.
 * Inspired by the Iron Man HUD circular UI elements.
 */
export function QCJarvisBubble() {
  const { state } = useVoiceAssistant();
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isListening = state === 'listening';
  const isActive = isSpeaking || isThinking || isListening;

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 z-30 transition-transform duration-500',
        isSpeaking && 'scale-110'
      )}
    >
      <div className="relative h-[120px] w-[120px]">
        {/* Outer ring with rotating dashes */}
        <svg
          viewBox="0 0 120 120"
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-60'
          )}
          style={{
            animation: `qc-spin-cw ${isSpeaking ? '4s' : '20s'} linear infinite`,
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke={PURPLE}
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.6"
          />
          {/* 4 cardinal arc segments */}
          {[0, 90, 180, 270].map((angle) => (
            <path
              key={angle}
              d={describeArc(60, 60, 56, angle - 8, angle + 8)}
              fill="none"
              stroke={PURPLE}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Middle ring — counter-rotating */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0"
          style={{
            animation: `qc-spin-ccw ${isSpeaking ? '6s' : '12s'} linear infinite`,
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke={PURPLE}
            strokeWidth="0.5"
            strokeDasharray="1 3"
            opacity="0.5"
          />
          {/* 6 small orbiting nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const x = 60 + Math.cos((angle * Math.PI) / 180) * 44;
            const y = 60 + Math.sin((angle * Math.PI) / 180) * 44;
            return (
              <circle
                key={angle}
                cx={x}
                cy={y}
                r={isSpeaking ? '2' : '1.5'}
                fill={PURPLE}
                opacity={isActive ? 0.9 : 0.5}
              />
            );
          })}
        </svg>

        {/* Inner ring — slow rotation, with Jarvis-style mini glyphs */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0"
          style={{
            animation: 'qc-spin-cw 30s linear infinite',
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="32"
            fill="none"
            stroke={PURPLE}
            strokeWidth="0.5"
            opacity="0.4"
          />
          {/* Tick marks every 30 degrees */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 60 + Math.cos(rad) * 30;
            const y1 = 60 + Math.sin(rad) * 30;
            const x2 = 60 + Math.cos(rad) * 34;
            const y2 = 60 + Math.sin(rad) * 34;
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={PURPLE}
                strokeWidth={angle % 90 === 0 ? '1.5' : '0.5'}
                opacity={angle % 90 === 0 ? 0.9 : 0.5}
              />
            );
          })}
        </svg>

        {/* Centre core — Q glyph + glow */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300',
            isSpeaking
              ? 'bg-[#7a4df8]/40 shadow-[0_0_30px_rgba(122,77,248,0.8)]'
              : isActive
                ? 'bg-[#7a4df8]/20 shadow-[0_0_20px_rgba(122,77,248,0.5)]'
                : 'bg-[#7a4df8]/10 shadow-[0_0_10px_rgba(122,77,248,0.3)]'
          )}
        >
          <span
            className={cn(
              'font-mono text-base font-bold text-white transition-transform',
              isSpeaking && 'scale-110'
            )}
          >
            Q
          </span>

          {/* Audio-reactive ripple */}
          {isSpeaking && (
            <>
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${PURPLE}`,
                  animation: 'qc-ripple 1.2s ease-out infinite',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${PURPLE}`,
                  animation: 'qc-ripple 1.2s ease-out infinite 0.4s',
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: SVG path for an arc segment
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCart(cx, cy, r, endAngle);
  const end = polarToCart(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
