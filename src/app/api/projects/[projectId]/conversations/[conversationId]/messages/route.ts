import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { readSessionToken } from '@/lib/session';
import { BackendApiError, createBackendClient } from '@/services/backend-client';
import { sendMessageInputSchema } from '@/types/schemas';

const invalidConversation = { error: 'Conversa inválida.' };
const invalidInput = { error: 'Mensagem inválida.' };
const invalidProject = { error: 'Projeto inválido.' };
const invalidSession = { error: 'Sessão inválida.' };
const missingSession = { error: 'Sessão não encontrada.' };
const unavailable = { error: 'Não foi possível consultar as mensagens.' };
const identifierSchema = z.string().uuid();

type RouteContext = { params: Promise<{ conversationId: string; projectId: string }> };

function backendFailure(error: unknown): NextResponse {
  if (error instanceof BackendApiError && error.status === 401) {
    return NextResponse.json(invalidSession, { status: 401 });
  }

  return NextResponse.json(unavailable, { status: 502 });
}

async function validIdentifiers(
  context: RouteContext,
): Promise<{ conversationId: string; projectId: string } | typeof invalidConversation | typeof invalidProject> {
  const { conversationId: rawConversationId, projectId: rawProjectId } = await context.params;
  const projectId = identifierSchema.safeParse(rawProjectId);

  if (!projectId.success) {
    return invalidProject;
  }

  const conversationId = identifierSchema.safeParse(rawConversationId);

  if (!conversationId.success) {
    return invalidConversation;
  }

  return { conversationId: conversationId.data, projectId: projectId.data };
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  const identifiers = await validIdentifiers(context);

  if ('error' in identifiers) {
    return NextResponse.json(identifiers, { status: 400 });
  }

  try {
    const messages = await createBackendClient(fetch).getMessages(token, identifiers.projectId, identifiers.conversationId);

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    return backendFailure(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  const identifiers = await validIdentifiers(context);

  if ('error' in identifiers) {
    return NextResponse.json(identifiers, { status: 400 });
  }

  const body = await request.json().catch((): undefined => undefined);
  const parsed = sendMessageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput, { status: 400 });
  }

  try {
    const response = await createBackendClient(fetch).sendMessage(
      token,
      identifiers.projectId,
      identifiers.conversationId,
      parsed.data,
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    return backendFailure(error);
  }
}
