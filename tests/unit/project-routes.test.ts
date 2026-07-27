import { NextRequest } from 'next/server';

import { GET as getProjects, POST as createProject } from '@/app/api/projects/route';
import { POST as createConversation } from '@/app/api/projects/[projectId]/conversations/route';

const apiBaseUrl = 'https://api.example.test';
const sessionCookieName = 'langflow_rag_session';
const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const project = { id: projectId, name: 'Base de conhecimento', slug: 'base-de-conhecimento' };
const conversation = {
  createdAt: '2026-07-27T10:00:00.000Z',
  createdByUserId: 'user-1',
  id: conversationId,
  modelId: 'openai/gpt-4.1-mini',
  projectId,
  title: 'Dúvidas iniciais',
  updatedAt: '2026-07-27T10:00:00.000Z',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

function request(path: string, method: 'GET' | 'POST', body?: unknown, cookie = true): NextRequest {
  return new NextRequest(`https://app.example.test${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(cookie ? { cookie: `${sessionCookieName}=session-token` } : {}),
    },
    method,
  });
}

describe('project BFF routes', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', apiBaseUrl);
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
    vi.stubEnv('SESSION_COOKIE_NAME', sessionCookieName);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns 401 without calling the backend when the project-list request has no session cookie', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await getProjects(request('/api/projects', 'GET', undefined, false));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Sessão não encontrada.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('validates project name and slug before creating a project', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await createProject(request('/api/projects', 'POST', { name: '', slug: '' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Dados do projeto inválidos.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns the validated project created by the backend', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(project, 201));
    vi.stubGlobal('fetch', fetcher);

    const response = await createProject(request('/api/projects', 'POST', { name: project.name, slug: project.slug }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ project });
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/projects`,
      expect.objectContaining({
        body: JSON.stringify({ name: project.name, slug: project.slug }),
        headers: expect.objectContaining({ authorization: 'Bearer session-token' }),
        method: 'POST',
      }),
    );
  });

  it('rejects a non-UUID project id before calling the external conversation endpoint', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await createConversation(
      request('/api/projects/not-a-uuid/conversations', 'POST', { modelId: 'openai/gpt-4.1-mini', title: conversation.title }),
      { params: Promise.resolve({ projectId: 'not-a-uuid' }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Projeto inválido.' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('creates a conversation with its selected title and model', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(conversation, 201));
    vi.stubGlobal('fetch', fetcher);

    const response = await createConversation(
      request(`/api/projects/${projectId}/conversations`, 'POST', {
        modelId: conversation.modelId,
        title: conversation.title,
      }),
      { params: Promise.resolve({ projectId }) },
    );

    await expect(response.json()).resolves.toEqual({ conversation });
    expect(fetcher).toHaveBeenCalledWith(
      `${apiBaseUrl}/projects/${projectId}/conversations`,
      expect.objectContaining({ body: JSON.stringify({ modelId: conversation.modelId, title: conversation.title }), method: 'POST' }),
    );
  });

  it('rejects a model outside the frontend allowlist before calling the backend', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);

    const response = await createConversation(
      request(`/api/projects/${projectId}/conversations`, 'POST', {
        modelId: 'openai/gpt-4.1',
        title: conversation.title,
      }),
      { params: Promise.resolve({ projectId }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Dados da conversa inválidos.' });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
