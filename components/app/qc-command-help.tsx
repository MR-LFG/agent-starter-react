'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

const COMMANDS = [
  {
    section: 'Morning rundown',
    items: [
      ['Good morning Q', 'Time-aware greeting + weather + full brief'],
      ['Pull the brief', 'Force the full morning brief'],
      ["What's on my calendar today", "Today's events incl. GHL appointments"],
      ["What's in my inbox", 'Unread Gmail summary'],
    ],
  },
  {
    section: 'Money',
    items: [
      ['How much revenue this week', 'Last 7d new revenue'],
      ["What's the MRR", 'Explicit MRR ask (hidden from front tile)'],
      ['Any new payments overnight', 'Last 24h Stripe charges'],
    ],
  },
  {
    section: 'CRM (GHL)',
    items: [
      ['Lookup John Smith in the CRM', 'GHL contact search'],
      ['Show me anyone tagged qt-applicant', 'GHL filter by tag'],
      ['Add tag X to that contact', 'Update GHL (confirms first)'],
      ['Create a contact for Y', 'Create new GHL contact'],
      ['Send John an SMS through GHL', 'Raw GHL escape hatch'],
    ],
  },
  {
    section: 'Meetings',
    items: [
      ['Pull recent calls with Matt', 'Fireflies full-archive search'],
      ['Summarise that meeting', 'Get summary by transcript ID'],
      ['What did we discuss about Hood Burger', 'Topic search'],
    ],
  },
  {
    section: 'Communication',
    items: [
      ['Draft an email to Sam', 'Gmail draft (no send)'],
      ['Send Shahab a Slack DM', 'Slack send (confirms first)'],
      ['Post to the Pro Trader space', 'Circle publish (confirms first)'],
      ['Reply to that thread', 'Gmail thread reply'],
    ],
  },
  {
    section: 'Drive + Workspace',
    items: [
      ['Find my QC26 attendee list', 'Drive search'],
      ['Create a doc called X', 'Drive doc create'],
      ['Read decisions.md', 'Workspace context lookup'],
      ['What did we decide about Quantum Coaching', 'Decision-log lookup'],
    ],
  },
  {
    section: 'Memory',
    items: [
      ['Remember that X', 'Save persistent memory (survives sessions)'],
      ['What did I say about Y', 'Memory recall'],
    ],
  },
  {
    section: 'Calendar + Web',
    items: [
      ['Block 2pm to 4pm for deep work', 'Calendar create event'],
      ['Look up the EUR/USD rate', 'Web search via Firecrawl'],
      ['Scrape this article and summarise', 'Web scrape'],
    ],
  },
];

/**
 * Voice command discovery overlay. Toggle with the "?" key or the help button
 * top-right. Lists everything Q can do, grouped by capability area.
 */
export function QCCommandHelp() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: "?" toggles help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Toggle button — fixed top-right (just inside the header) */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed top-4 right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#7a4df8]/30 bg-black/50 font-mono text-sm text-[#7a4df8] backdrop-blur-md transition-all hover:border-[#7a4df8]/70 hover:bg-[#7a4df8]/20 md:top-6 md:right-6'
        )}
        title="What can I ask Q? (press ?)"
        aria-label="Show command reference"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative max-h-[85vh] w-[min(94vw,860px)] overflow-y-auto rounded-2xl border p-6',
                'bg-[#0c0716] backdrop-blur-xl',
                'border-[#7a4df8]/40',
                'shadow-[0_0_80px_rgba(122,77,248,0.4)]'
              )}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-white/40 transition-colors hover:text-white"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 5 L15 15 M15 5 L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="mb-1 font-mono text-[10px] tracking-[0.2em] text-[#7a4df8] uppercase">
                Q command reference
              </div>
              <div className="mb-5 text-sm text-white/60">
                Things you can ask Q out loud (35 tools across 10 surfaces). Press{' '}
                <kbd className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                  ?
                </kbd>{' '}
                to toggle.
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {COMMANDS.map((group) => (
                  <div key={group.section}>
                    <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[#7a4df8]/70 uppercase">
                      {group.section}
                    </div>
                    <ul className="space-y-1.5">
                      {group.items.map(([cmd, desc], i) => (
                        <li key={i} className="text-xs">
                          <span className="text-white">&ldquo;{cmd}&rdquo;</span>
                          <span className="ml-2 text-white/40">— {desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#7a4df8]/15 pt-4 text-[11px] text-white/40">
                For write actions (send, post, create, delete), Q drafts first and asks{' '}
                <span className="text-white/70">&ldquo;Send it, save it, or rewrite?&rdquo;</span> —
                only executes on explicit confirmation.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
