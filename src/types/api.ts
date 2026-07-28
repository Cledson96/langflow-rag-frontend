import type {
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
  updateModelInputSchema,
  updateConversationModelInputSchema,
  userSchema,
  googleConnectionSchema,
  agentMemorySchema,
  agentSoulSchema,
  updateAgentSoulInputSchema,
} from '@/types/schemas';
import type { z } from 'zod';

export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type AIModel = z.infer<typeof modelSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type CredentialsInput = z.infer<typeof credentialsInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
export type CreateModelInput = z.infer<typeof createModelInputSchema>;
export type UpdateModelInput = z.infer<typeof updateModelInputSchema>;
export type UpdateConversationModelInput = z.infer<typeof updateConversationModelInputSchema>;
export type GoogleConnection = z.infer<typeof googleConnectionSchema>;
export type AgentMemory = z.infer<typeof agentMemorySchema>;
export type AgentSoul = z.infer<typeof agentSoulSchema>;
export type UpdateAgentSoulInput = z.infer<typeof updateAgentSoulInputSchema>;
