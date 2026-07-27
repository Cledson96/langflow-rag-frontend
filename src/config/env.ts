import { z } from 'zod';

const environmentSchema = z.object({
  API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SESSION_COOKIE_NAME: z.string().trim().min(1),
});

export type Environment = {
  apiBaseUrl: string;
  appUrl: string;
  sessionCookieName: string;
};

export function parseEnv(values: Record<string, string | undefined>): Environment {
  const parsed = environmentSchema.parse(values);

  return {
    apiBaseUrl: parsed.API_BASE_URL,
    appUrl: parsed.NEXT_PUBLIC_APP_URL,
    sessionCookieName: parsed.SESSION_COOKIE_NAME,
  };
}
