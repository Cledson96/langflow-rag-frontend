import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  id: z.string().min(1),
  name: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
});

export const agentSoulSchema = z.object({
  companyContext: z.string(),
  createdAt: z.string().datetime(),
  id: z.string(),
  instructions: z.string(),
  name: z.string(),
  personality: z.string(),
  role: z.string(),
  updatedAt: z.string().datetime(),
});

export const updateAgentSoulInputSchema = agentSoulSchema
  .pick({
    companyContext: true,
    instructions: true,
    name: true,
    personality: true,
    role: true,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export const agentMemorySchema = z.object({
  confidence: z.number().min(0).max(1),
  content: z.string(),
  createdAt: z.string().datetime(),
  createdByUserId: z.string(),
  id: z.string().uuid(),
  key: z.string(),
  kind: z.string(),
  projectId: z.string().uuid().nullable(),
  scope: z.enum(['USER', 'PROJECT']),
  sourceMessageId: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
});

export const archivedMemoryResponseSchema = z.object({ archived: z.literal(true) });

export const modelSchema = z.object({
  createdAt: z.string().datetime(),
  enabled: z.boolean(),
  id: z.string().min(1),
  isDefault: z.boolean(),
  name: z.string().min(1),
  provider: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const conversationSchema = z.object({
  createdAt: z.string().datetime(),
  createdByUserId: z.string().min(1),
  id: z.string().min(1),
  modelId: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().nullable(),
  updatedAt: z.string().datetime(),
});

export const messageMetadataSchema = z
  .object({
    runId: z.string().optional(),
    sources: z
      .array(
        z.object({
          displayName: z.string(),
          name: z.string().optional(),
        }),
      )
      .optional(),
    tools: z
      .array(
        z.object({
          label: z.string(),
          name: z.string(),
          status: z.enum(['completed', 'failed']),
        }),
      )
      .optional(),
    source: z
      .object({
        displayName: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    usage: z
      .object({
        inputTokens: z.number().nonnegative().optional(),
        outputTokens: z.number().nonnegative().optional(),
        totalTokens: z.number().nonnegative().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown());

export const messageSchema = z.object({
  content: z.string(),
  conversationId: z.string().min(1),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  metadata: messageMetadataSchema.nullable(),
  modelId: z.string().nullable(),
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM', 'TOOL']),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
});

export const authorizationUrlSchema = z.object({
  url: z.string().url(),
});

export const googleConnectionSchema = z.discriminatedUnion('connected', [
  z.object({ connected: z.literal(false) }),
  z.object({
    connected: z.literal(true),
    email: z.string().email(),
    scopes: z.array(z.string()),
    updatedAt: z.string().datetime(),
  }),
]);

export const disconnectGoogleResponseSchema = z.object({
  disconnected: z.literal(true),
});

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
});

export const createConversationInputSchema = z.object({
  modelId: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateConversationModelInputSchema = z.object({
  modelId: z.string().trim().min(1).max(200),
});

export const createModelInputSchema = z.object({
  enabled: z.boolean().optional(),
  id: z.string().trim().min(3).max(200),
  isDefault: z.boolean().optional(),
  name: z.string().trim().min(1).max(120),
  provider: z.string().trim().min(1).max(80),
});

export const updateModelInputSchema = createModelInputSchema
  .omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export const credentialsInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

export const registerInputSchema = credentialsInputSchema.extend({
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(12).max(256),
});

export const sendMessageInputSchema = z.object({
  content: z.string().trim().min(1).max(20_000),
});

export const sendMessageResponseSchema = z.object({
  assistantMessage: messageSchema,
  userMessage: messageSchema,
});
