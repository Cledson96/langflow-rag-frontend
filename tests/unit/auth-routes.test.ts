import { NextRequest } from 'next/server';

import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as me } from '@/app/api/auth/me/route';
import { POST as register } from '@/app/api/auth/register/route';

const apiBaseUrl = 'https://api.example.test';
const sessionCookieName = 'langflow_rag_session';
const user = { email: 'ada@example.com', id: 'user-1', name: 'Ada', role: 'USER' as const };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

function authRequest(path: string, body: unknown): NextRequest {
  return new NextRequest(`https://app.example.test${path}`, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
}

describe('auth BFF routes', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', apiBaseUrl);
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
    vi.stubEnv('SESSION_COOKIE_NAME', sessionCookieName);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns only the public user and stores the login token in a secure cookie', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ token: 'jwt-secret', user }));
    vi.stubGlobal('fetch', fetcher);

    const response = await login(authRequest('/api/auth/login', { email: user.email, password: 'correct-password' }));

    await expect(response.json()).resolves.toEqual({ user });
    expect(response.headers.get('set-cookie')).toContain(`${sessionCookieName}=jwt-secret`);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
    expect(response.headers.get('set-cookie')).toMatch(/SameSite=Lax/i);
    expect(response.headers.get('set-cookie')).toContain('Path=/');
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/auth/login`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns a safe 401 response when the backend rejects the login', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ detail: 'token leaked by backend' }, 401)));

    const response = await login(authRequest('/api/auth/login', { email: user.email, password: 'wrong-password' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'E-mail ou senha inválidos.' });
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('validates login input before calling the backend', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await login(authRequest('/api/auth/login', { email: 'not-an-email', password: '' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Dados de acesso inválidos.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('registers a user without exposing the returned token', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ token: 'jwt-secret', user })));

    const response = await register(
      authRequest('/api/auth/register', { email: user.email, name: user.name, password: 'correct-password' }),
    );

    await expect(response.json()).resolves.toEqual({ user });
    expect(response.headers.get('set-cookie')).toContain(`${sessionCookieName}=jwt-secret`);
  });

  it('clears the secure session cookie on logout', async () => {
    const response = await logout();

    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toContain(`${sessionCookieName}=`);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('uses the httpOnly session to return the current user', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(user));
    vi.stubGlobal('fetch', fetcher);
    const request = new NextRequest('https://app.example.test/api/auth/me', {
      headers: { cookie: `${sessionCookieName}=jwt-secret` },
    });

    const response = await me(request);

    await expect(response.json()).resolves.toEqual({ user });
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/me`,
      expect.objectContaining({ headers: expect.objectContaining({ authorization: 'Bearer jwt-secret' }) }),
    );
  });
});
