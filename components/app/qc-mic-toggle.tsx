'use client';

import { useEffect, useState } from 'react';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { useLocalParticipant } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

/**
 * Mute toggle for the user's microphone. Mutes/unmutes the local participant
 * via the LiveKit SDK. Click to toggle. Keyboard shortcut: 'M'.
 *
 * Visual:
 *   - Enabled  → purple mic icon, faint glow
 *   - Disabled → red mic-off icon, "MUTED" pill
 */
export function QCMicToggle() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [busy, setBusy] = useState(false);

  const toggleMic = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled);
    } finally {
      setBusy(false);
    }
  };

  // Keyboard shortcut: 'M' toggles mute (ignores when typing in inputs)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMicrophoneEnabled, busy, localParticipant]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      type="button"
      onClick={toggleMic}
      disabled={busy}
      aria-pressed={!isMicrophoneEnabled}
      title={isMicrophoneEnabled ? 'Mute mic (M)' : 'Unmute mic (M)'}
      className={cn(
        'group relative inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-all',
        isMicrophoneEnabled
          ? 'border-[#7a4df8]/40 bg-[#7a4df8]/10 text-white hover:border-[#7a4df8] hover:bg-[#7a4df8]/20 hover:shadow-[0_0_30px_rgba(122,77,248,0.4)]'
          : 'border-red-500/60 bg-red-500/20 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500/30'
      )}
    >
      {isMicrophoneEnabled ? (
        <>
          <MicIcon className="size-4" />
          <span>Mic on</span>
        </>
      ) : (
        <>
          <MicOffIcon className="size-4" />
          <span>Muted</span>
        </>
      )}
    </button>
  );
}
