import { memo, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cellKeyOf, useEdits } from '../model/editsStore';

// Поле перевода обычной строки (Column Focus). Просторный авто-растущий textarea — текст
// виден целиком, без обрезки. МЕМОИЗИРОВАН + ТОЧЕЧНАЯ подписка на буфер правок
// (s.edits[cellKey]) → ре-рендерится только эта ячейка (docs/08). Источник правды —
// editsStore: «Сбросить» в SaveBar очищает буфер и поле возвращается к серверному значению.
export const FocusStringInput = memo(function FocusStringInput({
  keyId,
  langCode,
  serverValue,
  rtl,
  editable,
  placeholder,
}: {
  keyId: string;
  langCode: string;
  serverValue: string;
  rtl: boolean;
  editable: boolean;
  placeholder: string;
}): ReactNode {
  const cellKey = cellKeyOf(keyId, langCode);
  const edit = useEdits((s) => s.edits[cellKey]);
  const setEdit = useEdits((s) => s.setEdit);
  const removeEdit = useEdits((s) => s.removeEdit);

  const dirty = edit !== undefined;
  const value = dirty ? edit.value ?? '' : serverValue;

  const taRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value]);

  const change = (v: string) => {
    if (v === serverValue) removeEdit(cellKey);
    else setEdit(cellKey, { value: v });
  };

  return (
    <textarea
      ref={taRef}
      dir={rtl ? 'rtl' : undefined}
      value={value}
      readOnly={!editable}
      placeholder={editable ? placeholder : undefined}
      onChange={(e) => change(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          removeEdit(cellKey);
          e.currentTarget.blur();
        }
      }}
      rows={1}
      className={[
        'w-full resize-none overflow-hidden rounded-md border bg-transparent px-3 py-2 text-sm text-ink',
        'placeholder:text-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
        editable ? 'cursor-text hover:bg-page' : 'cursor-default',
        dirty ? 'border-[color:var(--cell-dirty-border)] bg-[var(--cell-dirty-bg)]' : 'border-transparent',
      ].join(' ')}
    />
  );
});
