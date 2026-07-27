import AppShell from '@/components/layout/app-shell';
import ProjectSidebar from '@/components/layout/project-sidebar';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function ProtectedApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await readSessionToken();

  if (token === undefined) {
    return children;
  }

  const projects = await createBackendClient(fetch).getProjects(token);

  return <AppShell sidebar={<ProjectSidebar projects={projects} />}>{children}</AppShell>;
}
