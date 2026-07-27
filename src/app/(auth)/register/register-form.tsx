'use client';

import { Alert, Button, Card, Form, Input } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RegisterValues = {
  email: string;
  name?: string;
  password: string;
};

type ErrorResponse = {
  error?: string;
};

function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const error = (body as ErrorResponse).error;

    if (typeof error === 'string') {
      return error;
    }
  }

  return fallback;
}

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  async function onFinish(values: RegisterValues): Promise<void> {
    setError(undefined);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const body: unknown = await response.json().catch((): undefined => undefined);

      if (!response.ok) {
        setError(errorMessage(body, 'Não foi possível concluir o cadastro.'));
        return;
      }

      router.push('/projects');
    } catch {
      setError('Não foi possível concluir o cadastro.');
    }
  }

  return (
    <Card title="Criar conta" style={{ margin: '4rem auto', maxWidth: 420 }}>
      {error ? <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} /> : null}
      <Form<RegisterValues> layout="vertical" onFinish={onFinish}>
        <Form.Item label="Nome" name="name">
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item
          label="E-mail"
          name="email"
          rules={[{ required: true, message: 'Informe seu e-mail.' }, { type: 'email', message: 'Informe um e-mail válido.' }]}
        >
          <Input autoComplete="email" type="email" />
        </Form.Item>
        <Form.Item
          label="Senha"
          name="password"
          rules={[
            { required: true, message: 'Informe sua senha.' },
            { min: 12, message: 'A senha deve ter ao menos 12 caracteres.' },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button block htmlType="submit" type="primary">
          Cadastrar
        </Button>
      </Form>
    </Card>
  );
}
