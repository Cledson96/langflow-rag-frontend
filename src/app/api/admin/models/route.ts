import { NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';
import { createModelInputSchema } from '@/types/schemas';

export async function GET(): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

  try {
    return NextResponse.json({ models: await createBackendClient(fetch).getAdminModels(token) });
  } catch {
    return NextResponse.json({ error: 'Acesso administrativo necessário.' }, { status: 403 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  const input = createModelInputSchema.safeParse(await request.json().catch(() => undefined));
  if (!input.success) return NextResponse.json({ error: 'Dados do modelo inválidos.' }, { status: 400 });

  try {
    return NextResponse.json({ model: await createBackendClient(fetch).createModel(token, input.data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Não foi possível cadastrar o modelo.' }, { status: 502 });
  }
}
