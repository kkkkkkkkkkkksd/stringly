import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translationsApi } from '../api/translationsApi';

// Добавление ключа в раздел. После успеха инвалидируем строки раздела (новая строка появится).
export function useAddKey(pid: string, nsid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; comment?: string }) =>
      translationsApi.addKey(pid, nsid, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] }),
  });
}
