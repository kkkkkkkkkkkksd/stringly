# 06. Модель данных

Описывает доменные сущности. Это контракт между фронтом и будущим бэком: фронт уже
проектируется под эти структуры (типы + Zod-схемы), бэк позже реализует ту же модель в БД.

## Диаграмма связей

```
User ──< Membership >── Project ──< ApiToken
                          │
                          ├──< Language        (языки проекта)
                          ├──< Namespace       (разделы: strings, plurals, …)
                          │       │
                          │       └──< Key      (ключ перевода: [copy], [close])
                          │              │
                          │              └──< Translation (текст ключа на языке)
```

- `Project` — корневой контейнер (одно приложение/продукт). У аккаунта может быть
  несколько проектов; активный выбирается переключателем. **Токены и языки принадлежат
  проекту** → при смене проекта меняются и доступы, и набор языков.
- `Membership` — связь User↔Project с **ролью** (кто и что может в проекте).
- `Namespace` — раздел внутри проекта (вкладки на референсе).
- `Key` — ключ строки, уникален в рамках namespace (`code`, `comment`).
- `Translation` — значение ключа на конкретном языке. Уникально по `(keyId, languageId)`.
- `Language` — язык проекта (ISO-код), один помечен базовым.
- `ApiToken` — токен для доступа клиентских приложений к переводам.

## Сущности (TypeScript)

```ts
type ID = string; // UUID

interface User {
  id: ID;
  email: string;
  name?: string;
  createdAt: string; // ISO
}

interface Project {
  id: ID;
  name: string;
  slug: string;
  baseLanguageId: ID;
  createdAt: string;
}

type Role = 'admin' | 'translator' | 'viewer';
// admin    — владелец/создатель проекта: всё, включая участников, языки, токены
// translator — правит переводы, добавляет ключи; не трогает участников/токены
// viewer   — только просмотр

interface Membership {
  id: ID;
  userId: ID;
  projectId: ID;
  role: Role;
  createdAt: string;
}

// Языки задаются ОДИН раз на уровне проекта. Все namespaces берут из них колонки
// автоматически — отдельно по разделам язык не добавляется.
interface Language {
  id: ID;
  projectId: ID;
  code: string;     // "en", "ru", "ar", "pt-BR"
  name: string;     // "English"
  isBase: boolean;
  rtl: boolean;     // true для ar, he
}

interface Namespace {
  id: ID;
  projectId: ID;
  name: string;            // "strings", "login_strings"
  type: 'strings' | 'plurals'; // выбирается при создании раздела
  order: number;           // порядок вкладок
}

interface Key {
  id: ID;
  namespaceId: ID;
  code: string;     // "[copy]", "[try_again]"
  comment?: string; // подсказка переводчику
  isPlural: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Translation {
  id: ID;
  keyId: ID;
  languageId: ID;
  value: string;
  // для plural-ключей вместо value используется plural-форма:
  plural?: Partial<Record<'zero'|'one'|'two'|'few'|'many'|'other', string>>;
  status: 'empty' | 'draft' | 'reviewed';
  updatedAt: string;
}

// ApiToken — функционал «Подключения» реализуется ПОЗЖЕ (в MVP — заглушка).
// Структура заложена заранее, чтобы потом добавить без миграций модели.
interface ApiToken {
  id: ID;
  projectId: ID;
  name: string;
  prefix: string;      // первые символы для отображения: "stl_live_a1b2…"
  scopes: ('read'|'write')[];
  lastUsedAt?: string;
  createdAt: string;
  // полный токен возвращается ТОЛЬКО при создании, в БД хранится хэш
}
```

> **Сессия пользователя (не путать с ApiToken):** на первое время — один бессрочный
> access-токен, без refresh. Упрощает auth; ротацию добавим позже.

## Денормализация для таблицы (DTO ответа)

Чтобы таблица рисовалась эффективно, API отдаёт строки уже «сшитыми»: ключ + словарь
переводов по коду языка. Это снижает число запросов и упрощает рендер.

```ts
interface TableRowDTO {
  keyId: ID;
  code: string;
  comment?: string;
  // словарь: код языка → значение
  values: Record<string /*langCode*/, { value: string; status: Translation['status'] }>;
}

interface TablePageDTO {
  rows: TableRowDTO[];
  languages: { code: string; name: string; rtl: boolean; isBase: boolean }[];
  page: number;
  pageSize: number;
  total: number;       // всего ключей в namespace (для пагинации/прогресса)
}
```

## Инварианты и правила

- `Key.code` уникален в рамках `namespaceId`.
- `Translation` уникален по `(keyId, languageId)`; отсутствие записи = `empty`.
- Базовый язык у проекта ровно один (`isBase = true`).
- Нельзя удалить язык, если он базовый (сначала сменить базовый).
- Язык принадлежит проекту, а не разделу → колонки одинаковы во всех namespaces.
- У каждого проекта ровно один `admin` (создатель). Менять состав/роли может только admin.
- Полный API-токен показывается один раз; в хранилище — только хэш + `prefix`.

## Зачем Zod-схемы на эти типы

Каждая сущность дублируется Zod-схемой (`projectSchema`, `tablePageSchema`, …). Они:

1. валидируют ответы API в рантайме (ловим расхождения с бэком рано);
2. служат единственным источником TS-типов (`z.infer`);
3. переиспользуются для валидации форм (создание ключа/токена).
