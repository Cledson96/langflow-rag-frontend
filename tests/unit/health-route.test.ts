import { GET } from '@/app/api/health/route';

describe('health route', () => {
  it('returns an ok status', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
