import { Alert } from 'antd';

import ProjectsClient from './projects-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export default async function ProjectsPage() {
  const token = await readSessionToken();

  if (token === undefined) {
    return <Alert title="Sessão não encontrada." type="error" />;
  }

  const projects = await createBackendClient(fetch).getProjects(token);

  return <ProjectsClient initialProjects={projects} />;
}
