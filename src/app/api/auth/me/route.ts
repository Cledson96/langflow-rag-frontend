import { NextResponse, type NextRequest } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { BackendApiError, createBackendClient } from '@/services/backend-client';

const missingSession = { error: 'Sessão não encontrada.' };
const invalidSession = { error: 'Sessão inválida.' };
const unavailable = { error: 'Não foi possível consultar a sessão.' };

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  try {
    const user = await createBackendClient(fetch).getMe(token);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (error instanceof BackendApiError && error.status === 401) {
      return NextResponse.json(invalidSession, { status: 401 });
    }

    return NextResponse.json(unavailable, { status: 502 });
  }
}
