'use client';

import { Alert, Button, Form, Input, Modal } from 'antd';
import { useState } from 'react';

import { projectSchema } from '@/types/schemas';
import type { Project } from '@/types/api';

type CreateProjectModalProps = {
  onCancel: () => void;
  onCreated: (project: Project) => void;
  open: boolean;
};

type ProjectFormValues = {
  name: string;
  slug: string;
};

function errorMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return 'Não foi possível criar o projeto.';
}

export default function CreateProjectModal({ onCancel, onCreated, open }: Readonly<CreateProjectModalProps>) {
  const [error, setError] = useState<string>();
  const [form] = Form.useForm<ProjectFormValues>();

  function close(): void {
    form.resetFields();
    setError(undefined);
    onCancel();
  }

  async function onFinish(values: ProjectFormValues): Promise<void> {
    setError(undefined);

    try {
      const response = await fetch('/api/projects', {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body: unknown = await response.json().catch((): undefined => undefined);
      const parsed = projectSchema.safeParse(
        typeof body === 'object' && body !== null && 'project' in body ? body.project : undefined,
      );

      if (!response.ok || !parsed.success) {
        setError(errorMessage(body));
        return;
      }

      onCreated(parsed.data);
      close();
    } catch {
      setError('Não foi possível criar o projeto.');
    }
  }

  return (
    <Modal destroyOnHidden footer={null} onCancel={close} open={open} title="Criar projeto">
      {error ? <Alert message={error} showIcon type="error" style={{ marginBottom: 16 }} /> : null}
      <Form<ProjectFormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Nome do projeto" name="name" rules={[{ required: true, message: 'Informe o nome do projeto.' }]}>
          <Input autoFocus maxLength={120} />
        </Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Informe o slug do projeto.' }]}>
          <Input maxLength={120} />
        </Form.Item>
        <Button htmlType="submit" type="primary">
          Criar
        </Button>
      </Form>
    </Modal>
  );
}
