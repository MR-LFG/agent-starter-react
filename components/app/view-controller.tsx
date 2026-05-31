'use client';

import type { AppConfig } from '@/app-config';
import { QCDashboard } from '@/components/app/qc-dashboard';

interface ViewControllerProps {
  appConfig: AppConfig;
}

/**
 * The QC dashboard replaces the starter's WelcomeView/AgentSessionView swap.
 * Always-visible HUD, with the brain centerpiece + tiles + speech bubble.
 * Connection state is handled internally by QCDashboard via useSessionContext.
 */
export function ViewController({ appConfig }: ViewControllerProps) {
  return <QCDashboard appConfig={appConfig} />;
}
