import type { EditValue } from './editsStore';
import { splitCellKey } from './editsStore';

// Одна правка ячейки для батч-PATCH (docs/07): value для strings, plural-формы для plurals.
export type CellChange = {
  keyId: string;
  langCode: string;
  value?: string;
  plural?: Record<string, string>;
};

// Преобразует буфер правок в массив изменений для отправки.
export function editsToChanges(edits: Record<string, EditValue>): CellChange[] {
  return Object.entries(edits).map(([cellKey, v]) => {
    const { keyId, langCode } = splitCellKey(cellKey);
    return v.plural ? { keyId, langCode, plural: v.plural } : { keyId, langCode, value: v.value ?? '' };
  });
}
