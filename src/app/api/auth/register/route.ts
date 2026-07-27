import { NextResponse } from 'next/server';

import { setSessionCookie } from '@/lib/session';
import { createBackendClient } from '@/services/backend-client';
import { registerInputSchema } from '@/types/schemas';

const invalidInput = { error: 'Dados de cadastro inválidos.' };
const unavailable = { error: 'Não foi possível concluir o cadastro.' };

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch((): undefined => undefined);
  const parsed = registerInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput, { status: 400 });
  }

  try {
    const authentication = await createBackendClient(fetch).register(parsed.data);
    const response = NextResponse.json({ user: authentication.user });
    setSessionCookie(response, authentication.token);

    return response;
  } catch {
    return NextResponse.json(unavailable, { status: 502 });
  }
}
