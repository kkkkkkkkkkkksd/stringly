import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { languagesApi } from '../api/languagesApi';

// Удаление языка проекта. Колонка исчезает во всех разделах. Базовый язык удалять нельзя
// (ограничение проверяется в UI: пункт недоступен; смена базового — Шаг 5).
export function useDeleteLanguage(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lid: string) => languagesApi.remove(pid, lid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.languages(pid) });
      qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces'] });
    },
  });
}
