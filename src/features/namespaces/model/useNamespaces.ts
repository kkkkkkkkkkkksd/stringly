import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import type { Namespace, NamespaceType } from '@/entities/namespace';
import { namespacesApi } from '../api/namespacesApi';

// Список разделов активного проекта (вкладки).
export function useNamespaces(pid: string) {
  return useQuery({
    queryKey: qk.namespaces(pid),
    queryFn: () => namespacesApi.list(pid),
    enabled: !!pid,
    staleTime: 5 * 60_000,
  });
}

// Создание раздела с выбором типа (strings | plurals). Обновляем кэш сразу + инвалидация.
export function useCreateNamespace(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type: NamespaceType }) => namespacesApi.create(pid, input),
    onSuccess: (ns) => {
      qc.setQueryData<Namespace[]>(qk.namespaces(pid), (old) => (old ? [...old, ns] : [ns]));
      qc.invalidateQueries({ queryKey: qk.namespaces(pid) });
    },
  });
}

// Удаление раздела (admin, <Can perm="ns:manage">). Снимаем из кэша вкладок и убираем
// закэшированные строки удалённого раздела (они больше не нужны).
export function useDeleteNamespace(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nsid: string) => namespacesApi.remove(pid, nsid),
    onSuccess: (_data, nsid) => {
      qc.setQueryData<Namespace[]>(qk.namespaces(pid), (old) =>
        old ? old.filter((n) => n.id !== nsid) : old,
      );
      qc.invalidateQueries({ queryKey: qk.namespaces(pid) });
      qc.removeQueries({ queryKey: [...qk.namespaces(pid), nsid] });
    },
  });
}
