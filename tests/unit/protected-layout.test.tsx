import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getProjects, readSessionToken, redirect } = vi.hoisted(() => ({
  getProjects: vi.fn(),
  readSessionToken: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: Readonly<{ children: React.ReactNode; href: string }>) => <a href={href}>{children}</a>,
}));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/lib/session', () => ({ readSessionToken }));
vi.mock('@/services/backend-client', () => ({
  createBackendClient: vi.fn(() => ({ getProjects })),
}));

import ProtectedLayout from '@/app/(protected)/layout';

describe('ProtectedLayout', () => {
  beforeEach(() => {
    getProjects.mockReset();
    readSessionToken.mockReset();
    redirect.mockReset();
    readSessionToken.mockResolvedValue('session-token');
  });

  it('keeps the session guard independent from sidebar data loading', async () => {
    getProjects.mockResolvedValue([]);

    render(await ProtectedLayout({ children: <p>Conteúdo protegido</p> }));

    expect(readSessionToken).toHaveBeenCalledOnce();
    expect(getProjects).not.toHaveBeenCalled();
    expect(screen.getByText('Conteúdo protegido')).toBeVisible();
  });

  it('loads the sidebar in a child layout after the parent boundary is active', async () => {
    getProjects.mockResolvedValue([
      {
        id: '94e5d171-1db4-4a92-8c72-4da2c1f51fd2',
        name: 'Base de conhecimento',
        slug: 'base-de-conhecimento',
      },
    ]);
    const { default: ProtectedApplicationLayout } = await import('@/app/(protected)/(application)/layout');

    const application = await ProtectedApplicationLayout({ children: <p>Projetos</p> });
    render(await ProtectedLayout({ children: application }));

    expect(getProjects).toHaveBeenCalledWith('session-token');
    expect(screen.getByRole('link', { name: 'Base de conhecimento' })).toHaveAttribute(
      'href',
      '/projects/94e5d171-1db4-4a92-8c72-4da2c1f51fd2',
    );
  });
});
