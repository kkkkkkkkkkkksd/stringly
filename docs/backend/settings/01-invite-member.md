# 06. Создать приглашение — `POST api/v1/projects/{projectId}/invitations`

Админ приглашает участника в проект по email с заданной ролью. Бэк создаёт приглашение и
возвращает **готовую ссылку**. В MVP письмо не отправляется — админ копирует ссылку и
передаёт вручную (самый простой способ без платной почты).

**Закрывает:** пункты ТЗ 3 (приглашение + роль) и 5 (ссылка вручную).

## Эндпоинт

| | |
|---|---|
| Метод | `POST` |
| URL | `api/v1/projects/{projectId}/invitations` |
| Авторизация | обязательна — `Bearer`; роль `admin` в проекте |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Path-параметры

| Параметр | Пример | Описание |
|----------|--------|----------|
| `projectId` | `prj_018f...aaa` | проект, куда приглашаем |

## Тело запроса

```json
{
  "email": "translator@globex.com",
  "role": "translator"
}
```

| Поле | Тип | Обяз. | Правила |
|------|-----|:---:|--------|
| `email` | string | да | валидный email, нормализуется к нижнему регистру |
| `role` | enum | да | `admin` \| `translator` \| `viewer` |

## Ответы

### 201 Created

```json
{
  "id": "inv_018f...ccc",
  "projectId": "prj_018f...aaa",
  "email": "translator@globex.com",
  "role": "translator",
  "status": "pending",
  "inviteUrl": "https://app.stringly.dev/invite/4f3a...c9d1",
  "accountExists": true,
  "expiresAt": "2026-06-18T09:10:00Z",
  "createdAt": "2026-06-11T09:10:00Z"
}
```

- `inviteUrl` — ссылка с **секретом-токеном** (не `inv_`-id). Её админ копирует и отправляет.
- `accountExists` — есть ли уже аккаунт на этот email (для подсказки в UI: «зарегистрируется» / «войдёт»).

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | невалидный email/роль |
| 401 | `UNAUTHENTICATED` | нет токена |
| 403 | `FORBIDDEN` | текущий пользователь не `admin` проекта |
| 404 | `NOT_FOUND` | проект не существует или нет доступа |
| 409 | `CONFLICT` (`ALREADY_MEMBER`) | этот email уже участник проекта |
| 409 | `CONFLICT` (`INVITE_PENDING`) | по этому email уже есть активное приглашение |

## Бэкенд: логика

1. Аутентификация → `currentUser`; проверить `membership.role = 'admin'` в `projectId`,
   иначе `403`/`404`.
2. Нормализовать email. Если email уже в `memberships` проекта → `409 ALREADY_MEMBER`.
3. Если есть `pending`-приглашение на (project, email) → `409 INVITE_PENDING` (или политика
   «переотправить»: вернуть существующее с новой ссылкой — на выбор; по умолчанию конфликт).
4. Сгенерировать секрет `rawToken` (≥256 бит, URL-safe). Сохранить:
   `INSERT invitations (id=uuidv7(), project_id, email, role, token_hash=sha256(rawToken),
   status='pending', invited_by_user_id=currentUser.id, expires_at=now()+7d)`.
5. Вычислить `accountExists = EXISTS(users WHERE email=...)`.
6. Сформировать `inviteUrl = {APP_BASE_URL}/invite/{rawToken}` (rawToken только здесь).
7. Если `MAIL_ENABLED` — отправить письмо через сервис `mailer` (иначе пропустить; контракт
   не меняется). Вернуть `201`.

Безопасность: `rawToken` показывается один раз; в БД — только хэш. Ограничить число активных
приглашений на проект (anti-spam). Роль `admin` в приглашении разрешена (со-владельцы).

## Фронтенд: логика

- **Слой:** новая фича `features/members`; UI — вкладка «Участники» в `pages/app/SettingsPage`.
- **Сущность:** `entities/invitation` (Zod `invitationSchema`).
- **API:** `membersApi.createInvitation(projectId, { email, role })` → `httpClient.post(...)`.
- **Хук:** `useCreateInvitation(projectId)` — `useMutation`; в `onSuccess` инвалидировать
  `qk.invitations(pid)` и `qk.members(pid)` (для списка ожидающих).
- **qk:** добавить `invitations: (pid) => ['projects', pid, 'invitations']`.
- **UX «ссылка вручную»:** после ответа показать модал с `inviteUrl` и кнопкой «Скопировать»
  (`texts.common.actions.copy`); подпись зависит от `accountExists`.
- **Права:** кнопка «Добавить участника» под `<Can perm="members:manage">`.
- **Состояния:** loading, `409 ALREADY_MEMBER` → «уже участник», `409 INVITE_PENDING` →
  предложить скопировать существующую ссылку/переотправить.

## Edge cases

- Приглашение `admin`-роли = добавить со-владельца (разрешено только admin).
- Истёкшие приглашения чистит фоновый джоб (`status='expired'`), либо вычисляется на лету.
