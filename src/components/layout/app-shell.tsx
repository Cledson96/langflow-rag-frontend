import { Layout, Typography } from 'antd';

type AppShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export default function AppShell({ children, sidebar }: Readonly<AppShellProps>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header>
        <Typography.Text style={{ color: '#fff' }}>Langflow RAG</Typography.Text>
      </Layout.Header>
      <Layout>
        {sidebar}
        <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
