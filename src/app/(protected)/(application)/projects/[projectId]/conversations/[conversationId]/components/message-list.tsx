import { Flex, List, Typography } from 'antd';

import MessageSources from './message-sources';
import type { Message } from '@/types/api';

type MessageListProps = {
  messages: Message[];
};

function chronological(messages: Message[]): Message[] {
  return [...messages].sort((first, second) => first.createdAt.localeCompare(second.createdAt));
}

function roleLabel(role: Message['role']): string {
  return role === 'USER' ? 'Você' : role === 'ASSISTANT' ? 'Assistente' : role;
}

export default function MessageList({ messages }: Readonly<MessageListProps>) {
  return (
    <List
      dataSource={chronological(messages)}
      locale={{ emptyText: 'Envie uma mensagem para iniciar a conversa.' }}
      renderItem={(message) => (
        <List.Item>
          <Flex gap="small" vertical style={{ width: '100%' }}>
            <Typography.Text strong>{roleLabel(message.role)}</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{message.content}</Typography.Paragraph>
            {message.role === 'ASSISTANT' ? <MessageSources metadata={message.metadata} /> : null}
          </Flex>
        </List.Item>
      )}
      split
    />
  );
}
