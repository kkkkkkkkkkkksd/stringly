import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/react-query';
import type { TablePage, TableRow } from '@/entities/translation';
import { toast } from '@/shared/services/toast';
import { texts } from '@/shared/resources/i18n';
import { translationsApi } from '../api/translationsApi';
import type { CellChange } from './changes';
import { useEdits } from './editsStore';

type RowsInfinite = InfiniteData<TablePage>;
const isRowsData = (d: unknown): d is RowsInfinite =>
  !!d && typeof d === 'object' && 'pages' in (d as Record<string, unknown>);

// Применяет правки к строке (оптимистично). value для strings, plural-формы для plurals.
function applyToRow(row: TableRow, changes: CellChange[]): TableRow {
  const mine = changes.filter((c) => c.keyId === row.keyId);
  if (mine.length === 0) return row;
  const values = { ...row.values };
  for (const c of mine) {
    const display = c.value ?? c.plural?.other ?? c.plural?.one ?? '';
    values[c.langCode] = {
      value: display,
      status: display ? 'reviewed' : 'empty',
      ...(c.plural ? { plural: c.plural } : {}),
    };
  }
  return { ...row, values };
}

// Батч-PATCH с оптимистичным апдейтом и откатом (docs/07). Затрагивает все кэши строк
// проекта (правки могут быть в разных разделах). После успеха — очистка буфера.
export function useSaveTranslations(pid: string) {
  const qc = useQueryClient();
  const reset = useEdits((s) => s.reset);
  const scope = { queryKey: ['projects', pid, 'namespaces'] as QueryKey };

  return useMutation({
    mutationFn: (changes: CellChange[]) => translationsApi.patch(pid, changes),
    onMutate: async (changes) => {
      await qc.cancelQueries(scope);
      const prev = qc.getQueriesData(scope);
      qc.setQueriesData<RowsInfinite>(scope, (data) => {
        if (!isRowsData(data)) return data;
        return {
          ...data,
          pages: data.pages.map((pg) => ({ ...pg, rows: pg.rows.map((r) => applyToRow(r, changes)) })),
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      // Текст ошибки покажет глобальный обработчик (тост) — здесь только откат.
    },
    onSuccess: (_data, changes) => {
      reset();
      toast.success(texts.app.table.saveBar.saved(changes.length));
    },
    onSettled: () => qc.invalidateQueries(scope),
  });
}
