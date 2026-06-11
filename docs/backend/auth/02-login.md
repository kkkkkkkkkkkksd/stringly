# 02. Авторизация (вход) — `POST api/v1/auth/login`

Проверяет email+пароль и открывает сессию. Возвращает тот же конверт, что и регистрация.

**Закрывает:** пункт ТЗ 2.

## Эндпоинт

| | |
|---|---|
| Метод | `POST` |
| URL | `api/v1/auth/login` |
| Авторизация | не требуется (публичный) |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Тело запроса

```json
{
  "email": "kirill@acme.com",
  "password": "S3cret!pass"
}
```

| Поле | Тип | Обяз. | Правила |
|------|-----|:---:|--------|
| `email` | string | да | валидный email, нормализуется к нижнему регистру |
| `password` | string | да | непустой |

## Ответы

### 200 OK

```json
{
  "user": {
    "id": "usr_018f3c8e-7a21-7b3c-9f10-2c4d5e6f7a8b",
    "email": "kirill@acme.com",
    "createdAt": "2026-06-11T09:00:00Z"
  },
  "accessToken": "stl_sess_9f8a7b6c5d4e3f2a1b0c..."
}
```

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | пустые/невалидные поля |
| 401 | `UNAUTHENTICATED` (`INVALID_CREDENTIALS`) | неверный email или пароль (**единое** сообщение, не уточняем что именно) |
| 403 | `FORBIDDEN` (`ACCOUNT_DISABLED`) | аккаунт заблокирован (future) |
| 429 | `RATE_LIMITED` | перебор |

## Бэкенд: логика

1. Валидировать и нормализовать email.
2. Найти пользователя по email. Не найден → выполнить «фиктивную» проверку хэша (constant-time,
   защита от timing-перебора) и вернуть `401 INVALID_CREDENTIALS`.
3. Сверить пароль с `password_hash` (argon2id verify). Не совпал → `401 INVALID_CREDENTIALS`.
4. Создать сессию: `accessToken` (≥256 бит) → `INSERT sessions (user_id, token_hash)`.
5. Вернуть `200 { user, accessToken }`.

Безопасность: rate-limit по email+IP с экспоненциальной задержкой/локаутом; одинаковый ответ и
тайминг для «нет пользователя» и «неверный пароль»; вход не логирует пароль.

## Фронтенд: логика

- **Слой:** `features/auth`; экран `pages/auth/LoginPage`.
- **API:** `authApi.login(payload)` → `httpClient.post('/auth/login', ...)` → `authResponseSchema.parse`.
- **Хук:** `useLogin()` (`useMutation`); `onSuccess` → `sessionStore.setSession(token, user)`.
- **После успеха:** если есть `?redirect=` (например пришёл по приглашению) — туда; иначе в
  `/app` (или `/onboarding`, если у пользователя ещё нет проектов — определяется списком из `projects/02-list`).
- **Состояния:** `401` → общая ошибка «Неверный email или пароль» (текст из `texts.auth`),
  loading на кнопке.

## Edge cases

- Уже авторизован (есть токен) и открывает `/login` → роут-гард перекидывает в `/app`.
- Вход в рамках приёма приглашения → после входа продолжить `accept` (`invitations/02-accept`).
