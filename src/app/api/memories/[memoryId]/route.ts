import { NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

type RouteProps = { params: Promise<{ memoryId: string }> };

export async function DELETE(_request: Request, { params }: RouteProps): Promise<NextResponse> {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  const { memoryId } = await params;
  try {
    await createBackendClient(fetch).archiveUserMemory(token, memoryId);
    return NextResponse.json({ archived: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível remover a memória.' }, { status: 502 });
  }
}
