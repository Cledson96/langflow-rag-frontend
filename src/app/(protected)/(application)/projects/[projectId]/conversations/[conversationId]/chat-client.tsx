'use client';

import dynamic from 'next/dynamic';

import type { AIModel, Conversation, Message } from '@/types/api';

type ChatClientProps = {
  conversation: Conversation;
  conversations: Conversation[];
  initialMessages: Message[];
  models: AIModel[];
  projectId: string;
};

const ChatWorkspace = dynamic(() => import('./chat-workspace'), {
  loading: () => (
    <main aria-busy="true" aria-live="polite" className="chat-workspace chat-boot">
      <span>Carregando conversa…</span>
    </main>
  ),
  ssr: false,
});

export default function ChatClient(props: Readonly<ChatClientProps>) {
  return <ChatWorkspace {...props} />;
}
