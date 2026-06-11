# 10. Список участников с ролями — `GET api/v1/projects/{projectId}/members`

Возвращает участников проекта с их ролями, плюс (для админа) список ожидающих приглашений.
Список виден всем ролям; изменять состав может только admin (см. `docs/11`).

**Закрывает:** пункт ТЗ 4.

## Эндпоинт

| | |
|---|---|
| Метод | `GET` |
| URL | `api/v1/projects/{projectId}/members` |
| Авторизация | обязательна — `Bearer`; любой участник проекта (read) |

## Path / Query

| Параметр | Тип | Описание |
|----------|-----|----------|
| `projectId` | path | проект |
| `limit` | query | размер страницы (по умолч. 50) |
| `cursor` | query | курсор |
| `includePending` | query bool | вернуть ли блок `pendingInvitations` (по умолч. true для admin, игнор для прочих) |

## Ответы

### 200 OK

```json
{
  "items": [
    {
      "userId": "usr_018f...111",
      "email": "kirill@acme.com",
      "role": "admin",
      "isOwner": true,
      "joinedAt": "2026-06-11T09:05:00Z"
    },
    {
      "userId": "usr_018f...222",
      "email": "translator@globex.com",
      "role": "translator",
      "isOwner": false,
      "joinedAt": "2026-06-12T08:00:00Z"
    }
  ],
  "pendingInvitations": [
    {
      "id": "inv_018f...ccc",
      "email": "viewer@acme.com",
      "role": "viewer",
      "invitedBy": "kirill@acme.com",
      "expiresAt": "2026-06-18T09:10:00Z",
      "createdAt": "2026-06-11T09:10:00Z"
    }
  ],
  "nextCursor": null
}
```

Участник идентифицируется по `email` (имени у аккаунта нет — в UI показываем email).
`isOwner` — владелец проекта (нельзя удалить/понизить, см. `settings/04-update-member-role`,
`settings/05-remove-member`). `pendingInvitations` отдаётся только админу (для остальных —
пустой/отсутствует).

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHENTICATED` | нет токена |
| 403 | `FORBIDDEN` | не участник проекта |
| 404 | `NOT_FOUND` | проект не существует |

## Бэкенд: логика

1. Аутентификация → проверить, что `currentUser` — участник `projectId` (есть membership), иначе `403`/`404`.
2. `SELECT m.role, m.created_at, u.id, u.email, (p.owner_user_id=u.id) AS is_owner
   FROM memberships m JOIN users u ON u.id=m.user_id JOIN projects p ON p.id=m.project_id
   WHERE m.project_id=$1 ORDER BY is_owner DESC, m.created_at` с keyset-пагинацией.
3. Если `currentUser` — admin и `includePending` → добавить `pendingInvitations`
   (`status='pending' AND expires_at>now()`).
4. Вернуть конверт.

Индексы: `memberships(project_id)`, `invitations(project_id, status)`.

## Фронтенд: логика

- **Слой:** `features/members`; вкладка «Участники» в `SettingsPage`.
- **Сущность:** `entities/member` (Zod `memberSchema`), `entities/invitation`.
- **API:** `membersApi.list(projectId)` → `httpClient.get(...)` → `parse`.
- **Хук:** `useMembers(projectId)` — `useQuery({ queryKey: qk.members(pid), ... })`
  (ключ `qk.members(pid)` уже есть).
- **UI:** таблица участников (email/роль/бейдж владельца); для admin — селект роли и
  кнопки удаления (под `<Can perm="members:manage">`), а также блок «Ожидают приглашения».
- **Состояния:** loading (скелетон), empty (только владелец), read-only для не-admin (кнопки скрыты).

## Edge cases

- Не-admin не видит `pendingInvitations` (только текущий состав).
- Пагинация участников для больших команд — keyset; для малых ответ помещается на одну страницу.
