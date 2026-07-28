import { type NextRequest, NextResponse } from 'next/server';

import { setSessionCookie } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?google=error', request.url));

  try {
    const authentication = await createBackendClient(fetch).exchangeGoogleLogin(code);
    const response = NextResponse.redirect(new URL('/projects', request.url));
    setSessionCookie(response, authentication.token);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?google=error', request.url));
  }
}
