import { redirect } from 'next/navigation';

import { readSessionToken } from '@/lib/session';

export default async function Home() {
  const token = await readSessionToken();

  redirect(token === undefined ? '/login' : '/projects');

  return null;
}
