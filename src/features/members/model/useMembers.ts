import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { membersApi } from '../api/membersApi';

// Участники активного проекта. Виден всем ролям (docs/11) — гард только на действиях.
export function useMembers(pid: string) {
  return useQuery({
    queryKey: qk.members(pid),
    queryFn: () => membersApi.list(pid),
    enabled: !!pid,
  });
}
