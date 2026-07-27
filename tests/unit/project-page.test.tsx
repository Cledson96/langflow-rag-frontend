import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getConversations, readSessionToken, redirect } = vi.hoisted(() => ({
  getConversations: vi.fn(),
  readSessionToken: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect,
}));

vi.mock('@/lib/session', () => ({ readSessionToken }));
vi.mock('@/services/backend-client', () => ({
  createBackendClient: vi.fn(() => ({ getConversations })),
}));

import ProjectPage from '@/app/(protected)/(application)/projects/[projectId]/page';

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';

describe('ProjectPage', () => {
  beforeEach(() => {
    getConversations.mockReset();
    readSessionToken.mockReset();
    redirect.mockReset();
    readSessionToken.mockResolvedValue('session-token');
  });

  it('redirects to the first existing conversation', async () => {
    getConversations.mockResolvedValue([
      { id: conversationId },
      { id: 'bc76d767-a620-469b-9bd6-9d19060724f8' },
    ]);

    await ProjectPage({ params: Promise.resolve({ projectId }) });

    expect(redirect).toHaveBeenCalledWith(`/projects/${projectId}/conversations/${conversationId}`);
  });
});
