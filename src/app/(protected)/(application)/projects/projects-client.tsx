'use client';

import {
  ArrowRightOutlined,
  DatabaseOutlined,
  FolderOutlined,
  PlusOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Flex, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import CreateProjectModal from './components/create-project-modal';
import type { Project } from '@/types/api';

type ProjectsClientProps = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Readonly<ProjectsClientProps>) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function addProject(project: Project): void {
    setProjects((currentProjects) => [project, ...currentProjects]);
    router.refresh();
  }

  return (
    <main className="page-shell">
      <section className="projects-hero">
        <div>
          <Tag color="purple" variant="filled">WORKSPACE DE IA</Tag>
          <Typography.Title>Seus projetos, conversas e conhecimento em um só lugar.</Typography.Title>
          <Typography.Paragraph>
            Converse com sua base do Obsidian, troque o modelo de IA quando quiser e mantenha cada contexto organizado.
          </Typography.Paragraph>
          <Button icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} size="large" type="primary">
            Novo projeto
          </Button>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span><RobotOutlined /></span>
          <i><DatabaseOutlined /></i>
        </div>
      </section>

      <Flex align="end" className="section-title" justify="space-between">
        <div>
          <Typography.Title level={2}>Projetos recentes</Typography.Title>
          <Typography.Text type="secondary">{projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}</Typography.Text>
        </div>
        <Button icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>Criar projeto</Button>
      </Flex>

      {projects.length === 0 ? (
        <Card className="empty-card">
          <Empty
            description="Crie seu primeiro projeto para começar a conversar com sua base de conhecimento."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button onClick={() => setIsCreateModalOpen(true)} type="primary">Criar primeiro projeto</Button>
          </Empty>
        </Card>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="project-card" hoverable>
                <div className="project-card-icon"><FolderOutlined /></div>
                <div>
                  <Typography.Title ellipsis level={3}>{project.name}</Typography.Title>
                  <Typography.Text type="secondary">Base de conhecimento conectada</Typography.Text>
                </div>
                <Flex align="center" className="project-card-footer" justify="space-between">
                  <Tag color="green" variant="filled">Ativo</Tag>
                  <span>Abrir <ArrowRightOutlined /></span>
                </Flex>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        onCancel={() => setIsCreateModalOpen(false)}
        onCreated={addProject}
        open={isCreateModalOpen}
      />
    </main>
  );
}
