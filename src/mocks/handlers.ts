import { http, HttpResponse, delay } from 'msw';
import { env } from '@/shared/config/env';
import { slugify, pluralCategories, LOCALE_OPTIONS } from '@/shared/core';

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
// ai=true — значение сгенерировано AI и ещё не правлено человеком (метка ✨AI).
type MockCellOverride = { value?: string; plural?: Record<string, string>; ai?: boolean };

// Мок AI: реальной генерации нет — пишем одну фразу. Реализация заменится позже.
const AI_PHRASE = 'Генерация AI';

const i18n = {
  langs: new Map<string, MockLang[]>(), // pid -> языки
  ns: new Map<string, MockNs[]>(), // pid -> разделы
  keys: new Map<string, MockKey[]>(), // nsid -> ключи
  values: new Map<string, Record<string, MockCellOverride>>(), // keyId -> { langCode -> override }
};

// Базовый язык, выбранный при создании проекта (онбординг). По умолчанию 'en'
// (если в онбординге не задан). Применяется при ленивом сиде языков ниже.
const projectBaseLang = new Map<string, string>();

// Наполнять ли проект демо-данными (разделы/ключи + набор языков) или создать пустым —
// «как настоящий новый проект» (только базовый язык, без разделов). Выбор из онбординга.
// По умолчанию true: проекты, открытые без явного создания через онбординг (нет в карте),
// получают демо-сид, как было раньше.
const projectSeedDemo = new Map<string, boolean>();

// ─── Участники проекта (Membership) ───────────────────────────────────────────────────
// Засеваются лениво: владелец (текущий пользователь) = admin + пара демо-участников,
// чтобы был виден список ролей и read-only для не-admin. Приглашение новых — заглушка (v2).
type MockMember = {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role: 'admin' | 'translator' | 'viewer';
  createdAt: string;
};
const membersByPid = new Map<string, MockMember[]>();

