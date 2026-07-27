import type {
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
import type { z } from 'zod';

export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type CredentialsInput = z.infer<typeof credentialsInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
