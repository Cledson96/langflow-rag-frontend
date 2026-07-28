import { redirect } from 'next/navigation';

import ModelsAdminClient from './models-admin-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function ModelsAdminPage() {
  const token = await readSessionToken();
  if (token === undefined) redirect('/login');

  const client = createBackendClient(fetch);
  const user = await client.getMe(token);
  if (user.role !== 'ADMIN') redirect('/projects');

  const models = await client.getAdminModels(token);
  return <ModelsAdminClient initialModels={models} />;
}
