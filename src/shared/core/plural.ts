// CORE: CLDR-категории множественного числа для языка (one/few/many/other…).
// Чистый хелпер на базе Intl.PluralRules. Используется plural-редактором ячейки (Шаг 4).
const ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'] as const;

export function pluralCategories(langCode: string): string[] {
  let cats: string[];
  try {
    cats = new Intl.PluralRules(langCode).resolvedOptions().pluralCategories;
  } catch {
    cats = ['one', 'other'];
  }
  const set = new Set(cats.length ? cats : ['one', 'other']);
  set.add('other');
  return ORDER.filter((c) => set.has(c));
}
