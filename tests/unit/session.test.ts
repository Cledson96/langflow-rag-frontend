import { NextRequest, NextResponse } from 'next/server';

import { clearSessionCookie, readSessionToken, setSessionCookie } from '@/lib/session';

const sessionCookieName = 'langflow_rag_session';

describe('session helpers', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', 'https://api.example.test');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
    vi.stubEnv('SESSION_COOKIE_NAME', sessionCookieName);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the configured session cookie from a request', async () => {
    const request = new NextRequest('https://app.example.test/api/auth/me', {
      headers: { cookie: `${sessionCookieName}=session-token` },
    });

    await expect(readSessionToken(request)).resolves.toBe('session-token');
  });

  it('sets the session as a secure httpOnly cookie', () => {
    const response = NextResponse.json({ user: { id: 'user-1' } });

    setSessionCookie(response, 'session-token');

    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain(`${sessionCookieName}=session-token`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toContain('Path=/');
  });

  it('clears the same session cookie', () => {
    const response = NextResponse.json({ ok: true });

    clearSessionCookie(response);

    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain(`${sessionCookieName}=`);
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toContain('Path=/');
  });
});
