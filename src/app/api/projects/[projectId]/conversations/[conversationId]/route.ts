import { NextResponse } from 'next/server';
import { z } from 'zod';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';
import { updateConversationModelInputSchema } from '@/types/schemas';

const identifierSchema = z.string().uuid();
type RouteProps = { params: Promise<{ conversationId: string; projectId: string }> };

export async function PATCH(request: Request, { params }: RouteProps): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  const { conversationId: rawConversationId, projectId: rawProjectId } = await params;
  const projectId = identifierSchema.safeParse(rawProjectId);
  const conversationId = identifierSchema.safeParse(rawConversationId);
  const input = updateConversationModelInputSchema.safeParse(await request.json().catch(() => undefined));
  if (!projectId.success || !conversationId.success || !input.success) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  try {
    return NextResponse.json({
      conversation: await createBackendClient(fetch).updateConversationModel(
        token,
        projectId.data,
        conversationId.data,
        input.data,
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Não foi possível trocar o modelo.' }, { status: 502 });
  }
}
