// Параметры запроса строк таблицы. Серверная пагинация + поиск/фильтры (docs/07).
// Поиск/фильтры заложены в контракт, но на Шаге 3 UI неактивен (следующая итерация).
// `page` не входит сюда — им управляет useInfiniteQuery (pageParam).
export type RowsParams = {
  pageSize: number;
  search?: string;
  filter?: 'empty' | null;
  lang?: string | null;
};

export const DEFAULT_PAGE_SIZE = 50;
