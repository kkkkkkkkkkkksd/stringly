import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { languagesApi } from '../api/languagesApi';

// Языки активного проекта. Общие для всех разделов → колонки таблицы (docs/06, docs/08).
export function useLanguages(pid: string) {
  return useQuery({
    queryKey: qk.languages(pid),
    queryFn: () => languagesApi.list(pid),
    enabled: !!pid,
    staleTime: 5 * 60_000,
  });
}
