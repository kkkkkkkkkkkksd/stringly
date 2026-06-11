// CORE: справочник ISO-локалей для выбора языка (чистые данные). RTL отмечен для ar/he/fa/ur.
export type LocaleOption = { code: string; name: string; rtl: boolean };

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'ru', name: 'Русский', rtl: false },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'he', name: 'עברית', rtl: true },
  { code: 'fa', name: 'فارسی', rtl: true },
  { code: 'cs', name: 'Čeština', rtl: false },
  { code: 'da', name: 'Dansk', rtl: false },
  { code: 'nl', name: 'Nederlands', rtl: false },
  { code: 'fi', name: 'Suomi', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'hu', name: 'Magyar', rtl: false },
  { code: 'it', name: 'Italiano', rtl: false },
  { code: 'es', name: 'Español', rtl: false },
  { code: 'pt-BR', name: 'Português (Brasil)', rtl: false },
  { code: 'pl', name: 'Polski', rtl: false },
  { code: 'tr', name: 'Türkçe', rtl: false },
  { code: 'uk', name: 'Українська', rtl: false },
  { code: 'ja', name: '日本語', rtl: false },
  { code: 'ko', name: '한국어', rtl: false },
  { code: 'zh-CN', name: '中文 (简体)', rtl: false },
];
