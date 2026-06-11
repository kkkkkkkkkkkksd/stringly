import { http, HttpResponse, delay } from 'msw';
import { env } from '@/shared/config/env';
import { slugify, pluralCategories } from '@/shared/core';

// Мок-сеть вместо бэка (docs/07). In-memory: данные живут до перезагрузки страницы.
// Реализует контракт: auth (бессрочный токен) + projects.
const base = env.apiBaseUrl;

type MockUser = { id: string; email: string; password: string; name?: string; createdAt: string };
type MockProject = { id: string; ownerId: string; name: string; slug: string; createdAt: string };

const db = {
  users: [] as MockUser[],
  projects: [] as MockProject[],
  tokens: new Map<string, string>(), // token -> userId
};

const publicUser = (u: MockUser) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });
const issueToken = (userId: string) => {
  const token = `stl_sess_${crypto.randomUUID()}`;
  db.tokens.set(token, userId);
  return token;
};
const userFromAuth = (request: Request): MockUser | null => {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.replace(/^Bearer\s+/, '');
  const userId = db.tokens.get(token);
  return db.users.find((u) => u.id === userId) ?? null;
};

// ─── Локализационные данные (языки / разделы / ключи) ────────────────────────────────
// Данные засеваются ЛЕНИВО на любой pid при первом обращении — чтобы демо работало для
// проекта, созданного в онбординге (с произвольным id). Реализует контракт docs/07.
type MockLang = { id: string; code: string; name: string; isBase: boolean; rtl: boolean };
type MockNs = { id: string; name: string; type: 'strings' | 'plurals'; order: number };
type MockKey = { id: string; code: string; comment?: string; blank?: boolean };
// Сохранённое значение ячейки (после PATCH): value для strings, plural-формы для plurals.
type MockCellOverride = { value?: string; plural?: Record<string, string> };

const i18n = {
  langs: new Map<string, MockLang[]>(), // pid -> языки
  ns: new Map<string, MockNs[]>(), // pid -> разделы
  keys: new Map<string, MockKey[]>(), // nsid -> ключи
  values: new Map<string, Record<string, MockCellOverride>>(), // keyId -> { langCode -> override }
};

const SEED_LANGS: Omit<MockLang, 'id'>[] = [
  { code: 'en', name: 'English', isBase: true, rtl: false },
  { code: 'ru', name: 'Русский', isBase: false, rtl: false },
  { code: 'ar', name: 'العربية', isBase: false, rtl: true },
  { code: 'cs', name: 'Čeština', isBase: false, rtl: false },
  { code: 'da', name: 'Dansk', isBase: false, rtl: false },
  { code: 'nl', name: 'Nederlands', isBase: false, rtl: false },
  { code: 'fi', name: 'Suomi', isBase: false, rtl: false },
  { code: 'fr', name: 'Français', isBase: false, rtl: false },
  { code: 'de', name: 'Deutsch', isBase: false, rtl: false },
  { code: 'hu', name: 'Magyar', isBase: false, rtl: false },
];

const SEED_NS: { name: string; type: 'strings' | 'plurals' }[] = [
  { name: 'strings', type: 'strings' },
  { name: 'plurals', type: 'plurals' },
  { name: 'login_strings', type: 'strings' },
  { name: 'region_strings', type: 'strings' },
  { name: 'widget_strings', type: 'strings' },
  { name: 'profile_strings', type: 'strings' },
  { name: 'esim_strings', type: 'strings' },
  { name: 'installation_strings', type: 'strings' },
  { name: 'loyalty_program', type: 'strings' },
  { name: 'rate_app', type: 'strings' },
];

// Простые синтетические ключи: string_1, string_2, … (без настоящих слов).
function genKeys(count: number): MockKey[] {
  const out: MockKey[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ id: crypto.randomUUID(), code: `string_${i + 1}` });
  }
  return out;
}

function seedI18n(pid: string): void {
  if (i18n.langs.has(pid)) return;
  i18n.langs.set(
    pid,
    SEED_LANGS.map((l) => ({ id: crypto.randomUUID(), ...l })),
  );
  const nss: MockNs[] = SEED_NS.map((n, order) => ({ id: crypto.randomUUID(), ...n, order }));
  i18n.ns.set(pid, nss);
  for (const ns of nss) {
    // Разное количество ключей в каждом разделе (детерминированно, 60…~300).
    const count = 60 + ((ns.order * 73) % 240);
    i18n.keys.set(ns.id, genKeys(count));
  }
}

