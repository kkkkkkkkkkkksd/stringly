import { http, HttpResponse, delay } from 'msw';
import { env } from '@/shared/config/env';
import { slugify } from '@/shared/core';

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
type MockKey = { id: string; code: string };

const i18n = {
  langs: new Map<string, MockLang[]>(), // pid -> языки
  ns: new Map<string, MockNs[]>(), // pid -> разделы
  keys: new Map<string, MockKey[]>(), // nsid -> ключи
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
    const start = (page - 1) * pageSize;
    const slice = keys.slice(start, start + pageSize);

    const rows = slice.map((k, idx) => {
      const keyIndex = start + idx;
      const values: Record<string, { value: string; status: string }> = {};
      langs.forEach((lang, langIndex) => {
        const value = valueFor(lang, keyIndex, langIndex);
        values[lang.code] = { value, status: value ? 'reviewed' : 'empty' };
      });
      return { keyId: k.id, code: k.code, values };
    });

    return HttpResponse.json({ rows, page, pageSize, total: keys.length });
  }),
];
