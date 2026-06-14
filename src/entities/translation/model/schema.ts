import { z } from 'zod';

// DTO таблицы переводов (docs/06 «Денормализация для таблицы»). API отдаёт строки уже
// «сшитыми»: ключ + словарь значений по коду языка — это снижает число запросов и
// упрощает рендер.
//
// ПРИМЕЧАНИЕ по статусам: поле `status` остаётся в контракте (Шаг 6 — статусы ревью), но
// на Шагах 3–4 UI различает только «пусто vs заполнено» (по `value`). Статусную машину
// (draft/reviewed) намеренно откладываем — см. обсуждение Шага 3.
export const cellStatusSchema = z.enum(['empty', 'draft', 'reviewed']);
export type CellStatus = z.infer<typeof cellStatusSchema>;

export const cellSchema = z.object({
  value: z.string(),
  status: cellStatusSchema.default('empty'),
  // для plural-разделов: формы CLDR (one/other/…). value = форма 'other' (для показа в гриде).
  plural: z.record(z.string(), z.string()).optional(),
  // значение сгенерировано AI и ещё не отредактировано человеком (метка ✨AI). После
  // ручной правки/сохранения сбрасывается в false (см. mock PATCH).
  ai: z.boolean().default(false),
});
export type Cell = z.infer<typeof cellSchema>;

export const tableRowSchema = z.object({
  keyId: z.string(),
  code: z.string(), // "[copy]", "[try_again]"
  comment: z.string().optional(),
  // словарь: код языка → ячейка
  values: z.record(z.string(), cellSchema),
});
export type TableRow = z.infer<typeof tableRowSchema>;

export const tablePageSchema = z.object({
  rows: z.array(tableRowSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(), // всего ключей в namespace (для пагинации/прогресса)
});
export type TablePage = z.infer<typeof tablePageSchema>;
