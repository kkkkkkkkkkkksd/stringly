import { z } from 'zod';

// Доменная сущность Language (docs/06). Языки задаются ОДИН раз на уровне проекта —
// все namespaces берут из них колонки таблицы автоматически. RTL → ячейка dir="rtl".
export const languageSchema = z.object({
  id: z.string(),
  code: z.string(), // "en", "ru", "ar", "pt-BR"
  name: z.string(), // "English"
  isBase: z.boolean().default(false),
  rtl: z.boolean().default(false),
});
export type Language = z.infer<typeof languageSchema>;
