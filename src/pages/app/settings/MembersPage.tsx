import { useState, type ReactNode } from 'react';
import { Badge, Button, ConfirmDialog, EmptyState, InitialAvatar, Row, Select, Skeleton } from '@/shared/ui';
import { PlusIcon, TrashIcon, InboxIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import type { Role } from '@/shared/core';
import { Can } from '@/features/projects/ui/Can';
import { useCurrentProject, usePermission } from '@/features/projects/model/access';
import { useMembers } from '@/features/members/model/useMembers';
import { useUpdateMemberRole, useRemoveMember } from '@/features/members/model/useMemberMutations';
import type { Member } from '@/entities/member';

const t = texts.app.settings.members;
const ROLE_ORDER: Role[] = ['admin', 'translator', 'viewer'];

// Настройки → Участники (дизайн-вариант B: строки-карточки). Список виден всем ролям
// (read-only для не-admin, docs/11). Смена ролей / удаление — только admin
// (<Can perm="members:manage">); свою строку менять/удалять нельзя. Приглашение новых
// участников — заглушка (видимая, но неактивная; F-27, v2).
export function MembersPage(): ReactNode {
  const pid = useCurrentProject()?.id ?? '';
  const canManage = usePermission('members:manage');
  const { data: members, isLoading, isError, refetch } = useMembers(pid);
  const updateRole = useUpdateMemberRole(pid);
  const remove = useRemoveMember(pid);

  const [toRemove, setToRemove] = useState<Member | null>(null);

  // Своя строка — первой, дальше по дате вступления.
  const sorted = [...(members ?? [])].sort((a, b) =>
    a.isYou === b.isYou ? a.createdAt.localeCompare(b.createdAt) : a.isYou ? -1 : 1,
  );

  const displayName = (m: Member) => m.name ?? m.email;

  return (
    <div className="max-w-2xl space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-ink">{t.title}</h2>
          <p className="mt-0.5 text-sm text-muted">{t.subtitle}</p>
        </div>
        <Can perm="members:manage">
          {/* Заглушка: приглашение участников — v2. Видимый, но неактивный UI. */}
          <Button variant="secondary" disabled title={t.inviteSoon}>
            <PlusIcon size={16} />
            {t.invite}
          </Button>
        </Can>
      </header>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[62px] w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<InboxIcon size={28} />}
          title={t.loadError}
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              {t.retry}
            </Button>
          }
        />
      ) : (
        <>
          <div className="text-xs text-muted">{t.count(sorted.length)}</div>
          <ul className="space-y-2">
            {sorted.map((m) => {
              const editable = canManage && !m.isYou;
              return (
                <li key={m.id}>
                  <Row>
                    <InitialAvatar name={displayName(m)} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm text-ink">{displayName(m)}</span>
                        {m.isYou ? <Badge tone="primary">{t.you}</Badge> : null}
                      </div>
                      <p className="truncate text-xs text-muted">{m.email}</p>
                    </div>

                    {editable ? (
                      <Select
                        aria-label={t.roleLabel}
                        value={m.role}
                        className="w-40"
                        disabled={updateRole.isPending}
                        onChange={(e) =>
                          updateRole.mutate({ mid: m.id, role: e.target.value as Role })
                        }
                      >
                        {ROLE_ORDER.map((r) => (
                          <option key={r} value={r}>
                            {t.roles[r]}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Badge tone={m.role === 'admin' ? 'info' : 'neutral'}>{t.roles[m.role]}</Badge>
                    )}

                    {editable ? (
                      <button
                        type="button"
                        aria-label={t.remove}
                        onClick={() => setToRemove(m)}
                        className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-[color:var(--danger)]"
                      >
                        <TrashIcon size={18} />
                      </button>
                    ) : null}
                  </Row>
                </li>
              );
            })}
          </ul>

          {!canManage ? <p className="text-xs text-faint">{t.readOnlyHint}</p> : null}
        </>
      )}

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={() => {
          if (toRemove) remove.mutate(toRemove.id, { onSuccess: () => setToRemove(null) });
        }}
        title={t.removeTitle}
        message={toRemove ? t.removeConfirm(toRemove.name ?? toRemove.email) : ''}
        confirmLabel={t.removeBtn}
        cancelLabel={t.cancel}
        closeLabel={t.close}
        danger
        pending={remove.isPending}
      />
    </div>
  );
}
