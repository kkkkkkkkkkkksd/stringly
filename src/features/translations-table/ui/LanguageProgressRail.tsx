import type { ReactNode } from 'react';
import { ProgressBar, Skeleton } from '@/shared/ui';
import { PlusIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import type { LangProgress } from '../model/useLanguageProgress';

const t = texts.app.table.focus;

// Правый рейл прогресса заполнения по языкам (Column Focus). Базовый язык — эталон
// (не выбирается целью). Клик по языку делает его целевым. «+ язык» — добавление локали.
export function LanguageProgressRail({
  progress,
  isLoading,
  targetCode,
  onSelect,
  onAddLanguage,
}: {
  progress: LangProgress[];
  isLoading: boolean;
  targetCode: string | null;
  onSelect: (code: string) => void;
  onAddLanguage: () => void;
}): ReactNode {
  return (
    <aside className="flex w-60 shrink-0 flex-col rounded-lg border border-[var(--border)] bg-surface">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wide text-faint">
          {t.rail.title} · {progress.length}
        </span>
        <Can perm="lang:manage">
          <button
            type="button"
            onClick={onAddLanguage}
            aria-label={t.rail.addLanguage}
            title={t.rail.addLanguage}
            className="rounded-md p-1 text-muted hover:bg-subtle hover:text-ink"
          >
            <PlusIcon size={16} />
          </button>
        </Can>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-1.5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="mb-1 h-9 w-full" />)
        ) : (
          progress.map((lang) => {
            const active = lang.code === targetCode;
            const base = lang.isBase;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelect(lang.code)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-subtle',
                  active ? 'bg-primary-tint' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'min-w-0 flex-1 truncate',
                    active ? 'text-primary-hover' : 'text-ink',
                  ].join(' ')}
                  title={lang.name}
                >
                  <span className="font-mono text-[11px] text-muted">{lang.code}</span> {lang.name}
                </span>
                <ProgressBar value={lang.pct} className="w-10" tone={base ? 'primary' : 'success'} />
                <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-faint">
                  {t.progress(lang.pct)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
