'use client';

import { memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTabVisible } from './lib/use-visibility';
import { QCCenterpieceOverlay } from './qc-centerpiece-overlay';
import { Globe } from './scene-globe';
import { OrbitalRings } from './scene-orbital-rings';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';

/**
 * The Q centerpiece — one Canvas, two layered systems:
 *   • Wireframe globe with pulsing client pins
 *   • Concentric orbital rings (different radii, inclinations, speeds)
 *
 * Single Canvas = single WebGL context + depth-coordinated rendering.
 *
 * Perf: frameloop toggles to 'never' when the tab is hidden, fully pausing
 * the R3F render loop instead of wasting GPU cycles on a backgrounded tab.
 */
function QCCenterpieceInner() {
  const visible = useTabVisible();

  return (
    <div className="relative size-[640px]">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} color={PURPLE} intensity={1.8} />
        <pointLight position={[-4, -2, 2]} color={PURPLE_BRIGHT} intensity={0.8} />

        <OrbitalRings />
        <Globe />
      </Canvas>

      {/* 2D HUD overlay — corner brackets, reticle, cardinal markers */}
      <QCCenterpieceOverlay />
    </div>
  );
}

// Memoized — centerpiece takes no props and only depends on its own
// internal visibility hook, so it never needs to re-render due to parent state.
export const QCCenterpiece = memo(QCCenterpieceInner);
