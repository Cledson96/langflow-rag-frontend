'use client';

import {
  AppstoreOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  RobotOutlined,
  SettingOutlined,
  UserOutlined,
  ApiOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown, Flex, Layout, Menu, Tag, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Project, User } from '@/types/api';

type AppShellProps = {
  children: React.ReactNode;
  projects: Project[];
  user: User;
};

function initials(user: User): string {
  const value = user.name?.trim() || user.email;
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function AppShell({ children, projects, user }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedProjectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const activeMenu = pathname.startsWith('/admin/models')
    ? 'models'
    : pathname.startsWith('/settings/integrations')
      ? 'integrations'
      : pathname.startsWith('/settings/memory')
        ? 'memory'
      : pathname === '/projects'
        ? 'projects'
        : undefined;

  const navigationItems = useMemo(
    () => [
      { icon: <AppstoreOutlined />, key: 'projects', label: <Link href="/projects">Visão geral</Link> },
      { icon: <ApiOutlined />, key: 'integrations', label: <Link href="/settings/integrations">Integrações</Link> },
      { icon: <BulbOutlined />, key: 'memory', label: <Link href="/settings/memory">Nexo e memórias</Link> },
      ...(user.role === 'ADMIN'
        ? [{ icon: <SettingOutlined />, key: 'models', label: <Link href="/admin/models">Modelos de IA</Link> }]
        : []),
    ],
    [user.role],
  );

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const sidebar = (
    <div className="app-sidebar-content">
      <Link className="app-brand" href="/projects">
        <span aria-label="Gobrax AI" className="brand-wordmark">
          <b>go</b>brax <em>AI</em>
        </span>
        <span>
          <small>Inteligência para sua operação</small>
        </span>
      </Link>

      <Menu className="app-main-menu" items={navigationItems} mode="inline" selectedKeys={activeMenu ? [activeMenu] : []} />

      <div className="sidebar-section-header">
        <Typography.Text type="secondary">PROJETOS</Typography.Text>
        <Link aria-label="Criar projeto" href="/projects">
          <PlusOutlined />
        </Link>
      </div>
      <Menu
        className="project-menu"
        items={projects.map((project) => ({
          icon: <RobotOutlined />,
          key: project.id,
          label: <Link href={`/projects/${project.id}`}>{project.name}</Link>,
        }))}
        mode="inline"
        selectedKeys={selectedProjectId ? [selectedProjectId] : []}
      />

      <div className="sidebar-user">
        <Dropdown
          menu={{
            items: [
              { disabled: true, icon: <UserOutlined />, key: 'account', label: user.email },
              { type: 'divider' },
              { danger: true, icon: <LogoutOutlined />, key: 'logout', label: 'Sair', onClick: () => void logout() },
            ],
          }}
          placement="topRight"
          trigger={['click']}
        >
          <button className="sidebar-user-button" type="button">
            <Avatar style={{ background: '#171717', color: '#ffd21a' }}>{initials(user)}</Avatar>
            <span>
              <strong>{user.name || 'Minha conta'}</strong>
              <small>{user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</small>
            </span>
            {user.role === 'ADMIN' ? <Tag color="purple">ADMIN</Tag> : null}
          </button>
        </Dropdown>
      </div>
    </div>
  );

  return (
    <Layout className="app-layout">
      <Layout.Sider className="app-sidebar desktop-sidebar" theme="light" width={272}>
        {sidebar}
      </Layout.Sider>
      <Drawer
        className="mobile-navigation"
        closable={false}
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        placement="left"
        styles={{ body: { padding: 0 } }}
        size={286}
      >
        {sidebar}
      </Drawer>
      <Layout>
        <Layout.Header className="mobile-header">
          <Button
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            icon={mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setMobileOpen((current) => !current)}
            type="text"
          />
          <Flex align="center" gap={10}>
            <span aria-label="Gobrax AI" className="brand-wordmark compact">
              <b>go</b>brax <em>AI</em>
            </span>
          </Flex>
          <Avatar size="small" style={{ background: '#171717', color: '#ffd21a' }}>{initials(user)}</Avatar>
        </Layout.Header>
        <Layout.Content className="app-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
