'use client';

import { Button, Flex, Input } from 'antd';
import { useState } from 'react';

type MessageComposerProps = {
  onSend: (content: string) => Promise<boolean>;
  pending: boolean;
};

export default function MessageComposer({ onSend, pending }: Readonly<MessageComposerProps>) {
  const [content, setContent] = useState('');
  const canSend = content.trim().length > 0 && !pending;

  async function submit(): Promise<void> {
    if (!canSend) {
      return;
    }

    const sent = await onSend(content.trim());

    if (sent) {
      setContent('');
    }
  }

  return (
    <Flex align="flex-end" gap="small">
      <Input.TextArea
        aria-label="Mensagem"
        autoSize={{ maxRows: 6, minRows: 2 }}
        disabled={pending}
        onChange={(event) => setContent(event.target.value)}
        onPressEnter={(event) => {
          if (!event.shiftKey) {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder="Escreva sua pergunta"
        value={content}
      />
      <Button disabled={!canSend} htmlType="button" loading={pending} onClick={() => void submit()} type="primary">
        Enviar
      </Button>
    </Flex>
  );
}
