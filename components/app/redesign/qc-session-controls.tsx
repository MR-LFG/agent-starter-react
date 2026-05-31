'use client';

import { motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import { QCMicToggle } from '@/components/app/qc-mic-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';

const PURPLE_BRIGHT = '#b89dff';

/**
 * Session controls — Wake Q button (when disconnected),
 * mic + end-call buttons (when connected).
 *
 * Positioned below the centerpiece. The Wake Q button has a custom
 * Jarvis treatment: stark monospace, glow pulse, animated border shimmer.
 */
export function QCSessionControls({ startButtonText }: { startButtonText: string }) {
  const { isConnected, start } = useSessionContext();

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
        className="relative"
      >
        <Button
          size="lg"
          onClick={() => start()}
          className={cn(
            'group relative h-12 w-64 overflow-hidden rounded-sm border bg-transparent font-mono text-xs font-bold tracking-[0.3em] text-white uppercase',
            'border-[#7a4df8]/60 hover:border-[#b89dff]',
            'shadow-[0_0_28px_rgba(122,77,248,0.35)] hover:shadow-[0_0_48px_rgba(184,157,255,0.55)]',
            'transition-all duration-300'
          )}
        >
          {/* Animated shimmer running along the top edge */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${PURPLE_BRIGHT} 50%, transparent 100%)`,
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner glow that pulses */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(122,77,248,0.2) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="relative z-10">{startButtonText}</span>
        </Button>

        {/* Sub-label */}
        <div className="mt-2 text-center font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">
          or say · good morning q
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-3"
    >
      <QCMicToggle />
      <AgentDisconnectButton
        size="lg"
        variant="outline"
        className={cn(
          'rounded-sm font-mono text-xs font-bold tracking-[0.3em] uppercase',
          'border-red-500/40 bg-red-500/10 text-red-100',
          'hover:border-red-500 hover:bg-red-500/20 hover:text-white',
          'transition-all duration-200'
        )}
      >
        <span>End Call</span>
      </AgentDisconnectButton>
    </motion.div>
  );
}
