import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/services/toast';
import { texts } from '@/shared/resources/i18n';
import { translationsApi } from '../api/translationsApi';

// AI-дозаполнение пустых ячеек одного языка в активном разделе (мок). После успеха
// инвалидируем раздел (строки + прогресс по языкам) и показываем тост с числом заполненных.
export function useAiFill(pid: string, nsid: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (langCode: string) => translationsApi.aiFill(pid, nsid as string, langCode),
    onSuccess: ({ filled }) => {
      qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces', nsid] });
      toast.success(texts.app.table.ai.filled(filled));
    },
  });
}
