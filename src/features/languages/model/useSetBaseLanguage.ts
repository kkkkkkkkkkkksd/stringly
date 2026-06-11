import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { languagesApi } from '../api/languagesApi';

// Смена базового языка проекта. Базовый ровно один (docs/06) — бэк снимает флаг с
// прежнего. Инвалидируем список языков (и колонки таблицы зависят от него).
export function useSetBaseLanguage(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lid: string) => languagesApi.setBase(pid, lid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.languages(pid) });
      qc.invalidateQueries({ queryKey: qk.namespaces(pid) });
    },
  });
}