// Значение ключа на языке: одно слово «string»; для неосновных языков — «string(<code>)».
// ~1 из 5 ячеек пуста (детерминированно) — чтобы пустые были видны, в т.ч. в первых строках.
function valueFor(lang: MockLang, keyIndex: number, langIndex: number): string {
  if ((keyIndex + langIndex) % 5 === 0 && !lang.isBase) return '';
  return lang.isBase ? 'string' : `string(${lang.code})`;
}

export const handlers = [
  http.get(`${base}/health`, () =>
    HttpResponse.json({ status: 'ok', mode: env.apiMode, ts: Date.now() }),
  ),

  http.post(`${base}/auth/register`, async ({ request }) => {
    const { email, password, name } = (await request.json()) as {
      email: string;
      password: string;
      name?: string;
    };
    if (db.users.some((u) => u.email === email)) {
      return HttpResponse.json({ message: 'Этот email уже зарегистрирован' }, { status: 409 });
    }
    const user: MockUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return HttpResponse.json({ user: publicUser(user), accessToken: issueToken(user.id) });
  }),

  http.post(`${base}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return HttpResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
    }
    return HttpResponse.json({ user: publicUser(user), accessToken: issueToken(user.id) });
  }),

  http.get(`${base}/auth/me`, ({ request }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    return HttpResponse.json({ user: publicUser(user) });
  }),

  http.get(`${base}/projects`, ({ request }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const list = db.projects
      .filter((p) => p.ownerId === user.id)
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug, role: 'admin', createdAt: p.createdAt }));
    return HttpResponse.json(list);
  }),

  http.post(`${base}/projects`, async ({ request }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const { name } = (await request.json()) as { name: string };
    const project: MockProject = {
      id: crypto.randomUUID(),
      ownerId: user.id,
      name,
      slug: slugify(name),
      createdAt: new Date().toISOString(),
    };
    db.projects.push(project);
    return HttpResponse.json({
      id: project.id,
      name: project.name,
      slug: project.slug,
      role: 'admin',
      createdAt: project.createdAt,
    });
  }),

  // ─── Языки проекта (централизованный список → колонки таблицы) ──────────────────────
  http.get(`${base}/projects/:pid/languages`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    seedI18n(pid);
    return HttpResponse.json(i18n.langs.get(pid) ?? []);
  }),

  http.post(`${base}/projects/:pid/languages`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    seedI18n(pid);
    const { code } = (await request.json()) as { code: string };
    const lang: MockLang = { id: crypto.randomUUID(), code, name: code, isBase: false, rtl: false };
    i18n.langs.get(pid)!.push(lang);
    return HttpResponse.json(lang);
  }),

  http.delete(`${base}/projects/:pid/languages/:lid`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const lid = params.lid as string;
    seedI18n(pid);
    const list = i18n.langs.get(pid) ?? [];
    const lang = list.find((l) => l.id === lid);
    if (lang?.isBase) {
      return HttpResponse.json({ message: 'Нельзя удалить базовый язык' }, { status: 409 });
    }
    i18n.langs.set(pid, list.filter((l) => l.id !== lid));
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Разделы (namespaces) ───────────────────────────────────────────────────────────
  http.get(`${base}/projects/:pid/namespaces`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    seedI18n(pid);
    return HttpResponse.json(i18n.ns.get(pid) ?? []);
  }),

  http.post(`${base}/projects/:pid/namespaces`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    seedI18n(pid);
    const { name, type } = (await request.json()) as { name: string; type: 'strings' | 'plurals' };
    const list = i18n.ns.get(pid)!;
    const ns: MockNs = { id: crypto.randomUUID(), name, type, order: list.length };
    list.push(ns);
    i18n.keys.set(ns.id, []); // новый раздел пуст → таблица покажет пустое состояние
    return HttpResponse.json(ns);
  }),

  // ─── Строки таблицы (серверная пагинация) ───────────────────────────────────────────
  http.get(`${base}/projects/:pid/namespaces/:nsid/rows`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    await delay(150); // имитация сети → видно skeleton

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');

    const langs = i18n.langs.get(pid) ?? [];
    const keys = i18n.keys.get(nsid) ?? [];
    const isPlural = (i18n.ns.get(pid) ?? []).find((n) => n.id === nsid)?.type === 'plurals';
    const start = (page - 1) * pageSize;
    const slice = keys.slice(start, start + pageSize);

    type OutCell = { value: string; status: string; plural?: Record<string, string> };

    const rows = slice.map((k, idx) => {
      const keyIndex = start + idx;
      const overrides = i18n.values.get(k.id) ?? {};
      const values: Record<string, OutCell> = {};
      langs.forEach((lang, langIndex) => {
        const ov = overrides[lang.code];
        if (ov) {
          // сохранённое значение (после PATCH)
          if (ov.plural) {
            const v = ov.plural.other ?? ov.plural.one ?? '';
            values[lang.code] = { value: v, status: v ? 'reviewed' : 'empty', plural: ov.plural };
          } else {
            const v = ov.value ?? '';
            values[lang.code] = { value: v, status: v ? 'reviewed' : 'empty' };
          }
        } else if (k.blank) {
          // новый ключ — пустой, заполняется пользователем
          values[lang.code] = { value: '', status: 'empty' };
        } else if (isPlural) {
          if ((keyIndex + langIndex) % 5 === 0 && !lang.isBase) {
            values[lang.code] = { value: '', status: 'empty' };
          } else {
            const forms: Record<string, string> = {};
            const prefix = lang.isBase ? 'string' : `string(${lang.code})`;
            pluralCategories(lang.code).forEach((c) => (forms[c] = `${prefix} [${c}]`));
            values[lang.code] = { value: forms.other ?? '', status: 'reviewed', plural: forms };
          }
        } else {
          const value = valueFor(lang, keyIndex, langIndex);
          values[lang.code] = { value, status: value ? 'reviewed' : 'empty' };
        }
      });
      return { keyId: k.id, code: k.code, comment: k.comment, values };
    });

    return HttpResponse.json({ rows, page, pageSize, total: keys.length });
  }),

  // Добавление ключа в раздел (новый ключ — пустой).
  http.post(`${base}/projects/:pid/namespaces/:nsid/keys`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    const { code, comment } = (await request.json()) as { code: string; comment?: string };
    const key: MockKey = { id: crypto.randomUUID(), code, comment, blank: true };
    (i18n.keys.get(nsid) ?? []).push(key);
    return HttpResponse.json({ id: key.id, code: key.code, comment: key.comment });
  }),

  // Переименование ключа / изменение комментария.
  http.patch(`${base}/projects/:pid/keys/:keyId`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const keyId = params.keyId as string;
    const { code, comment } = (await request.json()) as { code?: string; comment?: string };
    for (const arr of i18n.keys.values()) {
      const k = arr.find((x) => x.id === keyId);
      if (k) {
        if (code !== undefined) k.code = code;
        if (comment !== undefined) k.comment = comment || undefined;
        return HttpResponse.json({ id: k.id, code: k.code, comment: k.comment });
      }
    }
    return HttpResponse.json({ message: 'Ключ не найден' }, { status: 404 });
  }),

  // Полное удаление ключа.
  http.delete(`${base}/projects/:pid/keys/:keyId`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const keyId = params.keyId as string;
    for (const arr of i18n.keys.values()) {
      const idx = arr.findIndex((x) => x.id === keyId);
      if (idx >= 0) {
        arr.splice(idx, 1);
        i18n.values.delete(keyId);
        break;
      }
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Батч-сохранение изменённых ячеек.
  http.patch(`${base}/projects/:pid/translations`, async ({ request }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const { changes } = (await request.json()) as {
      changes: { keyId: string; langCode: string; value?: string; plural?: Record<string, string> }[];
    };
    for (const c of changes) {
      const cur = i18n.values.get(c.keyId) ?? {};
      cur[c.langCode] = c.plural ? { plural: c.plural } : { value: c.value ?? '' };
      i18n.values.set(c.keyId, cur);
    }
    await delay(120);
    return HttpResponse.json({ updated: changes.length });
  }),
];
