import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { readSessionToken } from '@/lib/session';

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

  return children;
}
