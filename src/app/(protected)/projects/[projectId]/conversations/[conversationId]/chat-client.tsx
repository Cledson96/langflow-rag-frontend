'use client';

import { Alert, Flex } from 'antd';
import { useState } from 'react';

import MessageComposer from './components/message-composer';
import MessageList from './components/message-list';
import { sendMessageResponseSchema } from '@/types/schemas';
import type { Message } from '@/types/api';

type ChatClientProps = {
  conversationId: string;
  initialMessages: Message[];
  projectId: string;
};

const unavailableMessage = 'Não foi possível enviar a mensagem.';

export default function ChatClient({ conversationId, initialMessages, projectId }: Readonly<ChatClientProps>) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function sendMessage(content: string): Promise<boolean> {
    setPending(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/projects/${projectId}/conversations/${conversationId}/messages`, {
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload: unknown = await response.json().catch((): undefined => undefined);
      const parsed = sendMessageResponseSchema.safeParse(payload);

      if (!response.ok || !parsed.success) {
        throw new Error(unavailableMessage);
      }

      setMessages((current) => [...current, parsed.data.userMessage, parsed.data.assistantMessage]);
      return true;
    } catch {
      setError(unavailableMessage);
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <Flex gap="large" vertical>
      <MessageList messages={messages} />
      {error === undefined ? null : <Alert message={error} showIcon type="error" />}
      <MessageComposer onSend={sendMessage} pending={pending} />
    </Flex>
  );
}
