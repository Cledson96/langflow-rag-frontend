import { BackendApiError, createBackendClient, type Fetcher } from '@/services/backend-client';

const apiBaseUrl = 'https://api-langflow.cledson.com.br';
const sessionToken = 'session-token';

function createFetcher(response: Response): Fetcher {
  return vi.fn<Fetcher>().mockResolvedValue(response);
}

describe('createBackendClient', () => {
  it('logs in without sending an authorization header before a session exists', async () => {
    const fetcher = createFetcher(
      new Response(JSON.stringify({ token: 'new-session-token', user: { email: 'ada@example.com', id: 'user-1', name: 'Ada' } }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    );

    await expect(createBackendClient(fetcher, apiBaseUrl).login({ email: 'ada@example.com', password: 'correct-password' })).resolves.toEqual({
      token: 'new-session-token',
      user: { email: 'ada@example.com', id: 'user-1', name: 'Ada' },
    });

    const request = vi.mocked(fetcher).mock.calls[0];
    expect(request).toBeDefined();
    const [, init] = request ?? [];
    expect(init?.headers).not.toHaveProperty('authorization');
  });

  it('sends the bearer token and accepts a valid project list', async () => {
    const fetcher = createFetcher(
      new Response(JSON.stringify([{ id: 'project-1', name: 'Knowledge Base', slug: 'knowledge-base' }]), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    );

    const projects = await createBackendClient(fetcher, apiBaseUrl).getProjects(sessionToken);

    expect(projects).toEqual([{ id: 'project-1', name: 'Knowledge Base', slug: 'knowledge-base' }]);
    expect(fetcher).toHaveBeenCalledOnce();
    const request = vi.mocked(fetcher).mock.calls[0];
    expect(request).toBeDefined();
    const [, init] = request ?? [];
    expect(init?.headers).toMatchObject({
      accept: 'application/json',
      authorization: 'Bearer session-token',
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('rejects a project response that is not JSON', async () => {
    const fetcher = createFetcher(
      new Response('<!doctype html><title>error</title>', {
        headers: { 'content-type': 'text/html' },
        status: 502,
      }),
    );

    await expect(createBackendClient(fetcher, apiBaseUrl).getProjects(sessionToken)).rejects.toBeInstanceOf(BackendApiError);
  });

  it('rejects a project response that does not satisfy the project schema', async () => {
    const fetcher = createFetcher(
      new Response(JSON.stringify([{ id: 'project-1', name: 'Knowledge Base' }]), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    );

    await expect(createBackendClient(fetcher, apiBaseUrl).getProjects(sessionToken)).rejects.toBeInstanceOf(BackendApiError);
  });

  it('rejects an invalid project id before constructing a conversation URL', async () => {
    const fetcher = vi.fn<Fetcher>();

    await expect(
      createBackendClient(fetcher, apiBaseUrl).getConversations(sessionToken, 'not-a-uuid'),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
