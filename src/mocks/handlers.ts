import { http, HttpResponse } from 'msw';
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
];
