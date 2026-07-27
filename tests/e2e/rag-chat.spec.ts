import { expect, test } from '@playwright/test';

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const user = { email: 'ada@example.com', id: 'user-e2e', name: 'Ada Lovelace' };
const project = { id: projectId, name: 'Base de conhecimento', slug: 'base-de-conhecimento' };
const conversation = {
  createdAt: '2026-07-27T10:00:00.000Z',
  createdByUserId: user.id,
  id: conversationId,
  modelId: 'openai/gpt-4.1-mini',
  projectId,
  title: 'Pergunta sobre RAG',
  updatedAt: '2026-07-27T10:00:00.000Z',
};
const userMessage = {
  content: 'O que é RAG?',
  conversationId,
  createdAt: '2026-07-27T10:00:01.000Z',
  id: 'b2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: null,
  modelId: null,
  role: 'USER',
};
const assistantMessage = {
  content: 'RAG combina recuperação de contexto com geração.',
  conversationId,
  createdAt: '2026-07-27T10:00:02.000Z',
  id: 'c2e5d171-1db4-4a92-8c72-4da2c1f51fd2',
  metadata: { source: { displayName: 'README.md' } },
  modelId: 'openai/gpt-4.1-mini',
  role: 'ASSISTANT',
};

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      domain: '127.0.0.1',
      httpOnly: true,
      name: 'langflow_rag_session',
      path: '/',
      sameSite: 'Lax',
      value: 'e2e-session-token',
    },
  ]);

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    const response = (json: object) => route.fulfill({ body: JSON.stringify(json), contentType: 'application/json', status: 200 });

    if (pathname === '/api/auth/register' && request.method() === 'POST') {
      await response({ user });
      return;
    }

    if (pathname === '/api/projects' && request.method() === 'POST') {
      await response({ project });
      return;
    }

    if (pathname === `/api/projects/${projectId}/conversations` && request.method() === 'POST') {
      expect(request.postDataJSON()).toMatchObject({ modelId: 'openai/gpt-4.1-mini' });
      await response({ conversation });
      return;
    }

    if (pathname === `/api/projects/${projectId}/conversations/${conversationId}/messages` && request.method() === 'POST') {
      await response({ assistantMessage, userMessage });
      return;
    }

    await route.abort('failed');
  });

});

test('new user completes the RAG journey and sees the cited source', async ({ page }) => {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).not.toHaveText('e2e-session-token');

  await page.getByLabel('Nome').fill('Ada Lovelace');
  await page.getByLabel('E-mail').fill('ada@example.com');
  await page.getByLabel('Senha').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Projetos' })).toBeVisible();

  await page.getByRole('button', { name: 'Criar projeto' }).click();
  await page.getByLabel('Nome do projeto').fill('Base de conhecimento');
  await page.getByLabel('Slug').fill('base-de-conhecimento');
  await page.getByRole('button', { name: 'Criar', exact: true }).click();
  await page.getByRole('link', { name: 'Base de conhecimento' }).click();

  await page.getByRole('button', { name: 'Criar conversa' }).click();
  await page.getByLabel('Título').fill('Pergunta sobre RAG');
  await page.getByLabel('Criar conversa').getByRole('button', { name: 'Criar conversa' }).click();

  await page.getByLabel('Mensagem').fill('O que é RAG?');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('RAG combina recuperação de contexto com geração.')).toBeVisible();
  await expect(page.getByText('README.md')).toBeVisible();
});
