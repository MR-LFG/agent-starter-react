'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';

/**
 * Top-right state callout — shows current Q state at a glance.
 * Per plans/q-dashboard-jarvis-visual-language.md Pillar 2 — the UI telegraphs
 * Q's state without speaking.
 */
export function QCStateCallout() {
  const { state } = useVoiceAssistant();

  const config = stateConfig(state);
  if (!config) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={config.label}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="pointer-events-none absolute top-24 right-6 z-[6] flex items-center gap-2 rounded-sm border border-[#7a4df8]/40 bg-[#7a4df8]/[0.08] px-3 py-1.5 backdrop-blur-sm md:right-10"
        style={{ boxShadow: `0 0 24px ${config.glow}` }}
      >
        {/* Pulse dot */}
        <motion.span
          className="size-1.5 rounded-full"
          style={{ background: '#b89dff' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: config.pulseMs / 1000, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-white uppercase">
          {config.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

function stateConfig(state: string) {
  switch (state) {
    case 'listening':
      return { label: 'Listening', glow: 'rgba(122,77,248,0.35)', pulseMs: 900 };
    case 'thinking':
      return { label: 'Processing', glow: 'rgba(122,77,248,0.55)', pulseMs: 500 };
    case 'speaking':
      return { label: 'Briefing', glow: 'rgba(184,157,255,0.55)', pulseMs: 700 };
    case 'connecting':
    case 'initializing':
      return { label: 'Connecting', glow: 'rgba(122,77,248,0.35)', pulseMs: 500 };
    case 'disconnected':
    case 'idle':
    default:
      return null;
  }
}
