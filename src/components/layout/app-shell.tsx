import { Layout, Typography } from 'antd';

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header>
        <Typography.Text style={{ color: '#fff' }}>Langflow RAG</Typography.Text>
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
    </Layout>
  );
}
