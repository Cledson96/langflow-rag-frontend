import { NextResponse } from 'next/server';

import { setSessionCookie } from '@/lib/session';
import { BackendApiError, createBackendClient } from '@/services/backend-client';
import { credentialsInputSchema } from '@/types/schemas';

const invalidCredentials = { error: 'E-mail ou senha inválidos.' };
const invalidInput = { error: 'Dados de acesso inválidos.' };
const unavailable = { error: 'Não foi possível iniciar a sessão.' };

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch((): undefined => undefined);
  const parsed = credentialsInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput, { status: 400 });
  }

  try {
    const authentication = await createBackendClient(fetch).login(parsed.data);
    const response = NextResponse.json({ user: authentication.user });
    setSessionCookie(response, authentication.token);

    return response;
  } catch (error: unknown) {
    if (error instanceof BackendApiError && error.status === 401) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    return NextResponse.json(unavailable, { status: 502 });
  }
}
