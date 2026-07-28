import { NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';
import { updateAgentSoulInputSchema } from '@/types/schemas';

export async function PATCH(request: Request): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  const input = updateAgentSoulInputSchema.safeParse(await request.json().catch(() => undefined));
  if (!input.success) return NextResponse.json({ error: 'Dados da identidade inválidos.' }, { status: 400 });

  try {
    const soul = await createBackendClient(fetch).updateAgentSoul(token, input.data);
    return NextResponse.json({ soul });
  } catch {
    return NextResponse.json({ error: 'Não foi possível atualizar o agente.' }, { status: 502 });
  }
}
