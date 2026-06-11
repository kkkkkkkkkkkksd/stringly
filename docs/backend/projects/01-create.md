# 04. Создание проекта — `POST api/v1/projects`

Создаёт новый проект. Создатель автоматически становится владельцем и `admin`. Так
пользователь заводит собственные проекты — он же «компания» для приглашённых в них участников.

**Закрывает:** пункт ТЗ 8 (у аккаунта свои проекты, он в них admin). Используется в онбординге.

## Эндпоинт

| | |
|---|---|
| Метод | `POST` |
| URL | `api/v1/projects` |
| Авторизация | обязательна — `Bearer` |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Тело запроса

```json
{
  "name": "Acme Mobile App"
}
```

| Поле | Тип | Обяз. | Правила |
|------|-----|:---:|--------|
| `name` | string | да | 1–80 симв. |
| `slug` | string | нет | `[a-z0-9-]`, 1–60; если не задан — генерируется из `name` |

> Базовый язык (`baseLanguageId`) задаётся отдельно на шаге настройки языков, не здесь
> (см. `docs/06`, `docs/12` Шаг 5). При создании проект может быть без языков.

## Ответы

### 201 Created

```json
{
  "id": "prj_018f3c8e-7a21-7b3c-9f10-2c4d5e6f7a8b",
  "name": "Acme Mobile App",
  "slug": "acme-mobile-app",
  "role": "admin",
  "createdAt": "2026-06-11T09:05:00Z"
}
```

Совпадает с `projectSchema` фронта (`role` — роль текущего пользователя в проекте).

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | пустое/длинное имя, невалидный slug |
| 401 | `UNAUTHENTICATED` | нет токена |
| 409 | `CONFLICT` (`SLUG_TAKEN`) | slug уже занят у этого владельца |

## Бэкенд: логика

1. Аутентификация (middleware из `profile/01-me`) → `currentUser`.
2. Валидировать `name`; если `slug` не задан — сгенерировать (slugify + суффикс при коллизии).
3. В одной транзакции:
   - `INSERT projects (id=uuidv7(), name, slug, owner_user_id=currentUser.id)`.
   - `INSERT memberships (project_id, user_id=currentUser.id, role='admin')`.
4. Вернуть `201` с проектом и `role:'admin'`.

Инвариант: владелец = первый и обязательный admin (membership). `slug` уникален в рамках
владельца (индекс/ограничение), чтобы у разных «компаний» могли быть одинаковые slug.

## Фронтенд: логика

- **Слой:** `features/projects`; используется на `pages/onboarding/OnboardingPage`.
- **API:** `projectsApi.create(name)` → `httpClient.post('/projects', { name })` → `projectSchema.parse`.
- **Хук:** `useCreateProject()` (есть) — в `onSuccess`: `setActiveProject(project.id)`,
  `qc.setQueryData(qk.projects, ...)` + `invalidateQueries(qk.projects)` (оптимистично, чтобы
  гард `RequireProject` сразу увидел проект).
- **Состояния:** loading на кнопке, `409` → подсказать сменить имя/slug.

## Edge cases

- Создание во время онбординга сразу делает проект активным.
- Лимит числа проектов на пользователя (anti-abuse) — точка расширения (поле/таблица квот).
