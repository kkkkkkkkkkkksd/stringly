import { can, type Permission, type Role } from '@/shared/core';
import { useProjects } from './useProjects';
import { useActiveProject } from './activeProjectStore';
import type { Project } from '../api/schemas';

// Текущий активный проект (объект) — из списка проектов по activeProjectId.
export function useCurrentProject(): Project | null {
  const { data } = useProjects();
  const activeId = useActiveProject((s) => s.activeProjectId);
  return data?.find((p) => p.id === activeId) ?? null;
}

// Роль пользователя в активном проекте (по умолчанию viewer — наименьшие права).
export function useRole(): Role {
  return useCurrentProject()?.role ?? 'viewer';
}

// Есть ли у текущей роли право. Используется в UI (что показывать/включать).
export function usePermission(permission: Permission): boolean {
  return can(useRole(), permission);
}
