import { useState, type ReactNode } from 'react';
import { Badge, Button, ConfirmDialog, EmptyState, Modal, Row } from '@/shared/ui';
import { PlusIcon, TrashIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import type { Namespace } from '@/entities/namespace';
import { useDeleteNamespace } from '../model/useNamespaces';
import { NamespaceForm } from './NamespaceForm';

const t = texts.app.table.namespaces;
const tb = texts.app.table.typeBadge;

// Менеджер разделов (admin, <Can perm="ns:manage">): список разделов с удалением +
// создание внутри (NamespaceForm). Открывается шестерёнкой в ленте вкладок. Удаление
// раздела разрушительно → подтверждение. Если удалён активный — родитель переключает.
export function NamespaceManagerModal({
  pid,
  open,
  onClose,
  namespaces,
  activeId,
  onSelect,
  onActiveRemoved,
}: {
  pid: string;
  open: boolean;
  onClose: () => void;
  namespaces: Namespace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onActiveRemoved: () => void;
}): ReactNode {
  const del = useDeleteNamespace(pid);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Namespace | null>(null);

  const close = () => {
    setCreating(false);
    setToDelete(null);
    onClose();
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const removedId = toDelete.id;
    del.mutate(removedId, {
      onSuccess: () => {
        // Переключение активного раздела, если удалили текущий.
        if (removedId === activeId) {
          const next = namespaces.find((n) => n.id !== removedId);
          if (next) onSelect(next.id);
          else onActiveRemoved();
        }
        setToDelete(null);
      },
    });
  };

  return (
    <Modal open={open} onClose={close} title={t.managerTitle} closeLabel={t.managerClose}>
      {creating ? (
        <NamespaceForm
          pid={pid}
          onCreated={(id) => {
            onSelect(id);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t.count(namespaces.length)}</span>
            <Can perm="keys:add">
              <Button size="sm" onClick={() => setCreating(true)}>
                <PlusIcon size={15} />
                {t.addBtn}
              </Button>
            </Can>
          </div>

          {namespaces.length === 0 ? (
            <EmptyState title={t.empty} />
          ) : (
            <ul className="max-h-80 space-y-2 overflow-auto">
              {namespaces.map((ns) => (
                <li key={ns.id}>
                  <Row>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{ns.name}</span>
                    <Badge tone={ns.type === 'plurals' ? 'neutral' : 'primary'}>
                      {tb[ns.type]}
                    </Badge>
                    <Can perm="ns:manage">
                      <button
                        type="button"
                        aria-label={t.delete}
                        onClick={() => setToDelete(ns)}
                        className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-[color:var(--danger)]"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </Can>
                  </Row>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={t.deleteTitle}
        message={toDelete ? t.deleteConfirm(toDelete.name) : ''}
        confirmLabel={t.deleteBtn}
        cancelLabel={texts.common.actions.cancel}
        closeLabel={t.managerClose}
        danger
        pending={del.isPending}
      />
    </Modal>
  );
}
