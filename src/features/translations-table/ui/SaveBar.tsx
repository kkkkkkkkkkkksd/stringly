import { useEffect, type ReactNode } from 'react';
import { Button } from '@/shared/ui';
import { SaveIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useEdits, useEditsCount } from '../model/editsStore';
import { editsToChanges } from '../model/changes';
import { useSaveTranslations } from '../model/useSaveTranslations';

const t = texts.app.table.saveBar;

// Плавающая панель снизу: появляется при наличии несохранённых правок (docs/08).
// Счётчик + «Сохранить» (батч-PATCH) + «Сбросить». Горячая клавиша Ctrl/⌘+Enter — сохранить.
export function SaveBar({ pid }: { pid: string }): ReactNode {
  const count = useEditsCount();
  const edits = useEdits((s) => s.edits);
  const reset = useEdits((s) => s.reset);
  const save = useSaveTranslations(pid);

  const pending = save.isPending;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && count > 0 && !pending) {
        e.preventDefault();
        save.mutate(editsToChanges(useEdits.getState().edits));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count, pending, save]);

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-[var(--border)] bg-surface px-4 py-2.5 shadow-pop">
        <span className="text-sm text-ink">{t.unsaved(count)}</span>
        <Button variant="ghost" size="sm" onClick={reset} disabled={pending}>
          {t.discard}
        </Button>
        <Button size="sm" onClick={() => save.mutate(editsToChanges(edits))} disabled={pending}>
          <SaveIcon size={16} />
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </div>
  );
}
