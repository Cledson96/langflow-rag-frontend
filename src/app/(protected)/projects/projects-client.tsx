'use client';

import { Button, Empty, Flex, List, Typography } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

import CreateProjectModal from './components/create-project-modal';
import type { Project } from '@/types/api';

type ProjectsClientProps = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Readonly<ProjectsClientProps>) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function addProject(project: Project): void {
    setProjects((currentProjects) => [...currentProjects, project]);
  }

  return (
    <>
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Typography.Title level={1} style={{ margin: 0 }}>
          Projetos
        </Typography.Title>
        <Button onClick={() => setIsCreateModalOpen(true)} type="primary">
          Criar projeto
        </Button>
      </Flex>
      {projects.length === 0 ? (
        <Empty description="Nenhum projeto ainda." />
      ) : (
        <List
          bordered
          dataSource={projects}
          renderItem={(project) => (
            <List.Item>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </List.Item>
          )}
        />
      )}
      <CreateProjectModal
        onCancel={() => setIsCreateModalOpen(false)}
        onCreated={addProject}
        open={isCreateModalOpen}
      />
    </>
  );
}
