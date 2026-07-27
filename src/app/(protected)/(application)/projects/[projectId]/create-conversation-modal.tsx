'use client';

import { Alert, Button, Form, Input, Modal, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { defaultModelId, modelOptions } from '@/config/models';
import { conversationSchema } from '@/types/schemas';

type CreateConversationModalProps = {
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
    <Modal destroyOnHidden footer={null} onCancel={close} open={open} title="Criar conversa">
      {error ? <Alert message={error} showIcon type="error" style={{ marginBottom: 16 }} /> : null}
      <Form<ConversationFormValues> form={form} initialValues={{ modelId: defaultModelId }} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Título" name="title" rules={[{ required: true, message: 'Informe o título da conversa.' }]}>
          <Input autoFocus maxLength={200} />
        </Form.Item>
        <Form.Item label="Modelo" name="modelId" rules={[{ required: true, message: 'Selecione o modelo.' }]}>
          <Select options={modelOptions} />
        </Form.Item>
        <Button disabled={isSubmitting} htmlType="submit" loading={isSubmitting} type="primary">
          Criar conversa
        </Button>
      </Form>
    </Modal>
  );
}
