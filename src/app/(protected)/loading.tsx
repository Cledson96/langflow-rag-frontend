import { Flex, Skeleton } from 'antd';

export default function ProtectedLoading() {
  return (
    <section aria-busy="true" aria-label="Carregando conteúdo protegido" role="status">
      <Flex gap="large" vertical>
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '30%' }} />
        <Skeleton active paragraph={{ rows: 5 }} title={false} />
      </Flex>
    </section>
  );
}
