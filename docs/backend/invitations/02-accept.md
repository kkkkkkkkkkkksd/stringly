# 08. Принять приглашение — `POST api/v1/invitations/{token}/accept`

Превращает приглашение в членство: создаёт `membership` с ролью из приглашения и помечает
приглашение принятым. Требует авторизации — принимающий должен быть тем, кого пригласили.

**Закрывает:** пункты ТЗ 3, 6, 7 (стать участником; быть уже зарегистрированным или нет;
получить доступ к проекту другой «компании»).

## Эндпоинт

| | |
|---|---|
| Метод | `POST` |
| URL | `api/v1/invitations/{token}/accept` |
| Авторизация | **обязательна** — `Bearer` (после входа/регистрации) |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Path-параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `token` | `4f3a...c9d1` | секрет из ссылки |

## Тело запроса

Пустое (`{}`). Контекст берётся из токена и сессии.

## Ответы

### 200 OK

```json
{
  "project": {
    "id": "prj_018f...aaa",
    "name": "Acme Mobile App",
    "slug": "acme-mobile-app",
    "role": "translator",
    "createdAt": "2026-06-11T09:05:00Z"
  }
}
```

Возвращаем проект с уже назначенной ролью — фронт сразу делает его активным.

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 401 | `UNAUTHENTICATED` | не авторизован |
| 403 | `FORBIDDEN` (`EMAIL_MISMATCH`) | email сессии ≠ email приглашения |
| 404 | `NOT_FOUND` | токен не найден |
| 409 | `CONFLICT` (`ALREADY_MEMBER`) | пользователь уже участник проекта |
| 410 | `GONE` (`EXPIRED`\|`REVOKED`\|`ACCEPTED`) | приглашение не активно |

## Бэкенд: логика

1. Аутентификация → `currentUser`.
2. `sha256(token)` → найти приглашение. Нет → `404`. Не `pending`/истекло → `410`.
3. **Привязка к почте:** `currentUser.email` должен совпадать с `invitation.email`
   (регистронезависимо). Иначе `403 EMAIL_MISMATCH`.
4. Если уже есть `membership (project, currentUser)` → пометить приглашение `accepted` и
   вернуть `200` (идемпотентно) либо `409 ALREADY_MEMBER` (по политике; рекомендуется
   идемпотентный `200`).
5. В одной транзакции:
   - `INSERT memberships (project_id, user_id=currentUser.id, role=invitation.role)`.
   - `UPDATE invitations SET status='accepted', accepted_by_user_id=currentUser.id,
     accepted_at=now()`.
6. Вернуть проект с `role`.

Связь с регистрацией/входом: `accept` — **всегда отдельный, последний шаг**, одинаковый для всех.
При `accountExists=false` фронт сначала регистрирует пользователя (`auth/01-register`, тело
обычное `{ email, password }`, токен приглашения туда не передаётся), при `true` — логинит
(`auth/02-login`); получив сессию, в обоих случаях вызывает этот эндпоинт с `token`. Register и
login про приглашения ничего не знают.

## Фронтенд: логика

- **Слой:** `features/members`; экран `pages/invite/AcceptInvitePage`.
- **API:** `membersApi.acceptInvitation(token)` → `httpClient.post('/invitations/'+token+'/accept')`.
- **Хук:** `useAcceptInvitation()` — `useMutation`; в `onSuccess`:
  - `qc.invalidateQueries(qk.projects)` (список проектов пополнился),
  - `setActiveProject(project.id)`, редирект в `/app`.
- **Состояния:** `403 EMAIL_MISMATCH` → «Войдите под почтой, на которую пришло приглашение»;
  `410` → «Ссылка истекла/отозвана».

## Edge cases

- Двойной accept (повторный клик) → идемпотентный `200` (пользователь уже участник).
- Принятие `admin`-приглашения делает пользователя со-владельцем (он попадает в список admin).
- Принимающий — сам владелец проекта (редкий случай самоприглашения) → `ALREADY_MEMBER`.
