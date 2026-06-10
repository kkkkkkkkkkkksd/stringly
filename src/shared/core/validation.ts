// CORE: чистые правила валидации без побочных эффектов и без сообщений (тексты — в i18n).
// Переиспользуются в Zod-схемах форм и где угодно. Аналог Core-таргета в iOS.
export const passwordRules = {
  minLength: 8,
  letter: /[A-Za-z]/,
  digit: /[0-9]/,
} as const;

export const isNonEmpty = (value: string): boolean => value.trim().length > 0;

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
