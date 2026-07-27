import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/projects/[projectId]/conversations/[conversationId]/messages/route';

const apiBaseUrl = 'https://api.example.test';
const sessionCookieName = 'langflow_rag_session';
const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const userMessage = {
  content: 'O que é RAG?',
  conversationId,
  createdAt: '2026-07-27T10:00:00.000Z',
  id: 'a2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: null,
  modelId: null,
  role: 'USER',
};
const assistantMessage = {
  content: 'RAG combina recuperação de contexto com geração.',
  conversationId,
  createdAt: '2026-07-27T10:00:01.000Z',
  id: 'b2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: { source: { displayName: 'README.md' } },
  modelId: 'openai/gpt-4.1-mini',
  role: 'ASSISTANT',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

function request(method: 'GET' | 'POST', body?: unknown): NextRequest {
  return new NextRequest(`https://app.example.test/api/projects/${projectId}/conversations/${conversationId}/messages`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      cookie: `${sessionCookieName}=session-token`,
    },
    method,
  });
}

const context = { params: Promise.resolve({ conversationId, projectId }) };

describe('message BFF route', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', apiBaseUrl);
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
    vi.stubEnv('SESSION_COOKIE_NAME', sessionCookieName);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects blank content before calling the backend', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await POST(request('POST', { content: '   ' }), context);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Mensagem inválida.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects invalid project and conversation UUIDs before calling the backend', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await GET(request('GET'), {
      params: Promise.resolve({ conversationId: 'invalid', projectId: 'also-invalid' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Projeto inválido.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('forwards the session bearer token when loading persisted messages', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([userMessage, assistantMessage]));
    vi.stubGlobal('fetch', fetcher);

    const response = await GET(request('GET'), context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ messages: [userMessage, assistantMessage] });
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/projects/${projectId}/conversations/${conversationId}/messages`,
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: 'Bearer session-token' }),
        method: 'GET',
      }),
    );
  });

  it('forwards content with the session bearer token and returns persisted messages', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ assistantMessage, userMessage }, 201));
    vi.stubGlobal('fetch', fetcher);

    const response = await POST(request('POST', { content: userMessage.content }), context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ assistantMessage, userMessage });
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/projects/${projectId}/conversations/${conversationId}/messages`,
      expect.objectContaining({
        body: JSON.stringify({ content: userMessage.content }),
        headers: expect.objectContaining({ authorization: 'Bearer session-token' }),
        method: 'POST',
      }),
    );
  });
});
