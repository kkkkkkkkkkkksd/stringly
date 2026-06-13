import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { translationsApi, type LangStat } from '../api/translationsApi';

// Прогресс заполнения по языкам в активном разделе (рейл Column Focus). Считается на
// сервере (масштабируемо), не из загруженных строк. Базовый язык — первым (как колонки).
// Инвалидация после сохранения происходит автоматически: батч-PATCH сбрасывает кэш
// ['projects', pid, 'namespaces', …], а ключ stats лежит под этим префиксом.
export type LangProgress = LangStat & { pct: number };

export function useLanguageProgress(pid: string, nsid: string | null) {
  return useQuery({
    queryKey: qk.langStats(pid, nsid ?? ''),
    queryFn: () => translationsApi.languageStats(pid, nsid as string),
    enabled: !!pid && !!nsid,
    staleTime: 30_000,
    meta: { silentError: true },
    select: (data): LangProgress[] =>
      [...data.stats]
        .sort((a, b) => Number(b.isBase) - Number(a.isBase))
        .map((s) => ({ ...s, pct: s.total === 0 ? 0 : Math.round((s.filled / s.total) * 100) })),
  });
}
