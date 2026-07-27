import { Flex, Skeleton } from 'antd';

export default function ConversationLoading() {
  return (
    <section aria-busy="true" aria-label="Carregando conversa" role="status">
      <Flex gap="middle" vertical>
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '20%' }} />
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '15%' }} />
        <Skeleton.Input active block size="large" />
      </Flex>
    </section>
  );
}
