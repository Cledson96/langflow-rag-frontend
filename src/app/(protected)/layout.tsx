import { redirect } from 'next/navigation';

import AppShell from '@/components/layout/app-shell';
import { readSessionToken } from '@/lib/session';

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await readSessionToken();

  if (token === undefined) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
