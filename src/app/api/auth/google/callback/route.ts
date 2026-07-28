import { type NextRequest, NextResponse } from 'next/server';

import { parseEnv } from '@/config/env';
import { setSessionCookie } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = parseEnv(process.env).appUrl;
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?google=error', appUrl));

  try {
    const authentication = await createBackendClient(fetch).exchangeGoogleLogin(code);
    const response = NextResponse.redirect(new URL('/projects', appUrl));
    setSessionCookie(response, authentication.token);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?google=error', appUrl));
  }
}
