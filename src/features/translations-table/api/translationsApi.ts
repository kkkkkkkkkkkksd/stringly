import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { tablePageSchema } from '@/entities/translation';
import type { RowsParams } from '../model/rowsParams';
import type { CellChange } from '../model/changes';

const keySchema = z.object({
  id: z.string(),
  code: z.string(),
  comment: z.string().optional(),
});

// Прогресс заполнения по языкам в разделе (считается на сервере — не из строк на клиенте,
// чтобы оставаться масштабируемым при тысячах ключей). filled/total по каждому языку.
export const langStatSchema = z.object({
  code: z.string(),
  name: z.string(),
  isBase: z.boolean(),
  rtl: z.boolean(),
  filled: z.number(),
  total: z.number(),
});
export type LangStat = z.infer<typeof langStatSchema>;
const langStatsSchema = z.object({ stats: z.array(langStatSchema), total: z.number() });

// Слой данных таблицы переводов (docs/07). Серверная пагинация: одна страница за запрос.
export const translationsApi = {
  getRows: async (pid: string, nsid: string, params: RowsParams & { page: number }) => {
    const qs = new URLSearchParams();
    qs.set('page', String(params.page));
    qs.set('pageSize', String(params.pageSize));
    if (params.search) qs.set('search', params.search);
    if (params.filter) qs.set('filter', params.filter);
    if (params.lang) qs.set('lang', params.lang);
    return tablePageSchema.parse(
      await httpClient.get(`/projects/${pid}/namespaces/${nsid}/rows?${qs.toString()}`),
    );
  },
  // Прогресс заполнения по языкам в разделе (для рейла Column Focus).
  languageStats: async (pid: string, nsid: string) =>
    langStatsSchema.parse(
      await httpClient.get(`/projects/${pid}/namespaces/${nsid}/stats`),
    ),
  // Батч-сохранение изменённых ячеек одним запросом.
  patch: async (pid: string, changes: CellChange[]) =>
    z.object({ updated: z.number() }).parse(
      await httpClient.patch(`/projects/${pid}/translations`, { changes }),
    ),
  // Добавление ключа в раздел: code + (опц.) базовый перевод + флаг AI-доперевода.
  addKey: async (
    pid: string,
    nsid: string,
    input: { code: string; comment?: string; baseValue?: string; ai?: boolean },
  ) => keySchema.parse(await httpClient.post(`/projects/${pid}/namespaces/${nsid}/keys`, input)),
  // AI-дозаполнение пустых ячеек языка в разделе (мок). Возвращает число заполненных.
  aiFill: async (pid: string, nsid: string, langCode: string) =>
    z.object({ filled: z.number() }).parse(
      await httpClient.post(`/projects/${pid}/namespaces/${nsid}/ai-fill`, { langCode }),
    ),
  // Переименование ключа / изменение комментария.
  updateKey: async (pid: string, keyId: string, input: { code?: string; comment?: string }) =>
    keySchema.parse(await httpClient.patch(`/projects/${pid}/keys/${keyId}`, input)),
  // Полное удаление ключа.
  deleteKey: async (pid: string, keyId: string) =>
    httpClient.delete<void>(`/projects/${pid}/keys/${keyId}`),
};
