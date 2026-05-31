'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { TileFocusProvider } from '@/components/app/redesign/lib/tile-focus';
import { WakePulseProvider } from '@/components/app/redesign/lib/wake-pulse';
import { QCAmbientUpdates } from '@/components/app/redesign/qc-ambient-updates';
import { QCArmTabsV2, type QCArmV2 } from '@/components/app/redesign/qc-arm-tabs-v2';
import { QCHeader } from '@/components/app/redesign/qc-header';
import { QCScanPass } from '@/components/app/redesign/qc-scan-pass';
import { QCSessionControls } from '@/components/app/redesign/qc-session-controls';
import { QCStateCallout } from '@/components/app/redesign/qc-state-callout';
import { QCTileDetailOverlay } from '@/components/app/redesign/qc-tile-detail-overlay';
import { QCTileV2 } from '@/components/app/redesign/qc-tile-v2';
import { QCTranscriptV2 } from '@/components/app/redesign/qc-transcript-v2';
import { type TileData, useTileData } from '@/hooks/useTileData';

// Centerpiece is client-only (WebGL) — load dynamically to avoid SSR errors
const QCCenterpiece = dynamic(
  () => import('@/components/app/redesign/qc-centerpiece').then((m) => m.QCCenterpiece),
  { ssr: false, loading: () => <div className="size-[640px]" /> }
);
const QCDataStreams = dynamic(
  () => import('@/components/app/redesign/qc-data-streams').then((m) => m.QCDataStreams),
  { ssr: false }
);

interface QCDashboardV2Props {
  appConfig: AppConfig;
}

const placeholder = (label: string): TileData => ({
  label,
  value: '—',
  subtitle: 'loading',
  status: 'loading',
});

/**
 * Q Dashboard V2 — Jarvis HUD redesign.
 *
 * Layout (Iron Man HUD style):
 *   left column (4 tiles) · centerpiece (640px) · right column (4 tiles)
 *
 * Side-by-side prototype at /redesign while the main /dashboard keeps shipping.
 * Built in layered Moves per plans/q-dashboard-jarvis-visual-language.md.
 */
export function QCDashboardV2({ appConfig }: QCDashboardV2Props) {
  const { data: tileData } = useTileData(60_000);
  const isLoading = !tileData;
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [activeArm, setActiveArm] = useState<QCArmV2>('all');

  const t = tileData;
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

  return (
    <WakePulseProvider>
      <TileFocusProvider>
        <div className="relative min-h-svh w-full overflow-hidden bg-[#050309] text-white">
          {/* Faint grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(122,77,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(122,77,248,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Periodic full-screen scan pass — style flourish */}
          <QCScanPass />

          {/* HEADER — QC sigil + live clock + connection pill */}
          <QCHeader />

          {/* Arm filter tabs — below header */}
          <QCArmTabsV2 active={activeArm} onChange={setActiveArm} />

          {/* Ambient telemetry streams on edges (hidden on small screens, behind tiles when both visible) */}
          <QCDataStreams />

          {/* MAIN — tile columns flanking the centerpiece */}
          <div className="relative z-[5] mx-auto flex min-h-[calc(100svh-120px)] w-full max-w-[1320px] items-center justify-center gap-4 px-4 pb-12 md:gap-6 md:px-8">
            {/* LEFT tile column */}
            <div className="hidden w-56 flex-col gap-3 md:flex">
              <QCTileV2
                id="T-01"
                {...tiles.revenue}
                loading={isLoading}
                index={0}
                onClick={() => setSelectedTile(tiles.revenue)}
              />
              <QCTileV2
                id="T-02"
                {...tiles.leads}
                loading={isLoading}
                index={1}
                onClick={() => setSelectedTile(tiles.leads)}
              />
              <QCTileV2
                id="T-03"
                {...tiles.inbox}
                loading={isLoading}
                index={2}
                onClick={() => setSelectedTile(tiles.inbox)}
              />
              <QCTileV2
                id="T-04"
                {...tiles.circle}
                loading={isLoading}
                index={3}
                onClick={() => setSelectedTile(tiles.circle)}
              />
            </div>

            {/* CENTERPIECE column — globe + rings, controls underneath */}
            <div className="flex shrink-0 flex-col items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              >
                <QCCenterpiece />
              </motion.div>

              {/* Session controls — Wake Q / mic + end */}
              <QCSessionControls startButtonText={appConfig.startButtonText} />
            </div>

            {/* RIGHT tile column */}
            <div className="hidden w-56 flex-col gap-3 md:flex">
              <QCTileV2
                id="T-05"
                {...tiles.calls}
                loading={isLoading}
                index={4}
                onClick={() => setSelectedTile(tiles.calls)}
              />
              <QCTileV2
                id="T-06"
                {...tiles.systems}
                loading={isLoading}
                index={5}
                onClick={() => setSelectedTile(tiles.systems)}
              />
              <QCTileV2
                id="T-07"
                {...tiles.priorities}
                loading={isLoading}
                index={6}
                onClick={() => setSelectedTile(tiles.priorities)}
              />
              <QCTileV2
                id="T-08"
                {...tiles.qc26}
                loading={isLoading}
                index={7}
                onClick={() => setSelectedTile(tiles.qc26)}
              />
            </div>
          </div>

          {/* Build status — bottom-left, temporary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-4 left-4 z-[5] font-mono text-[9px] leading-relaxed tracking-wide text-white/25"
          >
            <div className="tracking-[0.3em] text-white/35 uppercase">Q · v2 · redesign</div>
          </motion.div>

          {/* State callout — top-right, shows current Q state */}
          <QCStateCallout />

          {/* Proactive ambient updates — lower-right event ticker */}
          <QCAmbientUpdates />

          {/* Live transcript — bottom center, only when session is active */}
          <QCTranscriptV2 />

          {/* Click-to-drill detail overlay */}
          <QCTileDetailOverlay tile={selectedTile} onClose={() => setSelectedTile(null)} />
        </div>
      </TileFocusProvider>
    </WakePulseProvider>
  );
}
