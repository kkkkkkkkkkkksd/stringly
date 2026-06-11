import { useState, type ReactNode } from 'react';
import { Badge, Button, ConfirmDialog, EmptyState, Row, Skeleton } from '@/shared/ui';
import { LanguageIcon, PlusIcon, TrashIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import { usePermission } from '@/features/projects/model/access';
import type { Language } from '@/entities/language';
import { useLanguages } from '../model/useLanguages';
import { useDeleteLanguage } from '../model/useDeleteLanguage';
import { useSetBaseLanguage } from '../model/useSetBaseLanguage';
import { AddLanguageModal } from './AddLanguageModal';

const t = texts.app.settings.languages;

// Секция управления языками проекта (дизайн-вариант B: строки-карточки). Живёт внутри
// вкладки «Проект» (а не отдельным пунктом — иначе путается с языком интерфейса).
// Тот же централизованный список, что и быстрый «+ Язык» в таблице. Управление — admin.
export function LanguagesSection({ pid }: { pid: string }): ReactNode {
  const canManage = usePermission('lang:manage');
  const { data: langs, isLoading, isError, refetch } = useLanguages(pid);
  const del = useDeleteLanguage(pid);
  const setBase = useSetBaseLanguage(pid);

  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Language | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-ink">{t.sectionTitle}</h3>
          <p className="mt-0.5 text-sm text-muted">{t.subtitle}</p>
        </div>
        <Can perm="lang:manage">
          {/* Пока языки не загрузились (loading/error) — добавлять некуда: кнопка неактивна. */}
          <Button onClick={() => setAdding(true)} disabled={isLoading || isError}>
            <PlusIcon size={16} />
            {t.add}
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[58px] w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<LanguageIcon size={28} />}
          title={t.loadError}
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              {t.retry}
            </Button>
          }
        />
      ) : (
        <>
          <div className="text-xs text-muted">{t.count(langs?.length ?? 0)}</div>
          <ul className="space-y-2">
            {(langs ?? []).map((lang) => (
              <li key={lang.id}>
                <Row>
                  <span className="flex h-8 min-w-12 items-center justify-center rounded-md bg-subtle px-2 font-mono text-xs text-muted">
                    {lang.code}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm text-ink">{lang.name}</span>
                    {lang.rtl ? <Badge tone="neutral">{t.rtlBadge}</Badge> : null}
                  </div>

                  {lang.isBase ? (
                    <Badge tone="primary">{t.baseBadge}</Badge>
                  ) : (
                    <Can perm="lang:manage">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setBase.mutate(lang.id)}
                        disabled={setBase.isPending}
                      >
                        {setBase.isPending && setBase.variables === lang.id
                          ? t.settingBase
                          : t.setBase}
                      </Button>
                    </Can>
                  )}

                  {/* Базовый язык удалить нельзя (docs/06): кнопка только у неосновных. */}
                  {!lang.isBase && canManage ? (
                    <button
                      type="button"
                      aria-label={t.delete}
                      onClick={() => setToDelete(lang)}
                      className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-[color:var(--danger)]"
                    >
                      <TrashIcon size={18} />
                    </button>
                  ) : null}
                </Row>
              </li>
            ))}
          </ul>

          {!canManage ? <p className="text-xs text-faint">{t.readOnlyHint}</p> : null}
        </>
      )}

      <AddLanguageModal pid={pid} open={adding} onClose={() => setAdding(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
        title={t.deleteTitle}
        message={toDelete ? t.deleteConfirm(toDelete.name) : ''}
        confirmLabel={t.deleteBtn}
        cancelLabel={t.cancel}
        closeLabel={t.close}
        danger
        pending={del.isPending}
      />
    </section>
  );
}
