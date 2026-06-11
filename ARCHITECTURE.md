# ARCHITECTURE.md — паттерны проекта Stringly

> Обязательный справочник для AI-агента и разработчиков. Описывает **как** писать код:
> какие паттерны применять при создании каждого нового экрана/фичи/сущности. Это «свод
> законов» поверх дизайн-документов. Глубокие обоснования — в `docs/04`, `docs/07`, `docs/08`,
> `docs/11`. При конфликте этого файла с `docs/` — приоритет за `docs/`, расхождение чини.

## TL;DR (зафиксированные решения)

- **Архитектура:** упрощённый **Feature-Sliced Design**. Слои: `app → pages → features → entities → shared`. Импорт только «вниз», форсится линтером (`boundaries/element-types: error`).
- **Сегменты внутри фичи:** `api/` (контракты + Zod) · `model/` (хуки + Zustand) · `ui/`.
- **Логика = кастомные хуки как ViewModel.** Компоненты НИКОГДА не дёргают api/стор напрямую — только через хуки (`useXxx`).
- **Серверное состояние — TanStack Query** (+ централизованная `qk`-фабрика ключей). **Клиентское — Zustand.** Не смешивать.
- **Домен — в `entities/`** (единый источник правды для типов `User`, `Project`, `Role`, далее `Translation`, `Language`, `Token`). Фичи импортируют домен из entities, **не друг из друга**.
- **Zod на каждой границе API** (типы = `z.infer`). **TS strict, без `any`** (`no-explicit-any: error`).
- **Фреймворк — Vite SPA + react-router. НЕ Next.js** (B2B за авторизацией, SSR/SEO не нужны; миграция = переписать всё, не делаем).
- **`shared/ui`** — плоская дизайн-система (один баррель `@/shared/ui`). Формальный Atomic Design не вводим.
- **Все тексты — `shared/resources/i18n`**, иконки — `shared/resources/assets`. Ни строки/SVG-path в компонентах.
- **Сайд-эффекты — `shared/services`**, чистые хелперы — `shared/core`.

## Карта слоёв и что куда класть

| Слой | Папка | Что лежит | Может импортировать |
|------|-------|-----------|---------------------|
| app | `src/app` | провайдеры, роутер, гарды | pages, features, entities, shared |
| pages | `src/pages` | экраны = тонкая композиция фич | features, entities, shared |
| features | `src/features` | функциональный блок: `api/` + `model/` + `ui/` | entities, shared |
| entities | `src/entities` | доменные сущности: схемы Zod + типы (+ базовый доменный UI) | shared |
| shared | `src/shared` | переиспользуемое без домена: `ui`, `core`, `services`, `api`(qk), `resources`, `config` | shared |

Жёсткие запреты (ловит линтер):
- **features НЕ импортируют features.** Общее → подними в `entities` (домен) или `shared` (инфраструктура/UI).
- **shared НЕ знает о домене** и ни о чём «выше».
- **pages не содержат бизнес-логики** — только композиция фич и разметка экрана.

## Слой данных (канонический поток)

```
UI компонент
  → useXxx()                      // features/<f>/model — кастомный хук (ViewModel)
    → useQuery / useMutation      // TanStack Query, ключ из qk-фабрики
      → xxxApi.method()           // features/<f>/api — контракт, .parse() через Zod
        → httpClient              // shared/services/network — единственная точка fetch
```

- **Никакого «голого» `fetch`** в компонентах/хуках — только `httpClient` из `@/shared/services/network`.
- **Ключи кэша — только из `qk`** (`src/shared/api/queryKeys.ts`). Всё внутри проекта начинается с `pid`. Новую сущность добавляй в `qk`, не хардкодь массивы ключей.
- **Реализация api за интерфейсом**: mock (MSW) ↔ real переключается флагом `VITE_API_MODE`, фичи не меняются.

## Состояние — что где

| Тип | Где | Примеры |
|-----|-----|---------|
| Серверное (из БД) | React Query | переводы, языки, проекты, токены |
| Клиентское глобальное | Zustand (`persist` при необходимости) | активный проект, сессия, буфер dirty-ячеек |
| Локальное UI | `useState`/`useReducer` | открыт ли модал, текст поиска |
| Формы | React Hook Form + Zod resolver | логин, создание токена |

## Рецепт: новый экран (страница)

