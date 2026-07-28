import 'server-only';

import { z } from 'zod';

import { parseEnv } from '@/config/env';
import type {
  AuthResponse,
  Conversation,
  CreateConversationInput,
  CreateProjectInput,
  CredentialsInput,
  Message,
  AIModel,
  CreateModelInput,
  Project,
  RegisterInput,
  SendMessageInput,
  SendMessageResponse,
  UpdateConversationModelInput,
  UpdateModelInput,
  User,
  GoogleConnection,
  AgentMemory,
  AgentSoul,
  UpdateAgentSoulInput,
} from '@/types/api';
import {
  authResponseSchema,
  conversationSchema,
  createConversationInputSchema,
  createProjectInputSchema,
  credentialsInputSchema,
  messageSchema,
  modelSchema,
  projectSchema,
  registerInputSchema,
  sendMessageInputSchema,
  sendMessageResponseSchema,
  createModelInputSchema,
  updateConversationModelInputSchema,
  updateModelInputSchema,
  userSchema,
  authorizationUrlSchema,
  disconnectGoogleResponseSchema,
  googleConnectionSchema,
  agentMemorySchema,
  agentSoulSchema,
  archivedMemoryResponseSchema,
  updateAgentSoulInputSchema,
} from '@/types/schemas';

const requestTimeoutMs = 30_000;
const tokenSchema = z.string().min(1);
const identifierSchema = z.string().uuid();
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
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
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
    async getGoogleLoginUrl(): Promise<string> {
      const result = await request({
        path: '/auth/google/start',
        schema: authorizationUrlSchema,
      });
      return result.url;
    },
    async exchangeGoogleLogin(code: string): Promise<AuthResponse> {
      return request({
        body: { code: z.string().min(1).parse(code) },
        method: 'POST',
        path: '/auth/google/exchange',
        schema: authResponseSchema,
      });
    },
    async getGoogleConnection(token: string): Promise<GoogleConnection> {
      return request({ path: '/integrations/google', schema: googleConnectionSchema, token });
    },
    async getGoogleConnectionUrl(token: string): Promise<string> {
      const result = await request({
        path: '/integrations/google/start',
        schema: authorizationUrlSchema,
        token,
      });
      return result.url;
    },
    async disconnectGoogle(token: string): Promise<void> {
      await request({
        method: 'DELETE',
        path: '/integrations/google',
        schema: disconnectGoogleResponseSchema,
        token,
      });
    },
    async getMe(token: string): Promise<User> {
      return request({ path: '/me', schema: userSchema, token });
    },
    async getAgentSoul(token: string): Promise<AgentSoul> {
      return request({ path: '/agent/soul', schema: agentSoulSchema, token });
    },
    async updateAgentSoul(token: string, input: UpdateAgentSoulInput): Promise<AgentSoul> {
      return request({
        body: updateAgentSoulInputSchema.parse(input),
        method: 'PATCH',
        path: '/admin/agent/soul',
        schema: agentSoulSchema,
        token,
      });
    },
    async getUserMemories(token: string): Promise<AgentMemory[]> {
      return request({ path: '/me/memories', schema: z.array(agentMemorySchema), token });
    },
    async archiveUserMemory(token: string, memoryId: string): Promise<void> {
      await request({
        method: 'DELETE',
        path: `/me/memories/${encodeURIComponent(identifierSchema.parse(memoryId))}`,
        schema: archivedMemoryResponseSchema,
        token,
      });
    },
    async getProjectMemories(token: string, projectId: string): Promise<AgentMemory[]> {
      return request({
        path: `${projectPath(projectId)}/memories`,
        schema: z.array(agentMemorySchema),
        token,
      });
    },
    async archiveProjectMemory(token: string, projectId: string, memoryId: string): Promise<void> {
      await request({
        method: 'DELETE',
        path: `${projectPath(projectId)}/memories/${encodeURIComponent(identifierSchema.parse(memoryId))}`,
        schema: archivedMemoryResponseSchema,
        token,
      });
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
    async updateConversationModel(
      token: string,
      projectId: string,
      conversationId: string,
      input: UpdateConversationModelInput,
    ): Promise<Conversation> {
      return request({
        body: updateConversationModelInputSchema.parse(input),
        method: 'PATCH',
        path: conversationPath(projectId, conversationId),
        schema: conversationSchema,
        token,
      });
    },
    async getModels(token: string): Promise<AIModel[]> {
      return request({ path: '/models', schema: z.array(modelSchema), token });
    },
    async getAdminModels(token: string): Promise<AIModel[]> {
      return request({ path: '/admin/models', schema: z.array(modelSchema), token });
    },
    async createModel(token: string, input: CreateModelInput): Promise<AIModel> {
      return request({
        body: createModelInputSchema.parse(input),
        method: 'POST',
        path: '/admin/models',
        schema: modelSchema,
        token,
      });
    },
    async updateModel(token: string, modelId: string, input: UpdateModelInput): Promise<AIModel> {
      return request({
        body: updateModelInputSchema.parse(input),
        method: 'PATCH',
        path: `/admin/models/${encodeURIComponent(modelId)}`,
        schema: modelSchema,
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
