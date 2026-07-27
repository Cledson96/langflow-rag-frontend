'use client';

import { Button, Result } from 'antd';

type ProtectedErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedError({ reset }: Readonly<ProtectedErrorProps>) {
  return (
    <Result
      extra={
        <Button onClick={reset} type="primary">
          Tentar novamente
        </Button>
      }
      status="error"
      subTitle="Não foi possível carregar esta área. Tente novamente em instantes."
      title="Algo deu errado"
    />
  );
}
