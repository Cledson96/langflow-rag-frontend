'use client';

import { Button, Empty, Flex, List, Typography } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

import CreateConversationModal from './create-conversation-modal';
import type { Conversation } from '@/types/api';

type ProjectClientProps = {
  conversations: Conversation[];
  projectId: string;
};

export default function ProjectClient({ conversations, projectId }: Readonly<ProjectClientProps>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Typography.Title level={1} style={{ margin: 0 }}>
          Conversas
        </Typography.Title>
        <Button onClick={() => setIsCreateModalOpen(true)} type="primary">
          Criar conversa
        </Button>
      </Flex>
      {conversations.length === 0 ? (
        <Empty description="Nenhuma conversa ainda." />
      ) : (
        <List
          bordered
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item>
              <Link href={`/projects/${projectId}/conversations/${conversation.id}`}>
                {conversation.title ?? 'Conversa sem título'}
              </Link>
            </List.Item>
          )}
        />
      )}
      <CreateConversationModal
        onCancel={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
        projectId={projectId}
      />
    </>
  );
}
