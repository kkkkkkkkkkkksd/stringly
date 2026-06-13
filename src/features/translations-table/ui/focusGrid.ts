// Шаблон колонок редактора Column Focus (общий для заголовка и строк). Вынесен в отдельный
// модуль, чтобы файлы-компоненты экспортировали только компоненты (react-refresh).
// С эталоном (target ≠ база): ключ · база · перевод. Без него (редактируем базовый): ключ · перевод.
const GRID_BASE = 'grid grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]';
const GRID_NOBASE = 'grid grid-cols-[220px_minmax(0,1fr)]';

export const focusGridClass = (showBase: boolean): string => (showBase ? GRID_BASE : GRID_NOBASE);
