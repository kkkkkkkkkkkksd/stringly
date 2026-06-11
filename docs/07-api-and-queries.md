# 07. API-контракт и слой запросов (React Query)

Это и есть «масштабируемая аналитика по запросам»: какие данные нужны экранам, как они
ходят к бэку и как это организовано на фронте, чтобы расти без боли. Бэка ещё нет —
поэтому сначала описываем **контракт**, а на фронте делаем его реализуемым через mock.

## Принципы слоя данных

1. **Единый HTTP-клиент** с интерсепторами (токен, refresh, обработка ошибок, базовый URL из env).
2. **Все запросы — через React Query.** Никаких «голых» fetch в компонентах.
3. **Централизованные query keys** (фабрика) → предсказуемая инвалидация кэша.
4. **Серверная пагинация/фильтрация** — таблица не грузит всё разом.
5. **Оптимистичные мутации** для правок ячеек → мгновенный отклик UI.
6. **Контракт = Zod-схемы** → ответы валидируются, типы выводятся.

## REST-контракт (черновик для бэка)

Базовый префикс `/api/v1`. Авторизация — `Authorization: Bearer <accessToken>`.

### Auth (упрощённо: один бессрочный токен, без refresh)
```
POST /auth/register   { email, password, name? }      → { user, accessToken }
POST /auth/login      { email, password }              → { user, accessToken }
POST /auth/logout                                      → 204
GET  /auth/me                                          → { user }
```

### Проекты / участники / языки / разделы
```
GET  /projects                                         → Project[]   (с ролью текущего юзера)
POST /projects                  { name }               → Project      // онбординг; в MVP UI «+ Проект» = заглушка
GET  /projects/:pid/members                            → Member[]     (виден всем участникам)
PATCH  /projects/:pid/members/:uid  { role }           → Member        // только admin
DELETE /projects/:pid/members/:uid                     → 204           // только admin
GET  /projects/:pid/languages                          → Language[]   // централизованно, общие колонки
POST /projects/:pid/languages   { code }               → Language      // admin; колонка во всех разделах
DELETE /projects/:pid/languages/:lid                    → 204           // admin
GET  /projects/:pid/namespaces                         → Namespace[]
POST /projects/:pid/namespaces  { name, type }         → Namespace      // type: 'strings' | 'plurals'
```

> Токены, языки и участники привязаны к `:pid`. Смена активного проекта в переключателе
> меняет `pid` в query keys → React Query сам подтянет соответствующие данные и токены.

### Переводы (ядро)
```
GET  /projects/:pid/namespaces/:nsid/rows
       ?page=1&pageSize=50&search=copy&filter=empty&lang=ru
                                                       → TablePageDTO
POST /projects/:pid/namespaces/:nsid/keys
       { code, comment? }                              → Key
PATCH /projects/:pid/keys/:keyId
       { code?, comment? }                             → Key            // переименование / комментарий
PATCH /projects/:pid/translations            (батч)
       { changes: [{ keyId, langCode, value? , plural? }] } → { updated: number }
DELETE /projects/:pid/keys/:keyId                       → 204
```

### Токены (later — в MVP не реализуется, контракт на будущее)
```
GET    /projects/:pid/tokens                            → ApiToken[]   (без секрета)
POST   /projects/:pid/tokens   { name, scopes }         → { token: ApiToken, secret } // secret один раз
DELETE /projects/:pid/tokens/:id                        → 204
```

### Публичный API для клиентских приложений (по токену)
```
GET /api/public/v1/translations?namespace=strings&lang=ru
    Header: Authorization: Bearer stl_live_…           → { [key]: value }
```

## Query Keys — фабрика

Единое место, чтобы инвалидация была надёжной и читаемой:

```ts
export const qk = {
  auth:        ['auth'] as const,
  me:          () => [...qk.auth, 'me'] as const,

  projects:    ['projects'] as const,
  members:     (pid: string) => ['projects', pid, 'members'] as const,
  languages:   (pid: string) => ['projects', pid, 'languages'] as const,
  namespaces:  (pid: string) => ['projects', pid, 'namespaces'] as const,

  rows: (pid: string, nsid: string, params: RowsParams) =>
    ['projects', pid, 'namespaces', nsid, 'rows', params] as const,

  tokens: (pid: string) => ['projects', pid, 'tokens'] as const,
};
```

Инвалидация после правки: `queryClient.invalidateQueries({ queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] })` — затронет все страницы/фильтры этого раздела.

## Хуки данных (примеры)

```ts
// чтение строк таблицы (серверная пагинация + фильтры)
export function useRows(pid, nsid, params) {
  return useQuery({
    queryKey: qk.rows(pid, nsid, params),
    queryFn: () => translationsApi.getRows(pid, nsid, params),
    placeholderData: keepPreviousData, // плавная пагинация без «прыжков»
    staleTime: 30_000,
  });
}

// батч-сохранение изменённых ячеек с оптимистичным апдейтом
export function useSaveTranslations(pid, nsid) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: CellChange[]) => translationsApi.patch(pid, changes),
    onMutate: async (changes) => {
      await qc.cancelQueries({ queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] });
      const prev = qc.getQueriesData({ queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] });
      // локально применяем изменения к кэшу
      applyOptimistic(qc, pid, nsid, changes);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev?.forEach(([k, d]) => qc.setQueryData(k, d)), // откат
    onSettled: () => qc.invalidateQueries({ queryKey: ['projects', pid, 'namespaces', nsid, 'rows'] }),
  });
}
```

## Стратегия загрузки таблицы (производительность запросов)

- **Серверная пагинация** по 50–100 строк + бесконечный скролл (`useInfiniteQuery`)
  ИЛИ виртуализированная пагинация. Никогда не тянем весь namespace целиком.
- **Фильтры/поиск — на сервере** (`search`, `filter=empty`, `lang`), не на клиенте,
  иначе на больших данных это не масштабируется.
- `keepPreviousData` — при смене страницы/фильтра старые данные видны, нет мерцания.
- **Дебаунс поиска** (300 мс) → меньше запросов.
- **Префетч** соседней вкладки/страницы при наведении (`queryClient.prefetchQuery`).
- **Батчинг правок:** меняем много ячеек локально → одна `PATCH` при «Сохранить».

## Работа без бэка (mock-слой)

Чтобы фронт разрабатывался и демонстрировался уже сейчас:

- **MSW (Mock Service Worker)** перехватывает те же URL `/api/v1/...` и отдаёт данные
  из in-memory фикстур (можно засеять из приложенной таблицы-референса).
- Все хендлеры реализуют контракт выше: пагинацию, поиск, задержки, ошибки.
- Фичи не знают, mock это или нет — они зовут `translationsApi`, реализация выбирается
  по env-флагу `VITE_API_MODE = mock | real`.

Когда бэк появится: ставим `VITE_API_MODE=real`, выключаем MSW — **код фич не меняется**.

## Обработка ошибок и устойчивость

- Глобальный обработчик в `QueryClient` (`onError`) → тост с понятным сообщением.
- Ретраи на сетевые/5xx (по умолчанию React Query), без ретраев на 4xx.
- `401` → разлогин и редирект на `/login` (refresh-механики пока нет — токен бессрочный).
- Error Boundary на уровне страниц + skeleton-состояния на время загрузки.
