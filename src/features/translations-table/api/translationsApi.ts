import { httpClient } from '@/shared/services/network';
import { tablePageSchema } from '@/entities/translation';
import type { RowsParams } from '../model/rowsParams';

// Слой данных таблицы переводов (docs/07). Серверная пагинация: одна страница за запрос.
// Мутации (addKey/patch/deleteKey) появятся на Шаге 4 — здесь только чтение.
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
};
