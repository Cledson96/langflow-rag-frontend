'use client';

import { Spin } from 'antd';
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
    <main className="chat-workspace chat-boot">
      <Spin size="large" />
    </main>
  ),
  ssr: false,
});

export default function ChatClient(props: Readonly<ChatClientProps>) {
  return <ChatWorkspace {...props} />;
}
