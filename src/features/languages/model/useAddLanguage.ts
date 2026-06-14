import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { languagesApi } from '../api/languagesApi';

// Добавление языка проекта. Централизованно → новая колонка во всех разделах сразу
// (docs/06, docs/08). Тот же хук используется в настройках (Шаг 5) и в быстром доступе таблицы.
export function useAddLanguage(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { code: string; ai?: boolean }) => languagesApi.add(pid, vars.code, vars.ai),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.languages(pid) });
      qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces'] });
    },
  });
}
