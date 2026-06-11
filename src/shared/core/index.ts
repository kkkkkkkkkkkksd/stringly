// Баррель CORE — чистые переиспользуемые хелперы и правила (без сайд-эффектов).
// Импортируй из '@/shared/core'. Сюда выносим валидаторы, форматтеры, утилиты.
export { passwordRules, isNonEmpty, isValidEmail } from './validation';
export { slugify, formatDate } from './format';
export { pluralCategories } from './plural';
export { LOCALE_OPTIONS } from './locales';
export type { LocaleOption } from './locales';
export { can } from './permissions';
export type { Role, Permission } from './permissions';
