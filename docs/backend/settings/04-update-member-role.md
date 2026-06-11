# 11. Изменить роль участника — `PATCH api/v1/projects/{projectId}/members/{userId}`

Админ меняет роль участника проекта (admin/translator/viewer).

**Закрывает:** пункт ТЗ 3 (выдача/смена ролей).

## Эндпоинт

| | |
|---|---|
| Метод | `PATCH` |
| URL | `api/v1/projects/{projectId}/members/{userId}` |
| Авторизация | обязательна — `Bearer`; роль `admin` |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Path-параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `projectId` | `prj_018f...aaa` | проект |
| `userId` | `usr_018f...222` | участник, которому меняем роль |

## Тело запроса

```json
{ "role": "admin" }
```

| Поле | Тип | Обяз. | Правила |
|------|-----|:---:|--------|
| `role` | enum | да | `admin` \| `translator` \| `viewer` |

## Ответы

### 200 OK

```json
{
  "userId": "usr_018f...222",
  "email": "translator@globex.com",
  "role": "admin",
  "isOwner": false,
  "joinedAt": "2026-06-12T08:00:00Z"
}
```

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | недопустимая роль |
| 401 | `UNAUTHENTICATED` | нет токена |
| 403 | `FORBIDDEN` | не `admin` проекта |
| 404 | `NOT_FOUND` | участник/проект не найден |
| 422 | `UNPROCESSABLE` (`LAST_ADMIN`) | попытка понизить последнего admin |
| 422 | `UNPROCESSABLE` (`OWNER_IMMUTABLE`) | попытка сменить роль владельца |

## Бэкенд: логика

1. Аутентификация → проверить `admin` в `projectId`.
2. Найти `membership (project_id, user_id)`. Нет → `404`.
3. **Инварианты:**
   - Владельца (`projects.owner_user_id = userId`) понижать нельзя → `422 OWNER_IMMUTABLE`.
   - Нельзя понизить **последнего** admin (если меняем admin→не-admin и это единственный admin) →
     `422 LAST_ADMIN`. Проверка `COUNT(role='admin') > 1` в транзакции с блокировкой.
4. `UPDATE memberships SET role=$role, updated_at=now()`.
5. Вернуть обновлённого участника.

Безопасность: admin может менять и свою роль, но не нарушая «последний admin». Изменение —
точка для аудит-лога (кто/кому/когда сменил роль).

## Фронтенд: логика

- **Слой:** `features/members`.
- **API:** `membersApi.updateRole(projectId, userId, role)` → `httpClient.patch(...)`.
- **Хук:** `useUpdateMemberRole(projectId)` — `useMutation`; `onSuccess` → инвалидировать
  `qk.members(pid)`; при смене своей роли — также `qk.projects` (поменялась `role` активного).
- **UI:** инлайн-селект роли в строке участника, под `<Can perm="members:manage">`.
- **Состояния:** оптимистичное обновление с откатом при ошибке; `422 LAST_ADMIN`/`OWNER_IMMUTABLE`
  → тост с понятным сообщением.

## Edge cases

- Понижение себя как единственного admin → запрещено (`LAST_ADMIN`).
- Если текущий пользователь понизил свою роль — обновить локальную `role` (UI прав сразу меняется).
