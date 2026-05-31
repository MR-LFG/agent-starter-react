// Mock telemetry events for the v1 data streams.
// Replaced in a later move when we wire to real Stripe / GHL / Circle / etc.

export interface TelemetryEvent {
  channel: string;
  message: string;
}

export const MOCK_EVENTS: TelemetryEvent[] = [
  { channel: 'STRIPE', message: 'charge $250 · pro trader renewal' },
  { channel: 'STRIPE', message: 'mrr +$80 net' },
  { channel: 'STRIPE', message: 'sub canceled · downgrade signal' },
  { channel: 'GHL', message: 'lead · sarah mitchell · viewed pricing' },
  { channel: 'GHL', message: 'stage advanced · proposal → won' },
  { channel: 'GHL', message: 'pipeline · 3 new leads overnight' },
  { channel: 'CIRCLE', message: 'qt community · 2 new posts' },
  { channel: 'CIRCLE', message: 'longevity space · new comment' },
  { channel: 'CALENDAR', message: 'brendan · moved 1500 → 1530' },
  { channel: 'CALENDAR', message: 'today · 3 sessions · all confirmed' },
  { channel: 'GMAIL', message: '2 unread · marketing@' },
  { channel: 'GMAIL', message: 'inbox · cleared 14 emails' },
  { channel: 'FIREFLIES', message: 'meeting · ben theobald · 45m' },
  { channel: 'FIREFLIES', message: 'transcript ready · qt webinar' },
  { channel: 'INSTANTLY', message: 'reply · interested · 2 leads' },
  { channel: 'INSTANTLY', message: 'campaign sent · 38 deliveries' },
  { channel: 'AIRTABLE', message: 'proposal stage updated' },
  { channel: 'AIRTABLE', message: 'sales call · logged' },
  { channel: 'SYSTEMS', message: 'n8n · qt-recordings-001 ok' },
  { channel: 'SYSTEMS', message: 'make · daily brief · ok' },
  { channel: 'SYSTEMS', message: 'tailscale · vps reachable' },
  { channel: 'BRIEFING', message: 'morning brief queued · 0700 awst' },
  { channel: 'BRIEFING', message: 'overnight summary · 3 events' },
  { channel: 'QT', message: 'pro trader · 14 active subs' },
  { channel: 'QC26', message: 'bali retreat · 11 confirmed' },
];

export function randomEvent(): TelemetryEvent {
  return MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
}

export function timestamp(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}
