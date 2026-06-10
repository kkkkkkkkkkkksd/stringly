import type { ReactNode } from 'react';
import type { Permission } from '@/shared/core';
import { usePermission } from '../model/access';

// Гард-обёртка: показывает children только при наличии права у текущей роли (docs/11).
// Реальная защита — на бэке; здесь скрываем недоступные действия для UX.
export function Can({
  perm,
  children,
  fallback = null,
}: {
  perm: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}): ReactNode {
  return usePermission(perm) ? <>{children}</> : <>{fallback}</>;
}
