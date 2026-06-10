import { z } from 'zod';

// Роль текущего пользователя в проекте (docs/11). Полные права — на бэке.
export const roleSchema = z.enum(['admin', 'translator', 'viewer']);
export type Role = z.infer<typeof roleSchema>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  role: roleSchema.default('admin'),
  createdAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;
