import { type NextRequest, NextResponse } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const token = await readSessionToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    await createBackendClient(fetch).disconnectGoogle(token);
    return NextResponse.json({ disconnected: true });
  } catch {
    return NextResponse.json({ error: 'Não foi possível desconectar o Google.' }, { status: 502 });
  }
}
