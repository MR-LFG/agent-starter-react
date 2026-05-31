'use client';

import { useVoiceAssistant } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

const STATE_LABELS: Record<string, string> = {
  disconnected: 'Idle',
  connecting: 'Connecting',
  initializing: 'Initialising',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  idle: 'Idle',
};

const STATE_COLORS: Record<string, string> = {
  disconnected: 'bg-white/30',
  connecting: 'bg-yellow-400 animate-pulse',
  initializing: 'bg-yellow-400 animate-pulse',
  listening: 'bg-[#7a4df8] animate-pulse',
  thinking: 'bg-cyan-400 animate-pulse',
  speaking: 'bg-[#7a4df8] animate-pulse',
  idle: 'bg-white/30',
};

interface QCStatusPillProps {
  isConnected: boolean;
  className?: string;
}

export function QCStatusPill({ isConnected, className }: QCStatusPillProps) {
  const { state } = useVoiceAssistant();
  const effective = isConnected ? state || 'idle' : 'disconnected';
  const label = STATE_LABELS[effective] ?? 'Idle';
  const color = STATE_COLORS[effective] ?? 'bg-white/30';

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm',
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', color)} />
      <span className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase">
        {label}
      </span>
    </div>
  );
}
