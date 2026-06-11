import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { texts } from '@/shared/resources/i18n';
import { cellKeyOf, useEdits } from '../model/editsStore';

const t = texts.app.table;
const MIN_EDIT_WIDTH = 320; // редактор раскрывается минимум до этой ширины

// Ячейка обычной строки с инлайн-редактированием (Шаг 4, docs/08).
// МЕМОИЗИРОВАНА + точечная подписка на буфер правок (s.edits[cellKey]).
// При правке ячейка раскрывается в авто-растущий textarea поверх соседних (через портал,
// чтобы не обрезалось overflow и не сдвигало таблицу) — длинный текст виден целиком.
// Чтение: полный текст в title (тултип по наведению). Read-only для viewer.
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

  const cellRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null,
  );

  const begin = () => {
    if (!editable) return;
    const r = cellRef.current?.getBoundingClientRect();
    if (r) setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setDraft(current);
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    if (draft === serverValue) removeEdit(cellKey);
    else setEdit(cellKey, { value: draft });
  };

  const autosize = () => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    if (!editing) return;
    const ta = taRef.current;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
      autosize();
    }
  }, [editing]);

  // Скролл делает позицию неактуальной → закрываем (коммитим) редактор.
  useEffect(() => {
    if (!editing) return;
    const onScroll = () => commit();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft, serverValue]);

  const width = rect ? Math.max(rect.width, MIN_EDIT_WIDTH) : MIN_EDIT_WIDTH;
  const left = rect
    ? Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    : 0;

  return (
    <>
      <div
        ref={cellRef}
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
        title={!empty ? current : undefined}
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

      {editing && rect
        ? createPortal(
            <textarea
              ref={taRef}
              dir={rtl ? 'rtl' : undefined}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                autosize();
              }}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setEditing(false);
                } else if (e.key === 'Tab') {
                  commit();
                }
              }}
              style={{
                position: 'fixed',
                top: rect.top,
                left,
                width,
                minHeight: rect.height,
                zIndex: 50,
              }}
              className="resize-none overflow-hidden rounded-md border-2 border-[color:var(--primary)] bg-surface px-3 py-2 text-sm text-ink shadow-pop outline-none"
            />,
            document.body,
          )
        : null}
    </>
  );
});
