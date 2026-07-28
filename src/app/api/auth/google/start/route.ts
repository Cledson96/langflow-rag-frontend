import { NextResponse } from 'next/server';

import { createBackendClient } from '@/services/backend-client';

export async function GET(): Promise<NextResponse> {
  try {
    const url = await createBackendClient(fetch).getGoogleLoginUrl();
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL('/login?google=error', process.env.NEXT_PUBLIC_APP_URL));
  }
}
