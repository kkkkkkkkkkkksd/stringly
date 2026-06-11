# Backend — требования к API (модуль Auth & Members)

Папка описывает **контракт бэкенда**: что фронт ожидает от сервера, как сервер это реализует
и как ведёт себя БД. Один эндпоинт = один файл. Этот README — фундамент: общие конвенции,
модель данных, система ID, авторизация, формат ошибок и стратегия приглашений. Каждый файл
эндпоинта ссылается сюда, чтобы не дублировать общее.

> Не противоречит `docs/06-data-model.md` и `docs/11-roles-and-permissions.md` — расширяет их
> сетевым контрактом. При расхождении приоритет за доменными доками, расхождение чинится.

## Структура (по смысловым областям, один эндпоинт = один файл)

Файлы сгруппированы в подпапки по смыслу. Внутри папки нумерация — по логике флоу.

### `auth/` — регистрация и авторизация

| Файл | Запрос | Метод + URL |
|------|--------|-------------|
| `auth/01-register` | Регистрация | `POST api/v1/auth/register` |
| `auth/02-login` | Авторизация (вход) | `POST api/v1/auth/login` |

### `profile/` — профиль / текущий пользователь

| Файл | Запрос | Метод + URL |
|------|--------|-------------|
| `profile/01-me` | Текущий пользователь (сессия) | `GET api/v1/auth/me` |

### `projects/` — общие данные проектов

| Файл | Запрос | Метод + URL |
|------|--------|-------------|
| `projects/01-create` | Создание проекта | `POST api/v1/projects` |
| `projects/02-list` | Список проектов пользователя | `GET api/v1/projects` |

### `settings/` — настройки проекта → участники (управление командой, для admin)

| Файл | Запрос | Метод + URL |
|------|--------|-------------|
| `settings/01-invite-member` | Создать приглашение | `POST api/v1/projects/{projectId}/invitations` |
| `settings/02-revoke-invitation` | Отозвать приглашение | `DELETE api/v1/projects/{projectId}/invitations/{invitationId}` |
| `settings/03-list-members` | Список участников с ролями | `GET api/v1/projects/{projectId}/members` |
| `settings/04-update-member-role` | Изменить роль участника | `PATCH api/v1/projects/{projectId}/members/{userId}` |
| `settings/05-remove-member` | Удалить участника | `DELETE api/v1/projects/{projectId}/members/{userId}` |

### `invitations/` — приём приглашения (публичный флоу для приглашённого)

| Файл | Запрос | Метод + URL |
|------|--------|-------------|
| `invitations/01-get` | Просмотр приглашения по токену | `GET api/v1/invitations/{token}` |
| `invitations/02-accept` | Принять приглашение | `POST api/v1/invitations/{token}/accept` |

> Приглашения намеренно разнесены: **выпуск/отзыв** — это действия админа в настройках
> (`settings/`), а **просмотр/принятие по ссылке** — публичный экран приглашённого
> (`invitations/`, роут `/invite/:token`). Это совпадает с разделением на фронте
> (SettingsPage vs публичная страница приёма).

## Ключевое архитектурное решение: «компания = аккаунт-владелец»

Отдельной сущности `Organization`/`Company` в MVP **нет** (как и в Google Таблицах). Роль
«компании» играет **аккаунт-владелец** проекта:

- При регистрации создаётся `User` — это и есть «компания/рабочее пространство».
- Пользователь создаёт свои `Project`-ы и автоматически становится в них `admin`.
- Разные владельцы (= «разные компании») могут пригласить одного и того же пользователя в
  свои проекты — связь хранится в `Membership` (User↔Project).
- Один пользователь видит сразу все проекты, где он участник (свои + чужие), с разными
  ролями. Это закрывает пункты ТЗ 7 и 8.

**Почему так, а не через Organization:** меньше сущностей, точное соответствие модели
Google Таблиц, и полное совпадение с уже спроектированной `docs/06`. Масштабирование до
команд/организаций заложено без миграций — см. раздел «Масштабируемость».

