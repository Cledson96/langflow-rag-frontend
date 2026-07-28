'use client';

import { FolderAddOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Typography } from 'antd';
import { useRef, useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<ProjectFormValues>();
  const slugEdited = useRef(false);

  function close(): void {
    form.resetFields();
    slugEdited.current = false;
    setError(undefined);
    onCancel();
  }

  function createSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function onFinish(values: ProjectFormValues): Promise<void> {
    if (isSubmitting) {
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

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
      title={<span><FolderAddOutlined /> &nbsp;Novo projeto</span>}
      width={520}
    >
      <Typography.Paragraph type="secondary">
        Um projeto separa conversas, memória e documentos de uma área de trabalho.
      </Typography.Paragraph>
      {error ? <Alert title={error} showIcon type="error" style={{ marginBottom: 16 }} /> : null}
      <Form<ProjectFormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Nome do projeto" name="name" rules={[{ required: true, message: 'Informe o nome do projeto.' }]}>
          <Input
            autoFocus
            maxLength={120}
            onChange={(event) => {
              if (!slugEdited.current) form.setFieldValue('slug', createSlug(event.target.value));
            }}
            placeholder="Ex.: Cobrança inteligente"
            size="large"
          />
        </Form.Item>
        <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Informe o slug do projeto.' }]}>
          <Input
            maxLength={120}
            onChange={() => {
              slugEdited.current = true;
            }}
            placeholder="cobranca-inteligente"
            size="large"
          />
        </Form.Item>
        <Button block disabled={isSubmitting} htmlType="submit" loading={isSubmitting} size="large" type="primary">
          Criar projeto
        </Button>
      </Form>
    </Modal>
  );
}
