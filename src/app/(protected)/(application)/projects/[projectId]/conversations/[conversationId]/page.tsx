import { Typography } from 'antd';
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

  if (!projectId.success || !conversationId.success) {
    notFound();
  }

  const token = await readSessionToken();

  if (token === undefined) {
    notFound();
  }

  const messages = await createBackendClient(fetch).getMessages(token, projectId.data, conversationId.data);

  return (
    <>
      <Typography.Title level={1}>Conversa</Typography.Title>
      <ChatClient conversationId={conversationId.data} initialMessages={messages} projectId={projectId.data} />
    </>
  );
}
