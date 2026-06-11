# 01. Регистрация — `POST api/v1/auth/register`

Создаёт нового пользователя (новую «компанию/аккаунт») и сразу открывает сессию. Это вход в
систему «с нуля»: после регистрации пользователь идёт в онбординг и создаёт первый проект.

**Закрывает:** пункт ТЗ 1.

## Эндпоинт

| | |
|---|---|
| Метод | `POST` |
| URL | `api/v1/auth/register` |
| Авторизация | не требуется (публичный) |
| Заголовки | `Content-Type: application/json; charset=utf-8` |

## Тело запроса

```json
{
  "email": "kirill@acme.com",
  "password": "S3cretpass1"
}
```

| Поле | Тип | Обяз. | Правила |
|------|-----|:---:|--------|
| `email` | string | да | валидный email, ≤ 254 симв., приводится к нижнему регистру |
| `password` | string | да | ≥ 8 симв., минимум одна буква и одна цифра, ≤ 128 симв. |

> Правила пароля совпадают с фронтом (`shared/core` → `passwordRules`: min 8, буква + цифра).
> Верхняя граница 128 — защита от DoS длинным входом (лимита bcrypt в 72 байта нет, хэшируем argon2id).
> У аккаунта нет имени — только `email` и `password`.

**Регистрация по ссылке-приглашению.** Тело то же самое — `{ email, password }`, **ничего
дополнительного на регистрацию не отправляется**. Токен приглашения здесь не участвует:
сначала обычная регистрация (email из приглашения, подставлен в форму), затем отдельный вызов
`POST api/v1/invitations/{token}/accept` уже с полученной сессией (см. `invitations/02-accept`
и раздел «Стратегия приглашений» в README). Так register остаётся единым и простым для всех.

## Ответы

### 201 Created

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

Совпадает с `authResponseSchema` фронта (`{ user, accessToken }`).

### Ошибки

| HTTP | code | Причина |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | невалидный email/короткий пароль (`details[]` с полями) |
| 409 | `CONFLICT` (`EMAIL_TAKEN`) | email уже зарегистрирован |
| 429 | `RATE_LIMITED` | слишком много попыток с IP |

## Бэкенд: логика

1. Валидировать тело; нормализовать `email` (trim + lower / `citext`).
2. Проверить уникальность email. Занят → `409 EMAIL_TAKEN`. (Чтобы не давать перебор
   существующих почт — лимитировать частоту; сообщение нейтральное.)
3. Захэшировать пароль **argon2id**. Открытый пароль не логировать.
4. `INSERT users (id=uuidv7(), email, password_hash)`.
5. Создать сессию: сгенерировать секрет `accessToken` (≥256 бит), сохранить `INSERT sessions
   (user_id, token_hash=sha256(accessToken))`; вернуть **открытый** токен только в ответе.
6. Ответ `201` с `{ user, accessToken }`. Пароль/хэш наружу не отдавать.

Безопасность: rate-limit по IP и по email; одинаковое время ответа независимо от того, занят
email или нет (mitigation перебора); CAPTCHA — точка расширения.

## Фронтенд: логика

- **Слой:** `features/auth`. Экран `pages/auth/RegisterPage`.
- **API:** `features/auth/api/authApi.ts` → `register(payload)` → `httpClient.post('/auth/register', payload)`, ответ через `authResponseSchema.parse(...)`. (Базовый префикс `api/v1` — в `httpClient`/`env`, не в каждом вызове.)
- **Форма:** React Hook Form + Zod (`email`, `password`, `confirm`); тексты — `texts.auth.*`.
- **Хук:** `useRegister()` (`features/auth/model/useAuth.ts`) — `useMutation`, в `onSuccess` →
  `sessionStore.setSession(accessToken, user)` (он же зовёт `setAuthToken` для httpClient).
- **После успеха:** редирект в онбординг (`/onboarding`) — создать первый проект (`projects/01-create`).
- **Состояния:** loading (кнопка disabled), ошибка `409` → показать «email занят» под полем,
  `400` → разложить `details[]` по полям формы.

## Edge cases

- Регистрация по приглашению: email берётся из приглашения и в форме read-only; после успеха
  фронт вызывает `accept` (см. `invitations/02-accept`), и только тогда появляется membership.
- Повторная отправка формы (двойной клик) — мутация в RHF блокирует submit + `Idempotency-Key`
  на бэке желателен.
