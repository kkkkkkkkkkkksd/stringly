import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { texts } from '@/shared/resources/i18n';
import { cellKeyOf, useEdits } from '../model/editsStore';

const t = texts.app.table;

// Ячейка обычной строки с инлайн-редактированием (Шаг 4, docs/08).
// МЕМОИЗИРОВАНА и подписана ТОЧЕЧНО на свою запись в буфере правок (s.edits[cellKey]).
// Клик/Enter → input; Enter/Tab/blur — коммит, Esc — отмена. Read-only для viewer.
export const StringCell = memo(function StringCell({
  keyId,
  langCode,
  serverValue,
  rtl,
  editable,
}: {
  keyId: string;
  langCode: string;
  serverValue: string;
  rtl: boolean;
  editable: boolean;
}): ReactNode {
  const cellKey = cellKeyOf(keyId, langCode);
  const edit = useEdits((s) => s.edits[cellKey]);
  const setEdit = useEdits((s) => s.setEdit);
  const removeEdit = useEdits((s) => s.removeEdit);

  const dirty = edit !== undefined;
  const current = dirty ? edit.value ?? '' : serverValue;
  const empty = current.trim() === '';

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const begin = () => {
    if (!editable) return;
    setDraft(current);
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    if (draft === serverValue) removeEdit(cellKey);
    else setEdit(cellKey, { value: draft });
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        dir={rtl ? 'rtl' : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab') commit();
          else if (e.key === 'Escape') {
            e.preventDefault();
            setEditing(false);
          }
        }}
        className="h-full w-full bg-surface px-3 text-sm text-ink outline-none ring-2 ring-inset ring-[color:var(--ring)]"
      />
    );
  }

  return (
    <div
      dir={rtl ? 'rtl' : undefined}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={begin}
      onKeyDown={(e) => {
        if (editable && e.key === 'Enter') {
          e.preventDefault();
          begin();
        }
      }}
      className={[
        'flex h-full w-full items-center truncate px-3 text-sm transition-colors',
        editable ? 'cursor-text' : '',
        dirty
          ? 'text-ink'
          : empty
            ? 'bg-[var(--cell-empty)] text-faint group-hover:bg-[var(--cell-empty-hover)]'
            : 'bg-surface text-ink group-hover:bg-[var(--row-hover)]',
      ].join(' ')}
      style={
        dirty
          ? { background: 'var(--cell-dirty-bg)', boxShadow: 'inset 0 0 0 1.5px var(--cell-dirty-border)' }
          : undefined
      }
    >
      {empty ? t.emptyCell : current}
    </div>
  );
});
