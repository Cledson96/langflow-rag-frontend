'use client';

import { ApiOutlined, CheckCircleFilled, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Modal, Space, Switch, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';

import { modelSchema } from '@/types/schemas';
import type { AIModel, CreateModelInput } from '@/types/api';

type ModelsAdminClientProps = {
  initialModels: AIModel[];
};

type ModelFormValues = CreateModelInput;

function getError(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }
  return fallback;
}

export default function ModelsAdminClient({ initialModels }: Readonly<ModelsAdminClientProps>) {
  const [models, setModels] = useState(initialModels);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [form] = Form.useForm<ModelFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  async function createModel(values: ModelFormValues): Promise<void> {
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch('/api/admin/models', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload: unknown = await response.json().catch((): undefined => undefined);
      const parsed = modelSchema.safeParse(
        typeof payload === 'object' && payload !== null && 'model' in payload ? payload.model : undefined,
      );
      if (!response.ok || !parsed.success) throw new Error(getError(payload, 'Não foi possível cadastrar o modelo.'));
      setModels((current) => [parsed.data, ...current.map((model) => (
        parsed.data.isDefault ? { ...model, isDefault: false } : model
      ))]);
      form.resetFields();
      setOpen(false);
      void messageApi.success('Modelo cadastrado.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível cadastrar o modelo.');
    } finally {
      setSaving(false);
    }
  }

  async function updateModel(modelId: string, input: Partial<Pick<AIModel, 'enabled' | 'isDefault'>>): Promise<void> {
    setUpdatingId(modelId);
    try {
      const response = await fetch(`/api/admin/models/${encodeURIComponent(modelId)}`, {
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const payload: unknown = await response.json().catch((): undefined => undefined);
      const parsed = modelSchema.safeParse(
        typeof payload === 'object' && payload !== null && 'model' in payload ? payload.model : undefined,
      );
      if (!response.ok || !parsed.success) throw new Error();
      setModels((current) => current.map((model) => {
        if (model.id === parsed.data.id) return parsed.data;
        return parsed.data.isDefault ? { ...model, isDefault: false } : model;
      }));
      void messageApi.success(input.isDefault ? 'Modelo padrão atualizado.' : 'Status atualizado.');
    } catch {
      void messageApi.error('Não foi possível atualizar o modelo.');
    } finally {
      setUpdatingId(undefined);
    }
  }

  const columns: TableColumnsType<AIModel> = [
    {
      key: 'model',
      render: (_, model) => (
        <Space>
          <span className="model-table-icon"><RobotOutlined /></span>
          <span>
            <Typography.Text strong>{model.name}</Typography.Text>
            <Typography.Text className="model-id" type="secondary">{model.id}</Typography.Text>
          </span>
        </Space>
      ),
      title: 'Modelo',
    },
    {
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => <Tag variant="filled">{provider}</Tag>,
      title: 'Provedor',
    },
    {
      key: 'default',
      render: (_, model) => model.isDefault
        ? <Tag color="purple" icon={<CheckCircleFilled />}>Padrão</Tag>
        : (
          <Button
            disabled={!model.enabled}
            loading={updatingId === model.id}
            onClick={() => void updateModel(model.id, { isDefault: true })}
            size="small"
            type="link"
          >
            Tornar padrão
          </Button>
        ),
      title: 'Uso',
    },
    {
      align: 'right',
      key: 'enabled',
      render: (_, model) => (
        <Switch
          checked={model.enabled}
          checkedChildren="Ativo"
          disabled={model.isDefault}
          loading={updatingId === model.id}
          onChange={(enabled) => void updateModel(model.id, { enabled })}
          unCheckedChildren="Inativo"
        />
      ),
      title: 'Status',
    },
  ];

  return (
    <main className="page-shell">
      {contextHolder}
      <div className="page-heading admin-heading">
        <Tag color="purple" icon={<ApiOutlined />} variant="filled">ADMINISTRAÇÃO</Tag>
        <Typography.Title>Modelos de IA</Typography.Title>
        <Typography.Paragraph>
          Controle quais modelos aparecem para os usuários e defina o padrão para novas conversas.
        </Typography.Paragraph>
      </div>
      <Card
        className="admin-card"
        extra={<Button icon={<PlusOutlined />} onClick={() => setOpen(true)} type="primary">Cadastrar modelo</Button>}
        title={`Catálogo · ${models.length}`}
      >
        <Table columns={columns} dataSource={models} pagination={false} rowKey="id" scroll={{ x: 720 }} />
      </Card>

      <Modal
        destroyOnHidden
        footer={null}
        onCancel={() => setOpen(false)}
        open={open}
        title="Cadastrar modelo de IA"
        width={540}
      >
        <Typography.Paragraph type="secondary">
          Use o identificador exato aceito pelo OpenRouter, por exemplo <code>openai/gpt-4.1-mini</code>.
        </Typography.Paragraph>
        {error ? <Alert title={error} showIcon type="error" /> : null}
        <Form<ModelFormValues>
          form={form}
          initialValues={{ enabled: true, isDefault: false }}
          layout="vertical"
          onFinish={(values) => void createModel(values)}
        >
          <Form.Item label="Nome exibido" name="name" rules={[{ required: true }]}>
            <Input placeholder="GPT-4.1 Mini" size="large" />
          </Form.Item>
          <Form.Item
            label="ID do modelo"
            name="id"
            rules={[{ message: 'Use o formato provedor/modelo.', pattern: /^[a-z0-9._-]+\/[a-zA-Z0-9._:-]+$/, required: true }]}
          >
            <Input placeholder="openai/gpt-4.1-mini" size="large" />
          </Form.Item>
          <Form.Item label="Provedor" name="provider" rules={[{ required: true }]}>
            <Input placeholder="OpenAI" size="large" />
          </Form.Item>
          <Space size="large">
            <Form.Item label="Disponível" name="enabled" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="Modelo padrão" name="isDefault" valuePropName="checked"><Switch /></Form.Item>
          </Space>
          <Button block htmlType="submit" loading={saving} size="large" type="primary">Cadastrar modelo</Button>
        </Form>
      </Modal>
    </main>
  );
}
