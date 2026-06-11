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
  // Батч-сохранение изменённых ячеек одним запросом.
  patch: async (pid: string, changes: CellChange[]) =>
    z.object({ updated: z.number() }).parse(
      await httpClient.patch(`/projects/${pid}/translations`, { changes }),
    ),
  // Добавление ключа в раздел.
  addKey: async (pid: string, nsid: string, input: { code: string; comment?: string }) =>
    keySchema.parse(await httpClient.post(`/projects/${pid}/namespaces/${nsid}/keys`, input)),
};
