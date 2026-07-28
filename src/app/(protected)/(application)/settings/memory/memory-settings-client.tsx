'use client';

import {
  BulbOutlined,
  DeleteOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Empty, Form, Input, List, Space, Tabs, Tag, Typography, message } from 'antd';
import { useState } from 'react';

import type { AgentMemory, AgentSoul, Project, UpdateAgentSoulInput, User } from '@/types/api';
import { agentSoulSchema } from '@/types/schemas';

type ProjectMemoryGroup = { memories: AgentMemory[]; project: Project };
type Props = {
  initialProjectMemories: ProjectMemoryGroup[];
  initialSoul: AgentSoul;
  initialUserMemories: AgentMemory[];
  user: User;
};

function MemoryList({
  memories,
  onArchive,
}: Readonly<{ memories: AgentMemory[]; onArchive: (memory: AgentMemory) => Promise<void> }>) {
  if (!memories.length) {
    return <Empty description="O Nexo ainda não guardou nenhuma memória neste espaço." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <List
      dataSource={memories}
      renderItem={(memory) => (
        <List.Item
          actions={[
            <Button
              aria-label="Remover memória"
              danger
              icon={<DeleteOutlined />}
              key="remove"
              onClick={() => void onArchive(memory)}
              type="text"
            />,
          ]}
        >
          <List.Item.Meta
            description={
              <Space wrap>
                <Tag>{memory.kind}</Tag>
                <Typography.Text type="secondary">
                  Atualizada em {new Intl.DateTimeFormat('pt-BR').format(new Date(memory.updatedAt))}
                </Typography.Text>
              </Space>
            }
            title={memory.content}
          />
        </List.Item>
      )}
    />
  );
}

export default function MemorySettingsClient({
  initialProjectMemories,
  initialSoul,
  initialUserMemories,
  user,
}: Readonly<Props>) {
  const [soul, setSoul] = useState(initialSoul);
  const [userMemories, setUserMemories] = useState(initialUserMemories);
  const [projectGroups, setProjectGroups] = useState(initialProjectMemories);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function saveSoul(values: UpdateAgentSoulInput): Promise<void> {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/agent/soul', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const payload: unknown = await response.json().catch(() => undefined);
      const parsed = agentSoulSchema.safeParse(
        typeof payload === 'object' && payload !== null && 'soul' in payload ? payload.soul : undefined,
      );
      if (!response.ok || !parsed.success) throw new Error();
      setSoul(parsed.data);
      void messageApi.success('Identidade do agente atualizada.');
    } catch {
      void messageApi.error('Não foi possível atualizar a identidade.');
    } finally {
      setSaving(false);
    }
  }

  async function archiveUserMemory(memory: AgentMemory): Promise<void> {
    const response = await fetch(`/api/memories/${memory.id}`, { method: 'DELETE' });
    if (!response.ok) {
      void messageApi.error('Não foi possível remover a memória.');
      return;
    }
    setUserMemories((current) => current.filter(({ id }) => id !== memory.id));
    void messageApi.success('Memória pessoal removida.');
  }

  async function archiveProjectMemory(memory: AgentMemory): Promise<void> {
    if (!memory.projectId) return;
    const response = await fetch(`/api/projects/${memory.projectId}/memories/${memory.id}`, { method: 'DELETE' });
    if (!response.ok) {
      void messageApi.error('Somente proprietário ou administrador pode remover esta memória.');
      return;
    }
    setProjectGroups((current) =>
      current.map((group) => ({
        ...group,
        memories: group.memories.filter(({ id }) => id !== memory.id),
      })),
    );
    void messageApi.success('Memória do projeto removida.');
  }

  const memoryTabs = [
    {
      children: <MemoryList memories={userMemories} onArchive={archiveUserMemory} />,
      icon: <UserOutlined />,
      key: 'personal',
      label: `Pessoal (${userMemories.length})`,
    },
    ...projectGroups.map(({ memories, project }) => ({
      children: <MemoryList memories={memories} onArchive={archiveProjectMemory} />,
      icon: <FolderOutlined />,
      key: project.id,
      label: `${project.name} (${memories.length})`,
    })),
  ];

  return (
    <main className="page-shell">
      {contextHolder}
      <div className="page-heading admin-heading">
        <Tag color="gold" icon={<BulbOutlined />} variant="filled">CÉREBRO DO AGENTE</Tag>
        <Typography.Title>{soul.name}</Typography.Title>
        <Typography.Paragraph>
          {soul.role}. Ele decide se uma informação merece memória pessoal, memória de projeto ou se não deve ser salva.
        </Typography.Paragraph>
      </div>

      <Alert
        description="Saudações, pedidos passageiros, conteúdo bruto de e-mails, senhas, tokens e informações incertas não entram na memória."
        icon={<SafetyCertificateOutlined />}
        showIcon
        title="Memória seletiva e auditável"
        type="info"
      />

      {user.role === 'ADMIN' ? (
        <Card className="admin-card" title="Soul e personalidade">
          <Form<UpdateAgentSoulInput>
            initialValues={soul}
            layout="vertical"
            onFinish={(values) => void saveSoul(values)}
          >
            <Space align="start" size="large" wrap>
              <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
                <Input style={{ width: 240 }} />
              </Form.Item>
              <Form.Item label="Papel" name="role" rules={[{ required: true }]}>
                <Input style={{ width: 420 }} />
              </Form.Item>
            </Space>
            <Form.Item label="Personalidade" name="personality" rules={[{ min: 20, required: true }]}>
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
            <Form.Item label="O que sabe sobre a Gobrax" name="companyContext" rules={[{ min: 20, required: true }]}>
              <Input.TextArea autoSize={{ minRows: 5, maxRows: 12 }} />
            </Form.Item>
            <Form.Item label="Regras permanentes" name="instructions" rules={[{ min: 20, required: true }]}>
              <Input.TextArea autoSize={{ minRows: 5, maxRows: 12 }} />
            </Form.Item>
            <Button htmlType="submit" loading={saving} type="primary">Salvar identidade</Button>
          </Form>
        </Card>
      ) : null}

      <Card className="admin-card" title="Memórias ativas">
        <Tabs items={memoryTabs} />
      </Card>
    </main>
  );
}
