import { redirect } from 'next/navigation';

import MemorySettingsClient from './memory-settings-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function MemorySettingsPage() {
  const token = await readSessionToken();
  if (!token) redirect('/login');

  const client = createBackendClient(fetch);
  const [soul, user, projects, userMemories] = await Promise.all([
    client.getAgentSoul(token),
    client.getMe(token),
    client.getProjects(token),
    client.getUserMemories(token),
  ]);
  const projectMemories = await Promise.all(
    projects.map(async (project) => ({
      memories: await client.getProjectMemories(token, project.id),
      project,
    })),
  );

  return (
    <MemorySettingsClient
      initialProjectMemories={projectMemories}
      initialSoul={soul}
      initialUserMemories={userMemories}
      user={user}
    />
  );
}
