import { notFound, redirect } from 'next/navigation';
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

  if (!parsedProjectId.success) {
    notFound();
  }

  const token = await readSessionToken();

  if (token === undefined) {
    notFound();
  }

  const conversations = await createBackendClient(fetch).getConversations(token, parsedProjectId.data);

  const firstConversation = conversations[0];

  if (firstConversation !== undefined) {
    redirect(`/projects/${parsedProjectId.data}/conversations/${firstConversation.id}`);
    return null;
  }

  return <ProjectClient conversations={conversations} projectId={parsedProjectId.data} />;
}
