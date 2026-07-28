import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getConversations, getModels, readSessionToken } = vi.hoisted(() => ({
  getConversations: vi.fn(),
  getModels: vi.fn(),
  readSessionToken: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ readSessionToken }));
vi.mock('@/services/backend-client', () => ({
  createBackendClient: vi.fn(() => ({ getConversations, getModels })),
}));
vi.mock('@/app/(protected)/(application)/projects/[projectId]/project-client', () => ({
  default: ({ conversations }: Readonly<{ conversations: unknown[] }>) => <p>{conversations.length} conversas</p>,
}));

import ProjectPage from '@/app/(protected)/(application)/projects/[projectId]/page';

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';

describe('ProjectPage', () => {
  beforeEach(() => {
    getConversations.mockReset();
    getModels.mockReset();
    readSessionToken.mockReset();
    readSessionToken.mockResolvedValue('session-token');
    getModels.mockResolvedValue([]);
  });

  it('shows the project conversation library instead of forcing a redirect', async () => {
    getConversations.mockResolvedValue([
      { id: conversationId },
      { id: 'bc76d767-a620-469b-9bd6-9d19060724f8' },
    ]);

    render(await ProjectPage({ params: Promise.resolve({ projectId }) }));

    expect(screen.getByText('2 conversas')).toBeVisible();
    expect(getModels).toHaveBeenCalledWith('session-token');
  });
});