## Модель данных (что добавляем к docs/06)

`docs/06` уже определяет `User`, `Project`, `Membership`, `Role`. Для auth/приглашений
добавляем две таблицы: `invitations` и `sessions`.

```
users ──< memberships >── projects
  │                          ^
  │                          │ owner_user_id (создатель = admin)
  ├──< sessions              │
  └── (invited_by) ──< invitations >── projects
                         (email, role, token_hash, status)
```

### Таблицы (PostgreSQL, рекомендация)

```
users
  id              uuid  PK   -- UUIDv7 (см. «Система ID»)
  email           citext UNIQUE NOT NULL     -- регистронезависимый
  password_hash   text   NOT NULL            -- argon2id
  status          text   NOT NULL DEFAULT 'active'  -- active|disabled (future)
  created_at      timestamptz NOT NULL DEFAULT now()
  updated_at      timestamptz NOT NULL DEFAULT now()

projects
  id              uuid  PK
  name            text   NOT NULL
  slug            text   NULL                 -- человекочитаемый, уникален в рамках владельца
  owner_user_id   uuid   NOT NULL REFERENCES users(id)
  base_language_id uuid  NULL                 -- задаётся на шаге настройки языков
  created_at      timestamptz NOT NULL DEFAULT now()
  updated_at      timestamptz NOT NULL DEFAULT now()
  -- forward-compat: organization_id uuid NULL  (зарезервировано, см. масштабирование)
  INDEX (owner_user_id)

memberships                                    -- связь User↔Project + роль
  id              uuid  PK
  project_id      uuid   NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  user_id         uuid   NOT NULL REFERENCES users(id)    ON DELETE CASCADE
  role            text   NOT NULL              -- admin|translator|viewer
  created_at      timestamptz NOT NULL DEFAULT now()
  updated_at      timestamptz NOT NULL DEFAULT now()
  UNIQUE (project_id, user_id)                 -- один пользователь = одна роль в проекте
  INDEX (user_id)                              -- быстрый «мои проекты»

invitations                                    -- приглашение по email
  id                 uuid  PK
  project_id         uuid   NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  email              citext NOT NULL            -- кого приглашаем
  role               text   NOT NULL            -- роль при принятии
  token_hash         text   NOT NULL            -- sha-256 от секрета из ссылки (сам секрет не храним)
  status             text   NOT NULL DEFAULT 'pending'  -- pending|accepted|revoked|expired
  invited_by_user_id uuid   NOT NULL REFERENCES users(id)
  accepted_by_user_id uuid  NULL REFERENCES users(id)
  expires_at         timestamptz NOT NULL
  accepted_at        timestamptz NULL
  created_at         timestamptz NOT NULL DEFAULT now()
  updated_at         timestamptz NOT NULL DEFAULT now()
  -- одно активное приглашение на (проект, email):
  UNIQUE (project_id, email) WHERE status = 'pending'
  INDEX (token_hash)

sessions                                       -- bearer-токены сессий (MVP: бессрочные)
  id              uuid  PK
  user_id         uuid   NOT NULL REFERENCES users(id) ON DELETE CASCADE
  token_hash      text   NOT NULL              -- sha-256 от access-токена
  created_at      timestamptz NOT NULL DEFAULT now()
  last_used_at    timestamptz NULL
  expires_at      timestamptz NULL             -- NULL = бессрочный (docs/04); поле под ротацию
  revoked_at      timestamptz NULL
  INDEX (token_hash)
```

### Инварианты

- У проекта ровно один владелец (`owner_user_id`); он автоматически `admin` (membership при создании).
- Нельзя удалить/понизить последнего `admin` проекта (см. `settings/04`, `settings/05`).
- `email` пользователя уникален глобально (регистронезависимо).
- Активное (`pending`) приглашение на пару (проект, email) — только одно.
- Секрет приглашения и access-токен **никогда не хранятся в открытом виде** — только sha-256.

