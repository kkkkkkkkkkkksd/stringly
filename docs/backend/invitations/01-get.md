# 07. Просмотр приглашения по токену — `GET api/v1/invitations/{token}`

Открывает данные приглашения по секрету из ссылки. Доступно **без авторизации**, чтобы
приглашённый (возможно ещё не зарегистрированный) увидел, куда его зовут, до входа/регистрации.

**Закрывает:** пункт ТЗ 6 (пользователь может быть ещё не зарегистрирован).

## Эндпоинт

| | |
|---|---|
| Метод | `GET` |
| URL | `api/v1/invitations/{token}` |
| Авторизация | не требуется (публичный, но `token` — секрет) |

## Path-параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `token` | `4f3a...c9d1` | секрет из `inviteUrl` (не `inv_`-id) |

## Ответы

### 200 OK

```json
{
  "status": "pending",
  "email": "translator@globex.com",
  "role": "translator",
  "accountExists": true,
  "project": { "id": "prj_018f...aaa", "name": "Acme Mobile App" },
  "invitedBy": "kirill@acme.com",
  "expiresAt": "2026-06-18T09:10:00Z"
}
```

`accountExists` подсказывает фронту, что показать: форму входа (true) или регистрации (false).

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 404 | `NOT_FOUND` | токен не найден (неверный/подделка) |
| 410 | `GONE` (`EXPIRED` \| `REVOKED` \| `ACCEPTED`) | приглашение больше не активно |

## Бэкенд: логика

1. `sha256(token)` → найти `invitations` по `token_hash`. Не найдено → `404`.
2. Если `status != 'pending'` или `expires_at < now()` → `410` с уточняющим code
   (`expired`/`revoked`/`accepted`).
3. Подтянуть проект (`name`) и email пригласившего. Вернуть безопасный набор полей
   (без `token_hash`, без внутренних id сессий).
4. `accountExists = EXISTS(users WHERE email = invitation.email)`.

Безопасность: не раскрывать существование приглашений по перебору — отвечать `404` на любой
неподходящий токен; rate-limit по IP. Отдаём минимум персональных данных.

## Фронтенд: логика

- **Слой:** `features/members`; экран `pages/invite/AcceptInvitePage` (новый, публичный роут
  `/invite/:token`).
- **API:** `membersApi.getInvitation(token)` → `httpClient.get('/invitations/'+token)` → `parse`.
- **Хук:** `useInvitation(token)` — `useQuery({ queryKey: qk.invitation(token), ... })`
  (новый ключ `invitation: (token) => ['invitation', token]`; не привязан к pid — публичный).
- **Логика ветвления:**
  - `accountExists=false` → показать кнопку «Зарегистрироваться» (email префилл, read-only) →
    после регистрации вызвать accept (`invitations/02-accept`).
  - `accountExists=true` и не залогинен → «Войти» → после входа accept.
  - залогинен → сразу показать «Принять приглашение».
- **Состояния:** loading, `404`/`410` → экран «Ссылка недействительна/истекла».

## Edge cases

- Залогинен под другим email, чем в приглашении → предупредить (accept вернёт `403 EMAIL_MISMATCH`,
  см. `invitations/02-accept`); предложить выйти и войти под нужным email.
