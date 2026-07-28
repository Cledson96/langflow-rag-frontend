'use client';

import { useSyncExternalStore } from 'react';

import ChatWorkspace from './chat-workspace';
import type { AIModel, Conversation, Message } from '@/types/api';

type ChatClientProps = {
  conversation: Conversation;
  conversations: Conversation[];
  initialMessages: Message[];
  models: AIModel[];
  projectId: string;
};

const subscribeToBrowser = () => () => undefined;

export default function ChatClient(props: Readonly<ChatClientProps>) {
  const mounted = useSyncExternalStore(subscribeToBrowser, () => true, () => false);

  if (!mounted) {
    return (
    <main aria-busy="true" aria-live="polite" className="chat-workspace chat-boot">
      <span>Carregando conversa…</span>
    </main>
    );
  }

  return <ChatWorkspace {...props} />;
}