function seedMembers(pid: string, owner: MockUser): void {
  if (membersByPid.has(pid)) return;
  const now = Date.now();
  membersByPid.set(pid, [
    {
      id: crypto.randomUUID(),
      userId: owner.id,
      email: owner.email,
      name: owner.name,
      role: 'admin',
      createdAt: new Date(now).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      email: 'anna.translator@stringly.dev',
      name: 'Anna',
      role: 'translator',
      createdAt: new Date(now - 2 * 86400_000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      email: 'viewer@stringly.dev',
      role: 'viewer',
      createdAt: new Date(now - 5 * 86400_000).toISOString(),
    },
  ]);
}

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
  // Базовый язык: выбранный в онбординге или 'en' по умолчанию.
  const baseCode = projectBaseLang.get(pid) ?? 'en';
  const demo = projectSeedDemo.get(pid) ?? true;
  const baseMeta = LOCALE_OPTIONS.find((o) => o.code === baseCode);
  const baseLang = (): MockLang => ({
    id: crypto.randomUUID(),
    code: baseCode,
    name: baseMeta?.name ?? baseCode,
    isBase: true,
    rtl: baseMeta?.rtl ?? false,
  });

  // Пустой проект (симуляция реального нового): только базовый язык, без разделов/ключей.
  if (!demo) {
    i18n.langs.set(pid, [baseLang()]);
    i18n.ns.set(pid, []);
    return;
  }

  // Демо-проект: набор языков (выбранный — базовый) + разделы + синтетические ключи.
  const seeded: MockLang[] = SEED_LANGS.map((l) => ({
    id: crypto.randomUUID(),
    ...l,
    isBase: l.code === baseCode,
  }));
  // Если выбранного базового нет в демо-наборе — добавим его отдельной колонкой и сделаем базовым.
  if (!seeded.some((l) => l.code === baseCode)) seeded.unshift(baseLang());
  i18n.langs.set(pid, seeded);
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

// Заполнена ли ячейка (key × lang) — единая логика для прогресса (stats) и AI-дозаполнения.
function cellFilled(
  key: MockKey,
  keyIndex: number,
  lang: MockLang,
  langIndex: number,
  isPlural: boolean,
): boolean {
  const ov = (i18n.values.get(key.id) ?? {})[lang.code];
  if (ov) return !!(ov.plural ? (ov.plural.other ?? ov.plural.one ?? '') : (ov.value ?? '')).trim();
  if (key.blank) return false;
  if (isPlural) return lang.isBase || (keyIndex + langIndex) % 5 !== 0;
  return valueFor(lang, keyIndex, langIndex).trim() !== '';
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

  // Смена email: проверяем занятость другим аккаунтом.
  http.patch(`${base}/auth/email`, async ({ request }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const { email } = (await request.json()) as { email: string };
    if (db.users.some((u) => u.email === email && u.id !== user.id)) {
      return HttpResponse.json({ message: 'Этот email уже занят' }, { status: 409 });
    }
    user.email = email;
    return HttpResponse.json({ user: publicUser(user) });
  }),

  // Смена пароля: сверяем текущий пароль.
  http.patch(`${base}/auth/password`, async ({ request }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
    };
    if (user.password !== currentPassword) {
      return HttpResponse.json({ message: 'Неверный текущий пароль' }, { status: 400 });
    }
    user.password = newPassword;
    return new HttpResponse(null, { status: 204 });
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
    const { name, baseLanguageCode, seedDemo } = (await request.json()) as {
      name: string;
      baseLanguageCode?: string;
      seedDemo?: boolean;
    };
    const project: MockProject = {
      id: crypto.randomUUID(),
      ownerId: user.id,
      name,
      slug: slugify(name),
      createdAt: new Date().toISOString(),
    };
    db.projects.push(project);
    // Запоминаем базовый язык и режим наполнения для ленивого сида.
    projectBaseLang.set(project.id, baseLanguageCode || 'en');
    projectSeedDemo.set(project.id, seedDemo ?? false);
    return HttpResponse.json({
      id: project.id,
      name: project.name,
      slug: project.slug,
      role: 'admin',
      createdAt: project.createdAt,
    });
  }),

  // Переименование проекта (admin). Обновляем имя и slug.
  http.patch(`${base}/projects/:pid`, async ({ request, params }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const project = db.projects.find((p) => p.id === pid && p.ownerId === user.id);
    if (!project) return HttpResponse.json({ message: 'Проект не найден' }, { status: 404 });
    const { name } = (await request.json()) as { name: string };
    project.name = name;
    project.slug = slugify(name);
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
    const { code, ai } = (await request.json()) as { code: string; ai?: boolean };
    // Имя/RTL берём из справочника локалей (как сделал бы бэк), а не «code = name».
    const meta = LOCALE_OPTIONS.find((o) => o.code === code);
    const lang: MockLang = {
      id: crypto.randomUUID(),
      code,
      name: meta?.name ?? code,
      isBase: false,
      rtl: meta?.rtl ?? false,
    };
    i18n.langs.get(pid)!.push(lang);

    // Новый язык — пустой по определению. Если попросили AI — переводим все ключи во всех
    // разделах мок-фразой (реальной генерации нет).
    if (ai) {
      for (const ns of i18n.ns.get(pid) ?? []) {
        for (const k of i18n.keys.get(ns.id) ?? []) {
          const cur = i18n.values.get(k.id) ?? {};
          cur[code] = { value: AI_PHRASE, ai: true };
          i18n.values.set(k.id, cur);
        }
      }
    }

    return HttpResponse.json(lang);
  }),

  // Смена базового языка: снимаем isBase со всех, ставим на выбранный (ровно один базовый).
  http.patch(`${base}/projects/:pid/languages/:lid`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const lid = params.lid as string;
    seedI18n(pid);
    const { isBase } = (await request.json()) as { isBase?: boolean };
    const list = i18n.langs.get(pid) ?? [];
    const target = list.find((l) => l.id === lid);
    if (!target) return HttpResponse.json({ message: 'Язык не найден' }, { status: 404 });
    if (isBase) list.forEach((l) => (l.isBase = l.id === lid));
    return HttpResponse.json(target);
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

  // ─── Участники проекта (роли) ───────────────────────────────────────────────────────
  http.get(`${base}/projects/:pid/members`, ({ request, params }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    seedMembers(pid, user);
    const list = (membersByPid.get(pid) ?? []).map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.email,
      name: m.name,
      role: m.role,
      isYou: m.userId === user.id,
      createdAt: m.createdAt,
    }));
    return HttpResponse.json(list);
  }),

  http.patch(`${base}/projects/:pid/members/:mid`, async ({ request, params }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const mid = params.mid as string;
    seedMembers(pid, user);
    const { role } = (await request.json()) as { role: 'admin' | 'translator' | 'viewer' };
    const m = (membersByPid.get(pid) ?? []).find((x) => x.id === mid);
    if (!m) return HttpResponse.json({ message: 'Участник не найден' }, { status: 404 });
    m.role = role;
    return HttpResponse.json({ ...m, isYou: m.userId === user.id });
  }),

  http.delete(`${base}/projects/:pid/members/:mid`, ({ request, params }) => {
    const user = userFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const mid = params.mid as string;
    seedMembers(pid, user);
    const list = membersByPid.get(pid) ?? [];
    membersByPid.set(pid, list.filter((m) => m.id !== mid));
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

  // Удаление раздела: вместе с разделом убираем его ключи и сохранённые значения.
  http.delete(`${base}/projects/:pid/namespaces/:nsid`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    const list = i18n.ns.get(pid) ?? [];
    if (!list.some((n) => n.id === nsid)) {
      return HttpResponse.json({ message: 'Раздел не найден' }, { status: 404 });
    }
    for (const k of i18n.keys.get(nsid) ?? []) i18n.values.delete(k.id);
    i18n.keys.delete(nsid);
    i18n.ns.set(pid, list.filter((n) => n.id !== nsid));
    return new HttpResponse(null, { status: 204 });
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

    type OutCell = { value: string; status: string; plural?: Record<string, string>; ai?: boolean };

    const rows = slice.map((k, idx) => {
      const keyIndex = start + idx;
      const overrides = i18n.values.get(k.id) ?? {};
      const values: Record<string, OutCell> = {};
      langs.forEach((lang, langIndex) => {
        const ov = overrides[lang.code];
        if (ov) {
          // сохранённое значение (после PATCH / AI-заполнения)
          if (ov.plural) {
            const v = ov.plural.other ?? ov.plural.one ?? '';
            values[lang.code] = { value: v, status: v ? 'reviewed' : 'empty', plural: ov.plural, ai: !!ov.ai };
          } else {
            const v = ov.value ?? '';
            values[lang.code] = { value: v, status: v ? 'reviewed' : 'empty', ai: !!ov.ai };
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

  // ─── Прогресс заполнения по языкам в разделе (считается на сервере) ─────────────────
  // filled/total по каждому языку. Логика «заполнено?» зеркалит генерацию строк выше,
  // чтобы рейл прогресса совпадал с тем, что видно в таблице.
  http.get(`${base}/projects/:pid/namespaces/:nsid/stats`, ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    const langs = i18n.langs.get(pid) ?? [];
    const keys = i18n.keys.get(nsid) ?? [];
    const isPlural = (i18n.ns.get(pid) ?? []).find((n) => n.id === nsid)?.type === 'plurals';

    const stats = langs.map((lang, langIndex) => {
      let filled = 0;
      keys.forEach((k, keyIndex) => {
        if (cellFilled(k, keyIndex, lang, langIndex, isPlural)) filled += 1;
      });
      return { code: lang.code, name: lang.name, isBase: lang.isBase, rtl: lang.rtl, filled, total: keys.length };
    });

    return HttpResponse.json({ stats, total: keys.length });
  }),

  // AI-дозаполнение: заполняем ТОЛЬКО пустые ячейки указанного языка в разделе фразой-моком
  // (реальной генерации нет). Ручной текст не трогаем.
  http.post(`${base}/projects/:pid/namespaces/:nsid/ai-fill`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    const { langCode } = (await request.json()) as { langCode: string };
    const langs = i18n.langs.get(pid) ?? [];
    const langIndex = langs.findIndex((l) => l.code === langCode);
    const lang = langs[langIndex];
    if (!lang) return HttpResponse.json({ message: 'Язык не найден' }, { status: 404 });
    const keys = i18n.keys.get(nsid) ?? [];
    const isPlural = (i18n.ns.get(pid) ?? []).find((n) => n.id === nsid)?.type === 'plurals';
    let filled = 0;
    keys.forEach((k, keyIndex) => {
      if (!cellFilled(k, keyIndex, lang, langIndex, isPlural)) {
        const cur = i18n.values.get(k.id) ?? {};
        cur[langCode] = { value: AI_PHRASE, ai: true };
        i18n.values.set(k.id, cur);
        filled += 1;
      }
    });
    await delay(250);
    return HttpResponse.json({ filled });
  }),

  // Добавление ключа в раздел (новый ключ — пустой).
  http.post(`${base}/projects/:pid/namespaces/:nsid/keys`, async ({ request, params }) => {
    if (!userFromAuth(request)) return HttpResponse.json({ message: 'Не авторизован' }, { status: 401 });
    const pid = params.pid as string;
    const nsid = params.nsid as string;
    seedI18n(pid);
    const { code, comment, baseValue, ai } = (await request.json()) as {
      code: string;
      comment?: string;
      baseValue?: string;
      ai?: boolean;
    };
    const key: MockKey = { id: crypto.randomUUID(), code, comment, blank: true };
    (i18n.keys.get(nsid) ?? []).push(key);

    // Базовый перевод (если задан) + AI-доперевод остальных языков (мок-фраза).
    const langs = i18n.langs.get(pid) ?? [];
    const baseLang = langs.find((l) => l.isBase) ?? langs[0];
    const overrides: Record<string, MockCellOverride> = {};
    if (baseValue && baseLang) overrides[baseLang.code] = { value: baseValue };
    if (ai && baseLang) {
      for (const l of langs) if (!l.isBase) overrides[l.code] = { value: AI_PHRASE, ai: true };
    }
    if (Object.keys(overrides).length) i18n.values.set(key.id, overrides);

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
