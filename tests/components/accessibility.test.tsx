import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LoginForm from '@/app/(auth)/login/login-form';
import ChatClient from '@/app/(protected)/(application)/projects/[projectId]/conversations/[conversationId]/chat-workspace';
import { metadata } from '@/app/layout';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const conversation = {
  createdAt: '2026-07-27T10:00:00.000Z',
  createdByUserId: 'user-1',
  id: conversationId,
  modelId: 'openai/gpt-4.1-mini',
  projectId,
  title: 'Conversa',
  updatedAt: '2026-07-27T10:00:00.000Z',
};
const models = [{
  createdAt: '2026-07-27T10:00:00.000Z',
  enabled: true,
  id: 'openai/gpt-4.1-mini',
  isDefault: true,
  name: 'GPT-4.1 Mini',
  provider: 'OpenAI',
  updatedAt: '2026-07-27T10:00:00.000Z',
}];

describe('accessible product entry points', () => {
  it('labels authentication fields and names chat submission while defining the page title', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );

    render(
      <>
        <LoginForm />
        <ChatClient
          conversation={conversation}
          conversations={[conversation]}
          initialMessages={[]}
          models={models}
          projectId={projectId}
        />
      </>,
    );

    expect(screen.getByLabelText('E-mail')).toBeVisible();
    expect(screen.getByLabelText('Senha')).toBeVisible();
    expect(screen.getByLabelText('Mensagem')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeVisible();
    expect(metadata.title).toEqual({
      default: 'Gobrax AI',
      template: '%s | Gobrax AI',
    });
  });

  it('keeps protected pages out of search indexes and publishes only public routes', async () => {
    const [{ metadata: protectedMetadata }, { default: robots }, { default: sitemap }] = await Promise.all([
      import('@/app/(protected)/layout'),
      import('@/app/robots'),
      import('@/app/sitemap'),
    ]);

    expect(protectedMetadata.robots).toEqual({ follow: false, index: false });
    expect(robots()).toEqual({
      rules: {
        allow: ['/login', '/register'],
        disallow: '/',
        userAgent: '*',
      },
      sitemap: 'https://app-langflow.cledson.com.br/sitemap.xml',
    });
    expect(sitemap().map(({ url }) => url)).toEqual([
      'https://app-langflow.cledson.com.br/login',
      'https://app-langflow.cledson.com.br/register',
    ]);
  });

  it('offers a retry action when the protected application fails', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const { default: ProtectedError } = await import('@/app/(protected)/error');

    render(<ProtectedError error={new Error('indisponível')} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it('announces protected and conversation loading states', async () => {
    const [{ default: ProtectedLoading }, { default: ConversationLoading }] = await Promise.all([
      import('@/app/(protected)/loading'),
      import('@/app/(protected)/(application)/projects/[projectId]/conversations/[conversationId]/loading'),
    ]);

    const { rerender } = render(<ProtectedLoading />);
    expect(screen.getByRole('status', { name: 'Carregando conteúdo protegido' })).toBeVisible();

    rerender(<ConversationLoading />);
    expect(screen.getByRole('status', { name: 'Carregando conversa' })).toBeVisible();
  });
});
