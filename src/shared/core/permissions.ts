// CORE: матрица прав (чистая логика, без React). Роли — admin/translator/viewer (docs/11).
// Реальная защита — на бэке; здесь — для UX (что показывать/скрывать).
export type Role = 'admin' | 'translator' | 'viewer';

export type Permission =
  | 'table:read'
  | 'table:write'
  | 'keys:add'
  | 'lang:manage'
  | 'members:manage'
  | 'tokens:manage'
  | 'project:manage';

const CAN: Record<Role, Set<Permission>> = {
  admin: new Set([
    'table:read',
    'table:write',
    'keys:add',
    'lang:manage',
    'members:manage',
    'tokens:manage',
    'project:manage',
  ]),
  translator: new Set(['table:read', 'table:write', 'keys:add']),
  viewer: new Set(['table:read']),
};

export const can = (role: Role, permission: Permission): boolean => CAN[role].has(permission);
