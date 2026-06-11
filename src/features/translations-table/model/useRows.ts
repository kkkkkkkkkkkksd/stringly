import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { translationsApi } from '../api/translationsApi';
import type { RowsParams } from './rowsParams';

// Строки таблицы: серверная пагинация + бесконечный скролл (docs/07, docs/08).
// Никогда не тянем весь namespace целиком — страницами по pageSize.
export function useRows(pid: string, nsid: string | null, params: RowsParams) {
  return useInfiniteQuery({
    queryKey: qk.rows(pid, nsid ?? '', params),
    queryFn: ({ pageParam }) =>
      translationsApi.getRows(pid, nsid as string, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled: !!pid && !!nsid,
    placeholderData: keepPreviousData, // плавное переключение разделов/страниц без мерцания
    staleTime: 30_000,
  });
}
