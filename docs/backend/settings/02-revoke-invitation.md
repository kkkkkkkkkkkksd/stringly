# 09. Отозвать приглашение — `DELETE api/v1/projects/{projectId}/invitations/{invitationId}`

Админ отменяет ещё не принятое приглашение. Ссылка после этого становится недействительной.

**Поддерживает:** пункт ТЗ 3 (управление приглашениями).

## Эндпоинт

| | |
|---|---|
| Метод | `DELETE` |
| URL | `api/v1/projects/{projectId}/invitations/{invitationId}` |
| Авторизация | обязательна — `Bearer`; роль `admin` |

## Path-параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `projectId` | `prj_018f...aaa` | проект |
| `invitationId` | `inv_018f...ccc` | id приглашения (НЕ секрет-токен) |

## Ответы

### 204 No Content

Тело пустое.

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHENTICATED` | нет токена |
| 403 | `FORBIDDEN` | не `admin` проекта |
| 404 | `NOT_FOUND` | приглашение не найдено в этом проекте |
| 410 | `GONE` (`ALREADY_ACCEPTED`) | уже принято — отзывать нечего (удаляйте участника, `settings/05-remove-member`) |

## Бэкенд: логика

1. Аутентификация → проверить `admin` в `projectId`.
2. Найти `invitation` по `invitationId` И `project_id` (защита от подстановки чужого id). Нет → `404`.
3. Если `status='accepted'` → `410 ALREADY_ACCEPTED`.
4. `UPDATE invitations SET status='revoked', updated_at=now()`. Ссылка теперь даёт `410` (`invitations/01-get`, `invitations/02-accept`).
5. Вернуть `204`.

Мягкий статус (`revoked`), а не физическое удаление — сохраняем аудит-след кто/когда отозвал.

## Фронтенд: логика

- **Слой:** `features/members`; в списке участников секция «Ожидают приглашения».
- **API:** `membersApi.revokeInvitation(projectId, invitationId)` → `httpClient.delete(...)`.
- **Хук:** `useRevokeInvitation(projectId)` — `useMutation`; `onSuccess` → инвалидировать
  `qk.invitations(pid)` (и `qk.members(pid)`, если pending показаны там же).
- **Права:** действие под `<Can perm="members:manage">`.
- **UX:** подтверждение, оптимистичное удаление строки из списка ожидающих.

## Edge cases

- Гонка «принял ровно когда отзывают» → транзакция: если уже `accepted`, вернуть `410`.
