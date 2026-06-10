import { z } from 'zod';

// Zod-схемы на границе API (типы = z.infer). Сессия — один бессрочный токен (docs/07).
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; name?: string };
