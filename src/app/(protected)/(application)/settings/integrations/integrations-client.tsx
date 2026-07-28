'use client';

import { CalendarOutlined, CheckCircleFilled, GoogleOutlined, MailOutlined, TableOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { GoogleConnection } from '@/types/api';

export default function IntegrationsClient({
  connection,
  result,
}: Readonly<{ connection: GoogleConnection; result?: string }>) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function disconnect(): Promise<void> {
    setDisconnecting(true);
    const response = await fetch('/api/integrations/google', { method: 'DELETE' });
    setDisconnecting(false);
    if (!response.ok) {
      void messageApi.error('Não foi possível desconectar o Google.');
      return;
    }
    void messageApi.success('Conta Google desconectada.');
    router.refresh();
  }

  return (
    <main className="page-container">
      {contextHolder}
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={2}>Integrações</Typography.Title>
          <Typography.Text type="secondary">
            Conecte suas ferramentas para o Gobrax AI trabalhar com seus dados, sempre respeitando suas permissões.
          </Typography.Text>
        </div>
        {result === 'connected' ? <Alert showIcon title="Conta Google conectada com sucesso." type="success" /> : null}
        {result === 'error' ? <Alert showIcon title="Não foi possível concluir a conexão com o Google." type="error" /> : null}
        <Card>
          <Flex align="flex-start" gap={18} justify="space-between" wrap>
            <Space align="start" size={16}>
              <GoogleOutlined style={{ fontSize: 30 }} />
              <Space direction="vertical" size={8}>
                <Typography.Title level={4} style={{ margin: 0 }}>Google Workspace</Typography.Title>
                <Typography.Text type="secondary">
                  Gmail, Agenda, Planilhas, Drive e Google Chat.
                </Typography.Text>
                <Space wrap>
                  <Tag icon={<MailOutlined />}>Gmail</Tag>
                  <Tag icon={<CalendarOutlined />}>Agenda</Tag>
                  <Tag icon={<TableOutlined />}>Planilhas</Tag>
                </Space>
                {connection.connected ? (
                  <Typography.Text>
                    <CheckCircleFilled style={{ color: '#389e0d', marginRight: 8 }} />
                    Conectado como {connection.email}
                  </Typography.Text>
                ) : null}
              </Space>
            </Space>
            {connection.connected ? (
              <Popconfirm
                cancelText="Cancelar"
                description="O Gobrax AI deixará de acessar os serviços desta conta."
                okButtonProps={{ danger: true }}
                okText="Desconectar"
                onConfirm={() => void disconnect()}
                title="Desconectar conta Google?"
              >
                <Button danger loading={disconnecting}>Desconectar</Button>
              </Popconfirm>
            ) : (
              <Button href="/api/integrations/google/start" icon={<GoogleOutlined />} type="primary">
                Conectar Google
              </Button>
            )}
          </Flex>
        </Card>
      </Space>
    </main>
  );
}
