import { redirect } from 'next/navigation';

import IntegrationsClient from './integrations-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function IntegrationsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ google?: string }> }>) {
  const token = await readSessionToken();
  if (!token) redirect('/login');

  const [connection, query] = await Promise.all([
    createBackendClient(fetch).getGoogleConnection(token),
    searchParams,
  ]);

  return <IntegrationsClient connection={connection} result={query.google} />;
}
