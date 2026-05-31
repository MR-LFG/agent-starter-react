'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import { type QCArm, QCArmTabs } from '@/components/app/qc-arm-tabs';
import { QCMicToggle } from '@/components/app/qc-mic-toggle';
import { QCStatusPill } from '@/components/app/qc-status-pill';
import { QCTile } from '@/components/app/qc-tile';
import { QCTileDetailModal } from '@/components/app/qc-tile-detail-modal';
import { Button } from '@/components/ui/button';
import { type TileData, useTileData } from '@/hooks/useTileData';
import { cn } from '@/lib/shadcn/utils';

// All Three.js + SVG-trig components are client-only (WebGL / hydration safety).
const QCStarfield = dynamic(
  () => import('@/components/app/qc-starfield').then((m) => m.QCStarfield),
  { ssr: false }
);
const QCBrain3D = dynamic(() => import('@/components/app/qc-brain-3d').then((m) => m.QCBrain3D), {
  ssr: false,
  loading: () => <div className="h-[450px] w-[450px]" />,
});
const QCJarvisBubble = dynamic(
  () => import('@/components/app/qc-jarvis-bubble').then((m) => m.QCJarvisBubble),
  { ssr: false }
);
const QCHudChrome = dynamic(
  () => import('@/components/app/qc-hud-chrome').then((m) => m.QCHudChrome),
  { ssr: false }
);
const QCTranscriptPanel = dynamic(
  () => import('@/components/app/qc-transcript-panel').then((m) => m.QCTranscriptPanel),
  { ssr: false }
);
const QCActionLog = dynamic(
  () => import('@/components/app/qc-action-log').then((m) => m.QCActionLog),
  { ssr: false }
);
const QCCommandHelp = dynamic(
  () => import('@/components/app/qc-command-help').then((m) => m.QCCommandHelp),
  { ssr: false }
);

interface QCDashboardProps {
  appConfig: AppConfig;
}

/**
 * The Q Dashboard — Quantum Club AIOS HUD.
 *
 * Layered z-stack:
 *   0   <QCStarfield/>   full-viewport star + nebula 3D backdrop
 *   1   <main/>          tile grid + 3D brain centerpiece + Wake/End controls
 *   10  <QCHudChrome/>   corner brackets + scan line + edge ticks (decorative)
 *   30  <QCJarvisBubble/> bottom-right Jarvis ring (audio-reactive)
 */
