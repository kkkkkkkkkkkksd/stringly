import { describe, expect, it } from 'vitest';
import { qk } from './queryKeys';

// Пример теста — доказывает, что Vitest работает. Заодно фиксирует форму ключей кэша.
describe('qk factory', () => {
  it('строит ключи, привязанные к проекту (pid)', () => {
    expect(qk.languages('p1')).toEqual(['projects', 'p1', 'languages']);
    expect(qk.namespaces('p1')).toEqual(['projects', 'p1', 'namespaces']);
    expect(qk.me()).toEqual(['auth', 'me']);
  });
});
