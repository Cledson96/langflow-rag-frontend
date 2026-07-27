import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { readSessionToken } from '@/lib/session';
import { BackendApiError, createBackendClient } from '@/services/backend-client';
import { createConversationInputSchema } from '@/types/schemas';

const invalidInput = { error: 'Dados da conversa inválidos.' };
const invalidProject = { error: 'Projeto inválido.' };
const invalidSession = { error: 'Sessão inválida.' };
const missingSession = { error: 'Sessão não encontrada.' };
const unavailable = { error: 'Não foi possível consultar as conversas.' };
const projectIdSchema = z.string().uuid();

type RouteContext = { params: Promise<{ projectId: string }> };

function backendFailure(error: unknown): NextResponse {
  if (error instanceof BackendApiError && error.status === 401) {
    return NextResponse.json(invalidSession, { status: 401 });
  }

  return NextResponse.json(unavailable, { status: 502 });
}

async function validProjectId(context: RouteContext): Promise<string | undefined> {
  const { projectId } = await context.params;
  const parsed = projectIdSchema.safeParse(projectId);

  return parsed.success ? parsed.data : undefined;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  const projectId = await validProjectId(context);

  if (projectId === undefined) {
    return NextResponse.json(invalidProject, { status: 400 });
  }

  try {
    const conversations = await createBackendClient(fetch).getConversations(token, projectId);

    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    return backendFailure(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  const projectId = await validProjectId(context);

  if (projectId === undefined) {
    return NextResponse.json(invalidProject, { status: 400 });
  }

  const body = await request.json().catch((): undefined => undefined);
  const parsed = createConversationInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput, { status: 400 });
  }

  try {
    const conversation = await createBackendClient(fetch).createConversation(token, projectId, parsed.data);

    return NextResponse.json({ conversation });
  } catch (error: unknown) {
    return backendFailure(error);
  }
}
