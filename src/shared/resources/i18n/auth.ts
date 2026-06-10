// Тексты экрана входа/регистрации (включая сообщения валидации).
export const auth = {
  tabs: { login: 'Вход', register: 'Регистрация' },
  fields: { email: 'Email', password: 'Пароль', confirm: 'Повторите пароль' },
  placeholders: {
    email: 'you@company.com',
    password: '••••••••',
    passwordNew: 'Минимум 8 символов',
  },
  submit: {
    login: 'Войти',
    loginPending: 'Входим…',
    register: 'Создать аккаунт',
    registerPending: 'Создаём…',
  },
  errors: {
    email: 'Введите корректный email',
    passwordRequired: 'Введите пароль',
    passwordMin: 'Минимум 8 символов',
    passwordLetter: 'Нужна хотя бы одна буква',
    passwordDigit: 'Нужна хотя бы одна цифра',
    confirmMismatch: 'Пароли не совпадают',
  },
} as const;
