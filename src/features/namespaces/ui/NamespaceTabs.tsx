import { useState, type ReactNode } from 'react';
import { Skeleton } from '@/shared/ui';
import { PlusIcon, SettingsIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import type { Namespace } from '@/entities/namespace';
import { NamespaceManagerModal } from './NamespaceManagerModal';

const t = texts.app.table;

// Лента вкладок-разделов (вариант A). Горизонтальный скролл при большом числе разделов.
// «+» — быстрое создание раздела (keys:add). Шестерёнка — менеджер разделов (admin,
// ns:manage): список с удалением + создание. Активная вкладка — акцент primary.
export function NamespaceTabs({
  pid,
  namespaces,
  isLoading,
  activeId,
  onSelect,
  onActiveRemoved,
  onCreate,
}: {
  pid: string;
  namespaces: Namespace[];
  isLoading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onActiveRemoved: () => void;
  onCreate: () => void;
}): ReactNode {
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-0.5">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 shrink-0" />
          ))
        : namespaces.map((ns) => {
            const active = ns.id === activeId;
            return (
              <button
                key={ns.id}
                type="button"
                onClick={() => onSelect(ns.id)}
                aria-pressed={active}
                className={[
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors',
                  active
                    ? 'bg-primary font-medium text-white'
                    : 'border border-[var(--border)] bg-surface text-muted hover:bg-subtle',
                ].join(' ')}
              >
                {ns.name}
              </button>
            );
          })}

      <Can perm="keys:add">
        <button
          type="button"
          onClick={onCreate}
          title={t.namespaces.addTooltip}
          aria-label={t.namespaces.add}
          className="flex shrink-0 items-center gap-1 rounded-md border border-dashed border-[var(--border-strong)] px-2.5 py-1.5 text-[13px] text-muted hover:bg-subtle hover:text-ink"
        >
          <PlusIcon size={16} />
        </button>
      </Can>

      <Can perm="ns:manage">
        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          title={t.namespaces.manageTooltip}
          aria-label={t.namespaces.manageTooltip}
          className="flex shrink-0 items-center rounded-md border border-[var(--border)] bg-surface px-2.5 py-1.5 text-muted hover:bg-subtle hover:text-ink"
        >
          <SettingsIcon size={16} />
        </button>
      </Can>

      <NamespaceManagerModal
        pid={pid}
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        namespaces={namespaces}
        activeId={activeId}
        onSelect={onSelect}
        onActiveRemoved={onActiveRemoved}
      />
    </div>
  );
}
