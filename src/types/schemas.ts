import { z } from 'zod';

import { allowedModelIds } from '@/config/models';

export const userSchema = z.object({
  email: z.string().email(),
  id: z.string().min(1),
  name: z.string().nullable(),
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

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
});

export const createConversationInputSchema = z.object({
  modelId: z.enum(allowedModelIds),
  title: z.string().trim().min(1).max(200).optional(),
});

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
