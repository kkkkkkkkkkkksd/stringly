import { z } from 'zod';
import { userSchema } from '@/entities/user';

// Транспортные DTO авторизации (границы API фичи). Доменный User — из entities.
export { userSchema };
export type { User } from '@/entities/user';

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; name?: string };
