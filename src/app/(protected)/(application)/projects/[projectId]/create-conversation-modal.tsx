'use client';

import { MessageOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Select, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { conversationSchema } from '@/types/schemas';
import type { AIModel } from '@/types/api';

type CreateConversationModalProps = {
  models: AIModel[];
  onCancel: () => void;
  open: boolean;
  projectId: string;
};

type ConversationFormValues = {
  modelId: string;
  title: string;
};

function errorMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return 'Não foi possível criar a conversa.';
}

export default function CreateConversationModal({
  onCancel,
  models,
  open,
  projectId,
}: Readonly<CreateConversationModalProps>) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<ConversationFormValues>();

  function close(): void {
    form.resetFields();
    setError(undefined);
    onCancel();
  }

  async function onFinish(values: ConversationFormValues): Promise<void> {
    if (isSubmitting) {
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/conversations`, {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body: unknown = await response.json().catch((): undefined => undefined);
      const parsed = conversationSchema.safeParse(
        typeof body === 'object' && body !== null && 'conversation' in body ? body.conversation : undefined,
      );

      if (!response.ok || !parsed.success) {
        setError(errorMessage(body));
        return;
      }

      router.push(`/projects/${projectId}/conversations/${parsed.data.id}`);
    } catch {
      setError('Não foi possível criar a conversa.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      destroyOnHidden
      footer={null}
      onCancel={close}
      open={open}
      title={<span><MessageOutlined /> &nbsp;Nova conversa</span>}
      width={520}
    >
      <Typography.Paragraph type="secondary">
        Escolha um título e o modelo inicial. Você poderá trocar o modelo a qualquer momento.
      </Typography.Paragraph>
      {error ? <Alert title={error} showIcon type="error" style={{ marginBottom: 16 }} /> : null}
      <Form<ConversationFormValues>
        form={form}
        initialValues={{ modelId: models.find((model) => model.isDefault)?.id ?? models[0]?.id }}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Título" name="title" rules={[{ required: true, message: 'Informe o título da conversa.' }]}>
          <Input autoFocus maxLength={200} placeholder="Ex.: Análise do contrato" size="large" />
        </Form.Item>
        <Form.Item label="Modelo" name="modelId" rules={[{ required: true, message: 'Selecione o modelo.' }]}>
          <Select
            options={models.map((model) => ({
              label: `${model.name} · ${model.provider}`,
              value: model.id,
            }))}
            placeholder="Selecione um modelo"
            size="large"
          />
        </Form.Item>
        <Button block disabled={isSubmitting} htmlType="submit" loading={isSubmitting} size="large" type="primary">
          Criar conversa
        </Button>
      </Form>
    </Modal>
  );
}