1. Найди соответствующий **Шаг** в `docs/12`, прочитай профильные docs (всегда + `04`, `06`, `07`).
2. Если UI → сперва **2–3 варианта дизайна** (см. `docs/13`), дождись выбора. Цвета/токены — только из `docs/14`.
3. Страница в `src/pages/<name>` — **тонкая**: дёргает хуки фич, верстает layout, обрабатывает состояния **loading / empty / error / read-only(viewer)**.
4. Бизнес-логику и данные — в фиче, не в странице. Тексты — из `@/shared/resources/i18n`.
5. Права на действия — через `usePermission`/`<Can>` (см. ниже).

## Рецепт: новая фича

```
src/features/<feature>/
├── api/
│   ├── <feature>Api.ts     // методы, каждый ответ через schema.parse()
│   └── schemas.ts          // ТОЛЬКО DTO-границы фичи; домен импортируется из @/entities/*
├── model/
│   ├── use<Feature>.ts     // хуки-ViewModel: useQuery/useMutation поверх api
│   └── <feature>Store.ts   // Zustand, если нужно клиентское состояние
└── ui/                     // компоненты фичи (общие — выноси в shared/ui)
```

- Доменные типы (`Project`, `User`, …) — **импортируй из `@/entities/*`**, не объявляй в фиче.
- Нужны данные другой фичи? Значит это домен → в `entities`. Фичу из фичи импортировать нельзя.

## Рецепт: новая доменная сущность

```
src/entities/<entity>/
├── model/schema.ts   // zod-схема + type = z.infer
└── index.ts          // публичный API: export { schema }; export type { Entity }
```

- Один источник правды на тип. Импорт сущности — только через баррель `@/entities/<entity>`.
- `Role` — особый случай: канонический union + матрица прав живут в `shared/core/permissions`
  (shared не может импортировать entities). `entities/project` даёт его runtime-схему
  (`roleSchema satisfies z.ZodType<Role>`) и реэкспортит тип. При добавлении роли — правь
  оба места, `satisfies` поймает расхождение на компиляции.

## shared: куда класть инфраструктуру

- **`shared/ui`** — любой переиспользуемый стилизованный компонент (кнопка, бейдж, инпут, модал, табы…). Регистрируй в барреле `@/shared/ui`. Плоско, без atoms/molecules. Не дублируй стили по экранам.
- **`shared/core`** — чистые функции без сайд-эффектов: валидаторы, форматтеры, матрица прав. Не знает о сети/UI/React.
- **`shared/services`** — интеграции и сайд-эффекты: `network` (httpClient, authToken), далее analytics, storage. Фичи зовут сервис, а не делают эффект сами.
- **`shared/api`** — слой запросов: фабрика ключей `qk`. (Сетевой транспорт переехал в `services/network` — здесь его нет.)
- **`shared/resources`** — `i18n` (тексты UI, баррель `@/shared/resources/i18n`) + `assets` (иконки/картинки именованными компонентами).
- **`shared/config`** — `env`, бренд, константы. URL API — только из env.

## Права и роли

- Матрица — `shared/core/permissions` (`can(role, perm)`). Роли: `admin / translator / viewer`.
- В UI: `usePermission(perm)` или `<Can perm="...">…</Can>` (из фичи projects). Реальная защита — на бэке, здесь только UX.
- По умолчанию роль — `viewer` (наименьшие права).

## Чек-лист перед «готово» (для любой задачи)

- [ ] Код в правильном слое; импорт только «вниз»; фича не тянет другую фичу.
- [ ] Домен — из `@/entities/*`; новые типы — туда, не в фичу.
- [ ] Данные через React Query + `qk`; Zod на границе API; без «голого» fetch.
- [ ] Server-state в Query, client-state в Zustand — не перемешаны.
- [ ] Состояния: loading / empty / error / read-only(viewer) учтены.
- [ ] Тексты — из i18n; иконки — из assets; нет литералов строк / SVG-path в компонентах.
- [ ] Переиспользуемый UI — в `shared/ui` (сверился, не задублировал).
- [ ] TS strict, без `any`. Прогон зелёный: `npm run typecheck && npm run lint && npm test && npm run build`.
- [ ] Заглушки остались заглушками; точки расширения на месте; перф таблицы не сломан (`docs/08`).
