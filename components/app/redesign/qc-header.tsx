'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';

/**
 * Dashboard header — Enhancement H (animated QC sigil) + live clock.
 *
 * Three zones:
 *   left   — Q sigil (rotating wireframe ring) + lockup
 *   center — live time + quantified day-of-year
 *   right  — connection status pill
 */
export function QCHeader() {
  const { isConnected } = useSessionContext();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-[5] flex items-center justify-between px-6 py-4 md:px-10 md:py-6"
    >
      {/* LEFT — sigil + lockup */}
      <div className="flex items-center gap-3">
        <QCSigil />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-white">Q</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#7a4df8]/70 uppercase">
            Quantum Club AIOS · Redesign
          </span>
        </div>
      </div>

      {/* CENTER — live clock */}
      <LiveClock />

      {/* RIGHT — connection status pill */}
      <div className="flex items-center gap-2 rounded-full border border-[#7a4df8]/30 bg-[#7a4df8]/[0.06] px-4 py-1.5 backdrop-blur-sm">
        <span
          className={`size-1.5 rounded-full ${isConnected ? 'bg-[#7a4df8]' : 'bg-white/30'}`}
          style={isConnected ? { boxShadow: `0 0 12px ${PURPLE}cc` } : undefined}
        />
        <span className="font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase">
          {isConnected ? 'Session live' : 'Standby'}
        </span>
      </div>
    </motion.header>
  );
}

/**
 * The QC sigil — a rotating wireframe ring around a "Q" mark.
 * Three concentric arc segments at different angles + speeds.
 */
function QCSigil() {
  return (
    <div className="relative size-9">
      {/* Center Q glyph */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-mono text-[15px] leading-none font-bold text-white"
          style={{ textShadow: `0 0 6px ${PURPLE}` }}
        >
          Q
        </span>
      </div>

      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `${PURPLE}55` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {/* Three segment markers around the ring */}
        <div
          className="absolute -top-px left-1/2 size-1 -translate-x-1/2 rounded-full"
          style={{ background: PURPLE_BRIGHT, boxShadow: `0 0 6px ${PURPLE_BRIGHT}` }}
        />
      </motion.div>

      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute inset-1 rounded-full border"
        style={{ borderColor: `${PURPLE}33` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute -bottom-px left-1/2 size-0.5 -translate-x-1/2 rounded-full"
          style={{ background: PURPLE_BRIGHT }}
        />
      </motion.div>
    </div>
  );
}

/**
 * Live clock — Perth time (AWST), seconds, day of year.
 * Updates every second.
 */
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // Reserve space during SSR — avoid layout shift on hydration
    return <div aria-hidden className="hidden md:block" style={{ width: 240, height: 32 }} />;
  }

  // AWST = UTC+8, no DST
  const awst = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60_000);
  const hh = String(awst.getHours()).padStart(2, '0');
  const mm = String(awst.getMinutes()).padStart(2, '0');
  const ss = String(awst.getSeconds()).padStart(2, '0');

  const start = Date.UTC(awst.getUTCFullYear(), 0, 0);
  const diff = awst.getTime() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div className="hidden flex-col items-center gap-0.5 md:flex">
      <div className="flex items-center gap-1 font-mono text-sm font-bold text-white tabular-nums">
        <span>{hh}</span>
        <span className="text-[#7a4df8] opacity-60">:</span>
        <span>{mm}</span>
        <span className="text-[#7a4df8] opacity-40">:</span>
        <span className="text-white/70">{ss}</span>
        <span className="ml-2 text-[10px] font-normal tracking-[0.3em] text-white/40 uppercase">
          AWST
        </span>
      </div>
      <div className="font-mono text-[9px] tracking-[0.4em] text-white/30 uppercase">
        Day {dayOfYear} of {awst.getFullYear()}
      </div>
    </div>
  );
}
