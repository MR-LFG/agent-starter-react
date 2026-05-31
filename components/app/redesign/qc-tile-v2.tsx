'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';
import { useTileFocus } from './lib/tile-focus';
import { useWakePulseActive } from './lib/wake-pulse';
import { QCTileCallout } from './qc-tile-callouts';

interface QCTileV2Props {
  /** 2-char ID shown top-right — sells the Jarvis "every tile is a system" feel */
  id?: string;
  label: string;
  value: string | number | null;
  subtitle?: string;
  loading?: boolean;
  status?: 'ok' | 'warn' | 'error' | 'loading';
  onClick?: () => void;
  /** Staggered entrance index — tiles materialize in sequence, top-row first */
  index?: number;
  className?: string;
}

/**
 * Holographic tile panel — Jarvis HUD redesign (Move 3).
 *
 * Visual rules from plans/q-dashboard-jarvis-visual-language.md:
 *   • Translucent + glowing, never solid
 *   • Thin 1px animated border with ambient shimmer (~6s cycle)
 *   • Scan line moves through the tile (~5s loop)
 *   • Corner brackets (top-left + bottom-right) for HUD identity
 *   • Brightens when Q is speaking (other tiles dim in Move 4)
 *   • Materialize-in entrance (opacity + scan effect)
 */
export function QCTileV2({
  id,
  label,
  value,
  subtitle,
  loading,
  status,
  onClick,
  index = 0,
  className,
}: QCTileV2Props) {
  const { state } = useVoiceAssistant();
  const { focusedTileId } = useTileFocus();
  const isPulsing = useWakePulseActive(index * 80);
  const isQSpeaking = state === 'speaking';
  const isFocused = id !== undefined && focusedTileId === id;
  const isDimmed = isQSpeaking && focusedTileId !== null && !isFocused;
  const isError = status === 'error';
  const isWarn = status === 'warn';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: isDimmed ? 0.4 : 1,
        scale: isPulsing ? 1.04 : isFocused ? 1.02 : 1,
      }}
      transition={{
        duration: isPulsing ? 0.25 : 0.5,
        delay: 0.15 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg p-4',
        // Translucent fill + 1px purple border per visual language §4
        'bg-[#7a4df8]/[0.04] backdrop-blur-sm',
        // Border varies by state — error tints red, focus brightens, otherwise purple
        isError
          ? 'border border-red-500/55'
          : isWarn
            ? 'border border-amber-500/50'
            : isFocused
              ? 'border border-[#b89dff]'
              : 'border border-[#7a4df8]/25',
        // Glow scales with state: pulsing > focused > speaking > idle
        isPulsing
          ? 'shadow-[0_0_64px_rgba(184,157,255,0.85)]'
          : isError
            ? 'shadow-[0_0_24px_rgba(255,77,77,0.3)]'
            : isFocused
              ? 'shadow-[0_0_48px_rgba(184,157,255,0.55)]'
              : isQSpeaking
                ? 'shadow-[0_0_28px_rgba(122,77,248,0.22)]'
                : 'shadow-[0_0_12px_rgba(122,77,248,0.08)]',
        'transition-[box-shadow,border-color,opacity] duration-300',
        onClick &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-[#7a4df8]/70 hover:shadow-[0_0_36px_rgba(122,77,248,0.35)]',
        className
      )}
    >
      {/* Border shimmer — a faint highlight runs along the top edge every ~6s */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(184,157,255,0.85) 50%, transparent 100%)',
        }}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '100%', opacity: [0, 1, 0] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 4.5,
          ease: 'easeInOut',
          delay: index * 0.4,
        }}
      />

      {/* Scan line — a faint horizontal sweep across the tile every ~5s */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-12"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(122,77,248,0.08) 50%, transparent 100%)',
        }}
        initial={{ top: '-25%', opacity: 0 }}
        animate={{ top: ['-25%', '100%'], opacity: [0, 1, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'linear',
          delay: index * 0.6,
        }}
      />

      {/* Corner brackets — top-left */}
      <div aria-hidden className="pointer-events-none absolute top-1.5 left-1.5 size-2.5">
        <div className="absolute top-0 left-0 h-px w-full bg-[#b89dff]/60" />
        <div className="absolute top-0 left-0 h-full w-px bg-[#b89dff]/60" />
      </div>
      {/* Corner brackets — bottom-right */}
      <div aria-hidden className="pointer-events-none absolute right-1.5 bottom-1.5 size-2.5">
        <div className="absolute right-0 bottom-0 h-px w-full bg-[#b89dff]/60" />
        <div className="absolute right-0 bottom-0 h-full w-px bg-[#b89dff]/60" />
      </div>

      {/* Tile ID top-right — Jarvis system identifier */}
      {id && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-2.5 right-2.5 font-mono text-[8px] tracking-[0.3em] text-white/35 uppercase"
        >
          {id}
        </div>
      )}

      {/* Label */}
      <div className="font-mono text-[9px] tracking-[0.28em] text-[#b89dff]/80 uppercase">
        {label}
      </div>

      {/* Value — large, animated swap. Error state glitches + shows TELEMETRY LOST */}
      <div className="mt-2 min-h-[36px]">
        {loading ? (
          <div className="h-7 w-20 animate-pulse rounded bg-[#7a4df8]/10" />
        ) : isError ? (
          <ErrorGlitch />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={String(value)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="font-mono text-2xl font-bold text-white tabular-nums"
            >
              {value ?? '—'}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && <div className="mt-1 font-mono text-[10px] text-white/40">{subtitle}</div>}

      {/* HUD callout — fires when value changes */}
      <QCTileCallout value={value} />
    </motion.div>
  );
}

/** Error glitch — replaces value with TELEMETRY LOST + position jitter. */
function ErrorGlitch() {
  return (
    <motion.div
      animate={{ x: [0, -1, 1, -1, 0, 1, 0] }}
      transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.6, ease: 'linear' }}
      className="font-mono text-sm font-bold tracking-[0.15em] text-red-300"
      style={{ textShadow: '0 0 8px rgba(255,77,77,0.6)' }}
    >
      TELEMETRY LOST
    </motion.div>
  );
}
