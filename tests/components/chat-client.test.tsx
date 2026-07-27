import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ChatClient from '@/app/(protected)/projects/[projectId]/conversations/[conversationId]/chat-client';

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const olderAssistantMessage = {
  content: 'Olá, como posso ajudar?',
  conversationId,
  createdAt: '2026-07-27T10:00:00.000Z',
  id: 'a2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: null,
  modelId: 'openai/gpt-4.1-mini',
  role: 'ASSISTANT' as const,
};
const userMessage = {
  content: 'O que é RAG?',
  conversationId,
  createdAt: '2026-07-27T10:00:01.000Z',
  id: 'b2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: null,
  modelId: null,
  role: 'USER' as const,
};
const assistantMessage = {
  content: 'RAG combina recuperação de contexto com geração.',
  conversationId,
  createdAt: '2026-07-27T10:00:02.000Z',
  id: 'c2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: {
    source: { displayName: 'README.md' },
    usage: { inputTokens: 12, outputTokens: 8, totalTokens: 20 },
  },
  modelId: 'openai/gpt-4.1-mini',
  role: 'ASSISTANT' as const,
};

describe('ChatClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the supplied history in chronological order and shows an assistant source', () => {
    const { container } = render(
      <ChatClient initialMessages={[userMessage, olderAssistantMessage, assistantMessage]} conversationId={conversationId} projectId={projectId} />,
    );

    const text = container.textContent ?? '';
    expect(text.indexOf(olderAssistantMessage.content)).toBeLessThan(text.indexOf(userMessage.content));
    expect(screen.getByText('README.md')).toBeVisible();
  });

  it('disables message submission while the persisted response is pending', async () => {
    const user = userEvent.setup();
    let resolveRequest: (response: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ChatClient initialMessages={[]} conversationId={conversationId} projectId={projectId} />);

    await user.type(screen.getByLabelText('Mensagem'), userMessage.content);
    const sendButton = screen.getByRole('button', { name: 'Enviar' });
    await user.click(sendButton);

    expect(sendButton).toBeDisabled();
    expect(screen.getByLabelText('Mensagem')).toBeDisabled();
    expect(screen.getAllByText(userMessage.content)).toHaveLength(1);
    resolveRequest!(
      new Response(JSON.stringify({ assistantMessage, userMessage }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(userMessage.content, { selector: 'div' })).toBeVisible();
      expect(screen.getByText(assistantMessage.content)).toBeVisible();
    });
    expect(fetch).toHaveBeenCalledWith(`/api/projects/${projectId}/conversations/${conversationId}/messages`, {
      body: JSON.stringify({ content: userMessage.content }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  it('keeps the drafted message available for retry when the BFF rejects it', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Não foi possível enviar a mensagem.' }), {
        headers: { 'content-type': 'application/json' },
        status: 502,
      }),
    );
    render(<ChatClient initialMessages={[]} conversationId={conversationId} projectId={projectId} />);

    await user.type(screen.getByLabelText('Mensagem'), userMessage.content);
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(screen.getByText('Não foi possível enviar a mensagem.')).toBeVisible();
      expect(screen.getByLabelText('Mensagem')).toHaveValue(userMessage.content);
    });
    expect(screen.getByRole('button', { name: /Enviar/ })).toBeEnabled();
  });
});
