import { createServer } from 'node:http';

const projectId = '94e5d171-1db4-4a92-8c72-4da2c1f51fd2';
const conversationId = '7e3bf271-6a53-4d60-bc6d-f1e117335f33';
const createdAt = '2026-07-27T10:00:00.000Z';
const user = { email: 'ada@example.com', id: 'user-e2e', name: 'Ada Lovelace' };
const project = { id: projectId, name: 'Base de conhecimento', slug: 'base-de-conhecimento' };
const conversation = {
  createdAt,
  createdByUserId: user.id,
  id: conversationId,
  modelId: 'openai/gpt-4.1-mini',
  projectId,
  title: 'Pergunta sobre RAG',
  updatedAt: createdAt,
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

createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1:3911').pathname;
  let payload = {};

  if (pathname === '/auth/register') {
    payload = { token: 'e2e-session-token', user };
  } else if (pathname === '/projects') {
    payload = request.method === 'POST' ? project : [];
  } else if (pathname === `/projects/${projectId}/conversations`) {
    payload = request.method === 'POST' ? conversation : [];
  } else if (pathname === `/projects/${projectId}/conversations/${conversationId}/messages`) {
    payload = request.method === 'POST' ? { assistantMessage, userMessage } : [];
  }

  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload));
}).listen(3911, '127.0.0.1');
