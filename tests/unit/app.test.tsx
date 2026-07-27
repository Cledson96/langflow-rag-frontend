import { beforeEach, describe, expect, it, vi } from 'vitest';

const { readSessionToken, redirect } = vi.hoisted(() => ({
  readSessionToken: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ readSessionToken }));
vi.mock('next/navigation', () => ({ redirect }));

import Home from '@/app/page';

describe('Home', () => {
  beforeEach(() => {
    readSessionToken.mockReset();
    redirect.mockReset();
  });

  it('redireciona visitantes para o login', async () => {
    readSessionToken.mockResolvedValue(undefined);

    await Home();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redireciona uma sessão existente para projetos', async () => {
    readSessionToken.mockResolvedValue('session-token');

    await Home();

    expect(redirect).toHaveBeenCalledWith('/projects');
  });
});
