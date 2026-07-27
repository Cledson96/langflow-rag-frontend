import { z } from 'zod';

import { parseEnv } from '@/config/env';
import type {
  AuthResponse,
  Conversation,
  CreateConversationInput,
  CreateProjectInput,
  CredentialsInput,
  Message,
  Project,
  RegisterInput,
  SendMessageInput,
  SendMessageResponse,
  User,
} from '@/types/api';
import {
  authResponseSchema,
  conversationSchema,
  createConversationInputSchema,
  createProjectInputSchema,
  credentialsInputSchema,
  messageSchema,
  projectSchema,
  registerInputSchema,
  sendMessageInputSchema,
  sendMessageResponseSchema,
  userSchema,
} from '@/types/schemas';

const requestTimeoutMs = 30_000;
const tokenSchema = z.string().min(1);
const identifierSchema = z.string().trim().min(1);
const jsonContentType = 'application/json';

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

type RequestOptions<TSchema extends z.ZodType> = {
  body?: unknown;
  method?: 'GET' | 'POST';
  path: string;
  schema: TSchema;
  token?: string;
};

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.toLowerCase();

  return contentType === jsonContentType || contentType?.endsWith('+json') === true;
}

function getBackendUrl(path: string, apiBaseUrl: string): string {
  return new URL(path, apiBaseUrl).toString();
}

export function createBackendClient(
  fetcher: Fetcher,
  apiBaseUrl = parseEnv(process.env).apiBaseUrl,
) {
  const baseUrl = z.string().url().parse(apiBaseUrl);

  async function request<TSchema extends z.ZodType>({
    body,
    method = 'GET',
    path,
    schema,
    token,
  }: RequestOptions<TSchema>): Promise<z.output<TSchema>> {
    const headers: Record<string, string> = {
      accept: jsonContentType,
    };

    if (token !== undefined) {
      headers.authorization = `Bearer ${tokenSchema.parse(token)}`;
    }

    if (body !== undefined) {
      headers['content-type'] = jsonContentType;
    }

    try {
      const response = await fetcher(getBackendUrl(path, baseUrl), {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers,
        method,
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (!response.ok) {
        throw new BackendApiError('Backend request failed', response.status);
      }

      if (!isJsonResponse(response)) {
        throw new BackendApiError('Backend returned an invalid response', 502);
      }

      const payload: unknown = await response.json();
      const parsed = schema.safeParse(payload);

      if (!parsed.success) {
        throw new BackendApiError('Backend returned an invalid response', 502);
      }

      return parsed.data;
    } catch (error: unknown) {
      if (error instanceof BackendApiError) {
        throw error;
      }

      throw new BackendApiError('Backend request failed', 502);
    }
  }

  function projectPath(projectId: string): string {
    return `/projects/${encodeURIComponent(identifierSchema.parse(projectId))}`;
  }

  function conversationPath(projectId: string, conversationId: string): string {
    return `${projectPath(projectId)}/conversations/${encodeURIComponent(identifierSchema.parse(conversationId))}`;
  }

  return {
    async register(input: RegisterInput): Promise<AuthResponse> {
      return request({
        body: registerInputSchema.parse(input),
        method: 'POST',
        path: '/auth/register',
        schema: authResponseSchema,
      });
    },
    async login(input: CredentialsInput): Promise<AuthResponse> {
      return request({
        body: credentialsInputSchema.parse(input),
        method: 'POST',
        path: '/auth/login',
        schema: authResponseSchema,
      });
    },
    async getMe(token: string): Promise<User> {
      return request({ path: '/me', schema: userSchema, token });
    },
    async getProjects(token: string): Promise<Project[]> {
      return request({ path: '/projects', schema: z.array(projectSchema), token });
    },
    async createProject(token: string, input: CreateProjectInput): Promise<Project> {
      return request({
        body: createProjectInputSchema.parse(input),
        method: 'POST',
        path: '/projects',
        schema: projectSchema,
        token,
      });
    },
    async getConversations(token: string, projectId: string): Promise<Conversation[]> {
      return request({ path: `${projectPath(projectId)}/conversations`, schema: z.array(conversationSchema), token });
    },
    async createConversation(token: string, projectId: string, input: CreateConversationInput): Promise<Conversation> {
      return request({
        body: createConversationInputSchema.parse(input),
        method: 'POST',
        path: `${projectPath(projectId)}/conversations`,
        schema: conversationSchema,
        token,
      });
    },
    async getMessages(token: string, projectId: string, conversationId: string): Promise<Message[]> {
      return request({ path: `${conversationPath(projectId, conversationId)}/messages`, schema: z.array(messageSchema), token });
    },
    async sendMessage(
      token: string,
      projectId: string,
      conversationId: string,
      input: SendMessageInput,
    ): Promise<SendMessageResponse> {
      return request({
        body: sendMessageInputSchema.parse(input),
        method: 'POST',
        path: `${conversationPath(projectId, conversationId)}/messages`,
        schema: sendMessageResponseSchema,
        token,
      });
    },
  };
}
