import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { memberSchema } from '@/entities/member';
import type { Role } from '@/shared/core';

// Участники проекта (docs/07). Список виден всем ролям (read-only для не-admin);
// смена роли / удаление — только admin (проверяется и на бэке). В MVP приглашение
// новых участников — заглушка (F-27, v2), но контракт заложен заранее.
export const membersApi = {
  list: async (pid: string) =>
    z.array(memberSchema).parse(await httpClient.get(`/projects/${pid}/members`)),
  updateRole: async (pid: string, mid: string, role: Role) =>
    memberSchema.parse(await httpClient.patch(`/projects/${pid}/members/${mid}`, { role })),
  remove: async (pid: string, mid: string) =>
    httpClient.delete<void>(`/projects/${pid}/members/${mid}`),
};
