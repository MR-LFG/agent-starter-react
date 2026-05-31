import { headers } from 'next/headers';
import { AppRedesign } from '@/components/app/redesign/app-redesign';
import { getAppConfig } from '@/lib/utils';

export default async function RedesignPage() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <AppRedesign appConfig={appConfig} />;
}
