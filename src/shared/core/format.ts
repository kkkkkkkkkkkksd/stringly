// CORE: чистые форматтеры/преобразования.

// Дата (ISO) → человекочитаемый вид (ru). Невалидную строку отдаём как есть.
export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(d);
};

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
