import { Space, Tag, Typography } from 'antd';

import type { Message } from '@/types/api';

type MessageSourcesProps = {
  metadata: Message['metadata'];
};

function usageLabel(usage: NonNullable<NonNullable<Message['metadata']>['usage']>): string | undefined {
  if (usage.totalTokens !== undefined) {
    return `${usage.totalTokens} tokens`;
  }

  const parts = [
    usage.inputTokens === undefined ? undefined : `${usage.inputTokens} entrada`,
    usage.outputTokens === undefined ? undefined : `${usage.outputTokens} saída`,
  ].filter((part): part is string => part !== undefined);

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export default function MessageSources({ metadata }: Readonly<MessageSourcesProps>) {
  const displayName = metadata?.source?.displayName;
  const usage = metadata?.usage === undefined ? undefined : usageLabel(metadata.usage);

  if (displayName === undefined && usage === undefined) {
    return null;
  }

  return (
    <Space size="small" wrap>
      {displayName === undefined ? null : <Tag>{displayName}</Tag>}
      {usage === undefined ? null : <Typography.Text type="secondary">Uso: {usage}</Typography.Text>}
    </Space>
  );
}