export function QCDashboard({ appConfig }: QCDashboardProps) {
  const { isConnected, start } = useSessionContext();
  const { data: tileData } = useTileData(60_000);
  const [activeTile, setActiveTile] = useState<TileData | null>(null);
  const [arm, setArm] = useState<QCArm>('all');

  // Map API response → display order around the brain.
  // Layout: tabs → top row (3) → brain → bottom row (3) → wide row (Top3 + QC26).
  // Revenue (last 7d new) replaces MRR on the front face for privacy.
  const t = tileData;
  const placeholder = (label: string): TileData => ({
    label,
    value: '—',
    subtitle: 'loading',
    status: 'loading',
  });
  const tiles = {
    revenue: t?.revenue ?? placeholder('Revenue (7d)'),
    leads: t?.leads ?? placeholder('New Leads'),
    calls: t?.calls ?? placeholder('Calls Today'),
    inbox: t?.inbox ?? placeholder('Inbox'),
    circle: t?.circle ?? placeholder('Circle'),
    systems: t?.systems ?? placeholder('Systems'),
    priorities: t?.priorities ?? placeholder('Top 3 Today'),
    qc26: t?.qc26 ?? placeholder('QC26 Bali'),
  };
  const isLoading = !tileData;

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#050309] text-white">
      {/* Z-0 ── full-viewport star field + nebula */}
      <QCStarfield />

      {/* Subtle background grid texture (above stars, below content) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Z-5 ── HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-[5] flex items-center justify-between px-6 py-4 md:px-10 md:py-6"
      >
        <div className="flex items-center gap-3">
          {appConfig.logo && (
            <Image
              src={appConfig.logo}
              alt={appConfig.companyName}
              width={28}
              height={28}
              className="opacity-90"
            />
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-white">Q</span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
              Quantum Club AIOS
            </span>
          </div>
        </div>
        <QCStatusPill isConnected={isConnected} />
      </motion.header>

      {/* Z-5 ── ARM TABS (visual scaffolding for v1; filter logic incremental) */}
      <div className="relative z-[5] mb-3 flex justify-center px-6">
        <QCArmTabs active={arm} onChange={setArm} />
      </div>

      {/* Z-5 ── MAIN GRID */}
      <main className="relative z-[5] mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 px-6 pb-32 md:grid-cols-3 md:gap-6 md:px-10">
        {/* Top row — Revenue / Leads / Calls (staggered entrance, clickable for drill-down) */}
        <QCTile
          {...tiles.revenue}
          loading={isLoading}
          index={0}
          onClick={() => setActiveTile(tiles.revenue)}
        />
        <QCTile
          {...tiles.leads}
          loading={isLoading}
          index={1}
          onClick={() => setActiveTile(tiles.leads)}
        />
        <QCTile
          {...tiles.calls}
          loading={isLoading}
          index={2}
          onClick={() => setActiveTile(tiles.calls)}
        />

        {/* Centre brain — full width, spans all 3 cols */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center py-6 md:col-span-3 md:py-10"
        >
          <QCBrain3D />

          {/* Wake / End controls */}
          <div className="mt-4 flex items-center gap-3">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={() => start()}
                className={cn(
                  'group relative w-56 overflow-hidden rounded-full bg-[#7a4df8] font-mono text-xs font-bold tracking-[0.2em] text-white uppercase',
                  'shadow-[0_0_30px_rgba(122,77,248,0.4)]',
                  'hover:bg-[#6b3df0] hover:shadow-[0_0_60px_rgba(122,77,248,0.7)]',
                  'transition-all duration-300'
                )}
              >
                {/* Inner shimmer */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {appConfig.startButtonText}
              </Button>
            ) : (
              <>
                <QCMicToggle />
                <AgentDisconnectButton
                  size="lg"
                  variant="outline"
                  className={cn(
                    'rounded-full font-mono text-xs font-bold tracking-[0.2em] uppercase',
                    'border-red-500/40 bg-red-500/10 text-red-100',
                    'hover:border-red-500 hover:bg-red-500/20 hover:text-white'
                  )}
                >
                  <span>End Call</span>
                </AgentDisconnectButton>
              </>
            )}
          </div>
        </motion.div>

        {/* Bottom row 1 — Inbox / Circle / Systems */}
        <QCTile
          {...tiles.inbox}
          loading={isLoading}
          index={3}
          onClick={() => setActiveTile(tiles.inbox)}
        />
        <QCTile
          {...tiles.circle}
          loading={isLoading}
          index={4}
          onClick={() => setActiveTile(tiles.circle)}
        />
        <QCTile
          {...tiles.systems}
          loading={isLoading}
          index={5}
          onClick={() => setActiveTile(tiles.systems)}
        />

        {/* Bottom row 2 — Top 3 priorities (wide, span 2) + QC26 (col-span 1) */}
        <QCTile
          {...tiles.priorities}
          loading={isLoading}
          index={6}
          onClick={() => setActiveTile(tiles.priorities)}
          className="md:col-span-2"
        />
        <QCTile
          {...tiles.qc26}
          loading={isLoading}
          index={7}
          onClick={() => setActiveTile(tiles.qc26)}
        />
      </main>

      {/* Z-10 ── HUD chrome (corner brackets, scan line, edge ticks, vignette) */}
      <QCHudChrome />

      {/* Z-20 ── Live transcript (center bottom, only when connected) */}
      <QCTranscriptPanel />

      {/* Z-20 ── Action log (bottom-left, only when there are actions) */}
      <QCActionLog />

      {/* Z-30 ── JARVIS bubble bottom-right */}
      <QCJarvisBubble />

      {/* Z-30 ── Voice command discovery overlay (toggle with "?") */}
      <QCCommandHelp />

      {/* Z-40 ── Tile detail modal */}
      <QCTileDetailModal tile={activeTile} onClose={() => setActiveTile(null)} />
    </div>
  );
}
