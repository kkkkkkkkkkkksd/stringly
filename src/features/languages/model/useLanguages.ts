import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { languagesApi } from '../api/languagesApi';

// Языки активного проекта. Общие для всех разделов → колонки таблицы (docs/06, docs/08).
// Базовый язык всегда первым (как первая языковая колонка в таблице, после code/comment);
// порядок остальных сохраняется (Array.sort стабилен). Сортировка здесь — единый источник
// для таблицы и настроек: после смены базового он сразу поднимается наверх в обоих местах.
export function useLanguages(pid: string) {
  return useQuery({
    queryKey: qk.languages(pid),
    queryFn: () => languagesApi.list(pid),
    enabled: !!pid,
    staleTime: 5 * 60_000,
    select: (langs) => [...langs].sort((a, b) => Number(b.isBase) - Number(a.isBase)),
  });
}
