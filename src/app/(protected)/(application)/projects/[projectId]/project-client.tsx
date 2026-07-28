'use client';

import { Conversations } from '@ant-design/x';
import { CommentOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Flex, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import CreateConversationModal from './create-conversation-modal';
import type { AIModel, Conversation } from '@/types/api';

type ProjectClientProps = {
  conversations: Conversation[];
  models: AIModel[];
  projectId: string;
};

export default function ProjectClient({ conversations, models, projectId }: Readonly<ProjectClientProps>) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <main className="page-shell project-page">
      <Flex align="center" className="page-heading project-heading" justify="space-between">
        <div>
          <Typography.Text className="eyebrow">PROJETO</Typography.Text>
          <Typography.Title>Conversas</Typography.Title>
          <Typography.Paragraph>Inicie uma nova análise ou continue de onde parou.</Typography.Paragraph>
        </div>
        <Button icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} size="large" type="primary">
          Nova conversa
        </Button>
      </Flex>

      <Card className="conversation-library">
        {conversations.length === 0 ? (
          <Empty description="Este projeto ainda não tem conversas." image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button icon={<CommentOutlined />} onClick={() => setIsCreateModalOpen(true)} type="primary">
              Começar uma conversa
            </Button>
          </Empty>
        ) : (
          <Conversations
            creation={{ label: 'Nova conversa', onClick: () => setIsCreateModalOpen(true) }}
            items={conversations.map((conversation) => ({
              icon: <RobotOutlined />,
              key: conversation.id,
              label: conversation.title ?? 'Conversa sem título',
            }))}
            onActiveChange={(key) => router.push(`/projects/${projectId}/conversations/${key}`)}
          />
        )}
      </Card>

      <CreateConversationModal
        models={models}
        onCancel={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
        projectId={projectId}
      />
    </main>
  );
}
