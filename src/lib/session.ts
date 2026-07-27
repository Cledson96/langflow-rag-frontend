import 'server-only';

import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { parseEnv } from '@/config/env';

const tokenSchema = z.string().min(1);

function sessionCookieName(): string {
  return parseEnv(process.env).sessionCookieName;
}

const sessionCookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  secure: true,
};

export async function readSessionToken(request?: NextRequest): Promise<string | undefined> {
  if (request !== undefined) {
    return request.cookies.get(sessionCookieName())?.value;
  }

  return (await cookies()).get(sessionCookieName())?.value;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(sessionCookieName(), tokenSchema.parse(token), sessionCookieOptions);
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(sessionCookieName(), '', { ...sessionCookieOptions, maxAge: 0 });
}
