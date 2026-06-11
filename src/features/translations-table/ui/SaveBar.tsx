import type { ReactNode } from 'react';
import { Button } from '@/shared/ui';
import { SaveIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useEdits, useEditsCount } from '../model/editsStore';
import { editsToChanges } from '../model/changes';
import { useSaveTranslations } from '../model/useSaveTranslations';

const t = texts.app.table.saveBar;

// Плавающая панель снизу: появляется при наличии несохранённых правок (docs/08).
// Счётчик + «Сохранить» (батч-PATCH) + «Сбросить».
export function SaveBar({ pid }: { pid: string }): ReactNode {
  const count = useEditsCount();
  const edits = useEdits((s) => s.edits);
  const reset = useEdits((s) => s.reset);
  const save = useSaveTranslations(pid);

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-[var(--border)] bg-surface px-4 py-2.5 shadow-pop">
        <span className="text-sm text-ink">{t.unsaved(count)}</span>
        <Button variant="ghost" size="sm" onClick={reset} disabled={save.isPending}>
          {t.discard}
        </Button>
        <Button size="sm" onClick={() => save.mutate(editsToChanges(edits))} disabled={save.isPending}>
          <SaveIcon size={16} />
          {save.isPending ? t.saving : t.save}
        </Button>
      </div>
    </div>
  );
}
