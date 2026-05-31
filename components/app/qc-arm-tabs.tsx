'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

export type QCArm = 'all' | 'qt' | 'ql' | 'qc' | 'qvg' | 'qc26';

const ARMS: { id: QCArm; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#7a4df8' },
  { id: 'qt', label: 'Traders', color: '#7a4df8' },
  { id: 'ql', label: 'Longevity', color: '#7a4df8' },
  { id: 'qc', label: 'Consulting', color: '#7a4df8' },
  { id: 'qvg', label: 'QVG', color: '#7a4df8' },
  { id: 'qc26', label: 'QC26 Bali', color: '#7a4df8' },
];

interface QCArmTabsProps {
  active: QCArm;
  onChange: (arm: QCArm) => void;
  className?: string;
}

/**
 * Top-of-dashboard tabs for switching between business arms.
 * v1: visual + state only. Tile filtering implemented incrementally
 * (Stripe/GHL/Calendar don't have natural arm partitioning yet — only
 * GHL via tags has the start of arm awareness).
 */
export function QCArmTabs({ active, onChange, className }: QCArmTabsProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-fit items-center gap-1 rounded-full border border-[#7a4df8]/20 bg-black/40 p-1 backdrop-blur-md',
        className
      )}
    >
      {ARMS.map((arm) => {
        const isActive = arm.id === active;
        return (
          <button
            key={arm.id}
            onClick={() => onChange(arm.id)}
            className={cn(
              'relative rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors',
              isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="qc-arm-tab-bg"
                className="absolute inset-0 rounded-full bg-[#7a4df8]/30 shadow-[inset_0_0_0_1px_rgba(122,77,248,0.6)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{arm.label}</span>
          </button>
        );
      })}
    </div>
  );
}
