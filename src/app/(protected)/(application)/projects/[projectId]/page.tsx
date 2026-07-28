import { notFound } from 'next/navigation';
import { z } from 'zod';

import ProjectClient from './project-client';
import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

const projectIdSchema = z.string().uuid();

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Readonly<ProjectPageProps>) {
  const { projectId: rawProjectId } = await params;
  const parsedProjectId = projectIdSchema.safeParse(rawProjectId);
  if (!parsedProjectId.success) notFound();

  const token = await readSessionToken();
  if (token === undefined) notFound();

  const client = createBackendClient(fetch);
  const [conversations, models] = await Promise.all([
    client.getConversations(token, parsedProjectId.data),
    client.getModels(token),
  ]);

  return <ProjectClient conversations={conversations} models={models} projectId={parsedProjectId.data} />;
}
