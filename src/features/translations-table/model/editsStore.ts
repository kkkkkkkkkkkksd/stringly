import { create } from 'zustand';

// Буфер несохранённых правок (docs/08). Отдельный от кэша React Query. Ключ ячейки —
// `${keyId}:${langCode}`. Ячейка-редактор подписывается ТОЧЕЧНО на свою запись (селектор
// s => s.edits[cellKey]) → ре-рендерится только она, не вся таблица.
//
// Значение правки: для обычных строк — { value }, для plural — { plural: формы CLDR }.
export type EditValue = { value?: string; plural?: Record<string, string> };

type EditsState = {
  edits: Record<string, EditValue>;
  setEdit: (cellKey: string, value: EditValue) => void;
  removeEdit: (cellKey: string) => void;
  removeKeyEdits: (keyId: string) => void;
  reset: () => void;
};

export const cellKeyOf = (keyId: string, langCode: string): string => `${keyId}:${langCode}`;
export const splitCellKey = (cellKey: string): { keyId: string; langCode: string } => {
  const i = cellKey.indexOf(':');
  return { keyId: cellKey.slice(0, i), langCode: cellKey.slice(i + 1) };
};

export const useEdits = create<EditsState>((set) => ({
  edits: {},
  setEdit: (cellKey, value) => set((s) => ({ edits: { ...s.edits, [cellKey]: value } })),
  removeEdit: (cellKey) =>
    set((s) => {
      if (!(cellKey in s.edits)) return s;
      const next = { ...s.edits };
      delete next[cellKey];
      return { edits: next };
    }),
  // Убрать все правки ключа (например, при его удалении), чтобы не остались «висячие».
  removeKeyEdits: (keyId) =>
    set((s) => {
      const prefix = `${keyId}:`;
      const next = Object.fromEntries(
        Object.entries(s.edits).filter(([k]) => !k.startsWith(prefix)),
      );
      return { edits: next };
    }),
  reset: () => set({ edits: {} }),
}));

// Селектор количества несохранённых правок (для кнопки/панели «Сохранить (N)»).
export const useEditsCount = (): number => useEdits((s) => Object.keys(s.edits).length);
