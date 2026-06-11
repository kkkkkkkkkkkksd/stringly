import { z } from 'zod';
import { roleSchema } from '@/entities/project';

// Доменная сущность Member — участник проекта (проекция Membership + User, docs/06).
// Доступ per-project: один пользователь может иметь разные роли в разных проектах.
// `isYou` помечает строку текущего пользователя (бэк определяет по токену сессии).
export const memberSchema = z.object({
  id: z.string(), // membershipId
  userId: z.string(),
  email: z.string().email(),
  name: z.string().optional(), // у аккаунта может не быть имени → показываем email
  role: roleSchema,
  isYou: z.boolean().default(false),
  createdAt: z.string(),
});
export type Member = z.infer<typeof memberSchema>;
