import { z } from 'zod';
import type { Role } from '@/shared/core';

// Доменная сущность Project (единый источник правды). Всё в приложении привязано к pid.
// Role — канонический union живёт в shared/core/permissions (матрица прав там же);
// здесь даём его runtime-схему (Zod на границе API). `satisfies` ловит расхождение
// литералов со списком ролей в shared/core на этапе компиляции.
export const roleSchema = z.enum(['admin', 'translator', 'viewer']) satisfies z.ZodType<Role>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  role: roleSchema.default('admin'),
  createdAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;
