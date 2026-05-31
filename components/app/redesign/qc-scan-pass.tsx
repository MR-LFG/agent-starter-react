'use client';

import { memo } from 'react';
import { motion } from 'motion/react';

/**
 * Periodic full-screen scan pass.
 * A faint horizontal sweep that travels top-to-bottom every ~25s.
 *
 * Style flourish that reinforces the "always processing" feel.
 * Behind all content (z-1), above the grid backdrop (z-0).
 */
function QCScanPassInner() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-[1] h-24"
      style={{
        background:
          'linear-gradient(180deg, transparent 0%, rgba(122,77,248,0.06) 35%, rgba(184,157,255,0.10) 50%, rgba(122,77,248,0.06) 65%, transparent 100%)',
      }}
      initial={{ top: '-15%' }}
      animate={{ top: ['-15%', '110%'] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatDelay: 22,
        ease: 'linear',
      }}
    />
  );
}

export const QCScanPass = memo(QCScanPassInner);
