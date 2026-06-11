import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/react-query';
import type { TablePage } from '@/entities/translation';
import { translationsApi } from '../api/translationsApi';
import { useEdits } from './editsStore';

type RowsInfinite = InfiniteData<TablePage>;
const isRows = (d: unknown): d is RowsInfinite =>
  !!d && typeof d === 'object' && 'pages' in (d as Record<string, unknown>);

// Переименование ключа / изменение комментария — сразу, с оптимистичным апдейтом и откатом.
export function useUpdateKey(pid: string, nsid: string) {
  const qc = useQueryClient();
  const scope = { queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] as QueryKey };
  return useMutation({
    mutationFn: (input: { keyId: string; code?: string; comment?: string }) =>
      translationsApi.updateKey(pid, input.keyId, { code: input.code, comment: input.comment }),
    onMutate: async (input) => {
      await qc.cancelQueries(scope);
      const prev = qc.getQueriesData(scope);
      qc.setQueriesData<RowsInfinite>(scope, (data) => {
        if (!isRows(data)) return data;
        return {
          ...data,
          pages: data.pages.map((pg) => ({
            ...pg,
            rows: pg.rows.map((r) =>
              r.keyId === input.keyId
                ? {
                    ...r,
                    code: input.code ?? r.code,
                    comment: input.comment !== undefined ? input.comment : r.comment,
                  }
                : r,
            ),
          })),
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries(scope),
  });
}

// Полное удаление ключа — сразу, оптимистично (строка исчезает, total уменьшается).
// Заодно убираем несохранённые правки этого ключа из буфера.
export function useDeleteKey(pid: string, nsid: string) {
  const qc = useQueryClient();
  const removeKeyEdits = useEdits((s) => s.removeKeyEdits);
  const scope = { queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] as QueryKey };
  return useMutation({
    mutationFn: (keyId: string) => translationsApi.deleteKey(pid, keyId),
    onMutate: async (keyId) => {
      await qc.cancelQueries(scope);
      const prev = qc.getQueriesData(scope);
      qc.setQueriesData<RowsInfinite>(scope, (data) => {
        if (!isRows(data)) return data;
        return {
          ...data,
          pages: data.pages.map((pg) => {
            const had = pg.rows.some((r) => r.keyId === keyId);
            return {
              ...pg,
              total: had ? Math.max(0, pg.total - 1) : pg.total,
              rows: pg.rows.filter((r) => r.keyId !== keyId),
            };
          }),
        };
      });
      removeKeyEdits(keyId);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries(scope),
  });
}
