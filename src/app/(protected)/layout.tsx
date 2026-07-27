import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AppShell from '@/components/layout/app-shell';
import ProjectSidebar from '@/components/layout/project-sidebar';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await readSessionToken();

  if (token === undefined) {
    redirect('/login');
  }

  const projects = await createBackendClient(fetch).getProjects(token);

  return <AppShell sidebar={<ProjectSidebar projects={projects} />}>{children}</AppShell>;
}
