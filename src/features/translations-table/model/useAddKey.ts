import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translationsApi } from '../api/translationsApi';

// Добавление ключа в раздел. После успеха инвалидируем весь раздел (префикс) — это и строки
// (новая строка появится), и прогресс по языкам (stats) — total меняется.
export function useAddKey(pid: string, nsid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; comment?: string }) =>
      translationsApi.addKey(pid, nsid, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces', nsid] }),
  });
}