## Система ID

Цель — масштабируемость, отсутствие коллизий, отсутствие «угадывания» соседних записей и
читаемость в логах.

- **Внутренний PK — `UUIDv7`** (time-ordered): сортируемый по времени, дружелюбен к индексам
  БД (в отличие от случайного UUIDv4), не создаёт «горячую точку» как автоинкремент и не
  раскрывает порядок/количество записей наружу. Готов к шардингу/репликации.
- **Публичный ID = префикс типа + UUID**, например `usr_018f3c...`, `prj_018f3c...`,
  `mbr_...`, `inv_...`, `ses_...`. Префикс делает ID самоописательным (видно тип сущности в
  логах и URL) и защищает от подстановки чужого типа ID. Это по-прежнему `string` — совместимо
  с Zod-схемами фронта (`id: z.string()`).

| Сущность | Префикс | Пример |
|----------|---------|--------|
| User | `usr_` | `usr_018f3c8e-...` |
| Project | `prj_` | `prj_018f3c8e-...` |
| Membership | `mbr_` | `mbr_018f3c8e-...` |
| Invitation | `inv_` | `inv_018f3c8e-...` |
| Session | `ses_` | `ses_018f3c8e-...` |

- **Секреты ≠ ID.** Токен приглашения и access-токен — отдельные случайные секреты (≥256 бит,
  URL-safe base64), не используются как идентификаторы и в URL приглашения передаётся именно
  секрет, а не `inv_`-id.

## Авторизация и заголовки

- Схема: `Authorization: Bearer <accessToken>`. MVP — один бессрочный opaque-токен на сессию
  (хранится в `sessions`, в БД только хэш) → можно отзывать при логауте. Stateless-JWT —
  альтернатива на будущее, контракт не меняется.
- Обязательные заголовки запроса с телом: `Content-Type: application/json; charset=utf-8`.
- Защищённые эндпоинты без/с невалидным токеном → `401`. **Фронт на `401` чистит сессию и
  редиректит на `/login`** (уже заложено в `httpClient`).
- Недостаточно прав (роль) → `403`.
- Сервер на каждый ответ кладёт `X-Request-Id` (трассировка); принимает входящий, если есть.
- Идемпотентность мутаций (опционально, для масштаба): заголовок `Idempotency-Key` на POST.

## Версионирование

Версия — **в пути**: все эндпоинты записываются как `api/v1/...` (`api/v1/auth/login`, …).
Ломающие изменения → `api/v2`, старый `api/v1` живёт параллельно. На фронте базовый адрес
берётся из env (`VITE_API_BASE_URL`); путь относительный, без ведущего слэша — `api/v1/...`.

## Единый формат ответов и ошибок

