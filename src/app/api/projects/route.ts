import { NextResponse, type NextRequest } from 'next/server';

import { readSessionToken } from '@/lib/session';
import { BackendApiError, createBackendClient } from '@/services/backend-client';
import { createProjectInputSchema } from '@/types/schemas';

const invalidInput = { error: 'Dados do projeto inválidos.' };
const invalidSession = { error: 'Sessão inválida.' };
const missingSession = { error: 'Sessão não encontrada.' };
const unavailable = { error: 'Não foi possível consultar os projetos.' };

function backendFailure(error: unknown): NextResponse {
  if (error instanceof BackendApiError && error.status === 401) {
    return NextResponse.json(invalidSession, { status: 401 });
  }

  return NextResponse.json(unavailable, { status: 502 });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  try {
    const projects = await createBackendClient(fetch).getProjects(token);

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    return backendFailure(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = await readSessionToken(request);

  if (token === undefined) {
    return NextResponse.json(missingSession, { status: 401 });
  }

  const body = await request.json().catch((): undefined => undefined);
  const parsed = createProjectInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput, { status: 400 });
  }

  try {
    const project = await createBackendClient(fetch).createProject(token, parsed.data);

    return NextResponse.json({ project });
  } catch (error: unknown) {
    return backendFailure(error);
  }
}
