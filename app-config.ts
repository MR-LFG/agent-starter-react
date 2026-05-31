export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

// Q Dashboard — Quantum Club AIOS voice surface.
// Brand palette locked 2026-05-07: dark base + vivid violet (`#7a4df8`).
export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Quantum Club',
  pageTitle: 'Q — Quantum Club AIOS',
  pageDescription: 'Voice-driven business intelligence for Quantum Club',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/q-logo.png',
  logoDark: '/q-logo.png',
  accent: '#7a4df8',          // QC vivid violet
  accentDark: '#7a4df8',      // same — dark-only theme
  startButtonText: 'Wake Q',

  // Radial visualizer doubles as the "brain" centerpiece — pulses with Q's
  // audio output level. Many bars + medium radius gives the synaptic feel.
  audioVisualizerType: 'radial',
  audioVisualizerColor: '#7a4df8',
  audioVisualizerColorDark: '#7a4df8',
  audioVisualizerColorShift: 0.4,
  audioVisualizerRadialBarCount: 96,
  audioVisualizerRadialRadius: 140,

  // Dispatch the Q agent worker registered on LiveKit Cloud as `my-agent`.
  agentName: process.env.AGENT_NAME ?? 'my-agent',

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
