import { z } from 'zod';

// Доменная сущность User (единый источник правды). Транспортные DTO авторизации
// (login/register payload, authResponse) живут в фиче auth и импортируют этот тип.
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  // У аккаунта нет имени — идентификация по email (имя есть только у проекта).
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;
