'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';
import { QCSparkline } from '@/components/app/qc-sparkline';
import { cn } from '@/lib/shadcn/utils';

interface QCTileProps {
  label: string;
  value: string | number | null;
  subtitle?: string;
  loading?: boolean;
  accent?: boolean;
  status?: 'ok' | 'warn' | 'error' | 'loading';
  sparkline?: number[];
  onClick?: () => void;
  index?: number; // for staggered entrance
  className?: string;
}

/**
 * A business-data tile for the QC dashboard.
 * Dark glass card, animated entrance, glow border on hover, scanning corner accent.
 */
export function QCTile({
  label,
  value,
  subtitle,
  loading,
  accent,
  status,
  sparkline,
  onClick,
  index = 0,
  className,
}: QCTileProps) {
  const { state } = useVoiceAssistant();
  const isQSpeaking = state === 'speaking';

  const statusBorder =
    status === 'error'
      ? 'border-red-500/40 hover:border-red-500/70'
      : status === 'warn'
        ? 'border-amber-500/40 hover:border-amber-500/70'
        : 'border-[#7a4df8]/20 hover:border-[#7a4df8]/70';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-500',
        'bg-[#0f0a1a]/60 backdrop-blur-md',
        statusBorder,
        onClick && 'cursor-pointer',
        // Ambient pulse when Q is speaking — all tiles glow subtly
        isQSpeaking
          ? 'shadow-[0_0_30px_rgba(122,77,248,0.25)]'
          : 'shadow-[0_0_0_1px_rgba(122,77,248,0.05)] hover:shadow-[0_0_50px_rgba(122,77,248,0.35)]',
        accent && 'border-[#7a4df8]/50 bg-[#7a4df8]/5',
        className
      )}
    >
      {/* Subtle gradient sweep on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-[#7a4df8]/0 to-[#7a4df8]/0 opacity-0 transition-opacity duration-500 group-hover:via-[#7a4df8]/[0.08] group-hover:opacity-100" />

      {/* Top-left tick chrome */}
      <div className="pointer-events-none absolute top-2 left-2 h-2 w-2">
        <div className="absolute top-0 left-0 h-px w-full bg-[#7a4df8]/40" />
        <div className="absolute top-0 left-0 h-full w-px bg-[#7a4df8]/40" />
      </div>
      {/* Bottom-right tick chrome */}
      <div className="pointer-events-none absolute right-2 bottom-2 h-2 w-2">
        <div className="absolute right-0 bottom-0 h-px w-full bg-[#7a4df8]/40" />
        <div className="absolute right-0 bottom-0 h-full w-px bg-[#7a4df8]/40" />
      </div>

      <div className="relative flex flex-col gap-1">
        <div className="font-mono text-[10px] tracking-[0.18em] text-[#7a4df8]/80 uppercase">
          {label}
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded bg-[#7a4df8]/10" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={String(value)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-3xl font-semibold tracking-tight text-white"
              >
                {value ?? '—'}
              </motion.div>
            </AnimatePresence>
          )}
          {subtitle && <div className="text-xs text-white/50">{subtitle}</div>}
        </div>
      </div>

      {/* Sparkline bottom-right (if data provided) */}
      {sparkline && sparkline.length > 1 && (
        <div className="pointer-events-none absolute right-4 bottom-3 opacity-90">
          <QCSparkline data={sparkline} width={70} height={22} />
        </div>
      )}

      {/* Pulsing dot on hover */}
      <div className="pointer-events-none absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-[#7a4df8] opacity-0 transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-100" />
    </motion.div>
  );
}
