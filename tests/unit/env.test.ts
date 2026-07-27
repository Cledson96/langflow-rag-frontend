import { ZodError } from 'zod';

import { parseEnv } from '@/config/env';

describe('parseEnv', () => {
  it('rejects an invalid backend URL instead of returning configuration that cannot be called', () => {
    expect(() =>
      parseEnv({
        API_BASE_URL: 'not a URL',
        NEXT_PUBLIC_APP_URL: 'https://app-langflow.cledson.com.br',
        SESSION_COOKIE_NAME: 'langflow_rag_session',
      }),
    ).toThrow(ZodError);
  });

  it('returns the server and public configuration when each required value is valid', () => {
    expect(
      parseEnv({
        API_BASE_URL: 'https://api-langflow.cledson.com.br',
        NEXT_PUBLIC_APP_URL: 'https://app-langflow.cledson.com.br',
        SESSION_COOKIE_NAME: 'langflow_rag_session',
      }),
    ).toEqual({
      apiBaseUrl: 'https://api-langflow.cledson.com.br',
      appUrl: 'https://app-langflow.cledson.com.br',
      sessionCookieName: 'langflow_rag_session',
    });
  });
});
