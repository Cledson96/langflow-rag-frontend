import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProjectsClient from '@/app/(protected)/(application)/projects/projects-client';
import CreateConversationModal from '@/app/(protected)/(application)/projects/[projectId]/create-conversation-modal';

const project = {
  id: '94e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  name: 'Base de conhecimento',
  slug: 'base-de-conhecimento',
};
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

describe('ProjectsClient', () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows an empty state when there are no projects', () => {
    render(<ProjectsClient initialProjects={[]} />);

    expect(screen.getByText(/Crie seu primeiro projeto/)).toBeVisible();
  });

  it('opens the project form modal from the create-project action', async () => {
    const user = userEvent.setup();
    render(<ProjectsClient initialProjects={[]} />);

    const openButton = screen.getAllByText('Criar projeto').find((element) => element.closest('button'))?.closest('button');
    expect(openButton).not.toBeNull();
    await user.click(openButton as HTMLButtonElement);

    expect(screen.getByText('Novo projeto', { selector: '.ant-modal-title span' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do projeto')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
  });

  it('renders the project returned by the BFF after creation', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ project }), { headers: { 'content-type': 'application/json' }, status: 200 }),
    );
    render(<ProjectsClient initialProjects={[]} />);

    const openButton = screen.getAllByText('Criar projeto').find((element) => element.closest('button'))?.closest('button');
    expect(openButton).not.toBeNull();
    await user.click(openButton as HTMLButtonElement);
    await user.type(screen.getByLabelText('Nome do projeto'), project.name);
    const createButton = screen.getAllByText('Criar projeto').find((element) => element.closest('.ant-modal'))?.closest('button');
    expect(createButton).not.toBeNull();
    await user.click(createButton as HTMLButtonElement);

    expect((await screen.findByText(project.name)).closest('a')).toHaveAttribute('href', `/projects/${project.id}`);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/projects', {
        body: JSON.stringify({ name: project.name, slug: project.slug }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  it('disables project creation while the request is pending to prevent duplicate submissions', async () => {
    const user = userEvent.setup();
    let resolveRequest: (response: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ProjectsClient initialProjects={[]} />);

    const openButton = screen.getAllByText('Criar projeto').find((element) => element.closest('button'))?.closest('button');
    expect(openButton).not.toBeNull();
    await user.click(openButton as HTMLButtonElement);
    await user.type(screen.getByLabelText('Nome do projeto'), project.name);
    const createButton = screen.getAllByText('Criar projeto').find((element) => element.closest('.ant-modal'))?.closest('button');
    expect(createButton).not.toBeNull();
    await user.click(createButton as HTMLButtonElement);
    await user.click(createButton as HTMLButtonElement);

    expect(fetch).toHaveBeenCalledOnce();
    expect(createButton).toBeDisabled();
    resolveRequest!(new Response(JSON.stringify({ project }), { headers: { 'content-type': 'application/json' } }));
  });
});

describe('CreateConversationModal', () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('creates a conversation with the initial model and opens its chat', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          conversation: {
            createdAt: '2026-07-27T10:00:00.000Z',
            createdByUserId: 'user-1',
            id: conversationId,
            modelId: 'openai/gpt-4.1-mini',
            projectId: project.id,
            title: 'Dúvidas iniciais',
            updatedAt: '2026-07-27T10:00:00.000Z',
          },
        }),
        { headers: { 'content-type': 'application/json' }, status: 200 },
      ),
    );

    render(<CreateConversationModal models={[{
      createdAt: '2026-07-27T10:00:00.000Z',
      enabled: true,
      id: 'openai/gpt-4.1-mini',
      isDefault: true,
      name: 'GPT-4.1 Mini',
      provider: 'OpenAI',
      updatedAt: '2026-07-27T10:00:00.000Z',
    }]} open projectId={project.id} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Título'), 'Dúvidas iniciais');
    const createButton = screen.getAllByText('Criar conversa').find((element) => element.closest('button'))?.closest('button');
    expect(createButton).not.toBeNull();
    await user.click(createButton as HTMLButtonElement);

    await waitFor(() => {
      const [path, request] = vi.mocked(fetch).mock.calls[0] ?? [];
      expect(path).toBe(`/api/projects/${project.id}/conversations`);
      expect(request).toMatchObject({ headers: { 'Content-Type': 'application/json' }, method: 'POST' });
      expect(JSON.parse(String(request?.body))).toEqual({ modelId: 'openai/gpt-4.1-mini', title: 'Dúvidas iniciais' });
      expect(push).toHaveBeenCalledWith(`/projects/${project.id}/conversations/${conversationId}`);
    });
  });

  it('disables conversation creation while the request is pending to prevent duplicate submissions', async () => {
    const user = userEvent.setup();
    let resolveRequest: (response: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<CreateConversationModal models={[{
      createdAt: '2026-07-27T10:00:00.000Z',
      enabled: true,
      id: 'openai/gpt-4.1-mini',
      isDefault: true,
      name: 'GPT-4.1 Mini',
      provider: 'OpenAI',
      updatedAt: '2026-07-27T10:00:00.000Z',
    }]} open projectId={project.id} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Título'), 'Dúvidas iniciais');
    const createButton = screen.getAllByText('Criar conversa').find((element) => element.closest('button'))?.closest('button');
    expect(createButton).not.toBeNull();
    await user.click(createButton as HTMLButtonElement);
    await user.click(createButton as HTMLButtonElement);

    expect(fetch).toHaveBeenCalledOnce();
    expect(createButton).toBeDisabled();
    resolveRequest!(
      new Response(
        JSON.stringify({
          conversation: {
            createdAt: '2026-07-27T10:00:00.000Z',
            createdByUserId: 'user-1',
            id: conversationId,
            modelId: 'openai/gpt-4.1-mini',
            projectId: project.id,
            title: 'Dúvidas iniciais',
            updatedAt: '2026-07-27T10:00:00.000Z',
          },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );
  });
});
