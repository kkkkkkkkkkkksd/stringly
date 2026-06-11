import { z } from 'zod';

// Доменная сущность Namespace (раздел) — docs/06. Тип выбирается при создании и влияет
// на вид ячейки-редактора (plurals — формы CLDR, появятся на Шаге 4).
export const namespaceTypeSchema = z.enum(['strings', 'plurals']);
export type NamespaceType = z.infer<typeof namespaceTypeSchema>;

export const namespaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: namespaceTypeSchema,
  order: z.number().default(0),
});
export type Namespace = z.infer<typeof namespaceSchema>;
