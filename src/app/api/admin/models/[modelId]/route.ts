import { NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';
import { updateModelInputSchema } from '@/types/schemas';

type RouteProps = { params: Promise<{ modelId: string }> };

export async function PATCH(request: Request, { params }: RouteProps): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  const input = updateModelInputSchema.safeParse(await request.json().catch(() => undefined));
  if (!input.success) return NextResponse.json({ error: 'Dados do modelo inválidos.' }, { status: 400 });
  const { modelId } = await params;

  try {
    return NextResponse.json({ model: await createBackendClient(fetch).updateModel(token, modelId, input.data) });
  } catch {
    return NextResponse.json({ error: 'Não foi possível atualizar o modelo.' }, { status: 502 });
  }
}
