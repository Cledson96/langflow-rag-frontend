import { type NextRequest, NextResponse } from 'next/server';

import { parseEnv } from '@/config/env';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = parseEnv(process.env).appUrl;
  const token = await readSessionToken(request);
  if (!token) return NextResponse.redirect(new URL('/login', appUrl));

  try {
    const url = await createBackendClient(fetch).getGoogleConnectionUrl(token);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL('/settings/integrations?google=error', appUrl));
  }
}
