import AppShell from '@/components/layout/app-shell';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function ProtectedApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await readSessionToken();

  if (token === undefined) {
    return children;
  }

  const client = createBackendClient(fetch);
  const [projects, user] = await Promise.all([client.getProjects(token), client.getMe(token)]);

  return <AppShell projects={projects} user={user}>{children}</AppShell>;
}
