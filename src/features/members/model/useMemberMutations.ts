import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import type { Role } from '@/shared/core';
import { membersApi } from '../api/membersApi';

// Мутации участников (admin-only в UI через <Can perm="members:manage">; защита — на бэке).
export function useUpdateMemberRole(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mid, role }: { mid: string; role: Role }) =>
      membersApi.updateRole(pid, mid, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(pid) }),
  });
}

export function useRemoveMember(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mid: string) => membersApi.remove(pid, mid),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(pid) }),
  });
}
