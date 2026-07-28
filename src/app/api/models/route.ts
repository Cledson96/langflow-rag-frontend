import { NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export async function GET(): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

  try {
    return NextResponse.json({ models: await createBackendClient(fetch).getModels(token) });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar os modelos.' }, { status: 502 });
  }
}
