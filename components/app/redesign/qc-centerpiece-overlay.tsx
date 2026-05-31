'use client';

import { motion } from 'motion/react';

const PURPLE = '#7a4df8';
const PURPLE_BRIGHT = '#b89dff';

/**
 * 2D HUD overlay drawn on top of the WebGL centerpiece.
 * Corner brackets, reticle, cardinal markers, status text — pure SVG/CSS, no GPU cost.
 *
 * The 3D rings rotate and the globe spins. This overlay stays fixed,
 * giving the eye a stable HUD frame to anchor on.
 */
export function QCCenterpieceOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Four corner brackets framing the centerpiece */}
      <Bracket position="top-left" />
      <Bracket position="top-right" />
      <Bracket position="bottom-left" />
      <Bracket position="bottom-right" />

      {/* Center reticle — fine crosshair */}
      <Reticle />

      {/* Cardinal markers — N / E / S / W on the centerpiece edges */}
      <CardinalMarkers />

      {/* Status footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.4em] text-white/35 uppercase"
      >
        <span>ALL SYSTEMS</span>
        <span className="mx-2 text-[#b89dff]">·</span>
        <span>NOMINAL</span>
      </motion.div>
    </div>
  );
}

function Bracket({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const SIZE = 24;
  const T = 1; // line thickness

  const corner = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position];

  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      className={`absolute ${corner}`}
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Horizontal stub */}
      <div
        className="absolute"
        style={{
          [isTop ? 'top' : 'bottom']: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: SIZE,
          height: T,
          background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, ${PURPLE_BRIGHT} 0%, ${PURPLE_BRIGHT}99 50%, transparent 100%)`,
        }}
      />
      {/* Vertical stub */}
      <div
        className="absolute"
        style={{
          [isTop ? 'top' : 'bottom']: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: T,
          height: SIZE,
          background: `linear-gradient(${isTop ? '180deg' : '0deg'}, ${PURPLE_BRIGHT} 0%, ${PURPLE_BRIGHT}99 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
}

function Reticle() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative"
        style={{ width: 36, height: 36 }}
      >
        {/* Horizontal crosshair */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2"
          style={{ width: 14, height: 1, background: PURPLE_BRIGHT }}
        />
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2"
          style={{ width: 14, height: 1, background: PURPLE_BRIGHT }}
        />
        {/* Vertical crosshair */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{ width: 1, height: 14, background: PURPLE_BRIGHT }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ width: 1, height: 14, background: PURPLE_BRIGHT }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: PURPLE_BRIGHT, boxShadow: `0 0 6px ${PURPLE_BRIGHT}` }}
        />
      </motion.div>
    </div>
  );
}

function CardinalMarkers() {
  // Distance from center where cardinal markers sit (px) — just outside the globe but inside the rings
  const R = 230;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative" style={{ width: 0, height: 0 }}>
        <CardinalLabel label="N" x={0} y={-R} />
        <CardinalLabel label="E" x={R} y={0} />
        <CardinalLabel label="S" x={0} y={R} />
        <CardinalLabel label="W" x={-R} y={0} />
      </div>
    </div>
  );
}

function CardinalLabel({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="absolute font-mono text-[9px] tracking-[0.3em] text-[#b89dff] uppercase"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        textShadow: `0 0 4px ${PURPLE}`,
      }}
    >
      {label}
    </motion.div>
  );
}
