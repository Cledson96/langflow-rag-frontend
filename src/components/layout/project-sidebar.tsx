import { Layout, Menu, Typography } from 'antd';
import Link from 'next/link';

import type { Project } from '@/types/api';

type ProjectSidebarProps = {
  projects: Project[];
};

export default function ProjectSidebar({ projects }: Readonly<ProjectSidebarProps>) {
  return (
    <Layout.Sider breakpoint="lg" collapsedWidth="0" width={264}>
      <Typography.Title level={5} style={{ color: '#fff', margin: '16px 24px' }}>
        Projetos
      </Typography.Title>
      <Menu
        items={projects.map((project) => ({
          key: project.id,
          label: <Link href={`/projects/${project.id}`}>{project.name}</Link>,
        }))}
        theme="dark"
      />
    </Layout.Sider>
  );
}