Успех — ресурс или коллекция напрямую (см. файлы). Ошибки — единый конверт:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Человекочитаемое сообщение",
    "details": [{ "field": "email", "issue": "INVALID_FORMAT" }]
  }
}
```

| HTTP | code (примеры) | Когда |
|------|----------------|-------|
| 400 | `VALIDATION_ERROR` | тело/параметры не прошли валидацию |
| 401 | `UNAUTHENTICATED` | нет/невалиден токен |
| 403 | `FORBIDDEN` | роли не хватает |
| 404 | `NOT_FOUND` | ресурс не найден или нет доступа (не раскрываем существование) |
| 409 | `CONFLICT` | дубликат (email занят, повторное приглашение) |
| 410 | `GONE` | приглашение истекло/отозвано/уже принято |
| 422 | `UNPROCESSABLE` | бизнес-правило (напр. понижение последнего admin) |
| 429 | `RATE_LIMITED` | превышен лимит |

Фронт валидирует каждый ответ Zod-схемой; `ApiError(status, code, message)` уже есть в
`shared/services/network`.

## Пагинация (для масштабируемости списков)

Списки — **cursor-based** (стабильно при больших объёмах, без `OFFSET`-просадок):
`?limit=50&cursor=<opaque>` → ответ `{ "items": [...], "nextCursor": "..."|null }`. Для
маленьких списков (участники) допустим возврат без курсора, но контракт оставляем единым.

## Стратегия приглашений (пункты ТЗ 5–8)

«Самый простой способ» без зависимости от платной почты. Ключевая идея: **`accept` всегда
отдельный последний шаг**, а `register`/`login` про приглашения ничего не знают. Это делает
флоу одинаковым для нового и существующего пользователя.

**Шаг 1 — выпуск (админ).** В настройках проекта «Добавить участника» → вводит **email + роль** →
`POST api/v1/projects/{projectId}/invitations`. Бэк создаёт `invitation` и возвращает **готовую
ссылку** `inviteUrl` с секретом-токеном. В MVP письмо не шлётся — админ копирует ссылку и
передаёт вручную (позже за интерфейсом `mailer` по флагу `MAIL_ENABLED`, без изменения API).

**Шаг 2 — открытие ссылки (приглашённый).** `GET api/v1/invitations/{token}` (без авторизации) →
видит проект, кто пригласил, роль и флаг **`accountExists`** — есть ли уже аккаунт на этот email.
Этот флаг и определяет ветку:

- **Аккаунта нет (`accountExists=false`):** показываем регистрацию, email подставлен и read-only.
  → `POST api/v1/auth/register` с обычным телом `{ email, password }`. **Ничего про приглашение
  на регистрацию НЕ отправляется** — токен в register не передаётся. → получаем сессию → Шаг 3.
- **Аккаунт есть, но не залогинен (`accountExists=true`):** показываем вход →
  `POST api/v1/auth/login` → сессия → Шаг 3.
- **Уже залогинен:** сразу Шаг 3.

**Шаг 3 — принятие (с сессией).** `POST api/v1/invitations/{token}/accept` (Bearer). Бэк создаёт
`membership` с ролью из приглашения и помечает его `accepted`. Привязка к почте: принять может
только пользователь с `email` = email приглашения (иначе `403 EMAIL_MISMATCH`). Только после
этого шага появляется доступ к проекту.

**Коротко на вопрос «что слать на бэк при регистрации по ссылке»:** ничего особенного —
`register` принимает только `{ email, password }`. Токен приглашения используется исключительно
в отдельном `accept` после получения сессии. Так register единый и простой для всех сценариев.

Так закрываются пункты 5 (ссылка вручную), 6 (зарегистрирован или нет), 7 и 8
(мультипроектность, разные владельцы-«компании»).

## Масштабируемость (заложено заранее)

- **ID UUIDv7 + sessions по хэшу** → горизонтальное масштабирование/шардинг без переделки ключей.
- **Stateless-вариант auth (JWT)** включается без смены контракта (тот же Bearer).
- **Курсорная пагинация** на всех списках.
- **Организации/команды**: при необходимости добавляется таблица `organizations` и
  `projects.organization_id` (поле зарезервировано) + `org_members` — членство и приглашения
  остаются совместимыми (роль проекта не меняется). Никакой ломки текущего контракта.
- **Почтовая рассылка**, SSO, refresh-токены, аудит-лог — подключаются за сервисными
  интерфейсами (`mailer`, `auth`) без изменения публичных эндпоинтов.
- **Rate limiting** и `Idempotency-Key` на мутациях — точки расширения уже в конвенциях.

## Реализация на Kotlin (рекомендации стека и маппинг конвенций)

Бэк пишется на **Kotlin**. Контракт (URL, тела, ответы, ошибки) от языка не зависит — ниже
как наши конвенции ложатся на Kotlin-экосистему. Это рекомендации, не жёсткое требование.

**Каркас.** Spring Boot (Kotlin) — самый прямой путь (Security, валидация, `@Transactional`,
`@RestControllerAdvice` из коробки). Лёгкая альтернатива — Ktor. Сборка — Gradle (Kotlin DSL).

**Доступ к БД и миграции.** PostgreSQL + Flyway (или Liquibase) для версионирования схемы.
ORM/SQL — Spring Data JPA (Hibernate), либо Exposed/jOOQ, если хочется типобезопасный SQL без
магии JPA. Многошаговые операции (`register`+session, `create project`+membership, `accept`) —
в одной транзакции (`@Transactional`).

**ID.**
- Внутренний PK — `UUID` (тип Postgres `uuid`). UUIDv7 генерируем библиотекой
  `com.github.f4b6a3:uuid-creator` (`UuidCreator.getTimeOrderedEpoch()`) или
  `com.fasterxml.uuid:java-uuid-generator` (≥ 4.1, `Generators.timeBasedEpochGenerator()`).
- Публичный префиксный ID (`usr_`, `prj_`, …) — на границе API. Удобно завести `value class`
  на сущность и Jackson-сериализатор/десериализатор: наружу `prj_<uuid>`, внутри чистый `UUID`.

**Пароли.** argon2id: `de.mkammerer:argon2-jvm` или `Argon2PasswordEncoder` из Spring Security.
Лимита bcrypt в 72 байта нет — поэтому в правилах пароля он не фигурирует (см. `auth/01-register`).

**Сессии/токены.** access-токен — случайный секрет: `java.security.SecureRandom` →
Base64URL (≥ 32 байт). В БД храним `sha-256` (`MessageDigest`), сверяем константно
(`MessageDigest.isEqual`). Проверка Bearer — `OncePerRequestFilter` (Spring Security) или
`Authentication` в Ktor. Stateless-альтернатива (JWT) — `com.auth0:java-jwt` или `jjwt`,
контракт не меняется.

**Секрет приглашения** — так же `SecureRandom` + Base64URL, в БД только `token_hash`.

**DTO и сериализация.** Запросы/ответы — `data class`. Jackson (`jackson-module-kotlin`) или
`kotlinx.serialization`. Время — `Instant`/`OffsetDateTime` в UTC, формат ISO-8601 (`...Z`).

**Валидация.** Jakarta Bean Validation на DTO (`@field:Email`, `@field:Size(min=8,max=128)`,
кастомная аннотация «буква+цифра») либо Konform. Ошибки валидации → `400 VALIDATION_ERROR`
с заполнением `details[]`.

**Роли/статусы — `enum class`.** `enum class Role { ADMIN, TRANSLATOR, VIEWER }`,
наружу сериализуем в нижнем регистре (`admin`/`translator`/`viewer`). В БД — `text` + CHECK
или нативный Postgres enum.

**Единый формат ошибок** — один `@RestControllerAdvice`, мапящий доменные исключения и
`MethodArgumentNotValidException` в конверт `{ error: { code, message, details } }` (см. выше).

**email регистронезависимо.** Включить расширение `citext` (тогда колонка `citext`), либо
хранить нормализованный lower-case + `UNIQUE` индекс по `lower(email)`. Нормализацию делать
в одном месте (слой сервиса).

**Конфиг.** `APP_BASE_URL` (для `inviteUrl`), `MAIL_ENABLED`, параметры argon2, TTL приглашений —
через `application.yml`/env, не хардкодить.

## Где это живёт на фронте (FSD, см. ARCHITECTURE.md)

- `entities/user`, `entities/project` — домен (уже есть); добавятся `entities/invitation`,
  `entities/member`.
- `features/auth` — register/login/me (api + Zod + хуки + `sessionStore`).
- `features/projects` — список/создание проектов, активный проект.
- `features/members` (новая) — участники, роли, приглашения (api + хуки + UI вкладки настроек).
- Данные — только через React Query + фабрику ключей `qk` (`shared/api/queryKeys`); сеть —
  через `httpClient` (`shared/services/network`); тексты — `shared/resources/i18n`.
