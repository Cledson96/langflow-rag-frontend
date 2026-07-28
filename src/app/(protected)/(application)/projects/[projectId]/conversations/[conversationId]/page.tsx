import { notFound } from 'next/navigation';
import { z } from 'zod';

import ChatClient from './chat-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

const identifierSchema = z.string().uuid();

type ConversationPageProps = {
  params: Promise<{ conversationId: string; projectId: string }>;
};

export default async function ConversationPage({ params }: Readonly<ConversationPageProps>) {
  const { conversationId: rawConversationId, projectId: rawProjectId } = await params;
  const projectId = identifierSchema.safeParse(rawProjectId);
  const conversationId = identifierSchema.safeParse(rawConversationId);
  if (!projectId.success || !conversationId.success) notFound();

  const token = await readSessionToken();
  if (token === undefined) notFound();

  const client = createBackendClient(fetch);
  const [messages, conversations, models] = await Promise.all([
    client.getMessages(token, projectId.data, conversationId.data),
    client.getConversations(token, projectId.data),
    client.getModels(token),
  ]);
  const conversation = conversations.find((item) => item.id === conversationId.data);
  if (conversation === undefined) notFound();

  return (
    <ChatClient
      conversation={conversation}
      conversations={conversations}
      initialMessages={messages}
      models={models}
      projectId={projectId.data}
    />
  );
}
