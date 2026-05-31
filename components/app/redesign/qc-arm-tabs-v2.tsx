'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

export type QCArmV2 = 'all' | 'trading' | 'longevity' | 'consulting' | 'side';

const ARMS: { id: QCArmV2; label: string; sub: string }[] = [
  { id: 'all', label: 'All', sub: 'ARM' },
  { id: 'trading', label: 'Trading', sub: 'QT' },
  { id: 'longevity', label: 'Longevity', sub: 'QL' },
  { id: 'consulting', label: 'Consulting', sub: 'QC' },
  { id: 'side', label: 'Side', sub: 'PROJ' },
];

/**
 * Arm filter tabs — Enhancement F (partial — visual tabs only,
 * HUD-wide tonal shift deferred until colour token refactor).
 *
 * Sits below the header, above the centerpiece row.
 */
export function QCArmTabsV2({
  active,
  onChange,
}: {
  active: QCArmV2;
  onChange: (a: QCArmV2) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      className="relative z-[5] flex justify-center px-6"
    >
      <div className="inline-flex items-center gap-1 rounded-sm border border-[#7a4df8]/20 bg-[#0a0512]/40 p-1 backdrop-blur-sm">
        {ARMS.map((arm) => {
          const isActive = arm.id === active;
          return (
            <button
              key={arm.id}
              type="button"
              onClick={() => onChange(arm.id)}
              className={cn(
                'relative flex items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors',
                isActive
                  ? 'bg-[#7a4df8]/20 text-white'
                  : 'text-white/45 hover:bg-[#7a4df8]/10 hover:text-white/75'
              )}
              style={isActive ? { boxShadow: 'inset 0 0 16px rgba(122,77,248,0.3)' } : undefined}
            >
              <span>{arm.label}</span>
              <span className="text-[8px] tracking-[0.3em] text-white/35">{arm.sub}</span>
              {isActive && (
                <motion.span
                  layoutId="arm-tab-indicator"
                  className="absolute inset-x-2 -bottom-px h-px"
                  style={{ background: '#b89dff', boxShadow: '0 0 6px #b89dff' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
